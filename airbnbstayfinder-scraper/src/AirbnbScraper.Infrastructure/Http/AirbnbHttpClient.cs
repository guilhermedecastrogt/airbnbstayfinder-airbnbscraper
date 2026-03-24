using System.Text.Json;
using System.Text.RegularExpressions;
using AirbnbScraper.Application.Interfaces;
using AirbnbScraper.Domain.Entities;
using AirbnbScraper.Domain.Exceptions;
using AirbnbScraper.Domain.ValueObjects;
using AirbnbScraper.Infrastructure.Mapping;

namespace AirbnbScraper.Infrastructure.Http;

public sealed class AirbnbHttpClient : IAirbnbHttpClient
{
    private readonly CurlImpersonateClient _curl;
    private readonly ListingMapper _mapper;

    private static readonly Dictionary<string, string> BrowserHeadersDict = new()
    {
        ["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        ["Accept-Language"] = "en-US,en;q=0.9",
        ["Cache-Control"] = "no-cache",
        ["Pragma"] = "no-cache",
        ["Sec-Ch-Ua"] = "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
        ["Sec-Ch-Ua-Mobile"] = "?0",
        ["Sec-Ch-Ua-Platform"] = "\"Windows\"",
        ["Sec-Fetch-Dest"] = "document",
        ["Sec-Fetch-Mode"] = "navigate",
        ["Sec-Fetch-Site"] = "none",
        ["Sec-Fetch-User"] = "?1",
        ["Upgrade-Insecure-Requests"] = "1",
        ["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    private static readonly Dictionary<string, string> ApiHeadersDict = new()
    {
        ["Accept"] = "application/json",
        ["Accept-Language"] = "en",
        ["Content-Type"] = "application/json",
        ["Sec-Ch-Ua"] = "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
        ["Sec-Ch-Ua-Mobile"] = "?0",
        ["Sec-Ch-Ua-Platform"] = "\"Windows\"",
        ["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    private static readonly string[] TreatmentFlags =
    [
        "feed_map_decouple_m11_treatment",
        "stays_search_rehydration_treatment_desktop",
        "stays_search_rehydration_treatment_moweb",
        "selective_query_feed_map_homepage_desktop_treatment",
        "selective_query_feed_map_homepage_moweb_treatment"
    ];

    public AirbnbHttpClient(HttpClient httpClient)
    {
        _curl = new CurlImpersonateClient();
        _mapper = new ListingMapper();
    }

    public async Task<string> GetApiKeyAsync(string? proxyUrl = null, CancellationToken ct = default)
    {
        var response = await _curl.GetAsync("https://www.airbnb.com/", BrowserHeadersDict);
        response.EnsureSuccessStatusCode();

        var html = response.Body;
        // Use the same specific regex as pyairbnb-api: "api_config":{"key":"..."}
        var match = Regex.Match(html, @"""api_config"":\{""key"":""([^""]+)""");
        if (!match.Success)
        {
            // Fallback to broader pattern
            match = Regex.Match(html, @"""key""\s*:\s*""([^""]+)""");
        }
        if (!match.Success)
            throw new DataExtractionException("Could not extract API key from Airbnb homepage");

        return match.Groups[1].Value;
    }

    public async Task<string> FetchDynamicHashAsync(string? proxyUrl = null, CancellationToken ct = default)
    {
        // Stage 1: Fetch homepage to find asyncRequire bundle URL
        var homeResponse = await _curl.GetAsync("https://www.airbnb.com/", BrowserHeadersDict);
        homeResponse.EnsureSuccessStatusCode();
        var homeHtml = homeResponse.Body;

        var bundleMatch = Regex.Match(homeHtml,
            @"https://a0\.muscache\.com/airbnb/static/packages/web/[^/]+/frontend/airmetro/browser/asyncRequire\.[^""']+\.js");

        if (!bundleMatch.Success)
            throw new DataExtractionException("Could not find StaysSearch bundle URL. Home HTML length: " + homeHtml.Length);

        // Stage 2: Fetch bundle JS to find StaysSearchRoute module
        var bundleResponse = await _curl.GetAsync(bundleMatch.Value, BrowserHeadersDict);
        bundleResponse.EnsureSuccessStatusCode();
        var bundleJs = bundleResponse.Body;

        var moduleMatch = Regex.Match(bundleJs,
            @"common/frontend/stays-search/routes/StaysSearchRoute/StaysSearchRoute\.prepare\.[^""']+\.js");

        if (!moduleMatch.Success)
            throw new DataExtractionException("Could not find StaysSearchRoute module. Bundle JS length: " + bundleJs.Length);

        var moduleUrl = $"https://a0.muscache.com/airbnb/static/packages/web/{moduleMatch.Value}";

        // Stage 3: Fetch module JS to extract operationId hash
        var moduleResponse = await _curl.GetAsync(moduleUrl, BrowserHeadersDict);
        moduleResponse.EnsureSuccessStatusCode();
        var moduleJs = moduleResponse.Body;

        var hashMatch = Regex.Match(moduleJs, @"operationId:['""]([0-9a-f]{64})");

        if (!hashMatch.Success)
            throw new DataExtractionException("Could not extract StaysSearch operationId");

        return hashMatch.Groups[1].Value;
    }

    public async Task<IReadOnlyList<AirbnbListing>> SearchListingsAsync(
        string apiKey,
        string hash,
        SearchFilters filters,
        string? cursor = null,
        string? proxyUrl = null,
        CancellationToken ct = default)
    {
        var allListings = new List<AirbnbListing>();
        var currentCursor = cursor ?? "";

        do
        {
            var response = await FetchSearchPageAsync(apiKey, hash, filters, currentCursor);
            var listings = _mapper.MapSearchResponse(response);
            allListings.AddRange(listings);
            currentCursor = ExtractNextCursor(response);
        }
        while (!string.IsNullOrEmpty(currentCursor));

        return allListings;
    }

    private async Task<JsonDocument> FetchSearchPageAsync(
        string apiKey,
        string hash,
        SearchFilters filters,
        string cursor)
    {
        var url = $"https://www.airbnb.com/api/v3/StaysSearch/{hash}?operationName=StaysSearch&locale={filters.Language}&currency={filters.Currency}";

        var rawParams = BuildRawParams(filters);
        var body = BuildGraphQLBody(hash, cursor, rawParams);
        var bodyJson = JsonSerializer.Serialize(body);

        var headers = new Dictionary<string, string>(ApiHeadersDict)
        {
            ["X-Airbnb-Api-Key"] = apiKey
        };

        var response = await _curl.PostAsync(url, bodyJson, headers);

        if (!response.IsSuccessStatusCode)
            throw new AirbnbApiException(response.StatusCode, response.Body);

        return JsonDocument.Parse(response.Body);
    }

    private static List<Dictionary<string, object>> BuildRawParams(SearchFilters filters)
    {
        var rawParams = new List<Dictionary<string, object>>
        {
            new() { ["filterName"] = "cdnCacheSafe", ["filterValues"] = new[] { "false" } },
            new() { ["filterName"] = "channel", ["filterValues"] = new[] { "EXPLORE" } },
            new() { ["filterName"] = "datePickerType", ["filterValues"] = new[] { "calendar" } },
            new() { ["filterName"] = "flexibleTripLengths", ["filterValues"] = new[] { "one_week" } },
            new() { ["filterName"] = "itemsPerGrid", ["filterValues"] = new[] { "50" } },
            new() { ["filterName"] = "screenSize", ["filterValues"] = new[] { "large" } },
            new() { ["filterName"] = "refinementPaths", ["filterValues"] = new[] { "/homes" } },
            new() { ["filterName"] = "searchByMap", ["filterValues"] = new[] { "true" } },
            new() { ["filterName"] = "tabId", ["filterValues"] = new[] { "home_tab" } },
            new() { ["filterName"] = "version", ["filterValues"] = new[] { "1.8.3" } }
        };

        if (filters.NorthEastLat.HasValue)
            rawParams.Add(new() { ["filterName"] = "neLat", ["filterValues"] = new[] { filters.NorthEastLat.Value.ToString() } });

        if (filters.NorthEastLng.HasValue)
            rawParams.Add(new() { ["filterName"] = "neLng", ["filterValues"] = new[] { filters.NorthEastLng.Value.ToString() } });

        if (filters.SouthWestLat.HasValue)
            rawParams.Add(new() { ["filterName"] = "swLat", ["filterValues"] = new[] { filters.SouthWestLat.Value.ToString() } });

        if (filters.SouthWestLng.HasValue)
            rawParams.Add(new() { ["filterName"] = "swLng", ["filterValues"] = new[] { filters.SouthWestLng.Value.ToString() } });

        rawParams.Add(new() { ["filterName"] = "zoomLevel", ["filterValues"] = new[] { filters.ZoomLevel.ToString() } });

        if (!string.IsNullOrEmpty(filters.Query))
            rawParams.Add(new() { ["filterName"] = "query", ["filterValues"] = new[] { filters.Query } });

        if (!string.IsNullOrEmpty(filters.PlaceId))
            rawParams.Add(new() { ["filterName"] = "placeId", ["filterValues"] = new[] { filters.PlaceId } });

        if (!string.IsNullOrEmpty(filters.CheckIn))
            rawParams.Add(new() { ["filterName"] = "checkin", ["filterValues"] = new[] { filters.CheckIn } });

        if (!string.IsNullOrEmpty(filters.CheckOut))
            rawParams.Add(new() { ["filterName"] = "checkout", ["filterValues"] = new[] { filters.CheckOut } });

        if (!string.IsNullOrEmpty(filters.CheckIn) && !string.IsNullOrEmpty(filters.CheckOut))
        {
            if (DateTime.TryParse(filters.CheckIn, out var checkInDate) && DateTime.TryParse(filters.CheckOut, out var checkOutDate))
            {
                var nights = (checkOutDate - checkInDate).Days;
                if (nights > 0)
                    rawParams.Add(new() { ["filterName"] = "priceFilterNumNights", ["filterValues"] = new[] { nights.ToString() } });
            }
        }

        if (filters.PriceMin.HasValue && filters.PriceMin > 0)
            rawParams.Add(new() { ["filterName"] = "price_min", ["filterValues"] = new[] { filters.PriceMin.Value.ToString() } });

        if (filters.PriceMax.HasValue && filters.PriceMax > 0)
            rawParams.Add(new() { ["filterName"] = "price_max", ["filterValues"] = new[] { filters.PriceMax.Value.ToString() } });

        if (!string.IsNullOrEmpty(filters.PlaceType))
            rawParams.Add(new() { ["filterName"] = "room_types", ["filterValues"] = new[] { filters.PlaceType } });

        if (filters.Amenities.Count > 0)
            rawParams.Add(new() { ["filterName"] = "amenities", ["filterValues"] = filters.Amenities.Select(a => a.ToString()).ToArray() });

        if (filters.FreeCancellation)
            rawParams.Add(new() { ["filterName"] = "flexible_cancellation", ["filterValues"] = new[] { "true" } });

        return rawParams;
    }

    private static object BuildGraphQLBody(string hash, string cursor, List<Dictionary<string, object>> rawParams)
    {
        return new
        {
            operationName = "StaysSearch",
            extensions = new
            {
                persistedQuery = new
                {
                    version = 1,
                    sha256Hash = hash
                }
            },
            variables = new
            {
                skipExtendedSearchParams = false,
                includeMapResults = true,
                isLeanTreatment = false,
                aiSearchEnabled = false,
                staysMapSearchRequestV2 = new
                {
                    cursor,
                    requestedPageType = "STAYS_SEARCH",
                    metadataOnly = false,
                    source = "structured_search_input_header",
                    searchType = "user_map_move",
                    treatmentFlags = TreatmentFlags,
                    rawParams
                },
                staysSearchRequest = new
                {
                    cursor,
                    maxMapItems = 9999,
                    requestedPageType = "STAYS_SEARCH",
                    metadataOnly = false,
                    source = "structured_search_input_header",
                    searchType = "user_map_move",
                    treatmentFlags = TreatmentFlags,
                    rawParams
                }
            }
        };
    }

    private static string? ExtractNextCursor(JsonDocument doc)
    {
        try
        {
            return doc.RootElement
                .GetProperty("data")
                .GetProperty("presentation")
                .GetProperty("staysSearch")
                .GetProperty("results")
                .GetProperty("paginationInfo")
                .GetProperty("nextPageCursor")
                .GetString();
        }
        catch
        {
            return null;
        }
    }

    public async Task<AirbnbListing> GetListingByIdAsync(
        string roomId,
        string currency = "USD",
        string language = "en",
        int adults = 2,
        string? proxyUrl = null,
        CancellationToken ct = default)
    {
        var url = $"https://www.airbnb.com/rooms/{roomId}";

        var response = await _curl.GetAsync(url, BrowserHeadersDict);

        if (!response.IsSuccessStatusCode)
            throw new AirbnbApiException(response.StatusCode, response.Body);

        var html = response.Body;
        var listing = _mapper.MapDetailPage(roomId, html);

        var apiKeyMatch = Regex.Match(html, @"""api_config"":\{""key"":""([^""]+)""");
        if (!apiKeyMatch.Success)
            apiKeyMatch = Regex.Match(html, @"""key""\s*:\s*""([^""]+)""");

        if (apiKeyMatch.Success)
        {
            var apiKey = apiKeyMatch.Groups[1].Value;
            var productId = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"StayListing:{roomId}"));

            try
            {
                var reviews = await FetchReviewsAsync(apiKey, productId, currency, language);
                listing = listing with { Reviews = reviews };
            }
            catch
            {
            }
        }

        return listing;
    }

    private async Task<IReadOnlyList<Review>> FetchReviewsAsync(
        string apiKey,
        string roomId,
        string currency,
        string language)
    {
        const string reviewsHash = "dec1c8061483e78373602047450322fd474e79ba9afa8d3dbbc27f504030f91d";
        var allReviews = new List<Review>();
        var offset = 0;

        while (true)
        {
            var reviews = await FetchReviewsPageAsync(apiKey, roomId, offset, currency, language, reviewsHash);
            if (reviews.Count == 0)
                break;
            allReviews.AddRange(reviews);
            offset += 50;
        }

        return allReviews;
    }

    private async Task<List<Review>> FetchReviewsPageAsync(
        string apiKey,
        string productId,
        int offset,
        string currency,
        string language,
        string hash)
    {
        var baseUrl = $"https://www.airbnb.com/api/v3/StaysPdpReviewsQuery/{hash}/";

        var variablesData = new Dictionary<string, object>
        {
            ["id"] = productId,
            ["pdpReviewsRequest"] = new Dictionary<string, object>
            {
                ["fieldSelector"] = "for_p3_translation_only",
                ["forPreview"] = false,
                ["limit"] = 50,
                ["offset"] = offset.ToString(),
                ["showingTranslationButton"] = false,
                ["first"] = 50,
                ["sortingPreference"] = "MOST_RECENT",
                ["numberOfAdults"] = "1",
                ["numberOfChildren"] = "0",
                ["numberOfInfants"] = "0",
                ["numberOfPets"] = "0",
                ["after"] = (string?)null
            }
        };

        var extensionsData = new Dictionary<string, object>
        {
            ["persistedQuery"] = new Dictionary<string, object>
            {
                ["version"] = 1,
                ["sha256Hash"] = hash
            }
        };

        var variablesJson = JsonSerializer.Serialize(variablesData);
        var extensionsJson = JsonSerializer.Serialize(extensionsData);

        var queryParams = new Dictionary<string, string>
        {
            ["operationName"] = "StaysPdpReviewsQuery",
            ["locale"] = language,
            ["currency"] = currency,
            ["variables"] = variablesJson,
            ["extensions"] = extensionsJson
        };

        var queryString = string.Join("&", queryParams.Select(kv => $"{kv.Key}={Uri.EscapeDataString(kv.Value)}"));
        var requestUrl = $"{baseUrl}?{queryString}";

        var headers = new Dictionary<string, string>
        {
            ["Accept"] = "application/json",
            ["Content-Type"] = "application/json",
            ["X-Airbnb-Api-Key"] = apiKey,
            ["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        };

        var response = await _curl.GetAsync(requestUrl, headers);
        if (!response.IsSuccessStatusCode)
            return [];

        using var doc = JsonDocument.Parse(response.Body);
        return _mapper.MapReviews(doc);
    }
}

using System.Text.Json;
using System.Text.RegularExpressions;
using AirbnbScrapper.Application.Interfaces;
using AirbnbScrapper.Domain.Entities;
using AirbnbScrapper.Domain.Exceptions;
using AirbnbScrapper.Domain.ValueObjects;
using AirbnbScrapper.Infrastructure.Http;
using AirbnbScrapper.Infrastructure.Mapping;

namespace AirbnbScrapper.Infrastructure.Http;

public sealed class AirbnbHttpClient : IAirbnbHttpClient
{
    private readonly HttpClient _httpClient;
    private readonly ListingMapper _mapper;

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
        _httpClient = httpClient;
        _mapper = new ListingMapper();
    }

    public async Task<string> GetApiKeyAsync(string? proxyUrl = null, CancellationToken ct = default)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "https://www.airbnb.com/");
        AddBrowserHeaders(request, BrowserHeaders.Chrome120);

        var response = await _httpClient.SendAsync(request, ct);
        response.EnsureSuccessStatusCode();

        var html = await response.Content.ReadAsStringAsync(ct);
        var match = Regex.Match(html, @"""key""\s*:\s*""([^""]+)""");
        if (!match.Success)
            throw new DataExtractionException("Could not extract API key from Airbnb homepage");

        return match.Groups[1].Value;
    }

    public async Task<string> FetchDynamicHashAsync(string? proxyUrl = null, CancellationToken ct = default)
    {
        var homeRequest = new HttpRequestMessage(HttpMethod.Get, "https://www.airbnb.com/");
        AddBrowserHeaders(homeRequest, BrowserHeaders.Chrome120);

        var homeResponse = await _httpClient.SendAsync(homeRequest, ct);
        homeResponse.EnsureSuccessStatusCode();
        var homeHtml = await homeResponse.Content.ReadAsStringAsync(ct);

        var bundleMatch = Regex.Match(homeHtml,
            @"https://a0\.muscache\.com/airbnb/static/packages/web/[^/]+/frontend/airmetro/browser/asyncRequire\.[^""']+\.js");
            
        Console.WriteLine($"[DEBUG] Bundle URL regex match: {bundleMatch.Success}");
        if (bundleMatch.Success) Console.WriteLine($"[DEBUG] Bundle URL: {bundleMatch.Value}");
        
        if (!bundleMatch.Success)
            throw new DataExtractionException("Could not find StaysSearch bundle URL. Home HTML length: " + homeHtml.Length);

        var bundleRequest = new HttpRequestMessage(HttpMethod.Get, bundleMatch.Value);
        AddBrowserHeaders(bundleRequest, BrowserHeaders.Chrome120);

        var bundleResponse = await _httpClient.SendAsync(bundleRequest, ct);
        bundleResponse.EnsureSuccessStatusCode();
        var bundleJs = await bundleResponse.Content.ReadAsStringAsync(ct);

        var moduleMatch = Regex.Match(bundleJs,
            @"common/frontend/stays-search/routes/StaysSearchRoute/StaysSearchRoute\.prepare\.[^""']+\.js");
            
        Console.WriteLine($"[DEBUG] Module regex match: {moduleMatch.Success}");
        if (moduleMatch.Success) Console.WriteLine($"[DEBUG] Module JS path: {moduleMatch.Value}");

        if (!moduleMatch.Success)
            throw new DataExtractionException("Could not find StaysSearchRoute module. Bundle JS length: " + bundleJs.Length);

        var moduleUrl = $"https://a0.muscache.com/airbnb/static/packages/web/{moduleMatch.Value}";
        Console.WriteLine($"[DEBUG] Fetching module: {moduleUrl}");

        var moduleRequest = new HttpRequestMessage(HttpMethod.Get, moduleUrl);
        AddBrowserHeaders(moduleRequest, BrowserHeaders.Chrome120);

        var moduleResponse = await _httpClient.SendAsync(moduleRequest, ct);
        moduleResponse.EnsureSuccessStatusCode();
        var moduleJs = await moduleResponse.Content.ReadAsStringAsync(ct);

        var hashMatch = Regex.Match(moduleJs, @"operationId:['""]([0-9a-f]{64})");
        Console.WriteLine($"[DEBUG] Hash regex match: {hashMatch.Success}");
        if (hashMatch.Success) Console.WriteLine($"[DEBUG] Hash found: {hashMatch.Groups[1].Value}");
        
        if (!hashMatch.Success)
        {
            // Dump partial content for debugging
            var sample = moduleJs.Length > 500 ? moduleJs.Substring(0, 500) : moduleJs;
            Console.WriteLine($"[DEBUG] Module JS sample: {sample}...");
            throw new DataExtractionException("Could not extract StaysSearch operationId");
        }

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
            var response = await FetchSearchPageAsync(apiKey, hash, filters, currentCursor, ct);
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
        string cursor,
        CancellationToken ct)
    {
        var url = $"https://www.airbnb.com/api/v3/StaysSearch/{hash}?operationName=StaysSearch&locale={filters.Language}&currency={filters.Currency}";

        var rawParams = BuildRawParams(filters);
        var body = BuildGraphQLBody(hash, cursor, rawParams);

        var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(JsonSerializer.Serialize(body), System.Text.Encoding.UTF8, "application/json")
        };

        AddBrowserHeaders(request, BrowserHeaders.ApiRequest);
        request.Headers.Add("X-Airbnb-Api-Key", apiKey);

        var response = await _httpClient.SendAsync(request, ct);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            throw new AirbnbApiException((int)response.StatusCode, errorBody);
        }

        var json = await response.Content.ReadAsStringAsync(ct);
        return JsonDocument.Parse(json);
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

        if (!string.IsNullOrEmpty(filters.CheckIn))
            rawParams.Add(new() { ["filterName"] = "checkin", ["filterValues"] = new[] { filters.CheckIn } });

        if (!string.IsNullOrEmpty(filters.CheckOut))
            rawParams.Add(new() { ["filterName"] = "checkout", ["filterValues"] = new[] { filters.CheckOut } });

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

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        AddBrowserHeaders(request, BrowserHeaders.Chrome120);

        var response = await _httpClient.SendAsync(request, ct);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            throw new AirbnbApiException((int)response.StatusCode, errorBody);
        }

        var html = await response.Content.ReadAsStringAsync(ct);
        var listing = _mapper.MapDetailPage(roomId, html);

        var apiKeyMatch = Regex.Match(html, @"""key""\s*:\s*""([^""]+)""");
        
        if (apiKeyMatch.Success)
        {
            var apiKey = apiKeyMatch.Groups[1].Value;
            var productId = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"StayListing:{roomId}"));
            
            try
            {
                var reviews = await FetchReviewsAsync(apiKey, productId, currency, language, ct);
                listing = listing with { Reviews = reviews };
            }
            catch
            {
                // Ignore review fetch errors
            }
        }

        return listing;
    }

    private async Task<IReadOnlyList<Review>> FetchReviewsAsync(
        string apiKey,
        string roomId,
        string currency,
        string language,
        CancellationToken ct)
    {
        const string reviewsHash = "dec1c8061483e78373602047450322fd474e79ba9afa8d3dbbc27f504030f91d";
        var allReviews = new List<Review>();
        var offset = 0;

        while (true)
        {
            var reviews = await FetchReviewsPageAsync(apiKey, roomId, offset, currency, language, reviewsHash, ct);
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
        string hash,
        CancellationToken ct)
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

        var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
        request.Headers.Add("Accept", "application/json");
        request.Headers.TryAddWithoutValidation("Content-Type", "application/json");
        request.Headers.Add("X-Airbnb-Api-Key", apiKey);
        request.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

        var response = await _httpClient.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
            return [];

        var json = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(json);

        return _mapper.MapReviews(doc);
    }

    private static void AddBrowserHeaders(HttpRequestMessage request, Dictionary<string, string> headers)
    {
        foreach (var header in headers)
        {
            request.Headers.TryAddWithoutValidation(header.Key, header.Value);
        }
    }
}


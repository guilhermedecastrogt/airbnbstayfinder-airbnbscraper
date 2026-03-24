using AirbnbScraper.Application.Interfaces;
using AirbnbScraper.Domain.Entities;

namespace AirbnbScraper.Application.Services;

public sealed class AirbnbSearchService : IAirbnbSearchService
{
    private readonly IAirbnbHttpClient _httpClient;
    private readonly IUrlParser _urlParser;

    public AirbnbSearchService(IAirbnbHttpClient httpClient, IUrlParser urlParser)
    {
        _httpClient = httpClient;
        _urlParser = urlParser;
    }

    private const string FallbackHash = "9f945886dcc032b9ef4ba770d9132eb0aa78053296b5405483944c229617b00b";
    private const string FallbackApiKey = "d306zoyjsyarp7ifhu67rjxn52tv0t20";

    public async Task<IReadOnlyList<AirbnbListing>> SearchByUrlAsync(
        string url,
        string currency = "USD",
        string language = "en",
        string? proxyUrl = null,
        CancellationToken ct = default)
    {
        var filters = _urlParser.ParseUrl(url, currency, language);

        string apiKey;
        try
        {
            Console.WriteLine($"[Scraper] Fetching API key...");
            apiKey = await _httpClient.GetApiKeyAsync(proxyUrl, ct);
            Console.WriteLine($"[Scraper] API key obtained");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Scraper] Warning: Could not fetch API key: {ex.Message}");
            Console.WriteLine($"[Scraper] Using fallback API key");
            apiKey = FallbackApiKey;
        }

        string hash;
        try
        {
            Console.WriteLine($"[Scraper] Fetching dynamic hash...");
            hash = await _httpClient.FetchDynamicHashAsync(proxyUrl, ct);
            Console.WriteLine($"[Scraper] Dynamic hash: {hash}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Scraper] Warning: Could not fetch dynamic hash: {ex.Message}");
            Console.WriteLine($"[Scraper] Using fallback hash");
            hash = FallbackHash;
        }

        Console.WriteLine($"[Scraper] Searching listings...");

        var listings = await _httpClient.SearchListingsAsync(apiKey, hash, filters, null, proxyUrl, ct);

        Console.WriteLine($"[Scraper] Found {listings.Count} listings");

        return listings;
    }

    public async Task<AirbnbListing> GetByIdAsync(
        string roomId,
        string currency = "USD",
        string language = "en",
        int adults = 2,
        string? proxyUrl = null,
        CancellationToken ct = default)
    {
        return await _httpClient.GetListingByIdAsync(roomId, currency, language, adults, proxyUrl, ct);
    }
}

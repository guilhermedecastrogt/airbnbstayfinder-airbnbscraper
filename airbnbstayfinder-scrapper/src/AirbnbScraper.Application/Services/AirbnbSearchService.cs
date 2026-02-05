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

    public async Task<IReadOnlyList<AirbnbListing>> SearchByUrlAsync(
        string url,
        string currency = "USD",
        string language = "en",
        string? proxyUrl = null,
        CancellationToken ct = default)
    {
        var filters = _urlParser.ParseUrl(url, currency, language);
        var apiKey = await _httpClient.GetApiKeyAsync(proxyUrl, ct);
        var hash = await _httpClient.FetchDynamicHashAsync(proxyUrl, ct);

        var allListings = new List<AirbnbListing>();
        string? cursor = null;

        do
        {
            var listings = await _httpClient.SearchListingsAsync(
                apiKey, hash, filters, cursor, proxyUrl, ct);

            if (listings.Count == 0)
                break;

            allListings.AddRange(listings);
            cursor = null;
        }
        while (cursor != null);

        return allListings;
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

using AirbnbScraper.Domain.Entities;
using AirbnbScraper.Domain.ValueObjects;

namespace AirbnbScraper.Application.Interfaces;

public interface IAirbnbHttpClient
{
    Task<string> FetchDynamicHashAsync(string? proxyUrl = null, CancellationToken ct = default);
    Task<string> GetApiKeyAsync(string? proxyUrl = null, CancellationToken ct = default);

    Task<IReadOnlyList<AirbnbListing>> SearchListingsAsync(
        string apiKey,
        string hash,
        SearchFilters filters,
        string? cursor = null,
        string? proxyUrl = null,
        CancellationToken ct = default);

    Task<AirbnbListing> GetListingByIdAsync(
        string roomId,
        string currency = "USD",
        string language = "en",
        int adults = 2,
        string? proxyUrl = null,
        CancellationToken ct = default);
}

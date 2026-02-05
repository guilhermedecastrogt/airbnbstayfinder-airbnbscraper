using AirbnbScrapper.Domain.Entities;

namespace AirbnbScrapper.Application.Interfaces;

public interface IAirbnbSearchService
{
    Task<IReadOnlyList<AirbnbListing>> SearchByUrlAsync(
        string url,
        string currency = "USD",
        string language = "en",
        string? proxyUrl = null,
        CancellationToken ct = default);

    Task<AirbnbListing> GetByIdAsync(
        string roomId,
        string currency = "USD",
        string language = "en",
        int adults = 2,
        string? proxyUrl = null,
        CancellationToken ct = default);
}

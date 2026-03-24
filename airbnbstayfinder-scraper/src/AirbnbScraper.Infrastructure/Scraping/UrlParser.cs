using System.Web;
using AirbnbScraper.Application.Interfaces;
using AirbnbScraper.Domain.Exceptions;
using AirbnbScraper.Domain.ValueObjects;

namespace AirbnbScraper.Infrastructure.Scraping;

public sealed class UrlParser : IUrlParser
{
    public SearchFilters ParseUrl(string url, string currency = "USD", string language = "en")
    {
        if (string.IsNullOrWhiteSpace(url))
            throw new UrlParsingException(url, "URL cannot be empty");

        try
        {
            var uri = new Uri(url);
            var query = HttpUtility.ParseQueryString(uri.Query);

            // Extract query from URL path (e.g. /s/Manhattan/homes -> Manhattan)
            var pathSegments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            string? locationQuery = null;
            if (pathSegments.Length >= 2 && pathSegments[0] == "s")
                locationQuery = Uri.UnescapeDataString(pathSegments[1]);

            return new SearchFilters
            {
                CheckIn = query["checkin"],
                CheckOut = query["checkout"],
                NorthEastLat = ParseDouble(query["ne_lat"]),
                NorthEastLng = ParseDouble(query["ne_lng"]),
                SouthWestLat = ParseDouble(query["sw_lat"]),
                SouthWestLng = ParseDouble(query["sw_lng"]),
                ZoomLevel = ParseInt(query["zoom_level"] ?? query["zoom"]) ?? 12,
                PriceMin = ParseInt(query["price_min"]),
                PriceMax = ParseInt(query["price_max"]),
                PlaceType = query["room_types[]"],
                Amenities = ParseAmenities(query.GetValues("amenities[]")),
                FreeCancellation = query["flexible_cancellation"]?.ToLower() == "true",
                Currency = currency,
                Language = language,
                Query = query["query"] ?? locationQuery,
                PlaceId = query["place_id"]
            };
        }
        catch (Exception ex) when (ex is not UrlParsingException)
        {
            throw new UrlParsingException(url, ex.Message);
        }
    }

    private static double? ParseDouble(string? value)
        => double.TryParse(value, out var result) ? result : null;

    private static int? ParseInt(string? value)
        => int.TryParse(value, out var result) ? result : null;

    private static IReadOnlyList<int> ParseAmenities(string[]? values)
    {
        if (values == null) return [];

        var amenities = new List<int>();
        foreach (var v in values)
        {
            if (int.TryParse(v, out var id))
                amenities.Add(id);
        }
        return amenities;
    }
}

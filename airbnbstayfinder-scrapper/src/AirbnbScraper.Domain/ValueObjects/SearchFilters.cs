namespace AirbnbScraper.Domain.ValueObjects;

public sealed record SearchFilters
{
    public string? CheckIn { get; init; }
    public string? CheckOut { get; init; }
    public double? NorthEastLat { get; init; }
    public double? NorthEastLng { get; init; }
    public double? SouthWestLat { get; init; }
    public double? SouthWestLng { get; init; }
    public int ZoomLevel { get; init; }
    public int? PriceMin { get; init; }
    public int? PriceMax { get; init; }
    public string? PlaceType { get; init; }
    public IReadOnlyList<int> Amenities { get; init; } = [];
    public bool FreeCancellation { get; init; }
    public string Currency { get; init; } = "USD";
    public string Language { get; init; } = "en";
}

namespace AirbnbScrapper.Domain.Entities;

public sealed record AirbnbListing
{
    public required string RoomId { get; init; }
    public required string Title { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public string? Language { get; init; }
    public ListingPrice Price { get; init; } = new();
    public DetailedRating Rating { get; init; } = new();
    public HostInfo Host { get; init; } = new();
    public IReadOnlyList<CoHost> CoHosts { get; init; } = [];
    public IReadOnlyList<ListingImage> Images { get; init; } = [];
    public bool IsFreeCancellation { get; init; }
    public string? PropertyType { get; init; }
    public GeoCoordinates? Coordinates { get; init; }
    public int HomeTier { get; init; }
    public int PersonCapacity { get; init; }
    public bool IsGuestFavorite { get; init; }
    public SubDescription SubDescription { get; init; } = new();
    public HouseRules HouseRules { get; init; } = new();
    public IReadOnlyList<AmenityGroup> Amenities { get; init; } = [];
    public IReadOnlyList<LocationDescription> LocationDescriptions { get; init; } = [];
    public IReadOnlyList<Highlight> Highlights { get; init; } = [];
    public IReadOnlyList<Review> Reviews { get; init; } = [];
}

public sealed record ListingPrice
{
    public decimal Amount { get; init; }
    public decimal? DiscountAmount { get; init; }
    public string Currency { get; init; } = "USD";
    public string? PriceString { get; init; }
}

public sealed record DetailedRating
{
    public double Accuracy { get; init; }
    public double Checkin { get; init; }
    public double Cleanliness { get; init; }
    public double Communication { get; init; }
    public double Location { get; init; }
    public double Value { get; init; }
    public double GuestSatisfaction { get; init; }
    public int ReviewCount { get; init; }
}

public sealed record HostInfo
{
    public string? Id { get; init; }
    public string? Name { get; init; }
    public string? ProfilePictureUrl { get; init; }
    public bool IsSuperhost { get; init; }
    public string? JoinedOn { get; init; }
    public string? Description { get; init; }
}

public sealed record CoHost
{
    public string? Id { get; init; }
    public string? Name { get; init; }
}

public sealed record ListingImage
{
    public required string Url { get; init; }
    public string? Caption { get; init; }
    public int? Width { get; init; }
    public int? Height { get; init; }
}

public sealed record GeoCoordinates
{
    public double Latitude { get; init; }
    public double Longitude { get; init; }
}

public sealed record SubDescription
{
    public string? Title { get; init; }
    public IReadOnlyList<string> Items { get; init; } = [];
}

public sealed record HouseRules
{
    public string? Additional { get; init; }
    public IReadOnlyList<HouseRuleSection> General { get; init; } = [];
}

public sealed record HouseRuleSection
{
    public string? Title { get; init; }
    public IReadOnlyList<HouseRuleValue> Values { get; init; } = [];
}

public sealed record HouseRuleValue
{
    public string? Title { get; init; }
    public string? Icon { get; init; }
}

public sealed record AmenityGroup
{
    public string? Title { get; init; }
    public IReadOnlyList<Amenity> Values { get; init; } = [];
}

public sealed record Amenity
{
    public string? Title { get; init; }
    public string? Subtitle { get; init; }
    public string? Icon { get; init; }
    public bool Available { get; init; }
}

public sealed record LocationDescription
{
    public string? Title { get; init; }
    public string? Content { get; init; }
}

public sealed record Highlight
{
    public string? Title { get; init; }
    public string? Subtitle { get; init; }
    public string? Icon { get; init; }
}

public sealed record Review
{
    public string? Id { get; init; }
    public string? Comments { get; init; }
    public string? Language { get; init; }
    public string? CreatedAt { get; init; }
    public string? LocalizedDate { get; init; }
    public int Rating { get; init; }
    public ReviewUser? Reviewer { get; init; }
    public ReviewUser? Reviewee { get; init; }
    public LocalizedReview? LocalizedReview { get; init; }
}

public sealed record ReviewUser
{
    public string? Id { get; init; }
    public string? FirstName { get; init; }
    public string? PictureUrl { get; init; }
    public bool IsSuperhost { get; init; }
}

public sealed record LocalizedReview
{
    public string? Comments { get; init; }
    public string? CommentsLanguage { get; init; }
    public string? Disclaimer { get; init; }
    public bool NeedsTranslation { get; init; }
}

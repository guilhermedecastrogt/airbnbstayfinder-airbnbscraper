using System.Text.Json;
using System.Text.Json.Serialization;

namespace AirbnbScrapper.Api.Contracts;

public sealed record SearchByUrlRequest(string Url, string? Currency = "USD", string? Language = "en");

public sealed record SearchByIdRequest(
    [property: JsonConverter(typeof(StringOrNumberConverter))]
    string StayId,
    string? Currency = "USD",
    string? Language = "en",
    int? Adults = 1
);

public sealed record ApiResponse<T>(
    [property: JsonPropertyName("success")] bool Success,
    [property: JsonPropertyName("count")] int Count,
    [property: JsonPropertyName("data")] T Data,
    [property: JsonPropertyName("message")] string? Message = null
);

public sealed record ListingResponse
{
    [JsonPropertyName("coordinates")]
    public CoordinatesDto? Coordinates { get; init; }

    [JsonPropertyName("room_type")]
    public string? RoomType { get; init; }

    [JsonPropertyName("is_super_host")]
    public bool IsSuperHost { get; init; }

    [JsonPropertyName("home_tier")]
    public int HomeTier { get; init; }

    [JsonPropertyName("person_capacity")]
    public int PersonCapacity { get; init; }

    [JsonPropertyName("rating")]
    public RatingDto? Rating { get; init; }

    [JsonPropertyName("house_rules")]
    public HouseRulesDto? HouseRules { get; init; }

    [JsonPropertyName("host")]
    public HostDto? Host { get; init; }

    [JsonPropertyName("sub_description")]
    public SubDescriptionDto? SubDescription { get; init; }

    [JsonPropertyName("amenities")]
    public IReadOnlyList<AmenityGroupDto> Amenities { get; init; } = [];

    [JsonPropertyName("co_hosts")]
    public IReadOnlyList<CoHostDto> CoHosts { get; init; } = [];

    [JsonPropertyName("images")]
    public IReadOnlyList<ImageDto> Images { get; init; } = [];

    [JsonPropertyName("location_descriptions")]
    public IReadOnlyList<LocationDescriptionDto> LocationDescriptions { get; init; } = [];

    [JsonPropertyName("highlights")]
    public IReadOnlyList<HighlightDto> Highlights { get; init; } = [];

    [JsonPropertyName("is_guest_favorite")]
    public bool IsGuestFavorite { get; init; }

    [JsonPropertyName("description")]
    public string? Description { get; init; }

    [JsonPropertyName("title")]
    public string? Title { get; init; }

    [JsonPropertyName("language")]
    public string? Language { get; init; }

    [JsonPropertyName("reviews")]
    public IReadOnlyList<ReviewDto> Reviews { get; init; } = [];
}

public sealed record CoordinatesDto
{
    [JsonPropertyName("latitude")]
    public double Latitude { get; init; }

    [JsonPropertyName("longitude")]
    public double Longitude { get; init; }
}

public sealed record RatingDto
{
    [JsonPropertyName("accuracy")]
    public double Accuracy { get; init; }

    [JsonPropertyName("checking")]
    public double Checking { get; init; }

    [JsonPropertyName("cleanliness")]
    public double Cleanliness { get; init; }

    [JsonPropertyName("communication")]
    public double Communication { get; init; }

    [JsonPropertyName("location")]
    public double Location { get; init; }

    [JsonPropertyName("value")]
    public double Value { get; init; }

    [JsonPropertyName("guest_satisfaction")]
    public double GuestSatisfaction { get; init; }

    [JsonPropertyName("review_count")]
    public string ReviewCount { get; init; } = "0";
}

public sealed record HouseRulesDto
{
    [JsonPropertyName("aditional")]
    public string? Aditional { get; init; }

    [JsonPropertyName("general")]
    public IReadOnlyList<HouseRuleSectionDto> General { get; init; } = [];
}

public sealed record HouseRuleSectionDto
{
    [JsonPropertyName("title")]
    public string? Title { get; init; }

    [JsonPropertyName("values")]
    public IReadOnlyList<HouseRuleValueDto> Values { get; init; } = [];
}

public sealed record HouseRuleValueDto
{
    [JsonPropertyName("title")]
    public string? Title { get; init; }

    [JsonPropertyName("icon")]
    public string? Icon { get; init; }
}

public sealed record HostDto
{
    [JsonPropertyName("id")]
    public string? Id { get; init; }

    [JsonPropertyName("name")]
    public string? Name { get; init; }
}

public sealed record SubDescriptionDto
{
    [JsonPropertyName("title")]
    public string? Title { get; init; }

    [JsonPropertyName("items")]
    public IReadOnlyList<string> Items { get; init; } = [];
}

public sealed record AmenityGroupDto
{
    [JsonPropertyName("title")]
    public string? Title { get; init; }

    [JsonPropertyName("values")]
    public IReadOnlyList<AmenityDto> Values { get; init; } = [];
}

public sealed record AmenityDto
{
    [JsonPropertyName("title")]
    public string? Title { get; init; }

    [JsonPropertyName("subtitle")]
    public string? Subtitle { get; init; }

    [JsonPropertyName("icon")]
    public string? Icon { get; init; }

    [JsonPropertyName("available")]
    public bool Available { get; init; }
}

public sealed record CoHostDto
{
    [JsonPropertyName("id")]
    public string? Id { get; init; }

    [JsonPropertyName("name")]
    public string? Name { get; init; }
}

public sealed record ImageDto
{
    [JsonPropertyName("url")]
    public string? Url { get; init; }

    [JsonPropertyName("caption")]
    public string? Caption { get; init; }
}

public sealed record LocationDescriptionDto
{
    [JsonPropertyName("title")]
    public string? Title { get; init; }

    [JsonPropertyName("content")]
    public string? Content { get; init; }
}

public sealed record HighlightDto
{
    [JsonPropertyName("title")]
    public string? Title { get; init; }

    [JsonPropertyName("subtitle")]
    public string? Subtitle { get; init; }

    [JsonPropertyName("icon")]
    public string? Icon { get; init; }
}

public sealed record ReviewDto
{
    [JsonPropertyName("comments")]
    public string? Comments { get; init; }

    [JsonPropertyName("created_at")]
    public string? CreatedAt { get; init; }

    [JsonPropertyName("language")]
    public string? Language { get; init; }

    [JsonPropertyName("localized_date")]
    public string? LocalizedDate { get; init; }

    [JsonPropertyName("id")]
    public string? Id { get; init; }

    [JsonPropertyName("collection_tag")]
    public string? CollectionTag { get; init; }

    [JsonPropertyName("rating")]
    public int Rating { get; init; }

    [JsonPropertyName("response")]
    public ReviewResponseDto? Response { get; init; }

    [JsonPropertyName("reviewer")]
    public ReviewerDto? Reviewer { get; init; }

    [JsonPropertyName("localized_review")]
    public LocalizedReviewDto? LocalizedReview { get; init; }
}

public sealed record ReviewResponseDto
{
    [JsonPropertyName("comments")]
    public string? Comments { get; init; }

    [JsonPropertyName("created_at")]
    public string? CreatedAt { get; init; }

    [JsonPropertyName("id")]
    public string? Id { get; init; }

    [JsonPropertyName("language")]
    public string? Language { get; init; }

    [JsonPropertyName("localized_date")]
    public string? LocalizedDate { get; init; }
}

public sealed record ReviewerDto
{
    [JsonPropertyName("first_name")]
    public string? FirstName { get; init; }

    [JsonPropertyName("profile_pic_path")]
    public string? ProfilePicPath { get; init; }

    [JsonPropertyName("id")]
    public string? Id { get; init; }

    [JsonPropertyName("is_super_host")]
    public bool IsSuperHost { get; init; }
}

public sealed record LocalizedReviewDto
{
    [JsonPropertyName("comments")]
    public string? Comments { get; init; }

    [JsonPropertyName("disclaimer")]
    public string? Disclaimer { get; init; }

    [JsonPropertyName("needs_translation")]
    public bool NeedsTranslation { get; init; }

    [JsonPropertyName("response")]
    public LocalizedResponseDto? Response { get; init; }
}

public sealed record LocalizedResponseDto
{
    [JsonPropertyName("comments")]
    public string? Comments { get; init; }

    [JsonPropertyName("disclaimer")]
    public string? Disclaimer { get; init; }

    [JsonPropertyName("needs_translation")]
    public bool NeedsTranslation { get; init; }
}

public class StringOrNumberConverter : JsonConverter<string>
{
    public override string Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return reader.TokenType switch
        {
            JsonTokenType.String => reader.GetString() ?? "",
            JsonTokenType.Number => reader.GetInt64().ToString(),
            _ => throw new JsonException($"Cannot convert {reader.TokenType} to string")
        };
    }

    public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value);
    }
}

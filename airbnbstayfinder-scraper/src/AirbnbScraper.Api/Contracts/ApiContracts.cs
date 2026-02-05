using System.Text.Json;
using System.Text.Json.Serialization;

namespace AirbnbScraper.Api.Contracts;

public class StringOrNumberConverter : JsonConverter<string>
{
    public override string? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return reader.TokenType switch
        {
            JsonTokenType.String => reader.GetString(),
            JsonTokenType.Number => reader.GetInt64().ToString(),
            _ => throw new JsonException($"Cannot convert {reader.TokenType} to string")
        };
    }

    public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value);
    }
}

public sealed record SearchByUrlRequest
{
    public required string Url { get; init; }
    public string Currency { get; init; } = "USD";
    public string Language { get; init; } = "en";
    public string? ProxyUrl { get; init; }
}

public sealed record SearchByIdRequest
{
    [JsonConverter(typeof(StringOrNumberConverter))]
    public required string StayId { get; init; }
    public string Currency { get; init; } = "USD";
    public string Language { get; init; } = "en";
    public int Adults { get; init; } = 2;
    public string? ProxyUrl { get; init; }
}

public sealed record AirbnbSearchResponse<T>
{
    public bool Success { get; init; }
    public int Count { get; init; }
    public T Data { get; init; } = default!;
    public string? Message { get; init; }
    public string? Error { get; init; }
}

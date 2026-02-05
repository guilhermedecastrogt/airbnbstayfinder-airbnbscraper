namespace AirbnbScraper.Domain.Exceptions;

public class AirbnbScraperException : Exception
{
    public AirbnbScraperException(string message) : base(message) { }
    public AirbnbScraperException(string message, Exception innerException) : base(message, innerException) { }
}

public class AirbnbApiException : AirbnbScraperException
{
    public int StatusCode { get; }
    public string? ResponseBody { get; }

    public AirbnbApiException(int statusCode, string? responseBody = null)
        : base($"Airbnb API error: HTTP {statusCode}")
    {
        StatusCode = statusCode;
        ResponseBody = responseBody;
    }
}

public class DataExtractionException : AirbnbScraperException
{
    public DataExtractionException(string message) : base(message) { }
}

public class UrlParsingException : AirbnbScraperException
{
    public string Url { get; }

    public UrlParsingException(string url, string message)
        : base($"Failed to parse URL '{url}': {message}")
    {
        Url = url;
    }
}

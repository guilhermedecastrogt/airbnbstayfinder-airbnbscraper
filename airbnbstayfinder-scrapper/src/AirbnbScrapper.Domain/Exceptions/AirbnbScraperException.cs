namespace AirbnbScrapper.Domain.Exceptions;

public class AirbnbScrapperException : Exception
{
    public AirbnbScrapperException(string message) : base(message) { }
    public AirbnbScrapperException(string message, Exception innerException) : base(message, innerException) { }
}

public class AirbnbApiException : AirbnbScrapperException
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

public class DataExtractionException : AirbnbScrapperException
{
    public DataExtractionException(string message) : base(message) { }
}

public class UrlParsingException : AirbnbScrapperException
{
    public string Url { get; }

    public UrlParsingException(string url, string message)
        : base($"Failed to parse URL '{url}': {message}")
    {
        Url = url;
    }
}

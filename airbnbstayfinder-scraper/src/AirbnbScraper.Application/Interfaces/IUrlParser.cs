using AirbnbScraper.Domain.ValueObjects;

namespace AirbnbScraper.Application.Interfaces;

public interface IUrlParser
{
    SearchFilters ParseUrl(string url, string currency = "USD", string language = "en");
}

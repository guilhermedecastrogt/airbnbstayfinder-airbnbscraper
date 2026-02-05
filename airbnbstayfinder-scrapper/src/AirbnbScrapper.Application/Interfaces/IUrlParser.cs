using AirbnbScrapper.Domain.ValueObjects;

namespace AirbnbScrapper.Application.Interfaces;

public interface IUrlParser
{
    SearchFilters ParseUrl(string url, string currency = "USD", string language = "en");
}

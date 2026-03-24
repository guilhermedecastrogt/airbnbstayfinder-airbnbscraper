using Microsoft.Extensions.DependencyInjection;
using AirbnbScraper.Application.Interfaces;
using AirbnbScraper.Infrastructure.Http;
using AirbnbScraper.Infrastructure.Scraping;

namespace AirbnbScraper.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IAirbnbHttpClient, AirbnbHttpClient>();
        services.AddHttpClient<AirbnbHttpClient>();

        services.AddScoped<IUrlParser, UrlParser>();

        return services;
    }
}

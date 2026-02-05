using Microsoft.Extensions.DependencyInjection;
using AirbnbScraper.Application.Interfaces;
using AirbnbScraper.Infrastructure.Http;
using AirbnbScraper.Infrastructure.Scraping;

namespace AirbnbScraper.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddHttpClient<IAirbnbHttpClient, AirbnbHttpClient>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(60);
        });

        services.AddScoped<IUrlParser, UrlParser>();

        return services;
    }
}

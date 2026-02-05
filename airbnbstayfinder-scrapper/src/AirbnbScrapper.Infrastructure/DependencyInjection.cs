using Microsoft.Extensions.DependencyInjection;
using AirbnbScrapper.Application.Interfaces;
using AirbnbScrapper.Infrastructure.Http;
using AirbnbScrapper.Infrastructure.Scraping;

namespace AirbnbScrapper.Infrastructure;

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

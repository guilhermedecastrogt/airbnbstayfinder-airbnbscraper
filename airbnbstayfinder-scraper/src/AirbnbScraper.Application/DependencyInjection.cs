using Microsoft.Extensions.DependencyInjection;
using AirbnbScraper.Application.Interfaces;
using AirbnbScraper.Application.Services;

namespace AirbnbScraper.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAirbnbSearchService, AirbnbSearchService>();
        return services;
    }
}

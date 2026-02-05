using Microsoft.Extensions.DependencyInjection;
using AirbnbScrapper.Application.Interfaces;
using AirbnbScrapper.Application.Services;

namespace AirbnbScrapper.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAirbnbSearchService, AirbnbSearchService>();
        return services;
    }
}

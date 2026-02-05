using System.Text.Json.Serialization;
using AirbnbScraper.Api.Contracts;
using AirbnbScraper.Application;
using AirbnbScraper.Application.Interfaces;
using AirbnbScraper.Domain.Entities;
using AirbnbScraper.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNameCaseInsensitive = true;
});

var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "airbnbstayfinder-scraper" }));

app.MapGet("/", () => Results.Ok(new
{
    message = "AirbnbStayFinder Scraper API",
    version = "1.0.0",
    endpoints = new
    {
        health = "/health",
        searchByUrl = "POST /api/v1/search-by-url",
        searchById = "POST /api/v1/search-by-id"
    }
}));

app.MapPost("/api/v1/search-by-url", async (
    SearchByUrlRequest request,
    IAirbnbSearchService searchService,
    CancellationToken ct) =>
{
    try
    {
        var listings = await searchService.SearchByUrlAsync(
            request.Url,
            request.Currency,
            request.Language,
            request.ProxyUrl,
            ct);

        return Results.Ok(new AirbnbSearchResponse<IReadOnlyList<AirbnbListing>>
        {
            Success = true,
            Count = listings.Count,
            Data = listings,
            Message = $"Successfully extracted {listings.Count} listings"
        });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new AirbnbSearchResponse<object>
        {
            Success = false,
            Count = 0,
            Data = null!,
            Error = ex.Message
        });
    }
});

app.MapPost("/api/v1/search-by-id", async (
    SearchByIdRequest request,
    IAirbnbSearchService searchService,
    CancellationToken ct) =>
{
    try
    {
        var listing = await searchService.GetByIdAsync(
            request.StayId,
            request.Currency,
            request.Language,
            request.Adults,
            request.ProxyUrl,
            ct);

        return Results.Ok(new AirbnbSearchResponse<IReadOnlyList<AirbnbListing>>
        {
            Success = true,
            Count = 1,
            Data = [listing],
            Message = $"Successfully extracted listing {request.StayId}"
        });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new AirbnbSearchResponse<object>
        {
            Success = false,
            Count = 0,
            Data = null!,
            Error = ex.Message
        });
    }
});

app.Run();

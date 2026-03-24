using System.Text.Json;
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
            null,
            ct);

        var data = listings.Select(MapToPySearchResponse).ToList();

        return Results.Ok(new ApiResponse<IReadOnlyList<PySearchListingResponse>>(
            Success: true,
            Count: data.Count,
            Data: data,
            Message: $"Successfully extracted {data.Count} listings"
        ));
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new ApiResponse<object>(
            Success: false,
            Count: 0,
            Data: null!,
            Message: ex.Message
        ));
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
            request.Adults ?? 1,
            null,
            ct);

        var response = MapToDetailResponse(listing);

        return Results.Ok(new ApiResponse<IReadOnlyList<ListingResponse>>(
            Success: true,
            Count: 1,
            Data: [response],
            Message: $"Successfully extracted listing {request.StayId}"
        ));
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new ApiResponse<object>(
            Success: false,
            Count: 0,
            Data: null!,
            Message: ex.Message
        ));
    }
});

app.Run();

static PySearchListingResponse MapToPySearchResponse(AirbnbListing listing)
{
    long.TryParse(listing.RoomId, out var roomIdLong);

    // Pass through raw passportData and paymentMessages from Airbnb API (same as pyairbnb-api)
    object? passportData = null;
    if (!string.IsNullOrEmpty(listing.PassportDataJson))
    {
        try { passportData = JsonSerializer.Deserialize<object>(listing.PassportDataJson); }
        catch { }
    }
    // Fallback: construct from available data
    passportData ??= new PyPassportDataDto
    {
        Name = listing.Host?.Name,
        RatingCount = listing.Rating.ReviewCount,
        RatingAverage = listing.Rating.GuestSatisfaction
    };

    object? paymentMessages = null;
    if (!string.IsNullOrEmpty(listing.PaymentMessagesJson))
    {
        try { paymentMessages = JsonSerializer.Deserialize<object>(listing.PaymentMessagesJson); }
        catch { }
    }

    return new PySearchListingResponse
    {
        RoomId = roomIdLong,
        Title = listing.Title,
        Name = listing.Name,
        PassportData = passportData,
        PaymentMessages = paymentMessages,
        Price = new PyPriceDto
        {
            Unit = new PyPriceUnitDto
            {
                CurrencySymbol = listing.Price.CurrencySymbol,
                Amount = listing.Price.Amount,
                Discount = listing.Price.Discount
            }
        },
        Rating = new PyRatingDto
        {
            Value = listing.Rating.GuestSatisfaction,
            ReviewCount = listing.Rating.ReviewCount.ToString()
        },
        Images = listing.Images?.Select(i => new PyImageDto { Url = i.Url }).ToList() ?? [],
        Coordinates = listing.Coordinates != null ? new PyCoordinatesDto
        {
            Latitude = listing.Coordinates.Latitude,
            Longitud = listing.Coordinates.Longitude
        } : null
    };
}

static ListingResponse MapToDetailResponse(AirbnbListing listing)
{
    return new ListingResponse
    {
        Coordinates = listing.Coordinates != null ? new CoordinatesDto
        {
            Latitude = listing.Coordinates.Latitude,
            Longitude = listing.Coordinates.Longitude
        } : null,
        RoomType = listing.PropertyType,
        IsSuperHost = listing.Host?.IsSuperhost ?? false,
        HomeTier = listing.HomeTier,
        PersonCapacity = listing.PersonCapacity,
        Rating = new RatingDto
        {
            Accuracy = listing.Rating?.Accuracy ?? 0,
            Checking = listing.Rating?.Checkin ?? 0,
            Cleanliness = listing.Rating?.Cleanliness ?? 0,
            Communication = listing.Rating?.Communication ?? 0,
            Location = listing.Rating?.Location ?? 0,
            Value = listing.Rating?.Value ?? 0,
            GuestSatisfaction = listing.Rating?.GuestSatisfaction ?? 0,
            ReviewCount = listing.Rating?.ReviewCount.ToString() ?? "0"
        },
        HouseRules = new HouseRulesDto
        {
            Aditional = listing.HouseRules?.Additional,
            General = listing.HouseRules?.General?.Select(g => new HouseRuleSectionDto
            {
                Title = g.Title,
                Values = g.Values?.Select(v => new HouseRuleValueDto
                {
                    Title = v.Title,
                    Icon = v.Icon
                }).ToList() ?? []
            }).ToList() ?? []
        },
        Host = new HostDto
        {
            Id = listing.Host?.Id,
            Name = listing.Host?.Name
        },
        SubDescription = new SubDescriptionDto
        {
            Title = listing.SubDescription?.Title,
            Items = listing.SubDescription?.Items?.ToList() ?? []
        },
        Amenities = listing.Amenities?.Select(a => new AmenityGroupDto
        {
            Title = a.Title,
            Values = a.Values?.Select(v => new AmenityDto
            {
                Title = v.Title,
                Subtitle = v.Subtitle ?? "",
                Icon = v.Icon,
                Available = v.Available
            }).ToList() ?? []
        }).ToList() ?? [],
        CoHosts = listing.CoHosts?.Select(c => new CoHostDto
        {
            Id = c.Id,
            Name = c.Name
        }).ToList() ?? [],
        Images = listing.Images?.Select(i => new ImageDto
        {
            Url = i.Url,
            Caption = i.Caption
        }).ToList() ?? [],
        LocationDescriptions = listing.LocationDescriptions?.Select(l => new LocationDescriptionDto
        {
            Title = l.Title,
            Content = l.Content
        }).ToList() ?? [],
        Highlights = listing.Highlights?.Select(h => new HighlightDto
        {
            Title = h.Title,
            Subtitle = h.Subtitle,
            Icon = h.Icon
        }).ToList() ?? [],
        IsGuestFavorite = listing.IsGuestFavorite,
        Description = listing.Description,
        Title = listing.Title,
        Language = listing.Language ?? "en",
        Reviews = listing.Reviews?.Select(r => new ReviewDto
        {
            Comments = r.Comments,
            CreatedAt = r.CreatedAt,
            Language = r.Language,
            LocalizedDate = r.LocalizedDate,
            Id = r.Id,
            CollectionTag = null,
            Rating = r.Rating,
            Response = null,
            Reviewer = r.Reviewer != null ? new ReviewerDto
            {
                FirstName = r.Reviewer.FirstName,
                ProfilePicPath = r.Reviewer.PictureUrl,
                Id = r.Reviewer.Id,
                IsSuperHost = r.Reviewer.IsSuperhost
            } : null,
            LocalizedReview = r.LocalizedReview != null ? new LocalizedReviewDto
            {
                Comments = r.LocalizedReview.Comments,
                Disclaimer = r.LocalizedReview.Disclaimer,
                NeedsTranslation = r.LocalizedReview.NeedsTranslation,
                Response = null
            } : null
        }).ToList() ?? []
    };
}

using System.Text.Json;
using System.Text.RegularExpressions;
using HtmlAgilityPack;
using AirbnbScraper.Domain.Entities;

namespace AirbnbScraper.Infrastructure.Mapping;

public sealed class ListingMapper
{
    public IReadOnlyList<AirbnbListing> MapSearchResponse(JsonDocument doc)
    {
        var listings = new List<AirbnbListing>();

        try
        {
            var searchResults = doc.RootElement
                .GetProperty("data")
                .GetProperty("presentation")
                .GetProperty("staysSearch")
                .GetProperty("results")
                .GetProperty("searchResults");

            foreach (var result in searchResults.EnumerateArray())
            {
                var listing = MapSearchResult(result);
                if (listing != null)
                    listings.Add(listing);
            }
        }
        catch
        {
        }

        return listings;
    }

    private AirbnbListing? MapSearchResult(JsonElement result)
    {
        try
        {
            var listingEl = result.GetProperty("listing");

            var roomId = GetStringSafe(listingEl, "id");
            var title = GetStringSafe(listingEl, "title");
            var name = GetStringSafe(listingEl, "name");

            var priceAmount = 0m;
            var priceString = "";
            if (result.TryGetProperty("pricingQuote", out var pricingQuote) &&
                pricingQuote.TryGetProperty("structuredStayDisplayPrice", out var displayPrice) &&
                displayPrice.TryGetProperty("primaryLine", out var primaryLine))
            {
                priceString = GetStringSafe(primaryLine, "displayComponentizedPrice");
                if (string.IsNullOrEmpty(priceString))
                    priceString = GetStringSafe(primaryLine, "price");

                var match = Regex.Match(priceString, @"[\d,]+");
                if (match.Success)
                {
                    decimal.TryParse(match.Value.Replace(",", ""), out priceAmount);
                }
            }

            var rating = GetDouble(listingEl, "avgRating");
            var reviewCount = GetInt(listingEl, "reviewsCount");

            var images = new List<ListingImage>();
            if (listingEl.TryGetProperty("contextualPictures", out var pictures))
            {
                foreach (var pic in pictures.EnumerateArray())
                {
                    var url = GetStringSafe(pic, "picture");
                    if (!string.IsNullOrEmpty(url))
                    {
                        images.Add(new ListingImage
                        {
                            Url = url,
                            Caption = GetStringSafe(pic, "caption")
                        });
                    }
                }
            }

            GeoCoordinates? coords = null;
            if (listingEl.TryGetProperty("coordinate", out var coordEl))
            {
                coords = new GeoCoordinates
                {
                    Latitude = GetDouble(coordEl, "latitude"),
                    Longitude = GetDouble(coordEl, "longitude")
                };
            }

            return new AirbnbListing
            {
                RoomId = roomId,
                Title = title,
                Name = name,
                Price = new ListingPrice
                {
                    Amount = priceAmount,
                    PriceString = priceString
                },
                Rating = new DetailedRating
                {
                    GuestSatisfaction = rating,
                    ReviewCount = reviewCount
                },
                Images = images,
                Coordinates = coords
            };
        }
        catch
        {
            return null;
        }
    }

    public AirbnbListing MapDetailPage(string roomId, string html)
    {
        try
        {
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var scriptNode = doc.DocumentNode.SelectSingleNode("//script[@id='data-deferred-state-0']");
            if (scriptNode == null)
            {
                return CreateEmptyListing(roomId);
            }

            var jsonText = scriptNode.InnerText.Trim();
            using var jsonDoc = JsonDocument.Parse(jsonText);
            var root = jsonDoc.RootElement;

            if (!root.TryGetProperty("niobeClientData", out var niobeData) ||
                niobeData.ValueKind != JsonValueKind.Array ||
                niobeData.GetArrayLength() == 0)
            {
                return CreateEmptyListing(roomId);
            }

            var firstItem = niobeData[0];
            if (firstItem.ValueKind != JsonValueKind.Array || firstItem.GetArrayLength() < 2)
            {
                return CreateEmptyListing(roomId);
            }

            var meta = firstItem[1];
            var sections = GetNested(meta, "data.presentation.stayProductDetailPage.sections");
            if (sections == null)
            {
                return CreateEmptyListing(roomId);
            }

            var ev = GetNested(sections.Value, "metadata.loggingContext.eventDataLogging");

            // Basic info from eventDataLogging
            var latitude = 0.0;
            var longitude = 0.0;
            double guestSatisfaction = 0, accuracy = 0, checkin = 0, cleanliness = 0;
            double communication = 0, location = 0, value = 0;
            var reviewCount = 0;
            var isSuperhost = false;
            var personCapacity = 0;
            var homeTier = 0;
            var roomType = "";

            if (ev.HasValue && ev.Value.ValueKind == JsonValueKind.Object)
            {
                latitude = GetDouble(ev.Value, "listingLat");
                longitude = GetDouble(ev.Value, "listingLng");
                guestSatisfaction = GetDouble(ev.Value, "guestSatisfactionOverall");
                accuracy = GetDouble(ev.Value, "accuracyRating");
                checkin = GetDouble(ev.Value, "checkinRating");
                cleanliness = GetDouble(ev.Value, "cleanlinessRating");
                communication = GetDouble(ev.Value, "communicationRating");
                location = GetDouble(ev.Value, "locationRating");
                value = GetDouble(ev.Value, "valueRating");
                reviewCount = GetInt(ev.Value, "visibleReviewCount");
                isSuperhost = GetBool(ev.Value, "isSuperhost");
                personCapacity = GetInt(ev.Value, "personCapacity");
                homeTier = GetInt(ev.Value, "homeTier");
                roomType = GetStringSafe(ev.Value, "roomType");
            }

            var title = "";
            var description = "";
            var hostId = "";
            var hostName = "";
            var hostJoinedOn = "";
            var hostDescription = "";
            var images = new List<ListingImage>();
            var coHosts = new List<CoHost>();
            var houseRules = new HouseRules();
            var amenities = new List<AmenityGroup>();
            var locationDescriptions = new List<LocationDescription>();
            var highlights = new List<Highlight>();
            var reviews = new List<Review>();
            var isGuestFavorite = false;

            var sectionsArray = GetNested(sections.Value, "sections");
            if (sectionsArray.HasValue && sectionsArray.Value.ValueKind == JsonValueKind.Array)
            {
                foreach (var section in sectionsArray.Value.EnumerateArray())
                {
                    if (section.ValueKind != JsonValueKind.Object) continue;
                    
                    // Check isGuestFavorite
                    var sectionData = GetNested(section, "section");
                    if (sectionData.HasValue && sectionData.Value.ValueKind == JsonValueKind.Object)
                    {
                        if (GetBool(sectionData.Value, "isGuestFavorite"))
                            isGuestFavorite = true;
                    }

                    var typeName = GetNested(section, "section.__typename");
                    if (!typeName.HasValue || typeName.Value.ValueKind != JsonValueKind.String) continue;

                    var typeNameStr = typeName.Value.GetString() ?? "";

                    switch (typeNameStr)
                    {
                        case "PdpTitleSection":
                            title = GetStringSafe(section, "title");
                            if (string.IsNullOrEmpty(title))
                            {
                                var sectionTitle = GetNested(section, "section.title");
                                if (sectionTitle.HasValue && sectionTitle.Value.ValueKind == JsonValueKind.String)
                                    title = sectionTitle.Value.GetString() ?? "";
                            }
                            break;

                        case "HostProfileSection":
                            var hostAvatarId = GetNested(section, "section.hostAvatar.userID");
                            if (hostAvatarId.HasValue && hostAvatarId.Value.ValueKind == JsonValueKind.String)
                                hostId = hostAvatarId.Value.GetString() ?? "";
                            
                            var hostTitleEl = GetNested(section, "section.title");
                            if (hostTitleEl.HasValue && hostTitleEl.Value.ValueKind == JsonValueKind.String)
                                hostName = hostTitleEl.Value.GetString() ?? "";
                            
                            var hostSubtitle = GetNested(section, "section.subtitle");
                            if (hostSubtitle.HasValue && hostSubtitle.Value.ValueKind == JsonValueKind.String)
                                hostJoinedOn = hostSubtitle.Value.GetString() ?? "";
                            
                            var hostDesc = GetNested(section, "section.hostProfileDescription.htmlText");
                            if (hostDesc.HasValue && hostDesc.Value.ValueKind == JsonValueKind.String)
                                hostDescription = hostDesc.Value.GetString() ?? "";
                            
                            // Co-hosts
                            var additionalHosts = GetNested(section, "section.additionalHosts");
                            if (additionalHosts.HasValue && additionalHosts.Value.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var ch in additionalHosts.Value.EnumerateArray())
                                {
                                    coHosts.Add(new CoHost
                                    {
                                        Id = GetStringSafe(ch, "id"),
                                        Name = GetStringSafe(ch, "name")
                                    });
                                }
                            }
                            break;

                        case "PhotoTourModalSection":
                            var mediaItems = GetNested(section, "section.mediaItems");
                            if (mediaItems.HasValue && mediaItems.Value.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var mediaItem in mediaItems.Value.EnumerateArray())
                                {
                                    if (mediaItem.ValueKind != JsonValueKind.Object) continue;
                                    var url = GetStringSafe(mediaItem, "baseUrl");
                                    if (!string.IsNullOrEmpty(url))
                                    {
                                        images.Add(new ListingImage
                                        {
                                            Url = url,
                                            Caption = GetStringSafe(mediaItem, "accessibilityLabel")
                                        });
                                    }
                                }
                            }
                            break;

                        case "PdpDescriptionSection":
                            var descHtml = GetNested(section, "section.htmlDescription.htmlText");
                            if (descHtml.HasValue && descHtml.Value.ValueKind == JsonValueKind.String)
                                description = descHtml.Value.GetString() ?? "";
                            break;

                        case "PoliciesSection":
                            houseRules = ParseHouseRules(section);
                            break;

                        case "AmenitiesSection":
                            amenities = ParseAmenities(section);
                            break;

                        case "LocationSection":
                            locationDescriptions = ParseLocationDescriptions(section);
                            break;

                        case "PdpHighlightsSection":
                            highlights = ParseHighlights(section);
                            break;
                    }
                }
            }

            // Parse reviews from reviews section
            var reviewsSection = GetNested(sections.Value, "reviews");
            if (reviewsSection.HasValue)
            {
                reviews = ParseReviews(reviewsSection.Value);
            }

            // Parse sub_description from sbuiData
            var subDescription = new SubDescription();
            var sbuiData = GetNested(sections.Value, "sbuiData.sectionConfiguration.root.sections");
            if (sbuiData.HasValue && sbuiData.Value.ValueKind == JsonValueKind.Array)
            {
                foreach (var section in sbuiData.Value.EnumerateArray())
                {
                    if (section.ValueKind != JsonValueKind.Object) continue;

                    var typeName = GetNested(section, "sectionData.__typename");
                    if (!typeName.HasValue || typeName.Value.ValueKind != JsonValueKind.String) continue;

                    var typeNameStr = typeName.Value.GetString() ?? "";

                    if (typeNameStr == "PdpHostOverviewDefaultSection")
                    {
                        if (string.IsNullOrEmpty(hostId))
                        {
                            var hId = GetNested(section, "sectionData.hostAvatar.loggingEventData.eventData.pdpContext.hostId");
                            if (hId.HasValue && hId.Value.ValueKind == JsonValueKind.String)
                                hostId = hId.Value.GetString() ?? "";
                        }
                        if (string.IsNullOrEmpty(hostName))
                        {
                            var hName = GetNested(section, "sectionData.title");
                            if (hName.HasValue && hName.Value.ValueKind == JsonValueKind.String)
                                hostName = hName.Value.GetString() ?? "";
                        }
                    }
                    else if (typeNameStr == "PdpOverviewV2Section")
                    {
                        var subTitle = GetNested(section, "sectionData.title");
                        var subItems = new List<string>();
                        var overviewItems = GetNested(section, "sectionData.overviewItems");
                        if (overviewItems.HasValue && overviewItems.Value.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var item in overviewItems.Value.EnumerateArray())
                            {
                                var itemTitle = GetStringSafe(item, "title");
                                if (!string.IsNullOrEmpty(itemTitle))
                                    subItems.Add(itemTitle);
                            }
                        }
                        subDescription = new SubDescription
                        {
                            Title = subTitle.HasValue && subTitle.Value.ValueKind == JsonValueKind.String
                                ? subTitle.Value.GetString()
                                : null,
                            Items = subItems
                        };
                    }
                }
            }

            GeoCoordinates? coords = null;
            if (latitude != 0 || longitude != 0)
            {
                coords = new GeoCoordinates
                {
                    Latitude = latitude,
                    Longitude = longitude
                };
            }

            return new AirbnbListing
            {
                RoomId = roomId,
                Title = title,
                Name = title,
                Description = description,
                Language = "en",
                Price = new ListingPrice(),
                Rating = new DetailedRating
                {
                    Accuracy = accuracy,
                    Checkin = checkin,
                    Cleanliness = cleanliness,
                    Communication = communication,
                    Location = location,
                    Value = value,
                    GuestSatisfaction = guestSatisfaction,
                    ReviewCount = reviewCount
                },
                Host = new HostInfo
                {
                    Id = hostId,
                    Name = hostName,
                    IsSuperhost = isSuperhost,
                    JoinedOn = hostJoinedOn,
                    Description = hostDescription
                },
                CoHosts = coHosts,
                Images = images,
                PropertyType = roomType,
                Coordinates = coords,
                HomeTier = homeTier,
                PersonCapacity = personCapacity,
                IsGuestFavorite = isGuestFavorite,
                SubDescription = subDescription,
                HouseRules = houseRules,
                Amenities = amenities,
                LocationDescriptions = locationDescriptions,
                Highlights = highlights,
                Reviews = reviews
            };
        }
        catch
        {
            return CreateEmptyListing(roomId);
        }
    }

    private HouseRules ParseHouseRules(JsonElement section)
    {
        var additional = "";
        var general = new List<HouseRuleSection>();

        var houseRulesSections = GetNested(section, "section.houseRulesSections");
        if (houseRulesSections.HasValue && houseRulesSections.Value.ValueKind == JsonValueKind.Array)
        {
            foreach (var hrs in houseRulesSections.Value.EnumerateArray())
            {
                var sectionTitle = GetStringSafe(hrs, "title");
                var values = new List<HouseRuleValue>();

                var items = GetNested(hrs, "items");
                if (items.HasValue && items.Value.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in items.Value.EnumerateArray())
                    {
                        var itemTitle = GetStringSafe(item, "title");
                        if (itemTitle == "Additional rules")
                        {
                            var htmlText = GetNested(item, "html.htmlText");
                            if (htmlText.HasValue && htmlText.Value.ValueKind == JsonValueKind.String)
                                additional = htmlText.Value.GetString() ?? "";
                            continue;
                        }
                        values.Add(new HouseRuleValue
                        {
                            Title = itemTitle,
                            Icon = GetStringSafe(item, "icon")
                        });
                    }
                }

                if (values.Count > 0)
                {
                    general.Add(new HouseRuleSection
                    {
                        Title = sectionTitle,
                        Values = values
                    });
                }
            }
        }

        return new HouseRules { Additional = additional, General = general };
    }

    private List<AmenityGroup> ParseAmenities(JsonElement section)
    {
        var groups = new List<AmenityGroup>();

        var amenityGroups = GetNested(section, "section.seeAllAmenitiesGroups");
        if (amenityGroups.HasValue && amenityGroups.Value.ValueKind == JsonValueKind.Array)
        {
            foreach (var group in amenityGroups.Value.EnumerateArray())
            {
                var groupTitle = GetStringSafe(group, "title");
                var values = new List<Amenity>();

                var amenities = GetNested(group, "amenities");
                if (amenities.HasValue && amenities.Value.ValueKind == JsonValueKind.Array)
                {
                    foreach (var am in amenities.Value.EnumerateArray())
                    {
                        values.Add(new Amenity
                        {
                            Title = GetStringSafe(am, "title"),
                            Subtitle = GetStringSafe(am, "subtitle"),
                            Icon = GetStringSafe(am, "icon"),
                            Available = GetBool(am, "available")
                        });
                    }
                }

                groups.Add(new AmenityGroup { Title = groupTitle, Values = values });
            }
        }

        return groups;
    }

    private List<LocationDescription> ParseLocationDescriptions(JsonElement section)
    {
        var descriptions = new List<LocationDescription>();

        var locationDetails = GetNested(section, "section.seeAllLocationDetails");
        if (locationDetails.HasValue && locationDetails.Value.ValueKind == JsonValueKind.Array)
        {
            foreach (var ld in locationDetails.Value.EnumerateArray())
            {
                var content = GetNested(ld, "content.htmlText");
                descriptions.Add(new LocationDescription
                {
                    Title = GetStringSafe(ld, "title"),
                    Content = content.HasValue && content.Value.ValueKind == JsonValueKind.String
                        ? content.Value.GetString()
                        : null
                });
            }
        }

        return descriptions;
    }

    private List<Highlight> ParseHighlights(JsonElement section)
    {
        var highlights = new List<Highlight>();

        var highlightsArray = GetNested(section, "section.highlights");
        if (highlightsArray.HasValue && highlightsArray.Value.ValueKind == JsonValueKind.Array)
        {
            foreach (var hl in highlightsArray.Value.EnumerateArray())
            {
                highlights.Add(new Highlight
                {
                    Title = GetStringSafe(hl, "title"),
                    Subtitle = GetStringSafe(hl, "subtitle"),
                    Icon = GetStringSafe(hl, "icon")
                });
            }
        }

        return highlights;
    }

    private List<Review> ParseReviews(JsonElement reviewsSection)
    {
        var reviews = new List<Review>();

        if (!reviewsSection.TryGetProperty("reviews", out var reviewsArray) ||
            reviewsArray.ValueKind != JsonValueKind.Array)
            return reviews;

        foreach (var r in reviewsArray.EnumerateArray())
        {
            var reviewer = GetNested(r, "reviewer");
            var reviewee = GetNested(r, "reviewee");
            var localizedReview = GetNested(r, "localizedReview");

            var review = new Review
            {
                Id = GetStringSafe(r, "id"),
                Comments = GetStringSafe(r, "comments"),
                Language = GetStringSafe(r, "language"),
                CreatedAt = GetStringSafe(r, "createdAt"),
                LocalizedDate = GetStringSafe(r, "localizedDate"),
                Rating = GetInt(r, "rating"),
                Reviewer = reviewer.HasValue ? new ReviewUser
                {
                    Id = GetStringSafe(reviewer.Value, "id"),
                    FirstName = GetStringSafe(reviewer.Value, "firstName"),
                    PictureUrl = GetStringSafe(reviewer.Value, "pictureUrl"),
                    IsSuperhost = GetBool(reviewer.Value, "isSuperhost")
                } : null,
                Reviewee = reviewee.HasValue ? new ReviewUser
                {
                    Id = GetStringSafe(reviewee.Value, "id"),
                    FirstName = GetStringSafe(reviewee.Value, "firstName"),
                    PictureUrl = GetStringSafe(reviewee.Value, "pictureUrl"),
                    IsSuperhost = GetBool(reviewee.Value, "isSuperhost")
                } : null,
                LocalizedReview = localizedReview.HasValue && localizedReview.Value.ValueKind == JsonValueKind.Object ? new LocalizedReview
                {
                    Comments = GetStringSafe(localizedReview.Value, "comments"),
                    CommentsLanguage = GetStringSafe(localizedReview.Value, "commentsLanguage"),
                    Disclaimer = GetStringSafe(localizedReview.Value, "disclaimer"),
                    NeedsTranslation = GetBool(localizedReview.Value, "needsTranslation")
                } : null
            };

            reviews.Add(review);
        }

        return reviews;
    }

    private static JsonElement? GetNested(JsonElement el, string path)
    {
        if (el.ValueKind != JsonValueKind.Object) return null;

        var parts = path.Split('.');
        var current = el;

        foreach (var part in parts)
        {
            if (current.ValueKind != JsonValueKind.Object) return null;
            if (!current.TryGetProperty(part, out var next)) return null;
            if (next.ValueKind == JsonValueKind.Null) return null;
            current = next;
        }

        return current;
    }

    private static string GetStringSafe(JsonElement el, string property)
    {
        if (el.ValueKind != JsonValueKind.Object) return "";
        if (!el.TryGetProperty(property, out var prop)) return "";
        if (prop.ValueKind != JsonValueKind.String) return "";
        return prop.GetString() ?? "";
    }

    private static double GetDouble(JsonElement el, string property)
    {
        if (el.ValueKind != JsonValueKind.Object) return 0;
        if (!el.TryGetProperty(property, out var prop)) return 0;
        if (prop.ValueKind != JsonValueKind.Number) return 0;
        return prop.GetDouble();
    }

    private static int GetInt(JsonElement el, string property)
    {
        if (el.ValueKind != JsonValueKind.Object) return 0;
        if (!el.TryGetProperty(property, out var prop)) return 0;
        if (prop.ValueKind != JsonValueKind.Number) return 0;
        return prop.GetInt32();
    }

    private static bool GetBool(JsonElement el, string property)
    {
        if (el.ValueKind != JsonValueKind.Object) return false;
        if (!el.TryGetProperty(property, out var prop)) return false;
        return prop.ValueKind == JsonValueKind.True;
    }

    private AirbnbListing CreateEmptyListing(string roomId)
    {
        return new AirbnbListing
        {
            RoomId = roomId,
            Title = "",
            Price = new ListingPrice(),
            Rating = new DetailedRating(),
            Host = new HostInfo(),
            Images = []
        };
    }
}

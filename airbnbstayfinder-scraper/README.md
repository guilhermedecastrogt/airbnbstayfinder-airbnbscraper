# AirbnbStayFinder Scraper

A **.NET 8 ASP.NET Core Minimal API** that scrapes Airbnb listings by reverse-engineering the Airbnb GraphQL API. It uses a Python bridge (`curl_cffi`) for Chrome TLS fingerprint impersonation, ensuring requests are not blocked by Airbnb's bot detection.

> **Study Project** — This project was built for learning purposes, exploring topics like Clean Architecture in .NET, TLS fingerprinting, GraphQL API reverse engineering, and multi-language interop (C# + Python).

<p align="center">
  <img src="../public/images/console-output.png" alt="Scraper processing listings" width="500" />
  <br/>
  <em>The scraper fetching and processing Airbnb listings in real-time</em>
</p>

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [How It Works](#how-it-works)
  - [1. API Key Extraction](#1-api-key-extraction)
  - [2. Dynamic Hash Discovery](#2-dynamic-hash-discovery)
  - [3. Search Listings (StaysSearch)](#3-search-listings-stayssearch)
  - [4. Get Listing by ID](#4-get-listing-by-id)
  - [5. Reviews (StaysPdpReviewsQuery)](#5-reviews-stayspdpreviewsquery)
- [Project Structure](#project-structure)
  - [Domain Layer](#domain-layer)
  - [Application Layer](#application-layer)
  - [Infrastructure Layer](#infrastructure-layer)
  - [API Layer](#api-layer)
- [TLS Impersonation — The Python Bridge](#tls-impersonation--the-python-bridge)
- [URL Parsing](#url-parsing)
- [API Endpoints](#api-endpoints)
  - [POST /api/v1/search-by-url](#post-apiv1search-by-url)
  - [POST /api/v1/search-by-id](#post-apiv1search-by-id)
  - [GET /health](#get-health)
- [Setup & Running](#setup--running)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Docker](#docker)
- [Key Technical Decisions](#key-technical-decisions)

---

## Architecture Overview

The project follows **Clean Architecture** with four layers:

```
┌─────────────────────────────────────────────────────┐
│                    API Layer                          │
│             (Program.cs — Minimal API)               │
├─────────────────────────────────────────────────────┤
│                 Application Layer                     │
│         (AirbnbSearchService, Interfaces)             │
├─────────────────────────────────────────────────────┤
│               Infrastructure Layer                    │
│    (AirbnbHttpClient, CurlImpersonateClient,         │
│     ListingMapper, UrlParser)                         │
├─────────────────────────────────────────────────────┤
│                  Domain Layer                         │
│     (AirbnbListing, SearchFilters, Exceptions)        │
└─────────────────────────────────────────────────────┘
```

Dependencies flow **inward** — the Domain layer has zero external dependencies, the Application layer depends only on Domain, and the Infrastructure and API layers depend on both.

---

## How It Works

The scraper replicates what a browser does when you search on Airbnb, broken down into discrete steps:

### 1. API Key Extraction

Every Airbnb API request requires an `X-Airbnb-Api-Key` header. The scraper:

1. Fetches `https://www.airbnb.com/` using Chrome-impersonated TLS
2. Parses the HTML to find the key in `"api_config":{"key":"<KEY>"}`
3. Falls back to a hardcoded key (`d306zoyjsyarp7ifhu67rjxn52tv0t20`) if extraction fails

**File:** `Infrastructure/Http/AirbnbHttpClient.cs` → `GetApiKeyAsync()`

### 2. Dynamic Hash Discovery

Airbnb uses **persisted GraphQL queries** identified by a SHA-256 hash (`operationId`). This hash changes periodically when Airbnb deploys new code. The scraper dynamically discovers it through a 3-stage process:

1. **Stage 1:** Fetch the homepage → find the `asyncRequire` JavaScript bundle URL
2. **Stage 2:** Fetch the bundle → find the `StaysSearchRoute.prepare` module URL
3. **Stage 3:** Fetch the module → extract `operationId:"<64-char-hex-hash>"`

Falls back to a hardcoded hash if any stage fails.

**File:** `Infrastructure/Http/AirbnbHttpClient.cs` → `FetchDynamicHashAsync()`

### 3. Search Listings (StaysSearch)

Performs a `POST` to the Airbnb GraphQL API:

```
POST https://www.airbnb.com/api/v3/StaysSearch/{hash}
    ?operationName=StaysSearch
    &locale=en
    &currency=USD
```

The request body contains:
- `rawParams` — search filters (location, dates, prices, amenities, etc.)
- `treatmentFlags` — A/B testing flags that must be present for full results
- Cursor-based **pagination** — automatically fetches all pages

Key parameters that affect result count:
- `query` — location name (e.g., "Manhattan")
- `placeId` — Airbnb's internal place identifier
- `priceFilterNumNights` — calculated from check-in/check-out dates (critical for getting full results)

**File:** `Infrastructure/Http/AirbnbHttpClient.cs` → `SearchListingsAsync()`, `BuildRawParams()`

### 4. Get Listing by ID

Fetches a single listing's detail page by loading the HTML from `https://www.airbnb.com/rooms/{roomId}` and parsing the embedded JSON from the `<script id="data-deferred-state-0">` tag.

Extracts: title, description, host info, images, amenities, house rules, location descriptions, highlights, ratings, coordinates, and more.

**File:** `Infrastructure/Mapping/ListingMapper.cs` → `MapDetailPage()`

### 5. Reviews (StaysPdpReviewsQuery)

After fetching the detail page, the scraper makes additional API calls to fetch all reviews using the `StaysPdpReviewsQuery` persisted query. Reviews are paginated in batches of 50.

**File:** `Infrastructure/Http/AirbnbHttpClient.cs` → `FetchReviewsAsync()`

---

## Project Structure

```
airbnbstayfinder-scraper/
├── AirbnbScraper.sln                    # Solution file
├── Dockerfile                            # Multi-stage Docker build
├── scripts/
│   └── curl_bridge.py                    # Python TLS impersonation bridge
└── src/
    ├── AirbnbScraper.Api/                # API Layer (entry point)
    │   ├── Program.cs                    # Minimal API endpoints + response mapping
    │   ├── Contracts/
    │   │   └── ApiContracts.cs           # Request/Response DTOs
    │   └── Properties/
    │       └── launchSettings.json       # Dev server config (port 8002)
    │
    ├── AirbnbScraper.Application/        # Application Layer
    │   ├── DependencyInjection.cs        # Service registration
    │   ├── Interfaces/
    │   │   ├── IAirbnbHttpClient.cs      # HTTP client contract
    │   │   ├── IAirbnbSearchService.cs   # Search service contract
    │   │   └── IUrlParser.cs             # URL parser contract
    │   └── Services/
    │       └── AirbnbSearchService.cs    # Orchestrates: parse URL → get key → get hash → search
    │
    ├── AirbnbScraper.Domain/             # Domain Layer (pure C#, no dependencies)
    │   ├── Entities/
    │   │   └── AirbnbListing.cs          # Core entity + 15 related records
    │   ├── Exceptions/
    │   │   └── AirbnbScraperException.cs # Custom exceptions
    │   └── ValueObjects/
    │       └── SearchFilters.cs          # Search filter value object
    │
    └── AirbnbScraper.Infrastructure/     # Infrastructure Layer
        ├── DependencyInjection.cs        # Infrastructure service registration
        ├── Http/
        │   ├── AirbnbHttpClient.cs       # Main HTTP client (API key, hash, search, detail)
        │   ├── BrowserHeaders.cs         # Chrome browser header constants
        │   └── CurlImpersonateClient.cs  # Python bridge manager + fallback curl
        ├── Mapping/
        │   └── ListingMapper.cs          # JSON → Domain entity mappers (search + detail)
        └── Scraping/
            └── UrlParser.cs              # Airbnb URL → SearchFilters parser
```

### Domain Layer

**Zero external dependencies.** Contains:

- **`AirbnbListing`** — The core entity with 16 properties covering everything from room ID, title, price, ratings, host info, images, amenities, house rules, to reviews
- **Related records** — `ListingPrice`, `DetailedRating`, `HostInfo`, `CoHost`, `ListingImage`, `GeoCoordinates`, `SubDescription`, `HouseRules`, `AmenityGroup`, `Amenity`, `LocationDescription`, `Highlight`, `Review`, `ReviewUser`, `LocalizedReview`
- **`SearchFilters`** — Value object representing all possible Airbnb search parameters (dates, coordinates, prices, amenities, zoom level, query, placeId)
- **Exceptions** — `AirbnbScraperException`, `DataExtractionException`, `AirbnbApiException`, `UrlParsingException`

### Application Layer

The orchestration layer:

- **`AirbnbSearchService`** — The main service that coordinates the full flow:
  1. Parse URL into `SearchFilters`
  2. Fetch API key (with fallback)
  3. Fetch dynamic hash (with fallback)
  4. Search listings via GraphQL API
- **Interfaces** — `IAirbnbHttpClient`, `IAirbnbSearchService`, `IUrlParser`

### Infrastructure Layer

The implementation layer:

- **`AirbnbHttpClient`** — Implements the full Airbnb API communication: API key extraction, hash discovery, search (with pagination), detail page fetching, and review fetching
- **`CurlImpersonateClient`** — Manages the Python bridge process: resolves the bridge script path, verifies `python3` + `curl_cffi` availability, falls back to regular `curl` if unavailable
- **`ListingMapper`** — Maps raw JSON responses into domain entities. Handles both search results (`MapSearchResponse`) and detail pages (`MapDetailPage`). Includes base64 room ID decoding, price string parsing, and deeply nested JSON traversal
- **`UrlParser`** — Parses Airbnb search URLs into `SearchFilters`. Extracts query parameters, location from path segments (`/s/Manhattan/homes`), and `place_id`

### API Layer

The presentation layer (ASP.NET Core Minimal API):

- **`POST /api/v1/search-by-url`** — Accepts an Airbnb search URL, returns all matching listings
- **`POST /api/v1/search-by-id`** — Accepts a room ID, returns detailed listing info with reviews
- **Response mapping** — Transforms domain entities into API DTOs compatible with the pyairbnb-api response format

---

## TLS Impersonation — The Python Bridge

Airbnb blocks requests from standard HTTP clients because their TLS fingerprints don't match real browsers. The solution is **TLS impersonation** using `curl_cffi`, a Python library that uses patched versions of `libcurl` to replicate Chrome's exact TLS handshake.

### How it works

```
┌──────────────┐     JSON stdin      ┌───────────────────┐     HTTPS (Chrome TLS)     ┌──────────┐
│  C# (.NET)   │ ──────────────────► │  curl_bridge.py   │ ────────────────────────►   │  Airbnb  │
│              │ ◄────────────────── │  (curl_cffi)      │ ◄────────────────────────   │  Server  │
└──────────────┘     JSON stdout     └───────────────────┘                             └──────────┘
```

1. **C# spawns a Python process** for each HTTP request
2. Sends the request details as JSON on **stdin**: `{ "method": "GET", "url": "...", "headers": {...}, "body": "..." }`
3. Python uses `curl_cffi` with `impersonate="chrome124"` to make the request
4. Returns the response as JSON on **stdout**: `{ "status": 200, "body": "..." }`

### Fallback

If Python or `curl_cffi` is not installed, the client falls back to regular `curl` with `--http2` and `--compressed` flags (less reliable but still works in some cases).

**Files:**
- `scripts/curl_bridge.py` — The Python bridge (43 lines)
- `Infrastructure/Http/CurlImpersonateClient.cs` — The C# process manager

---

## URL Parsing

The `UrlParser` extracts search filters from Airbnb URLs. Example:

```
https://www.airbnb.com/s/Manhattan--New-York/homes
    ?checkin=2026-04-01
    &checkout=2026-04-05
    &ne_lat=40.82
    &ne_lng=-73.91
    &sw_lat=40.70
    &sw_lng=-74.02
    &zoom_level=13
    &price_min=100
    &price_max=500
    &place_id=ChIJYeZuBI9YwokRjMDs_IEyCx0
```

Becomes:

```csharp
SearchFilters {
    CheckIn = "2026-04-01",
    CheckOut = "2026-04-05",
    NorthEastLat = 40.82,
    NorthEastLng = -73.91,
    SouthWestLat = 40.70,
    SouthWestLng = -74.02,
    ZoomLevel = 13,
    PriceMin = 100,
    PriceMax = 500,
    Query = "Manhattan--New-York",    // from URL path
    PlaceId = "ChIJYeZuBI9YwokRjMDs_IEyCx0"
}
```

The location `Query` is extracted from the URL **path** (`/s/{location}/homes`) while all other filters come from query parameters.

<p align="center">
  <img src="../public/images/airbnb-url.png" alt="Airbnb search URL with filters" width="600" />
  <br/>
  <em>The scraper parses all filters from a standard Airbnb search URL</em>
</p>

---

## API Endpoints

### POST /api/v1/search-by-url

Searches Airbnb listings by providing a full Airbnb search URL.

**Request:**
```json
{
  "url": "https://www.airbnb.com/s/Manhattan--New-York/homes?checkin=2026-04-01&checkout=2026-04-05",
  "currency": "USD",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "count": 169,
  "data": [
    {
      "room_id": 12345678,
      "name": "Cozy Studio in Midtown",
      "title": "Entire condo in New York",
      "passportData": { "name": "John", "ratingCount": 45, "ratingAvarage": 4.9 },
      "paymentMessages": [],
      "price": {
        "unit": { "qualifier": "total", "curency_symbol": "$", "amount": 250, "discount": 0 },
        "total": { "currency_symbol": "", "amount": 0 }
      },
      "rating": { "value": 4.91, "reviewCount": "156" },
      "images": [{ "url": "https://a0.muscache.com/..." }],
      "coordinates": { "latitude": 40.7589, "longitud": -73.9851 }
    }
  ],
  "message": "Successfully extracted 169 listings"
}
```

### POST /api/v1/search-by-id

Fetches detailed information for a single listing.

**Request:**
```json
{
  "stayId": "12345678",
  "currency": "USD",
  "language": "en",
  "adults": 2
}
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "title": "Cozy Studio in Midtown Manhattan",
      "description": "<p>Beautiful studio apartment...</p>",
      "coordinates": { "latitude": 40.7589, "longitude": -73.9851 },
      "room_type": "Entire home/apt",
      "is_super_host": true,
      "person_capacity": 4,
      "rating": {
        "accuracy": 4.9,
        "checking": 5.0,
        "cleanliness": 4.8,
        "communication": 5.0,
        "location": 4.9,
        "value": 4.7,
        "guest_satisfaction": 4.91,
        "review_count": "156"
      },
      "host": { "id": "123456", "name": "John" },
      "amenities": [],
      "house_rules": { "general": [], "aditional": "" },
      "highlights": [],
      "images": [],
      "reviews": [],
      "is_guest_favorite": true
    }
  ]
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{ "status": "healthy", "service": "airbnbstayfinder-scraper" }
```

---

## Setup & Running

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Python 3](https://www.python.org/downloads/) (for TLS impersonation)
- `curl_cffi` Python package

### Local Development

```bash
# 1. Install Python dependency
pip3 install curl_cffi

# 2. Restore .NET packages
dotnet restore

# 3. Run the API (port 8002)
dotnet run --project src/AirbnbScraper.Api
```

The API will start on `http://localhost:8002`.

### Docker

```bash
docker build -t airbnbstayfinder-scraper .
docker run -p 8002:8002 airbnbstayfinder-scraper
```

The Dockerfile uses a **multi-stage build**:
1. **Build stage** — `dotnet/sdk:8.0` to restore, build, and publish
2. **Runtime stage** — `dotnet/aspnet:8.0` + Python 3 + `curl_cffi` installed via `pip3`

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Python bridge instead of native C# TLS** | `curl_cffi` is the most reliable Chrome TLS impersonation library. No equivalent exists in .NET. The overhead of spawning a Python process per request is acceptable for scraping workloads. |
| **Dynamic hash discovery** | Airbnb changes the GraphQL operation hash on deploys. Hard-coding a hash means the scraper breaks every few weeks. Dynamic discovery keeps it resilient. |
| **Fallback API key + hash** | If Airbnb changes their HTML structure, the scraper still works with the last known good values. |
| **Clean Architecture** | Separation of concerns makes it easy to swap the HTTP client implementation (e.g., if a native C# TLS library becomes available). |
| **pyairbnb-api compatible response format** | The frontend was originally built against pyairbnb-api. Matching the response format means zero frontend changes were needed. |
| **`priceFilterNumNights` parameter** | This was the key fix for getting full search results (169 listings vs 10). Airbnb requires this parameter to properly filter and return all available listings for a date range. |
| **Cursor-based pagination** | Airbnb returns results in pages. The scraper automatically follows `nextPageCursor` to fetch all available listings. |

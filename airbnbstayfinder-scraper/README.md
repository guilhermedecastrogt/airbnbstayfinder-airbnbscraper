# AirbnbStayFinder Scraper

.NET 9 Minimal API for extracting Airbnb listing information, built with Clean Architecture.

## Quick Start

```bash
cd airbnbstayfinder-scraper
dotnet run --project src/AirbnbScraper.Api
```

The API will start at `http://localhost:5000` (or `https://localhost:5001`).

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/api/v1/search-by-url` | POST | Search listings by Airbnb URL |
| `/api/v1/search-by-id` | POST | Get listing details by room ID |
| `/swagger` | GET | Swagger UI |

## Usage Examples

### Search by URL
```bash
curl -X POST http://localhost:5000/api/v1/search-by-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.airbnb.com/s/Tokyo/homes?checkin=2024-03-01&checkout=2024-03-07",
    "currency": "USD",
    "language": "en"
  }'
```

### Search by ID
```bash
curl -X POST http://localhost:5000/api/v1/search-by-id \
  -H "Content-Type: application/json" \
  -d '{
    "stayId": "12345678",
    "currency": "USD",
    "language": "en",
    "adults": 2
  }'
```

## Architecture

```
src/
├── AirbnbScraper.Api/             # Minimal API endpoints
├── AirbnbScraper.Application/     # Use cases and interfaces
├── AirbnbScraper.Domain/          # Entities and value objects
└── AirbnbScraper.Infrastructure/  # HTTP client, scraping logic
```

## Development

```bash
# Build
dotnet build

# Run with hot reload
dotnet watch --project src/AirbnbScraper.Api

# Run tests
dotnet test
```

## License

MIT

# AirbnbStayFinder Scrapper

.NET 9 Minimal API for extracting Airbnb listing information, built with Clean Architecture.

## Quick Start

```bash
cd airbnbstayfinder-scrapper
dotnet run --project src/AirbnbScrapper.Api --urls "http://localhost:8002"
```

The API will start at `http://localhost:8002`.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/api/v1/search-by-url` | POST | Search listings by Airbnb URL |
| `/api/v1/search-by-id` | POST | Get listing details by room ID |

## Usage Examples

### Search by URL
```bash
curl -X POST http://localhost:8002/api/v1/search-by-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.airbnb.com/s/Tokyo/homes?checkin=2024-03-01&checkout=2024-03-07",
    "currency": "USD",
    "language": "en"
  }'
```

### Search by ID
```bash
curl -X POST http://localhost:8002/api/v1/search-by-id \
  -H "Content-Type: application/json" \
  -d '{
    "stayId": "14823673",
    "currency": "USD",
    "language": "en",
    "adults": 2
  }'
```

## Architecture

```
src/
├── AirbnbScrapper.Api/             # Minimal API endpoints
├── AirbnbScrapper.Application/     # Use cases and interfaces
├── AirbnbScrapper.Domain/          # Entities and value objects
└── AirbnbScrapper.Infrastructure/  # HTTP client, scraping logic
```

## Development

```bash
# Build
dotnet build

# Run with hot reload
dotnet watch --project src/AirbnbScrapper.Api

# Run tests
dotnet test
```

## License

MIT

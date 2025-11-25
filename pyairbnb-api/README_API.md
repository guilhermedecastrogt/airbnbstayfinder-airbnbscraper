# PyAirbnb API Server

A FastAPI-based REST API for extracting Airbnb listing information from URLs using the PyAirbnb library.

## Features

- 🚀 Fast and async API built with FastAPI
- 📊 Extract listing data from Airbnb URLs in JSON format
- 🔄 Dynamic hash fetching for better compatibility
- 📝 Interactive API documentation with Swagger UI
- 🌍 Support for multiple currencies and languages
- 🔧 Configurable proxy support

## Quick Start

### 1. Start the API Server

```bash
python api_server.py
```

The server will start on `http://localhost:8001`

### 2. Access Interactive Documentation

Visit `http://localhost:8001/docs` for the interactive Swagger UI documentation.

### 3. Test the API

```bash
python test_api.py
```

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server health status

### Root Information
- **GET** `/`
- Returns API information and available endpoints

### Search by Airbnb URL
- **POST** `/api/v1/search-by-url`
- **GET** `/api/v1/search-by-url`

Extract listing information from an Airbnb search URL.

## Usage Examples

### Using cURL (GET method)

```bash
curl -X GET "http://localhost:8001/api/v1/search-by-url?url=https://www.airbnb.com/s/Dublin--Leinster--Ireland/homes?checkin=2026-01-10&checkout=2026-02-10&adults=2&currency=EUR&language=en&use_dynamic_hash=true"
```

### Using cURL (POST method)

```bash
curl -X POST "http://localhost:8001/api/v1/search-by-url" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.airbnb.com/s/Dublin--Leinster--Ireland/homes?checkin=2026-01-10&checkout=2026-02-10&adults=2",
    "currency": "EUR",
    "language": "en",
    "use_dynamic_hash": true
  }'
```

### Using Python requests

```python
import requests

# GET method
response = requests.get(
    "http://localhost:8001/api/v1/search-by-url",
    params={
        "url": "https://www.airbnb.com/s/Dublin--Leinster--Ireland/homes?checkin=2026-01-10&checkout=2026-02-10&adults=2",
        "currency": "EUR",
        "language": "en",
        "use_dynamic_hash": True
    }
)

# POST method
response = requests.post(
    "http://localhost:8001/api/v1/search-by-url",
    json={
        "url": "https://www.airbnb.com/s/Dublin--Leinster--Ireland/homes?checkin=2026-01-10&checkout=2026-02-10&adults=2",
        "currency": "EUR",
        "language": "en",
        "use_dynamic_hash": True
    }
)

data = response.json()
print(f"Found {data['count']} listings")
```

## Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | required | Airbnb search URL |
| `currency` | string | "USD" | Currency code (EUR, USD, GBP, etc.) |
| `language` | string | "en" | Language code (en, es, fr, etc.) |
| `proxy_url` | string | "" | Proxy URL if needed |
| `use_dynamic_hash` | boolean | true | Whether to fetch dynamic hash for better compatibility |

## Response Format

```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "id": "12345678",
      "name": "Beautiful Dublin Apartment",
      "price": {
        "rate": 150,
        "currency": "EUR"
      },
      "location": {
        "lat": 53.3498,
        "lng": -6.2603
      },
      "images": ["https://..."],
      "rating": 4.8,
      "reviews_count": 127,
      // ... more listing data
    }
  ],
  "message": "Successfully extracted 25 listings"
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `500` - Internal Server Error (scraping failed)

Error response format:
```json
{
  "detail": "Error message describing what went wrong"
}
```

## Performance Notes

- Initial requests may take 30-60 seconds due to web scraping
- The dynamic hash fetching adds ~2-3 seconds but improves reliability
- Consider using `use_dynamic_hash=false` for faster responses if you have reliability issues

## Development

### Running in Development Mode

The server runs with auto-reload enabled by default:

```bash
python api_server.py
```

### Testing

Run the test suite:

```bash
python test_api.py
```

### Customization

You can modify the server configuration in `api_server.py`:

```python
if __name__ == "__main__":
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",      # Change host
        port=8001,           # Change port
        reload=True          # Disable for production
    )
```

## Production Deployment

For production deployment, consider:

1. **Use a production ASGI server:**
   ```bash
   pip install gunicorn
   gunicorn api_server:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Add rate limiting and authentication**
3. **Configure proper logging**
4. **Use environment variables for configuration**
5. **Add monitoring and health checks**

## Troubleshooting

### Common Issues

1. **SSL Warnings**: You may see urllib3 SSL warnings - these are harmless
2. **Timeout Errors**: Airbnb scraping can be slow - increase timeout values
3. **Rate Limiting**: Airbnb may rate limit requests - add delays between calls
4. **Dynamic Hash Failures**: The API falls back to a static hash if dynamic fetching fails

### Logs

Check the server logs for detailed error information. The server logs all requests and errors to the console.

## License

This project uses the same license as the PyAirbnb library.
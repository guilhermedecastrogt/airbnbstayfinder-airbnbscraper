from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
import pyairbnb
import json
import uvicorn

app = FastAPI(
    title="PyAirbnb API",
    description="API for extracting Airbnb listing information from URLs",
    version="1.0.0"
)

class AirbnbSearchRequest(BaseModel):
    url: HttpUrl
    currency: Optional[str] = "EUR"
    language: Optional[str] = "en"
    proxy_url: Optional[str] = ""
    use_dynamic_hash: Optional[bool] = True

class AirbnbSearchResponse(BaseModel):
    success: bool
    count: int
    data: List[Dict[str, Any]]
    message: Optional[str] = None

class AirbnbGetRoomByIdRequest(BaseModel):
    stay_id: int
    currency: Optional[str] = "EUR"
    language: Optional[str] = "en"
    proxy_url: Optional[str] = ""
    adults: Optional[int] = 2

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "PyAirbnb API Server",
        "version": "1.0.0",
        "endpoints": {
            "search_by_url": "/api/v1/search-by-url",
            "docs": "/docs",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "pyairbnb-api"}

@app.post("/api/v1/search-by-url", response_model=AirbnbSearchResponse)
async def search_by_airbnb_url(request: AirbnbSearchRequest):
    try:
        url_str = str(request.url)
        
        dynamic_hash = ""
        if request.use_dynamic_hash:
            try:
                dynamic_hash = pyairbnb.fetch_stays_search_hash()
            except Exception as e:
                print(f"Warning: Could not fetch dynamic hash: {e}")
        
        results = pyairbnb.search_all_from_url(
            url_str,
            currency=request.currency,
            language=request.language,
            proxy_url=request.proxy_url,
            hash=dynamic_hash
        )

        return AirbnbSearchResponse(
            success=True,
            count=len(results),
            data=results,
            message=f"Successfully extracted {len(results)} listings"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing Airbnb URL: {str(e)}"
        )

@app.post("/api/v1/search-by-id/", response_model=AirbnbSearchResponse)
async def search_room_by_id(request: AirbnbGetRoomByIdRequest):
    try:
        raw_data: Dict[str, Any] = pyairbnb.get_details(
            room_id=request.stay_id,
            currency=request.currency,
            proxy_url=request.proxy_url,
            language=request.language,
            adults=request.adults,
        )

        cleaned_data = {
            k: v
            for k, v in raw_data.items()
            if k not in {"calendar", "host_details"}
        }

        return AirbnbSearchResponse(
            success=True,
            count=1,
            data=[cleaned_data],
            message=f"Successfully extracted listing {request.stay_id}",
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid request parameters: {str(e)}",
        )








@app.get("/api/v1/search-by-url")
async def search_by_airbnb_url_get(
    url: str,
    currency: str = "EUR",
    language: str = "en",
    proxy_url: str = "",
    use_dynamic_hash: bool = True
):
    """
    GET version of the search endpoint for simple URL queries
    
    Args:
        url: Airbnb search URL
        currency: Currency code (default: USD)
        language: Language code (default: en)
        proxy_url: Proxy URL if needed (optional)
        use_dynamic_hash: Whether to fetch dynamic hash (default: True)
        
    Returns:
        JSON response with listing data
    """
    try:
        # Create request object
        request = AirbnbSearchRequest(
            url=url,
            currency=currency,
            language=language,
            proxy_url=proxy_url,
            use_dynamic_hash=use_dynamic_hash
        )
        
        # Use the POST endpoint logic
        return await search_by_airbnb_url(request)
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid request parameters: {str(e)}"
        )



def strip_unwanted_keys(results: List[dict[str, Any]]) -> List[dict[str, Any]]:
    keys_to_remove = {"calendar", "host_details"}
    cleaned: List[dict[str, Any]] = []
    for item in results:
        if isinstance(item, dict):
            cleaned.append({k: v for k, v in item.items() if k not in keys_to_remove})
        else:
            cleaned.append(item)
    return cleaned

if __name__ == "__main__":
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )

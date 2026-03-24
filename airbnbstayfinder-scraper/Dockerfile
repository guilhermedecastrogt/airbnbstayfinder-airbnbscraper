FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/AirbnbScraper.Domain/AirbnbScraper.Domain.csproj src/AirbnbScraper.Domain/
COPY src/AirbnbScraper.Application/AirbnbScraper.Application.csproj src/AirbnbScraper.Application/
COPY src/AirbnbScraper.Infrastructure/AirbnbScraper.Infrastructure.csproj src/AirbnbScraper.Infrastructure/
COPY src/AirbnbScraper.Api/AirbnbScraper.Api.csproj src/AirbnbScraper.Api/
RUN dotnet restore src/AirbnbScraper.Api/AirbnbScraper.Api.csproj

COPY src/ src/
RUN dotnet publish src/AirbnbScraper.Api/AirbnbScraper.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Install python3 + curl_cffi for TLS impersonation
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip curl && \
    pip3 install --break-system-packages curl_cffi && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .
COPY scripts/ scripts/

EXPOSE 8002

ENTRYPOINT ["dotnet", "AirbnbScraper.Api.dll", "--urls", "http://0.0.0.0:8002"]

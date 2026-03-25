# AirbnbStayFinder AI

An AI-powered Airbnb stay finder that scrapes listings from Airbnb, analyzes each one against your preferences using AI, and helps you find the perfect accommodation. Built with **Next.js 16**, **.NET 8**, **MySQL**, and **Ollama/OpenAI**.

> **Study Project** — Built for learning purposes, covering full-stack development with modern technologies: React 19 Server Components, .NET Clean Architecture, GraphQL API reverse engineering, TLS fingerprinting, AI integration, Docker orchestration, and more.

<p align="center">
  <img src="public/images/thumbnail.png" alt="AirbnbStayFinder" width="700" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [The Complete Flow](#the-complete-flow)
- [Projects](#projects)
  - [airbnbstayfinder (Frontend)](#airbnbstayfinder-frontend)
  - [airbnbstayfinder-scraper (Backend)](#airbnbstayfinder-scraper-backend)
- [Tech Stack](#tech-stack)
- [Quick Start with Docker Compose](#quick-start-with-docker-compose)
- [Local Development (without Docker)](#local-development-without-docker)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [How the Scraper Works](#how-the-scraper-works)
- [How the AI Analysis Works](#how-the-ai-analysis-works)
- [Database Schema](#database-schema)
- [API Communication](#api-communication)
- [Docker Architecture](#docker-architecture)
- [Lessons Learned](#lessons-learned)

---

## Overview

The problem: Searching for an Airbnb stay is tedious. You browse hundreds of listings, open each one, read the description, check the amenities, read reviews — and most of them don't match what you actually want.

The solution: **AirbnbStayFinder** automates this process:

1. You paste an Airbnb search URL and describe what you want in plain English
2. The system scrapes **all** listings from that search (not just the first 10)
3. For each listing, it fetches detailed information (description, amenities, reviews, etc.)
4. An AI analyzes each listing against your preferences and gives a 0-100 compatibility score
5. You review the results sorted by score — save what you like, skip the rest

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User's Browser                               │
│                     http://localhost:3000                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    airbnbstayfinder (Next.js 16)                      │
│                                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐               │
│  │ Server      │  │ Services     │  │ Repositories  │               │
│  │ Actions     │─►│ (business    │─►│ ┌───────────┐ │               │
│  │ (entry pts) │  │  logic)      │  │ │ HTTP Repo │─┼───► .NET Scraper
│  └─────────────┘  └──────────────┘  │ │ AI Repo   │─┼───► Ollama/OpenAI
│                                      │ │ Prisma    │─┼───► MySQL
│                                      │ └───────────┘ │               │
│                                      └───────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
┌──────────────────┐ ┌────────────┐ ┌────────────────┐
│ airbnbstayfinder  │ │   MySQL    │ │ Ollama/OpenAI  │
│ -scraper (.NET 8) │ │   8.0      │ │ (AI Provider)  │
│                    │ │            │ │                │
│ ┌────────────────┐│ │ Trips      │ │ deepseek-r1    │
│ │ Airbnb GraphQL ││ │ Stays      │ │ gpt-5-mini     │
│ │ API (via TLS   ││ │ History    │ │ llama3.1       │
│ │ impersonation) ││ │ Images     │ │ mistral        │
│ └────────────────┘│ │            │ │ ...            │
│                    │ │            │ │                │
│ ┌────────────────┐│ └────────────┘ └────────────────┘
│ │ Python Bridge  ││
│ │ (curl_cffi)    ││
│ └────────────────┘│
└──────────────────┘
```

---

## The Complete Flow

Here's what happens step by step when you click "Find Stays":

```
1. USER INPUT
   ├── Airbnb search URL (e.g., Manhattan, Apr 1-5, 2 guests)
   ├── User prompt ("quiet place, fast wifi, close to subway")
   ├── Currency (USD)
   └── AI model (deepseek-r1:1.5b)

2. FRONTEND → SCRAPER (search-by-url)
   ├── UrlParser extracts: location, dates, coordinates, filters
   ├── CurlImpersonateClient fetches Airbnb API key from homepage
   ├── CurlImpersonateClient discovers dynamic GraphQL hash
   ├── AirbnbHttpClient calls StaysSearch GraphQL API
   ├── Pagination: follows nextPageCursor until all pages fetched
   └── Returns: 169 listings with basic info (price, rating, images, coords)

3. FOR EACH LISTING (concurrency: 3)
   ├── Check if room_id already exists in DB → skip if yes
   │
   ├── FRONTEND → SCRAPER (search-by-id)
   │   ├── Fetches https://www.airbnb.com/rooms/{id}
   │   ├── Parses <script id="data-deferred-state-0"> embedded JSON
   │   ├── Extracts: description, amenities, house rules, highlights, host info
   │   └── Fetches all reviews via StaysPdpReviewsQuery API
   │
   ├── FRONTEND → AI (Ollama or OpenAI)
   │   ├── Sends: user prompt + search data + detailed data
   │   └── Receives: { score: 87, resume: "...", reasons: [...] }
   │
   └── FRONTEND → DATABASE
       └── Saves stay with AI analysis to MySQL

4. DISPLAY RESULTS
   ├── Grid of cards sorted by compatibility score
   ├── Each card: image, price, rating, AI score bar, AI summary
   └── User can Save (interested) or Skip (not interested)
```

---

## Projects

### airbnbstayfinder (Frontend)

The **Next.js 16** web application. Handles the UI, business logic orchestration, AI integration, and data persistence.

- **Tech:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma, Zod
- **Port:** 3000
- **[Full documentation →](airbnbstayfinder/README.md)**

### airbnbstayfinder-scraper (Backend)

The **.NET 8** scraper API. Reverse-engineers the Airbnb GraphQL API to fetch listings and detailed stay information.

- **Tech:** .NET 8, ASP.NET Core Minimal API, Python (curl_cffi), HtmlAgilityPack
- **Port:** 8002
- **[Full documentation →](airbnbstayfinder-scraper/README.md)**

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React 19 | Server Components, Server Actions, App Router |
| **Styling** | Tailwind CSS 4 | Utility-first CSS with dark theme |
| **Backend** | .NET 8 ASP.NET Core | Minimal API for Airbnb scraping |
| **TLS** | Python curl_cffi | Chrome TLS fingerprint impersonation |
| **Database** | MySQL 8 + Prisma 5 | Data persistence with type-safe ORM |
| **AI** | Ollama / OpenAI | Compatibility scoring and analysis |
| **Validation** | Zod 4 | Runtime schema validation |
| **Container** | Docker + Docker Compose | Multi-service orchestration |

---

## Quick Start with Docker Compose

The fastest way to run the entire project:

```bash
# 1. Clone the repository
git clone <repo-url>
cd airbnbstayfinder-airbnbscraper

# 2. Start all services
docker compose up --build
```

This starts 3 services:
- **MySQL** on port `3306`
- **Scraper** on port `8002`
- **Frontend** on port `3000`

Open `http://localhost:3000` in your browser.

### With AI (Ollama)

To use local AI, make sure Ollama is running on your host machine:

```bash
# Install Ollama (macOS)
brew install ollama

# Pull a model
ollama pull deepseek-r1:1.5b

# Start Ollama
ollama serve
```

Docker Compose automatically connects to Ollama on your host via `host.docker.internal:11434`.

### With AI (OpenAI)

```bash
OPENAI_API_KEY=sk-... AI_PROVIDER=openai AI_MODEL=gpt-5-mini docker compose up --build
```

---

## Local Development (without Docker)

### 1. Start MySQL

```bash
# Using Docker for just the database
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=airbnbstayfinder \
  -p 3306:3306 \
  mysql:8.0
```

### 2. Start the Scraper

```bash
cd airbnbstayfinder-scraper

# Install Python dependency (one time)
pip3 install curl_cffi

# Run the .NET API
dotnet run --project src/AirbnbScraper.Api
```

### 3. Start the Frontend

```bash
cd airbnbstayfinder

# Copy and configure .env
cp .env.example .env
# Edit .env with your DATABASE_URL

# Install dependencies
pnpm install

# Setup database
npx prisma generate
npx prisma db push

# Start dev server
pnpm dev
```

### 4. Start Ollama (optional)

```bash
ollama pull deepseek-r1:1.5b
ollama serve
```

---

## Environment Variables

### Frontend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | MySQL connection string |
| `AIRBNB_HTTP_BASE_URL` | `http://localhost:8002` | Scraper API URL |
| `AI_PROVIDER` | `ollama` | AI provider: `ollama` or `openai` |
| `AI_MODEL` | `deepseek-r1:1.5b` | Model name for the selected provider |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Ollama server URL |
| `OPENAI_API_KEY` | — | OpenAI API key (only for `openai` provider) |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | OpenAI API URL |

### Docker Compose (.env or inline)

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_PROVIDER` | `ollama` | AI provider |
| `AI_MODEL` | `deepseek-r1:1.5b` | AI model |
| `OLLAMA_BASE_URL` | `http://host.docker.internal:11434` | Ollama URL (host machine) |
| `OPENAI_API_KEY` | — | OpenAI key |

---

## Project Structure

```
airbnbstayfinder-airbnbscraper/
│
├── airbnbstayfinder/                # Next.js 16 frontend
│   ├── app/                         # App Router (pages, layouts)
│   ├── components/                  # Shared UI components
│   ├── features/                    # Feature modules
│   │   ├── airbnbstay/              #   Stay search, AI analysis, cards
│   │   ├── search-history/          #   Search history tracking
│   │   └── trip/                    #   Trip management
│   ├── lib/                         # Utilities (Prisma, cn)
│   ├── prisma/                      # Schema + migrations
│   ├── public/                      # Static assets
│   ├── Dockerfile                   # Frontend Docker build
│   └── package.json
│
├── airbnbstayfinder-scraper/        # .NET 8 scraper API
│   ├── src/
│   │   ├── AirbnbScraper.Api/       #   Minimal API endpoints
│   │   ├── AirbnbScraper.Application/ # Service + interfaces
│   │   ├── AirbnbScraper.Domain/    #   Entities, value objects
│   │   └── AirbnbScraper.Infrastructure/ # HTTP, mapping, parsing
│   ├── scripts/
│   │   └── curl_bridge.py           #   Python TLS bridge
│   ├── Dockerfile                   # Scraper Docker build
│   └── AirbnbScraper.sln
│
├── docker-compose.yml               # Full stack orchestration
└── README.md                        # This file
```

---

## Key Features

### 1. Intelligent Search

Paste any Airbnb search URL — the system extracts all search parameters (location, dates, price range, amenities, coordinates) and fetches **all** available listings, not just the first page.

<p align="center">
  <img src="public/images/airbnb-url.png" alt="Copy any Airbnb search URL" width="700" />
  <br/>
  <em>Copy any Airbnb search URL with your filters applied</em>
</p>

<p align="center">
  <img src="public/images/dashboard-find.png" alt="Dashboard search form" width="700" />
  <br/>
  <em>Paste the URL, describe your preferences, and click Find Stays</em>
</p>

### 2. AI-Powered Analysis

Each listing is analyzed by an AI against your natural language description. The AI considers: listing description, amenities, house rules, reviews, location, price, and more.

<p align="center">
  <img src="public/images/console-output.png" alt="Console output during processing" width="500" />
  <br/>
  <em>Real-time processing: scraping, fetching details, and AI analysis for each listing</em>
</p>

### 3. Tinder-like Review

Review stays in a beautiful grid layout with AI compatibility scores. Save the ones you're interested in, skip the rest.

<p align="center">
  <img src="public/images/to-review-stays-grid.png" alt="Stays grid with AI scores" width="700" />
  <br/>
  <em>Each stay shows price, rating, AI compatibility score, and AI-generated summary</em>
</p>

### 4. Saved & Skipped Stays

Come back later to your saved stays or review the skipped ones.

<p align="center">
  <img src="public/images/saved-stays.png" alt="Saved stays" width="700" />
  <br/>
  <em>Saved stays — your shortlist of interesting accommodations</em>
</p>

<p align="center">
  <img src="public/images/skipped-stays.png" alt="Skipped stays" width="700" />
  <br/>
  <em>Skipped stays — dismissed listings you can revisit</em>
</p>

### 5. Landing Page

A complete marketing landing page showcasing the product features.

<p align="center">
  <img src="public/images/airbnbstayfinderlp.png" alt="Landing page" width="400" />
  <br/>
  <em>Full landing page with hero, features, demo, FAQ, and more</em>
</p>

---

## How the Scraper Works

The scraper reverse-engineers Airbnb's internal GraphQL API:

1. **TLS Impersonation** — Uses `curl_cffi` (Python) to make HTTP requests with Chrome's exact TLS fingerprint, bypassing bot detection
2. **API Key Extraction** — Fetches the Airbnb homepage and extracts the API key from the HTML
3. **Dynamic Hash Discovery** — Discovers the current GraphQL operation hash by traversing Airbnb's JavaScript bundles (homepage → asyncRequire bundle → StaysSearchRoute module → operationId hash)
4. **GraphQL Search** — Calls `StaysSearch` with all filters, automatically paginating through results
5. **Detail Fetching** — Loads individual listing pages and parses the embedded JSON data
6. **Review Fetching** — Calls `StaysPdpReviewsQuery` to get all reviews in batches of 50

For a deep dive, see the [scraper README](airbnbstayfinder-scraper/README.md).

---

## How the AI Analysis Works

For each listing, the AI receives:

**System prompt:**
> You are a strict Airbnb listing matcher and summarizer. Return ONLY valid JSON with keys: isCompatibleWithUserWants, compatibilityScore, resume, reasons.

**User prompt:**
> User request: "quiet place, fast wifi, close to subway"
> Listing JSON: { search data... }
> Listing JSON (by id): { detailed data with amenities, reviews, etc. }

**AI response:**
```json
{
  "isCompatibleWithUserWants": true,
  "compatibilityScore": 87,
  "resume": "Modern studio in Midtown, 2 min from subway. Fast WiFi confirmed in amenities. Reviews mention it's quiet despite the location.",
  "reasons": [
    "Located 2 minutes from nearest subway station",
    "WiFi listed in amenities with 'dedicated workspace'",
    "Multiple reviews mention quiet neighborhood"
  ]
}
```

The AI repo is abstracted behind an interface, allowing easy switching between Ollama (local, free) and OpenAI (cloud, paid) via the `AI_PROVIDER` env var.

---

## Database Schema

```
┌──────────────┐       ┌────────────────────┐       ┌──────────────────┐
│     Trip     │       │    AirbnbStay       │       │  AirbnbStayImage │
├──────────────┤       ├────────────────────┤       ├──────────────────┤
│ id (uuid)    │──┐    │ id (uuid)          │──┐    │ id (uuid)        │
│ name         │  │    │ room_id (unique)   │  │    │ stayId (FK)      │
│ slug (unique)│  ├───►│ title              │  ├───►│ imageUrl         │
│ createdAt    │  │    │ subTitle           │  │    └──────────────────┘
└──────────────┘  │    │ price              │  │
                  │    │ rating             │  │
┌──────────────┐  │    │ isCompatible       │  │
│SearchHistory │  │    │ compatibilityScore │  │
├──────────────┤  │    │ resume (TEXT)       │  │
│ id (uuid)    │  │    │ interest (nullable) │  │
│ url (TEXT)   │  │    │ tripId (FK) ───────┘  │
│ currency     │  │    │ createdAt            │
│ userPrompt   │  │    │ updatedAt            │
│ aiModel      │  │    └────────────────────┘
│ tripId (FK)──┘  │
│ resultCount  │  │
│ createdAt    │  │
└──────────────┘  │
                  │
```

---

## API Communication

The frontend communicates with the scraper via two HTTP endpoints:

### Search by URL
```
POST http://scraper:8002/api/v1/search-by-url
Content-Type: application/json

{ "url": "https://www.airbnb.com/s/Manhattan/homes?checkin=...", "currency": "USD" }

→ { "success": true, "count": 169, "data": [...listings] }
```

### Search by ID
```
POST http://scraper:8002/api/v1/search-by-id
Content-Type: application/json

{ "stayId": "12345678", "currency": "USD", "adults": 2 }

→ { "success": true, "count": 1, "data": [...detailed listing with reviews] }
```

The response format is compatible with pyairbnb-api, the Python scraper that was originally used during development.

---

## Docker Architecture

The `docker-compose.yml` defines 3 services:

```yaml
services:
  mysql:          # MySQL 8.0 database
    ports: 3306
    healthcheck: mysqladmin ping

  scraper:        # .NET 8 API + Python curl_cffi
    ports: 8002
    depends_on: mysql (healthy)

  frontend:       # Next.js 16 (standalone build)
    ports: 3000
    depends_on: mysql (healthy), scraper (started)
    environment:
      DATABASE_URL: mysql://root:rootpassword@mysql:3306/airbnbstayfinder
      AIRBNB_HTTP_BASE_URL: http://scraper:8002
      OLLAMA_BASE_URL: http://host.docker.internal:11434
```

### Build Details

**Scraper Dockerfile** (multi-stage):
1. `dotnet/sdk:8.0` — Restore, build, publish
2. `dotnet/aspnet:8.0` — Runtime + Python 3 + curl_cffi

**Frontend Dockerfile** (multi-stage):
1. `node:20-alpine` deps — `npm ci`
2. `node:20-alpine` builder — Prisma generate + `npm run build` (standalone)
3. `node:20-alpine` runner — Standalone output + Prisma client + entrypoint

The frontend's `docker-entrypoint.sh` runs `npx prisma db push --skip-generate` on startup to apply the schema to the database before starting the Node.js server.

---

## Lessons Learned

This project was built as a study exercise. Here are the key takeaways:

### Architecture & Design
- **Feature-based architecture** keeps related code together and scales better than layer-based organization
- **Clean Architecture** in the .NET project makes it trivial to swap implementations (e.g., Python bridge → native TLS library)
- **Repository pattern** with factory (AI repo) enables seamless provider switching via env vars

### Scraping
- **TLS fingerprinting** is the #1 challenge when scraping modern websites. `curl_cffi` with Chrome impersonation is the current best solution
- **Dynamic hash discovery** makes the scraper resilient to Airbnb deploys
- **`priceFilterNumNights`** was the key missing parameter that caused the scraper to return only 10 results instead of 169
- Cursor-based pagination is essential — Airbnb limits search results per page

### Frontend
- **React `{0 && <jsx>}`** renders the number `0`, not nothing. Always use explicit boolean checks: `{value != null && value > 0 && <jsx>}`
- **CSS Flex** for equal-height cards: parent `flex`, card `flex flex-col h-full`, variable content `flex-1`
- **Server Actions** in Next.js are powerful for full-stack features without writing API routes
- **`force-dynamic`** on pages that always need fresh data prevents stale server-side caches

### AI Integration
- Local models (Ollama) are good enough for structured JSON output with careful prompting
- The `temperature: 0.3` setting produces more consistent, less creative responses — ideal for structured analysis
- Truncating large payloads before sending to AI (`pickSmall`) prevents token overflow
- Concurrency control (asyncPool) is crucial when calling AI for 100+ listings

### Docker
- **Multi-stage builds** dramatically reduce image size
- **`output: "standalone"`** in Next.js is essential for Docker — it creates a self-contained server
- **Health checks** on MySQL prevent the frontend from crashing on startup before the database is ready
- `host.docker.internal` bridges Docker containers to host-machine services like Ollama

# AirbnbStayFinder

A **Next.js 16** web application that helps users find the best Airbnb stays using AI-powered compatibility analysis. Paste an Airbnb search URL, describe what you're looking for, and the app will scrape all listings, analyze each one with AI, and present them sorted by compatibility score.

> **Study Project** — Built for learning purposes, exploring Next.js 16 App Router, React 19 Server Components, Server Actions, feature-based architecture, Prisma ORM, and AI integration (Ollama/OpenAI).

---

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
  - [The Flow](#the-flow)
  - [AI Compatibility Analysis](#ai-compatibility-analysis)
- [Architecture](#architecture)
  - [Feature-Based Architecture](#feature-based-architecture)
  - [Data Flow](#data-flow)
- [Project Structure](#project-structure)
- [Features in Detail](#features-in-detail)
  - [Trip Management](#trip-management)
  - [Stay Search](#stay-search)
  - [Stay Review (Tinder-like)](#stay-review-tinder-like)
  - [Search History](#search-history)
- [Database Schema](#database-schema)
- [AI Integration](#ai-integration)
  - [Ollama (Local)](#ollama-local)
  - [OpenAI](#openai)
  - [AI Response Schema](#ai-response-schema)
- [Tech Stack](#tech-stack)
- [Setup & Running](#setup--running)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Local Development](#local-development)
  - [Docker](#docker)
- [Key Technical Details](#key-technical-details)

---

## Features

- **Paste & Search** — Paste any Airbnb search URL and get all listings analyzed automatically
- **AI Compatibility Scoring** — Each listing gets a 0-100 compatibility score based on your natural language description
- **Trip Organization** — Group searches and stays into trips
- **Tinder-like Review** — Swipe through stays: save interesting ones, skip the rest
- **Search History** — Re-run previous searches with one click
- **Saved & Skipped Views** — Separate pages for interested and not-interested stays
- **Dark Premium UI** — Glass morphism design with the Airbnb primary color (#ff5a5f)

---

## How It Works

### The Flow

```
┌───────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌─────────────┐
│  User pastes  │     │  .NET Scraper    │     │  AI (Ollama/    │     │   MySQL     │
│  Airbnb URL + │────►│  fetches all     │────►│  OpenAI) scores │────►│  stores     │
│  describes    │     │  listings        │     │  each listing   │     │  results    │
│  preferences  │     │  (search + detail│     │  vs user prompt │     │             │
└───────────────┘     └──────────────────┘     └─────────────────┘     └─────────────┘
```

1. **User Input** — The user pastes an Airbnb search URL, selects a currency, writes a natural language prompt describing their ideal stay (e.g., "I need a quiet place with fast wifi for remote work, close to subway"), and picks their AI model
2. **Scraping** — The frontend calls the .NET scraper API (`/api/v1/search-by-url`) which returns all listings from that search
3. **AI Analysis** — For each listing, the frontend:
   - Fetches detailed info via `/api/v1/search-by-id`
   - Sends both the search data and detailed data to the AI along with the user's prompt
   - Gets back a compatibility score (0-100), a resume, and reasons
4. **Storage** — Each analyzed stay is saved to MySQL with its AI analysis
5. **Review** — The user sees all stays in a grid, sorted by score, and can save or skip each one

### AI Compatibility Analysis

The AI receives:
- **User prompt** — Natural language description of what they want
- **Listing data from search** — Price, rating, host info, images, coordinates
- **Listing data from detail** — Full description, amenities, house rules, highlights, reviews, location details

And returns:
```json
{
  "isCompatibleWithUserWants": true,
  "compatibilityScore": 87,
  "resume": "This modern studio in Midtown offers fast WiFi and is 2 minutes from the subway...",
  "reasons": ["Close to subway", "Fast WiFi mentioned in amenities", "Quiet neighborhood based on reviews"]
}
```

---

## Architecture

### Feature-Based Architecture

Instead of organizing by technical layer (components/, services/, etc.), the project uses **feature-based architecture** where each feature is self-contained:

```
features/
├── airbnbstay/          # Core feature: stay search, AI analysis, display
│   ├── actions/         # Server Actions (Next.js "use server")
│   ├── components/      # React components for this feature
│   ├── domain/          # Types, schemas, mappers
│   ├── repo/            # Data access (HTTP, Prisma, AI)
│   └── services/        # Business logic
├── search-history/      # Search history feature
│   ├── components/
│   └── *.ts             # Actions, repo, types
└── trip/                # Trip management feature
    ├── actions/
    ├── components/
    ├── domain/
    └── repo/
```

### Data Flow

```
Server Action (action)
    ↓ calls
Service (service)
    ↓ uses
Repository (repo)
    ↓ talks to
External System (HTTP API / Database / AI)
```

- **Actions** — Next.js Server Actions (`"use server"`). Entry points for client-side calls. Handle form data, call services, revalidate paths
- **Services** — Business logic orchestration. Coordinate multiple repos (HTTP → AI → Prisma)
- **Repos** — Data access abstraction. Interfaces + implementations:
  - `http/` — Calls the .NET scraper API
  - `prisma.*` — Database operations via Prisma
  - `ai/` — AI provider communication (Ollama or OpenAI)
- **Domain** — Types, schemas (Zod), and mappers

---

## Project Structure

```
airbnbstayfinder/
├── app/                                  # Next.js App Router
│   ├── layout.tsx                        # Root layout (html, body)
│   ├── page.tsx                          # Landing page
│   ├── globals.css                       # Global styles + dark theme + animations
│   ├── api/airbnbstay/route.ts           # API route (if needed)
│   └── dashboard/
│       ├── layout.tsx                    # Dashboard layout (sidebar + SVG bg)
│       ├── page.tsx                      # Main dashboard (search + pending stays)
│       ├── interested/page.tsx           # Saved stays page
│       └── not-interested/page.tsx       # Skipped stays page
│
├── components/                           # Shared components
│   ├── dashboard-navbar.tsx              # 76px glass sidebar navigation
│   ├── trip-provider.tsx                 # Trip context provider
│   ├── ui/button.tsx                     # Reusable button component
│   └── landing/                          # Landing page components
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── Demo.tsx
│       ├── HowItWorks.tsx
│       ├── ProblemSolution.tsx
│       ├── FAQ.tsx
│       ├── UseCases.tsx
│       ├── FinalCTA.tsx
│       ├── Footer.tsx
│       ├── Navbar.tsx
│       ├── TrustStrip.tsx
│       └── ui/                           # Landing-specific UI primitives
│           ├── Badge.tsx
│           ├── Button.tsx
│           ├── Card.tsx
│           ├── Container.tsx
│           └── Section.tsx
│
├── features/
│   ├── airbnbstay/                       # Core feature
│   │   ├── actions/
│   │   │   ├── find-airbnbstay-by-url.action.ts    # Server Action: search + AI analysis
│   │   │   └── set-airbnbstay-interest.action.ts   # Server Action: save/skip a stay
│   │   ├── components/
│   │   │   ├── airbnbstay-card.tsx                  # Stay card (image, price, AI score)
│   │   │   ├── airbnbstay-form.tsx                  # Search form (URL, currency, prompt)
│   │   │   ├── get-airbnbstay.tsx                   # Main orchestrator component
│   │   │   ├── null-interest-airbnbstay-grid-form.tsx  # Pending stays grid
│   │   │   ├── interested-airbnbstay-grid-form.tsx     # Saved stays grid
│   │   │   └── no-interest-airbnbstay-grid-form.tsx    # Skipped stays grid
│   │   ├── domain/
│   │   │   ├── airbnbstay.ts                        # AirbnbStay type
│   │   │   ├── airbnbstay.ai.ts                     # AI match schema (Zod)
│   │   │   ├── airbnbstay.raw.ts                    # Raw API response types
│   │   │   ├── airbnbstay.ia.raw.ts                 # Action input types
│   │   │   └── airbnbstay.mapper.ts                 # Raw → Domain mappers
│   │   ├── repo/
│   │   │   ├── airbnbstay.repo.ts                   # Repo interface
│   │   │   ├── prisma.airbnbstay.repo.ts            # Prisma implementation
│   │   │   ├── http/
│   │   │   │   └── http.airbnbstay.repo.ts          # HTTP client to .NET scraper
│   │   │   └── ai/
│   │   │       ├── airbnbstay.ai.repo.ts            # AI repo interface
│   │   │       ├── ai.factory.ts                    # Factory: env → Ollama or OpenAI
│   │   │       ├── ollama.airbnbstay.ai.repo.ts     # Ollama implementation
│   │   │       └── openai.airbnbstay.ai.repo.ts     # OpenAI implementation
│   │   └── services/
│   │       ├── get-airbnbstay-by-url.service.ts     # Main service: scrape → AI → save
│   │       ├── set-airbnbstay-interest.service.ts   # Save/skip logic
│   │       └── verify-airbnbstay-exists.service.ts  # Dedup check
│   │
│   ├── search-history/                   # Search history feature
│   │   ├── components/
│   │   │   └── search-history-list.tsx              # History list with re-run buttons
│   │   ├── search-history.ts                        # Type definition
│   │   ├── search-history.actions.ts                # Server Actions
│   │   └── search-history.repo.ts                   # Prisma repo
│   │
│   └── trip/                             # Trip management feature
│       ├── actions/
│       │   └── trip.actions.ts                      # CRUD Server Actions
│       ├── components/
│       │   └── trip-selector.tsx                     # Trip dropdown + create
│       ├── domain/
│       │   └── trip.ts                              # Trip type
│       └── repo/
│           ├── trip.repo.ts                         # Repo interface
│           └── prisma.trip.repo.ts                  # Prisma implementation
│
├── lib/
│   ├── cn.ts                             # clsx + tailwind-merge utility
│   └── db/prisma.ts                      # Prisma client singleton
│
├── prisma/
│   ├── schema.prisma                     # Database schema
│   └── migrations/                       # Migration history
│
├── public/
│   └── images/                           # Landing page images
│
├── Dockerfile                            # Multi-stage Docker build
├── docker-entrypoint.sh                  # Prisma migrate + start
├── next.config.ts                        # Next.js config (standalone output)
├── package.json                          # Dependencies
└── tsconfig.json                         # TypeScript config
```

---

## Features in Detail

### Trip Management

Trips are organizational containers for stays and searches. Users create a trip (e.g., "NYC April 2026") and all subsequent searches and stays are grouped under it.

- **TripSelector component** — Dropdown to switch between trips or create a new one
- **TripProvider** — React context that shares the selected trip across components
- **Prisma model** — `Trip { id, name, slug, stays[], searchHistory[] }`

### Stay Search

The search form collects:
1. **Airbnb URL** — Any valid Airbnb search URL (the .NET scraper extracts all filters)
2. **Currency** — USD, BRL, EUR, etc.
3. **User Prompt** — Natural language description of ideal stay
4. **AI Model** — Model to use for analysis (e.g., `deepseek-r1:1.5b`, `gpt-5-mini`)

Processing happens with **concurrency control** (`asyncPool` with limit 3) to avoid overwhelming the scraper/AI:
- For each listing: check if already exists → fetch detail → call AI → save to DB

### Stay Review (Tinder-like)

After searching, stays appear in a **4-column grid** sorted by compatibility score. Each card shows:
- Listing image
- Price (with discount if available)
- Rating and review count
- AI compatibility score (0-100) with color-coded bar
- AI-generated summary
- Save/Skip buttons

Users can:
- **Save** (interested) — Moves to the "Saved Stays" page
- **Skip** (not interested) — Moves to the "Skipped Stays" page
- All pending stays remain on the main dashboard

### Search History

Every search is recorded with: URL, currency, prompt, AI model, result count, and timestamp. The history list shows recent searches as compact pill buttons that can be clicked to pre-fill the search form.

---

## Database Schema

```prisma
model Trip {
  id             String          @id @default(uuid())
  name           String
  slug           String          @unique
  stays          AirbnbStay[]
  searchHistory  SearchHistory[]
  createdAt      DateTime        @default(now())
}

model AirbnbStay {
  id                   String  @id @default(uuid())
  room_id              String  @unique
  title                String
  subTitle             String
  isFreeCancellation   Boolean
  price                Float
  priceWithoutDiscount Float?
  rating               Float?
  ratingCount          Int?
  personCapacity       Int?
  hostName             String?
  hostId               String?
  images               AirbnbStayImage[]
  isCompatible         Boolean
  compatibilityScore   Int
  resume               String  @db.Text
  interest             Boolean?          // null = pending, true = saved, false = skipped
  tripId               String?
  trip                 Trip?   @relation(...)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

model SearchHistory {
  id          String   @id @default(uuid())
  url         String   @db.Text
  currency    String
  userPrompt  String   @db.Text
  aiModel     String
  tripId      String?
  trip        Trip?    @relation(...)
  resultCount Int      @default(0)
  createdAt   DateTime @default(now())
}

model AirbnbStayImage {
  id       String @id @default(uuid())
  stayId   String?
  stay     AirbnbStay? @relation(...)
  imageUrl String
}
```

Key design decisions:
- `interest: Boolean?` — Three states: `null` (pending review), `true` (saved), `false` (skipped)
- `room_id: @unique` — Prevents duplicate stays from repeated searches
- `resume: @db.Text` — AI summaries can be long, so stored as TEXT not VARCHAR
- `priceWithoutDiscount: Float?` — Mapped to `priceDiscount` in the frontend domain type

---

## AI Integration

The app supports two AI providers through a **factory pattern**:

### Ollama (Local)

Uses the `/api/chat` endpoint (falls back to `/api/generate` for models without chat support):

```typescript
// ollama.airbnbstay.ai.repo.ts
const res = await fetch(baseUrl + "/api/chat", {
  body: JSON.stringify({
    model: "deepseek-r1:1.5b",
    messages: [
      { role: "system", content: "You are a strict Airbnb listing matcher..." },
      { role: "user", content: "User request: ...\nListing JSON: ..." }
    ],
    stream: false,
    options: { temperature: 0.3, top_p: 0.95, num_predict: 96 }
  })
})
```

### OpenAI

Uses the `/responses` endpoint with JSON Schema structured output:

```typescript
// openai.airbnbstay.ai.repo.ts
const res = await fetch(baseUrl + "/responses", {
  body: JSON.stringify({
    model: "gpt-5-mini",
    input: [{ role: "system", content: "..." }, { role: "user", content: "..." }],
    text: {
      format: {
        type: "json_schema",
        name: "airbnb_match",
        strict: true,
        schema: { /* AiMatch schema */ }
      }
    }
  })
})
```

### AI Response Schema

Validated with Zod:

```typescript
const AiMatchSchema = z.object({
  isCompatibleWithUserWants: z.boolean(),
  compatibilityScore: z.number().int().min(0).max(100),
  resume: z.string(),
  reasons: z.array(z.string())
})
```

The factory (`ai.factory.ts`) reads `AI_PROVIDER` from env and creates the appropriate repo implementation.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library with Server Components |
| **TypeScript 5** | Type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **Prisma 5.10** | ORM for MySQL |
| **MySQL 8** | Database |
| **Zod 4** | Runtime schema validation |
| **react-icons** | Icon library |
| **clsx + tailwind-merge** | Conditional class merging |
| **Ollama / OpenAI** | AI providers |

---

## Setup & Running

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (package manager)
- [MySQL 8](https://dev.mysql.com/downloads/)
- [Ollama](https://ollama.ai/) (optional, for local AI)
- The [airbnbstayfinder-scraper](../airbnbstayfinder-scraper/) running on port 8002

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=mysql://root:password@127.0.0.1:3306/airbnbstayfinder

# Scraper API
AIRBNB_HTTP_BASE_URL=http://localhost:8002

# AI Provider: "ollama" or "openai"
AI_PROVIDER=ollama
AI_MODEL=deepseek-r1:1.5b

# Ollama (when AI_PROVIDER=ollama)
OLLAMA_BASE_URL=http://127.0.0.1:11434

# OpenAI (when AI_PROVIDER=openai)
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
```

### Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client
npx prisma generate

# 3. Push schema to database
npx prisma db push

# 4. Start dev server
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Docker

```bash
docker build -t airbnbstayfinder .
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://root:password@host:3306/airbnbstayfinder \
  -e AIRBNB_HTTP_BASE_URL=http://scraper:8002 \
  airbnbstayfinder
```

The Dockerfile uses a **multi-stage build**:
1. **deps** — `node:20-alpine`, installs dependencies with `npm ci`
2. **builder** — Generates Prisma client, builds Next.js (standalone output)
3. **runner** — Minimal runtime: standalone server + Prisma client + migrations on startup

The `docker-entrypoint.sh` runs `npx prisma db push --skip-generate` before starting `node server.js`.

---

## Key Technical Details

| Topic | Detail |
|-------|--------|
| **Server Components** | Dashboard pages are async Server Components that fetch data at the top level and pass to client components |
| **Server Actions** | `findAirbnbStayByUrl` and `setAirbnbStayInterest` are `"use server"` functions called directly from client components |
| **Concurrency Control** | `asyncPool` limits concurrent AI calls to 3 to avoid overwhelming Ollama |
| **Deduplication** | `VerifyAirbnbstayExistsService` checks `room_id` before processing to skip already-analyzed stays |
| **Price Display Bug Fix** | `{stay.priceDiscount != null && stay.priceDiscount > 0 && ...}` instead of `{stay.priceDiscount && ...}` to avoid React rendering the number `0` |
| **Null Safety** | Optional chaining on coordinates (`d.coordinates?.latitude ?? 0`) and null guard in `mapFromPrisma` |
| **Standalone Output** | `next.config.ts` has `output: "standalone"` for Docker-optimized builds |
| **Path Revalidation** | After mutations, `revalidatePath("/dashboard")` refreshes Server Component data |

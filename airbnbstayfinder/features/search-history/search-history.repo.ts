import prisma from "@/lib/db/prisma"
import { SearchHistory } from "./search-history"

export async function createSearchHistory(input: {
    url: string
    currency: string
    userPrompt: string
    aiModel: string
    tripId: string | null
    resultCount: number
}): Promise<void> {
    await prisma.searchHistory.create({
        data: {
            url: input.url,
            currency: input.currency,
            userPrompt: input.userPrompt,
            aiModel: input.aiModel,
            tripId: input.tripId || null,
            resultCount: input.resultCount,
        },
    })
}

export async function findRecentSearches(limit = 10): Promise<SearchHistory[]> {
    const rows = await prisma.searchHistory.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { trip: { select: { name: true } } },
    })
    return rows.map((r) => ({
        id: r.id,
        url: r.url,
        currency: r.currency,
        userPrompt: r.userPrompt,
        aiModel: r.aiModel,
        tripId: r.tripId,
        tripName: r.trip?.name,
        resultCount: r.resultCount,
        createdAt: r.createdAt,
    }))
}

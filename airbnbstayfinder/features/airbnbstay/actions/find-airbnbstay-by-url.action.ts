"use server"

import { getAirbnbStayByUrlService } from "@/features/airbnbstay/services/get-airbnbstay-by-url.service"
import { makeHttpAirbnbStayRepo } from "@/features/airbnbstay/repo/http/http.airbnbstay.repo"
import { makeAirbnbStayAiRepoFromEnv } from "@/features/airbnbstay/repo/ai/ai.factory"
import { FindByUrlAction } from "@/features/airbnbstay/domain/airbnbstay.ia.raw"
import { AirbnbStay } from "@/features/airbnbstay/domain/airbnbstay"
import { revalidatePath } from "next/cache"
import { createSearchHistory } from "@/features/search-history/search-history.repo"

export async function findAirbnbStayByUrl(findByUrlAction: FindByUrlAction): Promise<AirbnbStay[]> {
    const { url, currency, userPrompt, aiModel, tripId } = findByUrlAction

    const httpBaseUrl = process.env.AIRBNB_HTTP_BASE_URL ?? "http://localhost:8002"
    const httpRepo = makeHttpAirbnbStayRepo(httpBaseUrl)
    const aiRepo = makeAirbnbStayAiRepoFromEnv(process.env)

    const airbnbStayList = await getAirbnbStayByUrlService(
        { httpRepo, aiRepo },
        { url, currency, userPrompt, aiModel, tripId }
    )

    await createSearchHistory({
        url,
        currency,
        userPrompt,
        aiModel,
        tripId: tripId || null,
        resultCount: airbnbStayList.length,
    })

    return airbnbStayList
}

export async function findAirbnbStayByUrlFromFormData(formData: FormData): Promise<void> {
    const url = String(formData.get("url") ?? "")
    const currency = String(formData.get("currency") ?? "")
    const userPrompt = String(formData.get("userPrompt") ?? "")
    const aiModel = String(formData.get("aiModel") ?? "")
    const tripId = String(formData.get("tripId") ?? "")

    if (!url || !currency || !userPrompt || !aiModel || !tripId) return

    await findAirbnbStayByUrl({ url, currency, userPrompt, aiModel, tripId } satisfies FindByUrlAction)
    revalidatePath("/dashboard")
}
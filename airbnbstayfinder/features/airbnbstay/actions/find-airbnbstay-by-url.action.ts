"use server"

import { getAirbnbStayByUrlService } from "@/features/airbnbstay/services/get-airbnbstay-by-url.service"
import { makeHttpAirbnbStayRepo } from "@/features/airbnbstay/repo/http.airbnbstay.repo"
import { makeAirbnbStayAiRepoFromEnv } from "@/features/airbnbstay/repo/ai.factory"

export async function findAirbnbStayByUrl(formData: FormData) {
    const url = formData.get("url")?.toString() ?? ""
    const currency = formData.get("currency")?.toString() ?? ""
    const userPrompt = formData.get("userPrompt")?.toString() ?? ""
    const aiModel = formData.get("aiModel")?.toString() ?? ""

    if (!url || !currency || !userPrompt || !aiModel) return []

    const httpBaseUrl = process.env.AIRBNB_HTTP_BASE_URL ?? "http://localhost:8001"

    const httpRepo = makeHttpAirbnbStayRepo(httpBaseUrl)
    const aiRepo = makeAirbnbStayAiRepoFromEnv(process.env)

    return getAirbnbStayByUrlService(
        { httpRepo, aiRepo },
        { url, currency, userPrompt, aiModel }
    )
}
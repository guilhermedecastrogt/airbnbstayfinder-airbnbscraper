"use server"

import { getAirbnbStayByUrlService } from "@/features/airbnbstay/services/get-airbnbstay-by-url.service"
import { makeHttpAirbnbStayRepo } from "@/features/airbnbstay/repo/http.airbnbstay.repo"
import { makeOllamaAirbnbStayAiRepo } from "@/features/airbnbstay/repo/ollama.airbnbstay.ai.repo"

export async function findAirbnbStayByUrl(formData: FormData) {
    const url = formData.get("url")?.toString() ?? ""
    const currency = formData.get("currency")?.toString() ?? ""
    const userPrompt = formData.get("userPrompt")?.toString() ?? ""

    if (!url || !currency || !userPrompt) return []

    const httpBaseUrl = process.env.AIRBNB_HTTP_BASE_URL ?? "http://localhost:8001"
    const ollamaUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434"

    const httpRepo = makeHttpAirbnbStayRepo(httpBaseUrl)
    const aiRepo = makeOllamaAirbnbStayAiRepo(ollamaUrl)

    return getAirbnbStayByUrlService({ httpRepo, aiRepo }, { url, currency, userPrompt })
}
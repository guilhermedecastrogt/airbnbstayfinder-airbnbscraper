import { AirbnbStayHttpRepo } from "@/features/airbnbstay/repo/airbnbstay.repo"
import { SearchByIdResponse, SearchByUrlResponse } from "@/features/airbnbstay/domain/airbnbstay.raw"

function coerceJsonIntFieldToString(text: string, field: string): string {
    const re = new RegExp(`"${field}"\\s*:\\s*(\\d+)`, "g")
    return text.replace(re, `"${field}":"$1"`)
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
    const res = await fetch(url, init)
    const text = await res.text()
    if (!res.ok) throw new Error("Request failed: " + res.status + " " + text)

    const fixed = coerceJsonIntFieldToString(text, "room_id")
    return JSON.parse(fixed) as T
}

export function makeHttpAirbnbStayRepo(baseUrl: string): AirbnbStayHttpRepo {
    return {
        async searchByUrl(input) {
            return fetchJson<SearchByUrlResponse>(baseUrl + "/api/v1/search-by-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: input.url,
                    currency: input.currency,
                    lenguage: input.language
                })
            })
        },
        async searchById(input) {
            return fetchJson<SearchByIdResponse>(baseUrl + "/api/v1/search-by-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stay_id: input.stayId })
            })
        }
    }
}
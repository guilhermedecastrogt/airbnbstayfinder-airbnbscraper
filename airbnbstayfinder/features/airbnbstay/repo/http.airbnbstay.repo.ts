import { AirbnbStayHttpRepo } from "@/features/airbnbstay/repo/airbnbstay.repo"
import { SearchByUrlResponse } from "@/features/airbnbstay/domain/airbnbstay.raw"

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
    const res = await fetch(url, init)
    if (!res.ok) throw new Error("Request failed: " + res.status)
    return (await res.json()) as T
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
            return fetchJson<unknown>(baseUrl + "/api/v1/search-by-id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stay_id: input.stayId })
            })
        }
    }
}
import { AirbnbStay } from "@/features/airbnbstay/domain/airbnbstay"
import { AirbnbStayHttpRepo } from "@/features/airbnbstay/repo/airbnbstay.repo"
import { AirbnbStayAiRepo } from "@/features/airbnbstay/repo/ai/airbnbstay.ai.repo"

import {
    mapImages,
    mapToOutputStay,
    getFreeCancellation,
    mapRawToAiListingByURL, mapRawToAiListingById
} from "@/features/airbnbstay/domain/airbnbstay.mapper"
import {SearchByIdResponse} from "@/features/airbnbstay/domain/airbnbstay.raw";
import {VerifyAirbnbstayExistsService} from "@/features/airbnbstay/services/verify-airbnbstay-exists.service";
//const fs = require("fs")

type TruncatedPayload = {
    truncated: true
    size: number
    head: string
}

function safeStringify(input: unknown): string {
    try {
        return JSON.stringify(input)
    } catch {
        return ""
    }
}

function pickSmall(input: unknown, maxChars: number): unknown {
    const s = safeStringify(input)
    if (!s) return input
    if (s.length <= maxChars) return input
    const out: TruncatedPayload = { truncated: true, size: s.length, head: s.slice(0, maxChars) }
    return out
}

async function asyncPool<T, R>(
    items: readonly T[],
    limit: number,
    fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
    const l = Math.max(1, Math.floor(limit))
    const ret: Array<Promise<R>> = []
    const executing = new Set<Promise<void>>()

    for (let i = 0; i < items.length; i++) {
        const p = Promise.resolve().then(() => fn(items[i], i))
        ret.push(p)

        if (items.length >= l) {
            const e: Promise<void> = p.then(
                () => {},
                () => {}
            )
            executing.add(e)
            e.then(
                () => executing.delete(e),
                () => executing.delete(e)
            )
            if (executing.size >= l) await Promise.race(executing)
        }
    }

    return Promise.all(ret)
}

export async function getAirbnbStayByUrlService(
    deps: { httpRepo: AirbnbStayHttpRepo; aiRepo: AirbnbStayAiRepo },
    input: { url: string; currency: string; userPrompt: string; aiModel: string }
): Promise<AirbnbStay[]> {
    const byUrl = await deps.httpRepo.searchByUrl({
        url: input.url,
        currency: input.currency,
        language: "en"
    })

    const concurrency = 3

    const out = await asyncPool(byUrl.data, concurrency, async (item) => {
        const roomId = String(item.room_id)

        const exists = await VerifyAirbnbstayExistsService(roomId)
        if (exists) return null

        const images = mapImages(item)
        const listing1 = mapRawToAiListingByURL(item)

        const byId: SearchByIdResponse = await deps.httpRepo.searchById({ stayId: roomId })
        const mapById = mapRawToAiListingById(byId)
        const listing2 = pickSmall(mapById, 100000)

        const ai = await deps.aiRepo.match({
            userPrompt: input.userPrompt,
            listing1,
            listing2,
            model: input.aiModel
        })

        return mapToOutputStay({
            title: item.title,
            subTitle: item.name,
            isFreeCancellation: getFreeCancellation(item),
            price: item.price.unit.amount,
            priceDiscount: item.price.unit.discount,
            rating: item.rating.value,
            ratingCount: item.passportData.ratingCount,
            hostName: item.passportData.name,
            images,
            isCompatible: ai.isCompatibleWithUserWants,
            compatibilityScore: ai.compatibilityScore,
            resume: ai.resume
        })
    })

    return out.filter((x): x is AirbnbStay => x !== null)
}
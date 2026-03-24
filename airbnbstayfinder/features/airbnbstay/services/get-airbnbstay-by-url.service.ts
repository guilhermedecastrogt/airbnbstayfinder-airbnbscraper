import { AirbnbStay } from "@/features/airbnbstay/domain/airbnbstay"
import { AirbnbStayHttpRepo, AirbnbStayRepo } from "@/features/airbnbstay/repo/airbnbstay.repo"
import { AirbnbStayAiRepo } from "@/features/airbnbstay/repo/ai/airbnbstay.ai.repo"

import {
    mapImages,
    mapToOutputStay,
    getFreeCancellation,
    mapRawToAiListingByURL, mapRawToAiListingById
} from "@/features/airbnbstay/domain/airbnbstay.mapper"
import { SearchByIdResponse } from "@/features/airbnbstay/domain/airbnbstay.raw";
import { VerifyAirbnbstayExistsService } from "@/features/airbnbstay/services/verify-airbnbstay-exists.service";
import { airbnbStayRepo } from "@/features/airbnbstay/repo/prisma.airbnbstay.repo";
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
                () => { },
                () => { }
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

var i = 0;

export async function getAirbnbStayByUrlService(
    deps: { httpRepo: AirbnbStayHttpRepo; aiRepo: AirbnbStayAiRepo },
    input: { url: string; currency: string; userPrompt: string; aiModel: string; tripId: string }
): Promise<AirbnbStay[]> {
    console.log("🚀 Starting getAirbnbStayByUrlService")
    console.log("  URL:", input.url)
    console.log("  Currency:", input.currency)
    console.log("  User Prompt:", input.userPrompt)
    console.log("  AI Model:", input.aiModel)
    console.log("  Trip ID:", input.tripId)

    console.log("\n📡 Fetching listings from Airbnb...")
    const byUrl = await deps.httpRepo.searchByUrl({
        url: input.url,
        currency: input.currency,
        language: "en"
    })
    console.log("✅ Found", byUrl.data.length, "listings")

    const concurrency = 3
    i = 0 // Reset counter
    console.log("\n⚙️  Processing listings with concurrency:", concurrency)

    const out = await asyncPool(byUrl.data, concurrency, async (item) => {
        const roomId = String(item.room_id)
        console.log("\n🔍 Processing room_id:", roomId, "(", item.title, ")")

        const exists = await VerifyAirbnbstayExistsService(roomId)
        if (exists) {
            console.log("  ⏭️  Already exists, skipping")
            return null
        }

        console.log("  📷 Mapping images...")
        const images = mapImages(item)
        const listing1 = mapRawToAiListingByURL(item)

        console.log("  📡 Fetching detailed info by ID...")
        const byId: SearchByIdResponse = await deps.httpRepo.searchById({ stayId: roomId })
        const mapById = mapRawToAiListingById(byId)
        const listing2 = pickSmall(mapById, 100000)

        console.log("  🤖 Calling AI for compatibility analysis...")
        const ai = await deps.aiRepo.match({
            userPrompt: input.userPrompt,
            listing1,
            listing2,
            model: input.aiModel
        })
        console.log("  ✨ AI Score:", ai.compatibilityScore, "| Compatible:", ai.isCompatibleWithUserWants)

        const personCapacity = byId.data?.[0]?.person_capacity

        const airbnbstay: AirbnbStay = {
            room_id: roomId,
            title: item.title,
            subTitle: item.name,
            isFreeCancellation: getFreeCancellation(item),
            price: item.price.unit.amount,
            priceDiscount: item.price.unit.discount,
            rating: item.rating.value,
            ratingCount: item.passportData.ratingCount,
            personCapacity: personCapacity ?? undefined,
            hostName: item.passportData.name,
            images,
            isCompatible: ai.isCompatibleWithUserWants,
            compatibilityScore: ai.compatibilityScore,
            resume: ai.resume,
            interest: null,
            tripId: input.tripId
        }

        console.log("  💾 Saving to database...")
        await airbnbStayRepo.create(airbnbstay)
        i++;
        console.log("  ✅ Saved:", airbnbstay.title, "(", i, "/", byUrl.data.length, ")")

        return mapToOutputStay({
            room_id: roomId,
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
            resume: ai.resume,
            interest: null
        })
    })

    const filtered = out.filter((x): x is AirbnbStay => x !== null)
    console.log("\n🎉 Service completed! Processed", filtered.length, "new stays")
    return filtered
}
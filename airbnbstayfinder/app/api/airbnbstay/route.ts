import { NextRequest, NextResponse } from "next/server"
import { findAirbnbStayByUrl } from "@/features/airbnbstay/actions/find-airbnbstay-by-url.action"
import { FindByUrlAction } from "@/features/airbnbstay/domain/airbnbstay.ia.raw"

export async function POST(req: NextRequest) {
    try {
        const body: unknown = await req.json()

        if (!isFindByUrlAction(body)) {
            return NextResponse.json(
                { error: "Invalid body. Expected: { url, currency, userPrompt, aiModel }" },
                { status: 400 }
            )
        }

        const response = await findAirbnbStayByUrl(body)
        return NextResponse.json(response, { status: 200 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

function isFindByUrlAction(v: unknown): v is FindByUrlAction {
    if (!v || typeof v !== "object") return false
    const o = v as Record<string, unknown>
    return (
        typeof o.url === "string" &&
        o.url.length > 0 &&
        typeof o.currency === "string" &&
        o.currency.length > 0 &&
        typeof o.userPrompt === "string" &&
        typeof o.aiModel === "string" &&
        o.aiModel.length > 0
    )
}

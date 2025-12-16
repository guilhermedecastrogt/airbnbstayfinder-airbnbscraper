import { AirbnbStayAiRepo, AirbnbMatchInput, AirbnbMatchOutput } from "@/features/airbnbstay/repo/airbnbstay.ai.repo"

type OpenAIOutputTextItem = { type: "output_text"; text: string }
type OpenAIContentItem = OpenAIOutputTextItem | { type: string }

type OpenAIMessage = {
    type: "message"
    role: "assistant" | "system" | "user"
    content: OpenAIContentItem[]
}

type OpenAIResponse = {
    output?: OpenAIMessage[]
    error?: unknown
}

function isOutputTextItem(x: OpenAIContentItem): x is OpenAIOutputTextItem {
    return x.type === "output_text" && typeof (x as OpenAIOutputTextItem).text === "string"
}

function getOutputText(res: OpenAIResponse): string {
    const out = res.output ?? []
    for (const item of out) {
        if (item.type !== "message") continue
        for (const c of item.content ?? []) {
            if (isOutputTextItem(c)) return c.text
        }
    }
    return ""
}

const schema = {
    type: "object",
    additionalProperties: false,
    required: ["isCompatibleWithUserWants", "compatibilityScore", "resume", "reasons"],
    properties: {
        isCompatibleWithUserWants: { type: "boolean" },
        compatibilityScore: { type: "integer", minimum: 0, maximum: 100 },
        resume: { type: "string" },
        reasons: { type: "array", items: { type: "string" } }
    }
} as const

export function makeOpenAiAirbnbStayAiRepo(cfg: {
    apiKey: string
    baseUrl?: string
    defaultModel: string
}): AirbnbStayAiRepo {
    const baseUrl = (cfg.baseUrl ?? "https://api.openai.com/v1").replace(/\/+$/, "")

    return {
        async match(input: AirbnbMatchInput): Promise<AirbnbMatchOutput> {
            const model = input.model ?? cfg.defaultModel

            const system = "You are a strict Airbnb listing matcher and summarizer."
            const user = [
                `User request:\n${input.userPrompt}`,
                `Listing JSON:\n${JSON.stringify(input.listing1)}`,
                `Listing JSON (by id):\n${JSON.stringify(input.listing2)}`
            ].join("\n\n")

            const body = {
                model,
                input: [
                    { role: "system", content: system },
                    { role: "user", content: user }
                ],
                text: {
                    format: {
                        type: "json_schema",
                        name: "airbnb_match",
                        strict: true,
                        schema
                    }
                }
            }

            const r = await fetch(`${baseUrl}/responses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${cfg.apiKey}`
                },
                body: JSON.stringify(body)
            })

            const raw = await r.text()
            if (!r.ok) throw new Error(`openai_error status=${r.status} body=${raw}`)

            const json = JSON.parse(raw) as OpenAIResponse
            const text = getOutputText(json)
            if (!text) throw new Error("openai_error empty_output_text")

            return JSON.parse(text) as AirbnbMatchOutput
        }
    }
}
import { AirbnbStayAiRepo } from "@/features/airbnbstay/repo/airbnbstay.repo"
import { AiMatchSchema, extractFirstJsonObject } from "@/features/airbnbstay/domain/airbnbstay.ai"

function buildSystemPrompt() {
    return [
        "You are a strict Airbnb listing matcher and summarizer.",
        "You will receive: (1) a user request, (2) a single Airbnb listing JSON, (3) extra listing JSON.",
        "Return ONLY valid JSON matching:",
        "{",
        '  "isCompatibleWithUserWants": boolean,',
        '  "compatibilityScore": number,',
        '  "resume": string,',
        '  "reasons": string[]',
        "}",
        "Rules:",
        "- Do not add extra keys.",
        "- Output must be valid JSON.",
        "- compatibilityScore must be an integer from 0 to 100.",
        "- resume must be 1-3 sentences and mention rating and ratingCount if available, bedroom shared, bathroom shared, and match status.",
        "- reasons must be evidence-based."
    ].join("\n")
}

function buildUserPrompt(userPrompt: string, listing1: unknown, listing2: unknown) {
    return [
        "User request:",
        userPrompt,
        "",
        "Listing JSON:",
        JSON.stringify(listing1),
        "",
        "Listing JSON (by id):",
        JSON.stringify(listing2)
    ].join("\n")
}

async function callOllamaChat(ollamaUrl: string, system: string, user: string, options: any) {
    const res = await fetch(ollamaUrl + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "deepseek-r1:1.5b",
            messages: [
                { role: "system", content: system },
                { role: "user", content: user }
            ],
            stream: false,
            options
        })
    })
    const json = await res.json()
    const out = typeof json?.message?.content === "string" ? json.message.content : ""
    return out
}

async function callOllamaGenerate(ollamaUrl: string, system: string, user: string, options: any) {
    const res = await fetch(ollamaUrl + "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "deepseek-r1:1.5b",
            prompt: [system, user].join("\n\n"),
            stream: false,
            options
        })
    })
    const json = await res.json()
    const out = typeof json?.response === "string" ? json.response : ""
    return out
}

export function makeOllamaAirbnbStayAiRepo(ollamaUrl: string): AirbnbStayAiRepo {
    const system = buildSystemPrompt()
    const options = { temperature: 0.3, top_p: 0.95, num_predict: 96 }

    return {
        async match(input) {
            const user = buildUserPrompt(input.userPrompt, input.listing1, input.listing2)

            let raw = ""
            try {
                raw = await callOllamaChat(ollamaUrl, system, user, options)
            } catch {
                raw = await callOllamaGenerate(ollamaUrl, system, user, options)
            }

            const jsonText = extractFirstJsonObject(raw) ?? ""
            const parsed = jsonText ? JSON.parse(jsonText) : {}
            return AiMatchSchema.parse(parsed)
        }
    }
}
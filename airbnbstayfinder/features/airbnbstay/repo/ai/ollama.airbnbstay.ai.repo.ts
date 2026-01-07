import { AirbnbStayAiRepo, AirbnbMatchInput, AirbnbMatchOutput } from "@/features/airbnbstay/repo/ai/airbnbstay.ai.repo"
import { AiMatchSchema, extractFirstJsonObject } from "@/features/airbnbstay/domain/airbnbstay.ai"

type OllamaChatResponse = { message?: { content?: string } }
type OllamaGenerateResponse = { response?: string }

function buildSystemPrompt() {
    return [
        "You are a strict Airbnb listing matcher and summarizer.",
        "Return ONLY valid JSON with keys:",
        "isCompatibleWithUserWants, compatibilityScore, resume, reasons.",
        "Do not add extra keys.",
        "compatibilityScore must be an integer from 0 to 100."
    ].join("\n")
}

function buildUserPrompt(userPrompt: string, listing1: unknown, listing2: unknown) {
    return [
        `User request:\n${userPrompt}`,
        `Listing JSON:\n${JSON.stringify(listing1)}`,
        `Listing JSON (by id):\n${JSON.stringify(listing2)}`
    ].join("\n\n")
}

async function callChat(baseUrl: string, model: string, system: string, user: string) {
    const res = await fetch(baseUrl.replace(/\/+$/, "") + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model,
            messages: [
                { role: "system", content: system },
                { role: "user", content: user }
            ],
            stream: false,
            options: { temperature: 0.3, top_p: 0.95, num_predict: 96 }
        })
    })
    if (!res.ok) throw new Error("ollama_chat_error " + res.status)
    const json = (await res.json()) as OllamaChatResponse
    return typeof json.message?.content === "string" ? json.message.content : ""
}

async function callGenerate(baseUrl: string, model: string, system: string, user: string) {
    const res = await fetch(baseUrl.replace(/\/+$/, "") + "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model,
            prompt: [system, user].join("\n\n"),
            stream: false,
            options: { temperature: 0.3, top_p: 0.95, num_predict: 96 }
        })
    })
    if (!res.ok) throw new Error("ollama_generate_error " + res.status)
    const json = (await res.json()) as OllamaGenerateResponse
    return typeof json.response === "string" ? json.response : ""
}

export function makeOllamaAirbnbStayAiRepo(cfg: { baseUrl: string; defaultModel: string }): AirbnbStayAiRepo {
    const system = buildSystemPrompt()

    return {
        async match(input: AirbnbMatchInput): Promise<AirbnbMatchOutput> {
            const model = input.model ?? cfg.defaultModel
            const user = buildUserPrompt(input.userPrompt, input.listing1, input.listing2)

            let raw = ""
            try {
                raw = await callChat(cfg.baseUrl, model, system, user)
            } catch {
                raw = await callGenerate(cfg.baseUrl, model, system, user)
            }

            const jsonText = extractFirstJsonObject(raw) ?? ""
            const parsed = jsonText ? JSON.parse(jsonText) : {}
            return AiMatchSchema.parse(parsed)
        }
    }
}
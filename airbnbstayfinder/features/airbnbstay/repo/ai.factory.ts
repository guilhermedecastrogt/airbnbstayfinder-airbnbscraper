import { makeOllamaAirbnbStayAiRepo } from "@/features/airbnbstay/repo/ollama.airbnbstay.ai.repo"
import { makeOpenAiAirbnbStayAiRepo } from "@/features/airbnbstay/repo/openai.airbnbstay.ai.repo"
import { AirbnbStayAiRepo } from "@/features/airbnbstay/repo/airbnbstay.ai.repo"

export function makeAirbnbStayAiRepoFromEnv(env: NodeJS.ProcessEnv): AirbnbStayAiRepo {
    const provider = (env.AI_PROVIDER ?? "ollama").toLowerCase()
    const model = env.AI_MODEL ?? "deepseek-r1:1.5b"

    if (provider === "openai") {
        const apiKey = env.OPENAI_API_KEY ?? ""
        if (!apiKey) throw new Error("missing OPENAI_API_KEY")
        return makeOpenAiAirbnbStayAiRepo({
            apiKey,
            defaultModel: model,
            baseUrl: env.OPENAI_BASE_URL
        })
    }

    return makeOllamaAirbnbStayAiRepo({
        baseUrl: env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
        defaultModel: model
    })
}
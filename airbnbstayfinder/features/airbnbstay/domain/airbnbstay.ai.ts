import { z } from "zod"

export const AiMatchSchema = z.object({
    isCompatibleWithUserWants: z.boolean(),
    compatibilityScore: z.number().int().min(0).max(100),
    resume: z.string(),
    reasons: z.array(z.string())
})

export type AiMatch = z.infer<typeof AiMatchSchema>

export function extractFirstJsonObject(text: string) {
    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    if (start === -1 || end === -1 || end <= start) return null
    return text.slice(start, end + 1)
}
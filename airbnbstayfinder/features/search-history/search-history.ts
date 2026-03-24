export type SearchHistory = {
    id: string
    url: string
    currency: string
    userPrompt: string
    aiModel: string
    tripId: string | null
    tripName?: string
    resultCount: number
    createdAt: Date
}

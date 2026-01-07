export type AirbnbMatchInput = {
  userPrompt: string
  listing1: unknown
  listing2: unknown
  model: string
}

export type AirbnbMatchOutput = {
  isCompatibleWithUserWants: boolean
  compatibilityScore: number
  resume: string
  reasons: string[]
}

export type AirbnbStayAiRepo = {
  match(input: AirbnbMatchInput): Promise<AirbnbMatchOutput>
}
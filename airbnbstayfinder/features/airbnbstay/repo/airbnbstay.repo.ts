import { AirbnbStay } from "../domain/airbnbstay"
import { RawAirbnbStay, SearchByUrlResponse } from "@/features/airbnbstay/domain/airbnbstay.raw"
import { AiMatch } from "@/features/airbnbstay/domain/airbnbstay.ai"

export interface AirbnbStayRepo {
  findAll(): Promise<AirbnbStay[]>
  create(airbnbstay: AirbnbStay): Promise<AirbnbStay>
  delete(id: string): Promise<void>
}

export type AirbnbStayHttpRepo = {
  searchByUrl(input: { url: string; currency: string; language: string }): Promise<SearchByUrlResponse>
  searchById(input: { stayId: number }): Promise<unknown>
}

export type AirbnbStayAiRepo = {
  match(input: { userPrompt: string; listing1: unknown; listing2: unknown }): Promise<AiMatch>
}
import { AirbnbStay } from "../domain/airbnbstay"
import { RawAirbnbStay, SearchByUrlResponse } from "@/features/airbnbstay/domain/airbnbstay.raw"

export interface AirbnbStayRepo {
  findAll(): Promise<AirbnbStay[]>
  create(airbnbstay: AirbnbStay): Promise<AirbnbStay>
  delete(id: string): Promise<void>
}

export type AirbnbStayHttpRepo = {
  searchByUrl(input: { url: string; currency: string; language: string }): Promise<SearchByUrlResponse>
  searchById(input: { stayId: number }): Promise<unknown>
}
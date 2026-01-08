import { AirbnbStay } from "../domain/airbnbstay"
import { RawAirbnbStay, SearchByIdResponse, SearchByUrlResponse } from "@/features/airbnbstay/domain/airbnbstay.raw"

export interface AirbnbStayRepo {
  findAll(): Promise<AirbnbStay[]>
  findOne(id: string): Promise<AirbnbStay>
  create(airbnbstay: AirbnbStay): Promise<AirbnbStay>
  delete(id: string): Promise<void>
  setInterest(room_id: string, interest: boolean): Promise<void>
}

export type AirbnbStayHttpRepo = {
  searchByUrl(input: { url: string; currency: string; language: string }): Promise<SearchByUrlResponse>
  searchById(input: { stayId: string }): Promise<SearchByIdResponse>
}
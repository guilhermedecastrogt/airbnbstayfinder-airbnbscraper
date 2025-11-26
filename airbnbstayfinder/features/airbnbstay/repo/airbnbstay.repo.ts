import { AirbnbStay } from "../domain/airbnbstay"

export interface AirbnbStayRepo {
  findAll(): Promise<AirbnbStay[]>
  create(airbnbstay: AirbnbStay): Promise<AirbnbStay>
  delete(id: string): Promise<void>
}
"use server"

import { setAirbnbStayInterestService } from "@/features/airbnbstay/services/set-airbnbstay-interest.service"

export async function setAirbnbStayInterestAction(room_id: string, interest: boolean): Promise<void> {
    await setAirbnbStayInterestService(room_id, interest)
}
"use server"

import { setAirbnbStayInterestService } from "@/features/airbnbstay/services/set-airbnbstay-interest.service"

export async function setAirbnbStayInterestAction(input: { room_id: string; interest: boolean }): Promise<void> {
    await setAirbnbStayInterestService(input.room_id, input.interest)
}
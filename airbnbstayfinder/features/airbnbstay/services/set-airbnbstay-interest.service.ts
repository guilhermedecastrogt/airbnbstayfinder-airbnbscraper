import { airbnbStayRepo } from "@/features/airbnbstay/repo/prisma.airbnbstay.repo"


export async function setAirbnbStayInterestService( room_id: string, interest: boolean,): Promise<void> {
    if (!room_id) return
    await airbnbStayRepo.setInterest(room_id, interest)
}
import { airbnbStayRepo } from "@/features/airbnbstay/repo/prisma.airbnbstay.repo"
import type { AirbnbStay } from "@/features/airbnbstay/domain/airbnbstay"

export async function VerifyAirbnbstayExistsService(id: string): Promise<AirbnbStay | null> {
    const found = await airbnbStayRepo.findOne(id)
    return found ?? null
}
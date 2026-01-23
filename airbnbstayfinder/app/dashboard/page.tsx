import GetAirbnbStay from "@/features/airbnbstay/components/get-airbnbstay";
import { airbnbStayRepo } from "@/features/airbnbstay/repo/prisma.airbnbstay.repo";

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
    const stays = await airbnbStayRepo.findPending()
    return (
        <GetAirbnbStay initialStays={stays}/>
    )
}
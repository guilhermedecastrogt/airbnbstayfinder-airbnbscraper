import GetAirbnbStay from "@/features/airbnbstay/components/get-airbnbstay";
import { airbnbStayRepo } from "@/features/airbnbstay/repo/prisma.airbnbstay.repo";
import { findRecentSearches } from "@/features/search-history/search-history.repo";

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
    const [stays, history] = await Promise.all([
        airbnbStayRepo.findPending(),
        findRecentSearches(10),
    ])
    return (
        <GetAirbnbStay initialStays={stays} initialHistory={history} />
    )
}
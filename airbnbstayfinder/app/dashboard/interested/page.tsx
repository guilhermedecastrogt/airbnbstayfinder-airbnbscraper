import { airbnbStayRepo } from "@/features/airbnbstay/repo/prisma.airbnbstay.repo"
import InterestedAirbnbStayGrid from "@/features/airbnbstay/components/interested-airbnbstay-grid-form"

export const dynamic = "force-dynamic"

export default async function InterestedPage() {
    const stays = await airbnbStayRepo.findInterested()

    return (
        <div className="flex flex-col gap-8">
            <InterestedAirbnbStayGrid stays={stays} />
        </div>
    )
}

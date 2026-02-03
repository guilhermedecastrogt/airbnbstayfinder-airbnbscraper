import { airbnbStayRepo } from "@/features/airbnbstay/repo/prisma.airbnbstay.repo"
import NotInterestedAirbnbStayGrid from "@/features/airbnbstay/components/no-interest-airbnbstay-grid-form"

export const dynamic = "force-dynamic"

export default async function NotInterestedPage() {
    const stays = await airbnbStayRepo.findNotInterested()

    return (
        <div className="flex flex-col gap-8">
            <NotInterestedAirbnbStayGrid stays={stays} />
        </div>
    )
}

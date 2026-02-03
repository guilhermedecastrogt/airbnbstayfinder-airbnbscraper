"use client"

import { AirbnbStay } from "@/features/airbnbstay/domain/airbnbstay"
import AirbnbStayCard from "./airbnbstay-card"
import { HiXCircle } from "react-icons/hi"

type Props = {
    stays: AirbnbStay[]
}

export default function NotInterestedAirbnbStayGrid({ stays }: Props) {
    if (stays.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 border border-primary/25 rounded-3xl bg-secondary/20 backdrop-blur-sm">
                <HiXCircle size={48} className="text-white/30 mb-4" />
                <h3 className="text-xl font-semibold text-white/90">No rejected stays</h3>
                <p className="text-sm text-white/50 mt-2">Stays you mark as not interested will appear here</p>
            </div>
        )
    }

    return (
        <section className="w-full">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-gradient">Rejected Stays</h2>
                    <p className="text-sm text-white/60">
                        Not interested: <span className="font-semibold text-white/40">{stays.length}</span>
                    </p>
                </div>
            </div>

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {stays.map((stay) => (
                    <AirbnbStayCard
                        key={stay.room_id}
                        stay={stay}
                        variant="not-interested"
                    />
                ))}
            </div>
        </section>
    )
}

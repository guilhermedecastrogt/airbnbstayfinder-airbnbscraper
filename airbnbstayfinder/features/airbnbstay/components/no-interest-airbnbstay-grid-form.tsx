"use client"

import { AirbnbStay } from "@/features/airbnbstay/domain/airbnbstay"
import AirbnbStayCard from "./airbnbstay-card"
import { HiXCircle } from "react-icons/hi"
import TripSelector from "@/features/trip/components/trip-selector"
import { useTrip } from "@/components/trip-provider"
import { useMemo } from "react"

type Props = {
    stays: AirbnbStay[]
}

export default function NotInterestedAirbnbStayGrid({ stays }: Props) {
    const { selectedTrip } = useTrip()

    const filteredStays = useMemo(() => {
        if (!selectedTrip) return stays
        return stays.filter((s) => s.tripId === selectedTrip.id)
    }, [stays, selectedTrip])

    return (
        <section className="w-full">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-semibold text-gradient">Skipped Stays</h2>
                    <span className="text-xs font-medium text-white/25 tabular-nums">{filteredStays.length} stays</span>
                </div>
                <TripSelector />
            </div>

            {filteredStays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-white/[0.04] bg-white/[0.01]">
                    <HiXCircle size={40} className="text-white/10 mb-4" />
                    <h3 className="text-lg font-medium text-white/60">No skipped stays</h3>
                    <p className="text-sm text-white/25 mt-1.5">
                        {selectedTrip ? `No stays for "${selectedTrip.name}"` : "Stays you skip will appear here"}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredStays.map((stay, i) => (
                        <div key={stay.room_id} style={{ animationDelay: `${i * 60}ms` }}>
                            <AirbnbStayCard stay={stay} variant="rejected" />
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

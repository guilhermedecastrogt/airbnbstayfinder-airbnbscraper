"use client"

import { useMemo, useState } from "react"
import { AirbnbStay } from "@/features/airbnbstay/domain/airbnbstay"
import AirbnbStayCard from "./airbnbstay-card"
import { HiInbox } from "react-icons/hi"
import TripSelector from "@/features/trip/components/trip-selector"
import { useTrip } from "@/components/trip-provider"

type Props = {
    stays: AirbnbStay[]
    onSetInterest: (room_id: string, interest: boolean) => Promise<void> | void
}

export default function NullInterestAirbnbStayGridForm({ stays, onSetInterest }: Props) {
    const { selectedTrip } = useTrip()
    const [busyId, setBusyId] = useState<string>("")

    const items = useMemo(() => {
        const nullInterestStays = (stays || []).filter((s) => s.interest === null)
        if (!selectedTrip) return nullInterestStays
        return nullInterestStays.filter((s) => s.tripId === selectedTrip.id)
    }, [stays, selectedTrip])

    async function setInterest(room_id: string, interest: boolean) {
        if (busyId) return
        setBusyId(room_id)
        try {
            await onSetInterest(room_id, interest)
        } finally {
            setBusyId("")
        }
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-white/[0.04] bg-white/[0.01]">
                <HiInbox size={40} className="text-white/10 mb-4" />
                <h3 className="text-lg font-medium text-white/60">All caught up</h3>
                <p className="text-sm text-white/25 mt-1.5 max-w-sm text-center">
                    {selectedTrip ? `No pending reviews for "${selectedTrip.name}"` : "No pending reviews. Search for more stays above."}
                </p>
            </div>
        )
    }

    return (
        <section className="w-full">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-semibold text-gradient">Pending Review</h2>
                    <span className="text-xs font-medium text-amber-400/70 tabular-nums">{items.length} stays</span>
                </div>
                <TripSelector />
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((stay, i) => (
                    <div key={stay.room_id} className="flex" style={{ animationDelay: `${i * 60}ms` }}>
                        <AirbnbStayCard
                            stay={stay}
                            variant="pending"
                            busy={busyId === stay.room_id}
                            onInterested={() => setInterest(stay.room_id, true)}
                            onNotInterested={() => setInterest(stay.room_id, false)}
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}

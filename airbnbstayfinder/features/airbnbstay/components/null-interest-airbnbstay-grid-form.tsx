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
            <div className="flex flex-col items-center justify-center py-20 border border-white/10 rounded-3xl bg-secondary/20 backdrop-blur-sm">
                <HiInbox size={48} className="text-primary/40 mb-4" />
                <h3 className="text-xl font-semibold text-white/90">All done!</h3>
                <p className="text-sm text-white/50 mt-2">
                    {selectedTrip ? `No pending reviews for "${selectedTrip.name}"` : "No pending reviews. Search for more stays above."}
                </p>
            </div>
        )
    }

    return (
        <section className="w-full">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-gradient">Pending Review</h2>
                    <p className="text-sm text-white/60">
                        Unreviewed: <span className="font-semibold text-amber-400">{items.length}</span>
                    </p>
                </div>
                <TripSelector />
            </div>

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((stay) => (
                    <AirbnbStayCard
                        key={stay.room_id}
                        stay={stay}
                        variant="pending"
                        busy={busyId === stay.room_id}
                        onInterested={() => setInterest(stay.room_id, true)}
                        onNotInterested={() => setInterest(stay.room_id, false)}
                    />
                ))}
            </div>
        </section>
    )
}
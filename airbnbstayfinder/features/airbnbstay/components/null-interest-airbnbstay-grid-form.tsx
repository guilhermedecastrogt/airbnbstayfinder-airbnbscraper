"use client"

import { useMemo, useState } from "react"
import { AirbnbStay } from "@/features/airbnbstay/domain/airbnbstay"

type Props = {
    stays: AirbnbStay[]
    onSetInterest: (room_id: string, interest: boolean) => Promise<void> | void
}

export default function NullInterestAirbnbStayGridForm({ stays, onSetInterest }: Props) {
    const items = useMemo(() => stays.filter((s) => s.interest === null), [stays])
    const [busyId, setBusyId] = useState<string>("")

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
            <div className="border border-primary/25 rounded-3xl p-6">
                <h3 className="text-base font-semibold">No pending reviews</h3>
                <p className="text-sm opacity-80 mt-1">All stays have been marked.</p>
            </div>
        )
    }

    return (
        <section className="w-full">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold">Pending stays</h2>
                    <p className="text-sm opacity-80">
                        Unreviewed: <span className="font-semibold">{items.length}</span>
                    </p>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((stay) => (
                    <div key={stay.room_id} className="border border-primary/25 rounded-3xl overflow-hidden">
                        <div className="aspect-[16/10] bg-black/20">
                            {stay.images?.[0]?.imageUrl ? (
                                <img src={stay.images[0].imageUrl} alt={stay.title} className="w-full h-full object-cover" />
                            ) : null}
                        </div>

                        <div className="p-5 flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="font-semibold leading-snug line-clamp-2">{stay.title}</h3>
                                {typeof stay.rating === "number" ? (
                                    <span className="text-sm opacity-80">{stay.rating.toFixed(2)}</span>
                                ) : null}
                            </div>

                            <div className="text-sm opacity-80 line-clamp-2">{stay.subTitle}</div>

                            <div className="flex items-center justify-between gap-3">
                                <div className="text-sm opacity-80">
                                    {stay.personCapacity ? `${stay.personCapacity} guests` : ""}
                                </div>
                                <div className="text-sm font-semibold">
                                    {stay.priceDiscount ?? stay.price}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    disabled={!!busyId}
                                    onClick={() => setInterest(stay.room_id, false)}
                                    className="flex-1 border border-primary/35 rounded-2xl px-4 py-2 text-sm disabled:opacity-50"
                                >
                                    {busyId === stay.room_id ? "Saving..." : "Not interested"}
                                </button>

                                <button
                                    type="button"
                                    disabled={!!busyId}
                                    onClick={() => setInterest(stay.room_id, true)}
                                    className="flex-1 border border-primary/60 rounded-2xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
                                >
                                    {busyId === stay.room_id ? "Saving..." : "Interested"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
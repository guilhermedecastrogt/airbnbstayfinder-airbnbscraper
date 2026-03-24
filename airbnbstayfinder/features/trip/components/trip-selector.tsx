"use client"

import { useState } from "react"
import { useTrip } from "@/components/trip-provider"
import { createTripAction } from "@/features/trip/actions/trip.actions"
import { HiPlus, HiCheck, HiX, HiChevronDown } from "react-icons/hi"

export default function TripSelector() {
    const { selectedTrip, setSelectedTrip, trips, setTrips } = useTrip()
    const [isOpen, setIsOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newTripName, setNewTripName] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleCreate() {
        if (!newTripName.trim()) return
        setLoading(true)
        const formData = new FormData()
        formData.set("name", newTripName)
        const trip = await createTripAction(formData)
        if (trip) {
            setTrips([trip, ...trips])
            setSelectedTrip(trip)
            setNewTripName("")
            setIsCreating(false)
        }
        setLoading(false)
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] text-sm text-white/70 hover:border-white/[0.12] transition-all duration-200 min-w-[180px]"
            >
                <span className="flex-1 text-left truncate">
                    {selectedTrip ? selectedTrip.name : "Select a trip"}
                </span>
                <HiChevronDown
                    size={14}
                    className={`text-white/25 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-full min-w-[240px] rounded-xl border border-white/[0.08] bg-[#0c0c0e]/95 backdrop-blur-xl shadow-2xl shadow-black/40 z-50">
                    <div className="max-h-[240px] overflow-y-auto overflow-x-hidden rounded-t-xl">
                        {trips.map((trip) => (
                            <button
                                key={trip.id}
                                type="button"
                                onClick={() => {
                                    setSelectedTrip(trip)
                                    setIsOpen(false)
                                }}
                                className={`flex items-center justify-between w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                    selectedTrip?.id === trip.id
                                        ? "bg-primary/8 text-primary"
                                        : "text-white/60 hover:bg-white/[0.04] hover:text-white/80"
                                }`}
                            >
                                <span className="truncate">{trip.name}</span>
                                {selectedTrip?.id === trip.id && <HiCheck size={14} />}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-white/[0.06] p-2.5">
                        {isCreating ? (
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="text"
                                    value={newTripName}
                                    onChange={(e) => setNewTripName(e.target.value)}
                                    placeholder="Trip name..."
                                    className="flex-1 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-white text-sm focus:outline-none focus:border-primary/40"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleCreate()
                                        if (e.key === "Escape") setIsCreating(false)
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    disabled={loading || !newTripName.trim()}
                                    className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary/80 transition-colors disabled:opacity-40"
                                >
                                    <HiCheck size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsCreating(false); setNewTripName("") }}
                                    className="p-1.5 rounded-lg border border-white/[0.08] text-white/30 hover:text-white/60 transition-colors"
                                >
                                    <HiX size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsCreating(true)}
                                className="flex items-center gap-1.5 w-full px-2.5 py-1.5 rounded-lg text-primary/70 hover:text-primary hover:bg-primary/[0.06] transition-colors text-xs font-medium"
                            >
                                <HiPlus size={14} />
                                New trip
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

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
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-card-bg)] backdrop-blur-md text-[var(--color-text)] hover:border-primary/50 transition-all min-w-[200px]"
            >
                <span className="flex-1 text-left truncate">
                    {selectedTrip ? selectedTrip.name : "Select a trip"}
                </span>
                <HiChevronDown
                    size={18}
                    className={`text-[var(--color-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg)] backdrop-blur-md shadow-xl z-50 overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto">
                        {trips.map((trip) => (
                            <button
                                key={trip.id}
                                type="button"
                                onClick={() => {
                                    setSelectedTrip(trip)
                                    setIsOpen(false)
                                }}
                                className={`flex items-center justify-between w-full px-4 py-3 text-left hover:bg-[var(--color-bg-secondary)] transition-colors ${selectedTrip?.id === trip.id ? "bg-primary/10 text-primary" : "text-[var(--color-text)]"
                                    }`}
                            >
                                <span className="truncate">{trip.name}</span>
                                {selectedTrip?.id === trip.id && <HiCheck size={18} />}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-[var(--color-border-primary)] p-3">
                        {isCreating ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newTripName}
                                    onChange={(e) => setNewTripName(e.target.value)}
                                    placeholder="Trip name..."
                                    className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm focus:outline-none focus:border-primary/50"
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
                                    className="p-2 rounded-xl bg-primary text-white hover:bg-primary/80 transition-colors disabled:opacity-50"
                                >
                                    <HiCheck size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreating(false)
                                        setNewTripName("")
                                    }}
                                    className="p-2 rounded-xl border border-[var(--color-border-primary)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                                >
                                    <HiX size={18} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsCreating(true)}
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-primary hover:bg-primary/10 transition-colors text-sm font-medium"
                            >
                                <HiPlus size={18} />
                                Create new trip
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

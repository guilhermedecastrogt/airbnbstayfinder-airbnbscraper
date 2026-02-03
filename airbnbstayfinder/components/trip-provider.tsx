"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { Trip } from "@/features/trip/domain/trip"

type TripContextType = {
    selectedTrip: Trip | null
    setSelectedTrip: (trip: Trip | null) => void
    trips: Trip[]
    setTrips: (trips: Trip[]) => void
}

const TripContext = createContext<TripContextType | null>(null)

export function TripProvider({ children, initialTrips }: { children: ReactNode; initialTrips: Trip[] }) {
    const [trips, setTrips] = useState<Trip[]>(initialTrips)
    const [selectedTrip, setSelectedTripState] = useState<Trip | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const storedSlug = localStorage.getItem("selectedTripSlug")
        if (storedSlug) {
            const found = initialTrips.find((t) => t.slug === storedSlug)
            if (found) setSelectedTripState(found)
        } else if (initialTrips.length > 0) {
            setSelectedTripState(initialTrips[0])
        }
    }, [initialTrips])

    function setSelectedTrip(trip: Trip | null) {
        setSelectedTripState(trip)
        if (trip) {
            localStorage.setItem("selectedTripSlug", trip.slug)
        } else {
            localStorage.removeItem("selectedTripSlug")
        }
    }

    if (!mounted) {
        return <>{children}</>
    }

    return (
        <TripContext.Provider value={{ selectedTrip, setSelectedTrip, trips, setTrips }}>
            {children}
        </TripContext.Provider>
    )
}

export function useTrip() {
    const context = useContext(TripContext)
    if (!context) {
        return { selectedTrip: null, setSelectedTrip: () => { }, trips: [], setTrips: () => { } }
    }
    return context
}

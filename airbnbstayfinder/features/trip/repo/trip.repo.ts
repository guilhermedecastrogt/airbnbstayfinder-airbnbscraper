import { Trip } from "@/features/trip/domain/trip"

export interface TripRepo {
    findAll(): Promise<Trip[]>
    findBySlug(slug: string): Promise<Trip | null>
    create(trip: Omit<Trip, "id" | "createdAt">): Promise<Trip>
}

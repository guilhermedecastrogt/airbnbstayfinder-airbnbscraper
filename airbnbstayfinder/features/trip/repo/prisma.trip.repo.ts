import { Trip } from "@/features/trip/domain/trip"
import { TripRepo } from "@/features/trip/repo/trip.repo"
import prisma from "@/lib/db/prisma"

class PrismaTripRepo implements TripRepo {
    async findAll(): Promise<Trip[]> {
        const trips = await prisma.trip.findMany({
            orderBy: { createdAt: "desc" }
        })
        return trips as Trip[]
    }

    async findBySlug(slug: string): Promise<Trip | null> {
        const trip = await prisma.trip.findUnique({
            where: { slug }
        })
        return trip as Trip | null
    }

    async create(trip: Omit<Trip, "id" | "createdAt">): Promise<Trip> {
        const created = await prisma.trip.create({
            data: {
                name: trip.name,
                slug: trip.slug
            }
        })
        return created as Trip
    }
}

export const tripRepo: TripRepo = new PrismaTripRepo()

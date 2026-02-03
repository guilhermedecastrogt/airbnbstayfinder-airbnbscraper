"use server"

import { tripRepo } from "@/features/trip/repo/prisma.trip.repo"
import { revalidatePath } from "next/cache"

export async function getTripsAction() {
    return tripRepo.findAll()
}

export async function createTripAction(formData: FormData) {
    const name = formData.get("name")?.toString()
    if (!name) return null

    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    const trip = await tripRepo.create({ name, slug })
    revalidatePath("/dashboard")
    return trip
}

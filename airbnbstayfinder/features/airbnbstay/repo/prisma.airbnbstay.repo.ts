import { AirbnbStay } from "@/features/airbnbstay/domain/airbnbstay";
import prisma from "../../../lib/db/prisma"
import { AirbnbStayRepo } from "@/features/airbnbstay/repo/airbnbstay.repo";

function mapFromPrisma(row: any): AirbnbStay | null {
  if (!row) return null
  const { priceWithoutDiscount, ...rest } = row
  return { ...rest, priceDiscount: priceWithoutDiscount ?? undefined }
}

class PrismaAirbnbStayRepo implements AirbnbStayRepo {
  async findAll(): Promise<AirbnbStay[]> {
    const stays = await prisma.airbnbStay.findMany({
      orderBy: { createdAt: "desc" },
      include: { images: true }
    })
    return stays.map(mapFromPrisma) as AirbnbStay[]
  }
  async findOne(id: string): Promise<AirbnbStay | null> {
    const stay = await prisma.airbnbStay.findUnique({
      where: { room_id: id },
      include: { images: true }
    })
    return mapFromPrisma(stay)
  }
  async create(airbnbstay: AirbnbStay): Promise<AirbnbStay> {
    const { images, priceDiscount, tripId, ...data } = airbnbstay

    const created = await prisma.airbnbStay.create({
      data: {
        ...data,
        priceWithoutDiscount: priceDiscount ?? null,
        tripId: tripId ?? null,
        images: images?.length
          ? { create: images.map(({ imageUrl }) => ({ imageUrl })) }
          : undefined
      },
      include: { images: true }
    })
    return mapFromPrisma(created) as AirbnbStay
  }
  async delete(id: string): Promise<void> {
    await prisma.airbnbStay.delete({ where: { id } })
  }
  async setInterest(room_id: string, interest: boolean): Promise<void> {
    await prisma.airbnbStay.update({
      where: { room_id: room_id },
      data: { interest: interest },
    })
  }
  async findPending(tripId?: string): Promise<AirbnbStay[]> {
    const stays = await prisma.airbnbStay.findMany({
      where: { interest: null, ...(tripId ? { tripId } : {}) },
      orderBy: { createdAt: "desc" },
      include: { images: true }
    })
    return stays.map(mapFromPrisma) as AirbnbStay[]
  }
  async findInterested(tripId?: string): Promise<AirbnbStay[]> {
    const stays = await prisma.airbnbStay.findMany({
      where: { interest: true, ...(tripId ? { tripId } : {}) },
      orderBy: { createdAt: "desc" },
      include: { images: true }
    })
    return stays.map(mapFromPrisma) as AirbnbStay[]
  }
  async findNotInterested(tripId?: string): Promise<AirbnbStay[]> {
    const stays = await prisma.airbnbStay.findMany({
      where: { interest: false, ...(tripId ? { tripId } : {}) },
      orderBy: { createdAt: "desc" },
      include: { images: true }
    })
    return stays.map(mapFromPrisma) as AirbnbStay[]
  }
}

export const airbnbStayRepo: AirbnbStayRepo = new PrismaAirbnbStayRepo();
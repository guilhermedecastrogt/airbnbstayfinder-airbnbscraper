import { AirbnbStay } from "@/features/airbnbstay/domain/airbnbstay";
import prisma from "../../../lib/db/prisma"
import { AirbnbStayRepo } from "@/features/airbnbstay/repo/airbnbstay.repo";


class PrismaAirbnbStayRepo implements AirbnbStayRepo {
  async findAll(): Promise<AirbnbStay[]> {
    return prisma.airbnbStay.findMany({ orderBy: { createdAt: "desc" } })
  }
  async findOne(id: string): Promise<AirbnbStay> {
    return prisma.airbnbStay.find({ where: { room_id: id}})
  }
  async create(airbnbstay: AirbnbStay): Promise<AirbnbStay> {
    return prisma.airbnbStay.create({ data: airbnbstay })
  }
  async delete(id: string): Promise<void> {
    await prisma.airbnbStay.delete({ where: { id } })
  }
}

export const airbnbStayRepo: AirbnbStayRepo = new PrismaAirbnbStayRepo();
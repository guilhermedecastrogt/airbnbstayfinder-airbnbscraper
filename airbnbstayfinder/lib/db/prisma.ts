import "../../config/env"
import pkg from "@prisma/client"

const { PrismaClient } = pkg as any
const globalForPrisma = globalThis as any

export const prisma = globalForPrisma.prisma || new PrismaClient()
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma

export default prisma
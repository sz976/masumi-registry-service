import { prisma } from "@/utils/db"

async function getCapabilities(cursorId: string | undefined, limit: number) {
    return await prisma.capability.findMany({ distinct: ["name", "version"], orderBy: [{ name: "asc" }, { id: "desc" }], cursor: cursorId ? { id: cursorId } : undefined, take: limit, where: { RegistryEntry: { some: { status: "ONLINE" } } } })
}

export const capabilityRepository = { getCapabilities }
import { addRegistrySourceSchemaInput, updateRegistrySourceSchemaInput } from "@/routes/api/registry-source"
import { prisma } from "@/utils/db"
import { z } from "zod"

async function getRegistrySource(cursorId: string | undefined, limit: number | undefined) {
    return await prisma.registrySources.findMany({ cursor: cursorId ? { id: cursorId } : undefined, take: limit, orderBy: [{ createdAt: "desc" }] })
}

async function addRegistrySource(input: z.infer<typeof addRegistrySourceSchemaInput>) {
    return await prisma.registrySources.create({ data: { type: input.type, identifier: input.identifier, note: input.note, apiKey: input.apiKey, network: input.network, latestPage: 1, } })
}

async function updateRegistrySource(input: z.infer<typeof updateRegistrySourceSchemaInput>) {
    return await prisma.registrySources.update({ where: { id: input.id }, data: { note: input.note, apiKey: input.apiKey } })
}

async function deleteRegistrySource(id: string) {
    return await prisma.registrySources.delete({ where: { id } })
}

export const registrySourceRepository = { getRegistrySource, addRegistrySource, updateRegistrySource, deleteRegistrySource }

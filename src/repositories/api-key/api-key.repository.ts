import { prisma } from "@/utils/db"
import { APIKeyStatus } from "@prisma/client"
import { Permission } from "@prisma/client"


async function getApiKeyByCursorId(cursorId: string | undefined, limit: number | undefined) {
    return await prisma.apiKey.findMany({ cursor: cursorId ? { id: cursorId } : undefined, take: limit ?? 10 })
}
async function getApiKeyById(id: string) {
    return await prisma.apiKey.findUnique({ where: { id } })
}
async function getApiKeyByApiKey(apiKey: string) {
    return await prisma.apiKey.findUnique({ where: { apiKey } })
}

async function addApiKey(apiKey: string, permission: Permission, usageLimited: boolean, maxUsageCredits: number) {
    return await prisma.apiKey.create({ data: { apiKey, status: APIKeyStatus.ACTIVE, permission, usageLimited, maxUsageCredits, accumulatedUsageCredits: 0 } })
}

async function updateApiKeyViaId(id: string, status: APIKeyStatus, usageLimited: boolean, maxUsageCredits: number) {
    return await prisma.apiKey.update({ where: { id }, data: { status, usageLimited, maxUsageCredits } })
}

async function updateApiKeyViaApiKey(apiKey: string, status: APIKeyStatus, usageLimited: boolean, maxUsageCredits: number) {
    return await prisma.apiKey.update({ where: { apiKey }, data: { status, usageLimited, maxUsageCredits } })
}
async function deleteApiKeyViaId(id: string) {
    return await prisma.apiKey.delete({ where: { id } })
}
async function deleteApiKeyViaApiKey(apiKey: string) {
    return await prisma.apiKey.delete({ where: { apiKey } })
}
export const apiKeyRepository = { getApiKeyById, getApiKeyByCursorId, getApiKeyByApiKey, addApiKey, updateApiKeyViaId, updateApiKeyViaApiKey, deleteApiKeyViaId, deleteApiKeyViaApiKey }

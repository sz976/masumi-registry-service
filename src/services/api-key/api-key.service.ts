import { apiKeyRepository } from "@/repositories/api-key";
import { APIKeyStatus } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { Permission } from "@prisma/client";
async function getApiKey(cursorId: string | undefined, limit: number | undefined) {
    return await apiKeyRepository.getApiKeyByCursorId(cursorId, limit)
}
async function addApiKey(permission: Permission, usageLimited: boolean, maxUsageCredits: number) {
    const apiKey = ("masumi-registry-" + (permission == Permission.ADMIN ? "admin-" : "user-")) + createId()
    return await apiKeyRepository.addApiKey(apiKey, permission, usageLimited, maxUsageCredits)
}
async function updateApiKey(apiKey: string, status: APIKeyStatus, usageLimited: boolean, maxUsageCredits: number) {
    return await apiKeyRepository.updateApiKeyViaApiKey(apiKey, status, usageLimited, maxUsageCredits)
}
async function deleteApiKey(apiKey: string) {
    return await apiKeyRepository.deleteApiKeyViaApiKey(apiKey)
}

export const apiKeyService = { getApiKey, addApiKey, updateApiKey, deleteApiKey }

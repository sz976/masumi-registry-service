import { apiKeyRepository } from "@/repositories/api-key";
import { APIKeyStatus } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { Permission } from "@prisma/client";
async function getApiKey(id: string | undefined, apiKey: string | undefined) {
    if (id) {
        return await apiKeyRepository.getApiKeyById(id)
    } else if (apiKey) {
        return await apiKeyRepository.getApiKeyByApiKey(apiKey)
    }
    return null;
}
async function addApiKey(permission: Permission, usageLimited: boolean, maxUsageCredits: number) {
    const apiKey = ("masumi-registry-" + permission == Permission.ADMIN ? "admin-" : "") + createId()
    return await apiKeyRepository.addApiKey(apiKey, permission, usageLimited, maxUsageCredits)
}
async function updateApiKey(id: string | undefined, apiKey: string | undefined, status: APIKeyStatus, usageLimited: boolean, maxUsageCredits: number) {
    if (id) {
        return await apiKeyRepository.updateApiKeyViaId(id, status, usageLimited, maxUsageCredits)
    } else if (apiKey) {
        return await apiKeyRepository.updateApiKeyViaApiKey(apiKey, status, usageLimited, maxUsageCredits)
    }
    return null;
}

async function deleteApiKey(id: string | undefined, apiKey: string | undefined) {
    if (id) {
        return await apiKeyRepository.deleteApiKeyViaId(id)
    } else if (apiKey) {
        return await apiKeyRepository.deleteApiKeyViaApiKey(apiKey)
    }
    return null;
}
export const apiKeyService = { getApiKey, addApiKey, updateApiKey, deleteApiKey }

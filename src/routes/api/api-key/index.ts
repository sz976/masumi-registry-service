import { adminAuthenticatedEndpointFactory } from '@/utils/endpoint-factory/admin-authenticated';
import { z } from 'zod';
import { APIKeyStatus, Permission } from '@prisma/client';
import createHttpError from 'http-errors';
import { apiKeyService } from '@/services/api-key/api-key.service';


export const getAPIKeySchemaInput = z.object({
    cursorId: z.string().max(550).optional(),
    limit: z.number({ coerce: true }).int().min(1).max(100).default(10),

})


export const getAPIKeySchemaOutput = z.object({
    apiKeys: z.array(z.object({
        apiKey: z.string(),
        permission: z.nativeEnum(Permission),
        usageLimited: z.boolean(),
        maxUsageCredits: z.number({ coerce: true }).int().min(0).max(1000000).nullable(),
        accumulatedUsageCredits: z.number({ coerce: true }).int().min(0).max(1000000),
        status: z.nativeEnum(APIKeyStatus),
    }))
});

export const queryAPIKeyEndpointGet = adminAuthenticatedEndpointFactory.build({
    method: "get",
    input: getAPIKeySchemaInput,
    output: getAPIKeySchemaOutput,
    handler: async ({ input }) => {
        const data = await apiKeyService.getApiKey(input.cursorId, input.limit)

        if (!data)
            throw createHttpError(404, "Not found")

        return { apiKeys: data }
    },
});

export const addAPIKeySchemaInput = z.object({
    usageLimited: z.boolean().default(false),
    maxUsageCredits: z.number({ coerce: true }).int().min(0).max(1000000).default(0),
    permission: z.nativeEnum(Permission).default(Permission.USER),
})

export const addAPIKeySchemaOutput = z.object({
    id: z.string(),
    apiKey: z.string(),
    permission: z.nativeEnum(Permission),
    usageLimited: z.boolean(),
    maxUsageCredits: z.number({ coerce: true }).int().min(0).max(1000000).nullable(),
    accumulatedUsageCredits: z.number({ coerce: true }).int().min(0).max(1000000),
    status: z.nativeEnum(APIKeyStatus),

})

export const addAPIKeyEndpointPost = adminAuthenticatedEndpointFactory.build({
    method: "post",
    input: addAPIKeySchemaInput,
    output: addAPIKeySchemaOutput,
    handler: async ({ input }) => {
        const result = await apiKeyService.addApiKey(input.permission, input.usageLimited, input.maxUsageCredits)
        return result;
    },
});

export const updateAPIKeySchemaInput = z.object({
    apiKey: z.string().max(550),
    usageLimited: z.boolean().default(false),
    maxUsageCredits: z.number({ coerce: true }).int().min(0).max(1000000).default(0),
    status: z.nativeEnum(APIKeyStatus).default(APIKeyStatus.ACTIVE),
})

export const updateAPIKeySchemaOutput = z.object({
    apiKey: z.string(),
    permission: z.nativeEnum(Permission),
    usageLimited: z.boolean(),
    maxUsageCredits: z.number({ coerce: true }).int().min(0).max(1000000).nullable(),
    accumulatedUsageCredits: z.number({ coerce: true }).int().min(0).max(1000000),
    status: z.nativeEnum(APIKeyStatus),
})

export const updateAPIKeyEndpointPatch = adminAuthenticatedEndpointFactory.build({
    method: "patch",
    input: updateAPIKeySchemaInput,
    output: updateAPIKeySchemaOutput,
    handler: async ({ input }) => {

        const result = await apiKeyService.updateApiKey(input.apiKey, input.status, input.usageLimited, input.maxUsageCredits)
        if (!result)
            throw createHttpError(404, "Not found")

        return result
    },
});

export const deleteAPIKeySchemaInput = z.object({
    apiKey: z.string().max(550)
})

export const deleteAPIKeySchemaOutput = z.object({
    apiKey: z.string(),
});

export const deleteAPIKeyEndpointDelete = adminAuthenticatedEndpointFactory.build({
    method: "delete",
    input: deleteAPIKeySchemaInput,
    output: deleteAPIKeySchemaOutput,

    handler: async ({ input }) => {

        const result = await apiKeyService.deleteApiKey(input.apiKey)

        if (!result)
            throw createHttpError(404, "Not found")

        return result
    },
});

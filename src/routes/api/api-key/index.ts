import { adminAuthenticatedEndpointFactory } from '@/utils/endpoint-factory/admin-authenticated';
import { z } from 'zod';
import { APIKeyStatus, Permission } from '@prisma/client';
import createHttpError from 'http-errors';
import { apiKeyService } from '@/services/api-key/';

export const getAPIKeySchemaInput = z.object({
  cursorId: z.string().max(550).optional(),
  limit: z.number({ coerce: true }).int().min(1).max(100).default(10),
});

export const getAPIKeySchemaOutput = z.object({
  apiKeys: z.array(
    z.object({
      token: z.string(),
      permission: z.nativeEnum(Permission),
      usageLimited: z.boolean(),
      maxUsageCredits: z
        .number({ coerce: true })
        .int()
        .min(0)
        .max(1000000)
        .nullable(),
      accumulatedUsageCredits: z
        .number({ coerce: true })
        .int()
        .min(0)
        .max(1000000),
      status: z.nativeEnum(APIKeyStatus),
    })
  ),
});

export const queryAPIKeyEndpointGet = adminAuthenticatedEndpointFactory.build({
  method: 'get',
  input: getAPIKeySchemaInput,
  output: getAPIKeySchemaOutput,
  handler: async ({
    input,
  }: {
    input: z.infer<typeof getAPIKeySchemaInput>;
  }) => {
    const data = await apiKeyService.getApiKey(input.cursorId, input.limit);

    if (!data) throw createHttpError(404, 'Not found');

    return { apiKeys: data };
  },
});

export const addAPIKeySchemaInput = z.object({
  usageLimited: z.boolean().default(false),
  maxUsageCredits: z
    .number({ coerce: true })
    .int()
    .min(0)
    .max(1000000)
    .default(0),
  permission: z.nativeEnum(Permission).default(Permission.User),
});

export const addAPIKeySchemaOutput = z.object({
  id: z.string(),
  token: z.string(),
  permission: z.nativeEnum(Permission),
  usageLimited: z.boolean(),
  maxUsageCredits: z
    .number({ coerce: true })
    .int()
    .min(0)
    .max(1000000)
    .nullable(),
  accumulatedUsageCredits: z.number({ coerce: true }).int().min(0).max(1000000),
  status: z.nativeEnum(APIKeyStatus),
});

export const addAPIKeyEndpointPost = adminAuthenticatedEndpointFactory.build({
  method: 'post',
  input: addAPIKeySchemaInput,
  output: addAPIKeySchemaOutput,
  handler: async ({
    input,
  }: {
    input: z.infer<typeof addAPIKeySchemaInput>;
  }) => {
    const result = await apiKeyService.addApiKey(
      input.permission,
      input.usageLimited,
      input.maxUsageCredits
    );
    return result;
  },
});

export const updateAPIKeySchemaInput = z.object({
  token: z.string().max(550),
  usageLimited: z.boolean().default(false),
  maxUsageCredits: z
    .number({ coerce: true })
    .int()
    .min(0)
    .max(1000000)
    .default(0),
  status: z.nativeEnum(APIKeyStatus).default(APIKeyStatus.Active),
});

export const updateAPIKeySchemaOutput = z.object({
  token: z.string(),
  permission: z.nativeEnum(Permission),
  usageLimited: z.boolean(),
  maxUsageCredits: z
    .number({ coerce: true })
    .int()
    .min(0)
    .max(1000000)
    .nullable(),
  accumulatedUsageCredits: z.number({ coerce: true }).int().min(0).max(1000000),
  status: z.nativeEnum(APIKeyStatus),
});

export const updateAPIKeyEndpointPatch =
  adminAuthenticatedEndpointFactory.build({
    method: 'patch',
    input: updateAPIKeySchemaInput,
    output: updateAPIKeySchemaOutput,
    handler: async ({
      input,
    }: {
      input: z.infer<typeof updateAPIKeySchemaInput>;
    }) => {
      const result = await apiKeyService.updateApiKey(
        input.token,
        input.status,
        input.usageLimited,
        input.maxUsageCredits
      );
      if (!result) throw createHttpError(404, 'Not found');

      return result;
    },
  });

export const deleteAPIKeySchemaInput = z.object({
  token: z.string().max(550),
});

export const deleteAPIKeySchemaOutput = z.object({
  token: z.string(),
});

export const deleteAPIKeyEndpointDelete =
  adminAuthenticatedEndpointFactory.build({
    method: 'delete',
    input: deleteAPIKeySchemaInput,
    output: deleteAPIKeySchemaOutput,
    handler: async ({
      input,
    }: {
      input: z.infer<typeof deleteAPIKeySchemaInput>;
    }) => {
      const result = await apiKeyService.deleteApiKey(input.token);

      if (!result) throw createHttpError(404, 'Not found');

      return result;
    },
  });

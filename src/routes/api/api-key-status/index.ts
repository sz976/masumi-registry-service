import { authenticatedEndpointFactory } from '@/utils/endpoint-factory/authenticated';
import { z } from 'zod';
import { APIKeyStatus, Permission } from '@prisma/client';
import createHttpError from 'http-errors';
import { apiKeyStatusService } from '@/services/api-key-status/api-key-status.service';

export const getAPIKeyStatusSchemaInput = z.object({});

export const getAPIKeyStatusSchemaOutput = z.object({
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

export const queryAPIKeyStatusEndpointGet = authenticatedEndpointFactory.build({
  method: 'get',
  input: getAPIKeyStatusSchemaInput,
  output: getAPIKeyStatusSchemaOutput,
  handler: async ({
    options,
  }: {
    options: {
      id: string;
    };
  }) => {
    const data = await apiKeyStatusService.getApiKeyStatus(options.id);

    if (!data) throw createHttpError(404, 'Not found');

    return data;
  },
});

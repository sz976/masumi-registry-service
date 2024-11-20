import { healthService } from '@/services/health';
import { unauthenticatedEndpointFactory } from '@/utils/endpoint-factory/unauthenticated';
import { z } from 'zod';

export const healthResponseSchema = z.object({
    type: z.string(),
    version: z.string(),
});

export const healthEndpointGet = unauthenticatedEndpointFactory.build({
    method: "get",
    input: z.object({
    }),
    output: healthResponseSchema,
    handler: async ({ input: { }, options, logger }) => {
        const healthConfiguration = await healthService.getHealthConfiguration();
        return healthConfiguration;
    },
});

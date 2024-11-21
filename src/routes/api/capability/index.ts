import { capabilityService } from '@/services/capability/capability.service';
import { tokenCreditService } from '@/services/token-credit/token-credit.service';
import { authenticatedEndpointFactory } from '@/utils/endpoint-factory/authenticated';
import { z } from 'zod';

export const capabilitySchemaInput = z.object({
    limit: z.number({ coerce: true }).min(1).max(100).default(10),
    cursorId: z.string().optional(),
});

export const capabilitySchemaOutput = z.object({
    capabilities: z.array(z.object({
        id: z.string(),
        name: z.string(),
        version: z.string(),
    }))
});

export const capabilityGet = authenticatedEndpointFactory.build({
    method: "get",
    input: capabilitySchemaInput,
    output: capabilitySchemaOutput,
    handler: async ({ input: { limit, cursorId }, options }) => {
        const tokenCost = 0;
        //TODO update cost model
        await tokenCreditService.handleTokenCredits(options, tokenCost, "query for capability with limit: " + limit);
        const data = await capabilityService.getCapabilities(cursorId, limit)
        return { capabilities: data }
    },
});

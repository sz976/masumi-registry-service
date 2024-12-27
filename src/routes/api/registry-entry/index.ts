import { authenticatedEndpointFactory } from '@/utils/endpoint-factory/authenticated';
import { z } from 'zod';
import { ez } from "express-zod-api";
import { tokenCreditService } from '@/services/token-credit';
import { $Enums } from '@prisma/client';
import { registryEntryService } from '@/services/registry-entry';

export const queryRegistrySchemaInput = z.object({
    capability: z.object({ name: z.string().min(1).max(150), version: z.string().max(150).optional() }).optional(),
    limit: z.number({ coerce: true }).int().min(1).max(50).default(10),
    //optional data
    cursorId: z.string().min(1).max(50).optional(),
    minRegistryDate: ez.dateIn().optional(),
    minHealthCheckDate: ez.dateIn().optional(),
    //might be used in the future
    //allowDecentralizedPayment: z.boolean().optional().default(true),
    //allowCentralizedPayment: z.boolean().optional().default(true),
})

export const queryRegistrySchemaOutput = z.object({
    entries: z.array(z.object(
        {
            registry: z.object({
                type: z.nativeEnum($Enums.RegistryEntryType),
                identifier: z.string().nullable(),
                url: z.string().nullable(),
            }),
            paymentIdentifier: z.array(z.object({
                paymentIdentifier: z.string().nullable(),
                paymentType: z.nativeEnum($Enums.PaymentType),
            })),
            capability: z.object({
                name: z.string(),
                version: z.string(),
                description: z.string().nullable(),
            }),
            name: z.string(),
            description: z.string().nullable(),
            status: z.nativeEnum($Enums.Status),
            id: z.string(),
            lastUptimeCheck: ez.dateOut(),
            uptimeCount: z.number(),
            uptimeCheckCount: z.number(),
            api_url: z.string(),
            author_name: z.string().nullable(),
            author_organization: z.string().nullable(),
            author_contact: z.string().nullable(),
            image: z.string().nullable(),
            privacy_policy: z.string().nullable(),
            terms_and_condition: z.string().nullable(),
            other_legal: z.string().nullable(),
            requests_per_hour: z.number().nullable(),
            tags: z.array(z.object({
                value: z.string()
            })).nullable(),
            identifier: z.string(),
        }
    ))
});

export const queryRegistryEntryGet = authenticatedEndpointFactory.build({
    method: "get",
    input: queryRegistrySchemaInput,
    output: queryRegistrySchemaOutput,
    handler: async ({ input, options, logger }) => {
        logger.info("Querying registry", input.paymentTypes);
        const tokenCost = 0;
        //TODO update cost model
        //TODO add custom errors
        await tokenCreditService.handleTokenCredits(options, tokenCost, "query for: " + input.capability?.name);
        const data = await registryEntryService.getRegistryEntries(input);

        return { entries: data.slice(0, Math.min(input.limit, data.length)) }
    },
});

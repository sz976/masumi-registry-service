import { authenticatedEndpointFactory } from '@/utils/endpoint-factory/authenticated';
import { z } from 'zod';
import { ez } from "express-zod-api";
import { $Enums } from '@prisma/client';
import { tokenCreditService } from '@/services/token-credit';
import { paymentInformationRepository } from '@/repositories/payment-information';


export const queryPaymentInformationInput = z.object({
    registryIdentifier: z.string().min(1).max(250),
    assetIdentifier: z.string().min(1).max(250),
})

export const queryPaymentInformationSchemaOutput = z.object({
    registry: z.object({
        type: z.nativeEnum($Enums.RegistryEntryType),
        identifier: z.string().nullable(),
        url: z.string().nullable(),
    }),
    paymentIdentifier: z.array(z.object({
        paymentIdentifier: z.string().nullable(),
        paymentType: z.nativeEnum($Enums.PaymentType),
        sellerVKey: z.string().nullable(),
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
});

export const queryPaymentInformationGet = authenticatedEndpointFactory.build({
    method: "get",
    input: queryPaymentInformationInput,
    output: queryPaymentInformationSchemaOutput,
    handler: async ({ input, options, logger }) => {
        logger.info("Querying registry", input.paymentTypes);
        const tokenCost = 0;
        await tokenCreditService.handleTokenCredits(options, tokenCost, "query for payment information: " + input.assetIdentifier);
        const result = await paymentInformationRepository.getPaymentInformation(input.assetIdentifier, input.registryIdentifier);
        if (!result) {
            throw new Error("Payment information not found");
        }

        return result;
    },
});

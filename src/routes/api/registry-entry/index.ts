import { authenticatedEndpointFactory } from '@/utils/endpoint-factory/authenticated';
import { z } from 'zod';
import { ez } from 'express-zod-api';
import { tokenCreditService } from '@/services/token-credit';
import { $Enums, Network } from '@prisma/client';
import { registryEntryService } from '@/services/registry-entry';

export const queryRegistrySchemaInput = z.object({
  network: z.nativeEnum(Network),
  limit: z.number({ coerce: true }).int().min(1).max(50).default(10),
  //optional data
  cursorId: z.string().min(1).max(50).optional(),
  filter: z
    .object({
      paymentTypes: z.array(z.nativeEnum($Enums.PaymentType)).max(5).optional(),
      status: z.array(z.nativeEnum($Enums.Status)).max(5).optional(),
      policyId: z.string().min(1).max(250).optional(),
      assetName: z.string().min(1).max(250).optional(),
      tags: z.array(z.string().min(1).max(150)).optional(),
      capability: z
        .object({
          name: z.string().min(1).max(150),
          version: z.string().max(150).optional(),
        })
        .optional(),
    })
    .optional(),
  //force refresh
  minRegistryDate: ez.dateIn().optional(),
  minHealthCheckDate: ez.dateIn().optional(),
});

export const queryRegistrySchemaOutput = z.object({
  entries: z.array(
    z.object({
      RegistrySource: z.object({
        id: z.string(),
        type: z.nativeEnum($Enums.RegistryEntryType),
        policyId: z.string().nullable(),
        url: z.string().nullable(),
      }),
      Capability: z.object({
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
      apiUrl: z.string(),
      authorName: z.string().nullable(),
      authorOrganization: z.string().nullable(),
      authorContact: z.string().nullable(),
      image: z.string().nullable(),
      privacyPolicy: z.string().nullable(),
      termsAndCondition: z.string().nullable(),
      otherLegal: z.string().nullable(),
      requestsPerHour: z.number().nullable(),
      tags: z.array(z.string()).nullable(),
      agentIdentifier: z.string(),
      Prices: z.array(
        z.object({
          quantity: z.number(),
          unit: z.string(),
        })
      ),
    })
  ),
});

export const queryRegistryEntryPost = authenticatedEndpointFactory.build({
  method: 'post',
  input: queryRegistrySchemaInput,
  output: queryRegistrySchemaOutput,
  handler: async ({ input, options, logger }) => {
    logger.info('Querying registry', input.paymentTypes);
    const tokenCost = 0;
    //TODO update cost model
    //TODO add custom errors
    await tokenCreditService.handleTokenCredits(
      options,
      tokenCost,
      'query for: ' + input.filter?.capability?.name
    );
    const data = await registryEntryService.getRegistryEntries(input);

    return {
      entries: data
        .slice(0, Math.min(input.limit, data.length))
        .map((entry) => ({
          ...entry,
          RegistrySource: {
            ...entry.RegistrySource,
            policyId: entry.RegistrySource.identifier,
          },
          agentIdentifier: entry.identifier,
          Prices: entry.Prices.map((price) => ({
            ...price,
            quantity: Number(price.quantity),
          })),
        })),
    };
  },
});

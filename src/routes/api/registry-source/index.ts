import { adminAuthenticatedEndpointFactory } from '@/utils/endpoint-factory/admin-authenticated';
import { z } from 'zod';
import { $Enums } from '@prisma/client';
import { registrySourceService } from '@/services/registry-source';

export const getRegistrySourceSchemaInput = z.object({
  cursorId: z.string().max(550).optional(),
  limit: z.number({ coerce: true }).int().min(1).max(50).default(10),
});

export const getRegistrySourceSchemaOutput = z.object({
  sources: z.array(
    z.object({
      id: z.string(),
      type: z.nativeEnum($Enums.RegistryEntryType),
      url: z.string().nullable(),
      policyId: z.string().nullable(),
      note: z.string().nullable(),
      latestPage: z.number({ coerce: true }).int().min(0).max(1000000),
      latestIdentifier: z.string().nullable(),
      rpcProviderApiKey: z.string().nullable(),
      network: z.nativeEnum($Enums.Network).nullable(),
    })
  ),
});

export const queryRegistrySourceEndpointGet =
  adminAuthenticatedEndpointFactory.build({
    method: 'get',
    input: getRegistrySourceSchemaInput,
    output: getRegistrySourceSchemaOutput,
    handler: async ({ input }) => {
      const data = await registrySourceService.getRegistrySources(
        input.cursorId,
        input.limit
      );
      return {
        sources: data.map((source) => ({
          ...source,
          rpcProviderApiKey: source.RegistrySourceConfig.rpcProviderApiKey,
        })),
      };
    },
  });

export const addRegistrySourceSchemaInput = z.object({
  type: z.nativeEnum($Enums.RegistryEntryType),
  policyId: z.string(),
  note: z.string().nullable(),
  rpcProviderApiKey: z.string(),
  network: z.nativeEnum($Enums.Network).nullable(),
});

export const addRegistrySourceSchemaOutput = z.object({
  id: z.string(),
});

export const addRegistrySourceEndpointPost =
  adminAuthenticatedEndpointFactory.build({
    method: 'post',
    input: addRegistrySourceSchemaInput,
    output: addRegistrySourceSchemaOutput,
    handler: async ({ input }) => {
      const result = await registrySourceService.addRegistrySource(input);
      return result;
    },
  });

export const updateRegistrySourceSchemaInput = z.object({
  id: z.string().max(150).optional(),
  note: z.string().nullable().optional(),
  rpcProviderApiKey: z.string().optional(),
});

export const updateRegistrySourceSchemaOutput = z.object({
  id: z.string(),
});

export const updateRegistrySourceEndpointPatch =
  adminAuthenticatedEndpointFactory.build({
    method: 'patch',
    input: updateRegistrySourceSchemaInput,
    output: updateRegistrySourceSchemaOutput,
    handler: async ({ input }) => {
      const result = await registrySourceService.updateRegistrySource(input);
      return result;
    },
  });

export const deleteRegistrySourceSchemaInput = z.object({
  id: z.string().max(150),
});

export const deleteRegistrySourceSchemaOutput = z.object({
  id: z.string(),
});

export const deleteRegistrySourceEndpointDelete =
  adminAuthenticatedEndpointFactory.build({
    method: 'delete',
    input: deleteRegistrySourceSchemaInput,
    output: deleteRegistrySourceSchemaOutput,
    handler: async ({ input }) => {
      const result = await registrySourceService.deleteRegistrySource(input.id);
      return result;
    },
  });

import { prisma } from '@/utils/db';
import { Network, PaymentType, Status } from '@prisma/client';

async function getRegistryEntry(
  capability:
    | { name: string | undefined; version: string | undefined }
    | undefined,
  allowedPaymentTypes: PaymentType[],
  allowedStatuses: Status[],
  currentRegistryPolicyId: string | undefined,
  currentAssetIdentifier: string | undefined,
  tags: string[] | undefined,
  currentCursorId: string | undefined,
  limit: number,
  network: Network
) {
  return await prisma.registryEntry.findMany({
    where: {
      Capability: capability,
      PaymentIdentifier: { some: { paymentType: { in: allowedPaymentTypes } } },
      status: { in: allowedStatuses },
      assetName: currentAssetIdentifier,
      RegistrySource: {
        policyId: currentRegistryPolicyId,
        network: network,
      },
      tags: tags ? { hasSome: tags } : undefined,
    },
    include: {
      Capability: true,
      RegistrySource: true,
      AgentPricing: {
        include: { FixedPricing: { include: { Amounts: true } } },
      },
    },
    orderBy: [
      {
        createdAt: 'desc',
      },
      {
        id: 'desc',
      },
    ],
    cursor: currentCursorId ? { id: currentCursorId } : undefined,
    //over-fetching to account for health check failures
    take: limit * 2,
  });
}

export const registryEntryRepository = { getRegistryEntry };

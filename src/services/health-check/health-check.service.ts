import { prisma } from '@/utils/db';
import { logger } from '@/utils/logger';
import {
  $Enums,
  Capability,
  RegistryEntry,
  RegistrySource,
} from '@prisma/client';

async function checkAndVerifyEndpoint({
  api_url,
  assetName,
  registry,
}: {
  api_url: string;
  assetName: string;
  registry: { policyId: string; type: $Enums.RegistryEntryType };
}) {
  try {
    const endpointResponse = await fetch(api_url);
    if (!endpointResponse.ok) {
      //if the endpoint is offline, we probably want to do some later on checks if it is back up again
      return $Enums.Status.Offline;
    }

    const responseBody = await endpointResponse.json();
    //we need to verify the registry points to the correct url to prevent a later registry providing a wrong payment address
    //if the registry is wrong, we usually want to invalidate the entry in the database and exclude it from further checks
    return responseBody.agentIdentifier === registry.policyId + assetName &&
      responseBody.type === registry.type
      ? $Enums.Status.Online
      : $Enums.Status.Invalid;
  } catch {
    return $Enums.Status.Offline;
  }
}
async function checkAndVerifyRegistryEntry({
  registryEntry,
  minHealthCheckDate,
}: {
  registryEntry: {
    assetName: string;
    lastUptimeCheck: Date;
    apiUrl: string;
    status: $Enums.Status;
    RegistrySource: { policyId: string; type: $Enums.RegistryEntryType };
  };
  minHealthCheckDate: Date | undefined;
}) {
  if (
    registryEntry.lastUptimeCheck.getTime() >
    (minHealthCheckDate?.getTime() ?? 0)
  ) {
    logger.info(
      'returning early',
      registryEntry.lastUptimeCheck,
      minHealthCheckDate
    );
    return registryEntry.status;
  }

  return await checkAndVerifyEndpoint({
    api_url: registryEntry.apiUrl,
    assetName: registryEntry.assetName,
    registry: registryEntry.RegistrySource,
  });
}

async function checkVerifyAndUpdateRegistryEntries({
  registryEntries,
  minHealthCheckDate,
}: {
  registryEntries: (RegistryEntry & {
    RegistrySource: RegistrySource;
    Capability: Capability;
    tags: string[];
    Prices: { quantity: bigint; unit: string }[];
  })[];
  minHealthCheckDate: Date | undefined;
}) {
  if (minHealthCheckDate == null) return registryEntries;

  return await Promise.all(
    registryEntries.map(async (entry) => {
      const registrySource = entry.RegistrySource;
      if (registrySource == null || registrySource.policyId == null) {
        logger.error('registrySource is null', entry);
        return entry;
      }
      const status = await checkAndVerifyRegistryEntry({
        registryEntry: {
          ...entry,
        },
        minHealthCheckDate: minHealthCheckDate,
      });
      return await prisma.registryEntry.update({
        where: { id: entry.id },
        //select all fields
        select: {
          Prices: true,
          capabilitiesId: true,
          createdAt: true,
          Capability: true,
          RegistrySource: true,
          PaymentIdentifier: true,
          apiUrl: true,
          assetName: true,
          name: true,
          description: true,
          authorName: true,
          authorOrganization: true,
          authorContact: true,
          image: true,
          otherLegal: true,
          privacyPolicy: true,
          requestsPerHour: true,
          tags: true,
          termsAndCondition: true,
          id: true,
          status: true,
          uptimeCount: true,
          uptimeCheckCount: true,
          lastUptimeCheck: true,
          registrySourceId: true,
          updatedAt: true,
        },
        data: {
          status,
          uptimeCount: { increment: status == $Enums.Status.Online ? 1 : 0 },
          uptimeCheckCount: { increment: 1 },
          lastUptimeCheck: new Date(),
        },
      });
    })
  );
}

export const healthCheckService = {
  checkAndVerifyEndpoint,
  checkAndVerifyRegistryEntry,
  checkVerifyAndUpdateRegistryEntries,
};

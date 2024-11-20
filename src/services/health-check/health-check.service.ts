import { prisma } from "@/utils/db";
import { $Enums, RegistryEntry, RegistrySources } from "@prisma/client";

async function checkAndVerifyEndpoint({ api_url, identifier, registry }: { api_url: string, identifier: string, registry: { identifier: string | null, type: $Enums.RegistryEntryType } }) {
    const endpointResponse = await fetch(api_url)
    if (!endpointResponse.ok) {
        //if the endpoint is offline, we probably want to do some later on checks if it is back up again
        return $Enums.Status.OFFLINE
    }


    if (registry.identifier == null) {
        throw new Error("Registry identifier is null for decentralized registry")
    }

    const responseBody = await endpointResponse.json()

    //we need to verify the registry points to the correct url to prevent a later registry providing a wrong payment address
    //if the registry is wrong, we usually want to invalidate the entry in the database and exclude it from further checks
    return responseBody.identifier === identifier && responseBody.registry === registry.identifier && responseBody.type === registry.type ? $Enums.Status.ONLINE : $Enums.Status.INVALID

}
async function checkAndVerifyRegistryEntry({ registryEntry, minHealthCheckDate }: { registryEntry: { identifier: string, lastUptimeCheck: Date, api_url: string, status: $Enums.Status, registry: { identifier: string | null, type: $Enums.RegistryEntryType } }, minHealthCheckDate: Date | undefined }) {
    console.log("checking registry entry", registryEntry.identifier, registryEntry.lastUptimeCheck, minHealthCheckDate)
    if (registryEntry.lastUptimeCheck.getTime() > (minHealthCheckDate?.getTime() ?? 0)) {
        console.log("returning early", registryEntry.lastUptimeCheck, minHealthCheckDate)
        return registryEntry.status
    }

    return await checkAndVerifyEndpoint({ api_url: registryEntry.api_url, identifier: registryEntry.identifier, registry: registryEntry.registry })
}

async function checkVerifyAndUpdateRegistryEntries({ registryEntries, minHealthCheckDate }: { registryEntries: (RegistryEntry & { registry: RegistrySources })[], minHealthCheckDate: Date | undefined }) {
    return await Promise.all(registryEntries.map(async (entry) => {
        const status = await checkAndVerifyRegistryEntry({ registryEntry: entry, minHealthCheckDate: minHealthCheckDate })
        return await prisma.registryEntry.update({
            where: { id: entry.id },
            //select all fields
            select: { capabilitiesId: true, createdAt: true, capability: true, registry: true, paymentIdentifier: true, api_url: true, identifier: true, name: true, description: true, company_name: true, id: true, status: true, uptimeCount: true, uptimeCheckCount: true, lastUptimeCheck: true, registrySourcesId: true, updatedAt: true },
            data: { status, uptimeCount: { increment: status == $Enums.Status.ONLINE ? 1 : 0 }, uptimeCheckCount: { increment: 1 }, lastUptimeCheck: new Date() }
        })
    }))
}

export const healthCheckService = { checkAndVerifyEndpoint, checkAndVerifyRegistryEntry, checkVerifyAndUpdateRegistryEntries }

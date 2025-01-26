import { registryEntryRepository } from "@/repositories/registry-entry";
import { queryRegistrySchemaInput } from "@/routes/api/registry-entry"
import { $Enums, Status } from "@prisma/client";
import { z } from "zod";
import { cardanoRegistryService } from "@/services/cardano-registry";
import { healthCheckService } from "@/services/health-check";
import { PaymentType } from "@prisma/client";

async function getRegistryEntries(input: z.infer<typeof queryRegistrySchemaInput>) {
    await cardanoRegistryService.updateLatestCardanoRegistryEntries(input.minRegistryDate);
    const healthCheckedEntries: Awaited<ReturnType<typeof healthCheckService.checkVerifyAndUpdateRegistryEntries>>['0'][] = [];
    let currentCursorId = input.cursorId ?? undefined
    const filter = input.filter ?? {}
    let allowedPaymentTypes: $Enums.PaymentType[] = [PaymentType.WEB3_CARDANO_V1]
    let allowedStatuses: $Enums.Status[] = [Status.ONLINE]
    if (filter.paymentTypes && filter.paymentTypes.length > 0) {
        allowedPaymentTypes = filter.paymentTypes
    }
    if (filter.status != null && filter.status.length > 0) {
        allowedStatuses = filter.status
    }
    while (healthCheckedEntries.length < input.limit) {
        const registryEntries = await registryEntryRepository.getRegistryEntry(input.filter?.capability ? { name: input.filter.capability?.name, version: input.filter.capability?.version } : undefined, allowedPaymentTypes, allowedStatuses, input.filter?.registryIdentifier, input.filter?.assetIdentifier, currentCursorId, input.limit);
        const result = await healthCheckService.checkVerifyAndUpdateRegistryEntries({ registryEntries, minHealthCheckDate: input.minHealthCheckDate })
        result.forEach(entry => healthCheckedEntries.push(entry))
        //all database entries fetched
        if (registryEntries.length < input.limit * 2)
            break;

        currentCursorId = registryEntries[registryEntries.length - 1].id
    }
    return healthCheckedEntries;
}
export const registryEntryService = { getRegistryEntries }

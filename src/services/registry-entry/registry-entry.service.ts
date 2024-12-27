import { registryEntryRepository } from "@/repositories/registry-entry";
import { queryRegistrySchemaInput } from "@/routes/api/registry-entry"
import { $Enums } from "@prisma/client";
import { z } from "zod";
import { cardanoRegistryService } from "@/services/cardano-registry";
import { healthCheckService } from "@/services/health-check";
import { PaymentType } from "@prisma/client";

async function getRegistryEntries(input: z.infer<typeof queryRegistrySchemaInput>) {
    await cardanoRegistryService.updateLatestCardanoRegistryEntries(input.minRegistryDate);
    const healthCheckedEntries: Awaited<ReturnType<typeof healthCheckService.checkVerifyAndUpdateRegistryEntries>>['0'][] = [];
    let currentCursorId = input.cursorId ?? undefined
    const allowedPaymentTypes: $Enums.PaymentType[] = [PaymentType.WEB3_CARDANO_V1]
    while (healthCheckedEntries.length < input.limit) {
        const registryEntries = await registryEntryRepository.getRegistryEntry(input.capability ? { name: input.capability?.name, version: input.capability?.version } : undefined, allowedPaymentTypes, currentCursorId ? { id: currentCursorId } : undefined, input.limit);
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

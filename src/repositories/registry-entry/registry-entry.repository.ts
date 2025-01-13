import { prisma } from "@/utils/db"
import { $Enums, PaymentType } from "@prisma/client";

async function getRegistryEntry(capability: { name: string | undefined; version: string | undefined } | undefined, allowedPaymentTypes: PaymentType[], currentRegistryIdentifier: string | undefined, currentAssetIdentifier: string | undefined, currentCursorId: string | undefined, limit: number) {
    return await prisma.registryEntry.findMany({
        where: {
            capability: capability,
            paymentIdentifier: { some: { paymentType: { in: allowedPaymentTypes } } },
            status: { not: $Enums.Status.INVALID },
            identifier: currentAssetIdentifier,
            registry: { identifier: currentRegistryIdentifier }
        },
        include: {
            capability: true,
            registry: true,
            tags: true
        },
        orderBy: [{
            createdAt: 'desc',
        }, {
            id: "desc"
        }],
        cursor: currentCursorId ? { id: currentCursorId } : undefined,
        //over-fetching to account for health check failures
        take: (limit * 2)
    });
}

export const registryEntryRepository = { getRegistryEntry }  

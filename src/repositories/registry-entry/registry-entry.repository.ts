import { prisma } from "@/utils/db"
import { PaymentType, Status } from "@prisma/client";

async function getRegistryEntry(capability: { name: string | undefined; version: string | undefined } | undefined, allowedPaymentTypes: PaymentType[], allowedStatuses: Status[], currentRegistryIdentifier: string | undefined, currentAssetIdentifier: string | undefined, tags: string[] | undefined, currentCursorId: string | undefined, limit: number) {
    return await prisma.registryEntry.findMany({
        where: {
            capability: capability,
            paymentIdentifier: { some: { paymentType: { in: allowedPaymentTypes } } },
            status: { in: allowedStatuses },
            identifier: currentAssetIdentifier,
            registry: { identifier: currentRegistryIdentifier },
            tags: { some: { value: { in: tags } } }
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

import { updateCardanoAssets } from "@/services/cardano-registry/cardano-registry.service";
import { prisma } from "@/utils/db"
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";


async function getPaymentInformation(currentAssetIdentifier: string, currentRegistryIdentifier: string,) {
    const registrySource = await prisma.registrySources.findFirst({
        where: {
            identifier: currentRegistryIdentifier
        }
    })

    if (!registrySource || !registrySource.apiKey || !registrySource.identifier) {
        return null
    }

    const registryEntry = await prisma.registryEntry.findUnique({
        where: {
            identifier_registrySourcesId: {
                identifier: currentAssetIdentifier,
                registrySourcesId: registrySource.id
            }
        },
        include: {
            paymentIdentifier: true,
            capability: true,
            registry: true,
            tags: true
        },
    });

    if (!registryEntry) {
        return null
    }

    const blockfrost = new BlockFrostAPI({
        projectId: registrySource.apiKey
    })
    const asset = await blockfrost.assetsById(registrySource.identifier + currentAssetIdentifier)
    if (!asset) {
        return null
    }
    const updatedTMP = await updateCardanoAssets([{ asset: currentAssetIdentifier, quantity: asset.quantity }], registrySource)

    if (updatedTMP.length != 1) {
        return null
    }

    return updatedTMP[0]

}

export const paymentInformationRepository = { getPaymentInformation }  
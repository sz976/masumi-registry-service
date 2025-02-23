import { updateCardanoAssets } from "@/services/cardano-registry/cardano-registry.service";
import { prisma } from "@/utils/db"
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";


async function getPaymentInformation(currentAssetIdentifier: string, currentRegistryIdentifier: string,) {
    const registrySource = await prisma.registrySource.findFirst({
        where: {
            identifier: currentRegistryIdentifier
        },
        include: {
            RegistrySourceConfig: true
        }
    })

    if (!registrySource || !registrySource.RegistrySourceConfig.rpcProviderApiKey || !registrySource.identifier) {
        return null
    }

    const registryEntry = await prisma.registryEntry.findUnique({
        where: {
            identifier_registrySourceId: {
                identifier: currentAssetIdentifier,
                registrySourceId: registrySource.id
            }
        },
        include: {
            PaymentIdentifier: true,
            Prices: true,
            Capability: true,
            RegistrySource: {
                include: {
                    RegistrySourceConfig: true
                }
            }
        },
    });

    if (!registryEntry) {
        return null
    }

    const blockfrost = new BlockFrostAPI({
        projectId: registrySource.RegistrySourceConfig.rpcProviderApiKey
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
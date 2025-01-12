import { $Enums } from "@prisma/client";
import { Sema } from "async-sema";
import { prisma } from '@/utils/db';
import { z } from "zod";
import { metadataStringConvert } from "@/utils/metadata-string-convert";
import { healthCheckService } from "@/services/health-check";
import { logger } from "@/utils/logger";
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { resolvePaymentKeyHash } from "@meshsdk/core";
import cuid2 from "@paralleldrive/cuid2";

const metadataSchema = z.object({

    /*
"name": "<name>",
"description": "<description>",
"api_url": "<api_url>",
"example_output": "<ipfs_hash>",
"version": "<version>",
"author": {
"name": "<author_name>",
"contact": "<author_contact_details>",
"organization": "<author_orga>"
},
"requests_per_hour": "request_amount",
"tags": [
"<tag>"
],
"legal": {
"privacy policy": "<url>",
"terms": "<url>",
"other": "<url>"
},
"image": "http://example.com/path/to/image.png"
    */
    name: z.string(),
    description: z.string().or(z.array(z.string())).optional(),
    api_url: z.string().url().or(z.array(z.string())),
    example_output: z.string().or(z.array(z.string())).optional(),
    capability: z.object({
        name: z.string().or(z.array(z.string())),
        version: z.string().or(z.array(z.string())),
    }),
    requests_per_hour: z.string().or(z.array(z.string())).optional(),
    author: z.object({
        name: z.string().or(z.array(z.string())).optional(),
        contact: z.string().or(z.array(z.string())).optional(),
        organization: z.string().or(z.array(z.string())).optional()
    }).optional(),
    legal: z.object({
        privacy_policy: z.string().or(z.array(z.string())),
        terms: z.string().or(z.array(z.string())),
        other: z.string().or(z.array(z.string()))
    }).optional(),
    tags: z.array(z.string().or(z.array(z.string()))).optional(),
    pricing: z.array(z.object({
        quantity: z.number({ coerce: true }).int().min(1),
        policy_id: z.string(),
        asset_id: z.string()
    })).min(1),
    image: z.string().or(z.array(z.string()))
})
const deleteMutex = new Sema(1);
export async function updateDeregisteredCardanoRegistryEntries() {
    const sources = await prisma.registrySources.findMany({
        where: {
            type: $Enums.RegistryEntryType.WEB3_CARDANO_V1,
            identifier: { not: null },
        }
    })

    if (sources.length == 0)
        return;

    const acquiredMutex = await deleteMutex.tryAcquire();
    //if we are already performing an update, we wait for it to finish and return
    if (!acquiredMutex)
        return await deleteMutex.acquire();

    await Promise.all(sources.map(async (source) => {
        try {
            const blockfrost = new BlockFrostAPI({
                projectId: source.apiKey!,
                network: source.network == $Enums.Network.MAINNET ? "mainnet" : "preview"
            });
            let cursorId = null;
            let latestAssets = await prisma.registryEntry.findMany({
                where: {
                    status: { in: [$Enums.Status.ONLINE, $Enums.Status.OFFLINE] },
                    registrySourcesId: source.id
                },
                orderBy: { lastUptimeCheck: "desc" },
                take: 50,
                cursor: cursorId != null ? { id: cursorId } : undefined
            })

            while (latestAssets.length != 0) {

                const assetsToProcess = await Promise.all(latestAssets.map(async (asset) => {
                    return await blockfrost.assetsById(asset.identifier)
                }))

                const burnedAssets = assetsToProcess.filter(a => a.quantity == "0")

                await Promise.all(burnedAssets.map(async (asset) => {
                    await prisma.registryEntry.update({
                        where: { identifier_registrySourcesId: { identifier: asset.asset, registrySourcesId: source.id } },
                        data: { status: $Enums.Status.DEREGISTERED }
                    })
                }))

                if (latestAssets.length < 50)
                    break;

                cursorId = latestAssets[latestAssets.length - 1].id
                latestAssets = await prisma.registryEntry.findMany({
                    where: {
                        status: { in: [$Enums.Status.ONLINE, $Enums.Status.OFFLINE] },
                        registrySourcesId: source.id
                    },
                    orderBy: { lastUptimeCheck: "desc" },
                    take: 50,
                    cursor: cursorId != null ? { id: cursorId } : undefined
                })

            }
            if (latestAssets.length == 0)
                return;
        } catch (error) {
            logger.error("Error updating deregistered cardano registry entries", { error: error, sourceId: source.id })
        }
        return null;
    }))
}

const updateMutex = new Sema(1);
export async function updateLatestCardanoRegistryEntries(onlyEntriesAfter?: Date | undefined) {
    logger.info("Updating cardano registry entries after: ", { onlyEntriesAfter: onlyEntriesAfter })
    if (onlyEntriesAfter == undefined)
        return;

    //we do not need any isolation level here as worst case we have a few duplicate checks in the next run but no data loss. Advantage we do not need to lock the table
    let sources = await prisma.registrySources.findMany({
        where: {
            type: $Enums.RegistryEntryType.WEB3_CARDANO_V1,
            identifier: { not: null },
            updatedAt: {
                lte: onlyEntriesAfter
            }
        }
    })

    if (sources.length == 0)
        return;

    let acquiredMutex = await updateMutex.tryAcquire();
    //if we are already performing an update, we wait for it to finish and return
    if (!acquiredMutex) {
        acquiredMutex = await updateMutex.acquire();
        sources = await prisma.registrySources.findMany({
            where: {
                type: $Enums.RegistryEntryType.WEB3_CARDANO_V1,
                identifier: { not: null },
                updatedAt: {
                    lte: onlyEntriesAfter
                }
            }
        })
        if (sources.length == 0) {
            updateMutex.release();
            return;
        }
    }

    try {
        //sanity checks
        const invalidSourcesTypes = sources.filter(s => s.type !== $Enums.RegistryEntryType.WEB3_CARDANO_V1)
        if (invalidSourcesTypes.length > 0)
            throw new Error("Invalid source types")
        const invalidSourceIdentifiers = sources.filter(s => s.identifier == null)
        if (invalidSourceIdentifiers.length > 0)
            //this should never happen unless the db is corrupted or someone played with the settings
            throw new Error("Invalid source identifiers")

        logger.debug("updating entries from sources", { count: sources.length })
        //the return variable, note that the order of the entries is not guaranteed
        const latestEntries: ({ name: string; status: $Enums.Status; description: string | null; api_url: string; author_name: string | null; author_contact: string | null; author_organization: string | null; privacy_policy: string | null; terms_and_condition: string | null; other_legal: string | null; image: string; id: string; createdAt: Date; updatedAt: Date; identifier: string; lastUptimeCheck: Date; uptimeCount: number; uptimeCheckCount: number; registrySourcesId: string; capabilitiesId: string; requests_per_hour: number | null; })[] = []
        //iterate via promises to skip await time
        await Promise.all(sources.map(async (source) => {
            try {
                const blockfrost = new BlockFrostAPI({
                    projectId: source.apiKey!,
                    network: source.network == $Enums.Network.MAINNET ? "mainnet" : source.network == $Enums.Network.PREVIEW ? "preview" : "preprod"
                });
                let pageOffset = source.latestPage
                let latestIdentifier = source.latestIdentifier
                let latestAssets = await blockfrost.assetsPolicyById(source.identifier!, { page: pageOffset, count: 100 })
                pageOffset = pageOffset + 1
                while (latestAssets.length != 0) {
                    let assetsToProcess = latestAssets
                    if (latestIdentifier != null) {
                        logger.debug("Latest identifier", { latestIdentifier: latestIdentifier })
                        const foundAsset = latestAssets.findIndex(a => a.asset === latestIdentifier)
                        //sanity check
                        if (foundAsset != -1) {
                            logger.info("found asset", { foundAsset: foundAsset })
                            //check if we have more assets to process
                            if (foundAsset + 1 < latestAssets.length) {
                                assetsToProcess = latestAssets.slice(foundAsset + 1)
                            } else {
                                //we are at the latest asset of the page
                                assetsToProcess = []
                            }
                        } else {
                            logger.info("Latest identifier not found", { latestIdentifier: latestIdentifier })
                        }

                    }

                    const updatedTMP = await updateCardanoAssets(assetsToProcess, source)
                    if (updatedTMP) {
                        latestEntries.push(...updatedTMP)
                    }
                    if (latestAssets.length > 0)
                        latestIdentifier = latestAssets[latestAssets.length - 1].asset

                    if (latestAssets.length < 100) {
                        logger.debug("No more assets to process", { latestIdentifier: latestIdentifier })
                        break;
                    }



                    latestAssets = await blockfrost.assetsPolicyById(source.identifier!, { page: pageOffset, count: 100 })
                    pageOffset = pageOffset + 1
                }
                await prisma.registrySources.update({
                    where: { id: source.id },
                    data: { latestPage: (pageOffset - 1), latestIdentifier: latestIdentifier }
                })

                latestAssets = await blockfrost.assetsPolicyById(source.identifier!, { page: pageOffset, count: 100 })
            } catch (error) {
                logger.error("Error updating cardano registry entries", { error: error, sourceId: source.id })
            }
        }))
    } finally {
        //library is strange as we can release from any non-acquired semaphore
        updateMutex.release()
    }

    //sort by sources creation date and entries creation date
    //probably unnecessary to return the entries and does not work nicely with mutex
    /*return latestEntries.sort((a, b) => {
        if (a.registrySourcesId == b.registrySourcesId)
            return a.createdAt.getTime() - b.createdAt.getTime()
        const sourceA = sources.find(s => s.id == a.registrySourcesId)
        const sourceB = sources.find(s => s.id == b.registrySourcesId)
        if (sourceA && sourceB)
            return sourceA.createdAt.getTime() - sourceB.createdAt.getTime()
        return 0
    })*/
}

export const updateCardanoAssets = async (latestAssets: { asset: string, quantity: string }[], source: { id: string, identifier: string | null, apiKey: string | null, network: $Enums.Network | null }) => {
    logger.info(`updating ${latestAssets.length} cardano assets`)
    //note that the order of the entries is not guaranteed at this point
    const resultingUpdates = await Promise.all(latestAssets.map(async (asset) => {
        if (source.network == null)
            throw new Error("Source network is not set")
        if (source.apiKey == null)
            throw new Error("Source api key is not set")

        logger.debug("updating asset", { asset: asset.asset, quantity: asset.quantity })
        //we will allow only unique tokens (integer quantities) via smart contract, therefore we do not care about large numbers
        const quantity = parseInt(asset.quantity)
        if (quantity == 0) {
            //TOKEN is deregistered we will update the status and return null
            await prisma.registryEntry.upsert({
                where: {
                    identifier_registrySourcesId: {
                        identifier: asset.asset,
                        registrySourcesId: source.id
                    }
                },
                update: { status: $Enums.Status.DEREGISTERED },
                create: {
                    status: $Enums.Status.DEREGISTERED,
                    capability: { connectOrCreate: { create: { name: "", version: "" }, where: { name_version: { name: "", version: "" } } } },
                    identifier: asset.asset,
                    registry: { connect: { id: source.id } },
                    name: "?",
                    description: "?",
                    api_url: "?_" + cuid2.createId(),
                    image: "?",
                    lastUptimeCheck: new Date()
                }
            })
            return null;
        }

        const blockfrost = new BlockFrostAPI({
            projectId: source.apiKey!,
            network: source.network == $Enums.Network.MAINNET ? "mainnet" : source.network == $Enums.Network.PREVIEW ? "preview" : "preprod"
        });

        const registryData = await blockfrost.assetsById(asset.asset)
        const holderData = await blockfrost.assetsAddresses(asset.asset, { order: "desc" })
        const onchainMetadata = registryData.onchain_metadata
        const parsedMetadata = metadataSchema.safeParse(onchainMetadata)

        //if the metadata is not valid or the token has no holder -> is burned, we skip it
        if (!parsedMetadata.success || holderData.length < 1)
            return null;

        //check endpoint
        const endpoint = metadataStringConvert(parsedMetadata.data.api_url)!
        const isAvailable = await healthCheckService.checkAndVerifyEndpoint({ api_url: endpoint, identifier: asset.asset, registry: { identifier: source.identifier!, type: $Enums.RegistryEntryType.WEB3_CARDANO_V1 } })

        return await prisma.$transaction(async (tx) => {
            const duplicateEntry = await tx.registryEntry.findFirst({
                where: {
                    registrySourcesId: source.id,
                    api_url: metadataStringConvert(parsedMetadata.data.api_url)!,
                    identifier: { not: asset.asset }
                }
            })
            if (duplicateEntry) {
                //TODO this can be removed if we want to allow re registration of the same agent (url)
                //WARNING this also only works if the api url does not accept any query parameters or similar
                logger.info("Someone tried to duplicate an entry for the same api url", { duplicateEntry: duplicateEntry })
                return null;
            }
            const existingEntry = await tx.registryEntry.findUnique({
                where: {
                    identifier_registrySourcesId: {
                        identifier: asset.asset,
                        registrySourcesId: source.id
                    }
                }
            })

            let newEntry;
            if (existingEntry) {
                //TODO this can be ignored unless we allow updates to the registry entry
                const capability_name = metadataStringConvert(parsedMetadata.data.capability.name)!
                const capability_version = metadataStringConvert(parsedMetadata.data.capability.version)!
                const requests_per_hour_string = metadataStringConvert(parsedMetadata.data.requests_per_hour)
                let requests_per_hour = undefined;
                try {
                    if (requests_per_hour_string)
                        requests_per_hour = parseFloat(requests_per_hour_string)
                } catch { /* ignore */ }
                newEntry = await tx.registryEntry.update({
                    include: {
                        registry: true,
                        paymentIdentifier: true,
                        capability: true
                    },
                    where: {
                        identifier_registrySourcesId: {
                            identifier: asset.asset,
                            registrySourcesId: source.id
                        }
                    },
                    data: {
                        lastUptimeCheck: new Date(),
                        uptimeCount: { increment: isAvailable == $Enums.Status.ONLINE ? 1 : 0 },
                        uptimeCheckCount: { increment: 1 },
                        status: isAvailable,
                        name: parsedMetadata.data.name,
                        description: metadataStringConvert(parsedMetadata.data.description),
                        api_url: metadataStringConvert(parsedMetadata.data.api_url)!,
                        author_name: metadataStringConvert(parsedMetadata.data.author?.name),
                        author_organization: metadataStringConvert(parsedMetadata.data.author?.organization),
                        author_contact: metadataStringConvert(parsedMetadata.data.author?.contact),
                        image: metadataStringConvert(parsedMetadata.data.image),
                        privacy_policy: metadataStringConvert(parsedMetadata.data.legal?.privacy_policy),
                        terms_and_condition: metadataStringConvert(parsedMetadata.data.legal?.terms),
                        other_legal: metadataStringConvert(parsedMetadata.data.legal?.other),
                        requests_per_hour: requests_per_hour,
                        tags: parsedMetadata.data.tags ? {
                            connectOrCreate: parsedMetadata.data.tags.map(tag => ({
                                create: { value: metadataStringConvert(tag)! },
                                where: { value: metadataStringConvert(tag)! }
                            }))
                        } : undefined,
                        prices: {
                            connectOrCreate: parsedMetadata.data.pricing.map(price => ({
                                create: { quantity: price.quantity, policyId: price.policy_id, assetId: price.asset_id },
                                where: { quantity_policyId_assetId_registryEntryId: { quantity: price.quantity, policyId: price.policy_id, assetId: price.asset_id, registryEntryId: existingEntry.id } }
                            })),
                        },
                        paymentIdentifier: {
                            upsert: {
                                create: {
                                    paymentIdentifier: holderData[0].address,
                                    sellerVKey: resolvePaymentKeyHash(holderData[0].address),
                                    paymentType: $Enums.PaymentType.WEB3_CARDANO_V1
                                },
                                update: {
                                    sellerVKey: resolvePaymentKeyHash(holderData[0].address),
                                    paymentIdentifier: holderData[0].address,
                                    paymentType: $Enums.PaymentType.WEB3_CARDANO_V1
                                },
                                where: {
                                    registryEntryId_paymentType: {
                                        registryEntryId: existingEntry.id,
                                        paymentType: $Enums.PaymentType.WEB3_CARDANO_V1
                                    }
                                }
                            }
                        },
                        identifier: asset.asset,
                        registry: { connect: { id: source.id } },
                        capability: { connectOrCreate: { create: { name: capability_name, version: capability_version }, where: { name_version: { name: capability_name, version: capability_version } } } }
                    }
                })
            } else {
                const capability_name = metadataStringConvert(parsedMetadata.data.capability.name)!
                const capability_version = metadataStringConvert(parsedMetadata.data.capability.version)!
                const requests_per_hour_string = metadataStringConvert(parsedMetadata.data.requests_per_hour)
                let requests_per_hour = undefined;
                try {
                    if (requests_per_hour_string)
                        requests_per_hour = parseFloat(requests_per_hour_string)
                } catch { /* ignore */ }
                await tx.registryEntry.create({
                    include: {
                        registry: true,
                        paymentIdentifier: true,
                        capability: true
                    },
                    data: {
                        lastUptimeCheck: new Date(),
                        uptimeCount: isAvailable == $Enums.Status.ONLINE ? 1 : 0,
                        uptimeCheckCount: 1,
                        status: isAvailable,
                        name: parsedMetadata.data.name,
                        description: metadataStringConvert(parsedMetadata.data.description),
                        api_url: metadataStringConvert(parsedMetadata.data.api_url)!,
                        author_name: metadataStringConvert(parsedMetadata.data.author?.name),
                        author_organization: metadataStringConvert(parsedMetadata.data.author?.organization),
                        author_contact: metadataStringConvert(parsedMetadata.data.author?.contact),
                        image: metadataStringConvert(parsedMetadata.data.image)!,
                        privacy_policy: metadataStringConvert(parsedMetadata.data.legal?.privacy_policy),
                        terms_and_condition: metadataStringConvert(parsedMetadata.data.legal?.terms),
                        other_legal: metadataStringConvert(parsedMetadata.data.legal?.other),
                        requests_per_hour: requests_per_hour,
                        tags: parsedMetadata.data.tags ? {
                            connectOrCreate: parsedMetadata.data.tags.map(tag => ({
                                create: { value: metadataStringConvert(tag)! },
                                where: { value: metadataStringConvert(tag)! }
                            }))
                        } : undefined,
                        prices: {
                            create: parsedMetadata.data.pricing.map(price => ({
                                quantity: price.quantity,
                                policyId: price.policy_id,
                                assetId: price.asset_id
                            })),
                        },
                        identifier: asset.asset,
                        paymentIdentifier: { create: { paymentIdentifier: holderData[0].address, paymentType: $Enums.PaymentType.WEB3_CARDANO_V1, sellerVKey: resolvePaymentKeyHash(holderData[0].address) } },
                        registry: { connect: { id: source.id } },
                        capability: { connectOrCreate: { create: { name: capability_name, version: capability_version }, where: { name_version: { name: capability_name, version: capability_version } } } }
                    },
                })
            }

            return newEntry;
        }, { maxWait: 50000, timeout: 10000 })
    }))

    //filter out nulls -> tokens not following the metadata standard and burned tokens
    const resultingUpdatesFiltered = resultingUpdates.filter(x => x != null)
    //sort entries by creation date
    return resultingUpdatesFiltered.sort((a, b) => (a.createdAt.getTime() - b.createdAt.getTime()))
}

export const cardanoRegistryService = { updateLatestCardanoRegistryEntries, updateCardanoAssets }
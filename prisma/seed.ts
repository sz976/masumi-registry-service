import { $Enums, Network, PrismaClient, RPCProvider } from '@prisma/client';
import dotenv from 'dotenv';
import { DEFAULTS } from '../src/utils/config';
dotenv.config();
const prisma = new PrismaClient();
export const seed = async (prisma: PrismaClient) => {
  const adminKey = process.env.ADMIN_KEY;
  if (adminKey != null) {
    if (adminKey.length < 15) throw Error('API-KEY is insecure');
    console.log('ADMIN_KEY is seeded');
    await prisma.apiKey.upsert({
      create: { token: adminKey, permission: 'ADMIN', status: 'ACTIVE' },
      update: { token: adminKey, permission: 'ADMIN', status: 'ACTIVE' },
      where: { token: adminKey },
    });

  } else {
    console.log('ADMIN_KEY is seeded');
  }

  const registrySourceIdentifierPreprod = DEFAULTS.REGISTRY_POLICY_ID_PREPROD
  if (process.env.BLOCKFROST_API_KEY_PREPROD != null) {
    console.log('REGISTRY_SOURCE_IDENTIFIER_CARDANO_PREPROD is seeded');
    await prisma.registrySource.upsert({
      create: {
        type: $Enums.RegistryEntryType.WEB3_CARDANO_V1,
        network: Network.PREPROD,
        note: 'Created via seeding',
        identifier: registrySourceIdentifierPreprod,
        RegistrySourceConfig: {
          create: {
            rpcProvider: RPCProvider.BLOCKFROST,
            rpcProviderApiKey: process.env.BLOCKFROST_API_KEY_PREPROD,
          },
        },
      },
      update: {},
      where: {
        type_identifier: {
          type: $Enums.RegistryEntryType.WEB3_CARDANO_V1,
          identifier: registrySourceIdentifierPreprod,
        },
      },
    });
  } else {
    console.log('REGISTRY_SOURCE_IDENTIFIER_CARDANO_PREPROD is not seeded');
  }

  const registrySourceIdentifierMainnet = DEFAULTS.REGISTRY_POLICY_ID_MAINNET
  if (process.env.BLOCKFROST_API_KEY_MAINNET != null) {
    console.log('REGISTRY_SOURCE_IDENTIFIER_CARDANO_MAINNET is seeded');
    await prisma.registrySource.upsert({
      create: {
        type: $Enums.RegistryEntryType.WEB3_CARDANO_V1,
        network: Network.MAINNET,
        note: 'Created via seeding',
        identifier: registrySourceIdentifierMainnet,
        RegistrySourceConfig: {
          create: {
            rpcProvider: RPCProvider.BLOCKFROST,
            rpcProviderApiKey: process.env.BLOCKFROST_API_KEY_MAINNET,
          },
        },
      },
      update: {},
      where: {
        type_identifier: {
          type: $Enums.RegistryEntryType.WEB3_CARDANO_V1,
          identifier: registrySourceIdentifierMainnet,
        },
      },
    });
  } else {
    console.log('REGISTRY_SOURCE_IDENTIFIER_CARDANO_MAINNET is not seeded');
  }
};
seed(prisma)
  .then(() => {
    prisma.$disconnect();
    console.log('Seed completed');
  })
  .catch((e) => {
    prisma.$disconnect();
    console.error(e);
  });

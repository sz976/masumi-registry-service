import { $Enums, Network, PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
export const seed = async (prisma: PrismaClient) => {
  const adminKey = process.env.ADMIN_KEY;
  if (adminKey != null) {
    if (adminKey.length < 15) throw Error('API-KEY is insecure');
    console.log('ADMIN_KEY is seeded');
    await prisma.apiKey.upsert({
      create: { apiKey: adminKey, permission: 'ADMIN', status: 'ACTIVE' },
      update: { apiKey: adminKey, permission: 'ADMIN', status: 'ACTIVE' },
      where: { apiKey: adminKey },
    });
  } else {
    console.log('ADMIN_KEY is seeded');
  }

  const registrySourceIdentifierPreprod = "b0fcefada74bec0132dbd01c01a631ead4473d0e0e566f69dd698c57"
  if (process.env.BLOCKFROST_API_KEY_PREPROD != null) {
    console.log('REGISTRY_SOURCE_IDENTIFIER_CARDANO_PREPROD is seeded');
    await prisma.registrySources.upsert({
      create: {
        type: $Enums.RegistryEntryType.WEB3_CARDANO_V1,
        network: Network.PREPROD,
        note: 'Created via seeding',
        identifier: registrySourceIdentifierPreprod,
        apiKey: process.env.BLOCKFROST_API_KEY_PREPROD,
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

  const registrySourceIdentifierMainnet = "0af294ef7fc26bceb20dd36ea556e8829b8ccaa743f1c66993d1b52a"
  if (process.env.BLOCKFROST_API_KEY_MAINNET != null) {
    console.log('REGISTRY_SOURCE_IDENTIFIER_CARDANO_MAINNET is seeded');
    await prisma.registrySources.upsert({
      create: {
        type: $Enums.RegistryEntryType.WEB3_CARDANO_V1,
        network: Network.MAINNET,
        note: 'Created via seeding',
        identifier: registrySourceIdentifierMainnet,
        apiKey: process.env.BLOCKFROST_API_KEY_MAINNET,
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

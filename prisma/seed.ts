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

  const registrySourceIdentifierPreprod = "398a61a6bc4d51cc90b2a5710dbc2818013fc41ad428c2e4ba09b006"
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

  const registrySourceIdentifierMainnet = "fbd41ebabfed0fd1565f024b11d278dbf03b471a17a5578c79b50edb"
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

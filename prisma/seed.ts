import { $Enums, PrismaClient } from '@prisma/client';
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
  const registrySourceIdentifier =
    process.env.REGISTRY_SOURCE_IDENTIFIER_CARDANO;
  const network = process.env.NETWORK;
  if (registrySourceIdentifier != null && (network?.toLowerCase() === "mainnet" || network?.toLowerCase() === "preview" || network?.toLowerCase() === "preprod") && process.env.BLOCKFROST_API_KEY != null) {
    console.log('REGISTRY_SOURCE_IDENTIFIER_CARDANO is seeded');
    await prisma.registrySources.upsert({
      create: {
        type: $Enums.RegistryEntryType.WEB3_CARDANO_V1,
        network: network.toLowerCase() === "mainnet" ? $Enums.Network.MAINNET : network.toLowerCase() === "preview" ? $Enums.Network.PREVIEW : $Enums.Network.PREPROD,
        note: 'Created via seeding',
        identifier: registrySourceIdentifier,
        apiKey: process.env.BLOCKFROST_API_KEY,
      },
      update: {},
      where: {
        type_identifier: {
          type: $Enums.RegistryEntryType.WEB3_CARDANO_V1,
          identifier: registrySourceIdentifier,
        },
      },
    });
  } else {
    console.log('REGISTRY_SOURCE_IDENTIFIER_CARDANO is not seeded');
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

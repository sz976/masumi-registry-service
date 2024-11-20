-- CreateEnum
CREATE TYPE "APIKeyStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('WEB3_CARDANO_V1');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ONLINE', 'OFFLINE', 'DEREGISTERED', 'INVALID');

-- CreateEnum
CREATE TYPE "RegistryEntryType" AS ENUM ('WEB3_CARDANO_V1');

-- CreateEnum
CREATE TYPE "Network" AS ENUM ('PREVIEW', 'MAINNET');

-- CreateTable
CREATE TABLE "apiKey" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "apiKey" TEXT NOT NULL,
    "status" "APIKeyStatus" NOT NULL,
    "permission" "Permission" NOT NULL,
    "usageLimited" BOOLEAN NOT NULL DEFAULT false,
    "accumulatedUsageCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxUsageCredits" DOUBLE PRECISION,

    CONSTRAINT "apiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usedCredits" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "apiKeyId" TEXT,

    CONSTRAINT "UsageEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistryEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "api_url" TEXT NOT NULL,
    "description" TEXT,
    "company_name" TEXT,
    "lastUptimeCheck" TIMESTAMP(3) NOT NULL,
    "uptimeCount" INTEGER NOT NULL DEFAULT 0,
    "uptimeCheckCount" INTEGER NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL,
    "registrySourcesId" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "capabilitiesId" TEXT NOT NULL,

    CONSTRAINT "RegistryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentIdentifier" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentIdentifier" TEXT,
    "paymentType" "PaymentType" NOT NULL,
    "registryEntryId" TEXT,

    CONSTRAINT "PaymentIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capability" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Capability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrySources" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "RegistryEntryType" NOT NULL,
    "network" "Network",
    "url" TEXT,
    "identifier" TEXT,
    "apiKey" TEXT,
    "note" TEXT,
    "latestPage" INTEGER NOT NULL DEFAULT 1,
    "latestIdentifier" TEXT,

    CONSTRAINT "RegistrySources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpdatedRegistryEntriesLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpdatedRegistryEntriesLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "apiKey_apiKey_key" ON "apiKey"("apiKey");

-- CreateIndex
CREATE INDEX "apiKey_apiKey_idx" ON "apiKey"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "RegistryEntry_identifier_registrySourcesId_key" ON "RegistryEntry"("identifier", "registrySourcesId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIdentifier_registryEntryId_paymentType_key" ON "PaymentIdentifier"("registryEntryId", "paymentType");

-- CreateIndex
CREATE UNIQUE INDEX "Capability_name_version_key" ON "Capability"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrySources_type_identifier_key" ON "RegistrySources"("type", "identifier");

-- AddForeignKey
ALTER TABLE "UsageEntry" ADD CONSTRAINT "UsageEntry_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "apiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryEntry" ADD CONSTRAINT "RegistryEntry_registrySourcesId_fkey" FOREIGN KEY ("registrySourcesId") REFERENCES "RegistrySources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryEntry" ADD CONSTRAINT "RegistryEntry_capabilitiesId_fkey" FOREIGN KEY ("capabilitiesId") REFERENCES "Capability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIdentifier" ADD CONSTRAINT "PaymentIdentifier_registryEntryId_fkey" FOREIGN KEY ("registryEntryId") REFERENCES "RegistryEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

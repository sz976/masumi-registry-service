-- CreateEnum
CREATE TYPE "APIKeyStatus" AS ENUM ('Active', 'Revoked');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('User', 'Admin');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('Web3CardanoV1');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Online', 'Offline', 'Deregistered', 'Invalid');

-- CreateEnum
CREATE TYPE "RegistryEntryType" AS ENUM ('Web3CardanoV1');

-- CreateEnum
CREATE TYPE "RPCProvider" AS ENUM ('Blockfrost');

-- CreateEnum
CREATE TYPE "Network" AS ENUM ('Preprod', 'Mainnet');

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "status" "APIKeyStatus" NOT NULL,
    "permission" "Permission" NOT NULL,
    "usageLimited" BOOLEAN NOT NULL DEFAULT false,
    "accumulatedUsageCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxUsageCredits" DOUBLE PRECISION,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
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
    "apiUrl" TEXT NOT NULL,
    "description" TEXT,
    "requestsPerHour" DOUBLE PRECISION,
    "authorName" TEXT,
    "authorContact" TEXT,
    "authorOrganization" TEXT,
    "privacyPolicy" TEXT,
    "termsAndCondition" TEXT,
    "otherLegal" TEXT,
    "image" TEXT NOT NULL,
    "tags" TEXT[],
    "lastUptimeCheck" TIMESTAMP(3) NOT NULL,
    "uptimeCount" INTEGER NOT NULL DEFAULT 0,
    "uptimeCheckCount" INTEGER NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL,
    "registrySourceId" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
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
    "sellerVKey" TEXT,

    CONSTRAINT "PaymentIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quantity" BIGINT NOT NULL,
    "unit" TEXT NOT NULL,
    "registryEntryId" TEXT,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "RegistrySource" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "RegistryEntryType" NOT NULL,
    "network" "Network",
    "url" TEXT,
    "policyId" TEXT NOT NULL,
    "registrySourceConfigId" TEXT NOT NULL,
    "note" TEXT,
    "latestPage" INTEGER NOT NULL DEFAULT 1,
    "latestIdentifier" TEXT,

    CONSTRAINT "RegistrySource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrySourceConfig" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rpcProvider" "RPCProvider" NOT NULL,
    "rpcProviderApiKey" TEXT NOT NULL,

    CONSTRAINT "RegistrySourceConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpdatedRegistryEntriesLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpdatedRegistryEntriesLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_token_key" ON "ApiKey"("token");

-- CreateIndex
CREATE INDEX "ApiKey_token_idx" ON "ApiKey"("token");

-- CreateIndex
CREATE UNIQUE INDEX "RegistryEntry_assetName_registrySourceId_key" ON "RegistryEntry"("assetName", "registrySourceId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIdentifier_registryEntryId_paymentType_key" ON "PaymentIdentifier"("registryEntryId", "paymentType");

-- CreateIndex
CREATE UNIQUE INDEX "Price_quantity_unit_registryEntryId_key" ON "Price"("quantity", "unit", "registryEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "Capability_name_version_key" ON "Capability"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrySource_type_policyId_key" ON "RegistrySource"("type", "policyId");

-- AddForeignKey
ALTER TABLE "UsageEntry" ADD CONSTRAINT "UsageEntry_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryEntry" ADD CONSTRAINT "RegistryEntry_registrySourceId_fkey" FOREIGN KEY ("registrySourceId") REFERENCES "RegistrySource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryEntry" ADD CONSTRAINT "RegistryEntry_capabilitiesId_fkey" FOREIGN KEY ("capabilitiesId") REFERENCES "Capability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIdentifier" ADD CONSTRAINT "PaymentIdentifier_registryEntryId_fkey" FOREIGN KEY ("registryEntryId") REFERENCES "RegistryEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_registryEntryId_fkey" FOREIGN KEY ("registryEntryId") REFERENCES "RegistryEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrySource" ADD CONSTRAINT "RegistrySource_registrySourceConfigId_fkey" FOREIGN KEY ("registrySourceConfigId") REFERENCES "RegistrySourceConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

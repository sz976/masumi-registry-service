-- CreateEnum
CREATE TYPE "APIKeyStatus" AS ENUM ('Active', 'Revoked');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('User', 'Admin');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('Fixed');

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
    "apiBaseUrl" TEXT NOT NULL,
    "description" TEXT,
    "authorName" TEXT,
    "authorContactEmail" TEXT,
    "authorContactOther" TEXT,
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
    "capabilitiesId" TEXT,
    "registrySourceId" TEXT NOT NULL,
    "assetIdentifier" TEXT NOT NULL,
    "agentPricingId" TEXT NOT NULL,
    "metadataVersion" INTEGER NOT NULL,

    CONSTRAINT "RegistryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExampleOutput" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "registryEntryId" TEXT,

    CONSTRAINT "ExampleOutput_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "AgentPricing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pricingType" "PricingType" NOT NULL,
    "agentFixedPricingId" TEXT,

    CONSTRAINT "AgentPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentFixedPricing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentFixedPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitValue" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" BIGINT NOT NULL,
    "unit" TEXT NOT NULL,
    "agentFixedPricingId" TEXT,

    CONSTRAINT "UnitValue_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "RegistryEntry_assetIdentifier_key" ON "RegistryEntry"("assetIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIdentifier_registryEntryId_paymentType_key" ON "PaymentIdentifier"("registryEntryId", "paymentType");

-- CreateIndex
CREATE UNIQUE INDEX "AgentPricing_agentFixedPricingId_key" ON "AgentPricing"("agentFixedPricingId");

-- CreateIndex
CREATE UNIQUE INDEX "Capability_name_version_key" ON "Capability"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrySource_type_policyId_key" ON "RegistrySource"("type", "policyId");

-- AddForeignKey
ALTER TABLE "UsageEntry" ADD CONSTRAINT "UsageEntry_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryEntry" ADD CONSTRAINT "RegistryEntry_registrySourceId_fkey" FOREIGN KEY ("registrySourceId") REFERENCES "RegistrySource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryEntry" ADD CONSTRAINT "RegistryEntry_capabilitiesId_fkey" FOREIGN KEY ("capabilitiesId") REFERENCES "Capability"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryEntry" ADD CONSTRAINT "RegistryEntry_agentPricingId_fkey" FOREIGN KEY ("agentPricingId") REFERENCES "AgentPricing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExampleOutput" ADD CONSTRAINT "ExampleOutput_registryEntryId_fkey" FOREIGN KEY ("registryEntryId") REFERENCES "RegistryEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIdentifier" ADD CONSTRAINT "PaymentIdentifier_registryEntryId_fkey" FOREIGN KEY ("registryEntryId") REFERENCES "RegistryEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPricing" ADD CONSTRAINT "AgentPricing_agentFixedPricingId_fkey" FOREIGN KEY ("agentFixedPricingId") REFERENCES "AgentFixedPricing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitValue" ADD CONSTRAINT "UnitValue_agentFixedPricingId_fkey" FOREIGN KEY ("agentFixedPricingId") REFERENCES "AgentFixedPricing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrySource" ADD CONSTRAINT "RegistrySource_registrySourceConfigId_fkey" FOREIGN KEY ("registrySourceConfigId") REFERENCES "RegistrySourceConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

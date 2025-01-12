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
CREATE TYPE "Network" AS ENUM ('PREVIEW', 'PREPROD', 'MAINNET');

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
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistryEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "api_url" TEXT NOT NULL,
    "description" TEXT,
    "requests_per_hour" DOUBLE PRECISION,
    "author_name" TEXT,
    "author_contact" TEXT,
    "author_organization" TEXT,
    "privacy_policy" TEXT,
    "terms_and_condition" TEXT,
    "other_legal" TEXT,
    "image" TEXT NOT NULL,
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
    "sellerVKey" TEXT,

    CONSTRAINT "PaymentIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quantity" BIGINT NOT NULL,
    "policyId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "_RegistryEntryToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "apiKey_apiKey_key" ON "apiKey"("apiKey");

-- CreateIndex
CREATE INDEX "apiKey_apiKey_idx" ON "apiKey"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_value_key" ON "Tag"("value");

-- CreateIndex
CREATE UNIQUE INDEX "RegistryEntry_registrySourcesId_api_url_key" ON "RegistryEntry"("registrySourcesId", "api_url");

-- CreateIndex
CREATE UNIQUE INDEX "RegistryEntry_identifier_registrySourcesId_key" ON "RegistryEntry"("identifier", "registrySourcesId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIdentifier_registryEntryId_paymentType_key" ON "PaymentIdentifier"("registryEntryId", "paymentType");

-- CreateIndex
CREATE UNIQUE INDEX "Price_quantity_policyId_assetId_registryEntryId_key" ON "Price"("quantity", "policyId", "assetId", "registryEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "Capability_name_version_key" ON "Capability"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrySources_type_identifier_key" ON "RegistrySources"("type", "identifier");

-- CreateIndex
CREATE UNIQUE INDEX "_RegistryEntryToTag_AB_unique" ON "_RegistryEntryToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_RegistryEntryToTag_B_index" ON "_RegistryEntryToTag"("B");

-- AddForeignKey
ALTER TABLE "UsageEntry" ADD CONSTRAINT "UsageEntry_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "apiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryEntry" ADD CONSTRAINT "RegistryEntry_registrySourcesId_fkey" FOREIGN KEY ("registrySourcesId") REFERENCES "RegistrySources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistryEntry" ADD CONSTRAINT "RegistryEntry_capabilitiesId_fkey" FOREIGN KEY ("capabilitiesId") REFERENCES "Capability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIdentifier" ADD CONSTRAINT "PaymentIdentifier_registryEntryId_fkey" FOREIGN KEY ("registryEntryId") REFERENCES "RegistryEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_registryEntryId_fkey" FOREIGN KEY ("registryEntryId") REFERENCES "RegistryEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegistryEntryToTag" ADD CONSTRAINT "_RegistryEntryToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "RegistryEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegistryEntryToTag" ADD CONSTRAINT "_RegistryEntryToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

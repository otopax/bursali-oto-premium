-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'BOT';
ALTER TYPE "Role" ADD VALUE 'SCHEDULER';
ALTER TYPE "Role" ADD VALUE 'WEBHOOK';

-- Map existing SYSTEM users to BOT to prevent data loss
UPDATE "User" SET "globalRole" = 'BOT' WHERE "globalRole" = 'SYSTEM';

-- Note: Dropping the SYSTEM enum value is complex in PostgreSQL without recreating the enum.
-- Since this is an Enterprise schema, we will leave SYSTEM in the DB enum type but it's removed from Prisma Schema to prevent new usage.

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "scopes" TEXT[],
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "allowedIPs" TEXT[],
    "allowedOrigins" TEXT[],
    "rateLimit" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_role_idx" ON "ApiKey"("role");

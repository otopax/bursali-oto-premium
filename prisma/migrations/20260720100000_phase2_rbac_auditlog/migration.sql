-- 1. Create new enum type
CREATE TYPE "Role_new" AS ENUM ('GUEST', 'CUSTOMER', 'VIP_CUSTOMER', 'MECHANIC', 'ADVISOR', 'MANAGER', 'ADMIN', 'SUPER_ADMIN', 'SYSTEM');

-- 2. Alter User.globalRole column and convert existing data
ALTER TABLE "User" ALTER COLUMN "globalRole" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "globalRole" TYPE "Role_new" 
USING (
  CASE 
    WHEN "globalRole"::text = 'FLEET_OWNER' THEN 'CUSTOMER'::"Role_new"
    WHEN "globalRole"::text = 'DEALER' THEN 'ADVISOR'::"Role_new"
    WHEN "globalRole"::text = 'MECHANIC' THEN 'MECHANIC'::"Role_new"
    WHEN "globalRole"::text = 'ADMIN' THEN 'ADMIN'::"Role_new"
    ELSE 'CUSTOMER'::"Role_new"
  END
);
ALTER TABLE "User" ALTER COLUMN "globalRole" SET DEFAULT 'MECHANIC'::"Role_new";

-- 3. Drop old enum type and rename new one
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";

-- 4. Create Permission table
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "resource" TEXT NOT NULL,
    "canRead" BOOLEAN NOT NULL DEFAULT false,
    "canWrite" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canExport" BOOLEAN NOT NULL DEFAULT false,
    "canApprove" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_role_resource_key" ON "Permission"("role", "resource");

-- 5. Create AuditLog table
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "correlationId" TEXT,
    "requestId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_correlationId_idx" ON "AuditLog"("correlationId");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

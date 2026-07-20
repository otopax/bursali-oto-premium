-- AlterTable "User"
ALTER TABLE "User" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "mfaEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "mfaSecret" TEXT;

-- AlterTable "AuditLog"
ALTER TABLE "AuditLog" ADD COLUMN "country" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "browser" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "requestUrl" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "requestMethod" TEXT;

-- ==========================================
-- CREATE IMMUTABLE TRIGGER FOR AuditLog
-- ==========================================
CREATE OR REPLACE FUNCTION prevent_auditlog_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog table is immutable. Updates and Deletes are not allowed.';
END;
$$ LANGUAGE plpgsql;

-- Add Trigger on UPDATE or DELETE
DROP TRIGGER IF EXISTS auditlog_immutable_trigger ON "AuditLog";
CREATE TRIGGER auditlog_immutable_trigger
BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION prevent_auditlog_modification();

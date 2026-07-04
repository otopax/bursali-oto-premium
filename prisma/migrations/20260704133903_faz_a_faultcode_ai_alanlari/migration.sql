-- Faz A: FaultCode modeline AI analiz alanlari eklenir.
-- Tum kolonlar NULLABLE — mevcut satirlari bozmaz, veri kaybi riski yok.
-- UYARI: Bu migration R1 (otomatik pg_dump yedegi) kurulmadan UYGULANMAMALIDIR.

-- AlterTable
ALTER TABLE "FaultCode" ADD COLUMN     "commonCauses" JSONB,
ADD COLUMN     "estimatedCostInfo" TEXT,
ADD COLUMN     "stepByStepSolution" JSONB,
ADD COLUMN     "symptoms" JSONB,
ADD COLUMN     "videoAnalysis" JSONB;

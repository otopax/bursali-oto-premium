-- =============================================
-- FAZ 1 - HNSW INDEX MIGRATION
-- =============================================

-- Eski indeks varsa sil
DROP INDEX IF EXISTS idx_faultcode_embedding_hnsw;

-- Yeni HNSW indeksi oluştur (CONCURRENTLY - production safe)
CREATE INDEX CONCURRENTLY idx_faultcode_embedding_hnsw 
ON "FaultCode" 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 200);

-- İstatistikleri güncelle
ANALYZE "FaultCode";

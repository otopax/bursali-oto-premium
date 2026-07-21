# 06. Database Deep Audit

## 1. PostgreSQL & Prisma Audit

Veritabanı şeması ve çalışma zamanı performans dinamikleri analizi:

| Kontrol Alanı | İddia (Beklenti) | Koddaki Kanıt / Gözlem | Durum |
| :--- | :--- | :--- | :--- |
| **Connection Pooling** | PgBouncer Kullanımı | `DATABASE_URL` içinde `?pgbouncer=true` yok. | ❌ Missing |
| **Hot Indexes** | Sık aranan alanlarda Index | Plaka (`@unique`) var ama İş Emri durumu (`status`) için Index yok. | 🟡 Partial |
| **N+1 Sorgular** | Join (Include) ile korunma | RAG sorgularında Prisma `include` yapılıyor ancak her rotada denetlenmiyor. | 🟡 Inferred |
| **Execution Plan** | `EXPLAIN ANALYZE` raporu | Canlı veritabanı loglarına erişim yok. | ❓ Evidence Insufficient |
| **Soft Delete** | Verilerin silinmemesi | `deletedAt` alanı mevcut (`WorkOrder` vb). | ✅ Verified |
| **Audit Logging** | Kimin sildiği (Kayıt) | `deletedBy` veya tetikleyici (Trigger) tabloları yok. | ❌ Not Implemented |

## 2. Redis Cache Matrix

Redis (Upstash) kullanım analizi:

| Cache Key | Veri Tipi | TTL | Invalidation Stratejisi | Fallback | Durum |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cache:vin:*` | Şasi / Araç | 30 Gün | Manuel veya TTL dolunca | Prisma DB | ✅ Verified |
| `cache:obd:*` | Arıza Kodu | 7 Gün | TTL dolunca | Prisma DB | ✅ Verified |
| `ai:chat:hash`| AI Yanıtı | Yok (Sorun) | Yok | Gemini (Tekrar Üretim) | 🟡 Partial |

> [!WARNING]
> Redis altyapısında "Pub/Sub", "Streams" veya gelişmiş Eviction policyleri (`volatile-lru` vb.) için koda gömülü veya `.env` üzerinden yönetilen özel bir ayar (Örn: Redis Conf) bulunmamaktadır. Varsayılan (Default) Upstash yapılandırmasına güvenilmektedir.

---
**Confidence Level:** Medium (Canlı veritabanına erişim olmadığından `EXPLAIN` veya Slow Query analizi `Evidence Insufficient` olarak işaretlenmiştir).

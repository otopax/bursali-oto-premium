# 03. Runtime Inventory & Dependency Graph

## 1. Runtime Inventory

Sistemin sadece statik kodlardan değil, çalışma zamanındaki (Runtime) etkileşimlerden oluşan haritası:

| Katman | Teknoloji | Görevi | Durum |
| :--- | :--- | :--- | :--- |
| **CDN / Edge** | Cloudflare / Vercel Edge | DDoS koruması, Statik dosya servisi, 301 yönlendirmeleri. | 👀 Observed |
| **Web Server** | Next.js Node (v18+) | SSR sayfaları üretir, API isteklerini karşılar. | ✅ Verified |
| **Middleware** | Next.js Middleware | Authentication (Oturum), Yönlendirme ve Güvenlik Header'ları. | ✅ Verified |
| **Cache & Limit** | Redis (Upstash) | Rate Limiting (IP kısıtlama), Semantic Cache (AI) barındırır. | ✅ Verified |
| **Database** | PostgreSQL 15+ | İşlemler (Randevu), Vektörler (pgvector) ve Kullanıcı verileri. | ✅ Verified |
| **LLM Provider**| Google GenAI API | Gemini modelleriyle doğal dil işleme ve araç çağırma (Tool calling). | ✅ Verified |

## 2. Runtime Dependency Graph (Örnek: route.js)

`src/app/api/chat/route.js` dosyasının gerçek zamanlı bağımlılık ağacı (Import Graph):

```text
POST /api/chat/route.js
 ├──> src/lib/rate-limit.js (Redis kontrolü)
 │     └──> @upstash/redis (Dış Bağımlılık)
 ├──> src/lib/ai/semanticCache.js (Cache sorgusu)
 │     ├──> @upstash/redis
 │     └──> @google/genai (Embedding üretimi)
 ├──> src/lib/ai/promptRegistry.js (V2 promptunu çeker)
 ├──> src/lib/prisma.js (RAG araçları için)
 │     └──> @prisma/client (PostgreSQL sorguları)
 └──> @ai-sdk/google (LLM Stream başlatır)
       └──> src/lib/ai/hallucinationGuard.js (Akışı modere eder)
```

## 3. Configuration & Secret Inventory

### Environment Variables (.env)
- `DATABASE_URL` (Secret) - Prisma PostgreSQL bağlantısı. (Required)
- `REDIS_URL` (Secret) - Upstash bağlantısı. (Required)
- `GEMINI_API_KEY` (Secret) - Google GenAI anahtarı. (Required)
- `NEXTAUTH_SECRET` (Secret) - JWT imzalama. (Required)
- `NEXT_PUBLIC_GA_ID` (Public) - Google Analytics. (Optional)

> [!WARNING]
> Sistemde bir **Secret Rotation (Anahtar Yenileme)** politikası veya HashiCorp Vault / AWS KMS gibi bir kasa çözümü yoktur. Anahtarlar ortam değişkenlerinde (ENV) düz metin durmaktadır.

---
**Confidence Level:** High (Kod tabanı import listesi ve `.env.example` içeriğiyle doğrulanmıştır).

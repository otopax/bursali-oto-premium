# 05. API & Call Graphs

## 1. Complete Call Graph (AI Chat Flow)

Sistemin en karmaşık uç noktası olan `POST /api/chat` isteğinin çağrı grafiği (Sıralı İşlem Akışı):

```mermaid
graph TD
    A[Client POST /api/chat] --> B{Rate Limit & Quota Check}
    B -- Aşarsa --> C[429 Too Many Requests]
    B -- Geçerse --> D{Prompt Injection Guard}
    D -- İhlal --> E[403 Forbidden]
    D -- Geçerse --> F{Semantic Cache Check}
    F -- Cache Hit --> G[Stream Cached Response]
    F -- Cache Miss --> H[Retrieve VIN / Service History]
    H --> I[Inject Dynamic System Prompt]
    I --> J[Invoke LLM (Google Gemini)]
    J -- Tool Call --> K[semanticSearch / searchFaultCode]
    K --> L[Prisma Postgres DB]
    L --> J
    J -- Generate Text --> M{Hallucination Guard}
    M -- Geçerse --> N[Write to Semantic Cache]
    N --> O[Stream Response to Client]
```
*(Kanıt: `src/app/api/chat/route.js` analiz edilerek tam olarak çıkarılmıştır.)*

## 2. API Contract & Lifecycle Matrix

Mevcut API Envanterinin Kurumsal Kontrat (Contract) Analizi:

| Endpoint | Lifecycle | Auth | Validation (Schema) | Rate Limit | Timeout | Idempotency |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`POST /api/chat`** | Production | Guest/JWT | Basic Array Check | ✅ Redis (IP/Guest) | 30s (Vercel) | ❌ Yok |
| **`POST /api/erp/workorders`**| Beta | JWT | ❌ Sadece `req.json()` | ❌ Yok | 15s | ❌ Yok |
| **`GET /api/v1/vin`** | Internal | JWT | Param Check | ❌ Yok | 10s | ✅ GET default |

> [!CAUTION]
> **API Contract Zafiyeti:** Sistemdeki API'ler için OpenAPI (Swagger) spesifikasyonu, DTO (Data Transfer Object) sınıfları veya sıkı `Zod` validasyonları kullanılmamaktadır. Bu durum istemci (Frontend) ve Sunucu arasında "Gevşek Sözleşme (Loose Contract)" riski doğurur (Güvensiz veri kabulü).

---
**Confidence Level:** High (Endpoint analizleri, `next.config` ve statik kod aramalarıyla doğrulandı).

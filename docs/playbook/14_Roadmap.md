# 14. Enterprise Roadmap

Zaman ekseninde teknik borç ödeme ve mimari evrim (Evolution) planı:

## 1. Kısa Vadeli Dönüşüm (30 Days - P0)
- **Güvenlik (Security):** `npm audit fix` ile 7 zafiyetin kapatılması.
- **Asenkron Yapı:** BullMQ yapısının (`Worker`) ayağa kaldırılıp senkron işlemlerin (Email, SMS) arka plana atılması.
- **Test Altyapısı:** Playwright ile temel 3 sayfanın (Chat, Randevu, Login) E2E testlerinin CI pipeline'a eklenmesi.

## 2. Orta Vadeli Dönüşüm (90-180 Days - P1)
- **API Güvenliği:** Tüm endpointlerin `Zod` ile doğrulama (Validation) katmanına sokulması ve OpenAPI dökümanının otomatik üretilmesi.
- **FinOps (AI Limits):** Gemini maliyetlerini kısmak için RAG dökümanlarına Reranking eklenmesi ve eski konuşmaların (Context) özetlenerek (Eviction) token sınırlandırılması.
- **Observability:** Sentry yanına Datadog veya OpenTelemetry eklenerek `X-Correlation-ID` ile dağınık izleme (Distributed Tracing) başlatılması.

## 3. Uzun Vadeli Dönüşüm (12-24 Months - P2/P3)
- **Microservices Geçişi:** Next.js Monolith'in parçalanması; AI servisinin Go veya Python (FastAPI) tarafına taşınması (Eğer 1 Milyon+ kullanıcıya çıkılırsa).
- **Chaos Engineering:** Gerçek üretim ortamında Redis/Postgres çökertme senaryolarının (Chaos Monkey) otomatik CI/CD kapısı (Gate) olarak çalıştırılması.
- **Data Lake:** Eski randevu ve chat verilerinin Snowflake/BigQuery gibi bir Data Warehouse'a taşınarak ML (Makine Öğrenimi) analitiği yapılması.

---
**Confidence Level:** High (Mevcut kod darboğazları `Verified` düzeyinde incelenerek gerçekçi tarihlere bölünmüştür).

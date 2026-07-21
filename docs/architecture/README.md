# Architecture (Mimari Sütunu)

Platformun teknik omurgasını, vizyonunu ve bileşenler arası ilişkilerini tanımlar.

## Temel Başlıklar (Faz 2 ve 3'te Eklenecektir)
- **Architecture Overview:** Yüksek seviye sistem bileşenleri.
- **C4 Model:** Context, Container ve Component seviyesi mimari çizimler.
- **Dependency Graph:** Servislerin birbirine olan bağımlılık haritası (Örn: Next.js -> Redis -> BullMQ).
- **ADR (Architecture Decision Records):** Geçmişte alınmış tüm kritik teknik kararlar ve nedenleri (Decision Log).

## Mimari Prensipler (Architecture Principles)
Kurumsal bir platformda yazılım geliştirirken uyulması gereken ana ilkeler şunlardır:
1. **API First:** Frontend'den önce backend (API) arayüzleri ve sözleşmeleri (Data Contracts) tasarlanır.
2. **Cloud Native & Stateless:** Tüm sunucular (Next.js vb.) durumsaldır (stateless), veriler dışarıda (Redis, Postgres) tutulur.
3. **Event Driven:** Asenkron işler doğrudan API request döngüsünde değil, mesaj kuyruğunda (BullMQ) işlenir.
4. **Security First / Zero Trust:** Servisler arası iletişimde dahi yetki kontrolü (veya rate limit) aranır.
5. **AI Native:** LLM etkileşimleri sisteme sonradan yamanmaz, veri akışının merkezinde (RAG) tasarlanır.
6. **Observability First:** Koda eklenen her kritik iş akışı ölçülebilir ve izlenebilir olmalıdır (Sentry, OTEL).

# Platform (Platform Yönetişim Sütunu)

Yazılımın bir ürün (product) olarak değil, bir Platform (birden çok ekibin, mikroservisin ve müşterinin entegre olduğu temel altyapı) olarak nasıl yapılandırıldığını tanımlar.

## Temel Başlıklar (Faz 2 ve 3'te Eklenecektir)
- **Service Catalog:** Platformdaki tüm servislerin (Web, Worker, AI Gateway, DB) listesi ve tanımı.
- **Capability Matrix:** Platformun sunduğu yetenekler (Auth, Chat, Booking, vs.) ve olgunluk seviyesi.
- **RACI Matrix:** Hangi bileşenden hangi ekibin (Backend, AI, Marketing vb.) sorumlu olduğu.
- **Data Flow & Contracts:** Sistemler arası veri akışı (Örn: AppointmentCreated event şeması).

## Platform Bileşen Özetleri
- **Compute Layer:** Railway (Serverless Node.js).
- **Data Layer:** PostgreSQL (Transactional), Upstash Redis (Key-Value & Queue).
- **AI Layer:** OpenAI (LLM), pgvector (Knowledge Base).
- **Edge Layer:** Cloudflare (WAF, CDN, DNS).

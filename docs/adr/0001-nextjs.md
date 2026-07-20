# ADR 0001: Next.js App Router & Edge Middleware

## Status
Kabul Edildi (Accepted)

## Bağlam (Context)
Bursalı Oto Dijital Yönetim Sistemi, hem çok dilli (i18n) SEO sayfalarına, hem müşteri araç takip portallarına, hem de yüksek veri yoğunluklu Garaj ERP modülüne ev sahipliği yapmaktadır. Bu yoğun yapının güvenliği, hızı ve yönetimi kritik önem taşımaktadır.

## Karar (Decision)
Tüm sistem mimarisi için **Next.js 14+ App Router** kullanılmasına karar verilmiştir.
- Edge Middleware üzerinden fail-closed tabanlı güvenlik kontrolleri (Redis destekli) yürütülecektir.
- Yüksek SEO skoru gerektiren ana sayfalar için ISR (Incremental Static Regeneration) ve Static Export kullanılacaktır.
- Yönetim paneli ve ERP ekranları Server Actions üzerinden işlenecektir.

## Sonuçlar (Consequences)
- **Olumlu:** Edge Middleware sayesinde yetkisiz istekler sunucuya ulaşmadan (Prisma'ya yük bindirmeden) engellenir. Server Actions ile API router'ı yazmadan tip güvenli (type-safe) RPC çağrıları yapılabilir.
- **Riskler:** Edge ortamında Node.js API'leri (`fs`, `crypto` gibi native kütüphaneler) veya Prisma doğrudan çalıştırılamaz. Bunun için Edge uyumlu (Upstash Redis) araçlara veya failback internal API'lere ihtiyaç duyulur. Bu risk, Faz 3 Sprint 2'deki Fail-Open/Fail-Closed toleranslarıyla ele alınmıştır.

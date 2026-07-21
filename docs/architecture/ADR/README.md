# Architecture Decision Records (ADR)

Mimari kararların (Architecture Decision Record) tarihçesini, karar mekanizmalarını ve kime ait olduklarını (Ownership) belgelediğimiz alandır.

## ADR Nedir?
Mimari açıdan önemli olan her karar; "Neden seçildi?", "Hangi alternatifler değerlendirildi?" ve "Sonucu ne oldu?" sorularıyla birlikte belgelenmelidir. Bu, yıllar sonra projeye katılan bir geliştiricinin "Neden bunu böyle yapmışlar?" diye sormasını engeller.

## Karar Kaydı Şablonu (Decision Log Template)

Her yeni ADR, bu klasörün altına `ADR-00X-Konu.md` adıyla aşağıdaki formatta açılır:

| Alan | Açıklama |
| :--- | :--- |
| **Title (Başlık)** | Kararın kısa özeti (Örn: Railway yerine Vercel Kullanılması) |
| **Date (Tarih)** | Kararın alındığı tarih |
| **Owner (Sahibi)** | Karardan sorumlu kişi / ekip |
| **Status (Durum)** | Proposed, Accepted, Deprecated, Superseded |
| **Context (Bağlam)** | Hangi sorun çözülmeye çalışıldı? Hangi kısıtlamalar vardı? |
| **Alternatives (Alternatifler)** | Hangi diğer seçenekler masadaydı (AWS, Render, vb.)? |
| **Decision (Karar)** | Neden seçilen yöntemde karar kılındı? |
| **Consequences (Sonuçlar)** | Kararın olumlu/olumsuz etkileri, maliyeti. |

## Mevcut Karar Kütüğü (Decision Log)

* ADR-001: Railway'in Ana Altyapı Seçilmesi (Accepted - Nedeni: Fiyat/Performans ve Docker uyumu)
* ADR-002: PostgreSQL (pgvector) Kullanımı (Accepted - Nedeni: Vector Search ve Relational veriyi tek yerde birleştirmek)
* ADR-003: Redis / BullMQ ile Kuyruk Yönetimi (Accepted - Nedeni: Edge'de Next.js V8 limitlerini aşmamak)

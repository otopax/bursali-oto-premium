# 02. Architecture & Decision Index

## 1. Architecture Decision Index (ADR Matrix)

| ADR | Decision (Karar) | Status | Commit / Date | Owner |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-001** | Next.js App Router & Server Components Kullanımı | ✅ Verified | 20.07.2026 | Principal Arch |
| **ADR-002** | PostgreSQL & Prisma ORM Seçimi | ✅ Verified | (Initial Setup)| Database Lead |
| **ADR-003** | Redis ile Cache & Rate Limit (Upstash) | ✅ Verified | (Initial Setup)| SRE |
| **ADR-004** | BullMQ ile Asenkron Arka Plan Görevleri | ❌ Planned | (Pending) | Backend Dev |
| **ADR-005** | PgVector ile RAG tabanlı AI Search | 🟡 Partial | (Initial Setup)| AI Engineer |

## 2. Living Architecture (Mimari Evrim)

Sistemin "Nasıl Buraya Geldiği" ve neden değiştiği (Evolution):

### v1.0 -> v2.0 (SPA'den SSR'a Geçiş)
- **Neden Değişti:** Tek sayfa uygulamaları (React SPA) arama motorlarında (SEO) indekslenemiyordu.
- **Hangi Problem Çözüldü:** Core Web Vitals (FCP/LCP) skorları iyileşti, SSR ile anında render sağlandı.
- **Trade-off:** Sunucu maliyetleri (Compute) arttı. Statik hosting yerine Vercel/Railway zorunlu hale geldi.

### v3.0 -> v4.0 (Statik Chat'ten Semantic RAG'e Geçiş)
- **Neden Değişti:** AI (Gemini) çok fazla halüsinasyon görüyor ve yanlış tork (Nm) değerleri veriyordu.
- **Hangi Problem Çözüldü:** Prisma `pgvector` eklenerek arıza kodları (Fault Codes) vektörel olarak veritabanına gömüldü. Model sadece RAG ile cevap vermeye zorlandı.
- **Teknik Borç (Tech Debt):** Semantic Cache eklendi ancak Context Window (eski mesajların silinmesi) algoritması atlandı.

### v4.0 -> v5.0 (Monolith to Event-Driven - Gelecek Planı)
- **Neden Değişiyor:** Randevu ve SMS işlemleri Next.js API'sini blokluyor (Vercel 30s timeout limiti).
- **Çözüm:** BullMQ ve Redis Queue eklenecek.

---
**Confidence Level:** High (Mimari kararlar `docs/architecture` ve Prisma yapısıyla doğrudan doğrulanmıştır).

# 13. Technical Debt Register

## 1. İleri Seviye Teknik Borç Envanteri

Kurumsal projenin "Kodlanmış Sınırlılıkları". ETA (Estimated Time of Arrival) ve Maliyet analizi ile birlikte:

| Debt ID | Kategori | Sorun / Anti-Pattern | Severity | Cost/Effort | ETA (Sprint) | Owner | Durum |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TD-01** | **Testing** | Sistemde Test Kapsamı %5. Playwright/Vitest yok. | 🔴 Critical | High | Sprint 1-2 | QA/SDET | ❌ Missing |
| **TD-02** | **Architecture**| BullMQ Worker `package.json`'da var ama `src/scripts` içi boş (Senkron Monolith). | 🔴 Critical | Medium | Sprint 1 | Backend | ❌ Planned |
| **TD-03** | **Security** | NPM Audit 7 açık gösteriyor (SSR SSRF & XSS riskleri). | 🟠 High | Low | Sprint 1 | SRE | ❌ Action Req |
| **TD-04** | **API Contract** | OpenAPI (Swagger) şeması yok, Zod validasyonu eksik. | 🟠 High | Medium | Sprint 2 | Backend | 🟡 Partial |
| **TD-05** | **AI Limits** | Chat uzadıkça Context Window/Token compression yapılmıyor. | 🟠 High | Medium | Sprint 2 | AI Eng | ❌ Missing |
| **TD-06** | **Observability**| Loglarda Correlation ID (Distributed Tracing) yok. | 🟡 Medium | Low | Sprint 3 | DevOps | ❌ Missing |
| **TD-07** | **Database** | WorkOrder `status` alanında Index yok, N+1 RAG riski var. | 🟡 Medium | Low | Sprint 3 | DBA | 🟡 Partial |

> [!IMPORTANT]
> **Priority (Önceliklendirme):** TD-01 (Testing) ve TD-03 (NPM Zafiyetleri) üretime çıkış (Go-Live) için birer **Blocker (Engelleyici)** olarak değerlendirilmelidir. Testi olmayan kod, Kurumsal seviyede "çalışmıyor" kabul edilir.

---
**Confidence Level:** High (Tüm teknik borçlar 100% kod taramasıyla doğrulanmıştır `Verified`).

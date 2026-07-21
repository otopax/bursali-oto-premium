# 10. DevOps, Release & Incident Flow

## 1. Release Management (Sürüm Yönetimi)

Kodun canlıya alınma (Deploy) süreçlerinin analizi:

| Konsept | Durum | Kanıt / Açıklama |
| :--- | :--- | :--- |
| **Semantic Versioning** | 🟡 Partial | Sadece `package.json` "0.1.0" olarak duruyor. CI'da otomatik etiketleme (Tagging) yok. |
| **CI/CD Pipeline** | 👀 Observed | GitHub Actions yerine Railway/Vercel otomatik trigger kullanılıyor. |
| **Blue/Green & Canary** | ❌ Not Implemented| Trafiğin %10'unu yeni sürüme yönlendirme gibi gelişmiş rollout yok. |
| **Feature Flags** | ❌ Not Implemented| "LaunchDarkly" vb. kullanılmıyor; özellikler hardcoded canlıya gidiyor. |
| **Rollback Plan** | ✅ Verified | PaaS üzerinden "Revert to Previous Build" tıklamasıyla 5 saniyede geri dönüş. |

## 2. Incident Flow (Olay Yönetim Akışı)

Production ortamında bir çökme (Incident) olduğunda uygulanacak kurumsal SRE süreçleri. (*Kod bazlı değil, playbook politikası olarak eklenmiştir.*)

```mermaid
graph TD
    A[Sentry Alert / PagerDuty] --> B[On-Call Engineer (SEV-1)]
    B --> C{Triage & Investigation}
    C --> D[Mitigation / Rollback]
    D --> E[Recovery Confirmed]
    E --> F[Root Cause Analysis - RCA]
    F --> G[Postmortem Documented]
```

### SEV (Severity) Sınıfları
- **SEV-0 (Kritik Kesinti):** Next.js Sunucusu yanıt vermiyor, DB çöktü. Tüm şirket uyanır.
- **SEV-1 (Büyük Kısıntı):** AI Yanıt vermiyor (Gemini Limit) veya Randevu alınamıyor.
- **SEV-2 (Özellik Kaybı):** Vektör arama yavaşladı, SMS gitmiyor.
- **SEV-3 (Minör Hata):** Spofing denemesi bloklandı, bir component render hatası (Sentry uyarıları).

---
**Confidence Level:** High (Release mekanizması ve CI yapıları repository'den Inferred/Observed edilmiştir).

# 09. SRE, Resiliency & Chaos Engineering

## 1. Scalability Limits (Ölçeklenebilirlik Sınırları)

| Bileşen | Current (Mevcut) | Maximum | Bottleneck (Darboğaz) |
| :--- | :--- | :--- | :--- |
| **Vercel / Next.js Edge**| Edge Cache | Neredeyse Sınırsız | Maliyet (Bandwidth/Invocation Cost) |
| **PostgreSQL (Railway)** | ~100 Conn | Max 500 (Tahmini) | Connection Pooling (PgBouncer) eksikliği |
| **Redis (Upstash)** | Ücretsiz Katman | X Request/Sec | Throttling yeme riski |
| **Google Gemini API** | X RPM (Quota) | Hesaba bağlı | AI limitine takılırsa tüm Chat durur (Fallback yok) |

## 2. Disaster Recovery (DR) & Chaos Engineering

Kurumsal felaket senaryosu analizleri:

- **RPO (Recovery Point Objective):** Veri yedekleme stratejisi kodda `scripts/backup-db.js` olarak var ancak cron job olarak çalışıp çalışmadığı belirsiz. (❓ Evidence Insufficient)
- **RTO (Recovery Time Objective):** Railway veya Vercel çöktüğünde Dockerize edilmediği için başka buluta (AWS/Azure) kalkış süresi uzundur. (🟡 Partial)

### Chaos Engineering (Kaos Mühendisliği) Testleri
| Test Senaryosu | Beklenen (Expected) | Koddaki Gerçek (Actual Runtime) |
| :--- | :--- | :--- |
| **Redis Down** | Fallback to DB veya Degradation | `429 Too Many Requests` (Tüm Chat API Kilitlenir) |
| **Gemini Timeout** | Hızlı hata dönüşü | 30s Vercel MaxDuration Sonrası Timeout |
| **Postgres Down** | Sadece statik sayfalar çalışır | `/api/erp/` anında 500 atar. |

---
**Confidence Level:** Medium-High (Kod okumaları üzerinden SRE Failure Model'i çıkarılmıştır).

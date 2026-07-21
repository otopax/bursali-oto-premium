# Operasyonel Runbook'lar

Burası gece saat 03:00'te sistem çöktüğünde "Hangi adımları izlemeliyim?" diye soran bir nöbetçi mühendisin (On-call SRE) ilk bakacağı yerdir.

## Runbook Yazım Prensipleri
1. **No Heroics:** Tahminlere yer yoktur. Adımlar 1, 2, 3 şeklinde kesin ve nettir.
2. **Kopya-Yapıştır Scriptler:** Gerekli tüm CLI komutları (Railway CLI, PostgreSQL psql vb.) bloklar halinde hazır tutulur.
3. **Escalation Path (Tırmandırma Yolu):** Sorun 15 dakika içinde çözülemezse hangi yöneticinin aranacağı (CTO, VP of Eng) yazılır.

## Kritik Runbook Listesi

- `RB-001: Database_Unavailable_Recovery.md` -> Railway DB çöktüğünde Failover ve Restore senaryosu.
- `RB-002: Redis_OOM_Eviction.md` -> Upstash Redis bellek sınırını (OOM) aştığında uygulanacak Cache Purge işlemleri.
- `RB-003: OpenAI_API_Timeout_Fallback.md` -> GPT API'si yanıt vermediğinde veya yavaşladığında sistemin "Offline/Rule-based" bot moduna geçirilmesi.
- `RB-004: DDoS_Mitigation_Cloudflare.md` -> Sunucuya aşırı yük (Rate Limit bypass) bindiğinde Cloudflare üzerinden "Under Attack Mode" açılması.

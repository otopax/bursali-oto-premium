# SRE (Site Reliability Engineering) Sütunu

Sistemin ne kadar ayakta kalacağını, çöktüğünde nasıl toparlanacağını ve hata bütçelerini Google SRE pratiklerine uygun olarak tanımlar.

## Temel Başlıklar (Faz 2 ve 3'te Eklenecektir)
- **SLO & SLA:** Premium müşteri (99.95%), Standart (99.9%) servis hedefleri.
- **Error Budget (Hata Bütçesi):** Aylık 43.8 dk kesinti aşımında "Deploy Freeze" politikası.
- **Error Catalog:** Tüm sistem hatalarının kodları (Örn: ERR001 - Database unavailable).
- **Retry & Timeout Matrix:** OpenAI için 3 retry (Exponential), DB için 5s timeout gibi kriz yönetimi.
- **Capacity Planning & Performance Budget:** Gelen trafiğe (100 vs 1 Milyon) göre sunucu/CPU/AI ölçekleme limitleri.

## SRE Prensipleri
1. **Downtime Beklenir (Expect Failure):** Sistemlerin bir noktada çökeceği varsayılır. Önemli olan "ne kadar hızlı toparlandığıdır" (MTTR).
2. **Blameless Postmortems:** Bir çöküş yaşandığında "kim" değil, "sistem neden izin verdi" sorusu sorulur.
3. **Toil Automation:** Manuel ve sürekli tekrar eden işler (Toil) %50'nin altında tutulur, otomatize edilir.

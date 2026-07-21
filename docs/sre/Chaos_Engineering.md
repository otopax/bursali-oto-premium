# Chaos Engineering Roadmap (Kaos Mühendisliği)

Sistemin esnekliğini (Resilience) artırmak için üretim ortamında (veya Staging) planlı şekilde yapılan yıkıcı testler.

## Aylık Senaryolar (Game Days)

1. **Redis Down Simülasyonu:** 
   - `iptables` ile Redis portu kapatılır. 
   - Beklenti: Next.js API'lerinin 500 dönmemesi, lokal cache veya yavaş ama stabil DB okumalarına devam etmesi.
2. **PostgreSQL Latency Enjeksiyonu:**
   - DB sorgularına yapay 2 saniye gecikme eklenir.
   - Beklenti: İsteklerin timeout'a düşmesi, Circuit Breaker'ın devreye girmesi.
3. **OpenAI Timeout Hatası:**
   - OpenAI yanıt vermez.
   - Beklenti: Kullanıcıya "Sistem şu an yoğun, sorunuz kaydedildi" dönülmesi, sonsuz dönen loading çubuklarının önlenmesi.
4. **Disk Dolu (No Space Left):**
   - Sunucudaki log diskleri %100 doldurulur.
   - Beklenti: Servisin çökmemesi, pino logger'ın error verip çalışmaya devam etmesi.

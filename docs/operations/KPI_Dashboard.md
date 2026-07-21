# KPI Dashboard & Operasyonel Metrikler

Sistemin "sağlıklı" olması sadece ayakta (HTTP 200) olması demek değildir. İş hedeflerine (Business Objectives) ve müşteri memnuniyetine ne kadar ulaştığımız aşağıdaki anahtarlar (Key Performance Indicators) ile ölçülür.

## 1. İş Hedefleri (Business KPIs)
- **Revenue (Gelir):** Günlük/Aylık kazanılan servis ve randevu gelirleri.
- **Bookings (Randevu Dönüşümü):** Ziyaretçilerin yüzde kaçı randevu formunu doldurdu (Conversion Rate).
- **Lead Generation:** İletişim, WhatsApp ve Sanal Usta üzerinden toplanan geçerli potansiyel müşteri sayıları.

## 2. Teknik Operasyon (Technical KPIs - Golden Signals)
- **Latency (Gecikme - p95 & p99):** Sayfa yüklenme süresi < 1s, AI API yanıt süresi < 2s.
- **Availability (Erişilebilirlik):** Hedef %99.9 Uptime (Ayda maks 43.8 dk kesinti bütçesi).
- **Traffic (Trafik):** Saniyedeki istek sayısı (RPS) ve saatlik Peak/Burst (Zirve) analizleri.
- **Error Rate (Hata Oranı):** Toplam isteklerin yüzde kaçı 500 (Server Error) döndürüyor. (Hedef: < %0.5)

## 3. Yapay Zeka Operasyonları (AI KPIs)
- **AI Usage (Kullanım Oranı):** Günlük RAG bot kullanımı (Session sayısı).
- **Cost Per Conversation (Maliyet):** Bir müşteri görüşmesinin ortalama Token / Dolar maliyeti.
- **Resolution Rate (Çözüm Oranı):** AI bot'un, insan desteğine ihtiyaç duymadan "kendi başına" kapattığı/çözdüğü konuşma yüzdesi.

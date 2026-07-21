# Business Continuity Plan (İş Sürekliliği Matrisi)

Teknik kesintilerin **iş tarafına (Müşteri ve Gelir)** olan etkisini ve toparlanma (Recovery) planlarını açıklar.

| Senaryo (Failure) | İş Etkisi (Business Impact) | Kurtarma Stratejisi (Recovery) |
| :--- | :--- | :--- |
| **AI Çöktü (Unavailable)** | Sanal usta cevap veremez. Canlı destek mesajlarına geçilir. | Statik (FAQ) Fallback moduna geçiş. |
| **Veritabanı Ulaşılamaz** | Randevu alınamaz, fatura kesilemez, tüm operasyon durur. | Runbook RB-001 (DB Restore) anında çalıştırılır. RTO < 1 saat. |
| **Cloudflare DDoS Altında** | Kullanıcılar siteye giremez, trafik düşer. | "I am under attack" modu açılır, Rate Limit sıkılaştırılır. |
| **BullMQ Worker Çöktü** | SMS ve Email bildirimleri müşteriye gitmez. | Mesajlar Redis kuyruğunda birikir, Worker yeniden başlatıldığında toplu atılır. |

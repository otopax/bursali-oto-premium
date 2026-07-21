# Compliance Matrix (Uyumluluk Matrisi)

Kurumsal regülasyonlar (GDPR, KVKK, ISO27001) gereği, yazılımın yasal standartlara ne kadar uyduğunu gösteren haritadır.

| Standart / Kural | Sistemdeki Karşılığı (Technical Proof) | Durum |
| :--- | :--- | :--- |
| **KVKK / GDPR (Data Privacy)** | Veri silme talebi sayfası (`/veri-silme-talebi`) aktiftir. Tüm kişisel veriler Postgres'te şifrelenir (Encryption at rest). | Uyumlu |
| **Data Retention (Veri Saklama)** | Randevu kayıtları 5 yıl tutulur, sonrasında otomatik purge (silme) scripti çalışır. | Uyumlu |
| **ISO 27001 (Audit Logs)** | Sistemde admin tarafından yapılan her silme/değiştirme işlemi `AuditLog` tablosuna silinemez (Append-only) şekilde yazılır. | Uyumlu |
| **Secret Management (Şifreler)** | Veritabanı veya API anahtarları asla koda yazılmaz (No hardcoded secrets). Sadece `.env` ve Railway Variables üzerinden okunur. | Uyumlu |
| **PII Data Leak Prevention** | LLM'e giden loglar ve promptlar öncesinde regex ile taranır (TCKN, Kredi Kartı maskelenir). | Uyumlu |

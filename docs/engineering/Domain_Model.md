# Domain Model (Domain-Driven Design)

Sistemi veritabanı tablolarına göre (Database-driven) değil, iş mantığındaki (Business Logic) ana kavramlara (Domain) göre ayırıyoruz.

## Core Domains (Ana Alanlar)

1. **Customer Domain (Müşteri Alanı)**
   - `Customer` (Müşteri - İsim, İletişim, Onay Durumu)
   - `Vehicle` (Araç - Plaka, Şasi (VIN), Marka, Motor Kodu)
   *Kural:* Bir aracın birden fazla sahibi olabilir (Zamanla satıldığında).

2. **Service Domain (Servis ve Randevu)**
   - `Appointment` (Randevu - Müşteri, Araç, Tarih, Durum [Pending, Confirmed, Completed])
   - `ServiceOrder` (İş Emri - Atanan Usta, Kullanılan Parçalar, İşçilik Süresi)
   - `Invoice` (Fatura - Toplam Tutar, Vergi, Ödeme Durumu)

3. **Knowledge & AI Domain (Bilgi ve Yapay Zeka)**
   - `KnowledgeArticle` (Bilgi Makalesi - Arıza Çözümü, Vektör Gömme [Embedding], Aktiflik Durumu)
   - `Conversation` (Sohbet - Oturum ID, Token Maliyeti, Çözülme Durumu [Resolved, Escalated])

## State Machine (Durum Makinesi) Örneği

Bir Randevunun (Appointment) sistemdeki yaşam döngüsü kesin kurallara bağlıdır:
`Draft` -> `Created` -> `Confirmed` (Müşteriye SMS/Mail gider) -> `In_Service` (Usta arabayı aldı) -> `Completed` -> `Invoiced` (Fatura kesildi).
*Kural:* `Completed` durumuna geçmiş bir randevu iptal edilemez (Canceled olamaz).

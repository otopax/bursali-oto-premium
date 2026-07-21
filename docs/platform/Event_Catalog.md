# Event Catalog (Olay Kataloğu)

Sistemimiz Event-Driven (Olay Güdümlü) bir mimariye doğru evrilmektedir. Bileşenlerin doğrudan birbirini çağırmak yerine (Senkron API isteği), araya BullMQ / Redis gibi kuyruk mekanizmaları koyarak "Olaylar" fırlatması hedeflenir.

## Mevcut Event Listesi

| Event Adı | Tetikleyen Kaynak | Dinleyen(ler) | Payload (Data Contract) | Amacı |
| :--- | :--- | :--- | :--- | :--- |
| `AppointmentCreated` | Web (Client) / Next.js | BullMQ Worker | `{ id, customerId, date, vehicleId }` | Rezervasyon onay maillerini atmak ve takvime işlemek. |
| `InvoiceGenerated` | ERP API / Next.js | BullMQ Worker, Email Service | `{ invoiceId, amount, url }` | Müşteriye fatura PDF'ini asenkron üretip yollamak. |
| `AIConversationStarted` | Web (Client) | AI Logging Service | `{ sessionId, prompt, userId }` | Kullanıcı RAG ile konuşmaya başladığında Audit log oluşturmak. |
| `AIConversationEnded` | Web (Client) | AI Analytics Service | `{ sessionId, tokenUsed, duration }` | Kapanan sohbette toplam Token maliyetini hesaplamak. |
| `VehicleFaultLogged` | Sentry / API | Alert System | `{ errorCode, details }` | Müşteri aracından gelen OBD2 veya kayıtlı hatanın teknik ekibe iletilmesi. |

## Data Contracts (Veri Sözleşmeleri)

Event'ler fırlatılırken payload kısımları kesinlikle (Strict) JSON Schema ile doğrulanmalıdır. Bir event yapısı değiştirilmeden önce Consumer (Tüketen) servislerin kırılmayacağından emin olunmalıdır.

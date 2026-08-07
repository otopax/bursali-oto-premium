// Veri Silme / KVKK Başvuru sayfası (R3).
// NOT: Şu an başvuru e-posta (mailto) ile iletilir. İleride bir API endpoint'i +
// Customer.consentAt / silme talebi kaydı eklenebilir. [KÖŞELİ] alanlar doldurulmalı.

import { buildSEOContract } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return buildSEOContract({
    locale,
    path: '/veri-silme-talebi',
    title: 'Veri Silme ve KVKK Başvurusu | Bursalı Oto Servis',
    description: 'Kişisel verilerinizin silinmesi veya KVKK kapsamındaki haklarınıza ilişkin başvuru.',
  });
}

export default async function VeriSilmeTalebiPage({ params }) {
  const { locale } = await params;
  const basvuruMail = '[KVKK_BASVURU_EPOSTA]'; // örn. kvkk@bursaliotoservis.com
  const konu = encodeURIComponent('KVKK Veri Silme / Başvuru Talebi');
  const govde = encodeURIComponent(
    'Ad-Soyad:\nTelefon:\nAraç Plakası:\nTalebiniz (erişim / düzeltme / silme):\n'
  );

  const h1Titles = {
    tr: 'Veri Silme ve KVKK Başvurusu',
    en: 'Data Deletion and KVKK Request',
    ru: 'Удаление данных и запрос KVKK',
    uk: 'Видалення даних та запит KVKK',
    ar: 'حذف البيانات وطلب KVKK',
  };

  return (
    <main className="container" style={{ maxWidth: '820px', padding: '2.5rem 1.25rem', lineHeight: 1.7 }}>
      <h1 style={{ marginBottom: '1rem' }}>{h1Titles[locale] || h1Titles.tr}</h1>

      <p>
        6698 sayılı KVKK m.11 kapsamında verilerinize erişme, düzeltme veya silinmesini
        talep etme hakkına sahipsiniz. Başvurunuzu aşağıdaki bilgilerle iletebilirsiniz;
        kimliğinizi doğruladıktan sonra talebiniz yasal süre içinde (en geç 30 gün)
        sonuçlandırılır.
      </p>

      <h2>Başvuruda belirtilecekler</h2>
      <ul>
        <li>Ad-soyad ve iletişim bilgisi (kimlik doğrulaması için)</li>
        <li>Araç plakası (kaydınızı bulabilmemiz için)</li>
        <li>Talebiniz: erişim / düzeltme / silme / işlemeye itiraz</li>
      </ul>

      <p style={{ marginTop: '1.5rem' }}>
        <a
          href={`mailto:${basvuruMail}?subject=${konu}&body=${govde}`}
          style={{
            display: 'inline-block',
            padding: '0.7rem 1.3rem',
            borderRadius: '9px',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #d4af37, #b8860b)',
            color: '#1a1a1a',
            textDecoration: 'none',
          }}
        >
          E-posta ile Başvur
        </a>
      </p>

      <p style={{ marginTop: '1.5rem', opacity: 0.8, fontSize: '0.9rem' }}>
        Alternatif olarak başvurunuzu [ADRES] adresine yazılı olarak veya [KEP ADRESİ]
        KEP adresine iletebilirsiniz. Ayrıntılar için{' '}
        <a href={`/${locale}/kvkk`} style={{ color: '#d4af37', textDecoration: 'underline' }}>
          KVKK Aydınlatma Metni
        </a>
        .
      </p>
    </main>
  );
}

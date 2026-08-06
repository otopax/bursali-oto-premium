// KVKK Aydınlatma Metni (R3).
// NOT: Bu metin bir TASLAKTIR. Yayına almadan önce [KÖŞELİ] alanları doldurulmalı
// ve bir avukat tarafından gözden geçirilmelidir.

import { buildCanonical } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: 'KVKK Aydınlatma Metni | Bursalı Oto Servis',
    description:
      '6698 sayılı KVKK kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni.',
    alternates: buildCanonical(locale, '/kvkk'),
    robots: { index: true, follow: true },
  };
}

export default async function KvkkPage({ params }) {
  const { locale } = await params;

  return (
    <main className="container" style={{ maxWidth: '820px', padding: '2.5rem 1.25rem', lineHeight: 1.7 }}>
      <h1 style={{ marginBottom: '1rem' }}>KVKK Aydınlatma Metni</h1>
      <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca</p>

      <h2>1. Veri Sorumlusunun Kimliği</h2>
      <p>
        [TİCARİ UNVAN], [ADRES] (bundan sonra "Bursalı Oto Servis"), veri sorumlusu
        sıfatıyla kişisel verilerinizi aşağıda açıklanan çerçevede işler.
        İletişim: [E-POSTA] · [TELEFON] · KEP: [KEP ADRESİ].
      </p>

      <h2>2. İşlenen Kişisel Veriler</h2>
      <p>
        Kimlik ve iletişim verileri (ad-soyad, telefon, e-posta), araç bilgileri
        (plaka, marka/model), hizmet ve finansal veriler (iş emri, servis geçmişi,
        fatura) ve işlem güvenliği verileri (IP, çerez kayıtları).
      </p>

      <h2>3. İşleme Amaçları</h2>
      <p>
        Randevu ve onarım hizmetlerinin sunulması, müşteri ilişkilerinin yürütülmesi,
        sözleşmesel ve yasal yükümlülüklerin (fatura, garanti, muhasebe) yerine
        getirilmesi, hizmet kalitesi ve güvenliğinin sağlanması.
      </p>

      <h2>4. Hukuki Sebepler (KVKK m.5)</h2>
      <ul>
        <li>Bir sözleşmenin kurulması veya ifası için gerekli olması,</li>
        <li>Hukuki yükümlülüğün yerine getirilmesi,</li>
        <li>Meşru menfaat (hizmet güvenliği ve iyileştirme),</li>
        <li>Analitik çerezler bakımından: açık rızanız.</li>
      </ul>

      <h2>5. Aktarım</h2>
      <p>
        Veriler; yasal yükümlülükler kapsamında yetkili kamu kurumlarına ve hizmet
        aldığımız tedarikçilere (barındırma, analitik: Google) mevzuata uygun şekilde
        aktarılabilir. [Yurt dışı aktarım varsa burada belirtilmelidir.]
      </p>

      <h2>6. Haklarınız (KVKK m.11)</h2>
      <p>
        Verilerinizin işlenip işlenmediğini öğrenme, düzeltme, silme/yok edilmesini
        isteme, işlemeye itiraz etme ve zararın giderilmesini talep etme haklarına
        sahipsiniz. Başvurularınızı{' '}
        <a href={`/${locale}/veri-silme-talebi`} style={{ color: '#d4af37', textDecoration: 'underline' }}>
          Veri Silme / Başvuru
        </a>{' '}
        sayfası üzerinden iletebilirsiniz.
      </p>
    </main>
  );
}

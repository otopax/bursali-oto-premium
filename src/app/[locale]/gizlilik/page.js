// Gizlilik ve Çerez Politikası (R3/KVKK).
// NOT: Bu metin bir TASLAKTIR. Yayına almadan önce [KÖŞELİ] alanları doldurulmalı
// ve bir avukat tarafından gözden geçirilmelidir.

export async function generateMetadata() {
  return {
    title: 'Gizlilik ve Çerez Politikası | Bursalı Oto Servis',
    description:
      'Bursalı Oto Servis gizlilik ve çerez politikası: kişisel verilerin işlenmesi, çerez kullanımı ve haklarınız.',
    robots: { index: true, follow: true },
  };
}

export default async function GizlilikPage({ params }) {
  const { locale } = await params;

  return (
    <main className="container" style={{ maxWidth: '820px', padding: '2.5rem 1.25rem', lineHeight: 1.7 }}>
      <h1 style={{ marginBottom: '1rem' }}>Gizlilik ve Çerez Politikası</h1>
      <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Son güncelleme: [TARİH]</p>

      <h2>1. Veri Sorumlusu</h2>
      <p>
        [TİCARİ UNVAN] ("Bursalı Oto Servis"), [ADRES] adresinde faaliyet gösterir.
        İletişim: [E-POSTA] · [TELEFON] · KEP: [KEP ADRESİ].
      </p>

      <h2>2. Toplanan Veriler</h2>
      <ul>
        <li>İletişim/randevu formları: ad, telefon, e-posta, araç plakası, araç bilgisi.</li>
        <li>Hizmet kayıtları: iş emri, servis geçmişi, fatura bilgileri.</li>
        <li>Teknik veriler: IP adresi, tarayıcı bilgisi, çerez tanımlayıcıları.</li>
      </ul>

      <h2>3. İşleme Amaçları</h2>
      <p>
        Randevu ve hizmet sunumu, müşteri iletişimi, yasal yükümlülüklerin yerine
        getirilmesi (fatura/muhasebe), hizmet kalitesinin ve site performansının
        iyileştirilmesi.
      </p>

      <h2>4. Çerezler</h2>
      <p>
        Sitemizde iki tür çerez kullanılır:
      </p>
      <ul>
        <li><strong>Zorunlu çerezler:</strong> Sitenin çalışması için gereklidir; onay gerektirmez.</li>
        <li>
          <strong>Analitik çerezler (Google Analytics):</strong> Yalnızca açık onayınızla
          çalışır. Çerez bandındaki tercihinizi istediğiniz zaman tarayıcı ayarlarından
          veya site verilerini temizleyerek değiştirebilirsiniz.
        </li>
      </ul>

      <h2>5. Saklama Süresi</h2>
      <p>
        Kişisel veriler, ilgili mevzuatın öngördüğü süreler (örn. ticari ve vergi
        mevzuatı gereği [X] yıl) boyunca saklanır; amaç ortadan kalktığında silinir
        veya anonimleştirilir.
      </p>

      <h2>6. Haklarınız</h2>
      <p>
        KVKK m.11 kapsamında verilerinize erişme, düzeltme, silinmesini isteme ve
        işlemeye itiraz etme haklarına sahipsiniz. Talepleriniz için{' '}
        <a href={`/${locale}/veri-silme-talebi`} style={{ color: '#d4af37', textDecoration: 'underline' }}>
          Veri Silme / Başvuru
        </a>{' '}
        sayfasını kullanabilirsiniz. Ayrıntılı aydınlatma için{' '}
        <a href={`/${locale}/kvkk`} style={{ color: '#d4af37', textDecoration: 'underline' }}>
          KVKK Aydınlatma Metni
        </a>
        .
      </p>
    </main>
  );
}

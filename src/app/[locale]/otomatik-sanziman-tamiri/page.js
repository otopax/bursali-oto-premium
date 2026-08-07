import { buildSEOContract } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const titles = {
    tr: 'Fethiye Otomatik Şanzıman Tamiri & Revizyonu | 1 Yıl Garantili',
    en: 'Fethiye Automatic Transmission Repair & Rebuild | Guaranteed',
    ru: 'Ремонт и Ревизия АКПП в Фетхие | Гарантия 1 Год | Bursali Auto',
    uk: 'Ремонт та Ревізія АКПП у Фетхіє | Гарантія 1 Рік | Bursali Auto',
    ar: 'إصلاح وتجديد ناقل الحركة الأوتوماتيكي في فتحية | ضمان لمدة عام',
  };

  const descriptions = {
    tr: 'DSG, ZF, Aisin, Powershift otomatik şanzımanlarda vuruntu, kaydırma ve mekatronik arızalarına 1 yıl garantili revizyon çözümü.',
    en: 'Guaranteed DSG, ZF, Aisin automatic transmission repair, valve body testing and mechatronic rebuild in Fethiye.',
    ru: 'Гарантированный ремонт АКПП DSG, ZF, Aisin в Фетхие. Диагностика гидроблока и мехатроника.',
    uk: 'Гарантований ремонт АКПП DSG, ZF, Aisin у Фетхіє. Діагностика гідроблоку та мехатроніка.',
    ar: 'خدمة إصلاح ناقل الحركة الأوتوماتيكي DSG و ZF و Aisin في فتحية مع ضمان لمدة عام.',
  };

  return buildSEOContract({
    locale,
    path: '/otomatik-sanziman-tamiri',
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
  });
}

export default async function TransmissionPage({ params }) {
  const { locale } = await params;

  const h1Titles = {
    tr: 'Fethiye Otomatik Şanzıman Tamiri ve Revizyonu',
    en: 'Fethiye Automatic Transmission Repair & Rebuild',
    ru: 'Ремонт и Ревизия АКПП в Фетхие',
    uk: 'Ремонт та Ревізія АКПП у Фетхіє',
    ar: 'إصلاح وتجديد ناقل الحركة الأوتوماتيكي في فتحية',
  };

  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>{h1Titles[locale] || h1Titles.tr}</h1>
          
          <div className="answer-first-block" style={{ backgroundColor: 'rgba(255, 215, 0, 0.05)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--gold)', marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: 0 }}>
              <strong>Evet, Fethiye'de DSG, ZF, Aisin, DCT ve PDK gibi tüm otomatik şanzıman tiplerinin tamirini ve garantili revizyonunu yapıyoruz.</strong> Vites geçişlerinde vuruntu, titreme, kaçırma veya şanzıman beyni (mekatronik) arızası yaşıyorsanız, 50 yıllık ustalık tecrübemizle orijinal cihazlarla arızayı tespit edip %100 garantili şekilde onarıyoruz.
            </p>
          </div>

          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Volvo (Aisin), VW Grubu (DSG), BMW (ZF) ve Mercedes-Benz araçlarınızın en kritik parçası olan otomatik şanzımanları, mikronluk hassasiyetle ve <strong>%100 garantili</strong> olarak revize ediyoruz. Vites geçişlerinde vuruntu, titreme veya ses varsa uzman kadromuza güvenebilirsiniz.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Uzmanlık Alanlarımız</h2>
          <ul style={{ listStyleType: 'disc', marginLeft: '2rem', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            <li><strong>Tork Konvertörlü Şanzımanlar:</strong> Özellikle Volvo, Peugeot ve BMW araçlarda kullanılan Aisin ve ZF şanzımanların bakım ve onarımı.</li>
            <li><strong>Çift Kavrama (DSG / EDC / DCT):</strong> VAG grubu araçlarda sıkça karşılaşılan kavrama bitmesi, mekatronik (şanzıman beyni) arızaları.</li>
            <li><strong>Şanzıman Beyni Tamiri ve Kodlama:</strong> Elektronik arızaların orijinal cihazlarla teşhisi ve yazılım güncellemeleri.</li>
            <li><strong>Dinamik Yağ Değişimi:</strong> Özel makinelerle şanzıman içindeki eski yağın tamamını boşaltarak tam kapasite yeni yağ dolumu.</li>
          </ul>

          <h2 style={{ marginBottom: '1.5rem', color: 'var(--gold)', marginTop: '2rem' }}>Sıkça Sorulan Sorular (SSS)</h2>
          <div className="faq-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>DSG şanzıman mekatronik arızası tamir edilebilir mi?</h3>
              <p style={{ color: 'var(--text-muted)' }}>Evet, Volkswagen, Audi, Skoda ve Seat araçlarda sık görülen DSG mekatronik kart yanması veya basınç tüpü arızalarını, orijinal parçalar kullanarak garantili bir şekilde onarıyor veya kodlamasını yapıyoruz.</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Şanzımandaki vuruntu neden olur?</h3>
              <p style={{ color: 'var(--text-muted)' }}>Vites geçişlerindeki vuruntu genellikle şanzıman beyni (valf gövdesi), eskimiş şanzıman yağı veya selenoid valf arızalarından kaynaklanır. Bilgisayarlı tespit ile net sorunu anında buluyoruz.</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Şanzıman onarımı ne kadar sürer ve garantili midir?</h3>
              <p style={{ color: 'var(--text-muted)' }}>Mekatronik revizyonları genellikle 1-2 iş günü, tam şanzıman revizyonları ise parça teminine göre 3-5 iş günü sürebilmektedir. Tüm şanzıman onarımlarımız 1 yıl garantilidir.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <a href="tel:+905548812021" className="btn btn-primary">Şanzıman Ustasıyla Görüş: 0554 881 20 21</a>
            <a href="/" className="btn btn-gold">Ana Sayfaya Dön</a>
          </div>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "Otomatik Şanzıman Tamiri",
              "description": "Fethiye otomatik şanzıman, DSG, DCT, Aisin tamiri ve revizyonu.",
              "provider": {
                "@type": "AutoRepair",
                "name": "Bursalı Oto Servis"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "DSG şanzıman mekatronik arızası tamir edilebilir mi?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Evet, Volkswagen, Audi, Skoda ve Seat araçlarda sık görülen DSG mekatronik kart yanması veya basınç tüpü arızalarını, orijinal parçalar kullanarak garantili bir şekilde onarıyor veya kodlamasını yapıyoruz."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Şanzımandaki vuruntu neden olur?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Vites geçişlerindeki vuruntu genellikle şanzıman beyni (valf gövdesi), eskimiş şanzıman yağı veya selenoid valf arızalarından kaynaklanır. Bilgisayarlı tespit ile net sorunu anında buluyoruz."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Şanzıman onarımı ne kadar sürer ve garantili midir?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Mekatronik revizyonları genellikle 1-2 iş günü, tam şanzıman revizyonları ise parça teminine göre 3-5 iş günü sürebilmektedir. Tüm şanzıman onarımlarımız 1 yıl garantilidir."
                  }
                }
              ]
            }
          ])
        }}
      />
    </main>
  );
}

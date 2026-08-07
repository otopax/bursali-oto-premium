import { buildSEOContract } from '@/lib/seo/canonical';
import TrustBadges from '@/components/TrustBadges';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const titles = {
    tr: 'Fethiye Mercedes Özel Servisi | Star Diagnosis ile Garantili Tamir',
    en: 'Fethiye Mercedes-Benz Specialist Repair | Star Diagnosis',
    ru: 'Специализированный автосервис Mercedes в Фетхие | Bursali Auto',
    uk: 'Спеціалізований автосервіс Mercedes у Фетхіє | Bursali Auto',
    ar: 'مركز صيانة مرسيدس المتخصص في فتحية | Bursali Auto',
  };

  const descriptions = {
    tr: 'Fethiye\'de Mercedes-Benz otomobil ve Vito/Sprinter hafif ticari araçlarınız için Star Diagnosis ile nokta atışı bilgisayarlı arıza tespiti.',
    en: 'Mercedes-Benz car and Vito/Sprinter fleet specialist service in Fethiye. Official Star Diagnosis fault code lookup and engine rebuild.',
    ru: 'Ремонт легковых и коммерческих Mercedes-Benz в Фетхие на оригинальном оборудовании Star Diagnosis.',
    uk: 'Ремонт легкових та комерційних Mercedes-Benz у Фетхіє на оригінальному обладнанні Star Diagnosis.',
    ar: 'خدمة صيانة مرسيدس بنز وسيارات نقل فايتو وسبρινتر في فتحية بأعلى مستويات الجودة.',
  };

  return buildSEOContract({
    locale,
    path: '/fethiye-mercedes-servisi',
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
  });
}

export default async function MercedesServisiPage({ params }) {
  const { locale } = await params;

  const h1Titles = {
    tr: 'Fethiye Mercedes Özel Servisi',
    en: 'Fethiye Mercedes Specialist Service',
    ru: 'Специализированный сервис Mercedes в Фетхие',
    uk: 'Спеціалізований сервіс Mercedes у Фетхіє',
    ar: 'خدمة مرسيدس المتخصصة في فتحية',
  };

  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>{h1Titles[locale] || h1Titles.tr}</h1>
          
          <div className="answer-first-block" style={{ backgroundColor: 'rgba(255, 215, 0, 0.05)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--gold)', marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: 0 }}>
              <strong>Evet, Fethiye'de Mercedes-Benz araçlara orijinal Star Diagnosis (XENTRY) cihazı ile özel servis hizmeti sağlıyoruz.</strong> A, B, C, E, S serisi tüm binek araçların yanı sıra Vito, Sprinter gibi ticari grupların ağır bakım, motor rektifiye ve elektronik beyin onarımlarını garantili yapıyoruz.
            </p>
          </div>

          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Bursalı Oto Servis olarak 40 yıllık tecrübemizi Mercedes-Benz'in üstün mühendisliğiyle buluşturuyoruz. Aracınızdaki elektriksel, mekanik veya şanzımanla ilgili en karmaşık arızaları, "deneme-yanılma" yapmadan doğrudan buluyor, %100 orijinal yedek parça ve 1 yıl onarım garantisi ile çözüyoruz.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Hizmetlerimiz</h2>
          <ul style={{ listStyleType: 'disc', marginLeft: '2rem', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            <li>Mercedes XENTRY (Star Diagnosis) ile Orijinal Bilgisayarlı Arıza Tespiti</li>
            <li>7G-Tronic ve 9G-Tronic Otomatik Şanzıman Bakımı ve Revizyonu</li>
            <li>Airmatic (Havalı Süspansiyon) Arıza Onarımı ve Kalibrasyonu</li>
            <li>OM ve M Serisi Motor Revizyonları</li>
            <li>DPF (Dizel Partikül Filtresi) ve AdBlue Sistemi Çözümleri</li>
            <li>VIP Turizm Filoları İçin (Vito/Sprinter) Gece Vardiyalı Bakım</li>
          </ul>

          <TrustBadges />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '3rem' }}>
            <a href="https://wa.me/905548812021" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center' }}>
              <span aria-hidden="true" style={{ marginRight: '8px' }}>💬</span> Mercedes Uzmanına Danış
            </a>
            <a href="tel:+905548812021" className="btn btn-gold">Hemen Ara: 0554 881 20 21</a>
          </div>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "AutoRepair",
              "name": "Bursalı Oto Servis - Mercedes Departmanı",
              "description": "Fethiye Mercedes Özel Servisi. Orijinal XENTRY cihazıyla arıza tespiti ve garantili onarım.",
              "priceRange": "$$$",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Fethiye",
                "addressCountry": "TR"
              },
              "makesOffer": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Mercedes Arıza Tespiti ve Tamiri"
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

import { buildSEOContract } from '@/lib/seo/canonical';
import TrustBadges from '@/components/TrustBadges';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const titles = {
    tr: 'Kalkan & Kaş 7/24 Oto Çekici & Yol Yardım | Bursalı Oto',
    en: 'Kalkan & Kas 24/7 Car Towing & Roadside Assistance | Bursali Auto',
    ru: 'Калкан и Каш 24/7 Эвакуатор и Помощь на Дороге | Bursali Auto',
    uk: 'Калкан та Каш 24/7 Евакуатор та Допомога на Дорозі | Bursali Auto',
    ar: 'خدمة سحب السيارات في كالكان وكاش 24/7 | Bursali Auto',
  };

  const descriptions = {
    tr: 'Kalkan ve Kaş bölgesinde acil oto çekici, akü takviyesi ve oto kurtarma servisi. 7/24 güvenli araç taşıma.',
    en: 'Emergency car towing, battery jump-start and roadside repair service in Kalkan and Kaş. 24/7 safe vehicle transport.',
    ru: 'Срочный эвакуатор, прикуривание аккумулятора и помощь на дороге в Калкане и Каше.',
    uk: 'Терміновий евакуатор, прикурювання акумулятора та допомога на дорозі в Калкані та Каші.',
    ar: 'خدمة سحب وتمرير السيارات والمساعدة على الطريق في كالكان وكاش على مدار 24 ساعة.',
  };

  return buildSEOContract({
    locale,
    path: '/kalkan-kas-yol-yardim',
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
  });
}

export default async function KalkanKasCekiciPage({ params }) {
  const { locale } = await params;

  const h1Titles = {
    tr: 'Kalkan & Kaş Acil Oto Çekici',
    en: 'Kalkan & Kas Emergency Tow Truck',
    ru: 'Срочный Эвакуатор в Калкан и Каш',
    uk: 'Терміновий Евакуатор Калкан та Каш',
    ar: 'شاحنة سحب الطوارئ في كالكان وكاش',
  };

  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>{h1Titles[locale] || h1Titles.tr}</h1>
          
          <div className="answer-first-block" style={{ backgroundColor: 'rgba(255, 215, 0, 0.05)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--gold)', marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: 0 }}>
              <strong>Kalkan, Kaş veya Seydikemer güzergahında yolda mı kaldınız?</strong> Özellikle yazın zorlu rampa şartlarında arıza yapan premium ve standart araçlarınız için Fethiye'den 7/24 kesintisiz çekici desteği sağlıyoruz.
            </p>
          </div>

          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Bölgenin coğrafi yapısı gereği Kalkan ve Kaş yolları, araçlarda fren sistemi veya motor/şanzıman harareti sorunlarına sıkça sebep olabilmektedir. Aracınızı bulunduğu konumdan hasarsız çekici sistemlerimiz ile teslim alıyor, Fethiye'deki tam donanımlı tesisimize getiriyoruz.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Bölgeye Özel Hizmetimiz</h2>
          <ul style={{ listStyleType: 'disc', marginLeft: '2rem', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            <li>Kaş ve Kalkan Bölgesine Hızlı İntikal İmkanı</li>
            <li>Güvenli Taşıma Kaskosu (Araçlarınız Taşıma Sürecinde Güvendedir)</li>
            <li>Büyük SUV ve Ticari VIP Araç (Vito/Crafter) Taşıma Kapasitesi</li>
            <li>Arıza Tespiti ve Kapsamlı Onarım İmkanı (Fethiye Merkez Servisimizde)</li>
          </ul>

          <TrustBadges />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '3rem' }}>
            <a href="https://wa.me/905548812021?text=Kalkan/Kaş%20bölgesindeyim,%20acil%20çekici%20lazım." target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center' }}>
              <span aria-hidden="true" style={{ marginRight: '8px' }}>📍</span> Konum Gönder (WhatsApp)
            </a>
            <a href="tel:+905548812021" className="btn btn-gold">Acil Çekici Çağır: 0554 881 20 21</a>
          </div>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "EmergencyService",
              "name": "Bursalı Oto Çekici - Kalkan & Kaş",
              "description": "Kalkan, Kaş ve Seydikemer için Acil Oto Kurtarma ve Çekici Hizmeti",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Kaş",
                "addressRegion": "Antalya",
                "addressCountry": "TR"
              },
              "areaServed": ["Kalkan", "Kaş", "Seydikemer", "Patara"],
              "telephone": "+905548812021"
            }
          ])
        }}
      />
    </main>
  );
}

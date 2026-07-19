import { buildCanonical } from '@/lib/seo/canonical';
import TrustBadges from '@/components/TrustBadges';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: 'Kalkan & Kaş Acil Oto Çekici ve Yol Yardım | Hızlı Ulaşım',
    description: 'Kalkan, Kaş ve Seydikemer bölgelerinde yolda kalan araçlarınız için 7/24 hızlı oto çekici ve yol yardım hizmeti. Fethiye merkez servisimize güvenle taşıyoruz.',
    alternates: buildCanonical(locale, '/kalkan-kas-yol-yardim'),
  };
}

export default function KalkanKasCekiciPage() {
  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Kalkan & Kaş Acil Oto Çekici</h1>
          
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

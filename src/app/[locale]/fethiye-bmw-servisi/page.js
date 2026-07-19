import { buildCanonical } from '@/lib/seo/canonical';
import TrustBadges from '@/components/TrustBadges';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: 'Fethiye BMW Servisi | ISTA Arıza Tespiti & Orijinal Parça Garantili Onarım',
    description: 'Fethiye bölgesinde BMW araçlarınız için orijinal ISTA diagnostik cihazıyla noktasal arıza tespiti, motor ve şanzıman revizyonu. Deneme yanılma yok, garantili hizmet.',
    alternates: buildCanonical(locale, '/fethiye-bmw-servisi'),
  };
}

export default function BmwServisiPage() {
  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Fethiye BMW Özel Servisi</h1>
          
          <div className="answer-first-block" style={{ backgroundColor: 'rgba(255, 215, 0, 0.05)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--gold)', marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: 0 }}>
              <strong>Evet, Fethiye'de BMW araçlara özel, orijinal ISTA cihazı ile hizmet veriyoruz.</strong> Bursalı Oto Servis olarak BMW'nin N ve B serisi motorlarındaki kronik sorunlar, ZF şanzıman arızaları ve elektronik beyin problemlerini yetkili servis hassasiyetinde çözüyoruz.
            </p>
          </div>

          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            BMW marka aracınızı sıradan sanayi yöntemlerine teslim etmeyin. Fethiye'de <strong>orijinal ISTA arıza tespit cihazı</strong> ile aracınızdaki sorunu "deneme-yanılma" yapmadan doğrudan buluyor, %100 orijinal yedek parça ve 1 yıl onarım garantisi ile teslim ediyoruz.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Hizmet Kapsamımız</h2>
          <ul style={{ listStyleType: 'disc', marginLeft: '2rem', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            <li>BMW Orijinal ISTA ile Diagnostik ve Programlama</li>
            <li>ZF Otomatik Şanzıman Yağ Değişimi ve Mekatronik Tamiri</li>
            <li>N13, N20, B38, B48 Motor Revizyonu ve Triger Zinciri Değişimi</li>
            <li>Vanos ve Valvetronic Arızaları Onarımı</li>
            <li>F ve G Kasa Elektronik Arıza Çözümleri</li>
          </ul>

          <TrustBadges />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '3rem' }}>
            <a href="https://wa.me/905548812021" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center' }}>
              <span aria-hidden="true" style={{ marginRight: '8px' }}>💬</span> BMW Uzmanına WhatsApp'tan Sor
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
              "name": "Bursalı Oto Servis - BMW Departmanı",
              "description": "Fethiye BMW Özel Servisi. Orijinal ISTA cihazıyla arıza tespiti ve garantili onarım.",
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
                    "name": "BMW Arıza Tespiti ve Tamiri"
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

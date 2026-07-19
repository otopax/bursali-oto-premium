import { buildCanonical } from '@/lib/seo/canonical';
import TrustBadges from '@/components/TrustBadges';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: 'Ölüdeniz Acil Yol Yardım ve Oto Çekici | 7/24 Hızlı Servis',
    description: 'Ölüdeniz, Ovacık, Hisarönü ve Kayaköy bölgeleri için 7/24 acil oto çekici ve yol yardım hizmeti. Aracınız yolda kaldıysa hemen konum atın, anında gelelim.',
    alternates: buildCanonical(locale, '/oludeniz-yol-yardim'),
  };
}

export default function OludenizYolYardimPage() {
  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Ölüdeniz 7/24 Acil Yol Yardım ve Çekici</h1>
          
          <div className="answer-first-block" style={{ backgroundColor: 'rgba(255, 215, 0, 0.05)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--gold)', marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: 0 }}>
              <strong>Ölüdeniz, Hisarönü, Ovacık veya Kayaköy'de yolda mı kaldınız?</strong> Endişelenmeyin. Sadece WhatsApp üzerinden konumunuzu gönderin, sıfır hasar riski taşıyan özel kameralı çekicilerimiz ile 15-20 dakika içinde yanınızda olalım.
            </p>
          </div>

          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Özellikle yaz sezonunda Ölüdeniz rampalarında aşırı ısınmadan kaynaklı motor ve şanzıman arızaları sık yaşanmaktadır. Bursalı Oto Servis güvencesiyle aracınızı yoldan güvenle alıyor, 7/24 güvenli otoparkımıza çekiyor ve arıza tespitini uzman kadromuzla yapıyoruz.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Neden Bizi Seçmelisiniz?</h2>
          <ul style={{ listStyleType: 'disc', marginLeft: '2rem', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            <li><strong>Hızlı Yanıt:</strong> Ölüdeniz ve çevresine maksimum 20-30 dakika içinde ulaşım.</li>
            <li><strong>Sıfır Hasar Garantisi:</strong> Premium araçlara özel "kaldırma/yükleme" sistemi ile aracınız çizilmeden çekilir.</li>
            <li><strong>Şeffaf Fiyat:</strong> Yabancı turistlere veya acil durumlara özel fahiş fiyat uygulanmaz. (No Tourist Traps)</li>
            <li><strong>Güvenli Park:</strong> Aracınız 7/24 güvenlik kameralarıyla izlenen servis alanımıza alınır.</li>
          </ul>

          <TrustBadges />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '3rem' }}>
            <a href="https://wa.me/905548812021?text=Ölüdeniz%20bölgesindeyim,%20acil%20çekici%20lazım." target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center' }}>
              <span aria-hidden="true" style={{ marginRight: '8px' }}>📍</span> Konum Gönder (WhatsApp)
            </a>
            <a href="tel:+905548812021" className="btn btn-gold">Acil Ara: 0554 881 20 21</a>
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
              "name": "Bursalı Oto Çekici - Ölüdeniz",
              "description": "Ölüdeniz, Ovacık ve Hisarönü için 7/24 Acil Oto Kurtarma ve Çekici Hizmeti",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Ölüdeniz",
                "addressRegion": "Muğla",
                "addressCountry": "TR"
              },
              "areaServed": ["Ölüdeniz", "Ovacık", "Hisarönü", "Kayaköy"],
              "telephone": "+905548812021"
            }
          ])
        }}
      />
    </main>
  );
}

import Link from 'next/link';
import { SEO_PRIORITY } from '@/data/seo-oncelik';
import { buildCanonical } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  
  // Format slug: bmw-servisi-gocek -> brand: bmw, district: gocek
  const parts = slug.split('-');
  const districtRaw = parts[parts.length - 1]; // e.g. "gocek"
  
  // Find brand part: everything before "-servisi-" or "-tamiri-"
  let brandRaw = parts[0];
  if (slug.includes('-servisi-')) {
    brandRaw = slug.split('-servisi-')[0];
  } else if (slug.includes('-tamiri-')) {
    brandRaw = slug.split('-tamiri-')[0];
  }

  const brand = brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1);
  const district = districtRaw.charAt(0).toUpperCase() + districtRaw.slice(1).replace('cek', 'çek').replace('olu', 'ölü'); // Simple tr char fix

  const title = `${district} ${brand} Özel Servisi | Garantili Bakım & Tamir`;
  const description = `Fethiye ${district} bölgesinde profesyonel ${brand} servisi. Orijinal diagnostik cihazlarla ${brand} marka aracınız için bilgisayarlı arıza tespiti ve garantili onarım.`;

  const isTier1 = SEO_PRIORITY.isTier1(slug);

  return {
    title,
    description,
    keywords: `${district} ${brand} servisi, ${brand} tamircisi ${district}, fethiye oto servis, ${brand} yedek parça`,
    alternates: buildCanonical(locale, `bolge/${slug}`),
    ...(!isTier1 && { robots: { index: false, follow: true } })
  };
}

export default async function ProgrammaticSeoPage({ params }) {
  const { locale, slug } = await params;
  
  const parts = slug.split('-');
  const districtRaw = parts[parts.length - 1];
  
  let brandRaw = parts[0];
  if (slug.includes('-servisi-')) {
    brandRaw = slug.split('-servisi-')[0];
  } else if (slug.includes('-tamiri-')) {
    brandRaw = slug.split('-tamiri-')[0];
  }

  const brand = brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1);
  const district = districtRaw.charAt(0).toUpperCase() + districtRaw.slice(1).replace('cek', 'çek').replace('olu', 'ölü').replace('fethiye', 'Fethiye');
  
  // SEO Schema
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": `${district} ${brand} Özel Servisi - Bursalı Oto`,
    "description": `${district} bölgesinde orijinal cihazlarla profesyonel ${brand} tamir ve bakım hizmetleri.`,
    "telephone": "+905548812021",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": district,
      "addressRegion": "Muğla",
      "addressCountry": "TR"
    },
    "areaServed": [
      { "@type": "City", "name": district },
      { "@type": "City", "name": "Fethiye" }
    ],
    "brand": {
      "@type": "Brand",
      "name": brand
    }
  };

  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      
      {/* Hero Section */}
      <section className="container" style={{ paddingBottom: '3rem', textAlign: 'center' }}>
        <span className="badge" style={{ background: 'rgba(37, 211, 102, 0.2)', color: '#25D366', borderColor: '#25D366', marginBottom: '1rem', display: 'inline-block' }}>
          📍 {district} Bölgesine Özel Hizmet
        </span>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: '900', lineHeight: '1.2' }}>
          {district} <span style={{ color: 'var(--accent-gold)' }}>{brand} Servisi</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto', marginBottom: '3rem' }}>
          Aracınız {district} çevresinde arıza mı yaptı veya bakıma mı ihtiyacı var? Profesyonel ekibimiz ve orijinal {brand} diagnostik cihazlarımızla yanınızdayız.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://wa.me/905548812021?text=Merhaba,%20web%20sitenizden%20ula%C5%9F%C4%B1yorum.%20Acil%20yard%C4%B1ma%20ihtiyac%C4%B1m%20var." className="btn btn-gold" target="_blank" rel="noopener noreferrer" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            💬 Hemen WhatsApp'tan Fiyat Al
          </a>
          <a href="tel:+905548812021" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }}>
            📞 Acil Çekici Çağır
          </a>
        </div>
      </section>

      {/* Trust & Features */}
      <section className="container" style={{ paddingBottom: '5rem' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-8 text-center border border-white/5 rounded-2xl">
            <div className="text-4xl mb-4">💻</div>
            <h3 className="text-xl font-bold mb-3 text-white">Orijinal Cihazla Arıza Tespiti</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {brand} marka aracınıza tam uyumlu (PIWIS, ODIS vb.) lisanslı yazılımlarımızla nokta atışı teşhis koyuyoruz. Deneme yanılma yapmıyoruz.
            </p>
          </div>
          <div className="glass-panel p-8 text-center border border-white/5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPÜLER</div>
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold mb-3 text-white">Orijinal Yedek Parça</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Aracınızın değerini ve performansını korumak için %100 orijinal veya garantili OEM yedek parçalar kullanıyoruz.
            </p>
          </div>
          <div className="glass-panel p-8 text-center border border-white/5 rounded-2xl">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-3 text-white">{district} Konumuna Hızlı Erişim</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Bölgenize yakınız! Yolda kaldıysanız 7/24 çekici hizmetimizle aracınızı güvenle garajımıza getiriyor, tatilinizi bölmüyoruz.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Bar */}
      <section style={{ background: 'linear-gradient(90deg, #18181b 0%, #27272a 100%)', padding: '4rem 0', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{brand} Aracınız İçin Ne Gerekiyor?</h2>
            <p className="text-gray-400">Motor revizyonu, otomatik şanzıman, periyodik bakım veya detaylı arıza analizi...</p>
          </div>
          <a href="https://wa.me/905548812021" target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.4)] whitespace-nowrap">
            Ustaya Sor (Ücretsiz)
          </a>
        </div>
      </section>
      
      <div className="h-20"></div>
    </main>
  );
}

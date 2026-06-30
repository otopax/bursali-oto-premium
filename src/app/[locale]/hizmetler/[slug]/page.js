import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'SEO' });
  
  return {
    title: t('transmissionTitle'),
    description: t('transmissionDesc'),
    openGraph: {
      title: t('transmissionTitle'),
      description: t('transmissionDesc'),
      type: 'website',
      locale: locale,
    }
  };
}

export default async function ServiceSeoPage({ params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'SEO' });
  
  // Generate LocalBusiness JSON-LD for transmission repair
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": `Bursalı Oto Servis - Automatic Transmission Specialist`,
    "image": "https://bursaliotoservis.com/bg.png",
    "url": `https://bursaliotoservis.com/${locale}/hizmetler/${slug}`,
    "telephone": "+905000000000",
    "priceRange": "$$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Sanayi Sitesi",
      "addressLocality": "Fethiye",
      "addressRegion": "Muğla",
      "postalCode": "48300",
      "addressCountry": "TR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 36.6217,
      "longitude": 29.1164
    },
    "makesOffer": {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Automatic Transmission Repair & Rebuild"
      }
    }
  };

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', backgroundColor: 'var(--bg-dark)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      
      <section className="container">
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', background: 'linear-gradient(45deg, #d4af37, #fef08a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t('transmissionTitle')}
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#cbd5e1', maxWidth: '800px', lineHeight: '1.8' }}>
          {t('transmissionDesc')}
        </p>
        
        <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
            Şanzıman Revizyon Sürecimiz
          </h2>
          <ul style={{ color: '#e2e8f0', display: 'grid', gap: '1rem', paddingLeft: '1.2rem' }}>
            <li>Bilgisayarlı Şanzıman Beyni (TCM) Testi</li>
            <li>Orijinal Vana Gövdesi (Valve Body) Onarımı</li>
            <li>Tork Konvertör Revizyonu ve Balans Ayarı</li>
            <li>Garantili Montaj ve Uzun Yol Testi</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

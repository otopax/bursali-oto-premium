import { getTranslations } from 'next-intl/server';
import Head from 'next/head';

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'SEO' });
  
  // Example slug: 'bmw-servisi-fethiye' -> extract 'bmw'
  const brandMatch = slug.match(/^([a-z0-9\-]+)-servis/i);
  const rawBrand = brandMatch ? brandMatch[1] : slug;
  
  // Format brand name beautifully (e.g. land-rover -> Land Rover)
  const formattedBrand = rawBrand.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: t('brandServiceTitle', { brand: formattedBrand }),
    description: t('brandServiceDesc', { brand: formattedBrand }),
    openGraph: {
      title: t('brandServiceTitle', { brand: formattedBrand }),
      description: t('brandServiceDesc', { brand: formattedBrand }),
      type: 'website',
      locale: locale,
    }
  };
}

export default async function BrandSeoPage({ params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'SEO' });
  
  const brandMatch = slug.match(/^([a-z0-9\-]+)-servis/i);
  const rawBrand = brandMatch ? brandMatch[1] : slug;
  const formattedBrand = rawBrand.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Generate LocalBusiness JSON-LD
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": `Bursalı Oto Servis - ${formattedBrand} Specialist`,
    "image": "https://bursaliotoservis.com/bg.png",
    "url": `https://bursaliotoservis.com/${locale}/markalar/${slug}`,
    "telephone": "+905000000000",
    "priceRange": "$$",
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
        "name": `${formattedBrand} Repair & Maintenance`
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
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', background: 'linear-gradient(45deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t('brandServiceTitle', { brand: formattedBrand })}
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#cbd5e1', maxWidth: '800px', lineHeight: '1.8' }}>
          {t('brandServiceDesc', { brand: formattedBrand })}
        </p>
        
        <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
            Neden Bursalı Oto Servis?
          </h2>
          <ul style={{ color: '#e2e8f0', display: 'grid', gap: '1rem', paddingLeft: '1.2rem' }}>
            <li>Yetkili Servis standartlarında bilgisayarlı arıza tespiti</li>
            <li>Orijinal ve Garantili Yedek Parça kullanımı</li>
            <li>Şanzıman ve Motor revizyonunda uzman ekip</li>
            <li>Turistler ve Yabancılar için İngilizce konuşan danışmanlar</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

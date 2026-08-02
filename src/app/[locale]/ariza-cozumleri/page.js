import { container } from '@/application/di/container';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';


export const dynamicParams = true;
export const revalidate = 86400;

export const metadata = {
  title: 'Arıza Çözümleri | Bursalı Oto Servis Fethiye',
  description: 'Fethiye premium oto servis olarak karşılaştığımız kronik arızalar ve çözümleri.',
};

const BRAND_LOGOS = {
  'BMW': 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg',
  'Mercedes-Benz': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg',
  'Audi': 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg',
  'Porsche': 'https://upload.wikimedia.org/wikipedia/de/2/2d/Porsche_Wappen.svg',
  'Volkswagen': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg',
  'Land Rover': 'https://upload.wikimedia.org/wikipedia/en/4/4a/LandRover.svg',
  'Volvo': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Volvo-Iron-Mark-Black.svg',
  'Opel': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Opel_logo_2020.svg',
  'Genel / Premium': null
};

export default async function ArizaCozumleriHub({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const hierarchy = await container.hierarchyBuilder.build(locale, 'faults');

  const brands = Object.entries(hierarchy).map(([slug, data]) => {
    let totalFaults = 0;
    Object.values(data.models).forEach(model => {
      totalFaults += model.items.length;
    });
    return {
      slug,
      name: data.name,
      logo: BRAND_LOGOS[data.name] || null,
      count: totalFaults
    };
  }).sort((a, b) => b.count - a.count);

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: '#09090b' }}>
      <div className="container" style={{ margin: '0 auto', padding: '0 2rem', maxWidth: '1200px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center', color: 'var(--text-light)' }}>
          Kronik Arıza Çözümleri Merkezi
        </h1>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto', fontSize: '1.1rem' }}>
          Avrupa premium araç markalarının en sık karşılaşılan kronik arızalarını, kök nedenlerini ve servisimizde uyguladığımız kalıcı çözümleri inceleyin. Lütfen markanızı seçin.
        </p>

        <style dangerouslySetInnerHTML={{__html: `
          .brands-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          @media (min-width: 640px) {
            .brands-grid { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
          }
          @media (min-width: 1024px) {
            .brands-grid { grid-template-columns: repeat(4, 1fr); }
          }
          .brand-box {
            display: flex;
            align-items: center;
            background: rgba(30, 41, 59, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1.5rem 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-decoration: none;
            color: #f8fafc;
          }
          .brand-box:hover {
            border-color: #d4af37;
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(212, 175, 55, 0.15);
            background: rgba(212, 175, 55, 0.05);
          }
          .brand-box-logo {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1.2rem;
            border-right: 1px solid rgba(255,255,255,0.1);
            padding-right: 1.2rem;
          }
          .brand-box-logo img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .brand-box-name {
            font-weight: 600;
            font-size: 1rem;
            flex: 1;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-right: 0.5rem;
          }
          .brand-box-count {
            margin-left: auto;
            flex-shrink: 0;
            white-space: nowrap;
            background: rgba(255,255,255,0.1);
            color: #cbd5e1;
            font-size: 0.8rem;
            padding: 4px 10px;
            border-radius: 12px;
            font-weight: 700;
          }
        `}} />

        <div className="brands-grid">
          {brands.map(brand => (
            <Link key={brand.slug} href={`/${locale}/ariza-cozumleri/${brand.slug}`} className="brand-box">
              <div className="brand-box-logo">
                {brand.logo ? (
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    style={{ filter: (brand.name === 'Volvo' || brand.name === 'Audi') ? 'invert(1)' : 'none' }} 
                  />
                ) : (
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)', fontSize: '1.5rem' }}>{brand.name.charAt(0)}</span>
                )}
              </div>
              <div className="brand-box-name">{brand.name.toUpperCase()}</div>
              <div className="brand-box-count">{brand.count} Arıza</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

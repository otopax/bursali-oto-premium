import Link from 'next/link';
import { buildSEOContract } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return buildSEOContract({
    locale,
    path: '/ariza-kodlari',
    title: 'OBD2 Arıza Kodları ve Çözüm Rehberi | Bursalı Oto Servis Fethiye',
    description: 'Tüm araç markaları için OBD2 arıza kodları kataloğu, nedenleri ve uzman tamir çözümleri.'
  });
}

export default async function ArizaKodlariIndexPage({ params }) {
  const { locale } = await params;
  const canonicalBrands = [
    { name: 'Volkswagen', slug: 'volkswagen' },
    { name: 'Audi', slug: 'audi' },
    { name: 'BMW', slug: 'bmw' },
    { name: 'Mercedes-Benz', slug: 'mercedes-benz' },
    { name: 'Porsche', slug: 'porsche' },
    { name: 'Seat', slug: 'seat' },
    { name: 'Skoda', slug: 'skoda' },
    { name: 'Volvo', slug: 'volvo' }
  ];

  return (
    <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)' }}>
          OBD2 Kütüphanesi
        </span>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-light)' }}>
          Araç Arıza Kodları ve Teşhis Kataloğu
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto' }}>
          Aracınızın gösterge panelinde veya diyagnoz cihazında çıkan arıza kodunu seçerek detaylı nedenlerine ve orijinal servis çözümlerine ulaşabilirsiniz.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        {canonicalBrands.map((brand) => (
          <Link href={`/${locale}/kutuphane/${brand.slug}`} key={brand.slug} style={{ textDecoration: 'none' }}>
            <div className="glass-panel hover-gold-border" style={{ 
              padding: '2rem', 
              borderRadius: '16px', 
              border: '1px solid rgba(255,255,255,0.05)',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-light)', margin: '0 0 0.5rem 0' }}>{brand.name}</h2>
              <span style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>Arıza Kodlarını İncele →</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
        <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>Popüler OBD2 Arıza Kodları</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {['P0030', 'P2433', 'P0087', 'P0101', 'P0300', 'P0420'].map((code) => (
            <Link href={`/${locale}/ariza-cozumleri`} key={code} style={{ 
              background: 'rgba(255,255,255,0.03)',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-light)',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              {code} Çözümü
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

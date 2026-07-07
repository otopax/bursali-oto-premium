import Link from 'next/link';
import { getFuseboxBrands } from '@/lib/fuseboxDb';

export const metadata = {
  title: 'Sigorta Kutusu ve Röle Şemaları Kütüphanesi | Bursalı Oto',
  description: 'Tüm araç markalarının detaylı sigorta kutusu diyagramları, röle şemaları ve amper değerleri.',
};

export default async function SigortaBrandsPage({ params }) {
  const { locale } = await params;
  const brands = await getFuseboxBrands();

  return (
    <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)' }}>
          Kütüphane (Library)
        </span>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-light)' }}>
          Sigorta ve Röle Şemaları
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto' }}>
          Aracınızın markasını seçerek detaylı sigorta kutusu diyagramlarına ve amper/işlev tablolarına ulaşabilirsiniz.
        </p>
      </div>

      {brands.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {brands.map((brand, idx) => {
            const brandCapitalized = brand.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return (
              <Link href={`/${locale}/sigorta-kutuphanesi/${brand}`} key={idx}>
                <div className="glass-panel hover-gold-border" style={{ 
                  padding: '2rem', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '16px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}>
                  <div style={{ color: 'var(--text-light)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {brandCapitalized}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>Şu anda sistemde sigorta kutusu verisi bulunmuyor.</p>
        </div>
      )}
    </main>
  );
}

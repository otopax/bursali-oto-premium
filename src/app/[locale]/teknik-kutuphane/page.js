import { getAvailableBrands } from '@/lib/libraryUtils';
import Link from 'next/link';

export const metadata = {
  title: 'Araç Teknik Kütüphanesi | Sigorta Şemaları ve Tamir Kılavuzları',
  description: 'Yüzlerce araç markası için sigorta kutusu diyagramları, röle şemaları ve orijinal tamir/servis kılavuzları. Tamamen ücretsiz teknik bilgi bankası.',
};

export default async function TechnicalLibraryHome({ params }) {
  const { locale } = await params;
  const brands = getAvailableBrands();

  return (
    <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-light)' }}>
          Araç Teknik Kütüphanesi
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto' }}>
          Aracınıza ait sigorta kutusu diyagramlarını (fuse box) ve detaylı tamir/servis kılavuzlarını (service manuals) anında bulun.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {brands.map((brand) => (
          <Link href={`/${locale}/teknik-kutuphane/${brand}`} key={brand} style={{ textDecoration: 'none' }}>
            <div className="glass-panel hover-gold-border" style={{ textAlign: 'center', padding: '2rem 1rem', transition: 'all 0.3s ease', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 style={{ textTransform: 'capitalize', margin: 0, fontSize: '1.2rem', color: 'var(--text-light)' }}>
                {brand.replace('-', ' ')}
              </h2>
            </div>
          </Link>
        ))}
      </div>

      {brands.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          Şu an kütüphane güncelleniyor. Lütfen daha sonra tekrar deneyin.
        </div>
      )}
    </main>
  );
}

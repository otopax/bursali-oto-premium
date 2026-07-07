import { getModelsForBrand, getAvailableBrands } from '@/lib/libraryUtils';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { marka } = await params;
  const brandName = marka.replace('-', ' ').toUpperCase();
  return {
    title: `${brandName} Sigorta Şemaları ve Tamir Kılavuzları | Araç Teknik Kütüphanesi`,
    description: `${brandName} marka aracınız için detaylı sigorta kutusu diyagramları ve servis/tamir kılavuzları. Ücretsiz PDF indir ve incele.`,
  };
}

// Generate static params for SEO
export async function generateStaticParams() {
  const brands = getAvailableBrands();
  return brands.map((brand) => ({ marka: brand }));
}

export default async function BrandPage({ params }) {
  const { locale, marka } = await params;
  const models = getModelsForBrand(marka);
  const brandName = marka.replace('-', ' ').toUpperCase();

  return (
    <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <Link href={`/${locale}/teknik-kutuphane`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>
          &larr; Kütüphaneye Dön
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-light)' }}>
          {brandName} Teknik Arşivi
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto' }}>
          Lütfen detaylarını görüntülemek istediğiniz {brandName} modelini seçiniz.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {models.map((model) => (
          <Link href={`/${locale}/teknik-kutuphane/${marka}/${model}`} key={model} style={{ textDecoration: 'none' }}>
            <div className="glass-panel hover-blue-border" style={{ padding: '1.5rem 1rem', display: 'flex', alignItems: 'center', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <span style={{ fontSize: '1.1rem', color: 'var(--text-light)', fontWeight: '500', textTransform: 'capitalize' }}>
                {model.replace(/-/g, ' ')}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {models.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          Bu markaya ait veri bulunamadı veya henüz güncelleniyor.
        </div>
      )}
    </main>
  );
}

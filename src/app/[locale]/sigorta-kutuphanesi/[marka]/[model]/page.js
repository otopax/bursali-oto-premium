import Link from 'next/link';
import { getFuseboxYears } from '@/lib/fuseboxDb';

export async function generateMetadata({ params }) {
  const { marka, model } = await params;
  const brandCapitalized = marka.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const modelClean = model.replace(/[_-]/g, ' ').toUpperCase();
  return {
    title: `${brandCapitalized} ${modelClean} Sigorta Kutusu Şemaları | Bursalı Oto`,
    description: `${brandCapitalized} ${modelClean} aracının üretim yıllarına göre detaylı sigorta ve röle şemaları.`,
  };
}

export default async function SigortaYearsPage({ params }) {
  const { locale, marka, model } = await params;
  const years = await getFuseboxYears(marka, model);
  
  const brandCapitalized = marka.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const modelClean = model.replace(/[_-]/g, ' ').toUpperCase();

  return (
    <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href={`/${locale}/sigorta-kutuphanesi/${marka}`} style={{ color: 'var(--accent-gold)', display: 'inline-block', marginBottom: '1rem' }}>
          &larr; {brandCapitalized} Modelleri
        </Link>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-light)' }}>
          {brandCapitalized} {modelClean} <span style={{ color: 'var(--text-muted)' }}>Üretim Yılları</span>
        </h1>
      </div>

      {years.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem' }}>
          {years.map((year, idx) => {
            return (
              <Link href={`/${locale}/sigorta-kutuphanesi/${marka}/${model}/${year}`} key={idx}>
                <div className="glass-panel hover-gold-border" style={{ 
                  padding: '1.5rem', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '12px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ color: 'var(--text-light)', fontSize: '1.3rem', fontWeight: 'bold' }}>
                    {year}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>Bu modele ait yıl bilgisi bulunamadı.</p>
      )}
    </main>
  );
}

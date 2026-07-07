import Link from 'next/link';
import { getFuseboxModels } from '@/lib/fuseboxDb';

export async function generateMetadata({ params }) {
  const { marka } = await params;
  const brandCapitalized = marka.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    title: `${brandCapitalized} Sigorta Kutusu ve Röle Şemaları | Bursalı Oto`,
    description: `${brandCapitalized} marka araçların tüm modelleri için sigorta kutusu diyagramları ve detaylı şemalar.`,
  };
}

export default async function SigortaModelsPage({ params }) {
  const { locale, marka } = await params;
  const models = await getFuseboxModels(marka);
  const brandCapitalized = marka.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href={`/${locale}/sigorta-kutuphanesi`} style={{ color: 'var(--accent-gold)', display: 'inline-block', marginBottom: '1rem' }}>
          &larr; Tüm Markalar
        </Link>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-light)' }}>
          {brandCapitalized} <span style={{ color: 'var(--text-muted)' }}>Modelleri</span>
        </h1>
      </div>

      {models.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {models.map((model, idx) => {
            const modelClean = model.replace(/[_-]/g, ' ');
            return (
              <Link href={`/${locale}/sigorta-kutuphanesi/${marka}/${model}`} key={idx}>
                <div className="glass-panel hover-gold-border" style={{ 
                  padding: '1.5rem', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ color: 'var(--text-light)', fontSize: '1.1rem', fontWeight: '500', textTransform: 'capitalize' }}>
                    {brandCapitalized} {modelClean}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>Bu markaya ait model bulunamadı.</p>
      )}
    </main>
  );
}

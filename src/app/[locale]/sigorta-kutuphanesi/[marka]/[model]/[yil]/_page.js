import Link from 'next/link';
import { getFuseBoxesWithFuses } from '@/lib/fuseboxDb';

export async function generateMetadata({ params }) {
  const { marka, model, yil } = await params;
  const brandCapitalized = marka.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const modelClean = model.replace(/[_-]/g, ' ').toUpperCase();
  return {
    title: `${brandCapitalized} ${modelClean} ${yil} Sigorta Kutusu Şeması | Bursalı Oto`,
    description: `${brandCapitalized} ${modelClean} ${yil} aracının tüm sigorta kutuları, röle şemaları, amper değerleri ve işlevleri.`,
  };
}

export default async function SigortaDetailPage({ params }) {
  const { locale, marka, model, yil } = await params;
  const fuseBoxes = await getFuseBoxesWithFuses(marka, model, yil);
  
  const brandCapitalized = marka.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const modelClean = model.replace(/[_-]/g, ' ').toUpperCase();

  // Helper for fuse colors
  const getAmpColor = (amp) => {
    if (!amp) return '#94a3b8';
    if (amp <= 5) return '#fbcfe8'; // Pink
    if (amp <= 7.5) return '#b45309'; // Brown
    if (amp <= 10) return '#ef4444'; // Red
    if (amp <= 15) return '#3b82f6'; // Blue
    if (amp <= 20) return '#eab308'; // Yellow
    if (amp <= 25) return '#d97706'; // Transparent
    if (amp <= 30) return '#22c55e'; // Green
    return '#f97316'; // Orange
  };

  return (
    <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href={`/${locale}/sigorta-kutuphanesi/${marka}/${model}`} style={{ color: 'var(--accent-gold)', display: 'inline-block', marginBottom: '1rem' }}>
          &larr; {brandCapitalized} {modelClean} Yılları
        </Link>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
          {brandCapitalized} {modelClean} ({yil})
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Sigorta ve Röle Şemaları</p>
      </div>

      {fuseBoxes.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {fuseBoxes.map((box, boxIdx) => (
            <div key={boxIdx} className="glass-panel" style={{ 
              padding: '2rem', 
              border: '1px solid rgba(255,255,255,0.05)', 
              borderRadius: '16px'
            }}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--accent-gold)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                {box.name || `Sigorta Kutusu ${boxIdx + 1}`}
              </h2>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '1rem' }}>No</th>
                      <th style={{ padding: '1rem' }}>Tip</th>
                      <th style={{ padding: '1rem' }}>Amper</th>
                      <th style={{ padding: '1rem' }}>Açıklama (İşlev)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {box.fuses.map((fuse, fuseIdx) => (
                      <tr key={fuseIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>{fuse.fuseNumber}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{fuse.type || '-'}</td>
                        <td style={{ padding: '1rem' }}>
                          {fuse.amp ? (
                            <span style={{ 
                              background: getAmpColor(fuse.amp), 
                              color: '#fff', 
                              padding: '0.25rem 0.75rem', 
                              borderRadius: '999px',
                              fontWeight: 'bold',
                              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                            }}>
                              {fuse.amp}A
                            </span>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-light)' }}>{fuse.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>Bu araç için henüz detaylı sigorta şeması bulunamadı.</p>
      )}
    </main>
  );
}

import { getSortedPostsData } from '@/lib/blog';
import Link from 'next/link';

export const metadata = {
  title: 'Arıza Çözümleri | Bursalı Oto Servis Fethiye',
  description: 'Fethiye premium oto servis olarak karşılaştığımız kronik arızalar ve çözümleri.',
  alternates: {
    canonical: 'https://www.bursaliotoservis.com/ariza-cozumleri'
  }
};

export default async function ArizaCozumleriHub({ params }) {
  const { locale } = await params;
  const faults = getSortedPostsData(locale, 'faults'); // Using folder 'faults'

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: '#09090b' }}>
      <div className="container" style={{ margin: '0 auto', padding: '0 2rem', maxWidth: '1200px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center', color: 'var(--text-light)' }}>
          Kronik Arıza Çözümleri Merkezi
        </h1>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto', fontSize: '1.1rem' }}>
          Avrupa premium araç markalarının en sık karşılaşılan kronik arızalarını, kök nedenlerini ve servisimizde uyguladığımız kalıcı çözümleri inceleyin.
        </p>

        <div className="grid">
          {faults.map((fault) => (
            <Link 
              key={fault.id} 
              href={`/${locale}/ariza-cozumleri/${fault.id}`}
              className="glass-panel hover-gold-border"
              style={{ display: 'block', padding: '2rem', textDecoration: 'none' }}
            >
              <div>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '4px 12px', 
                  background: 'rgba(212, 175, 55, 0.1)', 
                  fontSize: '0.8rem', 
                  fontWeight: '600', 
                  color: 'var(--accent-gold)', 
                  borderRadius: '20px', 
                  marginBottom: '1rem' 
                }}>
                  {fault.brand}
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                  {fault.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                  Modeller: {fault.model}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

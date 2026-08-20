import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { buildSEOContract } from '@/lib/seo/canonical';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: 'Fethiye Oto Servis & Tamir | Bursalı Oto',
    description: 'Fethiye ve çevresinde premium araçlarınız için profesyonel oto servis, bakım ve tamir hizmetleri. BMW, Mercedes, Audi ve daha fazlası.',
    ...buildSEOContract({ locale, path: '/fethiye', title: 'Fethiye Oto Servis & Tamir', description: 'Fethiye premium araç servisi.' })
  };
}

export default async function FethiyeServicePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: '#09090b', color: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--accent-gold)' }}>Fethiye Oto Servis</h1>
        <p style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.8' }}>
          Bursalı Oto Servis olarak Fethiye, Göcek, Ölüdeniz ve Kalkan bölgelerinde premium araçlarınız için yetkili servis kalitesinde, güvenilir ve garantili bakım onarım hizmeti sunuyoruz.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Premium Marka Uzmanlığı</h3>
            <p style={{ color: '#aaa' }}>BMW, Mercedes, Audi, Porsche ve Volvo araçlarınızın periyodik bakım ve ağır hasar onarımlarında en güncel arıza tespit cihazlarıyla hizmet veriyoruz.</p>
          </div>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '8px', border: '1px solid #333' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Fethiye Merkezli Hizmet</h3>
            <p style={{ color: '#aaa' }}>Sanayi sitemizdeki modern tesisimizde veya yolda kaldığınızda Fethiye içi acil yol yardım ve çekici hizmetimizle yanınızdayız.</p>
          </div>
        </div>

        <div style={{ marginTop: '4rem' }}>
          <h2 style={{ fontSize: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>Markalara Özel Servislerimiz</h2>
          <ul style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem', listStyle: 'none', padding: 0 }}>
            {['bmw', 'mercedes', 'audi', 'volvo', 'porsche'].map(marka => (
              <li key={marka}>
                <Link 
                  href={`/${locale}/fethiye/${marka}-servisi`} 
                  style={{ display: 'inline-block', padding: '0.8rem 1.5rem', background: '#222', borderRadius: '4px', color: '#fff', textDecoration: 'none', textTransform: 'capitalize' }}
                >
                  Fethiye {marka} Servisi
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

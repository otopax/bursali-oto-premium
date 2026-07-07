import InteractiveBrandGrid from '@/components/InteractiveBrandGrid';
import LiveSearch from '@/components/LiveSearch';

export const metadata = {
  title: 'Bilgi Bankası & Araç Kataloğu | Bursalı Oto Servis',
  description: 'Premium araçlar (BMW, Mercedes, Porsche) için arıza kodları, sigorta şemaları ve teknik bilgi bankası.',
};

export default async function KnowledgeBasePage({ params }) {
  const { locale } = await params;

  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', background: '#0f172a' }}>
      <section style={{ 
        position: 'relative', 
        minHeight: '40vh', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 0'
      }}>
        <div style={{ 
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.9), #0f172a), url("https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          zIndex: 0
        }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 10, width: '100%', marginTop: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', marginBottom: '3rem' }}>
            <span className="badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>
              {locale === 'tr' ? 'Dijital Teknik Altyapı' : 'Digital Technical Infrastructure'}
            </span>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {locale === 'tr' ? 'Bursalı Oto' : 'Bursalı Auto'}{' '}
              <span style={{ color: 'var(--accent-gold)' }}>
                {locale === 'tr' ? 'Bilgi Bankası' : 'Knowledge Base'}
              </span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
              {locale === 'tr' 
                ? 'Arıza kodları, şanzıman verileri ve marka/model bazlı sigorta şemaları için dünyanın en kapsamlı otonom oto servis veritabanı.' 
                : 'The world’s most comprehensive autonomous auto repair database for fault codes and brand/model specific diagrams.'}
            </p>
          </div>

          <LiveSearch locale={locale} />
        </div>
      </section>

      <section className="container" style={{ paddingBottom: '5rem' }}>
        <InteractiveBrandGrid locale={locale} />
      </section>

    </main>
  );
}

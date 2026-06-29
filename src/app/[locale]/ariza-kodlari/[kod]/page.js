import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { kod } = await params;
  return {
    title: `OBD Arıza Kodu: ${kod.toUpperCase()} | Çözüm ve Nedenleri`,
    description: `${kod.toUpperCase()} arıza kodunun belirtileri, olası nedenleri ve profesyonel onarım çözümleri.`,
  };
}

export default async function FaultCodePage({ params }) {
  const { locale, kod } = await params;
  
  // In the future, this data will be fetched from the RAG Database / AI
  const codeUpper = kod.toUpperCase();

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px' }}>
      <section className="container" style={{ paddingBottom: '5rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href={`/${locale}/bilgi-bankasi`} style={{ color: 'var(--accent-gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ← {locale === 'tr' ? 'Bilgi Bankasına Dön' : 'Back to Knowledge Base'}
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '3rem', borderLeft: '5px solid #e11d48' }}>
          <span className="badge" style={{ background: 'rgba(225, 29, 72, 0.2)', color: '#fda4af', borderColor: '#fda4af' }}>
            OBD-II DIAGNOSTIC
          </span>
          <h1 style={{ fontSize: '3rem', marginTop: '1rem', marginBottom: '1rem' }}>
            {codeUpper}
          </h1>
          
          <h2 style={{ color: 'var(--accent-gold)', marginBottom: '2rem' }}>
            {locale === 'tr' ? 'Otonom Araştırma Sürecinde...' : 'Under Autonomous Investigation...'}
          </h2>

          <div style={{ lineHeight: '1.8', color: '#cbd5e1', fontSize: '1.1rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              {locale === 'tr' 
                ? 'Bu arıza kodu şu anda AI botlarımız tarafından uluslararası otomotiv veritabanlarında ve teknik bültenlerde araştırılıyor.'
                : 'This fault code is currently being researched by our AI bots across international automotive databases and technical bulletins.'}
            </p>
            <p>
              {locale === 'tr'
                ? 'Araştırma tamamlandığında, bu sayfada arızanın belirtileri, olası nedenleri ve PIWIS/ODIS orijinal cihazlarımızla sunduğumuz kesin çözüm yöntemleri yayınlanacaktır.'
                : 'Once the research is complete, this page will feature the symptoms, possible causes, and the exact solutions we provide using our original PIWIS/ODIS tools.'}
            </p>
          </div>

          <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>
              {locale === 'tr' ? 'Bu Arızayı Mı Yaşıyorsunuz?' : 'Experiencing this fault?'}
            </h3>
            <p style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>
              {locale === 'tr' 
                ? 'Deneme yanılma yapmadan, orijinal cihazlarla arızanızı nokta atışı bulalım.' 
                : 'Let us pinpoint the exact issue using original diagnostic tools, without the guesswork.'}
            </p>
            <a href="https://wa.me/905548812021" className="btn btn-gold" target="_blank" rel="noopener noreferrer">
              {locale === 'tr' ? 'Uzmanla Görüş (WhatsApp)' : 'Consult an Expert (WhatsApp)'}
            </a>
          </div>
        </div>

      </section>
    </main>
  );
}

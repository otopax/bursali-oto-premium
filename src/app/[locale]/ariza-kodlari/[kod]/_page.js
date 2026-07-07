import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { kod } = await params;
  const codeUpper = kod.toUpperCase();

  const fault = await prisma.faultCode.findUnique({
    where: { code: codeUpper }
  });

  if (fault) {
    return {
      title: `${codeUpper} Arıza Kodu Çözümü: ${fault.description} | Bursalı Oto Fethiye`,
      description: `${codeUpper} arızası belirtileri, ${fault.description}. Orijinal cihazlarla garantili tespit ve onarım için profesyonel Fethiye oto servisi.`,
    };
  }

  return {
    title: `OBD Arıza Kodu: ${codeUpper} | Çözüm ve Nedenleri`,
    description: `${codeUpper} arıza kodunun belirtileri, olası nedenleri ve profesyonel onarım çözümleri.`,
  };
}

export default async function FaultCodePage({ params }) {
  const { locale, kod } = await params;
  const codeUpper = kod.toUpperCase();

  const fault = await prisma.faultCode.findUnique({
    where: { code: codeUpper }
  });

  // Prepare JSON-LD Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": `${codeUpper} Arıza Kodu Çözümü`,
    "description": fault ? fault.description : `${codeUpper} arıza kodunun profesyonel analizi.`,
    "author": {
      "@type": "Organization",
      "name": "Bursalı Oto Servis"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bursalı Oto Servis"
    }
  };

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
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
          
          {fault ? (
            <>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>{fault.description}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {fault.symptoms && (
                  <div className="bg-black/40 p-6 rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold mb-4 text-[var(--accent-gold)]">Belirtiler</h3>
                    <ul className="list-disc pl-5 text-gray-300 space-y-2">
                      {Array.isArray(fault.symptoms) ? fault.symptoms.map((s, i) => <li key={i}>{s}</li>) : <li>{fault.symptoms.toString()}</li>}
                    </ul>
                  </div>
                )}
                
                {fault.commonCauses && (
                  <div className="bg-black/40 p-6 rounded-xl border border-white/10">
                    <h3 className="text-xl font-bold mb-4 text-[var(--accent-gold)]">Olası Nedenler</h3>
                    <ul className="list-disc pl-5 text-gray-300 space-y-2">
                      {Array.isArray(fault.commonCauses) ? fault.commonCauses.map((c, i) => <li key={i}>{c}</li>) : <li>{fault.commonCauses.toString()}</li>}
                    </ul>
                  </div>
                )}
              </div>

              {fault.stepByStepSolution && (
                <div className="mt-8 bg-black/40 p-6 rounded-xl border border-white/10">
                  <h3 className="text-xl font-bold mb-4 text-green-400">Çözüm Adımları</h3>
                  <div className="text-gray-300 leading-relaxed">
                    {typeof fault.stepByStepSolution === 'string' ? fault.stepByStepSolution : JSON.stringify(fault.stepByStepSolution)}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
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
            </>
          )}

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

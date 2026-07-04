import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import FaultCodeSearch from '@/components/FaultCodeSearch';

export const metadata = {
  title: 'Yapay Zeka Destekli Arıza Kodu Çözüm Merkezi | Bursalı Oto',
  description: 'Aracınızın OBD2 arıza kodunu (Örn: P0171) arayın, Yapay Zeka destekli belirtiler, sebepler ve detaylı tamir eğitimlerine ulaşın.',
};

export default async function FaultCodesHome({ params }) {
  const { locale } = await params;

  let showcase = [];
  try {
    showcase = await prisma.faultCode.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' }
    });
  } catch (e) {
    console.error("Failed to load fault codes from database", e);
  }

  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', background: '#09090b' }}>
      <section className="container" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', borderColor: '#eab308', marginBottom: '1rem', display: 'inline-block' }}>
          Yapay Zeka Destekli (Gemini AI)
        </span>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--text-light)', fontWeight: '800' }}>
          Akıllı Arıza <span style={{ color: 'var(--accent-gold)' }}>Çözüm Merkezi</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto', marginBottom: '3rem' }}>
          Tüm marka ve modeller için standart OBD-II arıza kodlarını (Örn: P0171, P0420) arayın. Kronik sorunları ve dünya çapından en iyi tamir videolarını keşfedin.
        </p>

        {/* Client Component for Interactive Search */}
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
          <FaultCodeSearch locale={locale} />
        </div>
      </section>

      <section className="container" style={{ paddingBottom: '5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
          Son Analiz Edilen Arızalar
        </h2>
        
        {showcase.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {showcase.map((item, idx) => (
              <Link href={`/${locale}/ariza-cozumleri/${item.code}`} key={idx}>
                <div className="glass-panel hover-gold-border" style={{ 
                  padding: '2rem', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  background: 'rgba(24, 24, 27, 0.5)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--accent-gold)', fontWeight: '800', fontSize: '1.8rem' }}>
                      {item.code}
                    </div>
                    <div style={{ padding: '4px 8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      OBD-II
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description || 'Detaylı yapay zeka analizi ve çözüm adımları için tıklayın.'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sistem şu an veritabanını oluşturuyor...</p>
        )}
      </section>
    </main>
  );
}

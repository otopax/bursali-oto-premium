import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

export const metadata = {
  title: 'Yapay Zeka Destekli Arıza Kodu Çözüm Merkezi | Bursalı Oto Servis',
  description: 'Aracınızın OBD2 arıza kodunu (Örn: P0171, P0420) seçin, Yapay Zeka destekli belirtiler, sebepler ve detaylı tamir videolarına ulaşın.',
};

export default async function FaultCodesHome({ params }) {
  const { locale } = await params;
  const prisma = new PrismaClient();

  // Fetch from the actual PostgreSQL database instead of the legacy file system (which got mixed up with fuses)
  let showcase = [];
  try {
    const dbCodes = await prisma.faultCode.findMany({
      take: 12,
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: {
          include: {
            manufacturer: true
          }
        }
      }
    });

    showcase = dbCodes.map(c => ({
      code: c.code,
      brand: c.vehicle?.manufacturer?.name || 'Genel',
      model: c.vehicle?.model || 'OBD2',
    }));
  } catch (e) {
    console.error("Failed to load fault codes from database", e);
  }

  return (
    <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', borderColor: '#eab308' }}>
          Yapay Zeka Destekli (Gemini AI)
        </span>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-light)' }}>
          Akıllı Arıza Çözüm Merkezi
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto' }}>
          Araç marka ve modelinize özel arıza kodu (OBD-II) analizleri, kronik sorunlar ve dünya çapından en iyi tamir videoları.
        </p>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '3rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '4rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Öne Çıkan Arıza Analizleri</h2>
        
        {showcase.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', textAlign: 'left' }}>
            {showcase.map((item, idx) => {
              const brandClean = item.brand.replace(/[_-]/g, ' ');
              const brandCapitalized = brandClean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              const modelClean = item.model; // Database already has clean model names, no need for formatModelName

              return (
                <Link href={`/${locale}/ariza-cozumleri/${item.brand.toLowerCase()}/${item.model.toLowerCase()}/${item.code}`} key={idx}>
                  <div className="glass-panel hover-gold-border" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s' }}>
                    <div style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                      {item.code}
                    </div>
                    <div style={{ color: 'var(--text-light)', textTransform: 'capitalize' }}>
                      {brandCapitalized} {modelClean}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Sistem şu an veritabanını oluşturuyor. Lütfen daha sonra tekrar deneyin.</p>
        )}
      </div>

    </main>
  );
}

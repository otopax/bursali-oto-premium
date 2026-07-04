import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { kod } = await params;
  return {
    title: `${kod.toUpperCase()} Arıza Kodu Çözümü | Yapay Zeka Destekli Analiz`,
    description: `Aracınızda ${kod.toUpperCase()} arızası mı alıyorsunuz? Yapay zeka destekli detaylı belirtiler, yaygın sebepler ve adım adım tamir çözümü.`,
  };
}

export default async function FaultCodeDetailPage({ params }) {
  const { locale, kod } = await params;

  let data = null;
  try {
    data = await prisma.faultCode.findUnique({
      where: { code: kod.toUpperCase() },
      include: {
        repairVideos: true
      }
    });
  } catch (e) {
    console.error("Failed to load fault code details", e);
  }

  if (!data) {
    return (
      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-light)', marginBottom: '1rem', fontSize: '2.5rem' }}>Arıza Bulunamadı</h2>
        <p style={{ color: 'var(--text-muted)' }}>Bu arıza kodu henüz yapay zeka tarafından analiz edilmedi veya sistemde yok.</p>
        <Link href={`/${locale}/ariza-cozumleri`} style={{ 
          display: 'inline-block', 
          marginTop: '2rem',
          padding: '1rem 2rem',
          background: 'var(--accent-gold)',
          color: '#000',
          borderRadius: '999px',
          fontWeight: 'bold'
        }}>
          Arama Motoruna Dön
        </Link>
      </main>
    );
  }

  // Severity color mapping
  const severityColors = {
    'Low': '#10b981', // green
    'Medium': '#f59e0b', // orange
    'High': '#ef4444', // red
    'Critical': '#991b1b' // dark red
  };
  const severityColor = data.severity ? (severityColors[data.severity] || '#3b82f6') : '#3b82f6';

  return (
    <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      
      {/* Header Panel */}
      <div className="glass-panel" style={{ 
        padding: '3rem', 
        borderRadius: '16px', 
        border: '1px solid rgba(255,255,255,0.05)',
        borderTop: `4px solid ${severityColor}`,
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', borderColor: '#eab308', marginBottom: '1rem', display: 'inline-block' }}>
              Gemini AI Analizi
            </span>
            <h1 style={{ fontSize: '3.5rem', color: 'var(--text-light)', marginBottom: '1rem', fontWeight: '800' }}>
              {data.code}
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px', lineHeight: '1.6' }}>
              {data.description}
            </p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Tehlike Seviyesi</div>
            <div style={{ 
              display: 'inline-block', 
              padding: '0.5rem 1.5rem', 
              background: `${severityColor}20`, 
              color: severityColor, 
              borderRadius: '999px', 
              fontWeight: 'bold',
              border: `1px solid ${severityColor}40`
            }}>
              {data.severity || 'Bilinmiyor'}
            </div>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      {data.repairVideos && data.repairVideos.length > 0 && (
        <div style={{ marginTop: '4rem' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-light)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--accent-gold)' }}>►</span> Yapay Zeka Onaylı Tamir Videoları
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {data.repairVideos.map((video) => (
              <div key={video.id} className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe 
                    src={`https://www.youtube.com/embed/${video.youtubeId}`} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                    {video.title}
                  </h3>
                  {video.channelName && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      Kanal: {video.channelName}
                    </p>
                  )}
                  {video.aiSummary && (
                    <div style={{ 
                      padding: '1rem', 
                      background: 'rgba(212, 175, 55, 0.05)', 
                      borderRadius: '8px',
                      borderLeft: '3px solid var(--accent-gold)'
                    }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginBottom: '0.5rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        AI Video Özeti
                      </div>
                      <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        {video.aiSummary}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

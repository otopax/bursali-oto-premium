import { getFaultCodeData, getAvailableFaultBrands, getModelsForFaultBrand, getCodesForModel } from '@/lib/faultCodeUtils';
import Link from 'next/link';

export const revalidate = 86400; // Sayfayı 24 saatte bir sunucuda statik olarak yenile (ISR Cache)

export async function generateMetadata({ params }) {
  const { marka, model, kod } = await params;
  const brandName = marka.replace(/-/g, ' ').toUpperCase();
  const modelName = model.replace(/-/g, ' ').toUpperCase();
  return {
    title: `${brandName} ${modelName} ${kod} Arıza Kodu Çözümü | Yapay Zeka Destekli Analiz`,
    description: `${brandName} ${modelName} aracınızda ${kod} arızası mı alıyorsunuz? Yapay zeka destekli detaylı belirtiler, yaygın sebepler ve adım adım tamir çözümü.`,
  };
}

// SEO için statik yollar oluştur
export async function generateStaticParams() {
  const paramsList = [];
  const brands = getAvailableFaultBrands();
  for (const marka of brands) {
    const models = getModelsForFaultBrand(marka);
    for (const model of models) {
      const codes = getCodesForModel(marka, model);
      for (const kod of codes) {
        paramsList.push({ marka, model, kod });
      }
    }
  }
  return paramsList;
}

export default async function FaultCodeDetailPage({ params }) {
  const { locale, marka, model, kod } = await params;
  
  const data = getFaultCodeData(marka, model, kod);

  const brandName = marka.replace(/-/g, ' ').toUpperCase();
  const modelName = model.replace(/-/g, ' ').toUpperCase();

  if (!data) {
    return (
      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <h2>Veri Bulunamadı</h2>
        <p>Bu arıza kodu henüz yapay zeka tarafından analiz edilmedi veya sistemde yok.</p>
        <Link href={`/${locale}/ariza-cozumleri`} className="btn btn-primary" style={{ marginTop: '2rem' }}>
          Geri Dön
        </Link>
      </main>
    );
  }

  const ai = data.aiAnalysis;

  // Severity color mapping
  const severityColors = {
    'Low': '#10b981', // green
    'Medium': '#f59e0b', // orange
    'High': '#ef4444', // red
    'Critical': '#991b1b' // dark red
  };
  const severityColor = ai?.severity ? (severityColors[ai.severity] || '#3b82f6') : '#3b82f6';

  return (
    <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <Link href={`/${locale}/ariza-cozumleri`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>
          &larr; Arama Sayfasına Dön
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)', margin: 0 }}>
            {brandName} {modelName}
          </span>
          {ai?.severity && (
            <span className="badge" style={{ background: `${severityColor}20`, color: severityColor, borderColor: severityColor, margin: 0 }}>
              {ai.severity} Seviye Uyarı
            </span>
          )}
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>
          {kod}
        </h1>
        <p style={{ fontSize: '1.4rem', color: 'var(--text-light)', maxWidth: '800px', margin: '0 auto', fontWeight: '500' }}>
          {ai?.description || 'Teknik açıklama aranıyor...'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Belirtiler (Symptoms) */}
        {ai?.symptoms && ai.symptoms.length > 0 && (
          <div className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid #f59e0b' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#f59e0b' }}>⚠️ Sürücünün Hissedeceği Belirtiler</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {ai.symptoms.map((symptom, idx) => (
                <li key={idx} style={{ marginBottom: '0.8rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#f59e0b' }}>•</span>
                  {symptom}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Nedenler (Common Causes) */}
        {ai?.commonCauses && ai.commonCauses.length > 0 && (
          <div className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid #ef4444' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ef4444' }}>🔍 Olası Arıza Sebepleri (Kronik)</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {ai.commonCauses.map((cause, idx) => (
                <li key={idx} style={{ marginBottom: '0.8rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#ef4444' }}>•</span>
                  {cause}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Çözüm Adımları (Step-by-step) */}
        {ai?.stepByStepSolution && ai.stepByStepSolution.length > 0 && (
          <div className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid #10b981' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#10b981' }}>🛠️ Adım Adım Tamir / Çözüm Rehberi</h2>
            <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-light)' }}>
              {ai.stepByStepSolution.map((step, idx) => (
                <li key={idx} style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                  {step}
                </li>
              ))}
            </ol>
            {ai?.estimatedCostInfo && (
              <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <strong>💰 Maliyet & Süre:</strong> {ai.estimatedCostInfo}
              </div>
            )}
          </div>
        )}

        {/* YouTube Videoları */}
        {data.videos && data.videos.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>📺 Örnek Tamir Videoları</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {data.videos.slice(0, 3).map((video, idx) => {
                // YouTube embed URL'i oluşturma (watch?v=id -> embed/id)
                let embedUrl = video.url;
                try {
                   const urlObj = new URL(video.url);
                   if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
                       embedUrl = `https://www.youtube.com/embed/${urlObj.searchParams.get('v')}`;
                   } else if (urlObj.hostname.includes('youtu.be')) {
                       embedUrl = `https://www.youtube.com/embed${urlObj.pathname}`;
                   }
                } catch(e){}

                return (
                  <div key={idx} className="glass-panel" style={{ padding: '1rem' }}>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', marginBottom: '1rem' }}>
                      <iframe 
                        src={embedUrl} 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} 
                        allowFullScreen
                        title={video.title}
                      />
                    </div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-light)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {video.title}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
      {/* SEO Internal Linking Engine */}
      <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>🔗 İlgili Kaynaklar (SEO)</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          
          {/* Related Models */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-light)', marginBottom: '1rem', fontSize: '1.1rem' }}>{brandName} Markasının Diğer Modelleri</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {getModelsForFaultBrand(marka).filter(m => m !== model).slice(0, 5).map(relatedModel => (
                <li key={relatedModel}>
                  <Link href={`/${locale}/ariza-cozumleri/${marka}/${relatedModel}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    {brandName} {relatedModel.replace(/-/g, ' ').toUpperCase()} Arıza Çözümleri
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Fault Codes */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-light)', marginBottom: '1rem', fontSize: '1.1rem' }}>Bu Araçtaki Diğer Arızalar</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {getCodesForModel(marka, model).filter(c => c !== kod).slice(0, 5).map(relatedCode => (
                <li key={relatedCode}>
                  <Link href={`/${locale}/ariza-cozumleri/${marka}/${model}/${relatedCode}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    {brandName} {modelName} {relatedCode} Arızası
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

    </main>
  );
}

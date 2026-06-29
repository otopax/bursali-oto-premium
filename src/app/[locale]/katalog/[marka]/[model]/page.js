import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

export async function generateMetadata({ params }) {
  const { marka, model } = await params;
  return {
    title: `${marka.toUpperCase()} ${model.replace(/-/g, ' ')} Sigorta ve Arıza Kataloğu`,
    description: `${marka.toUpperCase()} ${model.replace(/-/g, ' ')} için orijinal sigorta şemaları, röle diyagramları ve arıza çözümleri.`,
  };
}

export default async function ModelCatalogPage({ params }) {
  const { locale, marka, model } = await params;
  
  // Path to the downloaded model folder
  const modelPath = path.join(process.cwd(), 'public', 'catalog', marka, model);
  
  let htmlContent = null;
  let diagrams = [];

  try {
    if (fs.existsSync(modelPath)) {
      const files = fs.readdirSync(modelPath);
      
      // Find the tables.html file
      if (files.includes('tables.html')) {
        htmlContent = fs.readFileSync(path.join(modelPath, 'tables.html'), 'utf-8');
      }

      // Find diagram images
      diagrams = files.filter(f => f.startsWith('diagram_') && (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')));
    }
  } catch (error) {
    console.error('Error reading model directory:', error);
  }

  const modelNameReadable = model.replace(marka + '-', '').replace('-fuses', '').replace(/-/g, ' ').toUpperCase();

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px' }}>
      <section className="container" style={{ paddingBottom: '5rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href={`/${locale}/katalog/${marka}`} style={{ color: 'var(--accent-gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ← {locale === 'tr' ? `${marka.toUpperCase()} Modellerine Dön` : `Back to ${marka.toUpperCase()} Models`}
          </Link>
        </div>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          {marka.toUpperCase()} <span style={{ color: 'var(--accent-gold)' }}>{modelNameReadable}</span>
        </h1>
        
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid var(--accent-blue)', padding: '1rem', marginBottom: '3rem', borderRadius: '4px' }}>
          <p style={{ color: '#e2e8f0', margin: 0 }}>
            {locale === 'tr' 
              ? 'Aşağıdaki veriler otonom botlarımız tarafından uluslararası teknik veritabanlarından çekilmiştir. Arıza tespiti için referans olarak kullanabilirsiniz.' 
              : 'The following data has been gathered by our autonomous bots from international technical databases. Use as a reference for fault diagnosis.'}
          </p>
        </div>

        {!htmlContent && diagrams.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>
              {locale === 'tr' ? 'Bu model için henüz veri toplanmadı veya işleniyor.' : 'Data for this model is currently being processed.'}
            </p>
          </div>
        ) : (
          <div className="catalog-content">
            <style dangerouslySetInnerHTML={{__html: `
              .catalog-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 2rem 0;
                background: rgba(15, 23, 42, 0.6);
                border-radius: 8px;
                overflow: hidden;
              }
              .catalog-content th {
                background: rgba(212, 175, 55, 0.2);
                color: var(--accent-gold);
                text-align: left;
                padding: 1rem;
                border-bottom: 2px solid rgba(255,255,255,0.1);
              }
              .catalog-content td {
                padding: 1rem;
                border-bottom: 1px solid rgba(255,255,255,0.05);
                color: #e2e8f0;
              }
              .catalog-content tr:last-child td {
                border-bottom: none;
              }
              .diagram-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
              }
              .diagram-card {
                background: rgba(255,255,255,0.02);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 1rem;
                text-align: center;
              }
              .diagram-image-wrapper {
                position: relative;
                width: 100%;
                height: 250px;
                border-radius: 8px;
                overflow: hidden;
              }
            `}} />

            {/* Diagrams Section */}
            {diagrams.length > 0 && (
              <>
                <h2 style={{ marginBottom: '1.5rem', color: 'white' }}>
                  {locale === 'tr' ? 'Sigorta Şemaları ve Diyagramlar' : 'Fuse Box Diagrams'}
                </h2>
                <div className="diagram-grid">
                  {diagrams.map(img => (
                    <div key={img} className="diagram-card">
                      <div className="diagram-image-wrapper">
                        <Image 
                          src={`/catalog/${marka}/${model}/${img}`} 
                          alt={`${modelNameReadable} Diagram`}
                          fill
                          style={{ objectFit: 'contain' }}
                          sizes="(max-width: 768px) 100vw, 300px"
                        />
                      </div>
                      <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>{img}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* HTML Tables Section */}
            {htmlContent && (
              <>
                <h2 style={{ marginBottom: '1.5rem', color: 'white', marginTop: '3rem' }}>
                  {locale === 'tr' ? 'Sigorta ve Amper Tabloları' : 'Fuse and Amperage Tables'}
                </h2>
                <div 
                  className="glass-panel" 
                  style={{ padding: '2rem', overflowX: 'auto' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }}
                />
              </>
            )}

          </div>
        )}

      </section>
    </main>
  );
}

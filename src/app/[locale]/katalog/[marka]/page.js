import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { marka } = await params;
  return {
    title: `${marka.toUpperCase()} Teknik Katalog | Bursalı Oto Servis`,
    description: `${marka.toUpperCase()} araçlar için sigorta şemaları, arıza kodları ve onarım rehberleri.`,
  };
}

function parseModelSlug(slug, marka) {
  let cleanSlug = slug.replace('-fuses-and-relays', '').replace('-fuses-and-relay', '').replace('-fuses', '');
  
  if (cleanSlug.startsWith(marka + '-')) {
    cleanSlug = cleanSlug.substring(marka.length + 1);
  }

  const yearRegex = /-(\d{4})(?:-(\d{4}|\d{2}))?$/;
  const match = cleanSlug.match(yearRegex);
  
  let yearRange = '';
  let modelNameSlug = cleanSlug;

  if (match) {
    yearRange = match[1];
    if (match[2]) {
      const endYear = match[2].length === 2 ? match[1].substring(0, 2) + match[2] : match[2];
      yearRange += ' - ' + endYear;
    } else {
      yearRange += ' - ...';
    }
    modelNameSlug = cleanSlug.substring(0, match.index);
  }

  const modelName = modelNameSlug.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

  return { modelName, yearRange };
}

export default async function BrandCatalogPage({ params }) {
  const { locale, marka } = await params;
  
  const catalogPath = path.join(process.cwd(), 'public', 'catalog', marka);
  let models = [];
  
  try {
    if (fs.existsSync(catalogPath)) {
      models = fs.readdirSync(catalogPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
          const slug = dirent.name;
          const { modelName, yearRange } = parseModelSlug(slug, marka);
          
          return {
            slug,
            modelName,
            yearRange,
            path: `/${locale}/katalog/${marka}/${slug}`
          };
        });
    }
  } catch (error) {
    console.error('Error reading catalog directory:', error);
  }

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', backgroundColor: 'var(--bg-dark)' }}>
      <section className="container" style={{ paddingBottom: '5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href={`/${locale}/bilgi-bankasi`} style={{ color: 'var(--accent-gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
            ← {locale === 'tr' ? 'Markalara Dön' : 'Back to Brands'}
          </Link>
        </div>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textTransform: 'capitalize', fontWeight: '700' }}>
          {marka} <span style={{ color: 'var(--accent-gold)' }}>
            {locale === 'tr' ? 'Modelleri' : 'Models'}
          </span>
        </h1>

        {models.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '12px' }}>
            <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>
              {locale === 'tr' 
                ? 'Bu marka için teknik veriler yapay zeka botumuz tarafından toplanıyor...' 
                : 'Technical data for this brand is currently being gathered by our AI bot...'}
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            {models.map(model => (
              <Link key={model.slug} href={model.path} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  padding: '1.5rem', 
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{ 
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '80px'
                  }}>
                    <svg width="64" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1">
                      <path d="M14 16H9m10 0h-3m-6 0H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2z"></path>
                      <circle cx="7" cy="16" r="2"></circle>
                      <circle cx="17" cy="16" r="2"></circle>
                    </svg>
                  </div>
                  <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.2rem', fontWeight: '600' }}>
                    {model.modelName}
                  </h3>
                  {model.yearRange && (
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '400' }}>
                      {model.yearRange}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

import { getFuseBoxDataForModel, getManualsDataForModel, getAvailableBrands, getModelsForBrand } from '@/lib/libraryUtils';
import Link from 'next/link';
import Image from 'next/image';

export async function generateMetadata({ params }) {
  const { marka, model } = await params;
  const brandName = marka.replace('-', ' ').toUpperCase();
  const modelName = model.replace(/-/g, ' ').toUpperCase();
  return {
    title: `${brandName} ${modelName} Sigorta Şeması ve Tamir Kılavuzları`,
    description: `${brandName} ${modelName} aracınız için teknik veriler, orijinal sigorta kutusu (fuse box) röle diyagramları ve pdf servis kılavuzları (repair manuals).`,
  };
}

export default async function ModelPage({ params }) {
  const { locale, marka, model } = await params;
  
  const fuseBoxData = getFuseBoxDataForModel(marka, model);
  const manualsData = getManualsDataForModel(marka, model);

  const brandName = marka.replace('-', ' ').toUpperCase();
  const modelName = model.replace(/-/g, ' ').toUpperCase();

  return (
    <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <Link href={`/${locale}/teknik-kutuphane/${marka}`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>
          &larr; {brandName} Modellerine Dön
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)', marginBottom: '1rem', display: 'inline-block' }}>
          Teknik Kütüphane
        </span>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-light)' }}>
          {brandName} {modelName}
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto' }}>
          Araç elektroniği şemaları ve yetkili servis tamir kılavuzları.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        
        {/* Fuse Box Section */}
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', color: '#eab308' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-light)' }}>Sigorta Şemaları (Fuse Boxes)</h2>
          </div>
          
          {fuseBoxData && fuseBoxData.pages && fuseBoxData.pages.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {fuseBoxData.pages.map((page, index) => (
                <div key={index} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--accent-gold)' }}>{page.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {page.images.map((img, i) => (
                      <Link href={`/fusebox_data/${marka}/${model}/${img}`} target="_blank" key={i}>
                        <div style={{ width: '80px', height: '60px', position: 'relative', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                           <Image src={`/fusebox_data/${marka}/${model}/${img}`} alt="Sigorta Kutusu Görseli" fill style={{ objectFit: 'cover' }} />
                        </div>
                      </Link>
                    ))}
                  </div>
                  {page.tables && page.tables.length > 0 && (
                     <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                        {page.tables.length} adet veri tablosu mevcut.
                     </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8' }}>Bu model için sigorta şeması verisi bulunamadı veya henüz güncelleniyor.</p>
          )}
        </section>

        {/* Manuals Section */}
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--accent-blue)' }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-light)' }}>Servis & Tamir Kılavuzları</h2>
          </div>

          {manualsData && manualsData.manuals && manualsData.manuals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {manualsData.manuals.map((manual, index) => (
                <div key={index} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-light)' }}>{manual.title}</h3>
                  <a href={`/startmycar_manuals/${marka}/${model}/${manual.filename}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.9rem' }}>
                    PDF İndir / Görüntüle
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8' }}>Bu model için henüz PDF tamir kılavuzu bulunamadı.</p>
          )}
        </section>

      </div>

    </main>
  );
}

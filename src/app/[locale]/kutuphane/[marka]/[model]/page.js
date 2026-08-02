import { container } from '@/application/di/container';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { locale, marka, model } = await params;
  try {
    const hierarchy = await container.hierarchyBuilder.build(locale, 'faults');
    const brandData = hierarchy[marka] || { name: marka };
    const modelData = brandData.models?.[model] || { name: model };
    
    return {
      title: `${brandData.name || marka} ${modelData.name || model} Teknik Kütüphane & Arıza Rehberi | Bursalı Oto`,
      description: `${brandData.name || marka} ${modelData.name || model} aracı için arıza kodları, çözümleri, sigorta şemaları ve teknik ayar kılavuzları.`
    };
  } catch (e) {
    return { title: 'Teknik Kütüphane | Bursalı Oto' };
  }
}

export default async function KutuphaneModelPage({ params }) {
  const { locale, marka, model } = await params;
  setRequestLocale(locale);

  let brandData = { name: marka, models: {} };
  let modelData = { name: model, items: [] };

  try {
    const hierarchy = await container.hierarchyBuilder.build(locale, 'faults');
    if (hierarchy[marka]) {
      brandData = hierarchy[marka];
      if (brandData.models?.[model]) {
        modelData = brandData.models[model];
      }
    }
  } catch (e) {}

  const faultCount = modelData.items ? modelData.items.length : 0;

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: '#09090b' }}>
      <div className="container" style={{ margin: '0 auto', padding: '0 2rem', maxWidth: '1200px' }}>
        
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '2rem', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href={`/${locale}/kutuphane`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Kütüphane
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <Link href={`/${locale}/kutuphane/${marka}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            {brandData.name || marka}
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--accent-gold)' }}>{modelData.name || model}</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-light)' }}>
          {brandData.name || marka} {modelData.name || model} <span style={{ color: 'var(--accent-gold)' }}>Teknik Bilgi Bankası</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '800px', fontSize: '1.1rem' }}>
          {brandData.name || marka} {modelData.name || model} aracı için sigorta şemalarına, PDF servis kılavuzlarına, motor teknik ayar verilerine ve arıza çözümlerine aşağıdan ulaşabilirsiniz.
        </p>

        {/* 4 Cards Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          
          {/* Card 1: Sigorta Şemaları */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
              <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.75rem', fontWeight: '600' }}>Sigorta Şemaları</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Motor içi, bagaj ve yolcu bölmesindeki sigorta kutularının Türkçe çevirileri, amper değerleri ve röle dizilimleri.
              </p>
            </div>
            <button style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-muted)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'not-allowed',
              textAlign: 'center'
            }}>
              Yakında Eklenecek
            </button>
          </div>

          {/* Card 2: PDF Kılavuzlar */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
              <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.75rem', fontWeight: '600' }}>PDF Kılavuzlar</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Orijinal bakım periyotları, üretici TSB (Teknik Servis Bülteni) uyarıları ve montaj kılavuzları.
              </p>
            </div>
            <button style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-muted)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'not-allowed',
              textAlign: 'center'
            }}>
              Yakında Eklenecek
            </button>
          </div>

          {/* Card 3: Teknik Spesifikasyonlar & Ayar Verileri */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚙️</div>
              <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.75rem', fontWeight: '600' }}>Teknik Ayar Verileri</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Motor sıkıştırma torkları, rölanti devri, buji tırnak aralığı, şanzıman ve motor yağ dolum kapasiteleri.
              </p>
            </div>
            <button style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-muted)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'not-allowed',
              textAlign: 'center'
            }}>
              Yakında Eklenecek
            </button>
          </div>

          {/* Card 4: Arıza Çözümleri & Kronik Sorunlar (Aktif & Bağlantılı) */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(212, 175, 55, 0.1) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--accent-gold)', marginBottom: '0.75rem', fontWeight: '600' }}>
                Arıza Çözümleri ({faultCount})
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {brandData.name || marka} {modelData.name || model} modeline ait kronik arızalar, DTC arıza kodları (P0087 vb.), belirtileri ve servis çözüm adımlarımız.
              </p>
            </div>
            <Link href={`/${locale}/kutuphane/${marka}/${model}/arizalar`} style={{
              display: 'block',
              width: '100%',
              background: 'var(--accent-gold)',
              color: '#000',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              textDecoration: 'none',
              textAlign: 'center'
            }}>
              Arızaları Görüntüle →
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}

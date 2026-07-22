import { getHierarchyData } from '@/lib/blog';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams({ params }) {
  const { locale } = await params;
  const hierarchy = getHierarchyData(locale, 'faults');
  
  const staticParams = [];
  Object.keys(hierarchy).forEach(marka => {
    Object.keys(hierarchy[marka].models).forEach(model => {
      staticParams.push({ marka, model });
    });
  });
  
  return staticParams;
}

export async function generateMetadata({ params }) {
  const { locale, marka, model } = await params;
  const hierarchy = getHierarchyData(locale, 'faults');
  
  const brandData = hierarchy[marka];
  if (!brandData) return { title: 'Bulunamadı' };
  
  const modelData = brandData.models[model];
  if (!modelData) return { title: 'Bulunamadı' };
  
  return {
    title: `${brandData.name} ${modelData.name} Teknik Kütüphane | Bursalı Oto`,
    description: `${brandData.name} ${modelData.name} modeline ait sigorta şemaları, bakım kılavuzları ve TSB bültenleri.`
  };
}

export default async function KutuphaneModelPage({ params }) {
  const { locale, marka, model } = await params;
  setRequestLocale(locale);
  const hierarchy = getHierarchyData(locale, 'faults');
  
  const brandData = hierarchy[marka];
  if (!brandData) notFound();
  
  const modelData = brandData.models[model];
  if (!modelData) notFound();

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: '#09090b' }}>
      <div className="container" style={{ margin: '0 auto', padding: '0 2rem', maxWidth: '1200px' }}>
        
        {/* Breadcrumb */}
        <div style={{ marginBottom: '2rem', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href={`/${locale}/kutuphane`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Kütüphane
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <Link href={`/${locale}/kutuphane/${marka}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            {brandData.name}
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--accent-gold)' }}>{modelData.name}</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-light)' }}>
          {brandData.name} {modelData.name} <span style={{ color: 'var(--accent-gold)' }}>Dokümanları</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '800px', fontSize: '1.1rem' }}>
          {brandData.name} {modelData.name} aracı için sigorta (fuse) şemalarına ve servis pdf'lerine aşağıdan ulaşabilirsiniz.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Fuse Diagrams Card */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '2rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>Sigorta Şemaları</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Motor içi, bagaj ve yolcu bölmesindeki sigorta kutularının Türkçe çevirileri, amper değerleri ve röle dizilimleri.
            </p>
            <button style={{
              background: 'rgba(212, 175, 55, 0.1)',
              color: 'var(--accent-gold)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'not-allowed',
              opacity: 0.7
            }}>
              Yakında Eklenecek
            </button>
          </div>

          {/* Manuals Card */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '2rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>PDF Kılavuzlar</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Orijinal bakım periyotları, üretici TSB (Teknik Servis Bülteni) uyarıları ve montaj kılavuzları.
            </p>
            <button style={{
              background: 'rgba(212, 175, 55, 0.1)',
              color: 'var(--accent-gold)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'not-allowed',
              opacity: 0.7
            }}>
              Yakında Eklenecek
            </button>
          </div>

          {/* Faults Shortcut Card */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(212, 175, 55, 0.05) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '16px',
            padding: '2rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>Kronik Arızalar</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Bu araca ait sık karşılaşılan kronik sorunlar ve uzman servis çözümlerimiz.
            </p>
            <Link href={`/${locale}/ariza-cozumleri/${marka}/${model}`} style={{
              display: 'inline-block',
              background: 'var(--accent-gold)',
              color: '#000',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              textDecoration: 'none'
            }}>
              Arızaları Görüntüle
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}

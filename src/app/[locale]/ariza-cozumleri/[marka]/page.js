import { container } from '@/application/di/container';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams({ params }) {
  const { locale } = await params;
  const hierarchy = await container.hierarchyBuilder.build(locale, 'faults');
  return Object.keys(hierarchy).map((marka) => ({
    marka: marka
  }));
}

export async function generateMetadata({ params }) {
  const { locale, marka } = await params;
  const hierarchy = await container.hierarchyBuilder.build(locale, 'faults');
  const brandData = hierarchy[marka];
  
  if (!brandData) return { title: 'Bulunamadı' };
  
  return {
    title: `${brandData.name} Arıza Çözümleri | Bursalı Oto`,
    description: `${brandData.name} markasına ait en sık karşılaşılan kronik arızalar ve çözümleri. Lütfen aracınızın modelini seçin.`
  };
}

export default async function ArizaCozumleriBrandPage({ params }) {
  const { locale, marka } = await params;
  setRequestLocale(locale);
  const hierarchy = await container.hierarchyBuilder.build(locale, 'faults');
  
  const brandData = hierarchy[marka];
  if (!brandData) {
    notFound();
  }

  const models = Object.entries(brandData.models).map(([slug, data]) => ({
    slug,
    name: data.name,
    count: data.items.length
  })).sort((a, b) => b.count - a.count);

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: '#09090b' }}>
      <div className="container" style={{ margin: '0 auto', padding: '0 2rem', maxWidth: '1200px' }}>
        
        {/* Breadcrumb */}
        <div style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
          <Link href={`/${locale}/ariza-cozumleri`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>
            &larr; Tüm Markalar
          </Link>
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-light)' }}>
          {brandData.name} <span style={{ color: 'var(--accent-gold)' }}>Arıza Çözümleri</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '800px', fontSize: '1.1rem' }}>
          Aşağıdaki listeden aracınızın modelini seçerek, o modele ait yaygın arızaları ve çözümlerini inceleyebilirsiniz.
        </p>

        <style dangerouslySetInnerHTML={{__html: `
          .models-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 1rem;
          }
          @media (min-width: 640px) {
            .models-grid { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
          }
          @media (min-width: 1024px) {
            .models-grid { grid-template-columns: repeat(3, 1fr); }
          }
          .model-box {
            display: flex;
            align-items: center;
            background: rgba(30, 41, 59, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 1.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            color: #f8fafc;
          }
          .model-box:hover {
            border-color: #d4af37;
            transform: translateY(-2px);
            background: rgba(212, 175, 55, 0.05);
          }
          .model-box-name {
            font-weight: 600;
            font-size: 1.2rem;
          }
          .model-box-count {
            margin-left: auto;
            background: rgba(255,255,255,0.05);
            color: #94a3b8;
            font-size: 0.85rem;
            padding: 4px 12px;
            border-radius: 12px;
          }
        `}} />

        <div className="models-grid">
          {models.map(model => (
            <Link key={model.slug} href={`/${locale}/ariza-cozumleri/${marka}/${model.slug}`} className="model-box">
              <div className="model-box-name">{model.name}</div>
              <div className="model-box-count">{model.count} Kayıt</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

import { container } from '@/application/di/container';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';


export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return [];
}

import { buildSEOContract } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale, marka } = await params;
  const hierarchy = await container.hierarchyBuilder.build(locale, 'faults');
  const brandData = hierarchy[marka];
  const bName = brandData ? brandData.name : marka.toUpperCase();

  const titles = {
    tr: `${bName} Teknik Dokümanlar & Şemalar | Bursalı Oto Servis`,
    en: `${bName} Technical Manuals & Fuse Diagrams | Bursali Auto Repair`,
    ru: `${bName} Технические Руководства и Схемы | Bursali Auto Repair`,
    uk: `${bName} Технічні Посібники та Схеми | Bursali Auto Repair`,
    ar: `${bName} الأدلة الفنية ومخططات الصيانة | Bursali Auto Repair`,
  };

  const descriptions = {
    tr: `${bName} markasına ait teknik servis dokümanları, sigorta kutusu şemaları ve tamir kılavuzları.`,
    en: `${bName} technical service manuals, fuse box diagrams and repair guides at Bursali Auto Repair Fethiye.`,
    ru: `Техническая документация и схемы предохранителей ${bName} в автосервисе Bursali Fethiye.`,
    uk: `Технічна документація та схеми запобіжників ${bName} в автосервісі Bursali Fethiye.`,
    ar: `الوثائق الفنية ومخططات المصاهر لسيارات ${bName} في ورشة بورصالي فتحية.`,
  };

  return {
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
    ...buildSEOContract({ locale, path: `/kutuphane/${marka}`, title: titles[locale] || titles.tr, description: descriptions[locale] || descriptions.tr })
  };
}

export default async function KutuphaneBrandPage({ params }) {
  const { locale, marka } = await params;
  setRequestLocale(locale);
  const hierarchy = await container.hierarchyBuilder.build(locale, 'faults');
  
  const brandData = hierarchy[marka];
  if (!brandData) {
    notFound();
  }

  const models = Object.entries(brandData.models).map(([slug, data]) => ({
    slug,
    name: data.name
  })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: '#09090b' }}>
      <div className="container" style={{ margin: '0 auto', padding: '0 2rem', maxWidth: '1200px' }}>
        
        {/* Breadcrumb */}
        <div style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
          <Link href={`/${locale}/kutuphane`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>
            &larr; Kütüphane Ana Sayfası
          </Link>
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-light)' }}>
          {brandData.name} <span style={{ color: 'var(--accent-gold)' }}>Modelleri</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '800px', fontSize: '1.1rem' }}>
          Teknik dokümanlarına veya sigorta şemalarına ulaşmak istediğiniz aracın modelini seçiniz.
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
          .model-box-arrow {
            margin-left: auto;
            color: var(--accent-gold);
            font-size: 1.2rem;
          }
        `}} />

        <div className="models-grid">
          {models.map(model => (
            <Link key={model.slug} href={`/${locale}/kutuphane/${marka}/${model.slug}`} className="model-box">
              <div className="model-box-name">{model.name}</div>
              <div className="model-box-arrow">&rarr;</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

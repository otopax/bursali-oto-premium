import { container } from '@/application/di/container';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';


export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return [];
}

import { buildCanonical } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale, marka } = await params;
  const hierarchy = await container.hierarchyBuilder.build(locale, 'faults');
  const brandData = hierarchy[marka];
  const bName = brandData ? brandData.name : marka.toUpperCase();

  const titles = {
    tr: `${bName} Kronik Arıza Çözümleri | Bursalı Oto Servis Fethiye`,
    en: `${bName} Chronic Fault Solutions & Repair | Bursali Auto Repair`,
    ru: `${bName} Инструкция по Ремонту и Диагностика | Bursali Auto Repair`,
    uk: `${bName} Посібник з Ремонту та Діагностика | Bursali Auto Repair`,
    ar: `${bName} دليل إصلاح الأعطال والتشخيص | Bursali Auto Repair`,
  };

  const descriptions = {
    tr: `${bName} markasına ait en sık karşılaşılan kronik arızalar, kök nedenleri ve garantili tamir çözümleri. Fethiye özel servisi.`,
    en: `Most common ${bName} chronic faults, root causes and guaranteed repair solutions at Bursali Auto Repair Fethiye.`,
    ru: `Частые неисправности ${bName}, причины и гарантированный ремонт в автосервисе Bursali Fethiye.`,
    uk: `Найпоширеніші несправності ${bName}, причини та гарантований ремонт в автосервісі Bursali Fethiye.`,
    ar: `أكثر أعطال ${bName} شيوعاً وأسبابها وحلول الإصلاح المضمونة في ورشة بورصالي فتحية.`,
  };

  return {
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
    alternates: buildCanonical(locale, `/ariza-cozumleri/${marka}`),
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
            flex: 1;
            min-width: 0;
            padding-right: 0.5rem;
          }
          .model-box-count {
            margin-left: auto;
            flex-shrink: 0;
            white-space: nowrap;
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

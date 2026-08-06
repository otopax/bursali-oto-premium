import { container } from '@/application/di/container';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return [];
}

import { buildCanonical } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale, marka, model } = await params;
  try {
    const hierarchy = await container.hierarchyBuilder.build(locale, 'faults');
    const brandData = hierarchy[marka] || { name: marka };
    const modelData = brandData.models?.[model] || { name: model };
    const bName = brandData.name || marka.toUpperCase();
    const mName = modelData.name || model.toUpperCase();

    const titles = {
      tr: `${bName} ${mName} Arıza Çözümleri & Tamir | Bursalı Oto Servis Fethiye`,
      en: `${bName} ${mName} Common Fault Solutions | Bursali Auto Repair Fethiye`,
      ru: `${bName} ${mName} Частые Ошибки и Ремонт | Bursali Auto Repair Fethiye`,
      uk: `${bName} ${mName} Поширені Помилки та Ремонт | Bursali Auto Repair Fethiye`,
      ar: `${bName} ${mName} حلول الأعطال والإصلاح | Bursali Auto Repair Fethiye`,
    };

    const descriptions = {
      tr: `${bName} ${mName} modeline ait kronik arıza kodları, belirtileri ve uzman tamir çözümleri. Fethiye özel oto servis.`,
      en: `${bName} ${mName} fault codes, symptoms and expert repair solutions at Bursali Auto Repair Fethiye.`,
      ru: `Диагностика и ремонт редких неисправностей ${bName} ${mName} в автосервисе Bursali Fethiye.`,
      uk: `Діагностика та ремонт редких несправностей ${bName} ${mName} в автосервісі Bursali Fethiye.`,
      ar: `تشخيص وإصلاح أعطال ${bName} ${mName} في ورشة بورصالي فتحية.`,
    };

    return {
      title: titles[locale] || titles.tr,
      description: descriptions[locale] || descriptions.tr,
      alternates: buildCanonical(locale, `/ariza-cozumleri/${marka}/${model}`),
    };
  } catch (e) {
    return {
      title: 'Arıza Çözümleri | Bursalı Oto Servis',
      alternates: buildCanonical(locale, `/ariza-cozumleri/${marka}/${model}`),
    };
  }
}

export default async function ArizaCozumleriModelPage({ params }) {
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

  const faults = modelData.items || [];

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: '#09090b' }}>
      <div className="container" style={{ margin: '0 auto', padding: '0 2rem', maxWidth: '1200px' }}>
        
        {/* Breadcrumb */}
        <div style={{ marginBottom: '2rem', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href={`/${locale}/ariza-cozumleri`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Markalar
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <Link href={`/${locale}/ariza-cozumleri/${marka}`} style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>
            {brandData.name || marka}
          </Link>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-light)' }}>
          {brandData.name || marka} {modelData.name || model} <span style={{ color: 'var(--accent-gold)' }}>Arızaları</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '800px', fontSize: '1.1rem' }}>
          Bu listede {brandData.name || marka} {modelData.name || model} model araçlarda servisimize en sık gelen arıza kodlarını ve bu arızalara uyguladığımız çözüm prosedürlerini bulabilirsiniz.
        </p>

        {faults.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0', background: 'rgba(15,23,42,0.4)', borderRadius: '16px' }}>
            Bu model için henüz kayıtlı bir arıza çözümü bulunmuyor.
          </div>
        ) : (
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {faults.map((fault) => (
              <Link 
                key={fault.id} 
                href={`/${locale}/ariza-cozumleri/${marka}/${model}/${fault.id}`}
                className="glass-panel hover-gold-border"
                style={{ 
                  display: 'flex', flexDirection: 'column', padding: '1.5rem', 
                  textDecoration: 'none', transition: 'all 0.3s', borderRadius: '16px',
                  background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '4px 10px', 
                    background: 'rgba(212, 175, 55, 0.1)', 
                    fontSize: '0.75rem', 
                    fontWeight: '700', 
                    color: 'var(--accent-gold)', 
                    borderRadius: '12px',
                    textTransform: 'uppercase'
                  }}>
                    {fault.brand || marka} {fault.model || model}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                  {fault.title}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

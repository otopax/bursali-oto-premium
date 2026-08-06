import { container } from '@/application/di/container';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return [];
}

import { buildSEOContract } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale, marka, model } = await params;
  try {
    const hierarchy = await container.hierarchyBuilder.build(locale, 'faults');
    const brandData = hierarchy[marka] || { name: marka };
    const modelData = brandData.models?.[model] || { name: model };
    const bName = brandData.name || marka.toUpperCase();
    const mName = modelData.name || model.toUpperCase();

    const titles = {
      tr: `${bName} ${mName} Arıza Kodu Çözümleri Kütüphanesi | Bursalı Oto Servis`,
      en: `${bName} ${mName} Fault Solutions Library | Bursali Auto Repair Fethiye`,
      ru: `${bName} ${mName} Библиотека Решения Ошибок | Bursali Auto Repair Fethiye`,
      uk: `${bName} ${mName} Бібліотека Рішення Помилок | Bursali Auto Repair Fethiye`,
      ar: `${bName} ${mName} مكتبة حلول الأعطال | Bursali Auto Repair Fethiye`,
    };

    const descriptions = {
      tr: `${bName} ${mName} kronik arıza kodları, belirtileri ve garantili tamir çözümleri. Fethiye özel oto servis.`,
      en: `${bName} ${mName} chronic fault codes, symptoms and guaranteed repair solutions at Bursali Auto Repair Fethiye.`,
      ru: `Коды ошибок и решение неисправностей ${bName} ${mName} в автосервисе Bursali Fethiye.`,
      uk: `Коди помилок та рішення несправностей ${bName} ${mName} в автосервісі Bursali Fethiye.`,
      ar: `رموز الأعطال وحلول الصيانة لسيارات ${bName} ${mName} في ورشة بورصالي فتحية.`,
    };

    return {
      title: titles[locale] || titles.tr,
      description: descriptions[locale] || descriptions.tr,
      ...buildSEOContract({ locale, path: `/kutuphane/${marka}/${model}/arizalar`, title: titles[locale] || titles.tr, description: descriptions[locale] || descriptions.tr })
    };
  } catch (e) {
    return {
      title: 'Arıza Çözümleri Kütüphanesi | Bursalı Oto Servis',
      ...buildSEOContract({ locale, path: `/kutuphane/${marka}/${model}/arizalar`, title: titles[locale] || titles.tr, description: descriptions[locale] || descriptions.tr })
    };
  }
}

export default async function KutuphaneFaultsListPage({ params }) {
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
          <Link href={`/${locale}/kutuphane/${marka}/${model}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            {modelData.name || model}
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--accent-gold)' }}>Arıza Çözümleri</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-light)' }}>
          {brandData.name || marka} {modelData.name || model} <span style={{ color: 'var(--accent-gold)' }}>Arıza Çözümleri</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '800px', fontSize: '1.1rem' }}>
          {brandData.name || marka} {modelData.name || model} model araçlarda servisimize en sık gelen arıza kodlarını (DTC), belirtilerini ve uyguladığımız garantili tamir prosedürlerini inceleyin.
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
                href={`/${locale}/kutuphane/${marka}/${model}/arizalar/${fault.id}`}
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

import { container } from '@/application/di/container';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { buildSEOContract } from '@/lib/seo/canonical';

export const dynamic = 'force-dynamic';
export const revalidate = 86400;

export async function generateMetadata({ params }) {
  const { locale, marka, model } = await params;
  try {
    const hierarchy = await container.graphProvider.buildTree();
    const brandData = hierarchy[marka] || { name: marka };
    const modelData = brandData.models?.[model] || { name: model };
    const bName = brandData.name || marka.toUpperCase();
    const mName = modelData.name || model.toUpperCase();

    const title = `${bName} ${mName} Araç Kataloğu ve Teknik Özellikler | Bursalı Oto Servis`;
    const description = `${bName} ${mName} modeline ait motor seçenekleri, donanım paketleri ve teknik servis bilgileri. Fethiye özel oto servis.`;

    return {
      title,
      description,
      ...buildSEOContract({ locale, path: `/ariza-cozumleri/${marka}/${model}`, title, description })
    };
  } catch (e) {
    return {
      title: 'Araç Kataloğu | Bursalı Oto Servis',
      ...buildSEOContract({ locale, path: `/ariza-cozumleri/${marka}/${model}`, title: 'Araç Kataloğu', description: 'Bursalı Oto Araç Kataloğu' })
    };
  }
}

export default async function ArizaCozumleriModelPage({ params }) {
  const { locale, marka, model } = await params;
  setRequestLocale(locale);

  let brandData = { name: marka, models: {} };
  let modelData = null;
  let engines = [];

  try {
    const hierarchy = await container.graphProvider.buildTree();
    if (hierarchy[marka]) {
      brandData = hierarchy[marka];
      if (brandData.models?.[model]) {
        modelData = brandData.models[model];
        engines = await container.graphProvider.getVehicleEngines(modelData.id);
      }
    }
  } catch (e) {
    console.error(e);
  }

  if (!modelData) {
    return <div style={{ minHeight: '100vh', paddingTop: '100px', textAlign: 'center', color: '#fff' }}><h1>Araç Bulunamadı</h1></div>;
  }

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: '#09090b' }}>
      <div className="container" style={{ margin: '0 auto', padding: '0 2rem', maxWidth: '1200px' }}>
        
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '2rem', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href={`/${locale}/ariza-cozumleri`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Katalog
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <Link href={`/${locale}/ariza-cozumleri/${marka}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            {brandData.name}
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--accent-gold)' }}>{modelData.name}</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-light)' }}>
          {brandData.name} {modelData.name} <span style={{ color: 'var(--accent-gold)' }}>Araç Kataloğu</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '800px', fontSize: '1.1rem' }}>
          Bu sayfada {brandData.name} {modelData.name} aracına ait teknik özellikleri ve motor seçeneklerini inceleyebilirsiniz.
        </p>

        {/* Araç Özellikleri Kartı */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem', fontWeight: '600' }}>Genel Bilgiler</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', color: 'var(--text-muted)' }}>
            <div><strong>Üretim Yılı:</strong> {modelData.yearStart || '-'} - {modelData.yearEnd || 'Devam Ediyor'}</div>
            <div><strong>Jenerasyon:</strong> {modelData.generation || '-'}</div>
          </div>
        </div>

        {/* Motorlar ve Varyantlar Tablosu */}
        <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem', fontWeight: '600' }}>Motor Seçenekleri ({engines.length})</h2>
        
        {engines.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Bu araca ait henüz detaylı motor verisi bulunmuyor.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {engines.map(engine => (
              <div key={engine.id} style={{
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
              }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
                  Motor Kodu: {engine.engineCode}
                </h3>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-muted)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem' }}>Varyant Adı</th>
                      <th style={{ padding: '0.5rem' }}>Güç (HP/kW)</th>
                      <th style={{ padding: '0.5rem' }}>Yakıt Tipi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engine.variants.map(variant => (
                      <tr key={variant.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.5rem' }}>{variant.designation || '-'}</td>
                        <td style={{ padding: '0.5rem' }}>{variant.power || '-'}</td>
                        <td style={{ padding: '0.5rem' }}>{variant.fuelType || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

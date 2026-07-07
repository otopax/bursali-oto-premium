import React from 'react';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import InteractiveFusebox from '@/components/InteractiveFusebox';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { make, model, year } = resolvedParams;
  return {
    title: `${year} ${make.toUpperCase()} ${model.toUpperCase()} Sigorta Kutusu Diyagramı`,
    description: `${year} ${make} ${model} aracı için sigorta kutusu diyagramı, Türkçe açıklamaları, amper değerleri ve interaktif şeması.`,
  };
}

export default async function FuseboxPage({ params }) {
  const resolvedParams = await params;
  const { make, model, year } = resolvedParams;
  
  // JSON dosyasının yolunu belirle
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'fuseboxes', make, model, `${year}.json`);
  
  let fuseboxes = [];
  try {
    if (fs.existsSync(jsonPath)) {
      const fileContent = fs.readFileSync(jsonPath, 'utf8');
      fuseboxes = JSON.parse(fileContent);
    } else {
      return notFound();
    }
  } catch (error) {
    console.error("Sigorta kutusu verisi okunamadı:", error);
    return notFound();
  }

  return (
    <main className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #ffffff, var(--accent-gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {year} {make.toUpperCase()} {model.toUpperCase()}
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>
            Sigorta Kutusu ve Röle Diyagramları
          </p>
          <div style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--glass-border)', color: 'var(--accent-gold)', padding: '0.75rem 1.5rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '500' }}>
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Resmin üzerindeki sigortalara tıklayarak veya fare ile üzerine gelerek detaylarını görebilirsiniz.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
          {fuseboxes.map((boxData, index) => (
            <InteractiveFusebox key={index} boxData={boxData} />
          ))}
        </div>
      </div>
    </main>
  );
}

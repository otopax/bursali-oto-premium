import { container } from '@/application/di/container';
import Link from 'next/link';
import { arizaUrl } from '@/lib/urls';

import { buildSEOContract } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { engineCode, locale } = await params;
  const engineName = engineCode.toUpperCase();

  const titles = {
    tr: `${engineName} Motor Kronik Arıza Çözümleri | Bursalı Oto Servis`,
    en: `${engineName} Engine Common Fault Solutions & Repair | Bursali Auto Repair`,
    ru: `${engineName} Двигатель Диагностика и Ремонт | Bursali Auto Repair`,
    uk: `${engineName} Двигун Діагностика та Ремонт | Bursali Auto Repair`,
    ar: `${engineName} تشخيص أعطال المحرك وإصلاحها | Bursali Auto Repair`,
  };

  const descriptions = {
    tr: `${engineName} motor kodlu premium araçlarda en sık görülen kronik arızalar, kök nedenleri ve garantili tamir çözümleri.`,
    en: `${engineName} engine code common faults, root causes and guaranteed repair solutions at Bursali Auto Repair Fethiye.`,
    ru: `Частые неисправности двигателя ${engineName} и гарантированный ремонт в автосервисе Bursali Fethiye.`,
    uk: `Найпоширеніші несправності двигуна ${engineName} та гарантований ремонт в автосервісі Bursali Fethiye.`,
    ar: `أكثر أعطال محركات ${engineName} شيوعاً وأسبابها وحلول الإصلاح المضمونة في ورشة بورصالي فتحية.`,
  };

  return {
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
    ...buildSEOContract({ locale, path: `/motor/${engineCode}`, title: titles[locale] || titles.tr, description: descriptions[locale] || descriptions.tr })
  };
}

export default async function EngineHubPage({ params }) {
  const { locale, engineCode } = await params;
  const allFaults = await container.getSortedPostsUseCase.execute(locale, 'faults');
  
  // Filter by engineCode (if it matches any models or title strings loosely)
  // Usually, engine codes are in the "model" or title of the fault
  const engineFaults = allFaults.filter(fault => {
    const searchString = `${fault.title} ${fault.model} ${fault.contentHtml || ''}`.toLowerCase();
    return searchString.includes(engineCode.toLowerCase());
  });

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: '#09090b' }}>
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-4 text-center text-white capitalize">{engineCode.replace('-', ' ').toUpperCase()} Motor Arıza Çözümleri Merkezi</h1>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          {engineCode.toUpperCase()} motor yapısına sahip araçların kronik arızalarını, kök nedenlerini ve kalıcı çözümlerini inceleyin.
        </p>

        {engineFaults.length === 0 ? (
          <p className="text-center text-gray-500">Bu motora ait arıza çözümü bulunamadı.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {engineFaults.map((fault) => (
              <Link 
                key={fault.id} 
                href={arizaUrl(locale, fault)}
                className="group block p-6 bg-[#1a1a1a] rounded-2xl border border-[rgba(255,255,255,0.05)] hover:border-[var(--accent-gold)] transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-white/5 text-xs font-semibold text-[var(--accent-gold)] rounded-full mb-4">
                    {fault.brand}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--accent-gold)] transition-colors">
                    {fault.title}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">
                    Modeller: {fault.model}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

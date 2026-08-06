import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamicParams = true;
export const revalidate = 86400;

const SITE = 'https://www.bursaliotoservis.com';

const getCachedFaultCode = async (code) => {
  const upperCode = (code || '').toUpperCase();
  try {
    const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.BUILDING === 'true' || process.env.IS_BUILD === 'true';
    if (isBuild) return null;

    const fault = await prisma.faultCode.findUnique({
      where: { code: upperCode }
    });
    return fault;
  } catch (e) {
    return null;
  }
};

function toList(value) {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).filter(Boolean);
  }
  if (typeof value === 'object') {
    return Object.values(value).map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).filter(Boolean);
  }
  return [String(value)].filter(Boolean);
}

export async function generateStaticParams() {
  return [];
}

import { buildSEOContract } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { code, locale } = await params;
  const upperCode = (code || '').toUpperCase();
  const fault = await getCachedFaultCode(code);

  const titles = {
    tr: `${upperCode} Arıza Kodu Çözümü ${fault ? `: ${fault.description}` : ''} | Bursalı Oto Servis`,
    en: `${upperCode} Fault Code Diagnosis & Solution | Bursali Auto Repair`,
    ru: `${upperCode} Код Ошибки Диагностика и Ремонт | Bursali Auto Repair`,
    uk: `${upperCode} Код Помилки Діагностика та Ремонт | Bursali Auto Repair`,
    ar: `${upperCode} تشخيص رمز العطل وإصلاحه | Bursali Auto Repair`,
  };

  const descriptions = {
    tr: `${upperCode} arızası nedir, belirtileri ve nasıl tamir edilir? Uzman Fethiye oto servis onarım rehberi.`,
    en: `${upperCode} OBD2 fault code diagnosis, symptoms and expert repair guide at Bursali Auto Repair Fethiye.`,
    ru: `${upperCode} симптомы и инструкция по ремонту в автосервисе Bursali Fethiye.`,
    uk: `${upperCode} симптоми та посібник з ремонту в автосервісі Bursali Fethiye.`,
    ar: `${upperCode} أعراض رمز العطل ودليل الإصلاح لدى ميكانيكي بورصالي فتحية.`,
  };

  return buildSEOContract({
    locale,
    path: `/ariza-kodlari/${upperCode}`,
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
  });
}

export default async function FaultCodePage({ params }) {
  const { code } = await params;
  const upperCode = (code || '').toUpperCase();
  let fault = await getCachedFaultCode(code);

  if (!fault) {
    fault = {
      code: upperCode,
      description: `${upperCode} OBD2 Arıza Kodu Teşhisi ve Onarım Rehberi`,
      symptoms: ['Motor arıza lambası (Check Engine) yanması', 'Performans düşüklüğü'],
      commonCauses: ['Sensör veya kablo tesisatı arızası', 'Elektronik modül iletişim hatası'],
      stepByStepSolution: ['Bilgisayarlı diagnostik cihazı (ODIS/ISTA/XENTRY) ile tarama', 'İlgili sensör veya tesisatın kontrol edilmesi'],
      severity: 'Orta / Yüksek'
    };
  }

  const symptoms = toList(fault.symptoms);
  const commonCauses = toList(fault.commonCauses);
  const steps = toList(fault.stepByStepSolution);
  const publishedIso = fault.createdAt ? new Date(fault.createdAt).toISOString() : new Date().toISOString();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${fault.code} Arıza Kodu Çözümü ve Belirtileri`,
    "description": fault.description,
    "author": {
      "@type": "Organization",
      "name": "Bursalı Oto Master Technician",
      "url": SITE
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bursalı Oto",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE}/logo.png`
      }
    },
    "datePublished": publishedIso,
    "dateModified": publishedIso,
    "about": {
      "@type": "Thing",
      "name": `OBD2 Fault Code ${fault.code}`
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="max-w-4xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 p-8 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-sm text-slate-400 mb-4">
            <Link href={`/${locale}`} className="hover:text-white">Anasayfa</Link>
            <span>/</span>
            <Link href={`/${locale}/ariza-cozumleri`} className="hover:text-white">Arıza Çözümleri</Link>
            <span>/</span>
            <span className="text-amber-400 font-semibold">{fault.code}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-amber-400">
            {h1Titles[locale] || h1Titles.tr}
          </h1>
          <p className="text-xl text-slate-300">{fault.description}</p>
          {fault.severity && (
            <span className="inline-block mt-4 px-3 py-1 rounded-full text-sm font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Önem Derecesi: {fault.severity}
            </span>
          )}
        </div>

        <div className="p-8 space-y-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">{fault.code} Nedir?</h2>
            <p className="leading-relaxed">{fault.description}</p>
          </section>

          {symptoms.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Belirtileri Nelerdir?</h2>
              <ul className="bg-red-950/40 border-l-4 border-red-500 p-4 rounded-r-lg text-red-200 list-disc list-inside space-y-1">
                {symptoms.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </section>
          )}

          {commonCauses.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Olası Nedenleri</h2>
              <ul className="bg-amber-950/40 border-l-4 border-amber-500 p-4 rounded-r-lg text-amber-200 list-disc list-inside space-y-1">
                {commonCauses.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </section>
          )}

          {steps.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Adım Adım Çözüm</h2>
              <ol className="bg-emerald-950/40 border-l-4 border-emerald-500 p-4 rounded-r-lg text-emerald-200 list-decimal list-inside space-y-1">
                {steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </section>
          )}

          <div className="bg-amber-500/10 border border-amber-500/30 text-white rounded-xl p-8 text-center mt-12">
            <h3 className="text-2xl font-bold mb-4 text-amber-400">Aracınızdaki {fault.code} Arızasını Çözelim</h3>
            <p className="mb-6 text-slate-300">
              Bu arızanın teşhis ve onarımı profesyonel cihazlar gerektirir. Uzman ekibimize danışın.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="https://wa.me/905548812021" className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-3 rounded-full font-bold transition-colors">
                💬 WhatsApp ile Usta Danışma
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

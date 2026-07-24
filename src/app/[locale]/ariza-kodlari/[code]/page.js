import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 86400; // Her gün revalidate (ISR)

const SITE = 'https://www.bursaliotoservis.com';

// Json/array/string alanlarını güvenli şekilde string listesine çevirir
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

// Statik parametreler (build time'da üretilir; DB erişilemezse boş → on-demand ISR)
export async function generateStaticParams() {
  try {
    const codes = await prisma.faultCode.findMany({
      select: { code: true },
      take: 100 // Test için ilk 100. Gerçek P-SEO'da artırılır.
    });
    return codes.map((c) => ({ code: c.code }));
  } catch (error) {
    console.error('P-SEO Error fetching fault codes:', error);
    return [];
  }
}

// Dinamik Meta Data (Title, Description) - CTR Optimizasyonu
export async function generateMetadata({ params }) {
  const { code } = params;

  const fault = await prisma.faultCode.findUnique({
    where: { code: code.toUpperCase() }
  });

  if (!fault) return { title: 'Arıza Kodu Bulunamadı | Bursalı Oto' };

  return {
    title: `${fault.code} Arıza Kodu Çözümü: ${fault.description} | Bursalı Oto`,
    description: `${fault.code} arızası nedir, belirtileri ve nasıl tamir edilir? ${fault.description} — uzman onarım rehberi ve maliyet bilgisi.`,
    alternates: {
      canonical: `${SITE}/tr/ariza-kodlari/${fault.code}`
    }
  };
}

export default async function FaultCodePage({ params }) {
  const { code } = params;

  const fault = await prisma.faultCode.findUnique({
    where: { code: code.toUpperCase() }
  });

  if (!fault) {
    notFound();
  }

  const symptoms = toList(fault.symptoms);
  const commonCauses = toList(fault.commonCauses);
  const steps = toList(fault.stepByStepSolution);
  const publishedIso = fault.createdAt ? new Date(fault.createdAt).toISOString() : new Date().toISOString();

  // JSON-LD Schema (E-E-A-T Sinyalleri)
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
        "url": `${SITE}/images/logo.png`
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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 text-white p-8">
          <div className="flex items-center space-x-2 text-sm text-slate-300 mb-4">
            <Link href="/" className="hover:text-white">Anasayfa</Link>
            <span>/</span>
            <Link href="/ariza-kodlari" className="hover:text-white">Arıza Kodları</Link>
            <span>/</span>
            <span className="text-blue-400 font-semibold">{fault.code}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            {fault.code} Arıza Kodu Çözümü
          </h1>
          <p className="text-xl text-slate-300">{fault.description}</p>
          {fault.severity && (
            <span className="inline-block mt-4 px-3 py-1 rounded-full text-sm font-semibold bg-slate-700 text-slate-100">
              Önem Derecesi: {fault.severity}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-8 prose prose-lg max-w-none text-slate-700">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{fault.code} Nedir?</h2>
            <p className="leading-relaxed">{fault.description}</p>
          </section>

          {symptoms.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Belirtileri Nelerdir?</h2>
              <ul className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-red-800 list-disc list-inside space-y-1">
                {symptoms.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </section>
          )}

          {commonCauses.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Olası Nedenleri</h2>
              <ul className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg text-yellow-800 list-disc list-inside space-y-1">
                {commonCauses.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </section>
          )}

          {steps.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Adım Adım Çözüm</h2>
              <ol className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg text-green-900 list-decimal list-inside space-y-1">
                {steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </section>
          )}

          {fault.estimatedCostInfo && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Tahmini Onarım Maliyeti</h2>
              <p className="bg-slate-100 p-4 rounded-lg">{fault.estimatedCostInfo}</p>
            </section>
          )}

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Uzman Notu (E-E-A-T)</h2>
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  U
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-slate-800">Master Technician</h3>
                  <p className="text-sm text-slate-500">20+ Yıl Deneyim | Bursalı Oto</p>
                </div>
              </div>
              <p className="italic text-slate-700">
                "{fault.code} arızası genellikle sensör ömrünün dolmasından veya kablo tesisatındaki oksitlenmeden kaynaklanır.
                Sadece parçayı değiştirmek yeterli olmayabilir, adaptasyon işlemi yapılması şarttır."
              </p>
            </div>
          </section>

          {/* Call to Action */}
          <div className="bg-slate-800 text-white rounded-xl p-8 text-center mt-12">
            <h3 className="text-2xl font-bold mb-4">Aracınızdaki {fault.code} Arızasını Çözelim</h3>
            <p className="mb-6 text-slate-300">
              Bu arızanın teşhis ve onarımı profesyonel cihazlar gerektirir. Yapay Zeka destekli Sanal Ustamıza danışın veya hemen yerel servisimizden randevu alın.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/sanal-usta" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-200 shadow-lg">
                🤖 Sanal Ustaya Sor
              </Link>
              <Link href="/randevu" className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-3 rounded-full font-semibold transition-colors duration-200 shadow-lg">
                📅 Randevu Al
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

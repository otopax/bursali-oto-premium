import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 86400; // Her gün revalidate (ISR)

// Statik parametreler (Build time'da üretilecek)
export async function generateStaticParams() {
  try {
    const codes = await prisma.faultCode.findMany({
      select: { code: true },
      take: 100 // Test için ilk 100 kod. Gerçek P-SEO'da 30.000+
    });
    return codes.map((c) => ({
      code: c.code,
    }));
  } catch (error) {
    console.error('P-SEO Error fetching fault codes:', error);
    return [];
  }
}

// Dinamik Meta Data (Title, Description) - CTR Optimizasyonu
export async function generateMetadata({ params }) {
  const { code } = params;
  
  const fault = await prisma.faultCode.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      manufacturer: true
    }
  });

  if (!fault) return { title: 'Arıza Kodu Bulunamadı' };

  const brand = fault.manufacturer?.name || 'Tüm Araçlar';
  
  return {
    title: `${fault.code} Arıza Kodu Çözümü | ${brand} ${fault.title} | Bursalı Oto`,
    description: `${fault.code} arızası nedir, belirtileri nelerdir ve nasıl tamir edilir? ${brand} araçlarda ${fault.code} kodunun uzman onarım rehberi.`,
    alternates: {
      canonical: `https://www.bursaliotoservis.com/tr/ariza-kodlari/${fault.code}`
    }
  };
}

export default async function FaultCodePage({ params }) {
  const { code } = params;

  // DB'den oku
  const fault = await prisma.faultCode.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      manufacturer: true
    }
  });

  if (!fault) {
    notFound();
  }

  const brand = fault.manufacturer?.name || 'Araç';

  // JSON-LD Schema (E-E-A-T Sinyalleri)
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${fault.code} Arıza Kodu Çözümü ve Belirtileri`,
    "description": fault.description,
    "author": {
      "@type": "Organization",
      "name": "Bursalı Oto Master Technician",
      "url": "https://www.bursalioto.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Bursalı Oto",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.bursalioto.com/images/logo.png"
      }
    },
    "datePublished": fault.createdAt.toISOString(),
    "dateModified": fault.updatedAt.toISOString(),
    "about": {
      "@type": "Thing",
      "name": `OBD2 Fault Code ${fault.code}`
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Schema Enjeksiyonu */}
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
          <p className="text-xl text-slate-300">
            {brand} - {fault.title}
          </p>
        </div>

        {/* Content */}
        <div className="p-8 prose prose-lg max-w-none text-slate-700">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{fault.code} Nedir?</h2>
            <p className="leading-relaxed">{fault.description}</p>
          </section>

          {fault.symptoms && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Belirtileri Nelerdir?</h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-red-800">{fault.symptoms}</p>
              </div>
            </section>
          )}

          {fault.causes && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Olası Nedenleri</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <p className="text-yellow-800">{fault.causes}</p>
              </div>
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
            <h3 className="text-2xl font-bold mb-4">{brand} Aracınızdaki {fault.code} Arızasını Çözelim</h3>
            <p className="mb-6 text-slate-300">
              Bu arızanın teşhis ve onarımı profesyonel cihazlar gerektirir. Yapay Zeka destekli Sanal Ustamıza danışın veya hemen yerel servisimizden randevu alın.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/ai-assistant" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-200 shadow-lg">
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

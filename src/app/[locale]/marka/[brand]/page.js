import { getSortedPostsData } from '@/lib/blog';
import Link from 'next/link';

import { buildCanonical } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { brand, locale } = await params;
  const brandName = brand.toUpperCase();
  return {
    title: `${brandName} Arıza Çözümleri | Bursalı Oto`,
    description: `${brandName} marka premium araçlarda sık görülen arızalar ve uzman çözümleri.`,
    alternates: buildCanonical(locale, `marka/${brand}`)
  };
}

export default async function BrandHubPage({ params }) {
  const { locale, brand } = await params;
  const allFaults = getSortedPostsData(locale, 'faults');
  
  // Filter by brand (slugified)
  const brandFaults = allFaults.filter(fault => {
    const fBrandSlug = (fault.brand || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return fBrandSlug === brand;
  });

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', background: '#09090b' }}>
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-4 text-center text-white capitalize">{brand.replace('-', ' ')} Arıza Çözümleri Merkezi</h1>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          {brand.replace('-', ' ').toUpperCase()} marka araçların en sık karşılaşılan kronik arızalarını, kök nedenlerini ve servisimizde uyguladığımız kalıcı çözümleri inceleyin.
        </p>

        {brandFaults.length === 0 ? (
          <p className="text-center text-gray-500">Bu markaya ait arıza çözümü bulunamadı.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandFaults.map((fault) => (
              <Link 
                key={fault.id} 
                href={`/${locale}/ariza-cozumleri/${fault.id}`}
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

import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { buildSEOContract } from '@/lib/seo/canonical';
import { getBrands } from '@/lib/vehicleTree';
import { getAllArticles } from '@/lib/mdxUtils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: 'Kütüphane & Araç Kataloğu | Bursalı Oto Servis',
    description: 'Arıza çözümleri, kronik sorunlar ve tüm araç marka, model ve motor seçeneklerini içeren kapsamlı otomotiv bilgi kütüphanemiz.',
    ...buildSEOContract({ locale, path: '/kutuphane', title: 'Kütüphane', description: 'Araç Kataloğu ve Onarım Makaleleri' })
  };
}

const PRIORITY_BRANDS = [
  'bmw', 'mercedes-benz', 'audi', 'porsche', 'volkswagen', 'volvo', 'land-rover', 'mini'
];

export default async function KutuphanePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  let brands = await getBrands();

  brands.sort((a, b) => {
    const idxA = PRIORITY_BRANDS.indexOf(a.slug);
    const idxB = PRIORITY_BRANDS.indexOf(b.slug);
    
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.name.localeCompare(b.name, 'tr');
  });

  const allArticles = getAllArticles(locale);

  return (
    <main className="min-h-screen pt-[120px] pb-24 bg-gradient-to-b from-dark-900 to-black">
      <div className="container-custom">
        {/* Header Section */}
        <div className="mb-12 border-l-4 border-accent-gold pl-6 py-2 bg-white/5 rounded-r-2xl max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Otomotiv Bilgi <span className="text-accent-gold">Kütüphanesi</span>
          </h1>
          <p className="text-lg text-gray-400">
            Tüm marka ve modeller için detaylı motor seçenekleri, kronik sorunlar, kasa kodları ve uzman onarım rehberleri.
          </p>
        </div>

        {/* Brands Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">
            Araç Kataloğu
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.map((brand) => (
              <Link 
                key={brand.slug}
                href={`/${locale}/kutuphane/${brand.slug}`}
                className="group relative flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-accent-gold/50 transition-all duration-300 overflow-hidden"
              >
                {/* Brand Logo - Using clearbit as a reliable source for brand logos based on domain */}
                <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white rounded-full p-2 group-hover:scale-110 transition-transform duration-500 shadow-lg relative">
                  <Image 
                    src={`https://logo.clearbit.com/${brand.slug.replace('-benz', '')}.com`}
                    alt={`${brand.name} Logosu`}
                    width={48}
                    height={48}
                    className="object-contain w-full h-full z-10"
                    unoptimized
                  />
                  {/* Fallback avatar if Image fails or takes time */}
                  <div className="absolute inset-0 flex items-center justify-center bg-dark-800 text-accent-gold font-bold text-xl rounded-full uppercase opacity-0 group-hover:opacity-10 transition-opacity">
                    {brand.name.substring(0, 2)}
                  </div>
                </div>
                <h3 className="text-white font-medium text-center z-10">{brand.name}</h3>
                
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-accent-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Articles Section */}
        <section>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8 pb-4 border-b border-white/10 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-accent-gold rounded-full inline-block"></span>
            Son Eklenen Çözüm Rehberleri
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allArticles.slice(0, 9).map((article) => (
              <Link
                href={`/${locale}/kutuphane/makale/${article.slug}`}
                key={article.slug}
                className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-accent-gold/30 transition-all duration-300 h-full"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-accent-gold/10 text-accent-gold text-xs font-semibold rounded-full border border-accent-gold/20">
                      {article.frontmatter.brand || 'Genel'}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(article.frontmatter.date).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-accent-gold transition-colors line-clamp-2">
                    {article.frontmatter.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                    {article.frontmatter.description || article.frontmatter.excerpt}
                  </p>
                  
                  <div className="flex items-center text-accent-gold text-sm font-medium group-hover:gap-2 transition-all mt-auto">
                    Makaleyi Oku <span className="text-lg">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {allArticles.length === 0 && (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-gray-400">Henüz makale bulunmuyor. Yakında yeni içerikler eklenecektir.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

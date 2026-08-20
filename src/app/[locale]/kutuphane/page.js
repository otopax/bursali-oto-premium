import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
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

export default async function KutuphanePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Library');

  const brands = await getBrands();
  const allArticles = getAllArticles();

  return (
    <main className="min-h-screen pt-[120px] pb-24 bg-gradient-to-b from-dark-900 to-black">
      <div className="container-custom">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Otomotiv Bilgi <span className="text-accent-gold">Kütüphanesi</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Marka, model ve motor detaylarına göre arıza çözümleri, bakım rehberleri ve araç teknik verileri.
          </p>
        </div>

        {/* Brands Section */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8 pb-4 border-b border-white/10 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-accent-gold rounded-full inline-block"></span>
            Araç Kataloğu
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.map((brand) => (
              <Link 
                href={`/${locale}/kutuphane/${brand.slug}`}
                key={brand.slug}
                className="group p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-accent-gold/10 hover:border-accent-gold/30 transition-all duration-300 flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 relative flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                  <span className="text-2xl font-bold text-gray-400 group-hover:text-accent-gold">
                    {brand.name.charAt(0)}
                  </span>
                </div>
                <span className="text-gray-300 font-medium text-center truncate w-full">
                  {brand.name}
                </span>
                {brand.modelCount > 0 && (
                  <span className="text-xs text-gray-500">
                    {brand.modelCount} Model
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Articles Section */}
        <div>
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
        </div>
      </div>
    </main>
  );
}

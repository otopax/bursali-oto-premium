import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildSEOContract } from '@/lib/seo/canonical';
import { getBrandTree, getModels } from '@/lib/vehicleTree';
import { getArticlesByBrand } from '@/lib/mdxUtils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale, marka } = await params;
  const brandTree = await getBrandTree(marka);
  
  if (!brandTree) {
    return { title: 'Bulunamadı | Bursalı Oto Servis' };
  }
  
  const brandName = brandTree.make;
  
  return {
    title: `${brandName} Arıza Çözümleri & Araç Kataloğu | Bursalı Oto Servis`,
    description: `${brandName} marka araçlar için kronik sorunlar, arıza kodları ve model-motor bazlı teknik bilgiler kütüphanesi.`,
    ...buildSEOContract({ locale, path: `/kutuphane/${marka}`, title: `${brandName} Kütüphanesi`, description: `${brandName} Kataloğu` })
  };
}

export default async function BrandLibraryPage({ params }) {
  const { locale, marka } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Library');

  const brandTree = await getBrandTree(marka);
  if (!brandTree) {
    notFound();
  }

  const brandName = brandTree.make;
  const models = await getModels(marka);
  const articles = getArticlesByBrand(marka);

  return (
    <main className="min-h-screen pt-[120px] pb-24 bg-gradient-to-b from-dark-900 to-black">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href={`/${locale}/kutuphane`} className="hover:text-accent-gold transition-colors">Kütüphane</Link>
          <span>/</span>
          <span className="text-white font-medium">{brandName}</span>
        </div>

        {/* Header Section */}
        <div className="mb-16 border-l-4 border-accent-gold pl-6 py-2 bg-white/5 rounded-r-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {brandName} <span className="text-accent-gold">Kataloğu</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl">
            {brandName} marka araçların model serileri, motor seçenekleri ve markaya özel arıza çözüm rehberleri.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Models */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-white mb-8 pb-4 border-b border-white/10 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-accent-gold rounded-full inline-block"></span>
              Modeller
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {models.map((model) => (
                <Link
                  href={`/${locale}/kutuphane/${marka}/${encodeURIComponent(model.name.toLowerCase().replace(/\s+/g, '-'))}`}
                  key={model.modelGroupId}
                  className="group flex flex-col p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-accent-gold/10 hover:border-accent-gold/30 transition-all duration-300"
                >
                  <span className="text-lg font-semibold text-white group-hover:text-accent-gold transition-colors mb-1">
                    {model.name}
                  </span>
                  <div className="flex justify-between items-center text-sm text-gray-400 mt-2">
                    <span>{model.generationCount} Kasa/Nesil</span>
                    <span className="text-accent-gold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Articles */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold text-white mb-8 pb-4 border-b border-white/10 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-accent-gold rounded-full inline-block"></span>
              Onarım Rehberleri
            </h2>
            
            <div className="flex flex-col gap-4">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <Link
                    href={`/${locale}/kutuphane/makale/${article.slug}`}
                    key={article.slug}
                    className="group p-4 bg-white/5 border border-white/10 rounded-xl hover:border-accent-gold/30 transition-all duration-300"
                  >
                    <h3 className="text-white font-medium group-hover:text-accent-gold transition-colors line-clamp-2 mb-2">
                      {article.frontmatter.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {article.frontmatter.description || article.frontmatter.excerpt}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                  <p className="text-gray-400 text-sm">
                    Bu markaya ait henüz arıza çözüm makalesi eklenmemiş. Modellerden teknik verilere ulaşabilirsiniz.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

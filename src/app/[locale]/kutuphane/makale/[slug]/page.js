import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleFromAnywhere } from '@/lib/mdxUtils';
import MDXRenderer from '@/components/MDXRenderer';
import { buildSEOContract } from '@/lib/seo/canonical';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const article = getArticleFromAnywhere(slug);
  
  if (!article) {
    return { title: 'Makale Bulunamadı | Bursalı Oto Servis' };
  }
  
  const { title, description, excerpt, brand } = article.frontmatter;
  
  return {
    title: `${title} | Bursalı Oto Servis`,
    description: description || excerpt || `${title} hakkında detaylı onarım rehberi.`,
    ...buildSEOContract({ locale, path: `/kutuphane/makale/${slug}`, title, description: description || excerpt })
  };
}

export default async function ArticlePage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = getArticleFromAnywhere(slug);
  
  if (!article) {
    notFound();
  }

  const { title, date, brand, model, riskLevel, estimatedTime, estimatedCost, potentialCauses } = article.frontmatter;

  return (
    <main className="min-h-screen pt-[120px] pb-24 bg-gradient-to-b from-dark-900 to-black">
      <div className="container-custom max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link href={`/${locale}/kutuphane`} className="hover:text-accent-gold transition-colors">Kütüphane</Link>
          <span>/</span>
          {brand && (
            <>
              <Link href={`/${locale}/kutuphane/${brand.toLowerCase()}`} className="hover:text-accent-gold transition-colors">
                {brand}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-white font-medium truncate">{title}</span>
        </div>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {brand && (
              <span className="px-4 py-1.5 bg-accent-gold/10 text-accent-gold text-sm font-semibold rounded-full border border-accent-gold/20">
                {brand}
              </span>
            )}
            {model && (
              <span className="px-4 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full border border-white/20">
                {model}
              </span>
            )}
            {date && (
              <span className="text-gray-500 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {new Date(date).toLocaleDateString('tr-TR')}
              </span>
            )}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-8">
            {title}
          </h1>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl">
            {riskLevel && (
              <div>
                <span className="block text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Risk Seviyesi</span>
                <span className={`font-medium ${riskLevel.toLowerCase().includes('yüksek') ? 'text-red-400' : riskLevel.toLowerCase().includes('orta') ? 'text-yellow-400' : 'text-green-400'}`}>
                  {riskLevel}
                </span>
              </div>
            )}
            {estimatedTime && (
              <div>
                <span className="block text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Onarım Süresi</span>
                <span className="text-white font-medium">{estimatedTime}</span>
              </div>
            )}
            {estimatedCost && (
              <div>
                <span className="block text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Tahmini Maliyet</span>
                <span className="text-white font-medium">{estimatedCost}</span>
              </div>
            )}
            {potentialCauses && (
              <div className="col-span-2 md:col-span-1">
                <span className="block text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Olası Sebepler</span>
                <span className="text-gray-300 text-sm line-clamp-2" title={potentialCauses}>{potentialCauses}</span>
              </div>
            )}
          </div>
        </header>

        {/* MDX Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl">
          <MDXRenderer content={article.content} />
        </div>

        {/* Footer Action */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-dark-800 to-dark-900 border border-white/10 rounded-2xl">
          <h3 className="text-2xl font-bold text-white mb-3">Aracınızda bu arızayı mı yaşıyorsunuz?</h3>
          <p className="text-gray-400 mb-6">Fethiye'deki uzman servisimizde orijinal cihazlarla kesin tespit yaptırın.</p>
          <Link href={`/${locale}/iletisim`} className="inline-block px-8 py-4 bg-accent-gold text-dark-900 font-bold rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            Hemen Randevu Alın
          </Link>
        </div>
      </div>
    </main>
  );
}

import { getArticleBySlug, getAllArticles } from '@/lib/articles';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Bulunamadı' };

  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function BlogPostPage({ params }) {
  const { locale, slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px' }}>
      <article className="container" style={{ paddingBottom: '5rem', maxWidth: '800px' }}>
        
        <Link href={`/${locale}/blog`} style={{ color: 'var(--accent-gold)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          ← Tüm Makaleler
        </Link>

        <div style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)', padding: '0.5rem 1rem', borderRadius: '50px', display: 'inline-block', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
          {article.category}
        </div>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', lineHeight: '1.3' }}>
          {article.title}
        </h1>

        <div 
          className="article-content"
          style={{ color: '#e2e8f0', lineHeight: '1.8', fontSize: '1.1rem' }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
        />

        <style dangerouslySetInnerHTML={{__html: `
          .article-content h2 {
            color: var(--accent-gold);
            margin-top: 3rem;
            margin-bottom: 1.5rem;
            font-size: 1.8rem;
          }
          .article-content h3 {
            color: white;
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-size: 1.4rem;
          }
          .article-content p {
            margin-bottom: 1.5rem;
          }
          .article-content ul {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
          }
          .article-content li {
            margin-bottom: 0.5rem;
          }
        `}} />

      </article>
    </main>
  );
}

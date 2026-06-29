import Link from 'next/link';
import { getAllArticles } from '@/lib/articles';

export const metadata = {
  title: 'Blog & Teknik Makaleler',
  description: 'Otomotiv sektörü hakkında derinlemesine analizler, teknik makaleler ve rehberler.',
};

export default async function BlogIndexPage({ params }) {
  const { locale } = await params;
  const articles = getAllArticles();

  return (
    <main style={{ minHeight: '100vh', paddingTop: '100px' }}>
      <section className="container" style={{ paddingBottom: '5rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>
          Teknik <span style={{ color: 'var(--accent-gold)' }}>Kütüphane & Blog</span>
        </h1>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '1.2rem', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem' }}>
          Uzman mühendislerimiz tarafından hazırlanan derinlemesine analizler, kronik sorunlar ve çözümleri.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {articles.map((article) => (
            <Link 
              href={`/${locale}/blog/${article.slug}`} 
              key={article.slug}
              style={{ textDecoration: 'none' }}
            >
              <div className="glass-panel" style={{ height: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', cursor: 'pointer' }}
                   onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                   onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)', padding: '0.5rem 1rem', borderRadius: '50px', display: 'inline-block', alignSelf: 'flex-start', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {article.category}
                </div>
                <h2 style={{ color: 'white', fontSize: '1.4rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                  {article.title}
                </h2>
                <p style={{ color: '#94a3b8', flex: 1, lineHeight: '1.6' }}>
                  {article.excerpt}
                </p>
                <div style={{ marginTop: '2rem', color: 'var(--accent-gold)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Yazıyı Oku →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

import { getAllPostIds, getPostData } from '@/lib/blog';
import { notFound } from 'next/navigation';
import Head from 'next/head';

// Dynamic params function for static generation if needed
export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map(p => ({ slug: p.params.slug }));
}

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const postData = await getPostData(slug);
  
  if (!postData) return { title: 'Not Found' };

  return {
    title: `${postData.title} | Bursalı Oto Servis`,
    description: postData.description,
    openGraph: {
      title: postData.title,
      description: postData.description,
      images: [postData.image || '/bg.png'],
    }
  };
}

export default async function BlogPost({ params }) {
  const { slug, locale } = await params;
  const postData = await getPostData(slug);

  if (!postData) {
    notFound();
  }

  // Article Schema for SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": postData.title,
    "image": [
      `${process.env.NEXT_PUBLIC_SITE_URL || (process.env.NEXT_PUBLIC_SITE_URL || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}`)}${postData.image || '/bg.png'}`
    ],
    "datePublished": postData.date,
    "author": [{
        "@type": "Organization",
        "name": "Bursalı Oto Servis",
        "url": (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com')
      }]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="container mx-auto px-4 py-16" style={{ minHeight: '80vh', marginTop: '100px', maxWidth: '800px' }}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--accent-gold)' }}>
          {postData.title}
        </h1>
        <div className="text-sm text-gray-400 mb-8">
          {postData.date}
        </div>
        
        {postData.image && (
          <img 
            src={postData.image} 
            alt={postData.title} 
            style={{ width: '100%', borderRadius: '12px', marginBottom: '2rem' }} 
          />
        )}

        <div 
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }} 
          style={{ 
            color: 'var(--text-light)', 
            lineHeight: '1.8',
            fontSize: '1.1rem'
          }}
        />

        <style dangerouslySetInnerHTML={{__html: `
          .blog-content h2 {
            color: var(--accent-gold);
            font-size: 2rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          .blog-content h3 {
            color: var(--accent-blue);
            font-size: 1.5rem;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
          }
          .blog-content p {
            margin-bottom: 1.25rem;
          }
          .blog-content strong {
            color: white;
          }
          .blog-content ul, .blog-content ol {
            margin-bottom: 1.25rem;
            padding-left: 2rem;
            list-style-type: disc;
          }
          .blog-content li {
            margin-bottom: 0.5rem;
          }
        `}} />
      </div>
    </>
  );
}

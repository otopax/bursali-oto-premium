import { container } from '@/application/di/container';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { buildCanonical } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const titles = {
    tr: 'Oto Servis Rehberi ve Uzmanlık Blogu | Bursalı Oto Servis',
    en: 'Auto Service Guide & Technical Blog | Bursali Auto Repair',
    ru: 'Автосервис Гид и Технический Блог | Bursali Auto Repair',
    uk: 'Автосервіс Гід та Технічний Блог | Bursali Auto Repair',
    ar: 'دليل خدمة السيارات والمدونة التقنية | Bursali Auto Repair',
  };

  const descriptions = {
    tr: 'Bursalı Oto Servis Fethiye premium araç bakım rehberleri, kronik arıza çözümleri ve uzman teknik makaleler.',
    en: 'Bursali Auto Repair Fethiye premium car maintenance guides, fault solutions and expert articles.',
    ru: 'Руководства по обслуживанию авто премиум-класса в Фетхие и технические статьи.',
    uk: 'Посібники з обслуговування авто преміум-класу у Фетхіє та технічні статті.',
    ar: 'أدلة صيانة السيارات الفاخرة في فتحية وحلول الأعطال ومقالات الخبراء.',
  };

  return {
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
    alternates: buildCanonical(locale, '/blog'),
  };
}

export default async function BlogIndex({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' }); // veya Global vs.
  const allPostsData = await container.getSortedPostsUseCase.execute(locale);

  return (
    <div className="container mx-auto px-4 py-16" style={{ minHeight: '80vh', marginTop: '100px' }}>
      <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: 'var(--accent-gold)' }}>
        {locale === 'tr' ? 'Oto Servis Rehberi' : 'Auto Service Guide'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allPostsData.map(({ id, date, title, description, image }) => (
          <Link href={`/${locale}/blog/${id}`} key={id} style={{ textDecoration: 'none' }}>
            <div 
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.3s ease, boxShadow 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              className="blog-card"
            >
              <img 
                src={image || '/bg.png'} 
                alt={title} 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
              />
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <small style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{date}</small>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-light)' }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', flex: 1 }}>{description}</p>
                <div style={{ marginTop: '1rem', color: 'var(--accent-blue)', fontWeight: 'bold' }}>
                  {locale === 'tr' ? 'Devamını Oku →' : 'Read More →'}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {allPostsData.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
            {locale === 'tr' ? 'Henüz makale bulunmuyor.' : 'No articles found yet.'}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .blog-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          border-color: var(--accent-gold);
        }
      `}} />
    </div>
  );
}

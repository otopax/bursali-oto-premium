import { getPostData, getAllPostIds, getSortedPostsData } from '@/lib/blog';
import { notFound } from 'next/navigation';
import ExpertCTA from '@/components/ExpertCTA';
import { getGBPData } from '@/lib/gbp';

function extractFirstSentence(text) {
  if (!text) return '';
  // Remove headings and markdown syntax (>, **, *)
  let cleanText = text.replace(/#+\s+.*/g, '').replace(/>/g, '').replace(/\*\*/g, '').replace(/\*/g, '').trim();
  // Don't split if the dot is preceded by a digit (like 2. vites)
  const match = cleanText.match(/(?<!\d)\.\s/);
  const firstDot = match ? match.index + 1 : -1;
  return firstDot !== -1 ? cleanText.substring(0, firstDot + 1).replace(/\n/g, ' ').trim() : cleanText.substring(0, 150) + '...';
}

import { buildCanonical } from '@/lib/seo/canonical';
import { setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { kod, locale } = await params;
  setRequestLocale(locale);
  const postData = await getPostData(kod, 'faults');
  
  if (!postData) {
    return { title: 'Sayfa Bulunamadı | Bursalı Oto' };
  }

  const description = postData.description || extractFirstSentence(postData.rawContent) || 'Bursalı Oto Servis kronik arıza çözümleri ve onarım rehberleri.';
  const shortDescription = description.length > 150 ? description.substring(0, 155) + '...' : description;
  // og:image guard: frontmatter'daki image alani bazen Google arama URL'si gibi
  // gecersiz degerler iceriyor. Yalnizca gercek gorsel uzantili URL'leri kabul et;
  // aksi halde varsayilan marka gorseline dus. (default-fault.jpg public'te yok, bg.png var.)
  const isValidImage = (u) =>
    typeof u === 'string' &&
    /\.(jpe?g|png|webp|avif)(\?.*)?$/i.test(u) &&
    !/google\.[a-z.]+\/search/i.test(u);
  const ogImage = isValidImage(postData.image)
    ? postData.image
    : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}/bg.png`;
  const canonicalData = buildCanonical(locale, `ariza-cozumleri/${kod}`);

  // Max 60 chars title
  let titleStr = `${postData.title || kod} Çözümü | Bursalı Oto`;
  if (titleStr.length > 60) {
     titleStr = `${postData.title || kod} Çözümü`.substring(0, 60);
  }

  return {
    title: titleStr,
    description: shortDescription,
    keywords: [`${postData.brand || ''} ${postData.title?.toLowerCase() || ''}`, 'Fethiye oto servis', 'arıza çözümü', 'Bursalı Oto'],
    openGraph: {
      title: titleStr,
      description: shortDescription,
      url: canonicalData.canonical,
      siteName: 'Bursalı Oto Servis',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: postData.title || 'Arıza Çözümü'
        }
      ],
      locale: locale === 'tr' ? 'tr_TR' : locale === 'en' ? 'en_GB' : locale === 'ru' ? 'ru_RU' : 'tr_TR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: titleStr,
      description: shortDescription,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
    alternates: canonicalData
  };
}

export async function generateStaticParams() {
  const paths = getAllPostIds('faults');
  const params = [];
  const LOCALES = ['tr', 'en', 'ru', 'uk', 'ar'];
  for (const p of paths) {
    for (const loc of LOCALES) {
      params.push({ locale: loc, kod: p.params.slug });
    }
  }
  return params;
}

export default async function ArizaCozumDetailPage({ params }) {
  const { kod, locale } = await params;
  setRequestLocale(locale);
  const postData = await getPostData(kod, 'faults');

  if (!postData) {
    notFound();
  }

  const description = postData.description || extractFirstSentence(postData.rawContent) || 'Bursalı Oto Servis kronik arıza çözümleri.';

  // og:image guard ile ayni kural: JSON-LD'ye de gecersiz (Google arama URL'si vb.)
  // gorsel adresi sizmasin.
  const isValidSchemaImage = (u) =>
    typeof u === 'string' &&
    /\.(jpe?g|png|webp|avif)(\?.*)?$/i.test(u) &&
    !/google\.[a-z.]+\/search/i.test(u);
  const schemaImageUrl = isValidSchemaImage(postData.image)
    ? postData.image
    : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}/bg.png`;

  // 1. Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: postData.title || 'Arıza Çözüm Rehberi',
    description: description,
    image: {
      '@type': 'ImageObject',
      url: schemaImageUrl,
      width: 1200,
      height: 630
    },
    author: {
      '@type': 'Organization',
      name: 'Bursalı Oto Servis Uzman Ekibi',
      url: (process.env.NEXT_PUBLIC_SITE_URL || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}`)
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bursalı Oto Servis',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}/logo.png` 
      }
    },
    datePublished: postData.date || new Date().toISOString(),
    dateModified: postData.updated || postData.date || new Date().toISOString(),
  };

  const brandSlug = (postData.brand || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'marka';

  // 2. Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: (process.env.NEXT_PUBLIC_SITE_URL || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}`) },
      { '@type': 'ListItem', position: 2, name: 'Arıza Çözümleri', item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}/ariza-cozumleri` },
      { '@type': 'ListItem', position: 3, name: postData.brand || 'Marka', item: `${process.env.NEXT_PUBLIC_SITE_URL || (process.env.NEXT_PUBLIC_SITE_URL || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}`)}/marka/${brandSlug}` },
      { '@type': 'ListItem', position: 4, name: postData.title || kod, item: `${process.env.NEXT_PUBLIC_SITE_URL || (process.env.NEXT_PUBLIC_SITE_URL || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}`)}/ariza-cozumleri/${kod}` }
    ]
  };

  // 3. FAQ Schema
  let diagnosticTool = 'orijinal diyagnoz cihazlarıyla';
  const brandLower = (postData.brand || '').toLowerCase();
  if (brandLower.includes('mercedes')) diagnosticTool = 'Xentry cihazıyla';
  else if (brandLower.includes('bmw') || brandLower.includes('mini')) diagnosticTool = 'ISTA sistemiyle';
  else if (brandLower.includes('porsche')) diagnosticTool = 'PIWIS test cihazıyla';
  else if (brandLower.includes('audi') || brandLower.includes('vw') || brandLower.includes('volkswagen')) diagnosticTool = 'ODIS/VCDS orijinal test cihazlarıyla';
  else if (brandLower.includes('volvo')) diagnosticTool = 'VIDA diyagnoz yazılımıyla';
  else if (brandLower.includes('land rover') || brandLower.includes('range rover')) diagnosticTool = 'SDD/Pathfinder arıza tespit cihazlarıyla';

  const faqAnswer = `Bursalı Oto uzman servisinde, ${postData.brand || 'premium'} araçlarına özel ${diagnosticTool} arıza tespiti yapılır ve ${postData.title || 'bu'} sorununun kök nedeni mekanik/elektronik olarak garantili şekilde onarılır. İlgili arıza için parça değişimi veya mekatronik onarımı uzman ekibimizce gerçekleştirilir.`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${postData.title || 'Bu arıza'} belirtileri nelerdir?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: description
        }
      },
      {
        '@type': 'Question',
        name: `${postData.title || 'Bu arızanın'} kalıcı çözümü nedir?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faqAnswer
        }
      }
    ]
  };

  // 4. Local Business & Auto Repair Schema
  // NOT: aggregateRating kaldırıldı (08.07.2026). Google yönergesi gereği.
  const gbpData = await getGBPData();
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: 'Bursalı Oto Servis',
    image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}/logo.png`,
    '@id': (process.env.NEXT_PUBLIC_SITE_URL || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}`),
    url: (process.env.NEXT_PUBLIC_SITE_URL || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}`),
    telephone: '+905548812021',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Taşyaka Mahallesi, Yeni Sanayi Sitesi, 264. Sokak, No: 1',
      addressLocality: 'Fethiye',
      addressRegion: 'Muğla',
      postalCode: '48300',
      addressCountry: 'TR'
    },
    priceRange: '$$'
    // NOT: aggregateRating kaldırıldı (08.07.2026). Google yönergesi: LocalBusiness
    // şemasındaki puan yalnızca SİTENİN KENDİ topladığı yorumlardan gelebilir;
    // Google yorumlarından alınan puanı burada göstermek "self-serving review"
    // ihlalidir ve manuel ceza riski taşır. Gerçek puan zaten GBP'de görünüyor.
  };

  // 6. HowTo Schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `${postData.title || 'Arıza'} Nasıl Çözülür?`,
    description: faqAnswer,
    step: [
      {
        '@type': 'HowToStep',
        name: 'Arıza Tespiti',
        text: `Aracınız Bursalı Oto servisine getirilerek ${diagnosticTool} ile bilgisayarlı arıza tespiti yapılır.`
      },
      {
        '@type': 'HowToStep',
        name: 'Mekanik / Elektronik Onarım',
        text: 'Uzman teknisyenlerimiz tarafından arızalı parça orijinali ile değiştirilir veya onarılır.'
      },
      {
        '@type': 'HowToStep',
        name: 'Adaptasyon ve Test',
        text: 'Onarım sonrası yazılım adaptasyonları tamamlanır ve aracınız yol testine çıkarılarak sorunsuz şekilde teslim edilir.'
      }
    ]
  };

  // 5. Service Schema
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: postData.title || 'Arıza Onarımı',
    provider: { '@id': (process.env.NEXT_PUBLIC_SITE_URL || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}`) },
    areaServed: 'Fethiye ve çevresi'
  };

  const allFaults = getSortedPostsData('tr', 'faults');
  const relatedFaults = allFaults.filter(f => f.brand === postData.brand && f.id !== kod).slice(0, 3);
  
  const readingTime = Math.ceil((postData.rawContent?.split(' ').length || 500) / 200);

  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '5rem', background: '#09090b' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      <article className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* UI Breadcrumb */}
        <nav style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Ana Sayfa</a> 
          <span>/</span>
          <a href="/ariza-cozumleri" style={{ textDecoration: 'none', color: 'inherit' }}>Arıza Çözümleri</a> 
          <span>/</span>
          <a href={`/ariza-cozumleri?brand=${postData.brand}`} style={{ textDecoration: 'none', color: 'inherit' }}>{postData.brand}</a> 
          <span>/</span>
          <span style={{ color: 'var(--accent-gold)' }}>{postData.title || kod}</span>
        </nav>

        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '1rem' }}>
            <span style={{ padding: '6px 16px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              {postData.brand}
            </span>
          </div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-light)', marginBottom: '1rem', fontWeight: '800', lineHeight: '1.2' }}>
            {postData.title || kod}
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            <strong>Etkilenen Modeller:</strong> {postData.model}
          </div>
          
          {/* Post Meta Data */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '1rem', background: '#1a1a1a', padding: '12px', borderRadius: '12px', border: '1px solid #333' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📅 {postData.date && !isNaN(new Date(postData.date).getTime()) ? new Date(postData.date).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR')}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>✍️ Bursalı Oto Uzman Ekibi</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🕒 Okuma süresi: ~{readingTime} dk</span>
          </div>
        </header>

        {/* Diagnostic Summary Box (Priority 2 Lead Magnet) */}
        {postData.riskLevel && (
          <div style={{
            background: 'linear-gradient(145deg, #18181b 0%, #09090b 100%)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '3rem',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.8)'
          }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--accent-gold)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
              Hızlı Arıza Teşhis Özeti
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>Risk Seviyesi</span>
                <strong style={{ color: postData.riskLevel === 'Kritik' || postData.riskLevel === 'Yüksek' ? '#ef4444' : '#eab308', fontSize: '1.1rem' }}>
                  {postData.riskLevel}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>Araç Kullanılabilir Mi?</span>
                <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{postData.canDrive || 'Servise Danışın'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>Tahmini Onarım Süresi</span>
                <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{postData.estimatedTime || 'Arıza Tespiti Gerekli'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>Tahmini Maliyet Aralığı</span>
                <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{postData.estimatedCost || 'Tespitten Sonra'}</strong>
              </div>
            </div>
            {postData.potentialCauses && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Muhtemel Nedenler</span>
                <p style={{ color: '#ccc', margin: 0, lineHeight: '1.5' }}>{postData.potentialCauses}</p>
              </div>
            )}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <a href="https://wa.me/905548812021" className="btn btn-gold" style={{ display: 'inline-block', padding: '1rem 2rem', textDecoration: 'none', fontWeight: 'bold' }}>
                Uzmana Danış / Randevu Al
              </a>
            </div>
          </div>
        )}

        <div 
          className="blog-content glass-panel"
          style={{ 
            padding: '3rem', 
            borderRadius: '16px', 
            background: 'rgba(24,24,27,0.5)',
            border: '1px solid rgba(255,255,255,0.05)',
            color: 'var(--text-muted)',
            fontSize: '1.1rem',
            lineHeight: '1.8'
          }}
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }} 
        />
        
        {/* Teknik Onarım ve İşçilik Bloğu (SEO Thin Content Çözümü) */}
        <section style={{ marginTop: '3rem', padding: '2rem', background: '#0a0a0c', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>
            {postData.brand || ''} {postData.title || ''} Teknik Onarım Süreci
          </h2>
          <div style={{ color: '#ccc', lineHeight: '1.8' }}>
            <p>
              Bursalı Oto Servis olarak Fethiye'de {postData.brand || 'premium'} araçlarında karşılaşılan <strong>{postData.title || 'bu'}</strong> sorunu için ezbere parça değişimi yerine, öncelikle OEM standartlarında bilgisayarlı arıza teşhisi uyguluyoruz. Bu arızanın kök nedeni genellikle {postData.potentialCauses || 'sensör okuma hataları, mekanik aşınmalar veya elektronik beyin (ECU) iletişim kopukluklarından'} kaynaklanır.
            </p>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Kullanılan Ekipman ve İşçilik Süresi</h3>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <li><strong>Teşhis Cihazı:</strong> {diagnosticTool}</li>
              <li><strong>Tahmini İşçilik Süresi:</strong> {postData.estimatedTime || 'Aracın durumuna göre 2-4 saat arası'}</li>
              <li><strong>Kullanılan Yedek Parça:</strong> %100 Orijinal (OEM) veya Garantili Logolu Yedek Parça</li>
            </ul>
            <p>
              Müdahale edilmediği takdirde aracın yürüyen aksamına veya motor kompresyonuna zarar verebilecek olan bu sorun, uzman teknisyenlerimiz tarafından 6 ay / 10.000 KM işçilik garantisiyle çözülmektedir.
            </p>
          </div>
        </section>

        {/* FAQ Section UI */}
        <section style={{ marginTop: '3rem', padding: '2rem', background: '#121212', borderRadius: '16px', border: '1px solid #333' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', marginBottom: '1.5rem' }}>Sıkça Sorulan Sorular</h2>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>{postData.title || 'Bu arıza'} belirtileri nelerdir?</h3>
            <p style={{ color: '#ccc', lineHeight: '1.6' }}>{description}</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>{postData.title || 'Bu arızanın'} kalıcı çözümü nedir?</h3>
            <p style={{ color: '#ccc', lineHeight: '1.6' }}>{faqAnswer}</p>
          </div>
        </section>

        {/* Review Request */}
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#111827', borderRadius: '12px', border: '1px solid #374151', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#ccc', marginBottom: '0.75rem' }}>⭐ Bu çözümü beğendiniz mi? Hizmetlerimizden faydalandıysanız bizi değerlendirin.</p>
          <a href={process.env.NEXT_PUBLIC_GBP_REVIEW_URL || "https://www.google.com/search?q=BURSALI+OTO+SERV%C4%B0S+Yorumlar&rldimm=1836972871363186886#lkt=LocalPoiReviews"} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-gold)', fontWeight: 'bold', textDecoration: 'none' }}>
            Google’da Yorum Bırakın {gbpData.reviewCount ? `(${gbpData.reviewCount} Yorum)` : ''}
          </a>
        </div>

        <ExpertCTA brand={postData.brand} reviewCount={gbpData.reviewCount} />

        {relatedFaults.length > 0 && (
          <div style={{ marginTop: '4rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-light)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
              Diğer {postData.brand} Arıza Çözümleri
            </h2>
            <div className="grid">
              {relatedFaults.map(fault => (
                <a key={fault.id} href={`/ariza-cozumleri/${fault.id}`} className="glass-panel hover-gold-border" style={{ display: 'block', padding: '1.25rem', textDecoration: 'none' }}>
                  <h3 style={{ color: 'var(--accent-gold)', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{fault.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{fault.description || extractFirstSentence(fault.rawContent)}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}

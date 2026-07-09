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

export async function generateMetadata({ params }) {
  const { kod, locale } = await params;
  const postData = await getPostData(kod, 'faults');
  
  if (!postData) {
    return { title: 'Sayfa Bulunamadı | Bursalı Oto' };
  }

  const description = postData.description || extractFirstSentence(postData.rawContent) || 'Bursalı Oto Servis kronik arıza çözümleri ve onarım rehberleri.';
  const shortDescription = description.length > 150 ? description.substring(0, 155) + '...' : description;
  const canonicalUrl = `https://www.bursaliotoservis.com/ariza-cozumleri/${kod}`;
  const ogImage = postData.image || 'https://www.bursaliotoservis.com/default-fault.jpg';

  return {
    title: `${postData.title} | Bursalı Oto Servis Fethiye`,
    description: shortDescription,
    keywords: [`${postData.brand} ${postData.title.toLowerCase()}`, 'Fethiye oto servis', 'arıza çözümü', 'Bursalı Oto'],
    openGraph: {
      title: `${postData.title} | Bursalı Oto`,
      description: shortDescription,
      url: canonicalUrl,
      siteName: 'Bursalı Oto Servis',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: postData.title
        }
      ],
      locale: 'tr_TR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: postData.title,
      description: shortDescription,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
    alternates: { canonical: canonicalUrl }
  };
}

export async function generateStaticParams() {
  const paths = getAllPostIds('faults');
  const params = [];
  // Harcoded 'tr' for now assuming single locale or modify if multiple locales are supported
  for (const p of paths) {
    params.push({ locale: 'tr', kod: p.params.slug });
  }
  return params;
}

export default async function ArizaCozumDetailPage({ params }) {
  const { kod, locale } = await params;
  const postData = await getPostData(kod, 'faults');

  if (!postData) {
    notFound();
  }

  const description = postData.description || extractFirstSentence(postData.rawContent) || 'Bursalı Oto Servis kronik arıza çözümleri.';

  // 1. Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: postData.title,
    description: description,
    image: postData.image ? {
      '@type': 'ImageObject',
      url: postData.image,
      width: 1200,
      height: 630
    } : undefined,
    author: {
      '@type': 'Organization',
      name: 'Bursalı Oto Servis Uzman Ekibi',
      url: 'https://www.bursaliotoservis.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bursalı Oto Servis',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.bursaliotoservis.com/logo.png' 
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
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.bursaliotoservis.com' },
      { '@type': 'ListItem', position: 2, name: 'Arıza Çözümleri', item: 'https://www.bursaliotoservis.com/ariza-cozumleri' },
      { '@type': 'ListItem', position: 3, name: postData.brand || 'Marka', item: `https://www.bursaliotoservis.com/marka/${brandSlug}` },
      { '@type': 'ListItem', position: 4, name: postData.title, item: `https://www.bursaliotoservis.com/ariza-cozumleri/${kod}` }
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

  const faqAnswer = `Bursalı Oto uzman servisinde, ${postData.brand} araçlarına özel ${diagnosticTool} arıza tespiti yapılır ve ${postData.title} sorununun kök nedeni mekanik/elektronik olarak garantili şekilde onarılır. İlgili arıza için parça değişimi veya mekatronik onarımı uzman ekibimizce gerçekleştirilir.`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${postData.title} belirtileri nelerdir?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: description
        }
      },
      {
        '@type': 'Question',
        name: `${postData.title} kalıcı çözümü nedir?`,
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
    image: 'https://www.bursaliotoservis.com/logo.png',
    '@id': 'https://www.bursaliotoservis.com',
    url: 'https://www.bursaliotoservis.com',
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
    name: `${postData.title} Nasıl Çözülür?`,
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
    serviceType: postData.title,
    provider: { '@id': 'https://www.bursaliotoservis.com' },
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
        <nav className="text-sm text-gray-400 mb-8 flex gap-2 items-center flex-wrap">
          <a href="/" className="hover:text-[var(--accent-gold)] transition-colors">Ana Sayfa</a> 
          <span>/</span>
          <a href="/ariza-cozumleri" className="hover:text-[var(--accent-gold)] transition-colors">Arıza Çözümleri</a> 
          <span>/</span>
          <a href={`/ariza-cozumleri?brand=${postData.brand}`} className="hover:text-[var(--accent-gold)] transition-colors">{postData.brand}</a> 
          <span>/</span>
          <span className="text-[var(--accent-gold)]">{postData.title}</span>
        </nav>

        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div className="flex justify-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] rounded-full text-sm font-bold border border-[var(--accent-gold)]/30">
              {postData.brand}
            </span>
          </div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--text-light)', marginBottom: '1rem', fontWeight: '800', lineHeight: '1.2' }}>
            {postData.title}
          </h1>
          <div className="text-gray-400 text-lg mb-6">
            <strong>Etkilenen Modeller:</strong> {postData.model}
          </div>
          
          {/* Post Meta Data */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mt-4 bg-[#1a1a1a] p-3 rounded-xl border border-gray-800">
            <span className="flex items-center gap-2">📅 {postData.date && !isNaN(new Date(postData.date).getTime()) ? new Date(postData.date).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR')}</span>
            <span className="flex items-center gap-2">✍️ Bursalı Oto Uzman Ekibi</span>
            <span className="flex items-center gap-2">🕒 Okuma süresi: ~{readingTime} dk</span>
          </div>
        </header>

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
        
        {/* FAQ Section UI */}
        <section className="mt-12 p-8 bg-[#121212] rounded-2xl border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">Sıkça Sorulan Sorular</h2>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[var(--accent-gold)] mb-2">{postData.title} belirtileri nelerdir?</h3>
            <p className="text-gray-300">{description}</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--accent-gold)] mb-2">{postData.title} kalıcı çözümü nedir?</h3>
            <p className="text-gray-300">{faqAnswer}</p>
          </div>
        </section>

        {/* Review Request */}
        <div className="mt-8 p-6 bg-gray-900 rounded-xl border border-gray-700 text-center flex flex-col items-center justify-center">
          <p className="text-gray-300 mb-3">⭐ Bu çözümü beğendiniz mi? Hizmetlerimizden faydalandıysanız bizi değerlendirin.</p>
          <a href={process.env.NEXT_PUBLIC_REVIEW_LINK || "https://www.google.com/search?q=BURSALI+OTO+SERV%C4%B0S+Yorumlar&rldimm=1836972871363186886#lkt=LocalPoiReviews"} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-gold)] hover:underline font-bold">
            Google’da Yorum Bırakın ({gbpData.reviewCount || 124} Yorum)
          </a>
        </div>

        <ExpertCTA brand={postData.brand} reviewCount={gbpData.reviewCount || 124} />

        {relatedFaults.length > 0 && (
          <div style={{ marginTop: '4rem' }}>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--text-light)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
              Diğer {postData.brand} Arıza Çözümleri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedFaults.map(fault => (
                <a key={fault.id} href={`/ariza-cozumleri/${fault.id}`} className="block p-5 bg-[#1a1a1a] rounded-xl border border-gray-800 hover:border-[var(--accent-gold)] transition-all hover:-translate-y-1">
                  <h4 style={{ color: 'var(--accent-gold)', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{fault.title}</h4>
                  <p className="text-sm text-gray-400 line-clamp-3">{fault.description || extractFirstSentence(fault.rawContent)}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}

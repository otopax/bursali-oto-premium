import Link from 'next/link';
import { buildSEOContract } from '@/lib/seo/canonical';
import { businessData } from '@/lib/business';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const titles = {
    tr: 'Hakkımızda | Bursalı Oto Servis Fethiye',
    en: 'About Us | Bursali Auto Repair Fethiye',
    ru: 'О нас | Bursali Oto Servis Fethiye',
    uk: 'Про нас | Bursali Oto Servis Fethiye',
    ar: 'من نحن | Bursali Oto Servis Fethiye',
  };

  const descriptions = {
    tr: 'Babadan oğula 50 yıllık ustalık geleneğiyle Fethiye\'de premium oto servis hizmeti sunuyoruz.',
    en: '50 years of master craftsmanship offering premium auto repair service in Fethiye.',
    ru: '50-летний опыт и традиции премиального автосервиса в Фетхие.',
    uk: '50-річний досвід та традиції преміального автосервісу у Фетхіє.',
    ar: '50 عاماً من الخبرة والتقاليد في تقديم خدمات صيانة السيارات الفاخرة في فتحية.',
  };

  return buildSEOContract({
    locale,
    path: '/hakkimizda',
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
  });
}

export default async function AboutPage({ params }) {
  const { locale } = await params;
  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '4rem' }}>
      <div className="container">
        
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem' }}>
            <li><a href="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Ana Sayfa</a></li>
            <li>/</li>
            <li aria-current="page" style={{ color: 'var(--text-light)' }}>Hakkımızda</li>
          </ol>
        </nav>

        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          {(() => {
            const h1Titles = {
              tr: 'Bursalı Oto Servis Fethiye Hakkında',
              en: 'About Bursali Auto Repair Fethiye',
              ru: 'О компании Bursalı Oto Servis Fethiye',
              uk: 'Про компанію Bursalı Oto Servis Fethiye',
              ar: 'نبذة عن مركز بورصالي لخدمات السيارات في فتحية',
            };
            return <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>{h1Titles[locale] || h1Titles.tr}</h1>;
          })()}
          
          <div className="answer-first-block" style={{ backgroundColor: 'rgba(255, 215, 0, 0.05)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--gold)', marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: 0 }}>
              <strong>Bursalı Oto Servis</strong>, Fethiye Yeni Sanayi Sitesi'nde hizmet veren, babadan oğula geçen <strong>50 yıllık ustalık geleneğini</strong> yeni nesil teknolojiyle harmanlayan premium bir otomobil kliniğidir.
            </p>
          </div>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Hikayemiz ve Uzmanlığımız</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
            Yarım asırlık bir aile geleneği olan oto tamirciliğini, 2. kuşak olarak son 20 yıldır tamamen profesyonel, dijital ve şeffaf bir zemine taşıdık. Eski usul "deneme-yanılma" mantığına son vererek, Fethiye'de premium araçların (Porsche, BMW, Mercedes, Audi) ihtiyaç duyduğu yetkili servis standartlarını bağımsız bir serviste sunmaya başladık.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Kullandığımız Ekipmanlar</h2>
          <ul style={{ listStyleType: 'disc', marginLeft: '2rem', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            <li><strong>PIWIS:</strong> Porsche araçlara özel orijinal yetkili servis arıza tespit cihazı.</li>
            <li><strong>ODIS:</strong> VAG Grubu (Volkswagen, Audi, Seat, Skoda) lisanslı diagnostik sistem.</li>
            <li><strong>BMW ISTA / Mercedes XENTRY:</strong> Kesin tespit sağlayan orijinal programlar.</li>
            <li><strong>Dinamik Şanzıman Makinesi:</strong> Otomatik şanzıman yağ değişimlerinde %100 tam dolum sağlayan son teknoloji ünite.</li>
          </ul>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Garanti Politikamız ve Şeffaflık</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Kullanılan tüm mekanik ve elektronik parçalar orijinal (OEM) olup, yapılan tüm onarımlara <strong>1 yıl servis garantisi</strong> vermekteyiz. Fiyatlandırmamız %100 şeffaftır; aracınıza yapılacak işlemler ve tutarı önceden yazılı olarak sunulur, siz onaylamadan işlem başlamaz.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Hizmet Bölgelerimiz (7/24 Çekici ile)</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Muğla ili Fethiye ilçesi merkezli olmak üzere: Fethiye Merkez, Göcek, Ölüdeniz, Çalış, Kayaköy, Seydikemer ve Dalaman bölgelerine 3 adet tam donanımlı çekicimiz ile 7/24 kesintisiz hizmet veriyoruz.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <a href="https://wa.me/905548812021" className="btn btn-primary">İletişime Geç</a>
            <Link href={`/${locale}/seffaf-fiyatlandirma`} className="btn btn-gold" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>Fiyat Politikamız</Link>
          </div>
        </div>

        {/* SSS — GBP Q&A ile birebir aynı (FAQPage şeması aşağıdaki JSON-LD'de) */}
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h2 style={{ color: 'var(--gold)', marginBottom: '2rem', fontSize: '2rem' }}>Sık Sorulan Sorular</h2>
          {businessData.faq.map((item, i) => (
            <div key={i} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: i < businessData.faq.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
              <h3 style={{ color: 'var(--text-light)', fontSize: '1.15rem', marginBottom: '0.75rem' }}>{item.question}</h3>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.7', margin: 0, color: 'var(--text-muted)' }}>{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "AboutPage",
              "mainEntity": {
                "@type": "AutoRepair",
                "name": businessData.name,
                "description": businessData.description,
                "foundingDate": "1974", // 50+ years ago
                "url": businessData.url,
                "image": businessData.image,
                "telephone": businessData.telephone,
                "address": {
                  "@type": "PostalAddress",
                  ...businessData.address
                }
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": businessData.faq.map((item) => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": item.answer
                }
              }))
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Ana Sayfa",
                  "item": (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com')
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Hakkımızda",
                  "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}/tr/hakkimizda`
                }
              ]
            }
          ])
        }}
      />
    </main>
  );
}

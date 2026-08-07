import { buildSEOContract } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const titles = {
    tr: 'Porsche, Mercedes, BMW, Audi Özel Servis Fethiye | Bursalı Oto',
    en: 'Porsche, Mercedes, BMW, Audi Specialist Service Fethiye | Bursali Auto',
    ru: 'Специализированный сервис Porsche, Mercedes, BMW, Audi в Фетхие',
    uk: 'Спеціалізований сервіс Porsche, Mercedes, BMW, Audi у Фетхіє',
    ar: 'مركز صيانة بورش ومرسيدس وبي إم دبليو وآودي في فتحية',
  };

  const descriptions = {
    tr: 'Fethiye\'de Porsche, Mercedes, BMW ve Audi premium araçlarınız için orijinal PIWIS, ODIS arıza tespiti ve garantili bakım onarım servisi.',
    en: 'Specialist repair service for Porsche, Mercedes, BMW and Audi in Fethiye using official PIWIS and ODIS diagnostic tools.',
    ru: 'Профессиональный ремонт Porsche, Mercedes, BMW, Audi в Фетхие на дилерском оборудовании PIWIS и ODIS.',
    uk: 'Професійний ремонт Porsche, Mercedes, BMW, Audi у Фетхіє на дилерському обладнанні PIWIS та ODIS.',
    ar: 'خدمة صيانة واختبار سيارات بورش ومرسيدس وبي إم دبليو وآودي في فتحية بأجهزة الأصيلة.',
  };

  return buildSEOContract({
    locale,
    path: '/porsche-mercedes-ozel-servis',
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
  });
}

export default async function PorscheMercedesPage({ params }) {
  const { locale } = await params;

  const h1Titles = {
    tr: 'Fethiye Premium Araç Özel Servisi (Porsche & Alman Grubu)',
    en: 'Fethiye Premium Vehicle Specialist Service (Porsche & German Group)',
    ru: 'Специализированный Сервис Премиум Автомобилей в Фетхие (Porsche и Немецкая Группа)',
    uk: 'Спеціалізований Сервіс Преміум Автомобілів у Фетхіє (Porsche та Німецька Група)',
    ar: 'مركز صيانة السيارات الفاخرة في فتحية (بورش والمجموعة الألمانية)',
  };

  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>{h1Titles[locale] || h1Titles.tr}</h1>
          
          <div className="answer-first-block" style={{ backgroundColor: 'rgba(255, 215, 0, 0.05)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--gold)', marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: 0 }}>
              <strong>Evet, Fethiye'de Porsche, BMW, Mercedes ve Audi araçlara özel servis hizmeti veriyoruz.</strong> Baba mesleği olan 50 yıllık köklü tecrübemiz ve 2. kuşak olarak 20 yıllık güncel teknik uzmanlığımızla hizmetinizdeyiz. Yetkili servis standartlarında, orijinal PIWIS ve ODIS arıza tespit cihazlarıyla deneme yanılma yapmadan kesin çözüm üretiyoruz.
            </p>
          </div>

          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Fethiye bölgesinde <strong>Porsche, Mercedes-Benz, BMW, Audi ve Land Rover</strong> marka premium araçlarınızın arıza tespiti ve ağır mekanik bakımları konusunda uzmanlaşmış bir kurumuz. Aracınızı sıradan sanayi yöntemlerine teslim etmek yerine, tamamen <strong>yetkili servis standartlarında</strong>, orijinal cihazlarla hizmet almanın ayrıcalığını yaşayın.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Orijinal Cihazlarla Kesin Arıza Tespiti</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Premium araçların beyin (ECU) sistemleri son derece karmaşıktır. Servisimizde deneme-yanılma yöntemine yer yoktur. Porsche için <strong>PIWIS</strong>, VAG grubu (Audi, Volkswagen) için <strong>ODIS</strong> ve BMW/Mercedes için resmi distribütör yazılımlarını kullanarak aracınızdaki arızayı nokta atışı tespit ediyoruz.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Neler Yapıyoruz?</h2>
          <ul style={{ listStyleType: 'disc', marginLeft: '2rem', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            <li>Ağır mekanik onarım ve motor revizyonu (1 Yıl Garantili)</li>
            <li>Havalı süspansiyon (Air Suspension) arıza onarımı ve değişimi</li>
            <li>Orijinal yedek parça temini ve değişimi</li>
            <li>Elektronik beyin programlama ve kodlama</li>
          </ul>

          <h2 style={{ marginBottom: '1.5rem', color: 'var(--gold)', marginTop: '2rem' }}>Sıkça Sorulan Sorular (SSS)</h2>
          <div className="faq-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Fethiye'de Porsche'a kim bakar?</h3>
              <p style={{ color: 'var(--text-muted)' }}>Fethiye'de Porsche marka araçlara Bursalı Oto Servis olarak biz bakıyoruz. Orijinal PIWIS diagnostik cihazı kullanarak elektronik ve mekanik tüm arızaları yetkili servis standartlarında çözüyoruz.</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Ustanızın tecrübesi nedir?</h3>
              <p style={{ color: 'var(--text-muted)' }}>Bursalı Oto, babadan oğula geçen bir servistir. Kurucumuzun 50 yıllık ustalık birikimi ve 2. kuşak olarak bizim 20 yıllık aktif tecrübemizle premium araçlarda üst düzey uzmanlığa sahibiz.</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Orijinal parça mı kullanıyorsunuz?</h3>
              <p style={{ color: 'var(--text-muted)' }}>Premium segment araçların onarımında aksi talep edilmediği sürece %100 orijinal yedek parçalar kullanıyor ve onarımlarımıza 1 yıl garanti veriyoruz.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <a href="tel:+905548812021" className="btn btn-primary">Hemen Uzmana Danış: 0554 881 20 21</a>
            <a href="/" className="btn btn-gold">Ana Sayfaya Dön</a>
          </div>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "AutoRepair",
              "name": "Bursalı Oto Servis - Premium Araç Departmanı",
              "description": "Fethiye Porsche, BMW, Mercedes Özel Servisi. Orijinal PIWIS ve ODIS cihazlarıyla bilgisayarlı arıza tespiti.",
              "priceRange": "$$$",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Fethiye",
                "addressCountry": "TR"
              },
              "makesOffer": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Porsche Arıza Tespiti"
                  }
                }
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Fethiye'de Porsche'a kim bakar?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Fethiye'de Porsche marka araçlara Bursalı Oto Servis olarak biz bakıyoruz. Orijinal PIWIS diagnostik cihazı kullanarak elektronik ve mekanik tüm arızaları yetkili servis standartlarında çözüyoruz."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Ustanızın tecrübesi nedir?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Bursalı Oto, babadan oğula geçen bir servistir. Kurucumuzun 50 yıllık ustalık birikimi ve 2. kuşak olarak bizim 20 yıllık aktif tecrübemizle premium araçlarda üst düzey uzmanlığa sahibiz."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Orijinal parça mı kullanıyorsunuz?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Premium segment araçların onarımında aksi talep edilmediği sürece %100 orijinal yedek parçalar kullanıyor ve onarımlarımıza 1 yıl garanti veriyoruz."
                  }
                }
              ]
            }
          ])
        }}
      />
    </main>
  );
}

import { buildCanonical } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const titles = {
    tr: '7/24 Fethiye Oto Çekici ve Yol Yardım | Bursalı Oto Servis',
    en: '24/7 Fethiye Tow Truck & Roadside Assistance | Bursali Auto Repair',
    ru: '24/7 Эвакуатор и Помощь На Дорогах В Фетхие | Bursali Auto Repair',
    uk: '24/7 Евакуатор Та Допомога На Дорогах У Фетхіє | Bursali Auto Repair',
    ar: 'سطحة وخدمة سحب السيارات 24/7 في فتحية | Bursali Auto Repair',
  };

  const descriptions = {
    tr: 'Fethiye ve çevresinde 7/24 oto çekici, oto kurtarma ve acil yol yardım hizmeti. WhatsApp ile konum gönderin.',
    en: '24/7 emergency tow truck and roadside assistance in Fethiye and surrounding areas. Send location via WhatsApp.',
    ru: '24/7 услуги эвакуатора и помощь на дорогах в Фетхие. Отправьте геопозицию через WhatsApp.',
    uk: '24/7 послуги евакуатора та допомога на дорогах у Фетхіє. Надішліть геопозицію через WhatsApp.',
    ar: 'خدمة سحب السيارات والمساعدة على الطريق على مدار 24/7 في فتحية. أرسل موقعك عبر WhatsApp.',
  };

  return {
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
    alternates: buildCanonical(locale, '/fethiye-7-24-oto-cekici'),
  };
}

export default function TowingPage() {
  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem', borderLeft: '4px solid #e11d48' }}>
          <div style={{ display: 'inline-block', background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', padding: '0.5rem 1rem', borderRadius: '100px', fontWeight: 'bold', marginBottom: '1rem' }}>
            🛡️ 7/24 Kesintisiz Acil Hizmet
          </div>
          <h1 style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Fethiye 7/24 Oto Çekici ve Yol Yardım</h1>
          
          <div className="answer-first-block" style={{ backgroundColor: 'rgba(225, 29, 72, 0.05)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #e11d48', marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: 0 }}>
              <strong>Fethiye'de 7/24 oto çekici ve yol yardım hizmeti veriyoruz.</strong> WhatsApp'tan konumunuzu gönderdiğiniz anda yola çıkarız. Bünyemizdeki 3 adet donanımlı çekici sayesinde ekstra bekleme süresi yaşanmaz. Fethiye, Göcek, Ölüdeniz ve çevresine mesafeye göre en hızlı şekilde ulaşıyoruz. Acil durumlar için hemen arayın: 0554 881 20 21.
            </p>
          </div>

          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Kaza mı yaptınız veya aracınız arıza mı verdi? Hiç panik yapmayın. <strong>Fethiye'nin neresinde olursanız olun</strong> (Göcek, Ölüdeniz, Ovacık, Seydikemer, Yanıklar), profesyonel oto kurtarıcı filomuzla yanınızdayız.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Hangi Durumlarda Bizi Arayabilirsiniz?</h2>
          <ul style={{ listStyleType: 'disc', marginLeft: '2rem', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            <li>Trafik kazası sonrası güvenli araç taşıma</li>
            <li>Motor arızası, şanzıman kilitlenmesi veya elektronik hatalar</li>
            <li>Akü bitmesi ve yerinde akü takviyesi</li>
            <li>Premium ve alçak araçların (Air süspansiyonlu) sıfır hasarla transferi</li>
          </ul>

          <h2 style={{ marginBottom: '1.5rem', color: 'var(--gold)', marginTop: '2rem' }}>Sıkça Sorulan Sorular (SSS)</h2>
          <div className="faq-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Çekici ne kadar sürede gelir?</h3>
              <p style={{ color: 'var(--text-muted)' }}>Konumunuzu aldıktan hemen sonra anında yola çıkıyoruz. Bünyemizde 3 adet çekici bulunduğu için araç beklemek veya sıra beklemek gibi durumlar yaşanmaz. Varış süremiz sadece aramızdaki mesafeye bağlıdır.</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Aracımı direkt servise mi götürüyorsunuz?</h3>
              <p style={{ color: 'var(--text-muted)' }}>Evet, yolda kalan aracınızı isterseniz doğrudan Fethiye Yeni Sanayi Sitesi'ndeki kendi tam donanımlı Bursalı Oto Servisimize getiriyor ve 7/24 kameralı güvenli otoparkımızda muhafaza edip onarıma alabiliyoruz.</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Alçak (Air Süspansiyonlu) veya premium araçları çekebilir misiniz?</h3>
              <p style={{ color: 'var(--text-muted)' }}>Kesinlikle. Porsche, BMW, Mercedes gibi altı yere yakın veya premium segment araçlar için sıfır hasar garantisiyle çalışan özel platformlu çekicilerimiz mevcuttur.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <a href="https://wa.me/905548812021?text=Yolda%20kald%C4%B1m,%20acil%20%C3%A7ekici%20laz%C4%B1m.%20Konumum:" className="btn btn-primary" style={{ background: '#e11d48', color: 'white', border: 'none' }}>
              📍 WhatsApp İle Konum Gönder (7/24)
            </a>
            <a href="tel:+905548812021" className="btn btn-gold">
              📞 Hemen Ara: 0554 881 20 21
            </a>
          </div>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "Fethiye 7/24 Oto Çekici",
              "provider": {
                "@type": "AutoRepair",
                "name": "Bursalı Oto Servis"
              },
              "areaServed": {
                "@type": "City",
                "name": "Fethiye"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Çekici ne kadar sürede gelir?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Konumunuzu aldıktan hemen sonra anında yola çıkıyoruz. Bünyemizde 3 adet çekici bulunduğu için araç beklemek veya sıra beklemek gibi durumlar yaşanmaz. Varış süremiz sadece aramızdaki mesafeye bağlıdır."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Aracımı direkt servise mi götürüyorsunuz?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Evet, yolda kalan aracınızı isterseniz doğrudan Fethiye Yeni Sanayi Sitesi'ndeki kendi tam donanımlı Bursalı Oto Servisimize getiriyor ve 7/24 kameralı güvenli otoparkımızda muhafaza edip onarıma alabiliyoruz."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Alçak (Air Süspansiyonlu) veya premium araçları çekebilir misiniz?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Kesinlikle. Porsche, BMW, Mercedes gibi altı yere yakın veya premium segment araçlar için sıfır hasar garantisiyle çalışan özel platformlu çekicilerimiz mevcuttur."
                  }
                }
              ]
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
                  "name": "7/24 Acil Oto Çekici",
                  "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com'}/fethiye-7-24-oto-cekici`
                }
              ]
            }
          ])
        }}
      />
    </main>
  );
}

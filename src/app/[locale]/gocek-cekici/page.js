import { buildSEOContract } from '@/lib/seo/canonical';
import TrustBadges from '@/components/TrustBadges';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const titles = {
    tr: 'Göcek 7/24 Oto Çekici & Yol Yardım | Bursalı Oto Servis',
    en: 'Göcek 24/7 Car Towing & Roadside Assistance | Bursali Auto',
    ru: 'Гёчек 24/7 Эвакуатор и Помощь на Дороге | Bursali Auto',
    uk: 'Гьочек 24/7 Евакуатор та Допомога на Дорозі | Bursali Auto',
    ar: 'خدمة سحب السيارات 24/7 في غوجيك | Bursali Auto Repair',
  };

  const descriptions = {
    tr: 'Göcek marina ve çevresinde yolda kalan araçlarınız için 7/24 hızlı ve sigortalı oto çekici ve acil oto kurtarma servisi.',
    en: 'Fast, insured 24/7 car towing and emergency roadside assistance around Göcek marina and surrounding areas.',
    ru: 'Быстрый и страховой эвакуатор 24/7 в районе марины Гёчек и окрестностях.',
    uk: 'Швидкий та застрахований евакуатор 24/7 в районі марини Гьочек та околицях.',
    ar: 'خدمة سحب ونجدة السيارات على مدار 24 ساعة في غوجيك والميناء البحري.',
  };

  return buildSEOContract({
    locale,
    path: '/gocek-cekici',
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
  });
}

export default async function GocekCekiciPage({ params }) {
  const { locale } = await params;

  const h1Titles = {
    tr: 'Göcek VIP Oto Çekici ve Yol Yardım',
    en: 'Gocek VIP Tow Truck and Roadside Assistance',
    ru: 'VIP Эвакуатор и Техпомощь на Дороге в Гёчеке',
    uk: 'VIP Евакуатор та Техдопомога на Дорозі в Гьочеку',
    ar: 'خدمة سحب السيارات VIP والمساعدة على الطريق في غوجيك',
  };

  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>{h1Titles[locale] || h1Titles.tr}</h1>
          
          <div className="answer-first-block" style={{ backgroundColor: 'rgba(255, 215, 0, 0.05)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--gold)', marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: 0 }}>
              <strong>Göcek marina, koylardaki oteller veya Dalaman güzergahında yolda mı kaldınız?</strong> Premium araçlar (BMW, Mercedes, Porsche, Audi vb.) ve ticari VIP transfer araçları (Vito, Crafter) için özel kurtarıcılarımızla 7/24 hizmetinizdeyiz.
            </p>
          </div>

          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Göcek'teki lüks araç sahipleri ve VIP transfer firmaları için özel kurtarma donanımlarına sahip araçlarımız mevcuttur. Düşük şasi araçlar veya hasar görmüş otomatik şanzımanlı araçlar, özel tekerlek arabaları ve kayar kasa sistemlerimizle kesinlikle zarar görmeden kurtarılır ve Fethiye'deki merkez servisimize ulaştırılır.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Hizmet Ayrıcalıklarımız</h2>
          <ul style={{ listStyleType: 'disc', marginLeft: '2rem', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            <li>Premium Araçlara Uygun Alçak Eğimli Kayar Kasa</li>
            <li>Şanzımanı Kilitlemiş Araçlar İçin "Zararsız" Kurtarma Sistemi</li>
            <li>Göcek ve Dalaman'a Hızlı Ulaşım (7/24)</li>
            <li>Deneyimli, Diksiyonu Düzgün İngilizce/Rusça Bilen Ekip</li>
          </ul>

          <TrustBadges />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '3rem' }}>
            <a href="https://wa.me/905548812021?text=Göcek%20bölgesindeyim,%20acil%20çekici%20lazım." target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center' }}>
              <span aria-hidden="true" style={{ marginRight: '8px' }}>📍</span> Konum Gönder (WhatsApp)
            </a>
            <a href="tel:+905548812021" className="btn btn-gold">VIP Çekici Çağır: 0554 881 20 21</a>
          </div>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "EmergencyService",
              "name": "Bursalı VIP Oto Çekici - Göcek",
              "description": "Göcek ve Dalaman için Premium Araç Kurtarma Hizmeti",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Göcek",
                "addressRegion": "Muğla",
                "addressCountry": "TR"
              },
              "areaServed": ["Göcek", "Dalaman", "İnlice"],
              "telephone": "+905548812021"
            }
          ])
        }}
      />
    </main>
  );
}

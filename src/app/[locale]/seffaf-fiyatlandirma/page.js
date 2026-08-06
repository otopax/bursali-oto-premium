import Link from 'next/link';
import { buildCanonical } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const titles = {
    tr: 'Şeffaf Fiyatlandırma Politikası | Bursalı Oto Servis Fethiye',
    en: 'Transparent Pricing Policy | Bursali Auto Repair Fethiye',
    ru: 'Прозрачная Политика Цен | Bursali Oto Servis Fethiye',
    uk: 'Прозора Політика Цін | Bursali Oto Servis Fethiye',
    ar: 'سياسة التسعير الشفافة | Bursali Oto Servis Fethiye',
  };

  const descriptions = {
    tr: 'Fethiye premium oto servis fiyatları. Sürpriz maliyet olmadan %100 şeffaf işçilik ve orijinal yedek parça garantisi.',
    en: 'Transparent auto service pricing in Fethiye with zero hidden fees and 100% genuine parts warranty.',
    ru: 'Прозрачные цены на автосервис в Фетхие без скрытых платежей и с гарантией оригинальных запчастей.',
    uk: 'Прозорі ціни на автосервіс у Фетхіє без прихованих платежів та з гарантією оригінальних запчастин.',
    ar: 'أسعار خدمات السيارات الشفافة في فتحية بدون رسوم خفية وضمان قطع غيار أصلية 100%.',
  };

  return {
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
    alternates: buildCanonical(locale, '/seffaf-fiyatlandirma'),
  };
}

export default async function TransparentPricingPage({ params }) {
  const { locale } = await params;

  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', background: '#0f172a' }}>
      
      {/* Header Section */}
      <section style={{ textAlign: 'center', padding: '2rem 1rem', marginBottom: '3rem' }}>
        <span className="badge" style={{ marginBottom: '1rem', display: 'inline-block', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)' }}>
          {locale === 'tr' ? '%100 Şeffaflık Garantisi' : '100% Transparency Guarantee'}
        </span>
        <h1 style={{ fontSize: '3rem', color: '#f8fafc', marginBottom: '1.5rem' }}>
          {locale === 'tr' ? 'Şeffaf Fiyatlandırma' : 'Transparent Pricing'}
        </h1>
        
        <div className="answer-first-block container" style={{ backgroundColor: 'rgba(255, 215, 0, 0.05)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--accent-gold)', marginBottom: '2rem', textAlign: 'left', maxWidth: '800px', margin: '0 auto 2rem auto' }}>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: 0, color: '#f8fafc' }}>
            {locale === 'tr' ? 
              <strong>Evet, Bursalı Oto Servis'te "Turist Fiyatı" veya sonradan çıkan gizli masraflar yoktur. Aracınıza yapılacak her işlemi ve kullanılacak parçaları faturasıyla birlikte önceden size sunarız, siz onaylamadan hiçbir tamire başlamayız.</strong>
              :
              <strong>Yes, at Bursalı Oto Servis there is no "Tourist Pricing" and no hidden costs. We provide a clear estimate of all parts and labor upfront, and we never begin repairs without your explicit approval.</strong>
            }
          </p>
        </div>

        <p style={{ maxWidth: '800px', margin: '0 auto', color: '#94a3b8', fontSize: '1.2rem', lineHeight: '1.6' }}>
          {locale === 'tr' 
            ? 'Premium aracınızın bakımı sürpriz olmamalı. İşleme başlamadan önce kullanılacak orijinal parçaları ve işçilik maliyetini kuruşu kuruşuna onayınıza sunuyoruz.' 
            : 'Servicing your luxury vehicle shouldn’t come with surprises. We provide an exact breakdown of genuine parts and labor costs for your approval before any work begins.'}
        </p>
      </section>

      {/* Pricing Principles */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid var(--accent-gold)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>
              {locale === 'tr' ? '1. Teşhis ve Analiz' : '1. Diagnosis & Analysis'}
            </h3>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
              {locale === 'tr'
                ? 'Aracınız orijinal PIWIS/ODIS cihazlarına bağlanır. Arıza tespiti (Diagnostic) sonrası size arızanın kesin kaynağı ve raporu sunulur. Deneme yanılma yapmıyoruz.'
                : 'Your vehicle is connected to original PIWIS/ODIS diagnostic tools. We find the exact root cause and present you with a detailed report. No guesswork.'}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid var(--accent-blue)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>
              {locale === 'tr' ? '2. Ön Onay Süreci' : '2. Pre-Approval Process'}
            </h3>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
              {locale === 'tr'
                ? 'Kullanılacak yedek parçaların listesi (Orijinal logolu) ve servis işçilik ücreti yazılı olarak WhatsApp üzerinden size iletilir. Siz onaylamadan hiçbir işlem yapılmaz.'
                : 'A list of spare parts (OEM Genuine) and our labor fee is sent to you via WhatsApp in writing. No work is performed without your explicit confirmation.'}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid #10b981' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>
              {locale === 'tr' ? '3. Sürpriz Maliyet Yok' : '3. No Hidden Fees'}
            </h3>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
              {locale === 'tr'
                ? 'İşlem sırasında öngörülemeyen bir durum oluşursa, işlem anında durdurulur ve size görsel/video ile kanıtlanarak ek onay istenir. Faturanızda gizli ek ücretler göremezsiniz.'
                : 'If an unforeseen issue arises during repair, work is paused. We send you photo/video evidence and request secondary approval. You will never see hidden fees on your invoice.'}
            </p>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="container" style={{ marginBottom: '5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-gold)', textAlign: 'center' }}>
          {locale === 'tr' ? 'Sıkça Sorulan Sorular (SSS)' : 'Frequently Asked Questions'}
        </h2>
        <div className="faq-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'white' }}>
              {locale === 'tr' ? 'Turistler için ayrı bir fiyat listeniz var mı?' : 'Do you have a separate price list for tourists?'}
            </h3>
            <p style={{ color: '#cbd5e1' }}>
              {locale === 'tr' ? 'Hayır. Bursalı Oto Servis olarak Fethiye yerlisine uyguladığımız standart şeffaf fiyatlandırma listesi turistler veya gurbetçiler için de aynen geçerlidir.' : 'No. The standard transparent pricing we offer to Fethiye locals applies equally to all tourists and expats.'}
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'white' }}>
              {locale === 'tr' ? 'Ödeme seçenekleri nelerdir?' : 'What are the payment options?'}
            </h3>
            <p style={{ color: '#cbd5e1' }}>
              {locale === 'tr' ? 'Kredi kartı, banka havalesi ve nakit ödeme seçeneklerimiz mevcuttur. Döviz ile ödeme yapmak isteyen müşterilerimize de yardımcı oluyoruz.' : 'We accept credit cards, bank transfers, and cash. We can also assist customers who wish to pay in foreign currency.'}
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'white' }}>
              {locale === 'tr' ? 'İşlem sonrası garanti veriyor musunuz?' : 'Do you provide a warranty after the repair?'}
            </h3>
            <p style={{ color: '#cbd5e1' }}>
              {locale === 'tr' ? 'Evet, Fethiye Sanayi Sitesindeki servisimizde yaptığımız tüm mekanik ve elektronik onarımlar orijinal parça garantisiyle birlikte 1 yıl boyunca bizim güvencemizdedir.' : 'Yes, all mechanical and electronic repairs performed at our service center in Fethiye come with a 1-year warranty on original parts and labor.'}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(212,175,55,0.05) 100%)', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '1.5rem' }}>
            {locale === 'tr' ? 'Fiyat Teklifi Almak İster Misiniz?' : 'Would you like a price estimate?'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
            {locale === 'tr' 
              ? 'Aracınızın şasi numarasını (VIN) ve şikayetinizi WhatsApp hattımıza gönderin, uzman ekibimiz en kısa sürede size dönsün.' 
              : 'Send us your vehicle identification number (VIN) and your complaint via WhatsApp, our experts will get back to you shortly.'}
          </p>
          <a href="https://wa.me/905548812021" target="_blank" rel="noopener noreferrer" className="btn btn-gold" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
            {locale === 'tr' ? 'WhatsApp Üzerinden Teklif Al' : 'Get an Estimate via WhatsApp'}
          </a>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": locale === 'tr' ? 'Turistler için ayrı bir fiyat listeniz var mı?' : 'Do you have a separate price list for tourists?',
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": locale === 'tr' ? 'Hayır. Bursalı Oto Servis olarak Fethiye yerlisine uyguladığımız standart şeffaf fiyatlandırma listesi turistler veya gurbetçiler için de aynen geçerlidir.' : 'No. The standard transparent pricing we offer to Fethiye locals applies equally to all tourists and expats.'
                }
              },
              {
                "@type": "Question",
                "name": locale === 'tr' ? 'Ödeme seçenekleri nelerdir?' : 'What are the payment options?',
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": locale === 'tr' ? 'Kredi kartı, banka havalesi ve nakit ödeme seçeneklerimiz mevcuttur. Döviz ile ödeme yapmak isteyen müşterilerimize de yardımcı oluyoruz.' : 'We accept credit cards, bank transfers, and cash. We can also assist customers who wish to pay in foreign currency.'
                }
              },
              {
                "@type": "Question",
                "name": locale === 'tr' ? 'İşlem sonrası garanti veriyor musunuz?' : 'Do you provide a warranty after the repair?',
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": locale === 'tr' ? 'Evet, Fethiye Sanayi Sitesindeki servisimizde yaptığımız tüm mekanik ve elektronik onarımlar orijinal parça garantisiyle birlikte 1 yıl boyunca bizim güvencemizdedir.' : 'Yes, all mechanical and electronic repairs performed at our service center in Fethiye come with a 1-year warranty on original parts and labor.'
                }
              }
            ]
          })
        }}
      />

    </main>
  );
}

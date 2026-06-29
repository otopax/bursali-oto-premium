import Link from 'next/link';

export const metadata = {
  title: 'Şeffaf Fiyatlandırma | Bursalı Oto Servis',
  description: 'Fethiye premium oto servis fiyatları. Sürpriz maliyet olmadan, %100 orijinal yedek parça ve şeffaf işçilik ücretleri.',
};

export default async function TransparentPricingPage({ params }) {
  const { locale } = await params;

  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', background: '#0f172a' }}>
      
      {/* Header Section */}
      <section style={{ textAlign: 'center', padding: '2rem 1rem', marginBottom: '3rem' }}>
        <span className="badge" style={{ marginBottom: '1rem', display: 'inline-block', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)' }}>
          {locale === 'tr' ? '%100 Şeffaflık Garantisi' : '100% Transparency Guarantee'}
        </span>
        <h1 style={{ fontSize: '3rem', color: '#f8fafc', marginBottom: '1rem' }}>
          {locale === 'tr' ? 'Şeffaf Fiyatlandırma' : 'Transparent Pricing'}
        </h1>
        <p style={{ maxWidth: '700px', margin: '0 auto', color: '#94a3b8', fontSize: '1.2rem', lineHeight: '1.6' }}>
          {locale === 'tr' 
            ? 'Premium aracınızın bakımı sürpriz olmamalı. İşleme başlamadan önce kullanılacak orijinal parçaları ve işçilik maliyetini kuruşu kuruşuna onayınıza sunuyoruz.' 
            : 'Servicing your luxury vehicle shouldn’t come with surprises. We provide an exact breakdown of genuine parts and labor costs for your approval before any work begins.'}
        </p>
      </section>

      {/* Pricing Principles */}
      <section className="container" style={{ marginBottom: '5rem' }}>
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

    </main>
  );
}

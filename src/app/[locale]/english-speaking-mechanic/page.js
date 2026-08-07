import { buildSEOContract } from '@/lib/seo/canonical';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const titles = {
    tr: 'İngilizce Konuşan Oto Tamir Servisi Fethiye | Bursalı Oto',
    en: 'English Speaking Auto Mechanic in Fethiye | Bursali Auto Repair',
    ru: 'Англоговорящий автомеханик в Фетхие | Bursali Auto Repair',
    uk: 'Англомовний автомеханік у Фетхіє | Bursali Auto Repair',
    ar: 'ميكانيكي يتحدث الإنجليزية في فتحية | Bursali Auto Repair',
  };

  const descriptions = {
    tr: 'Fethiye bölgesinde yabancı misafirlerimiz ve turistler için İngilizce konuşan uzman ekibimizle premium garantili oto servis.',
    en: 'Looking for an English-speaking auto mechanic in Fethiye? Premium car repair, 24/7 towing, and transparent pricing for tourists & expats.',
    ru: 'Англоговорящий автомеханик в Фетхие. Премиальный автосервис для туристов и экспатов с гарантией.',
    uk: 'Англомовний автомеханік у Фетхіє. Преміальний автосервіс для туристів та експатів з гарантією.',
    ar: 'ميكانيكي سيارات يتحدث الإنجليزية في فتحية. خدمة صيانة فاخرة مع سحب 24/7 للسيارات.',
  };

  return buildSEOContract({
    locale,
    path: '/english-speaking-mechanic',
    title: titles[locale] || titles.tr,
    description: descriptions[locale] || descriptions.tr,
  });
}

export default async function EnglishSpeakingMechanicPage({ params }) {
  const { locale } = await params;

  const h1Titles = {
    tr: 'Fethiye İngilizce Konuşan Oto Tamircisi',
    en: 'English Speaking Auto Mechanic in Fethiye',
    ru: 'Англоговорящий Автомеханик в Фетхие',
    uk: 'Англомовний Автомеханік у Фетхіє',
    ar: 'ميكانيكي سيارات يتحدث الإنجليزية في فتحية',
  };

  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>{h1Titles[locale] || h1Titles.tr}</h1>
          
          <div className="answer-first-block" style={{ backgroundColor: 'rgba(255, 215, 0, 0.05)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--gold)', marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: 0 }}>
              <strong>Yes - Bursalı Oto Servis is an English-speaking car mechanic in Fethiye.</strong> We offer premium auto repair, computerized diagnostics, and 24/7 towing services for expats and tourists without any language barriers or "tourist pricing." Call or WhatsApp us at +90 554 881 20 21 for immediate assistance.
            </p>
          </div>

          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Are you an expat or tourist in Fethiye facing car troubles? Do not let the language barrier add to your stress. <strong>Bursalı Oto Servis</strong> provides reliable, premium auto repair services with mechanics who speak <strong>fluent English and Russian</strong>.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Our Services for Foreigners</h2>
          <ul style={{ listStyleType: 'disc', marginLeft: '2rem', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            <li><strong>24/7 Towing & Roadside Assistance:</strong> Stranded? Send us your location via WhatsApp and we will pick you up anywhere in Fethiye or surrounding areas.</li>
            <li><strong>Transparent Pricing:</strong> No "tourist prices." We provide a clear quote and wait for your approval before starting any repair.</li>
            <li><strong>Luxury Car Experts:</strong> We specialize in European luxury cars including BMW, Mercedes-Benz, Audi, Porsche, Volvo, and Range Rover.</li>
            <li><strong>Computerized Diagnostics:</strong> We use original OEM diagnostic tools to find the exact issue without guesswork.</li>
          </ul>

          <h2 style={{ marginBottom: '1.5rem', color: 'var(--gold)', marginTop: '2rem' }}>Frequently Asked Questions</h2>
          <div className="faq-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Do you have mechanics who speak fluent English in Fethiye?</h3>
              <p style={{ color: 'var(--text-muted)' }}>Yes, our team at Bursalı Oto Servis includes mechanics and service advisors who speak fluent English and Russian to assist tourists and expats comfortably.</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>How fast can your tow truck arrive?</h3>
              <p style={{ color: 'var(--text-muted)' }}>Once we receive your location, our tow truck departs immediately. We have 3 tow trucks in our fleet, so there are no extra waiting times. Arrival time depends on distance.</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Can you repair luxury cars like Porsche, BMW, or Mercedes?</h3>
              <p style={{ color: 'var(--text-muted)' }}>Absolutely. With over 50 years of family expertise and 20 years of active experience, we specialize in premium European brands using original diagnostic tools like PIWIS and ODIS.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <a href="https://wa.me/905548812021?text=Hello,%20I%20need%20help%20with%20my%20car." className="btn btn-gold">WhatsApp Us Now (We Speak English)</a>
            <a href="tel:+905548812021" className="btn btn-primary">Call: +90 554 881 20 21</a>
            <a href="/" className="btn btn-gold" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>Return Home</a>
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
              "name": "Bursalı Oto Servis - English Speaking Mechanic",
              "description": "English speaking auto mechanic in Fethiye. 24/7 towing and car repair for tourists and expats.",
              "knowsLanguage": ["en", "tr", "ru"]
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Do you have mechanics who speak fluent English in Fethiye?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, our team at Bursalı Oto Servis includes mechanics and service advisors who speak fluent English and Russian to assist tourists and expats comfortably."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How fast can your tow truck arrive?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Once we receive your location, our tow truck departs immediately. We have 3 tow trucks in our fleet, so there are no extra waiting times. Arrival time depends on distance."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can you repair luxury cars like Porsche, BMW, or Mercedes?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely. With over 50 years of family expertise and 20 years of active experience, we specialize in premium European brands using original diagnostic tools like PIWIS and ODIS."
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

export const metadata = {
  title: 'English Speaking Auto Mechanic in Fethiye | Car Repair',
  description: 'Looking for an English-speaking auto mechanic in Fethiye? We offer premium car repair, 24/7 towing, and transparent pricing for expats and tourists.',
  alternates: {
    canonical: 'https://www.bursaliotoservis.com/english-speaking-mechanic',
  }
};

export default function EnglishSpeakingMechanicPage() {
  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>English Speaking Auto Mechanic in Fethiye</h1>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Are you an expat or tourist in Fethiye facing car troubles? Do not let the language barrier add to your stress. <strong>Bursalı Oto Servis</strong> provides reliable, premium auto repair services with mechanics who speak <strong>fluent English and Russian</strong>.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Our Services for Foreigners</h2>
          <ul style={{ listStyleType: 'disc', marginLeft: '2rem', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            <li><strong>24/7 Towing & Roadside Assistance:</strong> Stranded? Send us your location via WhatsApp and we will pick you up anywhere in Fethiye or surrounding areas.</li>
            <li><strong>Transparent Pricing:</strong> No "tourist prices." We provide a clear quote and wait for your approval before starting any repair.</li>
            <li><strong>Luxury Car Experts:</strong> We specialize in European luxury cars including BMW, Mercedes-Benz, Audi, Porsche, Volvo, and Range Rover.</li>
            <li><strong>Computerized Diagnostics:</strong> We use original OEM diagnostic tools to find the exact issue without guesswork.</li>
          </ul>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Why Choose Us?</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            We understand that repairing a car in a foreign country can be daunting. All our services and original parts are backed by a satisfaction guarantee. While you wait, you can relax in our secure, camera-monitored facility.
          </p>

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
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoRepair",
            "name": "Bursalı Oto Servis - English Speaking Mechanic",
            "description": "English speaking auto mechanic in Fethiye. 24/7 towing and car repair for tourists and expats.",
            "knowsLanguage": ["en", "tr", "ru"]
          })
        }}
      />
    </main>
  );
}

export const metadata = {
  title: 'Porsche, Mercedes, BMW, Audi Özel Servis Fethiye | Bursalı Oto',
  description: 'Fethiye\'de Porsche, Mercedes, BMW ve Audi premium araçlarınız için orijinal PIWIS, ODIS arıza tespiti ve garantili bakım onarım servisi. Deneme yanılma yok, kesin çözüm.',
  alternates: {
    canonical: 'https://www.bursaliotoservis.com/porsche-mercedes-ozel-servis',
  }
};

export default function PorscheMercedesPage() {
  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Fethiye Premium Araç Özel Servisi (Porsche & Alman Grubu)</h1>
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

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <a href="tel:+905548812021" className="btn btn-primary">Hemen Uzmana Danış: 0554 881 20 21</a>
            <a href="/" className="btn btn-gold">Ana Sayfaya Dön</a>
          </div>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          })
        }}
      />
    </main>
  );
}

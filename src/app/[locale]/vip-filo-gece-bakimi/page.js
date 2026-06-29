export const metadata = {
  title: 'Fethiye VIP Vito & Crafter Filo Bakımı (Night-Shift) | Bursalı Oto',
  description: 'Fethiye turizm acenteleri ve VIP transfer firmaları için Vito, Crafter, Transporter araçlarda gece vardiyası bakım, DPF temizliği ve filo tamir hizmeti.',
  alternates: {
    canonical: 'https://www.bursaliotoservis.com/vip-filo-gece-bakimi',
  }
};

export default function VipFleetPage() {
  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Fethiye VIP Transfer ve Turizm Filo Bakımı (Night-Shift)</h1>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Fethiye, Göcek ve Dalaman bölgesindeki turizm acenteleri ve VIP transfer firmaları için araç yatmasına son veriyoruz. <strong>Mercedes Vito, Sprinter, VW Transporter ve Crafter</strong> gibi ticari filolarınızın bakımlarını "Night-Shift" (Gece Vardiyası) sistemimizle gece yapıyor, sabah işinize devam etmenizi sağlıyoruz.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Ticari Filolara Özel Hizmetlerimiz</h2>
          <ul style={{ listStyleType: 'disc', marginLeft: '2rem', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            <li><strong>Gece Vardiyası Bakımı:</strong> Araçlarınız gündüz para kazansın, gece biz bakımını yapalım.</li>
            <li><strong>DPF ve Partikül Filtre Temizliği:</strong> Sürekli klima açık rölantide bekleyen VIP araçların en büyük sorunu olan DPF tıkanıklıklarını garantili çözüyoruz.</li>
            <li><strong>Şanzıman ve Yürüyen Aksam:</strong> Yüksek kilometre yapan ticari araçların ağır mekanik revizyonları (Baskı balata, kavrama, volant değişimi).</li>
            <li><strong>Periyodik Bakım:</strong> Orijinal veya kaliteli yan sanayi (OEM) filtre ve onaylı yağlar ile uzun ömürlü motor bakımı.</li>
          </ul>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Kurumsal Anlaşma Avantajları</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Filonuzdaki araç sayısına göre özel indirimler, öncelikli onarım hakkı ve 7/24 ücretsiz Fethiye içi çekici desteği gibi kurumsal anlaşma avantajlarımızdan faydalanmak için bizimle iletişime geçin.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <a href="tel:+905548812021" className="btn btn-primary">Kurumsal Teklif Al: 0554 881 20 21</a>
            <a href="/" className="btn btn-gold">Ana Sayfaya Dön</a>
          </div>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "VIP Filo Gece Bakımı",
            "audience": {
              "@type": "BusinessAudience",
              "name": "Turizm ve Transfer Firmaları"
            }
          })
        }}
      />
    </main>
  );
}

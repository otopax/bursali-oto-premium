export const metadata = {
  title: 'Otomatik Şanzıman Tamiri ve Revizyonu Fethiye | Bursalı Oto',
  description: 'Fethiye\'de Volvo, BMW, Mercedes ve VAG grubu araçlarınız için Aisin, DCT, DSG otomatik şanzıman tamiri ve garantili beyin revizyonu uzmanı.',
  alternates: {
    canonical: 'https://www.bursaliotoservis.com/otomatik-sanziman-tamiri',
  }
};

export default function TransmissionPage() {
  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Fethiye Otomatik Şanzıman Tamiri ve Revizyonu</h1>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Volvo (Aisin), VW Grubu (DSG), BMW (ZF) ve Mercedes-Benz araçlarınızın en kritik parçası olan otomatik şanzımanları, mikronluk hassasiyetle ve <strong>%100 garantili</strong> olarak revize ediyoruz. Vites geçişlerinde vuruntu, titreme veya ses varsa uzman kadromuza güvenebilirsiniz.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Uzmanlık Alanlarımız</h2>
          <ul style={{ listStyleType: 'disc', marginLeft: '2rem', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            <li><strong>Tork Konvertörlü Şanzımanlar:</strong> Özellikle Volvo, Peugeot ve BMW araçlarda kullanılan Aisin ve ZF şanzımanların bakım ve onarımı.</li>
            <li><strong>Çift Kavrama (DSG / EDC / DCT):</strong> VAG grubu araçlarda sıkça karşılaşılan kavrama bitmesi, mekatronik (şanzıman beyni) arızaları.</li>
            <li><strong>Şanzıman Beyni Tamiri ve Kodlama:</strong> Elektronik arızaların orijinal cihazlarla teşhisi ve yazılım güncellemeleri.</li>
            <li><strong>Dinamik Yağ Değişimi:</strong> Özel makinelerle şanzıman içindeki eski yağın tamamını boşaltarak tam kapasite yeni yağ dolumu.</li>
          </ul>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Neden Geciktirmemelisiniz?</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Otomatik şanzıman arızaları hafife alınmamalıdır. Erken teşhis edilen bir valf gövdesi (şartel) arızası uygun maliyetle çözülebilirken, gecikme durumunda tüm şanzıman dişlilerinin hasar görmesi sonucu binlerce liralık masraf çıkabilir. Bilgisayarlı tespit için servisimize bekliyoruz.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <a href="tel:+905548812021" className="btn btn-primary">Şanzıman Ustasıyla Görüş: 0554 881 20 21</a>
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
            "name": "Otomatik Şanzıman Tamiri",
            "description": "Fethiye otomatik şanzıman, DSG, DCT, Aisin tamiri ve revizyonu.",
            "provider": {
              "@type": "AutoRepair",
              "name": "Bursalı Oto Servis"
            }
          })
        }}
      />
    </main>
  );
}

export const metadata = {
  title: '7/24 Fethiye Oto Çekici ve Yol Yardım | Bursalı Oto',
  description: 'Fethiye ve çevresinde yolda mı kaldınız? 7/24 oto çekici, kurtarma ve yol yardım hizmetimizle anında yanınızdayız. Tek tıkla WhatsApp konum gönderin.',
  alternates: {
    canonical: 'https://www.bursaliotoservis.com/fethiye-7-24-oto-cekici',
  }
};

export default function TowingPage() {
  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem', borderLeft: '4px solid #e11d48' }}>
          <div style={{ display: 'inline-block', background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', padding: '0.5rem 1rem', borderRadius: '100px', fontWeight: 'bold', marginBottom: '1rem' }}>
            🚨 ACİL ÇEKİCİ - 7/24 NÖBETTEYİZ
          </div>
          <h1 style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Fethiye 7/24 Oto Çekici ve Yol Yardım</h1>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Kaza mı yaptınız veya aracınız arıza mı verdi? Hiç panik yapmayın. <strong>Fethiye'nin neresinde olursanız olun</strong> (Göcek, Ölüdeniz, Ovacık, Seydikemer, Yanıklar), GPS donanımlı profesyonel oto kurtarıcı filomuzla 15-30 dakika içerisinde yanınızdayız.
          </p>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Hangi Durumlarda Bizi Arayabilirsiniz?</h2>
          <ul style={{ listStyleType: 'disc', marginLeft: '2rem', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            <li>Trafik kazası sonrası güvenli araç taşıma</li>
            <li>Motor arızası, şanzıman kilitlenmesi veya elektronik hatalar</li>
            <li>Akü bitmesi ve yerinde akü takviyesi</li>
            <li>Premium ve alçak araçların (Air süspansiyonlu) sıfır hasarla transferi</li>
          </ul>

          <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Neden Bizi Seçmelisiniz?</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Sadece bir "çekici" değiliz. Aracınızı güvenle alıp doğrudan Fethiye'deki kendi tam donanımlı servisimize (Bursalı Oto Servis) getiriyor, 7/24 kameralı otoparkımızda muhafaza edip ertesi gün onarımına başlıyoruz.
          </p>

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
          __html: JSON.stringify({
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
          })
        }}
      />
    </main>
  );
}

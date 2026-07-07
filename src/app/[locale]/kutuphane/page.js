export const metadata = {
  title: 'Teknik Kütüphane | Bursalı Oto',
  description: 'Uzmanlar için interaktif teknik veritabanı. Yapım aşamasında.',
};

export default async function KutuphaneHub({ params }) {
  const { locale } = await params;

  return (
    <main style={{ height: '100vh', paddingTop: '80px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '20px', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>🚧</h1>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>Kütüphane Yapım Aşamasında</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', lineHeight: '1.6' }}>
          Değerli müşterilerimiz, sizlere daha iyi bir dijital deneyim sunabilmek için Teknik Kütüphane altyapımızı güncelliyoruz.<br/><br/>
          <strong style={{ color: 'var(--accent-gold)' }}>En kısa zamanda hizmetinizde olacağız!</strong>
        </p>
        <a href={`/${locale}`} style={{ display: 'inline-block', marginTop: '2rem', padding: '1rem 2rem', background: 'var(--primary)', color: '#000', fontWeight: 'bold', borderRadius: '50px', textDecoration: 'none' }}>
          Anasayfaya Dön
        </a>
      </div>
    </main>
  );
}

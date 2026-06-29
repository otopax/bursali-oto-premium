import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '6rem', color: 'var(--accent-gold)', marginBottom: '0', lineHeight: '1' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Sayfa Bulunamadı</h2>
      <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '500px' }}>
        Aradığınız sayfayı bulamadık. Belki de bu arıza kodu sistemimizde yoktur veya sayfa taşınmıştır.
      </p>
      <Link href="/" className="btn btn-gold" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', textDecoration: 'none', borderRadius: '50px', display: 'inline-block' }}>
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}

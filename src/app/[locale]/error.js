'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Uygulama Hatası:', error);
  }, [error]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '3rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>Bir Şeyler Ters Gitti!</h2>
      <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Sistemsel bir hata oluştu. Sanal İbrahim Usta durumu inceliyor.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => reset()}
          className="btn btn-gold"
          style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', cursor: 'pointer', border: 'none', borderRadius: '50px' }}
        >
          Tekrar Dene
        </button>
        <Link href="/" className="btn" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', textDecoration: 'none', borderRadius: '50px' }}>
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}

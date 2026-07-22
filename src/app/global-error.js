'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global Error Boundary caught an error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#09090b',
          color: '#f8fafc',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1 style={{ fontSize: '3rem', color: '#e11d48', marginBottom: '1rem' }}>Kritik Bir Hata Oluştu</h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '2rem', maxWidth: '600px' }}>
            Sistemde beklenmeyen bir hata meydana geldi. Teknik ekibimiz durumdan haberdar edildi.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => reset()} 
              style={{
                padding: '0.8rem 1.5rem',
                backgroundColor: 'var(--accent-gold, #d4af37)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Tekrar Dene
            </button>
            <a 
              href="/"
              style={{
                padding: '0.8rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Ana Sayfaya Dön
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

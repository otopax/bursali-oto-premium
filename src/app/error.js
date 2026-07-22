'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Local Error Boundary caught an error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: 'transparent'
    }}>
      <h2 style={{ fontSize: '2rem', color: '#e11d48', marginBottom: '1rem' }}>Bir Şeyler Yanlış Gitti</h2>
      <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '2rem', maxWidth: '500px' }}>
        Bu sayfayı yüklerken beklenmeyen bir sorun oluştu.
      </p>
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
    </div>
  );
}

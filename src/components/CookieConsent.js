'use client';

// KVKK/GDPR çerez onay bandı (R3). Kullanıcı karar verene kadar analitik çerezler
// (Google Analytics) yüklenmez — bkz. GoogleAnalytics bileşeni.
// Karar localStorage'da 'kvkk-consent' = 'accepted' | 'rejected' olarak saklanır.

import { useEffect, useState } from 'react';

export default function CookieConsent({ locale = 'tr' }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Daha önce karar verilmemişse bandı göster
    if (!window.localStorage.getItem('kvkk-consent')) {
      setVisible(true);
    }
  }, []);

  const decide = (value) => {
    window.localStorage.setItem('kvkk-consent', value);
    // GoogleAnalytics bileşeni bu event ile yeniden değerlendirir
    window.dispatchEvent(new Event('kvkk-consent-changed'));
    setVisible(false);
  };

  if (!visible) return null;

  const gizlilikHref = `/${locale}/gizlilik`;

  return (
    <div
      role="dialog"
      aria-label="Çerez onayı"
      style={{
        position: 'fixed',
        left: '1rem',
        right: '1rem',
        bottom: '1rem',
        zIndex: 9999,
        maxWidth: '640px',
        margin: '0 auto',
        padding: '1.1rem 1.25rem',
        borderRadius: '14px',
        background: 'rgba(20, 20, 24, 0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        color: '#eaeaea',
        fontSize: '0.9rem',
        lineHeight: 1.5,
      }}
    >
      <p style={{ margin: '0 0 0.85rem' }}>
        Bu sitede deneyiminizi iyileştirmek ve trafiği analiz etmek için çerezler
        kullanıyoruz. Analitik çerezler yalnızca onayınızla çalışır. Ayrıntılar için{' '}
        <a href={gizlilikHref} style={{ color: '#d4af37', textDecoration: 'underline' }}>
          Gizlilik ve Çerez Politikası
        </a>
        .
      </p>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => decide('accepted')}
          style={{
            flex: '1 1 auto',
            padding: '0.6rem 1rem',
            borderRadius: '9px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #d4af37, #b8860b)',
            color: '#1a1a1a',
          }}
        >
          Kabul Et
        </button>
        <button
          onClick={() => decide('rejected')}
          style={{
            flex: '1 1 auto',
            padding: '0.6rem 1rem',
            borderRadius: '9px',
            cursor: 'pointer',
            fontWeight: 600,
            background: 'transparent',
            color: '#eaeaea',
            border: '1px solid rgba(255,255,255,0.35)',
          }}
        >
          Yalnızca Zorunlu
        </button>
      </div>
    </div>
  );
}

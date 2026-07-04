'use client';

// Sentry doğrulama sayfası (Faz A / Görev 5)
// Kullanıcı /sentry-example-page adresine girip butona bastığında:
//  - client-side hata fırlar → Sentry client SDK yakalar
//  - fetch üzerinden server API'yi tetikler → server-side hata fırlar → Sentry server SDK yakalar
// Sentry Issues panelinde iki hata da 1-2 dakikada görünmeli.
// DSN yoksa hatalar sadece console'a düşer, Sentry no-op.

import { useState } from 'react';

export default function SentryTestPage() {
  const [status, setStatus] = useState(null);

  const triggerClientError = () => {
    // Bilinçli olarak fırlatılan hata — Sentry yakalayacak
    throw new Error('Sentry test hatası (client) — bu bilinçli üretilmiştir.');
  };

  const triggerServerError = async () => {
    setStatus('Server hatası tetikleniyor...');
    try {
      const res = await fetch('/sentry-example-api', { method: 'GET' });
      const data = await res.json();
      setStatus(`Beklenmedik başarı: ${JSON.stringify(data)}`);
    } catch (e) {
      setStatus(`Server hatası tetiklendi: ${e.message}`);
    }
  };

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: 800, margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>Sentry Test Sayfası</h1>
      <p>Bu sayfa sadece Sentry'nin çalıştığını doğrulamak içindir. Prod'da kullanıcılara gösterilmemeli
      (deploy sonrası bu klasörü silebilirsin veya <code>robots.txt</code>'te disallow yaptık zaten).</p>

      <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
        <button
          onClick={triggerClientError}
          style={{ padding: '12px 20px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          Client Hatası Fırlat
        </button>
        <button
          onClick={triggerServerError}
          style={{ padding: '12px 20px', background: '#d4af37', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          Server Hatası Fırlat
        </button>
      </div>

      {status && (
        <p style={{ marginTop: 20, padding: 12, background: '#f3f4f6', borderRadius: 8 }}>{status}</p>
      )}

      <div style={{ marginTop: 40, padding: 16, background: '#fef3c7', borderRadius: 8, fontSize: 14 }}>
        <strong>Doğrulama:</strong> Butona bastıktan sonra Sentry Issues panelinde
        (sentry.io) 1-2 dakika içinde bu hatayı görmeliisin. Görünmüyorsa <code>SENTRY_DSN</code> env
        variable'ı sunucuda tanımlı mı kontrol et.
      </div>
    </main>
  );
}

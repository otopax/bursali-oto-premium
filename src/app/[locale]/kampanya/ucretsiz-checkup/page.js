"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/tracking';

export default function CampaignPage() {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Gerçek bir bitiş tarihi ayarlayın. (Örn: 31 Temmuz 2026 23:59:59)
    const targetDate = new Date('2026-07-31T23:59:59').getTime();
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      return difference > 0 ? Math.floor(difference / 1000) : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const days = Math.floor(timeLeft / (3600 * 24));
  const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <main style={{ minHeight: '100vh', background: '#09090b', position: 'relative', overflow: 'hidden' }}>
      {/* Background Accent */}
      <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '100vw', height: '500px', background: 'radial-gradient(ellipse at center, rgba(220,38,38,0.15) 0%, rgba(9,9,11,0) 70%)', zIndex: 0, pointerEvents: 'none' }}></div>

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10 text-center">
        
        {/* Warning Badge */}
        <div className="inline-block bg-red-600/20 text-red-500 border border-red-500/50 px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase mb-6 animate-pulse">
          Sınırlı Süreli Kampanya
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
          İlk Kez Gelen Müşterilerimize Özel <br/>
          <span className="text-[var(--accent-gold)]">Ücretsiz Bilgisayarlı Arıza Tespiti</span> (Check-Up)
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Aracınızdaki gizli arızaları, yolda kalmadan önce tespit edelim. Normalde 1.500 TL olan "Orijinal Cihazla Arıza Tespiti" sadece bugüne özel ücretsiz!
        </p>

        {/* Countdown Timer */}
        <div className="flex justify-center gap-4 mb-12">
          <div className="bg-black/50 border border-white/10 rounded-xl p-4 w-20 md:w-24">
            <div className="text-3xl md:text-5xl font-bold text-white mb-1">{days}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Gün</div>
          </div>
          <div className="bg-black/50 border border-white/10 rounded-xl p-4 w-20 md:w-24">
            <div className="text-3xl md:text-5xl font-bold text-white mb-1">{hours}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Saat</div>
          </div>
          <div className="bg-black/50 border border-white/10 rounded-xl p-4 w-20 md:w-24">
            <div className="text-3xl md:text-5xl font-bold text-white mb-1">{minutes}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Dakika</div>
          </div>
          <div className="bg-black/50 border border-white/10 rounded-xl p-4 w-20 md:w-24">
            <div className="text-3xl md:text-5xl font-bold text-red-500 mb-1">{seconds}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Saniye</div>
          </div>
        </div>

        {/* Massive CTA */}
        <a 
          href="https://wa.me/905548812021?text=Merhaba,%20%C3%BCcretsiz%20ar%C4%B1za%20tespiti%20kampanyas%C4%B1ndan%20yararlanmak%20istiyorum." 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => trackEvent('kampanya_cta', { location: 'ucretsiz_checkup' })}
          className="inline-flex flex-col items-center justify-center bg-green-500 hover:bg-green-600 text-black font-black text-2xl py-5 px-12 rounded-2xl transition-transform hover:scale-105 shadow-[0_0_40px_rgba(34,197,94,0.4)] mb-8"
        >
          <span>Hemen WhatsApp'tan Randevu Al</span>
          <span className="text-sm font-normal opacity-80 mt-1">Sadece %100 Gerçek Müşteriler İçin</span>
        </a>
        <p className="text-sm text-gray-500">Bugün itibariyle son 3 kişilik kota kaldı.</p>
      </div>

      {/* Social Proof */}
      <div className="bg-black/30 border-y border-white/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-white mb-10">Bizi Neden Tercih Etmelisiniz?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="text-4xl mb-4">🖥️</div>
              <h4 className="text-lg font-bold text-[var(--accent-gold)] mb-2">Markaya Özel Cihazlar</h4>
              <p className="text-gray-400 text-sm">BMW, Mercedes, Porsche ve VAG grubu için sanayi tipi değil, fabrika lisanslı cihazlar kullanıyoruz.</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="text-lg font-bold text-[var(--accent-gold)] mb-2">Şeffaf Fiyatlandırma</h4>
              <p className="text-gray-400 text-sm">Sürpriz fatura yok. Arızanızı tespit ettikten sonra size net fiyat çıkarıyoruz, onaylamadan işlem yapmıyoruz.</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-4">⚙️</div>
              <h4 className="text-lg font-bold text-[var(--accent-gold)] mb-2">%100 Garantili Çözüm</h4>
              <p className="text-gray-400 text-sm">Deneme yanılma ile değil, nokta atışı çözümle aracınızın arızasını tek seferde gideriyoruz.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

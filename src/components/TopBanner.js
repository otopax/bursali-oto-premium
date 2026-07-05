"use client";

import { useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/tracking';

export default function TopBanner({ locale }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[var(--accent-gold)] text-black font-bold text-sm text-center py-2 px-4 relative z-[9999] shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
        <span>🎉 {locale === 'tr' ? 'Yeni Müşterilerimize Özel İlk Bakımda %15 İndirim Fırsatı!' : '15% Off Your First Maintenance Service!'}</span>
        <a 
          href={`https://wa.me/905548812021?text=${encodeURIComponent(locale === 'tr' ? 'Merhaba, ilk bakım %15 indirim kampanyasından faydalanmak istiyorum.' : 'Hello, I want to use the 15% discount for first maintenance.')}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('whatsapp_tiklama', { type: 'top_banner_campaign' })}
          className="bg-black text-white text-xs px-3 py-1 rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap"
        >
          {locale === 'tr' ? 'Hemen Randevu Al' : 'Book Now'}
        </a>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-black/50 hover:text-black p-2"
        aria-label="Kapat"
      >
        ✕
      </button>
    </div>
  );
}

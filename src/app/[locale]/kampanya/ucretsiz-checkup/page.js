"use client";

import Link from 'next/link';
import { trackEvent } from '@/lib/tracking';
import { useParams } from 'next/navigation';

export default function CampaignPage() {
  const params = useParams();
  const locale = params?.locale || 'tr';

  const h1Titles = {
    tr: <>İlk Kez Gelen Müşterilerimize Özel <br/><span className="text-[var(--accent-gold)]">Ücretsiz Bilgisayarlı Arıza Tespiti</span> (Check-Up)</>,
    en: <>Special for First-Time Customers <br/><span className="text-[var(--accent-gold)]">Free Computer Diagnostics</span> (Check-Up)</>,
    ru: <>Специально для Новых Клиентов <br/><span className="text-[var(--accent-gold)]">Бесплатная Компьютерная Диагностика</span> (Check-Up)</>,
    uk: <>Спеціально для Нових Клієнтів <br/><span className="text-[var(--accent-gold)]">Безкоштовна Комп'ютерна Діагностика</span> (Check-Up)</>,
    ar: <>خاص للعملاء الجدد <br/><span className="text-[var(--accent-gold)]">فحص كمبيوتر مجاني</span> (Check-Up)</>
  };
  return (
    <main style={{ minHeight: '100vh', background: '#09090b', position: 'relative', overflow: 'hidden' }}>
      {/* Background Accent */}
      <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '100vw', height: '500px', background: 'radial-gradient(ellipse at center, rgba(220,38,38,0.15) 0%, rgba(9,9,11,0) 70%)', zIndex: 0, pointerEvents: 'none' }}></div>

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10 text-center">
        
        {/* Badge */}
        <div className="inline-block bg-red-600/20 text-red-500 border border-red-500/50 px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase mb-6">
          Online'a Özel Kampanya
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
          {h1Titles[locale] || h1Titles.tr}
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Aracınızdaki gizli arızaları, yolda kalmadan önce tespit edelim. "Orijinal Cihazla Arıza Tespiti" hizmetimiz tanışmaya özel ücretsiz!
        </p>

        {/* Massive CTA */}
        <a 
          href="https://wa.me/905548812021?text=Merhaba,%20%C3%BCcretsiz%20ar%C4%B1za%20tespiti%20kampanyas%C4%B1ndan%20yararlanmak%20istiyorum." 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => trackEvent('kampanya_cta', { location: 'ucretsiz_checkup' })}
          className="inline-flex flex-col items-center justify-center bg-green-500 hover:bg-green-600 text-black font-black text-2xl py-5 px-12 rounded-2xl transition-transform hover:scale-105 shadow-[0_0_40px_rgba(34,197,94,0.4)] mb-8"
        >
          <span>Hemen WhatsApp'tan Randevu Al</span>
        </a>
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

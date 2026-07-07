'use client';
import React from 'react';
import { FaWhatsapp, FaWrench, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';

export default function ExpertCTA({ brand, reviewCount }) {
  const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP || "905304445566";
  const MAPS_LINK = process.env.NEXT_PUBLIC_MAPS_LINK || "https://maps.google.com/?q=Bursalı+Oto+Servis+Fethiye";
  const WHATSAPP_TEXT = `Merhaba, ${brand ? brand + ' ' : ''}aracımın arızası için sitenizdeki makaleyi okudum, bilgi almak istiyorum.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

  return (
    <div className="expert-cta glass-panel" style={{
      marginTop: '3rem',
      padding: '2.5rem',
      borderRadius: '16px',
      background: 'rgba(24, 24, 27, 0.6)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(0,0,0,0) 70%)',
        borderBottomLeftRadius: '100%',
        zIndex: 0
      }}></div>

      <div className="flex flex-col md:flex-row gap-6 items-center relative z-10">
        <div className="flex-shrink-0">
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: '#1a1a1a',
            border: '2px solid var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(212,175,55,0.2)'
          }}>
            <FaWrench size={40} color="var(--accent-gold)" />
          </div>
        </div>

        <div className="flex-grow text-center md:text-left">
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-light)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Uzmanından Destek Alın
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1rem', lineHeight: '1.5' }}>
            20 yıllık Alman otomobilleri tecrübemiz ve orijinal arıza tespit cihazlarımızla {brand ? brand + ' ' : ''}aracınızın sorununu Fethiye'deki profesyonel servisimizde garantili olarak çözüyoruz.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
            <span className="flex items-center gap-2 text-sm text-gray-300">
              <FaCheckCircle color="var(--accent-gold)" /> Garantili Onarım
            </span>
            <span className="flex items-center gap-2 text-sm text-gray-300">
              <FaCheckCircle color="var(--accent-gold)" /> Orijinal Teşhis (Xentry/ISTA/PIWIS)
            </span>
            <span className="flex items-center gap-2 text-[var(--accent-gold)]">
              ⭐ {reviewCount || 124} Gerçek Müşteri Yorumu
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-gold)] hover:bg-yellow-500 text-black font-bold rounded-xl transition-all"
            >
              <FaMapMarkerAlt size={20} />
              Yol Tarifi Al
            </a>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1ebd57] text-white font-bold rounded-xl transition-all"
              style={{ boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)' }}
            >
              <FaWhatsapp size={20} />
              WhatsApp
            </a>
            <a 
              href="/sanal-usta"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1a1a1a] hover:bg-[#222] border border-[var(--accent-gold)] text-[var(--accent-gold)] font-bold rounded-xl transition-all"
            >
              Sanal Usta
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

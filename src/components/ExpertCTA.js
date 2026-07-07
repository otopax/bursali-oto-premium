'use client';
import React from 'react';
import { FaWhatsapp, FaWrench, FaCheckCircle, FaMapMarkerAlt, FaRobot } from 'react-icons/fa';

export default function ExpertCTA({ brand, reviewCount }) {
  const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP || "905548812021";
  const MAPS_LINK = process.env.NEXT_PUBLIC_MAPS_LINK || "https://maps.google.com/?cid=1836972871363186886";
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

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: '#1a1a1a',
            border: '2px solid var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(212,175,55,0.2)'
          }}>
            <FaWrench size={35} color="var(--accent-gold)" />
          </div>
        </div>

        <div style={{ flexGrow: 1 }}>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--text-light)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Uzmanından Destek Alın
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '800px' }}>
            20 yıllık Alman otomobilleri tecrübemiz ve orijinal arıza tespit cihazlarımızla {brand ? brand + ' ' : ''}aracınızın sorununu Fethiye'deki profesyonel servisimizde garantili olarak çözüyoruz.
          </p>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1.5rem', 
            marginBottom: '2rem' 
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: '#d1d5db', fontWeight: '500' }}>
              <FaCheckCircle color="var(--accent-gold)" size={16} /> Garantili Onarım
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: '#d1d5db', fontWeight: '500' }}>
              <FaCheckCircle color="var(--accent-gold)" size={16} /> Orijinal Teşhis (Xentry/ISTA/PIWIS)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
              ⭐ {reviewCount || 124} Gerçek Müşteri Yorumu
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1rem' 
          }}>
            <a 
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ 
                background: 'var(--accent-gold)', 
                color: '#000', 
                gap: '0.5rem', 
                borderRadius: '12px', 
                padding: '0.8rem 1.5rem',
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)'
              }}
            >
              <FaMapMarkerAlt size={18} />
              Yol Tarifi Al
            </a>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ 
                background: '#25D366', 
                color: '#fff', 
                gap: '0.5rem', 
                borderRadius: '12px', 
                padding: '0.8rem 1.5rem',
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
              }}
            >
              <FaWhatsapp size={20} />
              WhatsApp
            </a>
            <a 
              href="/sanal-usta"
              className="btn btn-gold"
              style={{ 
                gap: '0.5rem', 
                borderRadius: '12px',
                padding: '0.8rem 1.5rem',
                fontSize: '1rem'
              }}
            >
              <FaRobot size={18} />
              Sanal Usta
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

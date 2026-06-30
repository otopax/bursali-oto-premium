"use client";

import { useState } from 'react';

export default function Chatbot() {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    const currentPath = window.location.pathname;
    const locale = currentPath.startsWith('/en') ? 'en' : 'tr';
    window.location.href = `/${locale}/sanal-usta`;
  };

  return (
    <>
      <button 
        onClick={handleClick}
        style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '80px', 
          backgroundColor: 'var(--accent-gold)', 
          color: 'black', 
          width: '70px',
          height: '70px',
          borderRadius: '50%', 
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.5)', 
          zIndex: 1000, 
          border: '3px solid #111', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          animation: 'bounce 2s infinite, pulseGold 3s infinite',
          transition: 'transform 0.3s',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)'
        }}
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
        aria-label="Sanal Usta"
      >
        <div style={{ position: 'absolute', top: '-15px', right: '-15px', background: '#e11d48', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px', border: '2px solid #000', whiteSpace: 'nowrap', animation: 'wiggle 2s infinite' }}>
          Usta'ya Sor!
        </div>
        
        <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="4" width="14" height="12" rx="3" fill="#000"></rect>
          <circle cx="9" cy="9" r="1.5" fill="var(--accent-gold)" stroke="none"></circle>
          <circle cx="15" cy="9" r="1.5" fill="var(--accent-gold)" stroke="none"></circle>
          <path d="M9 13c1 1 3 1 6 0" stroke="var(--accent-gold)"></path>
          <line x1="12" y1="1" x2="12" y2="4"></line>
          <circle cx="12" cy="1" r="1"></circle>
          <path d="M14.7 18.5l2.6 2.6c.4.4 1 .4 1.4 0l.7-.7c.4-.4.4-1 0-1.4l-2.6-2.6"></path>
          <path d="M11 16l-4 4"></path>
          <path d="M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"></path>
        </svg>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes pulseGold {
            0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(212, 175, 55, 0); }
            100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
          }
        `}} />
      </button>
    </>
  );
}

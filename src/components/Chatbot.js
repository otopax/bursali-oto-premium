"use client";

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      { id: 'welcome', role: 'assistant', content: 'Merhaba, ben Sanal İbrahim Usta. Aracınızda ne gibi bir şikayetiniz var? Size nasıl yardımcı olabilirim?' }
    ]
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {isOpen && (
        <div style={{ position: 'fixed', bottom: '100px', right: '30px', width: '450px', height: '650px', backgroundColor: '#050505', border: '1px solid var(--accent-gold)', borderRadius: '16px', zIndex: 1001, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 15px 40px rgba(0,0,0,0.6)' }}>
          <div style={{ background: 'var(--accent-gold)', color: 'black', padding: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem' }}>Sanal İbrahim Usta (AI)</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'black' }}>✕</button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {messages.map(m => (
              <div key={m.id} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? 'rgba(212, 175, 55, 0.2)' : '#111', border: m.role === 'user' ? '1px solid var(--accent-gold)' : '1px solid #333', padding: '1rem', borderRadius: '10px', maxWidth: '85%' }}>
                <p style={{ fontSize: '1.05rem', margin: 0, color: '#fff' }}>{m.content}</p>
              </div>
            ))}
            {isLoading && <div style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontStyle: 'italic' }}>Usta yazıyor...</div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '1.2rem', borderTop: '1px solid #333', display: 'flex', gap: '0.8rem', background: '#0a0a0a' }}>
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Arızayı buraya yazın..."
              style={{ flex: 1, padding: '1rem', borderRadius: '6px', border: '1px solid #333', background: '#000', color: '#fff', fontSize: '1.05rem' }}
            />
            <button type="submit" style={{ background: 'var(--accent-gold)', color: 'black', border: 'none', padding: '0 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.05rem' }}>
              Gönder
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button - Sanal Usta */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
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
          transition: 'transform 0.3s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        aria-label="Sanal İbrahim Usta"
      >
        {/* Notification Bubble */}
        {!isOpen && (
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', background: '#e11d48', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px', border: '2px solid #000', whiteSpace: 'nowrap', animation: 'wiggle 2s infinite' }}>
            Usta'ya Sor!
          </div>
        )}
        
        {/* Animated Mechanic Avatar SVG */}
        <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Head */}
          <rect x="5" y="4" width="14" height="12" rx="3" fill="#000"></rect>
          {/* Eyes */}
          <circle cx="9" cy="9" r="1.5" fill="var(--accent-gold)" stroke="none"></circle>
          <circle cx="15" cy="9" r="1.5" fill="var(--accent-gold)" stroke="none"></circle>
          {/* Smile/Mouth */}
          <path d="M9 13c1 1 3 1 6 0" stroke="var(--accent-gold)"></path>
          {/* Antenna */}
          <line x1="12" y1="1" x2="12" y2="4"></line>
          <circle cx="12" cy="1" r="1"></circle>
          {/* Wrench symbol on chest */}
          <path d="M14.7 18.5l2.6 2.6c.4.4 1 .4 1.4 0l.7-.7c.4-.4.4-1 0-1.4l-2.6-2.6"></path>
          <path d="M11 16l-4 4"></path>
          {/* Shoulders */}
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

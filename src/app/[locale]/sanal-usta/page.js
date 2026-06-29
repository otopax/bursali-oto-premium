"use client";

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect } from 'react';

export default function SanalUstaPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: 'Hoş geldin hemşerim. Ben Bursalı Oto\'nun 40 yıllık babadan oğula geçen mekanik hafızasıyla eğitilmiş Sanal Ustasıyım. Aracınızdaki arıza kodunu (Örn: P0171) veya şikayetinizi yazın, kaputu sanal olarak açıp sorunu anında bulalım.'
      }
    ]
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <main className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Sanal İbrahim Usta</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Milyonlarca arıza kodu, sigorta şeması ve tamir kılavuzuyla eğitilmiş Yapay Zeka destekli ustamız hizmetinizde.</p>
      </div>

      <div className="glass-panel hover-gold-border" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        maxWidth: '900px', 
        margin: '0 auto', 
        width: '100%',
        padding: '0',
        overflow: 'hidden',
        height: '70vh'
      }}>
        
        {/* Chat Header */}
        <div style={{ background: 'rgba(212, 175, 55, 0.1)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="4" width="14" height="12" rx="3" fill="#000"></rect>
              <circle cx="9" cy="9" r="1.5" fill="var(--accent-gold)"></circle>
              <circle cx="15" cy="9" r="1.5" fill="var(--accent-gold)"></circle>
              <path d="M9 13c1 1 3 1 6 0" stroke="var(--accent-gold)"></path>
              <path d="M14.7 18.5l2.6 2.6c.4.4 1 .4 1.4 0l.7-.7c.4-.4.4-1 0-1.4l-2.6-2.6"></path>
              <path d="M11 16l-4 4"></path>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--accent-gold)' }}>Yapay Zeka Asistanı</h2>
            <span style={{ fontSize: '0.9rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
              Sistem Aktif
            </span>
          </div>
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map(m => (
            <div key={m.id} style={{ 
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', 
              maxWidth: '80%'
            }}>
              <div style={{
                background: m.role === 'user' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.03)',
                border: m.role === 'user' ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                padding: '1.5rem',
                borderRadius: '16px',
                borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '16px',
              }}>
                {m.content ? (
                   <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-light)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                     {m.content}
                   </p>
                ) : null}
                
                {/* Render tool invocations (optional, for debugging or UI feedback) */}
                {m.toolInvocations?.map(toolInvocation => (
                  <div key={toolInvocation.toolCallId} style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', borderLeft: '3px solid var(--accent-gold)' }}>
                    <span style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '5px', verticalAlign: 'middle' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      Veritabanı Aranıyor: {toolInvocation.toolName === 'searchFaultCode' ? `Arıza Kodu (${toolInvocation.args.code})` : 'Klasörler'}...
                    </span>
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                {m.role === 'user' ? 'Siz' : 'Sanal Usta'}
              </span>
            </div>
          ))}
          {isLoading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.5rem', padding: '1rem' }}>
              <div className="typing-dot" style={{ width: '8px', height: '8px', background: 'var(--accent-gold)', borderRadius: '50%', animation: 'typing 1s infinite 0.1s' }}></div>
              <div className="typing-dot" style={{ width: '8px', height: '8px', background: 'var(--accent-gold)', borderRadius: '50%', animation: 'typing 1s infinite 0.2s' }}></div>
              <div className="typing-dot" style={{ width: '8px', height: '8px', background: 'var(--accent-gold)', borderRadius: '50%', animation: 'typing 1s infinite 0.3s' }}></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Arıza kodunu (örn: P0171) veya araç sorununuzu yazın..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '1.2rem',
                borderRadius: '12px',
                color: 'var(--text-light)',
                fontSize: '1.1rem',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-gold)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <button 
              type="submit" 
              disabled={isLoading || !(input || '').trim()}
              className="btn btn-gold"
              style={{ padding: '0 2rem', fontSize: '1.1rem', opacity: (isLoading || !(input || '').trim()) ? 0.5 : 1 }}
            >
              Sor
            </button>
          </form>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes typing {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
      `}} />
    </main>
  );
}

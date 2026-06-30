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
    <>
      {/* Full-screen Shutter Transition */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        animation: 'shutterTransition 5s cubic-bezier(0.5, 0, 0.2, 1) forwards',
        animationDelay: '1.2s', // Pause slightly longer
        willChange: 'clip-path, transform',
        transformOrigin: 'top',
        // Realistic corrugated metal shutter styling
        backgroundImage: 'repeating-linear-gradient(to bottom, #2a2a2a 0px, #333 10px, #111 20px, #0a0a0a 22px, #2a2a2a 24px)',
        borderBottom: '10px solid #444',
        boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.8), 0 20px 30px rgba(0,0,0,0.9)'
      }}>
        <div style={{ 
          padding: '2rem 4rem', 
          textAlign: 'center'
        }}>
          <h2 style={{ color: 'var(--accent-gold)', letterSpacing: '6px', margin: 0, fontSize: '3.5rem', textShadow: '0 0 15px rgba(212, 175, 55, 0.6)' }}>BURSALI OTO SERVİS</h2>
          <p style={{ color: 'var(--accent-gold)', letterSpacing: '3px', marginTop: '15px', fontSize: '1.8rem', textShadow: '0 0 8px rgba(212, 175, 55, 0.6)' }}>SANAL ATÖLYE AÇILIYOR...</p>
        </div>
      </div>

      <main className="container mx-auto px-4 pt-24 md:pt-32 pb-4 md:pb-16 min-h-[100dvh] flex flex-col">
        
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">Sanal Usta</h1>
          <p className="text-lg md:text-xl text-[var(--text-muted)]">Bursalı Oto'nun 40 yıllık mekanik hafızasıyla donatılmış Yapay Zeka ustası.</p>
        </div>

        {/* Side by Side Layout */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 max-w-6xl mx-auto w-full items-stretch">
          
          {/* Avatar Section (Left) */}
          <div className="glass-panel" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', width: '100%' }}>
               <h2 style={{ 
                 color: 'var(--accent-gold)', 
                 margin: 0, 
                 fontSize: '1.8rem', 
                 letterSpacing: '3px',
                 textShadow: '0 0 10px rgba(212, 175, 55, 0.8), 0 0 20px rgba(212, 175, 55, 0.5), 0 0 30px rgba(212, 175, 55, 0.3)',
                 animation: 'pulseGoldText 2.5s infinite'
               }}>BURSALI OTO SERVİS</h2>
            </div>
            <img 
              src="/avatar_hyper.png" 
              alt="Sanal Usta Avatar" 
              style={{ width: '100%', maxWidth: '260px', borderRadius: '16px', border: '2px solid var(--accent-gold)', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }} 
            />
            <h3 style={{ color: 'var(--text-light)', marginTop: '1.5rem', fontSize: '1.5rem' }}>Sistem: Çevrimiçi</h3>
            <p style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'pulseGreen 2s infinite' }}></span>
              Analiz cihazları hazır.
            </p>
          </div>

          {/* Chat Section (Right) */}
          <div className="glass-panel hover-gold-border flex-2 min-w-full md:min-w-[350px] flex flex-col p-0 overflow-hidden h-[60dvh] md:h-[65vh] w-full">
            
            {/* Chat Header */}
            <div style={{ background: 'rgba(212, 175, 55, 0.1)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--accent-gold)' }}>
                <img src="/avatar_hyper.png" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--text-light)' }}>Arıza Teşhis Ekranı</h2>
              </div>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {messages.map(m => (
                <div key={m.id} style={{ 
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', 
                  maxWidth: '85%'
                }}>
                  <div style={{
                    background: m.role === 'user' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: m.role === 'user' ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                    padding: '1.2rem',
                    borderRadius: '16px',
                    borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
                    borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '16px',
                  }}>
                    {m.content ? (
                       <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-light)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                         {m.content}
                       </p>
                    ) : null}
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
            <div className="p-3 md:p-6 border-t border-white/5 bg-black/40">
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 md:gap-4">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Arıza kodunu veya şikayetinizi yazın..."
                  className="flex-1 bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl text-white text-base md:text-lg outline-none transition-colors focus:border-[var(--accent-gold)]"
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !(input || '').trim()}
                  className="btn btn-gold py-3 px-6 md:px-8 text-base md:text-lg w-full md:w-auto"
                  style={{ opacity: (isLoading || !(input || '').trim()) ? 0.5 : 1 }}
                >
                  Gönder
                </button>
              </form>
            </div>

          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes typing {
            0%, 100% { transform: translateY(0); opacity: 0.5; }
            50% { transform: translateY(-5px); opacity: 1; }
          }
          @keyframes shutterTransition {
            0% { clip-path: inset(0 0 0 0); transform: translateY(0); }
            80% { clip-path: inset(0 0 100% 0); transform: translateY(-100px); }
            100% { clip-path: inset(0 0 100% 0); transform: translateY(-100px); opacity: 0; pointer-events: none; }
          }
          @keyframes pulseGreen {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
          @keyframes pulseGoldText {
            0% { text-shadow: 0 0 10px rgba(212, 175, 55, 0.8), 0 0 20px rgba(212, 175, 55, 0.5); }
            50% { text-shadow: 0 0 15px rgba(212, 175, 55, 1), 0 0 30px rgba(212, 175, 55, 0.8), 0 0 45px rgba(212, 175, 55, 0.5); }
            100% { text-shadow: 0 0 10px rgba(212, 175, 55, 0.8), 0 0 20px rgba(212, 175, 55, 0.5); }
          }
        `}} />
      </main>
    </>
  );
}

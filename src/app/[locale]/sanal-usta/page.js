"use client";

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect, useState } from 'react';
import { generateDiagnosticPDF } from '@/lib/pdfGenerator';
import { trackEvent, AnalyticsEvent } from '@/lib/analytics';

export default function SanalUstaPage() {
  const [isListening, setIsListening] = useState(false);
  const [vehicleContext, setVehicleContext] = useState({
    isRegistered: false,
    brand: '',
    model: '',
    year: '',
    chassis: ''
  });
  const [guestId, setGuestId] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);

  // Form states for VIN Autofill
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formChassis, setFormChassis] = useState('');
  const [vinLoading, setVinLoading] = useState(false);

  const handleVinDecode = async () => {
    if (!formChassis || formChassis.length !== 17) {
      alert("Şasi numarası tam 17 hane olmalıdır.");
      return;
    }
    setVinLoading(true);
    try {
      const res = await fetch('/api/vin-decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin: formChassis })
      });
      const result = await res.json();
      if (result.success && result.data) {
        setFormBrand(result.data.Make || '');
        setFormModel(result.data.Model || '');
        setFormYear(result.data.Year || '');
        // We leave the chassis as is
      } else {
        alert(result.error || 'Şasi numarası çözümlenemedi.');
      }
    } catch (e) {
      alert('Bağlantı hatası.');
    } finally {
      setVinLoading(false);
    }
  };

  useEffect(() => {
    let id = localStorage.getItem('sanalUstaGuestId');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('sanalUstaGuestId', id);
    }
    setGuestId(id);
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: { vehicleContext, guestId },
    initialMessages: [],
    onError: (err) => {
      try {
        if (err.message.includes('guest_quota_exceeded')) {
          setShowLeadForm(true);
        }
      } catch (e) {
        console.error(e);
      }
    }
  });

  // Dinamik ilk mesaj (Araç kayıt edildikten sonra tetiklenecek)
  useEffect(() => {
    if (vehicleContext.isRegistered && messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: `Hoş geldin hemşerim. Ben Bursalı Oto'nun Sanal Ustasıyım. \n\nSisteme kaydettiğin **${vehicleContext.year} ${vehicleContext.brand} ${vehicleContext.model}** ${vehicleContext.chassis ? `(Şasi: ${vehicleContext.chassis})` : ''} aracının fabrika verilerini, kronik sorunlarını ve şanzıman şemalarını hafızama yükledim. \n\nAracındaki arıza kodunu (Örn: P0171) veya şikayetini yaz, kaputu sanal olarak açıp doğrudan senin aracına özel teşhisi yapalım.`
        }
      ]);
    }
  }, [vehicleContext.isRegistered, vehicleContext, setMessages, messages.length]);

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

      <main className="container mx-auto px-4 pt-44 md:pt-32 pb-4 md:pb-16 min-h-[100dvh] flex flex-col relative">
        
        {/* Onboarding Modal Overlay */}
        {!vehicleContext.isRegistered && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.4)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--accent-gold)', marginBottom: '0.5rem', textAlign: 'center' }}>Aracınızı Tanıtın</h2>
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.95rem' }}>
                Sanal Usta'nın doğrudan sizin aracınıza (fabrika verilerine) özel nokta atışı teşhis yapabilmesi için lütfen bilgileri girin.
              </p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                setVehicleContext({
                  isRegistered: true,
                  brand: formBrand,
                  model: formModel,
                  year: formYear,
                  chassis: formChassis
                });
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <input value={formChassis} onChange={e => setFormChassis(e.target.value)} name="chassis" placeholder="Şasi Numarası (VIN) - 17 Hane" className="bg-white/5 border border-white/10 p-3 rounded-lg text-white flex-1 focus:border-[var(--accent-gold)] outline-none transition-colors uppercase" maxLength="17" />
                    <button type="button" onClick={handleVinDecode} disabled={vinLoading} className="btn btn-outline" style={{ padding: '0 1rem', whiteSpace: 'nowrap' }}>
                      {vinLoading ? '⏳' : '🔍 Otomatik Bul'}
                    </button>
                  </div>
                  <small style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>* Şasi numarası (VIN) ile aracınızın marka/model bilgisini otomatik çekebilirsiniz.</small>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input required value={formBrand} onChange={e => setFormBrand(e.target.value)} name="brand" placeholder="Marka (Örn: BMW)" className="bg-white/5 border border-white/10 p-3 rounded-lg text-white w-full focus:border-[var(--accent-gold)] outline-none transition-colors" />
                  <input required value={formModel} onChange={e => setFormModel(e.target.value)} name="model" placeholder="Model (Örn: 320i)" className="bg-white/5 border border-white/10 p-3 rounded-lg text-white w-full focus:border-[var(--accent-gold)] outline-none transition-colors" />
                </div>
                
                <input required value={formYear} onChange={e => setFormYear(e.target.value)} type="number" min="1990" max="2025" name="year" placeholder="Üretim Yılı (Örn: 2018)" className="bg-white/5 border border-white/10 p-3 rounded-lg text-white w-full focus:border-[var(--accent-gold)] outline-none transition-colors" />
                
                <button type="submit" className="btn btn-gold w-full mt-2 py-3 rounded-lg" style={{ fontSize: '1.1rem', letterSpacing: '1px' }}>
                  Sanal Atölyeye Bağlan
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Lead Form Overlay (Guest Quota Exceeded) */}
        {showLeadForm && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--accent-gold)', boxShadow: '0 0 50px rgba(212, 175, 55, 0.2)' }}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--accent-gold)', marginBottom: '1rem', textAlign: 'center' }}>Ücretsiz Limit Doldu</h2>
              <p style={{ color: 'var(--text-light)', textAlign: 'center', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Misafir kullanıcı olarak yapay zeka ile soru sorma limitinize ulaştınız. <br/><br/>
                Arızanızı <b>gerçek ustalarımıza</b> iletmek ve randevu almak için telefon numaranızı bırakın veya hemen bizi arayın.
              </p>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const phone = formData.get('phone');
                
                // Son mesajlardan müşterinin sorununu çıkart (symptoms)
                const userMessages = messages.filter(m => m.role === 'user');
                const lastIssue = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : '';
                
                try {
                  const res = await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      platform: 'SANAL_USTA',
                      phone,
                      vehicle: `${vehicleContext.year} ${vehicleContext.brand} ${vehicleContext.model}`,
                      symptoms: lastIssue
                    })
                  });
                  if(res.ok) {
                    alert("✅ Talebiniz ustamıza başarıyla iletildi! Öncelikli olarak aranacaksınız.");
                    setShowLeadForm(false);
                  } else {
                    alert("Bir hata oluştu, lütfen WhatsApp üzerinden ulaşın.");
                  }
                } catch(err) {
                  alert("Bağlantı hatası, lütfen WhatsApp üzerinden ulaşın.");
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <input required type="tel" name="phone" placeholder="Telefon Numaranız (05XX XXX XX XX)" className="bg-white/5 border border-white/10 p-3 rounded-lg text-white w-full focus:border-[var(--accent-gold)] outline-none" />
                
                <button type="submit" className="btn btn-gold w-full mt-2 py-3 rounded-lg flex items-center justify-center gap-2" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                  <span>📞</span> Ustaya İlet
                </button>

                <a href="https://wa.me/905548812021" className="btn w-full py-3 rounded-lg flex items-center justify-center gap-2 mt-2" style={{ backgroundColor: '#25D366', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  <span>💬</span> WhatsApp'tan Yaz
                </a>
              </form>
            </div>
          </div>
        )}

        <div className="text-center mb-6 md:mb-8" style={{ filter: !vehicleContext.isRegistered ? 'blur(4px)' : 'none', transition: 'filter 0.5s ease' }}>
          <h1 className="text-3xl md:text-5xl font-bold mb-2">Sanal Usta</h1>
          <p className="text-lg md:text-xl text-[var(--text-muted)]">Bursalı Oto'nun 40 yıllık mekanik hafızasıyla donatılmış Yapay Zeka ustası.</p>
        </div>

        {/* Side by Side Layout */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 max-w-6xl mx-auto w-full items-stretch" style={{ filter: !vehicleContext.isRegistered ? 'blur(8px)' : 'none', pointerEvents: !vehicleContext.isRegistered ? 'none' : 'auto', transition: 'filter 0.5s ease' }}>
          
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
                       <div 
                         style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-light)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
                         dangerouslySetInnerHTML={{ __html: m.content }}
                       />
                    ) : null}
                    
                    {m.role === 'assistant' && m.id !== 'welcome-msg' && (
                      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.8rem', fontWeight: 'bold' }}>HIZLI İŞLEM MENÜSÜ</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                          <a href={`https://wa.me/905548812021?text=${encodeURIComponent('Sanal Usta Teşhisi:\n' + (m.content || '').substring(0, 300) + '...')}`} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent(AnalyticsEvent.WHATSAPP_CLICK, { vehicle: vehicleContext.brand })} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '0.6rem 1rem', background: '#25D366', color: '#000', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', flex: '1 1 calc(50% - 0.6rem)' }}>
                            <span style={{ fontSize: '1.1rem' }}>💬</span> WhatsApp'a İlet
                          </a>
                          <button onClick={() => {
                            trackEvent(AnalyticsEvent.PDF_DOWNLOAD, { vehicle: vehicleContext.brand });
                            generateDiagnosticPDF({
                              vin: vehicleContext.chassis,
                              vehicle: `${vehicleContext.year} ${vehicleContext.brand} ${vehicleContext.model}`,
                              diagnosis: m.content,
                              risk: 'Belirlenmedi', // These would ideally be parsed or stored in state if available
                              cost: 'Bilinmiyor',
                              time: 'Bilinmiyor'
                            });
                          }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '0.6rem 1rem', background: '#e11d48', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', flex: '1 1 calc(50% - 0.6rem)', border: 'none', cursor: 'pointer' }}>
                            <span style={{ fontSize: '1.1rem' }}>📄</span> PDF Raporu İndir
                          </button>
                          <a href="tel:+905548812021" onClick={() => trackEvent(AnalyticsEvent.PHONE_CLICK)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', flex: '1 1 calc(50% - 0.6rem)' }}>
                            <span style={{ fontSize: '1.1rem' }}>📞</span> Hemen Ara
                          </a>
                          <button onClick={() => { trackEvent(AnalyticsEvent.BOOKING_COMPLETED); setShowLeadForm(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '0.6rem 1rem', background: 'var(--accent-gold)', color: '#000', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', flex: '1 1 calc(50% - 0.6rem)', border: 'none', cursor: 'pointer' }}>
                            <span style={{ fontSize: '1.1rem' }}>📅</span> Randevu Al
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                    {m.role === 'user' ? 'Siz' : 'Sanal Usta'}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', color: 'var(--accent-gold)' }}>
                  <span style={{ animation: 'spin 2s linear infinite', display: 'inline-block' }}>⚙️</span>
                  <span style={{ fontSize: '0.9rem', fontStyle: 'italic', letterSpacing: '1px' }}>Usta düşünüyor...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-6 border-t border-white/5 bg-black/40">
              {/* Quick Action Chips */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                {["Motor arıza lambası yandı", "Klima soğutmuyor", "Şanzımandan vuruntu sesi geliyor", "Fren yapınca titreme var"].map(chip => (
                  <button key={chip} type="button" onClick={() => handleInputChange({ target: { value: chip } })} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '100px', fontSize: '0.85rem', whiteSpace: 'nowrap', color: '#e2e8f0', transition: 'background 0.2s' }}>
                    {chip}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 md:gap-4 relative">
                <input
                  value={input}
                  onChange={handleInputChange}
                  onFocus={() => {
                    setTimeout(() => {
                      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                    }, 300);
                  }}
                  placeholder={isListening ? "Dinleniyor..." : "Arıza kodunu veya şikayetinizi yazın..."}
                  className="flex-1 bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl text-white text-base md:text-lg outline-none transition-colors focus:border-[var(--accent-gold)]"
                  style={{ paddingRight: '50px' }}
                />
                
                {/* Voice Record Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
                      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                      const recognition = new SpeechRecognition();
                      recognition.lang = 'tr-TR';
                      recognition.interimResults = false;
                      recognition.maxAlternatives = 1;

                      recognition.onstart = () => {
                        setIsListening(true);
                      };

                      recognition.onresult = (event) => {
                        const transcript = event.results[0][0].transcript;
                        handleInputChange({ target: { value: input + " " + transcript } });
                      };

                      recognition.onerror = (event) => {
                        console.error('Speech recognition error', event.error);
                        setIsListening(false);
                      };

                      recognition.onend = () => {
                        setIsListening(false);
                      };

                      recognition.start();
                    } else {
                      alert("Tarayıcınız ses tanıma özelliğini desteklemiyor. Lütfen Chrome veya Safari kullanın.");
                    }
                  }}
                  className="absolute right-[110px] md:right-[130px] top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors"
                  style={{ 
                    color: isListening ? '#ef4444' : 'var(--accent-gold)',
                    animation: isListening ? 'pulseRed 1.5s infinite' : 'none'
                  }}
                  title="Sesle Yazdır"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="22"></line>
                  </svg>
                </button>

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
            50% { text-shadow: 0 0 20px rgba(212, 175, 55, 1), 0 0 30px rgba(212, 175, 55, 0.8), 0 0 40px rgba(212, 175, 55, 0.6); }
            100% { text-shadow: 0 0 10px rgba(212, 175, 55, 0.8), 0 0 20px rgba(212, 175, 55, 0.5); }
          }
          @keyframes pulseRed {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
        `}} />
      </main>
    </>
  );
}

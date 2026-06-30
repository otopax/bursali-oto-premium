"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function VipGaragePage() {
  const t = useTranslations('Index'); // Fallback translation if needed
  
  const [loginForm, setLoginForm] = useState({ plate: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vehicleData, setVehicleData] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/vip/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Giriş yapılamadı.');
      }
      
      setVehicleData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return { bg: 'rgba(234, 179, 8, 0.2)', color: '#eab308', text: 'Bekliyor' };
      case 'IN_PROGRESS': return { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', text: 'İşlemde (Lifte Alındı)' };
      case 'COMPLETED': return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', text: 'Onarım Tamamlandı' };
      case 'DELIVERED': return { bg: 'rgba(255, 255, 255, 0.1)', color: '#94a3b8', text: 'Teslim Edildi' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', color: '#94a3b8', text: status };
    }
  };

  return (
    <main className="container mx-auto px-4 pt-32 pb-16 min-h-[100dvh]">
      
      {!vehicleData ? (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ background: 'linear-gradient(45deg, #d4af37, #fef08a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              VIP Garaj
            </h1>
            <p className="text-[var(--text-muted)] text-lg">
              Aracınızın servis durumunu ve geçmiş bakım karnesini anlık takip edin.
            </p>
          </div>

          <div className="glass-panel p-8" style={{ border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2 uppercase tracking-wider">Araç Plakası</label>
                <input 
                  type="text" 
                  required
                  placeholder="34 ABC 123"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-lg outline-none focus:border-[var(--accent-gold)] uppercase transition-colors"
                  value={loginForm.plate}
                  onChange={e => setLoginForm({...loginForm, plate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-2 uppercase tracking-wider">Sisteme Kayıtlı Telefon No</label>
                <input 
                  type="tel" 
                  required
                  placeholder="0532 000 00 00"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-lg outline-none focus:border-[var(--accent-gold)] transition-colors"
                  value={loginForm.phone}
                  onChange={e => setLoginForm({...loginForm, phone: e.target.value})}
                />
              </div>

              {error && (
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171' }}>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-gold w-full py-4 text-lg mt-2 flex justify-center items-center gap-2"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Sisteme Bağlanılıyor...' : 'Garajıma Gir'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {/* Garaj Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Hoş Geldiniz, <span style={{ color: 'var(--accent-gold)' }}>{vehicleData.customerInfo.firstName}</span>
              </h1>
              <p className="text-[var(--text-muted)]">
                {vehicleData.serviceName} Dijital Servis Noktası
              </p>
            </div>
            
            <div className="glass-panel px-6 py-3 flex items-center gap-4 border border-[var(--accent-gold)] border-opacity-30">
               <div>
                 <div className="text-sm text-[var(--text-muted)]">Aracınız</div>
                 <div className="font-bold text-xl uppercase tracking-wider">{vehicleData.vehicleInfo.plate}</div>
               </div>
               <div className="h-10 w-px bg-white/10"></div>
               <div className="text-right">
                 <div className="font-bold">{vehicleData.vehicleInfo.brand}</div>
                 <div className="text-sm text-[var(--text-muted)]">{vehicleData.vehicleInfo.model} ({vehicleData.vehicleInfo.year})</div>
               </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4">İş Emirleri & Servis Geçmişi</h2>

          {vehicleData.history && vehicleData.history.length > 0 ? (
            <div className="flex flex-col gap-6">
              {vehicleData.history.map((order, idx) => {
                const statusTheme = getStatusColor(order.status);
                return (
                  <div key={order.id} className="glass-panel p-6 relative overflow-hidden transition-all hover:border-[var(--accent-gold)] hover:border-opacity-50 border border-white/5">
                    {/* Status Ribbon */}
                    <div style={{ position: 'absolute', top: 0, right: 0, background: statusTheme.bg, color: statusTheme.color, padding: '0.5rem 1.5rem', borderBottomLeftRadius: '16px', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px' }}>
                      {statusTheme.text}
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 mt-4">
                      <div className="flex-1">
                        <div className="text-sm text-[var(--text-muted)] mb-1">Giriş Tarihi: {new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
                        <h3 className="text-xl font-bold text-white mb-4">Şikayet: {order.complaint || 'Belirtilmedi'}</h3>
                        
                        {order.notes && (
                          <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-4">
                            <span className="block text-sm text-[var(--accent-gold)] mb-1">Usta Notu:</span>
                            <p className="text-sm text-gray-300">{order.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="md:w-1/3 bg-black/40 rounded-xl p-5 border border-white/5">
                         <h4 className="font-bold text-sm text-[var(--text-muted)] mb-3 uppercase tracking-wider border-b border-white/10 pb-2">Yapılan İşlemler</h4>
                         {order.items && order.items.length > 0 ? (
                           <ul className="flex flex-col gap-3">
                             {order.items.map(item => (
                               <li key={item.id} className="flex justify-between text-sm">
                                 <span className="text-gray-300">{item.name}</span>
                                 <span className="text-gray-500">x{item.quantity}</span>
                               </li>
                             ))}
                           </ul>
                         ) : (
                           <div className="text-sm text-gray-500 italic">Henüz parça/işçilik girilmedi.</div>
                         )}
                         
                         <button 
                           onClick={() => {
                             import('@/lib/pdfGenerator').then(({ generateServiceInvoice }) => {
                               generateServiceInvoice(
                                 order, 
                                 vehicleData.customerInfo, 
                                 vehicleData.vehicleInfo, 
                                 { name: vehicleData.serviceName }
                               );
                             });
                           }}
                           className="btn w-full mt-6 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex justify-center items-center gap-2"
                         >
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                           Check-Up Raporu İndir (PDF)
                         </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-[var(--text-muted)] border border-white/5">
              Sistemde bu araca ait kayıtlı bir servis geçmişi bulunamadı.
            </div>
          )}
        </div>
      )}

    </main>
  );
}

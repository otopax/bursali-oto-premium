"use client";

import { useState } from 'react';

export default function VipFleetPage() {
  const [form, setForm] = useState({ plate: '', phone: '', complaint: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });
    try {
      const res = await fetch('/api/vip/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ loading: false, success: true, error: '' });
        setForm({ plate: '', phone: '', complaint: '' });
      } else {
        setStatus({ loading: false, success: false, error: data.error || 'Bir hata oluştu.' });
      }
    } catch (err) {
      setStatus({ loading: false, success: false, error: 'Bağlantı hatası oluştu.' });
    }
  };

  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Fethiye VIP Transfer ve Turizm Filo Bakımı (Night-Shift)</h1>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            Fethiye, Göcek ve Dalaman bölgesindeki turizm acenteleri ve VIP transfer firmaları için araç yatmasına son veriyoruz. <strong>Mercedes Vito, Sprinter, VW Transporter ve Crafter</strong> gibi ticari filolarınızın bakımlarını "Night-Shift" (Gece Vardiyası) sistemimizle gece yapıyor, sabah işinize devam etmenizi sağlıyoruz.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
            <div>
              <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Ticari Filolara Özel Hizmetlerimiz</h2>
              <ul style={{ listStyleType: 'disc', marginLeft: '2rem', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                <li><strong>Gece Vardiyası Bakımı:</strong> Araçlarınız gündüz para kazansın, gece biz bakımını yapalım.</li>
                <li><strong>DPF ve Partikül Filtre Temizliği:</strong> Sürekli klima açık rölantide bekleyen VIP araçların en büyük sorunu olan DPF tıkanıklıklarını garantili çözüyoruz.</li>
                <li><strong>Şanzıman ve Yürüyen Aksam:</strong> Yüksek kilometre yapan ticari araçların ağır mekanik revizyonları (Baskı balata, kavrama, volant değişimi).</li>
                <li><strong>Periyodik Bakım:</strong> Orijinal veya kaliteli yan sanayi (OEM) filtre ve onaylı yağlar ile uzun ömürlü motor bakımı.</li>
              </ul>
              <h2 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Kurumsal Anlaşma Avantajları</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                Filonuzdaki araç sayısına göre özel indirimler, öncelikli onarım hakkı ve 7/24 ücretsiz Fethiye içi çekici desteği gibi kurumsal anlaşma avantajlarımızdan faydalanmak için bizimle iletişime geçin.
              </p>
            </div>

            <div className="bg-black/50 p-8 rounded-2xl border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--accent-gold)' }}>Hızlı Gece Bakım Randevusu</h2>
              <p className="text-[var(--text-muted)] mb-6">Kurumsal anlaşmalı araçlarınız için sistemdeki plakanızı girerek doğrudan randevu oluşturabilirsiniz.</p>
              
              {status.success ? (
                <div className="p-4 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400">
                  <h3 className="font-bold text-lg mb-2">✅ Randevunuz Alındı!</h3>
                  <p>Aracınız gece vardiyası listesine eklenmiştir. Lütfen mesai bitiminde aracı servisimize bırakın.</p>
                  <button onClick={() => setStatus({loading:false, success:false, error:''})} className="mt-4 text-sm underline text-[var(--accent-gold)]">Yeni Randevu Al</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm text-[var(--text-muted)] mb-1 block">Kayıtlı Plaka</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="48 ABC 123" 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white uppercase focus:border-[var(--accent-gold)] outline-none transition-colors"
                      value={form.plate}
                      onChange={e => setForm({...form, plate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--text-muted)] mb-1 block">Kayıtlı Telefon Numaranız</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="0532 000 00 00" 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--accent-gold)] outline-none transition-colors"
                      value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--text-muted)] mb-1 block">Şikayet veya İstenen İşlem</label>
                    <textarea 
                      required 
                      placeholder="Örn: 10.000 KM bakımı yapılacak ve frenlerden ses geliyor." 
                      className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[var(--accent-gold)] outline-none transition-colors resize-none"
                      value={form.complaint}
                      onChange={e => setForm({...form, complaint: e.target.value})}
                    ></textarea>
                  </div>
                  
                  {status.error && (
                    <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm">
                      ⚠️ {status.error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={status.loading}
                    className="btn btn-gold w-full py-3 mt-2 rounded-lg font-bold"
                    style={{ opacity: status.loading ? 0.7 : 1 }}
                  >
                    {status.loading ? 'İşleniyor...' : 'Gece Vardiyasına Ekle'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';
import { useState, useEffect } from 'react';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error('Veri çekilemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status } : lead));
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Yapay zeka cevabı panoya kopyalandı! Artık ilgili siteye gidip yapıştırabilirsiniz.');
  };

  if (isLoading) return <div style={{ minHeight: '100vh', paddingTop: '120px', textAlign: 'center', color: 'var(--accent-gold)' }}>Yükleniyor...</div>;

  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '5rem', background: '#050505' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>
          📡 Sanal Usta İstihbarat Radarı
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '3rem' }}>
          Yapay zeka botumuzun sosyal medyada (şimdilik Reddit) bulduğu müşteri arıza şikayetleri ve otomatik üretilmiş profesyonel cevap taslakları.
        </p>

        {leads.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: '#111', borderRadius: '16px', border: '1px solid #333' }}>
            Henüz yeni bir fırsat (lead) bulunamadı. Radar arka planda taramaya devam ediyor.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {leads.map((lead) => (
              <div key={lead.id} style={{ 
                background: '#111', 
                borderRadius: '16px', 
                border: lead.status === 'pending' ? '1px solid var(--accent-gold)' : '1px solid #333',
                overflow: 'hidden',
                opacity: lead.status === 'dismissed' ? 0.5 : 1
              }}>
                {/* Header */}
                <div style={{ background: lead.status === 'pending' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.05)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
                  <div>
                    <span style={{ background: '#000', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', color: 'white', marginRight: '1rem' }}>
                      {lead.platform.toUpperCase()}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                      Yazar: {lead.author || 'Gizli'} • {new Date(lead.createdAt).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {lead.status === 'pending' && (
                      <button onClick={() => updateStatus(lead.id, 'dismissed')} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Yoksay</button>
                    )}
                    {lead.status !== 'responded' && (
                      <button onClick={() => updateStatus(lead.id, 'responded')} style={{ background: 'var(--accent-blue)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Cevaplandı İşaretle</button>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#333' }}>
                  <div style={{ background: '#111', padding: '1.5rem' }}>
                    <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>Müşteri Şikayeti</h3>
                    <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.95rem', maxHeight: '250px', overflowY: 'auto' }}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-gold)' }}>{lead.title}</strong>
                      {lead.content}
                    </div>
                    <a href={lead.url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--accent-gold)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      Orijinal Gönderiye Git ↗
                    </a>
                  </div>

                  <div style={{ background: '#111', padding: '1.5rem' }}>
                    <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1rem', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
                      Sanal Usta Taslak Cevabı
                      <button onClick={() => handleCopy(lead.aiResponse)} style={{ background: 'var(--accent-gold)', border: 'none', color: 'black', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                        Panoya Kopyala
                      </button>
                    </h3>
                    <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.95rem', maxHeight: '250px', overflowY: 'auto', whiteSpace: 'pre-wrap', borderLeft: '3px solid var(--accent-gold)' }}>
                      {lead.aiResponse || 'Yapay zeka cevabı oluşturamadı.'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

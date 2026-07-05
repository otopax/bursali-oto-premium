"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Telefonu wa.me formatına normalize eder (ülke kodlu, sadece rakam).
// "0532 123 45 67" -> "905321234567", "+90 532..." -> "90532..."
function normalizePhone(raw) {
  if (!raw) return '';
  let d = String(raw).replace(/\D/g, '');
  if (d.startsWith('90')) return d;
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length === 10) return '90' + d; // 5XXXXXXXXX -> 905XXXXXXXXX
  return d;
}

// İş emri tamamlanınca müşteriye WhatsApp'tan Google yorum isteme linki üretir (Faz 1.4).
function buildReviewWaLink(order) {
  const customer = order?.vehicle?.customer || {};
  const phone = normalizePhone(customer.phone);
  const name = customer.firstName || 'Değerli müşterimiz';
  const arac = [order?.vehicle?.brand, order?.vehicle?.model].filter(Boolean).join(' ') || 'aracınız';
  const reviewUrl = process.env.NEXT_PUBLIC_GBP_REVIEW_URL || '';
  const mesaj =
    `Merhaba ${name}, ${arac} Bursalı Oto Servis'te hazır. Bizi tercih ettiğiniz ` +
    `için teşekkür ederiz! Deneyiminizi Google'da değerlendirmeniz bizim için çok değerli` +
    (reviewUrl ? `: ${reviewUrl}` : '.');
  return { phone, link: `https://wa.me/${phone}?text=${encodeURIComponent(mesaj)}`, reviewUrl };
}

export default function WorkOrdersAdminPage() {
  const { data: session, status } = useSession();
  
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showNewModal, setShowNewModal] = useState(false);
  const [formData, setFormData] = useState({
    plate: '',
    phone: '',
    firstName: '',
    brand: '',
    model: '',
    year: '',
    complaint: '',
    mileage: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/api/auth/signin');
    }
    if (status === 'authenticated') {
      fetchWorkOrders();
    }
  }, [status]);

  const fetchWorkOrders = async () => {
    try {
      const res = await fetch('/api/erp/workorders');
      const json = await res.json();
      if (json.success) {
        setWorkOrders(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Optimistically update the UI locally first
      setWorkOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      const res = await fetch(`/api/erp/workorders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (!json.success) {
        alert("Hata oluştu, sayfa yenileniyor.");
        fetchWorkOrders();
      }
    } catch(e) {
      alert("Bağlantı hatası.");
      fetchWorkOrders();
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Yükleniyor...</div>;
  }

  return (
    <main className="container mx-auto px-4 pt-32 pb-16 min-h-[100dvh]">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">İş Emirleri Yönetimi</h1>
          <p className="text-[var(--text-muted)]">Müşteri araç kabul ve servis takip ekranı</p>
        </div>
        <div className="flex gap-4">

          <button 
            onClick={() => setShowNewModal(true)}
            className="btn btn-gold py-2 px-6 rounded-lg flex items-center gap-2"
          >
            <span>+</span> Yeni İş Emri
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workOrders.map((order) => (
          <div key={order.id} className="glass-panel p-6 border border-white/10 hover:border-[var(--accent-gold)] transition-all">
            <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-wider">{order.vehicle.plate}</h3>
                <p className="text-sm text-[var(--text-muted)]">{order.vehicle.brand} {order.vehicle.model}</p>
              </div>
              <select 
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className="bg-black/50 border border-white/20 text-white text-sm rounded-lg p-2 outline-none"
              >
                <option value="PENDING">Bekliyor</option>
                <option value="IN_PROGRESS">Lifte Alındı</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="DELIVERED">Teslim Edildi</option>
              </select>
            </div>
            
            <div className="mb-4">
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-1">Müşteri Şikayeti</span>
              <p className="text-sm text-gray-200">{order.complaint || 'Belirtilmedi'}</p>
            </div>

            <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-muted)]">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
                <Link href={`/tr/admin/is-emirleri/${order.id}`} className="text-sm text-[var(--accent-gold)] hover:underline">Detaylar / Parça Ekle</Link>
              </div>
              
              {order.status === 'COMPLETED' && (
                <button 
                  onClick={async () => {
                    const btn = document.getElementById(`btn-ai-${order.id}`);
                    btn.innerText = 'Yapay Zeka Yazıyor...';
                    try {
                      const res = await fetch('/api/ai/google-post', {
                        method: 'POST',
                        body: JSON.stringify({
                          workOrder: order,
                          vehicle: order.vehicle,
                          customer: order.customer,
                          items: order.items || []
                        })
                      });
                      const data = await res.json();
                      if(data.success) {
                        alert("Google İşletme Metniniz Hazır! Kopyalayabilirsiniz:\n\n" + data.post);
                        btn.innerText = '🤖 AI Gönderisi Oluşturuldu';
                      }
                    } catch(e) {
                      btn.innerText = 'Hata Oluştu';
                    }
                  }}
                  id={`btn-ai-${order.id}`}
                  className="w-full mt-2 py-2 text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/40 transition-colors flex justify-center items-center gap-2"
                >
                  ✨ Google İşletme İçin AI Gönderi Üret
                </button>
              )}

              {(order.status === 'COMPLETED' || order.status === 'DELIVERED') && (
                <a
                  href={buildReviewWaLink(order).link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    const { phone, reviewUrl } = buildReviewWaLink(order);
                    if (!phone) {
                      e.preventDefault();
                      alert('Bu müşteri için telefon numarası kayıtlı değil — yorum linki gönderilemez.');
                    } else if (!reviewUrl) {
                      // Link yine açılır ama mesajda Google yorum bağlantısı olmaz.
                      alert('Uyarı: NEXT_PUBLIC_GBP_REVIEW_URL tanımlı değil. Mesaja Google yorum linki eklenmedi; .env dosyanıza GBP "yorum iste" linkinizi ekleyin.');
                    }
                  }}
                  className="w-full mt-1 py-2 text-xs font-bold bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-600/40 transition-colors flex justify-center items-center gap-2"
                >
                  💬 WhatsApp'tan Yorum İste
                </a>
              )}
            </div>
          </div>
        ))}
        {workOrders.length === 0 && (
          <div className="col-span-full text-center py-12 text-[var(--text-muted)] glass-panel">
            Aktif iş emri bulunmamaktadır.
          </div>
        )}
      </div>

      {/* New Work Order Modal (Simplified for Demo) */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 max-w-lg w-full border border-[var(--accent-gold)] rounded-2xl">
             <h2 className="text-2xl font-bold text-white mb-6">Yeni Araç Kabul</h2>
             
             <div className="flex flex-col gap-4">
                <input 
                  placeholder="Plaka (Örn: 34 ABC 123)" 
                  className="bg-white/5 border border-white/10 p-3 rounded-lg text-white w-full"
                  value={formData.plate}
                  onChange={(e) => setFormData({...formData, plate: e.target.value})}
                />
                <input 
                  placeholder="Müşteri İsim Soyisim" 
                  className="bg-white/5 border border-white/10 p-3 rounded-lg text-white w-full"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
                <input 
                  placeholder="Müşteri Telefonu" 
                  className="bg-white/5 border border-white/10 p-3 rounded-lg text-white w-full"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <div className="flex gap-4">
                  <input 
                    placeholder="Marka (Örn: BMW)" 
                    className="bg-white/5 border border-white/10 p-3 rounded-lg text-white w-full"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                  <input 
                    placeholder="Model (Örn: 320i)" 
                    className="bg-white/5 border border-white/10 p-3 rounded-lg text-white w-full"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                  />
                </div>
                <textarea 
                  placeholder="Müşteri Şikayeti" 
                  className="bg-white/5 border border-white/10 p-3 rounded-lg text-white w-full h-24"
                  value={formData.complaint}
                  onChange={(e) => setFormData({...formData, complaint: e.target.value})}
                ></textarea>
                
                <div className="flex justify-end gap-4 mt-4">
                  <button onClick={() => setShowNewModal(false)} className="text-[var(--text-muted)] hover:text-white">İptal</button>
                  <button className="btn btn-gold py-2 px-6 rounded-lg" onClick={async () => {
                    try {
                      const res = await fetch('/api/erp/workorders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                      });
                      const json = await res.json();
                      if (json.success) {
                        alert("Yeni iş emri oluşturuldu!");
                        setShowNewModal(false);
                        setFormData({ plate: '', phone: '', firstName: '', brand: '', model: '', year: '', complaint: '', mileage: '' });
                        fetchWorkOrders(); // refresh list
                      } else {
                        alert("Hata: " + json.error);
                      }
                    } catch(e) {
                      alert("Bağlantı hatası");
                    }
                  }}>Kaydet ve İş Emri Aç</button>
                </div>
             </div>
          </div>
        </div>
      )}

    </main>
  );
}

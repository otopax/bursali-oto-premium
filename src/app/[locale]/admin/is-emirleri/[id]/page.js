"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WorkOrderDetailPage({ params }) {
  // Use React.use() or await params in real Next.js 15+, but since this is a Client Component 
  // receiving props, params is technically a Promise in Next.js 15. We'll extract id cleanly.
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    type: 'PART',
    name: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 20,
    discount: 0
  });

  // Extract ID from params safely
  const [id, setId] = useState(null);
  
  useEffect(() => {
    Promise.resolve(params).then(resolved => setId(resolved.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      // In a real app we'd have a GET /api/erp/workorders/[id] route
      // Let's assume we can fetch it or we'll create that route next
      const res = await fetch(`/api/erp/workorders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/erp/workorders/${id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      const data = await res.json();
      if (data.success) {
        // Refresh items
        fetchOrderDetails();
        setNewItem({ ...newItem, name: '', unitPrice: 0, quantity: 1 });
      } else {
        alert("Hata: " + data.error);
      }
    } catch (e) {
      alert("Bağlantı hatası");
    }
  };

  if (loading || !id) {
    return <div className="p-8 text-white">Yükleniyor...</div>;
  }

  if (!order) {
    return <div className="p-8 text-white">İş Emri bulunamadı.</div>;
  }

  // Calculate totals
  const totalParts = order.items.filter(i => i.type === 'PART').reduce((acc, item) => acc + (item.quantity * item.unitPrice * (1 + item.taxRate/100) - item.discount), 0);
  const totalLabor = order.items.filter(i => i.type === 'LABOR').reduce((acc, item) => acc + (item.quantity * item.unitPrice * (1 + item.taxRate/100) - item.discount), 0);
  const grandTotal = totalParts + totalLabor;

  const handleSendWhatsApp = () => {
    if (!order.vehicle?.customer?.phone) {
      alert("Müşteri telefon numarası kayıtlı değil.");
      return;
    }
    
    let phone = order.vehicle.customer.phone.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = phone.slice(1);
    if (phone.length === 10) phone = '90' + phone;

    let message = `Merhaba ${order.vehicle.customer.firstName || 'Değerli Müşterimiz'},\n\n`;
    message += `*${order.vehicle.plate}* plakalı aracınızın servis işlemleriyle ilgili detaylar aşağıdadır:\n\n`;
    
    if (order.items && order.items.length > 0) {
      message += `*YAPILAN İŞLEMLER VE PARÇALAR*\n`;
      order.items.forEach(i => {
        message += `- ${i.name} (${i.quantity} adet)\n`;
      });
      message += `\n`;
    }
    
    message += `*TOPLAM TUTAR (KDV Dahil)*: ₺${grandTotal.toLocaleString('tr-TR', {minimumFractionDigits: 2})}\n\n`;
    message += `Bursalı Oto Servis'i tercih ettiğiniz için teşekkür ederiz. İyi günler dileriz.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  const handleCreateEInvoice = () => {
    alert("E-Dönüştür API Bağlantısı Başlatılıyor...\n\n(Faz 7.2: Bu buton tıkladığında Mali Mühür/E-İmza onayı ile E-Fatura portalına taslak olarak gönderilecektir.)");
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/tr/admin/is-emirleri" className="text-[var(--accent-gold)] hover:underline mb-2 inline-block">
            ← İş Emirlerine Dön
          </Link>
          <h1 className="text-3xl font-bold">İş Emri Detayı</h1>
          <p className="text-gray-400 mt-1">ID: <span className="font-mono text-xs">{order.id}</span></p>
        </div>
        <div className="bg-black/50 p-4 rounded-xl border border-white/10 text-right">
          <div className="text-sm text-gray-400 uppercase tracking-wider">Durum</div>
          <div className="font-bold text-xl text-[var(--accent-gold)]">{order.status}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-[var(--accent-gold)] border-b border-white/10 pb-2">Araç & Müşteri</h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Müşteri Adı</div>
                <div className="font-semibold text-lg">{order.vehicle?.customer?.firstName} {order.vehicle?.customer?.lastName}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Telefon</div>
                <div className="font-semibold">{order.vehicle?.customer?.phone}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Araç</div>
                <div className="font-bold text-xl uppercase tracking-wider text-blue-400">{order.vehicle?.plate}</div>
                <div className="text-gray-300">{order.vehicle?.brand} {order.vehicle?.model}</div>
              </div>
              
              {order.mileage && (
                <div>
                  <div className="text-sm text-gray-500">Kilometre</div>
                  <div className="font-semibold">{order.mileage.toLocaleString('tr-TR')} KM</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-[var(--accent-gold)] border-b border-white/10 pb-2">Müşteri Şikayeti</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{order.complaint || 'Belirtilmedi'}</p>
          </div>
        </div>

        {/* Right Column - Items and Billing */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-2">Yapılan İşlemler ve Yedek Parça</h2>
            
            {/* List of items */}
            {order.items && order.items.length > 0 ? (
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-sm">
                      <th className="py-3 font-medium">TÜR</th>
                      <th className="py-3 font-medium">AÇIKLAMA</th>
                      <th className="py-3 font-medium">MİKTAR</th>
                      <th className="py-3 font-medium">BİRİM FİYAT</th>
                      <th className="py-3 font-medium">KDV</th>
                      <th className="py-3 font-medium text-right">TOPLAM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => {
                      const total = (item.quantity * item.unitPrice * (1 + item.taxRate/100)) - item.discount;
                      return (
                        <tr key={item.id} className="border-b border-white/5">
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.type === 'PART' ? 'bg-blue-900/50 text-blue-300' : 'bg-green-900/50 text-green-300'}`}>
                              {item.type === 'PART' ? 'PARÇA' : 'İŞÇİLİK'}
                            </span>
                          </td>
                          <td className="py-4 font-medium">{item.name}</td>
                          <td className="py-4">{item.quantity}</td>
                          <td className="py-4">₺{item.unitPrice.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</td>
                          <td className="py-4">%{item.taxRate}</td>
                          <td className="py-4 text-right font-bold">₺{total.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 mb-8 border border-dashed border-gray-700 rounded-lg">
                Henüz işlem veya parça eklenmedi.
              </div>
            )}

            {/* Total Summary */}
            <div className="bg-white/5 p-6 rounded-xl flex justify-between items-end mb-8">
              <div className="space-y-2 text-gray-400">
                <div>Yedek Parça Toplamı: <span className="text-white font-medium">₺{totalParts.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</span></div>
                <div>İşçilik Toplamı: <span className="text-white font-medium">₺{totalLabor.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</span></div>
              </div>
              <div className="text-right">
                <div className="text-sm text-[var(--accent-gold)] uppercase tracking-wider mb-1">Genel Toplam (KDV Dahil)</div>
                <div className="text-4xl font-bold text-white mb-4">₺{grandTotal.toLocaleString('tr-TR', {minimumFractionDigits: 2})}</div>
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={handleSendWhatsApp}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                  >
                    <span>💬</span> WhatsApp Teklif/Hesap Gönder
                  </button>
                  <button 
                    onClick={handleCreateEInvoice}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                  >
                    <span>📄</span> E-Fatura Kes
                  </button>
                </div>
              </div>
            </div>

            {/* Add Item Form */}
            <h3 className="text-lg font-bold mb-4 text-gray-300">Yeni İşlem / Parça Ekle</h3>
            <form onSubmit={handleAddItem} className="bg-white/5 p-6 rounded-xl grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs text-gray-400 mb-1">Tür</label>
                <select 
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white outline-none"
                  value={newItem.type}
                  onChange={e => setNewItem({...newItem, type: e.target.value})}
                >
                  <option value="PART">Parça</option>
                  <option value="LABOR">İşçilik</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Açıklama / Parça Adı</label>
                <input 
                  type="text" required
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white outline-none"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  placeholder="Örn: 5W30 Motor Yağı"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs text-gray-400 mb-1">Miktar</label>
                <input 
                  type="number" step="0.01" required min="0.1"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white outline-none"
                  value={newItem.quantity}
                  onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs text-gray-400 mb-1">Birim Fiyat (₺)</label>
                <input 
                  type="number" step="0.01" required min="0"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white outline-none"
                  value={newItem.unitPrice}
                  onChange={e => setNewItem({...newItem, unitPrice: e.target.value})}
                />
              </div>

              <div className="md:col-span-1 flex items-end">
                <button type="submit" className="w-full bg-[var(--accent-gold)] text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors">
                  Ekle
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateServiceInvoice = (workOrder, customer, vehicle, tenant) => {
  // A4 Landscape is better for wide tables
  const doc = new jsPDF('landscape', 'pt', 'a4');
  
  // Custom Font configuration can be added here if needed for Turkish chars (using standard for now)
  // For production, base64 TTF fonts are usually injected here. We'll use standard helvetica which supports basic Latin.
  
  // 1. Üst Başlıklar
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text('BURSALI OTO SERVİS', 40, 40);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const rightTitle1 = `${vehicle.plate || 'BİLİNMİYOR'} Plakalı Araca Ait`;
  const rightTitle2 = 'Önceki Onarımlar Listesi';
  doc.text(rightTitle1, doc.internal.pageSize.width - 40, 30, { align: 'right' });
  doc.text(rightTitle2, doc.internal.pageSize.width - 40, 48, { align: 'right' });

  // 2. Turuncu Bant (Cari ve Araç Bilgileri)
  const startY = 70;
  doc.setFillColor(245, 166, 35); // Orange
  doc.rect(40, startY, doc.internal.pageSize.width - 80, 20, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Cari ve Araç Bilgileri ${workOrder.id.substring(0, 8).toUpperCase()}`, doc.internal.pageSize.width / 2, startY + 14, { align: 'center' });

  // Alt Kutu (Kırmızı Kenarlıklı)
  doc.setDrawColor(208, 2, 27); // Red border
  doc.setLineWidth(1);
  doc.rect(40, startY + 20, doc.internal.pageSize.width - 80, 60, 'S');

  // Müşteri Bilgileri (Sol)
  doc.setFont('helvetica', 'normal');
  doc.text(`${customer.firstName} ${customer.lastName || ''}`, 45, startY + 35);
  doc.text(`${customer.phone} /`, 45, startY + 50);
  doc.text('/', 45, startY + 65);

  // Araç Bilgileri (Orta)
  const midX = (doc.internal.pageSize.width / 2) - 100;
  doc.text(vehicle.vin || 'ŞASİ BELİRTİLMEMİŞ', midX, startY + 35);
  doc.text(vehicle.brand || '', midX, startY + 50);
  doc.text(`${vehicle.model || ''} \n${vehicle.year || ''}`, midX, startY + 65);

  // Marka Logosu Placeholder (Sağ)
  doc.setFontSize(16);
  doc.setTextColor(208, 2, 27);
  doc.text(vehicle.brand.toUpperCase() || 'MARKA', doc.internal.pageSize.width - 150, startY + 60);
  doc.setTextColor(0, 0, 0); // Reset

  // 3. Kırmızı Bant (Kabul Tablosu)
  doc.autoTable({
    startY: startY + 90,
    head: [['Kabul No', 'Gir. Tar.', 'Plaka', 'Getiren', 'Müşteri Adı', 'KM', 'Marka']],
    body: [
      [
        workOrder.id.substring(0, 11).toUpperCase(),
        new Date(workOrder.createdAt).toLocaleDateString('tr-TR'),
        vehicle.plate,
        '',
        `${customer.firstName} ${customer.lastName || ''}`,
        workOrder.mileage || '',
        vehicle.brand
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [255, 235, 235], // Light Red
      textColor: [208, 2, 27], // Red Text
      lineColor: [208, 2, 27],
      lineWidth: 1,
      halign: 'center',
      fontStyle: 'bold'
    },
    bodyStyles: {
      lineColor: [208, 2, 27],
      lineWidth: 1,
      halign: 'center'
    },
    margin: { left: 40, right: 40 }
  });

  // 4. Yeşil Bant (Ürün / Hizmet Tablosu)
  const finalY = doc.lastAutoTable.finalY + 10;
  
  const tableRows = workOrder.items.map((item, index) => {
    const total = item.quantity * item.unitPrice;
    const discountAmount = item.discount || 0;
    const finalTotal = total - discountAmount;
    
    return [
      index + 1,
      item.type === 'PART' ? 'ÜRÜN' : 'İŞÇİLİK',
      '', // Stok No
      item.name,
      item.quantity.toString(),
      item.unitPrice.toFixed(2),
      discountAmount.toFixed(2),
      finalTotal.toFixed(2)
    ];
  });

  doc.autoTable({
    startY: finalY,
    head: [['Sıra', 'Türü', 'Stok No', 'Ürün Hizmet Adı', 'Mik.', 'Fiyat', 'İSK.', 'Tutar']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [200, 255, 200], // Light Green
      textColor: [0, 100, 0], // Dark Green Text
      lineColor: [100, 200, 100],
      lineWidth: 1,
      halign: 'center'
    },
    bodyStyles: {
      lineColor: [100, 200, 100],
      lineWidth: 1
    },
    columnStyles: {
      3: { halign: 'left' }, // Hizmet adı sola dayalı
      4: { halign: 'center' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' }
    },
    margin: { left: 40, right: 40 }
  });

  // 5. Alt Toplamlar (Sağ Alt Köşe)
  let subTotal = 0;
  let totalDiscount = 0;
  
  workOrder.items.forEach(item => {
    const total = item.quantity * item.unitPrice;
    subTotal += total;
    totalDiscount += (item.discount || 0);
  });

  const araToplam = subTotal - totalDiscount;
  
  // Sabit %20 KDV (KDV Hariç fiyata uygulanıyor varsayımıyla)
  const kdvAmount = araToplam * 0.20;
  const yekun = araToplam + kdvAmount;

  const totalY = doc.lastAutoTable.finalY;
  
  const summaryData = [
    ['Toplam', subTotal.toFixed(2)],
    ['İskonto', totalDiscount.toFixed(2)],
    ['Ara Toplam', araToplam.toFixed(2)],
    ['KDV (%20)', kdvAmount.toFixed(2)],
    ['Yekün', yekun.toFixed(2)]
  ];

  doc.autoTable({
    startY: totalY,
    body: summaryData,
    theme: 'grid',
    tableWidth: 200,
    margin: { left: doc.internal.pageSize.width - 240 },
    bodyStyles: {
      halign: 'right',
      lineColor: [100, 200, 100],
      lineWidth: 1
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left' },
      1: { halign: 'right' }
    }
  });

  // Sonuç Olarak Kaydet (veya Blob dön)
  doc.save(`${vehicle.plate}_servis_raporu.pdf`);
};

import html2canvas from 'html2canvas';

/**
 * Creates a corporate Diagnostic Report PDF from AI Chat
 * @param {Object} data 
 * @param {string} data.vin - Vehicle Identification Number
 * @param {string} data.vehicle - Brand and Model (e.g. BMW 320i)
 * @param {string} data.diagnosis - The AI diagnostic text
 * @param {string} data.risk - High, Medium, Low
 * @param {string} data.cost - Estimated cost range
 * @param {string} data.time - Estimated repair time
 */
export async function generateDiagnosticPDF(data) {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.fontFamily = 'sans-serif';

  const diagnosisHtml = data.diagnosis ? data.diagnosis.replace(/\n/g, '<br/>') : 'Teşhis verisi bulunamadı.';

  container.innerHTML = `
    <div style="border-bottom: 2px solid #e11d48; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="color: #e11d48; margin: 0; font-size: 28px;">Bursalı Oto Dijital</h1>
        <p style="margin: 5px 0 0 0; color: #666;">Uzman Teşhis ve Bakım Raporu</p>
      </div>
      <div style="text-align: right; color: #666; font-size: 14px;">
        <p style="margin: 0;">Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
        <p style="margin: 5px 0 0 0;">WhatsApp: +90 535 013 41 83</p>
      </div>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; margin-bottom: 10px;">Araç Bilgileri</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Araç</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.vehicle || 'Bilinmiyor'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Şasi No (VIN)</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.vin || 'Belirtilmedi'}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; margin-bottom: 10px;">Sanal Usta Teşhis Özeti</h2>
      <div style="padding: 15px; background-color: #f9f9f9; border-left: 4px solid #e11d48; line-height: 1.6;">
        ${diagnosisHtml}
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 20px; margin-bottom: 10px;">Tahminler ve Risk Analizi</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Sürüş Riski</td>
          <td style="padding: 8px; border: 1px solid #ddd; color: ${data.risk === 'Yüksek' || data.risk === 'Kritik' ? 'red' : 'inherit'}">${data.risk || 'Hesaplanmadı'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Tahmini Süre</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.time || 'Hesaplanmadı'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Tahmini Maliyet</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.cost || 'Hesaplanmadı'}</td>
        </tr>
      </table>
    </div>

    <div style="margin-top: 50px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
      <p>Bu rapor yapay zeka tarafından sağlanan tahmini bir ön teşhistir. Kesin onarım için servisimizde fiziki kontrol yapılması gerekmektedir.</p>
      <p>Randevu almak için bizi arayabilir veya <strong>bursali-oto.com</strong> sitemizi ziyaret edebilirsiniz.</p>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    // A4 size in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Bursali-Oto-Tezhis-Raporu-${data.vin || 'SanalUsta'}.pdf`);
  } catch (error) {
    console.error("PDF oluşturulurken hata:", error);
  } finally {
    document.body.removeChild(container);
  }
}

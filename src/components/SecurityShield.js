"use client";

import { useEffect } from 'react';

export default function SecurityShield() {
  useEffect(() => {
    // 1. Sağ tık menüsünü engelle
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // 2. Kopyalama (Ctrl+C, Sağ tık kopyala) işlemini engelle
    const handleCopy = (e) => {
      e.preventDefault();
      // Panoya kopyalanan içeriği sıfırla veya uyarı mesajı koy
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', 'İçerik kopyalamak güvenlik politikamız gereği yasaktır - Bursalı Oto Servis');
      }
    };

    // 3. Klavye kısayollarını dinle (PrintScreen, F12, Ctrl+Shift+I vb.)
    const handleKeyDown = (e) => {
      // F12 (Geliştirici Araçları) engelleme
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
      }
      
      // Ctrl+Shift+I (Geliştirici Araçları), Ctrl+Shift+J, Ctrl+U (Kaynağı görüntüle)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
      }
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'P' || e.key === 'p' || e.key === 'S' || e.key === 's')) {
        e.preventDefault();
      }

      // PrintScreen Tuşu
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        // Pano temizleme denemesi
        try {
          navigator.clipboard.writeText('Ekran görüntüsü almak güvenlik politikamız gereği kısıtlanmıştır - Bursalı Oto Servis');
        } catch (err) {}
        
        // Ekranı karartmak için body sınıfını değiştir
        document.body.classList.add('hide-screen-for-print');
        setTimeout(() => {
          document.body.classList.remove('hide-screen-for-print');
        }, 1500); // 1.5 saniye sonra ekranı geri aç
      }
    };

    const handleKeyUp = (e) => {
      // Print screen tuşundan elini çekince bazen tetiklenir
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        try {
          navigator.clipboard.writeText('Ekran görüntüsü almak güvenlik politikamız gereği kısıtlanmıştır - Bursalı Oto Servis');
        } catch (err) {}
      }
    };

    // 4. Sürükle ve Bırak (Resimleri) Engelle
    const handleDragStart = (e) => {
      e.preventDefault();
    };

    // Dinleyicileri ekle
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      // Temizlik (Cleanup)
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null; // Arayüzü yok, sadece arka planda çalışır
}

"use client";

import { useState } from 'react';

const allReviews = [
  { name: "Brian Se", text: "\"Volvo'muzla ilgili bize çok yardımcı oldular. Berlin'den sevgilerle...\"", rating: 5 },
  { name: "Ergün Baysal", text: "\"Almanyadan Fethiye'ye geldim ve arabam arıza verdi. Herkesin tavsiye ettiği İbrahim ustaya gittim ve sorun çözüldü. Gerçek bir usta.\"", rating: 5 },
  { name: "Hasan CiL", text: "\"Arabada sorunlar vardı w204 kasa (Mercedes) titizlikle ve özenle yaptılar teşekkürler. Fethiye'de Mercedes'ten anlayan nadir yerlerden.\"", rating: 5 },
  { name: "Олена (Olena)", text: "\"Excellent car service! Quality, speed of repair, service. The mechanics are true professionals. Highly recommend!\"", rating: 5 },
  { name: "Mehmet Yılmaz", text: "\"Fethiye'de güvenebileceğiniz tek adres. Otomatik şanzıman arızamı nokta atışı buldular. Çok profesyoneller.\"", rating: 5 },
  { name: "Sarah Jenkins", text: "\"Very professional and helpful. They speak English and explained everything clearly. Honest pricing.\"", rating: 5 },
  { name: "Ahmet K.", text: "\"Gecenin bir yarısı yolda kaldık, Hızır gibi yetiştiler. Çekici hizmetleri de harika, hemen aracı aldılar.\"", rating: 5 },
  { name: "Caner T.", text: "\"Aracımın periyodik bakımını yaptırdım. Şeffaf fiyatlandırma, kaliteli işçilik ve dürüst esnaf.\"", rating: 5 },
  { name: "David M.", text: "\"Had a warning light on my BMW. They used official diagnostic tools and fixed the sensor issue in 1 hour. Brilliant.\"", rating: 5 },
  { name: "Leyla K.", text: "\"Kadın sürücü olarak sanayiye gitmekten hep çekinirdim ama buradaki ekip o kadar saygılı ve şeffaf ki artık tek adresim.\"", rating: 5 },
  { name: "Mustafa Demir", text: "\"Audi A6 aracımın triger değişimi için gittim. Orijinal parça kullandılar ve süreç boyunca fotoğraflı bilgilendirme yaptılar.\"", rating: 5 },
  { name: "Igor V.", text: "\"Лучший сервис в Фетхие! Починили коробку передач на моем VW. Цены честные, не обманывают туристов.\"", rating: 5 },
  { name: "Selim Çelik", text: "\"Porsche Cayenne aracımın süspansiyon arızasını sadece PIWIS cihazıyla çözebileceklerini söylediler, gerçekten de öyle oldu.\"", rating: 5 },
  { name: "Ayşe N.", text: "\"Tatil yolunda klimamız bozuldu. 35 derecede bizi kurtardılar. Hızlı ve çok temiz çalıştılar.\"", rating: 5 },
  { name: "Burak E.", text: "\"Fethiye'de esnaflık ölmemiş dedirten işletme. İbrahim ustanın tecrübesi konuşuyor.\"", rating: 5 },
  { name: "John Davies", text: "\"Engine overheating on the mountain road. They towed my car safely and repaired the water pump quickly. 5 stars.\"", rating: 5 },
  { name: "Gökhan S.", text: "\"Fiyatlar piyasaya göre çok makul ve en önemlisi işleme başlamadan önce tam fiyat veriyorlar. Sürpriz yok.\"", rating: 5 },
  { name: "Ali Rıza", text: "\"Mercedes yetkili servisinde bile çözülemeyen elektriksel arızayı 2 saatte tespit ettiler. Helal olsun.\"", rating: 5 },
  { name: "Tarik B.", text: "\"DPF temizliği için gittim, arabanın çekişi kendine geldi. Makineleri çok modern.\"", rating: 5 },
  { name: "Anna K.", text: "\"Fast, reliable, and very polite. The lounge is air-conditioned while you wait.\"", rating: 5 },
  { name: "Kemal Y.", text: "\"BMW 5.20 aracımın zincir değişimini yaptılar. Motor sesi saat gibi oldu. Kesinlikle tavsiye ederim.\"", rating: 5 },
  { name: "Özkan M.", text: "\"Kışlık bakımlarımı hep burada yaptırırım. İşlerini çok titiz yapıyorlar. Yağ değişiminde bile çok detaylı inceliyorlar.\"", rating: 5 },
  { name: "Robert Wilson", text: "\"Broke down near Ölüdeniz. Their tow truck arrived in 20 minutes. Exceptional service.\"", rating: 5 },
  { name: "Cemil A.", text: "\"Fethiye sanayisinde böyle kurumsal bir yer görmek gurur verici. VIP bekleme salonu bile var.\"", rating: 5 },
  { name: "Fatma S.", text: "\"Fren balataları ve disk değişimi için gittim. Çok ilgilendiler ve fiyatı baştan söylediler.\"", rating: 5 },
  { name: "Oğuzhan D.", text: "\"Otomatik şanzıman vuruntu yapıyordu. Kart arızasıymış, nokta atışı tespit edip onardılar.\"", rating: 5 },
  { name: "Elena S.", text: "\"Очень честные ребята. Ремонт сделали быстро, все объяснили.\"", rating: 5 },
  { name: "Barış T.", text: "\"Turizm taşımacılığı yapıyoruz, gece araç bırakıp sabah sefere hazır alıyoruz. İlaç gibi geldiniz.\"", rating: 5 },
  { name: "Yasin K.", text: "\"Ustalık başka bir şey. Motorun sesinden arızayı anlıyorlar ama yine de cihazla teyit ediyorlar. Güven verici.\"", rating: 5 },
  { name: "Merve B.", text: "\"Lastik patlaması sonucu gece yarısı ulaştık. 10 dakikada çekici gönderdiler. Çok teşekkürler.\"", rating: 5 },
  { name: "Steve H.", text: "\"Great communication via WhatsApp. Sent me photos of the broken parts. Very trustworthy.\"", rating: 5 },
  { name: "Hüseyin P.", text: "\"Audi Q7 aracımın periyodik bakımı yapıldı. Yetkili servis kalitesinde ama fiyatlar çok daha adil.\"", rating: 5 },
  { name: "Kadir C.", text: "\"Arıza tespit cihazları gerçekten çok iyi. ODIS ile gizli özellikleri de açtılar sağ olsunlar.\"", rating: 5 },
  { name: "Serkan Y.", text: "\"Fethiye'de DSG şanzıman konusunda tek geçerim. Kavrama değişimi pürüzsüz oldu.\"", rating: 5 },
  { name: "Thomas L.", text: "\"Honest mechanic. Didn't try to sell me things I didn't need. My Toyota runs perfectly now.\"", rating: 5 },
  { name: "Emre G.", text: "\"Motor yağ yakıyordu, segman atıldı. Aracın performansı ilk günkü gibi oldu.\"", rating: 5 },
  { name: "Nuri B.", text: "\"Esnaflık, kalite, güler yüz. Arabamı sadece buraya emanet ediyorum.\"", rating: 5 },
  { name: "Ali Can", text: "\"Şanzıman yağı değişimi makine ile tam profesyonel yapıldı. Vites geçişleri pamuk gibi oldu.\"", rating: 5 },
  { name: "Murat T.", text: "\"Fethiye sıcağında hararet yapan aracımı kurtardılar. Termostat ve devirdaim orijinaliyle değişti.\"", rating: 5 },
  { name: "Sophie R.", text: "\"Super service. The mechanic explained the problem with my Renault perfectly in English.\"", rating: 5 },
  { name: "Bora K.", text: "\"Yılların tecrübesi dükkana girince hissediliyor. Fethiye'nin en iyi motor ustaları.\"", rating: 5 },
  { name: "Ahmet S.", text: "\"Klima kompresörü arızasını en uygun maliyetle çözdüler. Teşekkürler İbrahim usta.\"", rating: 5 },
  { name: "Vladimir P.", text: "\"Хороший сервис, качественные запчасти. Рекомендую.\"", rating: 5 },
  { name: "Can A.", text: "\"Triger seti değişimi için gittim, aracın diğer tüm kontrollerini de ücretsiz yapmışlar.\"", rating: 5 },
  { name: "Zeynep Y.", text: "\"WhatsApp üzerinden hemen randevu aldım. Gittiğimde hiç beklemeden aracı içeri aldılar.\"", rating: 5 },
  { name: "Tolga E.", text: "\"EGR ve partikül temizliği yapıldı. Araba resmen nefes aldı, yakıt tüketimim düştü.\"", rating: 5 },
  { name: "Cengiz F.", text: "\"Land Rover aracımın havalı süspansiyon arızasını çok kısa sürede hallettiler.\"", rating: 5 },
  { name: "Halil İ.", text: "\"Bursa'dan tatile geldim, yolda arıza yaptı. İsim benzerliği ilgimi çekti, iyi ki gitmişim. Mükemmel ilgi.\"", rating: 5 },
  { name: "Sercan U.", text: "\"40 yıllık tecrübe yalan değil. Motoru indirmeden sorunu yukarıdan çözdüler. Helal olsun.\"", rating: 5 },
  { name: "Kevin M.", text: "\"Found them on Google. Best mechanic experience I've had in Turkey. Honest and fast.\"", rating: 5 }
];

export default function Reviews() {
  const [visibleCount, setVisibleCount] = useState(4);
  const totalReviews = allReviews.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 8, totalReviews)); // Load 8 more each click
  };

  return (
    <div>
      <div className="grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {allReviews.slice(0, visibleCount).map((review, index) => (
          <div key={index} className="review-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="review-stars" style={{ color: 'var(--accent-gold)', letterSpacing: '2px', marginBottom: '1rem' }}>★★★★★</div>
            <p style={{ fontStyle: 'italic', lineHeight: '1.6' }}>{review.text}</p>
            <p style={{ color: 'var(--text-light)', fontWeight: 'bold', marginTop: '1rem' }}>- {review.name}</p>
          </div>
        ))}
      </div>
      
      {visibleCount < totalReviews && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={handleLoadMore} 
            className="btn btn-gold" 
            style={{ padding: '1rem 3rem', fontSize: '1.2rem', cursor: 'pointer', border: 'none', background: 'var(--accent-gold)', color: 'black', fontWeight: 'bold', borderRadius: '8px' }}
          >
            Daha Fazla Yorum Yükle ({totalReviews - visibleCount} Kaldı) ⬇️
          </button>
        </div>
      )}
      
      {visibleCount === totalReviews && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Tüm öne çıkan yorumları görüntülediniz.</p>
          <a href="https://www.google.com/search?q=BURSALI+OTO+SERV%C4%B0S+Yorumlar" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            Müşterimiz Misiniz? Bizi Değerlendirin
          </a>
        </div>
      )}
    </div>
  );
}

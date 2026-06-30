import Image from 'next/image';
import Gallery from '@/components/Gallery';
import TrustBadges from '@/components/TrustBadges';
import Reviews from '../../components/Reviews';
import { getTranslations } from 'next-intl/server';

export default async function Home({ params }) {
  const { locale } = await params;
  const t = await getTranslations('HomePage');

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <Image 
            src="/bg.png" 
            alt="Bursalı Oto Servis Fethiye" 
            fill 
            priority
            quality={85}
            style={{ objectFit: 'cover', zIndex: -2 }}
          />
        </div>
        <div className="hero-overlay"></div>
        
        <div className="container">
          <div className="hero-content" style={{ maxWidth: '900px' }}>
            <div style={{ display: 'flex', marginBottom: '2rem' }}>
               <span className="badge" style={{ background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.2) 0%, rgba(0,0,0,0) 100%)', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '3px', borderLeft: '4px solid var(--accent-gold)', padding: '0.8rem 1.5rem', textTransform: 'uppercase', fontSize: '0.9rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                 👑 1986'DAN BERİ 40 YILLIK USTALIK MİRASI
               </span>
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.3', marginBottom: '1.5rem', fontWeight: '900', letterSpacing: '-1px', textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
              <span style={{ color: '#fff' }}>Fethiye Premium Oto Servis:</span><br />
              <span style={{ background: 'linear-gradient(to right, #d4af37, #f3e5ab, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.3))', marginTop: '0.2rem' }}>{t('title')}</span>
            </h1>
            <p style={{ fontSize: '1.3rem', marginBottom: '3rem', color: '#e2e8f0', lineHeight: '1.7', maxWidth: '750px', fontWeight: '400', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              40 yıllık geleneksel Alman motor mekanik tecrübemizi, en son teknoloji Yapay Zeka arıza tespit cihazlarıyla birleştiriyoruz. {t('subtitle')}
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <a href="tel:+905548812021" className="btn" style={{ background: 'linear-gradient(135deg, #d4af37 0%, #aa8022 100%)', color: '#000', padding: '1.2rem 3rem', fontSize: '1.2rem', borderRadius: '50px', boxShadow: '0 10px 25px rgba(212,175,55,0.3), inset 0 2px 0 rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', border: 'none', transition: 'transform 0.2s' }} title="Acil Yol Yardım Hattı">
                <span style={{ fontSize: '1.5rem' }}>📞</span> Acil Yol Yardım Hattı
              </a>
              <a href="https://wa.me/905548812021" className="btn" style={{ background: 'rgba(212,175,55,0.1)', backdropFilter: 'blur(10px)', color: 'var(--accent-gold)', padding: '1.2rem 3rem', fontSize: '1.2rem', borderRadius: '50px', border: '1px solid rgba(212,175,55,0.5)', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', transition: 'transform 0.2s' }} target="_blank" rel="noopener noreferrer" title="WhatsApp ile İletişime Geç">
                <span style={{ fontSize: '1.5rem' }}>💬</span> WhatsApp ile İletişime Geç
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Tow Truck & Emergency Section */}
      <section id="cekici" className="services-section" style={{ background: 'rgba(255,255,255,0.02)', padding: '4rem 0', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div className="live-badge" style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '100px' }}>
            🟢 Şu An Nöbetteyiz - 7/24 Aktif
          </div>
          <h2 style={{ marginBottom: '1.5rem' }}>🛡️ 7/24 Premium Yol Yardım ve VIP Kurtarma Hizmeti</h2>
          
          <ul style={{ listStyle: 'none', maxWidth: '800px', fontSize: '1.2rem', fontWeight: '500', marginBottom: '2.5rem', textAlign: 'left', display: 'inline-block' }}>
            <li style={{ marginBottom: '0.8rem' }}>⚡ <strong>Hızlı Yönlendirme:</strong> Konum atın, hemen yola çıkalım.</li>
            <li style={{ marginBottom: '0.8rem' }}>🌙 <strong>Gece 3 Fark Etmez:</strong> Gece ekibimiz ve yol yardım araçlarımız her an hazır.</li>
            <li style={{ marginBottom: '0.8rem' }}>🚔 <strong>Maksimum Güvenlik:</strong> Premium aracınızı sıfır riskle transfer edip yetkili servis standartlarında onarıma alıyoruz.</li>
          </ul>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:+905548812021" className="btn btn-primary" style={{ background: '#e11d48', color: 'white', fontSize: '1.2rem', padding: '1rem 2rem', border: 'none' }} title="Acil Çekici Çağır">
              <span style={{ fontSize: '1rem' }}>Acil Çekici Çağır</span><br/>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📞 +90 554 881 20 21</span>
            </a>
            <a href="https://wa.me/905548812021?text=Acil%20yard%C4%B1m%20l%C3%BCtfen,%20konumumu%20g%C3%B6nderiyorum." className="btn btn-gold" style={{ fontSize: '1.2rem', padding: '1rem 2rem', display: 'flex', alignItems: 'center' }} target="_blank" rel="noopener noreferrer" title="WhatsApp Konum Gönder">
              📍 WhatsApp Konum Gönder
            </a>
          </div>
        </div>
      </section>

      {/* Trust & Credibility Section */}
      <section className="services-section container" style={{ paddingTop: '5rem', paddingBottom: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {locale === 'tr' ? 'Neden Bize Güvenmelisiniz?' : 'Why Trust Us?'}
        </h2>
        <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 1rem auto', color: '#94a3b8' }}>
          {locale === 'tr' 
            ? 'Babadan oğula geçen 40 yıllık dürüst ustalık mirası, Alman marka araçlarda yetkili servis standartları.' 
            : '40 years of honest father-to-son mastery, combined with authorized service standards for German vehicles.'}
        </p>
        
        <TrustBadges locale={locale} />
      </section>

      {/* Services Grid */}
      <section id="uzmanlik" className="services-section container">
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Üst Düzey Mühendislik Çözümleri</h2>
        <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          Aracınızın marka ve modeline özel, orijinal lisanslı diyagnostik cihazlarımızla 
          kusursuz arıza tespiti ve garantili onarım gerçekleştiriyoruz.
        </p>

        <div className="grid">
          {/* Card 1: Diagnostic */}
          <div className="glass-panel service-card">
            <div className="service-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
            <h3>Orijinal Ekipmanlarla Diagnostik</h3>
            <p>
              Porsche için <strong>PIWIS</strong>, VAG grubu için <strong>ODIS</strong> 
              ve BMW/Mercedes özel orijinal servis yazılımlarıyla kusursuz arıza tespiti sağlıyoruz. 
              Deneme yanılma yöntemlerini geride bırakın.
            </p>
          </div>

          {/* Card 2: Transmission */}
          <div className="glass-panel service-card">
            <div className="service-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </div>
            <h3>Şanzıman ve Motor Revizyonu</h3>
            <p>
              Premium araçların kalbi olan motor ve şanzıman sistemlerinde (Örn: Volvo Aisin şanzımanlar)
              sadece %100 orijinal OEM parçalar kullanarak uzun ömürlü garantili çözümler sunuyoruz.
            </p>
          </div>

          {/* Card 3: VIP Fleet */}
          <div id="filo" className="glass-panel service-card">
            <div className="service-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <h3>VIP Transfer Filoları (Gece Bakımı)</h3>
            <p>
              Turizm sezonunda operasyonunuz kesintiye uğramasın! VIP Vito ve Crafter filolarınız 
              için özel <strong>Gece Vardiyası Bakımı</strong> sunuyoruz. Akşam teslim edin, sabah işinize güvenle devam edin.
            </p>
          </div>
        </div>
      </section>

      {/* Expat / Tourist Section (4 Languages) */}
      <section id="yabanci" className="services-section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)' }}>
              VIP Tourist & Expat Services
            </span>
            <h2 style={{ color: 'white' }}>We Speak English, Russian, Arabic & Ukrainian</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '2rem', textAlign: 'left', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ color: 'var(--accent-gold)' }}>🇬🇧 English</h3>
                  <p>Wait in our air-conditioned lounge. No "tourist traps", 100% transparent pricing.</p>
                </div>
                <a href="https://wa.me/905548812021?text=Hello!%20My%20car%20broke%20down.%20I%20need%20a%20tow%20truck%20%2F%20urgent%20help!" className="btn btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center', padding: '0.8rem', marginTop: '1rem' }} target="_blank" rel="noopener noreferrer" title="English Support">
                  🚨 Get Urgent Help
                </a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ color: 'var(--accent-gold)' }}>🇷🇺 Русский</h3>
                  <p>Честные цены без наценок для иностранцев. Оригинальные запчасти.</p>
                </div>
                <a href="https://wa.me/905548812021?text=Здравствуйте!%20Моя%20машина%20сломалась.%20Мне%20нужен%20эвакуатор%20%2F%20срочная%20помощь!" className="btn btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center', padding: '0.8rem', marginTop: '1rem' }} target="_blank" rel="noopener noreferrer" title="Russian Support">
                  🚨 Срочная помощь
                </a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ color: 'var(--accent-gold)' }}>🇦🇪 عربي</h3>
                  <p>خدمة كبار الشخصيات (VIP). السرية التامة وخدمة استلام السيارة.</p>
                </div>
                <a href="https://wa.me/905548812021?text=مرحباً،%20أحتاج%20إلى%20مساعدة%20عاجلة!" className="btn btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center', padding: '0.8rem', marginTop: '1rem' }} target="_blank" rel="noopener noreferrer" title="Arabic Support">
                  🚨 مساعدة عاجلة
                </a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ color: 'var(--accent-gold)' }}>🇺🇦 Українська</h3>
                  <p>Чесні послуги та якісний ремонт. Гарантія на всі виконані роботи.</p>
                </div>
                <a href="https://wa.me/905548812021?text=Добрий%20день!%20Моя%20машина%20зламалася.%20Мені%20потрібна%20допомога!" className="btn btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center', padding: '0.8rem', marginTop: '1rem' }} target="_blank" rel="noopener noreferrer" title="Ukrainian Support">
                  🚨 Термінова допомога
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Reviews Section */}
      <section className="services-section container">
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Müşterilerimiz Ne Diyor? (Google Yorumları)</h2>
        <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          Gerçek müşteri deneyimleri ve 5 yıldızlı hizmet kalitemiz.
        </p>

        <Reviews />
      </section>

      {/* Popular SEO Subpages */}
      <section className="services-section container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Özel Hizmetlerimiz</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
          <a href={`/${locale}/porsche-mercedes-ozel-servis`} className="btn btn-gold" style={{ background: 'transparent', border: '1px solid var(--gold)' }} title="Porsche & Premium Araç Servisi">Porsche & Premium Araç Servisi</a>
          <a href={`/${locale}/english-speaking-mechanic`} className="btn btn-gold" style={{ background: 'transparent', border: '1px solid var(--gold)' }} title="English Speaking Mechanic Fethiye">English Speaking Mechanic</a>
          <a href={`/${locale}/fethiye-7-24-oto-cekici`} className="btn btn-gold" style={{ background: 'transparent', border: '1px solid var(--gold)' }} title="Fethiye 7/24 Acil Oto Çekici">7/24 Acil Oto Çekici</a>
          <a href={`/${locale}/vip-filo-gece-bakimi`} className="btn btn-gold" style={{ background: 'transparent', border: '1px solid var(--gold)' }} title="VIP Filo Gece Bakımı (Night-Shift)">VIP Filo Gece Bakımı (Night-Shift)</a>
          <a href={`/${locale}/otomatik-sanziman-tamiri`} className="btn btn-gold" style={{ background: 'transparent', border: '1px solid var(--gold)' }} title="Otomatik Şanzıman Tamiri Fethiye">Otomatik Şanzıman Tamiri</a>
        </div>
      </section>

      {/* Google Photos Gallery */}
      <section className="services-section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <Gallery />
      </section>

      {/* Contact & Map Section */}
      <section id="iletisim" className="services-section container">
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>İletişim & Konum</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel">
            <h3 style={{ color: 'var(--accent-gold)' }}>İletişim Bilgilerimiz</h3>
            <p><strong>Adres:</strong> Taşyaka Mahallesi, Yeni Sanayi Sitesi, 264. Sokak, No: 1, 48300 Fethiye/Muğla</p>
            <p><strong>Telefon (İbrahim Bekiç):</strong> <a href="tel:+905548812021" style={{ color: 'var(--accent-blue)' }}>+90 554 881 20 21</a></p>
            <p><strong>Sabit Hat:</strong> <a href="tel:+902526141586" style={{ color: 'var(--text-light)' }}>0252 614 15 86</a></p>
            <p><strong>Çalışma Saatleri:</strong> Pazartesi - Cumartesi (08:30 - 19:30)</p>
            <div style={{ marginTop: '2rem' }}>
              <a href="https://wa.me/905548812021" className="btn btn-gold" style={{ display: 'block', textAlign: 'center' }}>
                WhatsApp Destek Hattı
              </a>
            </div>
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden', minHeight: '300px' }}>
            <iframe 
              title="Bursalı Oto Servis Fethiye Harita Konumu"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12762.651717887754!2d29.1246738!3d36.6253456!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14c043e0988089bf%3A0x8f2d593f0b2f6385!2sBURSALI%20OTO%20SERV%C4%B0S!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="services-section container" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>Sıkça Sorulan Sorular</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-light)', fontSize: '1.3rem' }}>Fethiye&apos;de arıza yapan premium aracım için nasıl çekici çağırabilirim?</h3>
            <p style={{ marginBottom: 0 }}>Sadece iletişim numaramızdan (veya WhatsApp üzerinden) konum atmanız yeterlidir. 7/24 aktif olan premium oto kurtarma aracımızla, aracınızın markası ne olursa olsun (BMW, Porsche, Mercedes vb.) sıfır hasar riskiyle bulunduğunuz noktadan alıyor ve kameralı güvenli otoparkımıza çekiyoruz.</p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-light)', fontSize: '1.3rem' }}>Orijinal parça garantisi veriyor musunuz?</h3>
            <p style={{ marginBottom: 0 }}>Kesinlikle. Premium segment Alman araçlarında (Audi, Volkswagen, Mercedes, BMW, Porsche) motor ve şanzıman revizyonları dahil olmak üzere yapılan tüm işlemlerde %100 orijinal (OEM) yedek parçalar kullanmaktayız. Aracınızın fabrika standartlarından ödün vermiyoruz.</p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-light)', fontSize: '1.3rem' }}>Arıza tespiti için hangi cihazları kullanıyorsunuz?</h3>
            <p style={{ marginBottom: 0 }}>Bursalı Oto Servis olarak &quot;deneme yanılma&quot; yöntemini tamamen reddediyoruz. Porsche araçlar için orijinal PIWIS cihazı, Volkswagen grubu (Audi, Seat, Skoda, VW) için ODIS cihazı ve diğer premium markalar için lisanslı yazılımlar kullanarak noktasal arıza tespiti (Diagnostic) yapıyoruz.</p>
          </div>

        </div>
      </section>

      {/* SEO Content Block */}
      <section className="services-section container" style={{ paddingTop: '1rem', paddingBottom: '3rem', borderTop: '1px solid var(--glass-border)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem' }}>Fethiye Oto Tamir ve Premium Araç Özel Servisi</h2>
        <div style={{ color: 'var(--text-light)', lineHeight: '1.8', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>
            Bursalı Oto Servis olarak Fethiye sanayi sitesinde, özellikle Alman marka araçlar (BMW, Mercedes-Benz, Audi, Porsche, Volkswagen) ve premium segment otomobiller için yetkili servis kalitesinde özel servis hizmeti sunuyoruz. Amacımız, Fethiye ve çevresindeki premium araç sahiplerinin, araçlarını güvenle teslim edebilecekleri, şeffaf ve profesyonel bir bakım onarım merkezi olmaktır.
          </p>
          <p>
            Modern otomobiller karmaşık elektronik sistemlere ve hassas motor dinamiklerine sahiptir. Bu nedenle, sıradan arıza tespit cihazları yerine Porsche için PIWIS, VAG grubu için ODIS gibi sadece yetkili servislerin kullandığı orijinal lisanslı cihazlar kullanıyoruz. Bu donanımlar sayesinde deneme yanılma yöntemlerini tamamen ortadan kaldırıyor, noktasal arıza tespiti ile hem zamandan hem de gereksiz parça değişim maliyetlerinden tasarruf etmenizi sağlıyoruz.
          </p>
          <p>
            Hizmetlerimiz sadece mekanik onarımla sınırlı değildir. Fethiye'de 7/24 acil oto çekici ve yol yardım hizmetimiz ile yolda kaldığınız an yanınızdayız. Premium aracınızı sıfır hasar riskiyle kurtarıyor ve 7/24 kameralı güvenli otoparkımıza çekiyoruz. Ayrıca periyodik bakım, ağır bakım, otomatik şanzıman revizyonu (Aisin, ZF vb.), motor revizyonu ve DPF (Dizel Partikül Filtresi) temizliği gibi kritik işlemleri garantili olarak, orijinal veya üst düzey OEM yedek parçalar kullanarak gerçekleştiriyoruz. Fethiye'deki yabancı misafirlerimiz için İngilizce, Rusça, Arapça ve Ukraynaca dillerinde iletişim kurabilen uluslararası bir ekiple çalışmaktan gurur duyuyoruz.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem 0', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <h3 style={{ color: 'var(--text-light)' }}>BURSALI OTO SERVİS</h3>
          <p>Yeni Sanayi Sitesi, Fethiye / Muğla</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', margin: '1.5rem 0' }}>
            <a href="https://instagram.com/bursaliotoservis" target="_blank" rel="noopener noreferrer" title="Instagram Profilimiz" style={{ color: 'var(--accent-gold)' }}>Instagram</a>
            <a href="https://facebook.com/bursaliotoservis" target="_blank" rel="noopener noreferrer" title="Facebook Profilimiz" style={{ color: 'var(--accent-gold)' }}>Facebook</a>
            <a href="https://twitter.com/bursalioto" target="_blank" rel="noopener noreferrer" title="X (Twitter) Profilimiz" style={{ color: 'var(--accent-gold)' }}>X (Twitter)</a>
            <a href="https://linkedin.com/company/bursaliotoservis" target="_blank" rel="noopener noreferrer" title="LinkedIn Profilimiz" style={{ color: 'var(--accent-gold)' }}>LinkedIn</a>
            <a href="https://youtube.com/bursaliotoservis" target="_blank" rel="noopener noreferrer" title="YouTube Kanalımız" style={{ color: 'var(--accent-gold)' }}>YouTube</a>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
            © {new Date().getFullYear()} Bursalı Oto Servis. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/905548812021" 
        style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#25D366', color: 'white', padding: '15px', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-label="WhatsApp Destek"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
      </a>
    </main>
  )
}

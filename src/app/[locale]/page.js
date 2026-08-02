import Image from 'next/image';
import TrustBadges from '@/components/TrustBadges';
import { getTranslations } from 'next-intl/server';
import { container } from '@/application/di/container';
import { buildCanonical } from '@/lib/seo/canonical';
import { setRequestLocale } from 'next-intl/server';
import Reveal from '@/components/anim/Reveal';
import dynamic from 'next/dynamic';
import { arizaUrl } from '@/lib/urls';

const Reviews = dynamic(() => import('../../components/Reviews'), { 
  loading: () => <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Yorumlar yükleniyor...</div>
});
const MapFacade = dynamic(() => import('@/components/MapFacade'), { 
  loading: () => <div style={{ height: '320px', background: '#2a2a2a', borderRadius: '16px' }}>Harita yükleniyor...</div>
});
const Gallery = dynamic(() => import('@/components/Gallery'), {
  loading: () => <div style={{ height: '200px' }} />
});
const ImageUploader = dynamic(() => import('@/components/ai/ImageUploader'), {
  loading: () => <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Vision AI yükleniyor...</div>
});

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return {
    alternates: buildCanonical(locale, ''),
  };
}

export default async function Home({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('HomePage');
  const recentFaults = (await container.getSortedPostsUseCase.execute(locale, 'faults')).slice(0, 4);

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <Image 
            src="/bg.webp" 
            alt="Bursalı Oto Servis Fethiye" 
            fill 
            priority
            fetchPriority="high"
            sizes="(max-width: 1600px) 100vw, 1600px"
            quality={75}
            style={{ objectFit: 'cover', zIndex: -2 }}
          />
        </div>
        <div className="hero-overlay"></div>
        
        <div className="container">
          <div className="hero-content" style={{ maxWidth: '900px' }}>
            <div style={{ display: 'flex', marginBottom: '2rem' }}>
               <span className="badge" style={{ background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.2) 0%, rgba(0,0,0,0) 100%)', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '3px', borderLeft: '4px solid var(--accent-gold)', padding: '0.8rem 1.5rem', textTransform: 'uppercase', fontSize: '0.9rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                 {t('heroBadge')}
               </span>
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.3', marginBottom: '1.5rem', fontWeight: '900', letterSpacing: '-1px', textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
              <span style={{ color: '#fff' }}>{t('heroTitlePrefix')}</span><br />
              <span style={{ background: 'linear-gradient(to right, #d4af37, #f3e5ab, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', marginTop: '0.2rem' }}>{t('title')}</span>
            </h1>
            <p style={{ fontSize: '1.3rem', marginBottom: '3rem', color: '#e2e8f0', lineHeight: '1.7', maxWidth: '750px', fontWeight: '400', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {t('subtitle')}
            </p>
            <div className="btn-group">
              <a href="tel:+905548812021" className="btn btn-hero-gold" aria-label="Acil Yol Yardım Hattı" title="Acil Yol Yardım Hattı">
                <span style={{ fontSize: '1.5rem' }} aria-hidden="true">📞</span> {t('btnEmergency')}
              </a>
              <a href="https://wa.me/905548812021" className="btn btn-hero-glass" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp ile İletişime Geç" title="WhatsApp ile İletişime Geç">
                <span style={{ fontSize: '1.5rem' }} aria-hidden="true">💬</span> {t('btnWhatsapp')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Tow Truck & Emergency Section */}
      <section id="cekici" className="services-section section-dark">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div className="service-badge badge-gold">
            {t('towBadge')}
          </div>
          <h2 style={{ marginBottom: '1.5rem' }}>{t('towTitle')}</h2>
          
          <ul style={{ listStyle: 'none', maxWidth: '800px', fontSize: '1.2rem', fontWeight: '500', marginBottom: '2.5rem', textAlign: 'left', display: 'inline-block' }}>
            <li style={{ marginBottom: '0.8rem' }}><strong>{t('towBullet1Title')}</strong>{t('towBullet1Desc')}</li>
            <li style={{ marginBottom: '0.8rem' }}><strong>{t('towBullet2Title')}</strong>{t('towBullet2Desc')}</li>
            <li style={{ marginBottom: '0.8rem' }}><strong>{t('towBullet3Title')}</strong>{t('towBullet3Desc')}</li>
          </ul>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:+905548812021" className="btn btn-primary" style={{ background: '#e11d48', color: 'white', fontSize: '1.2rem', padding: '1rem 2rem', border: 'none' }} aria-label="Acil Çekici Çağır" title="Acil Çekici Çağır">
              <span style={{ fontSize: '1rem' }}>{t('btnTowCall')}</span><br/>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📞 +90 554 881 20 21</span>
            </a>
            <a href="https://wa.me/905548812021?text=Acil%20yard%C4%B1m%20l%C3%BCtfen,%20konumumu%20g%C3%B6nderiyorum." className="btn btn-gold" style={{ fontSize: '1.2rem', padding: '1rem 2rem', display: 'flex', alignItems: 'center' }} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Konum Gönder" title="WhatsApp Konum Gönder">
              <span aria-hidden="true">📍</span> {t('btnTowWhatsapp')}
            </a>
          </div>
        </div>
      </section>

      {/* Vision AI Section */}
      <section className="services-section container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
          Otonom Tamir Asistanı (Vision AI)
        </h2>
        <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2rem auto', color: '#94a3b8' }}>
          Arızalı parçanın (örn. çatlak hortumlar, aşınmış kayışlar veya sensör arızaları) fotoğrafını çekin, bilgisayarlı görü (Computer Vision) gücüyle yapay zekamız hasarı saniyeler içinde analiz edip teşhis koysun. Bu sistem, görsel verileri binlerce benzer arıza vakasıyla karşılaştırarak en olası hata kodlarını (DTC) ve en etkili çözüm yollarını sunar.
        </p>
        <ImageUploader />
      </section>

      {/* Trust & Credibility Section */}
      <section className="services-section container" style={{ paddingTop: '5rem', paddingBottom: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {t('trustTitle')}
        </h2>
        <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 1rem auto', color: '#94a3b8' }}>
          {t('trustDesc')}
        </p>
        
        <TrustBadges locale={locale} />
      </section>

      {/* Services Grid */}
      <section id="uzmanlik" className="services-section container">
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>{t('servicesTitle')}</h2>
        <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 1rem auto' }}>
          {t('servicesDesc')}
        </p>
        <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto', color: '#94a3b8', fontSize: '0.95rem' }}>
          Alman premium markaların (BMW, Mercedes, Audi, Porsche, Volkswagen) yanı sıra Jaguar, Land Rover, Volvo ve Tesla gibi diğer seçkin ve yenilikçi otomobil gruplarına da üst düzey periyodik bakım, teşhis ve mekanik servis hizmetleri sunmaktayız.
        </p>

        <div className="grid">
          {/* Card 1: Diagnostic */}
          <div className="glass-panel service-card">
            <div className="service-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
            <h3>{t('diagTitle')}</h3>
            <p>{t('diagDesc')}</p>
          </div>

          {/* Card 2: Transmission */}
          <div className="glass-panel service-card">
            <div className="service-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </div>
            <h3>{t('transTitle')}</h3>
            <p>{t('transDesc')}</p>
          </div>

          {/* Card 3: VIP Fleet */}
          <div id="filo" className="glass-panel service-card">
            <div className="service-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <h3>{t('vipTitle')}</h3>
            <p>{t('vipDesc')}</p>
          </div>
        </div>
      </section>

      {/* Expat / Tourist Section (4 Languages) */}
      <section id="yabanci" className="services-section section-dark">
        <div className="container">
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <span className="badge" style={{ background: 'rgba(96, 165, 250, 0.25)', color: '#93c5fd', borderColor: 'rgba(96, 165, 250, 0.5)' }}>
              {t('expatBadge')}
            </span>
            <h2 style={{ color: 'white' }}>{t('expatTitle')}</h2>
            
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
      <Reveal className="services-section container">
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>{t('reviewsTitle')}</h2>
        <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          {t('reviewsDesc')}
        </p>

        <Reviews />
      </Reveal>

      {/* SEO Internal Linking: Recent Faults */}
      {recentFaults && recentFaults.length > 0 && (
        <Reveal delay={0.5} className="services-section container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ marginBottom: '0.5rem' }}>{t('faultsTitle')}</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>{t('faultsDesc')}</p>
            </div>
            <a href={`/${locale}/ariza-cozumleri`} className="btn btn-gold" aria-label="Tüm Arıza Çözümlerini Gör" title="Tüm Arıza Çözümlerini Gör" style={{ padding: '0.8rem 1.5rem', background: 'transparent', border: '1px solid var(--accent-gold)' }}>
              {t('faultsBtn')}
            </a>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {recentFaults.map(fault => (
              <a key={fault.id} href={arizaUrl(locale, fault)} aria-label={`${fault.title} Detayları`} className="glass-panel hover-gold-border" style={{ display: 'block', padding: '1.5rem', textDecoration: 'none' }}>
                <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-gold)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  {fault.brand}
                </span>
                <h3 style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>{fault.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{t('faultsModels')} {fault.model}</p>
              </a>
            ))}
          </div>
        </Reveal>
      )}

      {/* Popular SEO Subpages */}
      <Reveal delay={1} className="services-section container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{t('specialServicesTitle')}</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
          <a href={`/${locale}/porsche-mercedes-ozel-servis`} className="btn btn-gold" style={{ background: 'transparent', border: '1px solid var(--gold)' }} title="Porsche & Premium Araç Servisi">Porsche & Premium Araç Servisi</a>
          <a href={`/${locale}/english-speaking-mechanic`} className="btn btn-gold" style={{ background: 'transparent', border: '1px solid var(--gold)' }} title="English Speaking Mechanic Fethiye">English Speaking Mechanic</a>
          <a href={`/${locale}/fethiye-7-24-oto-cekici`} className="btn btn-gold" style={{ background: 'transparent', border: '1px solid var(--gold)' }} title="Fethiye 7/24 Acil Oto Çekici">7/24 Acil Oto Çekici</a>
          <a href={`/${locale}/vip-filo-gece-bakimi`} className="btn btn-gold" style={{ background: 'transparent', border: '1px solid var(--gold)' }} title="VIP Filo Gece Bakımı (Night-Shift)">VIP Filo Gece Bakımı (Night-Shift)</a>
          <a href={`/${locale}/otomatik-sanziman-tamiri`} className="btn btn-gold" style={{ background: 'transparent', border: '1px solid var(--gold)' }} title="Otomatik Şanzıman Tamiri Fethiye">Otomatik Şanzıman Tamiri</a>
        </div>
      </Reveal>

      {/* Google Photos Gallery */}
      <section className="services-section section-dark">
        <Gallery />
      </section>

      {/* Contact & Map Section */}
      <section id="iletisim" className="services-section container">
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>{t('contactTitle')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel">
            <h3 style={{ color: 'var(--accent-gold)' }}>{t('contactInfoTitle')}</h3>
            <p><strong>Adres:</strong> {t('contactAddress')}</p>
            <p><strong>{t('contactPhone1')}</strong> <a href="tel:+905548812021" style={{ color: '#93c5fd', textDecoration: 'underline', textUnderlineOffset: '3px' }}>+90 554 881 20 21</a></p>
            <p><strong>{t('contactPhone2')}</strong> <a href="tel:+902526141586" style={{ color: 'var(--text-light)' }}>0252 614 15 86</a></p>
            <p><strong>Çalışma Saatleri:</strong> {t('contactHours')}</p>
            <div style={{ marginTop: '2rem' }}>
              <a href="https://wa.me/905548812021" className="btn btn-gold" style={{ display: 'block', textAlign: 'center' }} target="_blank" rel="noopener noreferrer" title="WhatsApp ile İletişim Kurun">
                {t('contactWhatsappBtn')}
              </a>
            </div>
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden', minHeight: '320px' }}>
            <MapFacade />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Reveal className="services-section container" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>{t('faqTitle')}</h2>
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
      </Reveal>

      {/* SEO Content Block */}
      <Reveal delay={1} className="services-section container" style={{ paddingTop: '1rem', paddingBottom: '3rem', borderTop: '1px solid var(--glass-border)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem' }}>{t('seoBlockTitle')}</h2>
        <div style={{ color: 'var(--text-light)', lineHeight: '1.8', fontSize: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>{t('seoBlockP1')}</p>
          <p>{t('seoBlockP2')}</p>
          <p>{t('seoBlockP3')}</p>
        </div>
      </Reveal>

      {/* Footer */}
      <footer style={{ padding: '3rem 0', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <h3 style={{ color: 'var(--text-light)' }}>BURSALI OTO SERVİS</h3>
          <p>{t('footerAddress')}</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', margin: '1.5rem 0', flexWrap: 'wrap' }}>
            <a href={`/${locale}/hakkimizda`} title="Hakkımızda" style={{ color: 'var(--text-light)', textDecoration: 'none', padding: '12px 0', minWidth: '48px', display: 'inline-block' }}>{t('footerAbout')}</a>
            <a href={`/${locale}/seffaf-fiyatlandirma`} title="Şeffaf Fiyatlandırma" style={{ color: 'var(--text-light)', textDecoration: 'none', padding: '12px 0', minWidth: '48px', display: 'inline-block' }}>{t('footerPricing')}</a>
            <a href={`/${locale}/ariza-cozumleri`} title="Arıza Çözümleri" style={{ color: 'var(--text-light)', textDecoration: 'none', padding: '12px 0', minWidth: '48px', display: 'inline-block' }}>{t('footerFaults')}</a>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', margin: '1.5rem 0', flexWrap: 'wrap' }}>
            <a href="https://instagram.com/bursaliotoservis" target="_blank" rel="noopener noreferrer" title="Instagram Profilimiz" style={{ color: 'var(--accent-gold)', padding: '12px 0', minWidth: '48px', display: 'inline-block' }}>Instagram</a>
            <a href="https://facebook.com/bursaliotoservis" target="_blank" rel="noopener noreferrer" title="Facebook Profilimiz" style={{ color: 'var(--accent-gold)', padding: '12px 0', minWidth: '48px', display: 'inline-block' }}>Facebook</a>
            <a href="https://twitter.com/bursalioto" target="_blank" rel="noopener noreferrer" title="X (Twitter) Profilimiz" style={{ color: 'var(--accent-gold)', padding: '12px 0', minWidth: '48px', display: 'inline-block' }}>X (Twitter)</a>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
            {t('footerCopyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>


      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Fethiye'de arıza yapan premium aracım için nasıl çekici çağırabilirim?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sadece iletişim numaramızdan (veya WhatsApp üzerinden) konum atmanız yeterlidir. 7/24 aktif olan premium oto kurtarma aracımızla, aracınızın markası ne olursa olsun (BMW, Porsche, Mercedes vb.) sıfır hasar riskiyle bulunduğunuz noktadan alıyor ve kameralı güvenli otoparkımıza çekiyoruz."
                }
              },
              {
                "@type": "Question",
                "name": "Orijinal parça garantisi veriyor musunuz?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Kesinlikle. Premium segment Alman araçlarında (Audi, Volkswagen, Mercedes, BMW, Porsche) motor ve şanzıman revizyonları dahil olmak üzere yapılan tüm işlemlerde %100 orijinal (OEM) yedek parçalar kullanmaktayız. Aracınızın fabrika standartlarından ödün vermiyoruz."
                }
              },
              {
                "@type": "Question",
                "name": "Arıza tespiti için hangi cihazları kullanıyorsunuz?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Bursalı Oto Servis olarak 'deneme yanılma' yöntemini tamamen reddediyoruz. Porsche araçlar için orijinal PIWIS cihazı, Volkswagen grubu (Audi, Seat, Skoda, VW) için ODIS cihazı ve diğer premium markalar için lisanslı yazılımlar kullanarak noktasal arıza tespiti (Diagnostic) yapıyoruz."
                }
              }
            ]
          })
        }}
      />
    </main>
  )
}

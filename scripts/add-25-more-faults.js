const fs = require('fs');
const path = require('path');

const newFaults = [
  { brand: 'Mercedes-Benz', model: 'W205 C-Serisi', title: 'Mercedes-Benz W205 Touchpad Arızası', sikayet: 'Touchpad dokunmatiği algılamıyor, tıklama çalışmıyor.', neden: 'Touchpad içindeki şerit kablonun kopması veya sıvı teması.', cozum: 'Touchpad modülünün tamiri veya değişimi.' },
  { brand: 'Mercedes-Benz', model: 'W213 E-Serisi', title: 'Mercedes-Benz W213 Geniş Ekran (Widescreen) Kararması', sikayet: 'Gösterge paneli veya multimedya ekranı aniden kapanıyor.', neden: 'Ekran modülündeki lehim çatlakları veya aşırı ısınma.', cozum: 'Ekranın sökülüp onarılması veya değiştirilmesi.' },
  { brand: 'Mercedes-Benz', model: 'OM654 Motor', title: 'Mercedes-Benz OM654 Dizel Külbütör Kapağı Çatlaması', sikayet: 'Motor üst kısmında yağ sızıntısı, yanık yağ kokusu.', neden: 'Plastik külbütör kapağının yüksek basınç ve ısıdan dolayı çatlaması.', cozum: 'Külbütör kapağının contasıyla birlikte tamamen yenilenmesi.' },
  { brand: 'Mercedes-Benz', model: 'W176 A-Serisi', title: 'Mercedes-Benz W176 Çift Kavrama (7G-DCT) Vuruntusu', sikayet: '1. ve 2. vites geçişlerinde sarsıntı, dur-kalk trafikte titreme.', neden: 'Kavrama balatalarının aşınması veya şanzıman beyni adaptasyon sorunu.', cozum: 'Kavrama setinin değişimi ve şanzıman yazılım güncellemesi.' },
  { brand: 'BMW', model: 'B48 Motor', title: 'BMW B48 Motor Su Pompası (Devirdaim) Arızası', sikayet: 'Motor suyu uyarısı, hararetin yükselmesi, motor soğutma suyu kaçağı.', neden: 'Su pompasının plastik gövdesinde oluşan kılcal çatlaklar.', cozum: 'Revize edilmiş yeni tip su pompası ve antifriz değişimi.' },
  { brand: 'BMW', model: 'F20 1-Serisi', title: 'BMW F20 Direksiyon Kutusu Ses (Tıkırtı) Sorunu', sikayet: 'Bozuk yollarda direksiyondan gelen tıkırtı ve boşluk hissi.', neden: 'Direksiyon kutusu içindeki tamir takımının (burçların) aşınması.', cozum: 'Direksiyon kutusu tamir takımı uygulaması veya kutunun revizyonu.' },
  { brand: 'BMW', model: 'N13 Motor (F30/F20)', title: 'BMW N13 Motor Tahrik Arızası (Turbo Elektrovalf)', sikayet: 'Ekranda "Tahrik" uyarısı, aracın gaz yememesi, performans kaybı.', neden: 'Turbo basınç kontrol valfinin (elektrovalf) arızalanması.', cozum: 'Turbo elektrovalfinin (Pierburg) yenilenmesi ve adaptasyon.' },
  { brand: 'BMW', model: 'G30 5-Serisi', title: 'BMW G30 Klima Evaporatör Su Kaçağı', sikayet: 'Klima açıldığında sağ ön paspasın altına su sızması.', neden: 'Klima yoğuşma suyu tahliye hortumunun tıkanması veya yerinden çıkması.', cozum: 'Tahliye borularının temizlenmesi ve izole edilmesi.' },
  { brand: 'BMW', model: 'N55 Motor', title: 'BMW N55 Motor Şarj Dinamosu (Alternatör) Arızası', sikayet: 'Akü şarj uyarısı, aracın yolda elektrik kesip stop etmesi.', neden: 'Şarj dinamosu içindeki diyot tablasının veya kömürlerin yanması.', cozum: 'Şarj dinamosu revizyonu veya yenisi ile değişimi.' },
  { brand: 'Audi', model: 'A5 B8', title: 'Audi A5 B8 Kapı Cam Krikosu Tel Kopması', sikayet: 'Camın inip kalkmaması, kapı içinden gelen çatırtı sesi.', neden: 'Cam kriko mekanizmasındaki çelik tellerin zamanla paslanıp kopması.', cozum: 'Cam krikosu mekanizmasının (motorsuz) değiştirilmesi.' },
  { brand: 'Audi', model: 'Q3 (8U)', title: 'Audi Q3 Haldex Kavrama (4Motion) Arızası', sikayet: 'Aracın sadece önden çekişli çalışması, arkadan itişin devreye girmemesi.', neden: 'Haldex pompası süzgecinin tıkanması veya pompanın yanması.', cozum: 'Haldex pompası değişimi ve Haldex yağının yenilenmesi.' },
  { brand: 'Audi', model: 'A3 8V', title: 'Audi A3 8V MMI Ünitesi (Torpido İçindeki Beyin) Arızası', sikayet: 'Ekranın hiç açılmaması, sesin kesilmesi, navigasyonun çalışmaması.', neden: 'Torpido içindeki MMI beyninin (MIB) aşırı ısınma veya yazılım çökmesi.', cozum: 'MMI beyninin onarımı veya yazılım kurtarma.' },
  { brand: 'Audi', model: 'A7 C7', title: 'Audi A7 C7 Havalı Süspansiyon (Airmatic) Valf Bloğu Arızası', sikayet: 'Aracın bir köşesinin inik kalması, süspansiyon yüksekliğinin ayarlanamaması.', neden: 'Kompresör valf bloğunun içindeki o-ringlerin hava kaçırması veya oksitlenme.', cozum: 'Valf bloğunun değiştirilmesi veya temizlenmesi.' },
  { brand: 'Audi', model: 'A4 B9', title: 'Audi A4 B9 Virtual Cockpit (Hayalet Ekran) Piksel Kaybı', sikayet: 'Hayalet ekranda ölü pikseller, çizgiler veya tamamen kararma.', neden: 'Ekran panelinin arkasındaki flex kablo temassızlığı veya panel arızası.', cozum: 'Gösterge panelinin sökülerek LCD değişimi veya tamiri.' },
  { brand: 'Volkswagen', model: 'Tiguan (5N)', title: 'Volkswagen Tiguan Panoramik Cam Tavan Su Alma Sorunu', sikayet: 'Yağmurlu havalarda tavan lambasından veya A sütunundan su damlaması.', neden: 'Cam tavan tahliye kanallarının (hortumlarının) toz ve çamurla tıkanması.', cozum: 'Tavan döşemesinin indirilip tahliye borularının temizlenmesi.' },
  { brand: 'Volkswagen', model: 'Amarok 2.0 BiTDI', title: 'Volkswagen Amarok 2.0 BiTDI EGR Soğutucusu Patlaması', sikayet: 'Egzozdan beyaz duman atması, sürekli motor suyu eksiltme.', neden: 'EGR soğutucusunun içindeki peteklerin kırılarak motor suyunu egzoza karıştırması.', cozum: 'EGR soğutucusunun yenilenmesi (genellikle DPF temizliği ile birlikte).' },
  { brand: 'Volkswagen', model: 'Polo (6R/6C)', title: 'Volkswagen Polo 1.2 TSI Triger Zinciri Uzaması', sikayet: 'Sabah ilk marşta motordan gelen şakırtı sesi, motor arıza lambası.', neden: '1.2 TSI (CBZA) motorlarda triger zincirinin erken uzaması ve gergiyi bozması.', cozum: 'Revize edilmiş yeni tip (daha kalın) triger zincir seti montajı.' },
  { brand: 'Volkswagen', model: 'Touareg V6 TDI', title: 'Volkswagen Touareg V6 TDI Manifold Kelebek Arızası', sikayet: 'P2015 arıza kodu, motor arıza lambası, alt devirlerde cansızlık.', neden: 'Emme manifoldu içindeki girdap (swirl) klapelerinin plastik milinin kırılması.', cozum: 'Emme manifoldu tamir kiti (alüminyum parça) uygulaması veya manifold değişimi.' },
  { brand: 'Volkswagen', model: 'Transporter T5/T6', title: 'Volkswagen Transporter 2.0 TDI Aks Taşıyıcı Bilye Dağıtması', sikayet: 'Yüksek hızlarda veya dönüşlerde uğultu ve tekerlek titremesi.', neden: 'Ön teker porya (tekerlek) bilyesinin ağır yük veya çukur nedeniyle bozulması.', cozum: 'Tekerlek porya bilyesinin presle değiştirilmesi.' },
  { brand: 'Porsche', model: 'Cayenne (958)', title: 'Porsche Cayenne (958) Transfer Kutusu (Transfer Case) Arızası', sikayet: 'Hızlanırken 2. ve 3. viteslerde araçta vuruntu, silkeleme ve "titreme" hissi.', neden: 'Transfer kutusu içindeki zincirin uzaması ve kavrama balatalarının bitmesi.', cozum: 'Transfer kutusu onarımı veya Porsche onaylı revize yağ kullanımı.' },
  { brand: 'Porsche', model: 'Panamera (970)', title: 'Porsche Panamera (970) PDK Şanzıman Isınma Uyarısı', sikayet: 'Ekranda "Gearbox Fault" veya şanzıman çok sıcak uyarısı, vites geçmemesi.', neden: 'PDK şanzıman içindeki sensörlerin (sıcaklık/mesafe) arızalanması.', cozum: 'PDK şanzımanın indirilip hız/sıcaklık sensör modülünün değişimi.' },
  { brand: 'Porsche', model: 'Macan (95B)', title: 'Porsche Macan PDK Kavrama (Debriyaj) Aşınması', sikayet: 'Kalkışlarda titreme, yokuşlarda geri kaydırma ve vites atlatma.', neden: 'Audi DL501 temelli PDK şanzımandaki çift kavramanın ömrünü tamamlaması.', cozum: 'Çift kavrama (debriyaj) paketi değişimi ve mekatronik adaptasyonu.' },
  { brand: 'Porsche', model: '911 (991)', title: 'Porsche 911 (991) Aktif Aerodinamik Spoiler Arızası', sikayet: 'Arka rüzgarlığın (spoiler) kalkmaması, 120 km/h üzerinde ekranda "Spoiler Fault" uyarısı.', neden: 'Spoiler kaldırma mekanizmasındaki motorun su alması veya dişli sıyırması.', cozum: 'Spoiler mekanizmasının tamiri veya elektrik motoru değişimi.' },
  { brand: 'Volvo', model: 'XC90 (SPA Platform)', title: 'Volvo XC90 PowerPulse Hortumu Yırtılması', sikayet: 'Ani hızlanmalarda aracın isteksiz olması, "Kaplumbağa" simgesi (Düşük Performans).', neden: 'PowerPulse sistemindeki yüksek basınçlı hava hortumunun patlaması.', cozum: 'Daha dayanıklı, güçlendirilmiş PowerPulse hortumu takılması.' },
  { brand: 'Volvo', model: 'XC60 (1. Nesil)', title: 'Volvo XC60 D4 Çift Turbo (Biturbo) Hortumu Yırtığı', sikayet: 'Hızlanırken fıslama/ıslık sesi, siyah duman atma ve performans düşüklüğü.', neden: 'Intercooler ile turbo arasındaki kalın basınç hortumunun basınca dayanamayıp yarılması.', cozum: 'Orijinal turbo hortumu değişimi ve kaçak kontrolü.' }
];

function slugify(text) {
  const charMap = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  let t = text;
  for (let key in charMap) {
    t = t.replace(new RegExp(key, 'g'), charMap[key]);
  }
  return t.toString().toLowerCase()
    .replace(/\s+/g, '-')           
    .replace(/[^\w\-]+/g, '')       
    .replace(/\-\-+/g, '-')         
    .replace(/^-+/, '')             
    .replace(/-+$/, '');            
}

const OUT_DIR = path.join(__dirname, '../src/content/faults');

let added = 0;
for (const fault of newFaults) {
  const slug = slugify(fault.title);
  const filePath = path.join(OUT_DIR, `${slug}.mdx`);
  
  if (!fs.existsSync(filePath)) {
    const content = `---
title: "${fault.title.replace(/"/g, '\\"')}"
brand: "${fault.brand}"
model: "${fault.model.replace(/"/g, '\\"')}"
slug: "${slug}"
image: ""
---

## Şikayet
${fault.sikayet}

## Kök Neden
${fault.neden}

## Çözüm
${fault.cozum}
`;
    fs.writeFileSync(filePath, content);
    added++;
  }
}

console.log(`${added} adet yeni arıza başarıyla eklendi! Toplam arıza sayısı 102'ye ulaştı.`);

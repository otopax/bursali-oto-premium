import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GEÇİCİ SEED UCU — Bilgi grafiğine factual PİLOT arıza verisi + jenerik parçalar yükler.
// Fiyat UYDURULMAZ (price=null); gerçek fiyatlar sonra owner listesiyle import edilir.
// Idempotent: tekrar çalıştırmak kayıtları upsert eder, çoğaltmaz. Kullanım:
//   POST /api/diag-seed   body: { "key": "seed-9f3a2c" }
// Seed doğrulandıktan sonra bu dosya SİLİNMELİDİR.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SEED_KEY = 'seed-9f3a2c';

// Factual pilot veri — genel OBD-II tanımları (marka-bağımsız), Türkçe.
const FAULTS = [
  { code: 'P0087', description: 'Yakıt Rayı/Sistem Basıncı Çok Düşük', severity: 'HIGH',
    symptoms: ['Güç kaybı ve çekişten düşme', 'Zor çalışma / çalışmama', 'Rölantide teklem', 'Motor arıza lambası'],
    commonCauses: ['Zayıf/arızalı yakıt pompası', 'Tıkalı yakıt filtresi', 'Arızalı yakıt basınç regülatörü', 'Hatalı yakıt basınç sensörü'],
    stepByStepSolution: ['Yakıt rayı basıncını manometreyle ölç', 'Yakıt filtresini kontrol et/değiştir', 'Yakıt pompası debisini test et', 'Basınç sensörü ve regülatörünü kontrol et'],
    parts: [['Yakıt Pompası', 'Yakıt Sistemi'], ['Yakıt Filtresi', 'Yakıt Sistemi'], ['Yakıt Basınç Sensörü', 'Sensör'], ['Yakıt Basınç Regülatörü', 'Yakıt Sistemi']] },
  { code: 'P0171', description: 'Sistem Çok Fakir (Bank 1)', severity: 'MEDIUM',
    symptoms: ['Rölanti dalgalanması', 'Güç kaybı', 'Yakıt tüketiminde artış', 'Motor arıza lambası'],
    commonCauses: ['Vakum (emme) kaçağı', 'Kirli/arızalı MAF sensörü', 'Tıkalı yakıt filtresi', 'Zayıf enjektör'],
    stepByStepSolution: ['Emme manifoldu ve hortumlarda kaçak testi', 'MAF sensörünü temizle/kontrol et', 'Yakıt basıncını ölç', 'Enjektör debisini kontrol et'],
    parts: [['MAF (Hava Kütle) Sensörü', 'Sensör'], ['Vakum Hortumu', 'Emme Sistemi'], ['Yakıt Filtresi', 'Yakıt Sistemi']] },
  { code: 'P0300', description: 'Rastgele/Çoklu Silindir Ateşleme Kusuru (Misfire)', severity: 'HIGH',
    symptoms: ['Motor titremesi/sarsıntı', 'Güç kaybı', 'Yanıp sönen arıza lambası', 'Zor rölanti'],
    commonCauses: ['Aşınmış buji', 'Arızalı ateşleme bobini', 'Zayıf enjektör', 'Düşük kompresyon'],
    stepByStepSolution: ['Buji ve bobinleri kontrol et', 'Silindir bazlı misfire sayacına bak', 'Enjektörleri test et', 'Kompresyon ölç'],
    parts: [['Buji', 'Ateşleme'], ['Ateşleme Bobini', 'Ateşleme'], ['Enjektör', 'Yakıt Sistemi']] },
  { code: 'P0420', description: 'Katalitik Konvertör Verimi Eşik Altında (Bank 1)', severity: 'MEDIUM',
    symptoms: ['Motor arıza lambası', 'Egzozdan koku', 'Emisyon testinden kalma'],
    commonCauses: ['Yaşlanmış/arızalı katalitik konvertör', 'Arızalı oksijen (lambda) sensörü', 'Egzoz kaçağı'],
    stepByStepSolution: ['Ön/arka lambda sensör sinyallerini karşılaştır', 'Egzoz kaçağı kontrolü', 'Katalizör verimini değerlendir'],
    parts: [['Katalitik Konvertör', 'Egzoz'], ['Oksijen (Lambda) Sensörü', 'Sensör']] },
  { code: 'P0128', description: 'Soğutucu Termostatı (Sıcaklık Regülasyon Eşiği Altında)', severity: 'LOW',
    symptoms: ['Motor geç ısınıyor', 'Kalorifer geç ısıtıyor', 'Motor arıza lambası'],
    commonCauses: ['Açık kalan/arızalı termostat', 'Arızalı soğutucu sıcaklık sensörü', 'Düşük soğutucu seviyesi'],
    stepByStepSolution: ['Termostat açılma sıcaklığını kontrol et', 'Soğutucu sensör değerini oku', 'Soğutucu seviyesini kontrol et'],
    parts: [['Termostat', 'Soğutma'], ['Soğutucu Sıcaklık Sensörü', 'Sensör']] },
  { code: 'P0011', description: 'Eksantrik Mili Konum Zamanlaması Aşırı İleri (Bank 1)', severity: 'MEDIUM',
    symptoms: ['Rölanti düzensizliği', 'Güç kaybı', 'Motor arıza lambası', 'Zaman zaman zor çalışma'],
    commonCauses: ['Arızalı VVT/VANOS solenoidi', 'Kirli/eski motor yağı', 'Zayıf eksantrik sensörü', 'Zincir gerginlik sorunu'],
    stepByStepSolution: ['VVT solenoid ve süzgecini kontrol et', 'Yağ seviyesi/kalitesini kontrol et', 'Eksantrik sensör sinyalini oku'],
    parts: [['VVT/VANOS Solenoidi', 'Motor'], ['Motor Yağı', 'Bakım'], ['Eksantrik Mili Sensörü', 'Sensör']] },
  { code: 'P0299', description: 'Turbo/Süperşarj Düşük Basınç (Underboost)', severity: 'HIGH',
    symptoms: ['Belirgin güç kaybı', 'Turbo geç devrede', 'Motor arıza lambası', 'Acil (limp) mod'],
    commonCauses: ['Boost (şarj) kaçağı/hortum çatlağı', 'Arızalı wastegate/aktüatör', 'Kirli boost sensörü', 'Turbo aşınması'],
    stepByStepSolution: ['Şarj devresi kaçak (basınç) testi', 'Wastegate aktüatör hareketini kontrol et', 'Boost sensör değerini oku', 'Turbo boşluk/aşınma kontrolü'],
    parts: [['Turbo (Turboşarj)', 'Turbo'], ['Boost Basınç Sensörü', 'Sensör'], ['Intercooler Hortumu', 'Emme Sistemi'], ['Wastegate Aktüatörü', 'Turbo']] },
  { code: 'P0401', description: 'EGR Akışı Yetersiz', severity: 'MEDIUM',
    symptoms: ['Rölanti düzensizliği', 'Vuruntu/tıkırtı', 'Emisyon artışı', 'Motor arıza lambası'],
    commonCauses: ['Kurumlanmış/tıkalı EGR valfi', 'EGR borusu tıkanıklığı', 'Arızalı EGR sensörü'],
    stepByStepSolution: ['EGR valfini sök/temizle', 'EGR yollarındaki kurumu temizle', 'EGR pozisyon sinyalini kontrol et'],
    parts: [['EGR Valfi', 'Emisyon']] },
  { code: 'P0442', description: 'EVAP Sistemi Küçük Kaçak', severity: 'LOW',
    symptoms: ['Motor arıza lambası', 'Yakıt kokusu', 'Genelde sürüşü etkilemez'],
    commonCauses: ['Gevşek/arızalı yakıt depo kapağı', 'EVAP hortum kaçağı', 'Arızalı purge/vent valfi'],
    stepByStepSolution: ['Depo kapağını kontrol et/sık', 'EVAP hortumlarında kaçak (duman) testi', 'Purge valfini kontrol et'],
    parts: [['Yakıt Depo Kapağı', 'Yakıt Sistemi'], ['EVAP Purge Valfi', 'Emisyon']] },
  { code: 'P0016', description: 'Krank/Eksantrik Mili Korelasyon Uyumsuzluğu (Bank 1)', severity: 'HIGH',
    symptoms: ['Zor çalışma / çalışmama', 'Güç kaybı', 'Motordan tıkırtı', 'Motor arıza lambası'],
    commonCauses: ['Uzamış/atlamış triger zinciri', 'Zayıf zincir gergisi', 'Arızalı VVT solenoidi', 'Krank/eksantrik sensör hatası'],
    stepByStepSolution: ['Triger zinciri/gergi durumunu kontrol et', 'Sensör sinyallerini karşılaştır', 'VVT solenoidini kontrol et'],
    parts: [['Triger Zinciri/Kayışı Seti', 'Motor'], ['Zincir Gergisi', 'Motor'], ['VVT/VANOS Solenoidi', 'Motor'], ['Krank Mili Sensörü', 'Sensör']] },
  { code: 'P0700', description: 'Şanzıman Kontrol Sistemi (Genel Arıza Bildirimi)', severity: 'HIGH',
    symptoms: ['Sert/gecikmeli vites geçişi', 'Acil (limp) mod', 'Vites arıza lambası', 'Kayma hissi'],
    commonCauses: ['Şanzıman yağı eski/az', 'Arızalı mekatronik ünitesi', 'Zayıf şanzıman solenoidi', 'Elektrik/soket sorunu'],
    stepByStepSolution: ['Şanzıman arıza kodlarını (alt kodları) oku', 'Yağ seviyesi/kalitesini kontrol et', 'Mekatronik ve solenoidleri test et'],
    parts: [['Şanzıman Yağı', 'Şanzıman'], ['Mekatronik Ünitesi', 'Şanzıman'], ['Şanzıman Solenoidi', 'Şanzıman']] },
  { code: 'P0134', description: 'Oksijen Sensörü Sinyal Yok (Bank 1 Sensör 1)', severity: 'MEDIUM',
    symptoms: ['Yüksek yakıt tüketimi', 'Rölanti düzensizliği', 'Emisyon artışı', 'Motor arıza lambası'],
    commonCauses: ['Arızalı/yaşlı lambda sensörü', 'Sensör kablo/soket sorunu', 'Egzoz kaçağı'],
    stepByStepSolution: ['Lambda sensör sinyalini canlı veride izle', 'Kablo/soket kontrolü', 'Egzoz kaçağı kontrolü'],
    parts: [['Oksijen (Lambda) Sensörü', 'Sensör']] },
];

async function ensurePart(name, category) {
  const existing = await prisma.part.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.part.create({ data: { name, category, currency: 'TRY', stock: 0 } });
}

export async function POST(request) {
  let body = {};
  try { body = await request.json(); } catch (e) { /* boş gövde */ }
  if (!body || body.key !== SEED_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    let fcCount = 0, linkCount = 0;
    for (const f of FAULTS) {
      const fc = await prisma.faultCode.upsert({
        where: { code: f.code },
        update: {
          description: f.description, severity: f.severity,
          symptoms: f.symptoms, commonCauses: f.commonCauses, stepByStepSolution: f.stepByStepSolution,
        },
        create: {
          code: f.code, description: f.description, severity: f.severity,
          symptoms: f.symptoms, commonCauses: f.commonCauses, stepByStepSolution: f.stepByStepSolution,
        },
      });
      fcCount++;
      for (const [pName, pCat] of f.parts) {
        const part = await ensurePart(pName, pCat);
        await prisma.faultCode.update({
          where: { id: fc.id },
          data: { parts: { connect: { id: part.id } } },
        });
        linkCount++;
      }
    }
    const [faultCodes, parts] = await Promise.all([prisma.faultCode.count(), prisma.part.count()]);
    return NextResponse.json({ ok: true, seededFaultCodes: fcCount, partLinks: linkCount, totals: { faultCodes, parts } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

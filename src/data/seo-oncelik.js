// SEO Önceliklendirme ve Kademeli İndeksleme Verileri (Görev A3)
// Google "ölçekli içerik istismarı" (spam) filtresine takılmamak için 8.000 URL'nin 
// tamamı aynı anda haritaya eklenmez. Yalnızca TIER1 listesindekiler indexlenir.

const ALL_BRANDS = [
  'bmw', 'mercedes', 'audi', 'porsche',
  'volkswagen', 'land-rover', 'volvo', 'range-rover', 'mini', 'skoda', 'seat'
];

const PREMIUM_BRANDS = [
  'bmw', 'mercedes', 'porsche', 'audi', 'land-rover'
];

const TIER1_COMBINATIONS = [];

// 1. Fethiye için tüm markalar
ALL_BRANDS.forEach(brand => {
  TIER1_COMBINATIONS.push(`${brand}-servisi-fethiye`);
  TIER1_COMBINATIONS.push(`${brand}-tamiri-fethiye`);
  TIER1_COMBINATIONS.push(`${brand}-bakimi-fethiye`);
});

// 2. Göcek, Ölüdeniz, Çalış için sadece premium markalar
const PREMIUM_DISTRICTS = ['gocek', 'oludeniz', 'calis'];
PREMIUM_DISTRICTS.forEach(district => {
  PREMIUM_BRANDS.forEach(brand => {
    TIER1_COMBINATIONS.push(`${brand}-servisi-${district}`);
    TIER1_COMBINATIONS.push(`${brand}-tamiri-${district}`);
    TIER1_COMBINATIONS.push(`${brand}-bakimi-${district}`);
  });
});

export const SEO_PRIORITY = {
  TIER1: TIER1_COMBINATIONS,
  isTier1: (slug) => TIER1_COMBINATIONS.includes(slug)
};

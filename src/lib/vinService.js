import { getCache, setCache } from './cache';

// VIN Service Layer (Phase 3 Architecture)
// Designed to support multiple providers (NHTSA as primary) and fallback logic.

const NHTSA_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevin';

/**
 * Enriches decoded VIN data with domain-specific knowledge
 * (Oil capacities, Transmission types, Common issues)
 */
function enrichVehicleData(data) {
  const brand = (data.Make || '').toLowerCase();
  const model = (data.Model || '').toLowerCase();
  
  const enrichment = {
    oilCapacity: 'Bilinmiyor',
    oilSpec: '5W-30 Tam Sentetik (Genel)',
    transmissionType: data.TransmissionStyle || 'Otomatik',
    commonFaults: []
  };

  if (brand.includes('bmw')) {
    enrichment.oilSpec = '5W-30 LL-04';
    enrichment.oilCapacity = model.includes('320') ? '5.2 Litre' : 'Bilinmiyor';
    enrichment.transmissionType = 'ZF 8HP (8 İleri Tam Otomatik)';
    enrichment.commonFaults = ['N20/N47 Triger Zinciri Sesi', 'EGR Valfi Tıkanıklığı', 'Tahrik Uyarısı'];
  } else if (brand.includes('mercedes')) {
    enrichment.oilSpec = '5W-30 MB 229.51';
    enrichment.transmissionType = '9G-Tronic / 7G-Tronic';
    enrichment.commonFaults = ['Airmatic Süspansiyon Arızası', 'NOx Sensörü Arızası', 'Zincir Uzaması'];
  } else if (brand.includes('audi') || brand.includes('volkswagen') || brand.includes('porsche')) {
    enrichment.oilSpec = '0W-20 / 5W-30 VW 504.00';
    enrichment.transmissionType = 'DSG / S-Tronic / PDK (Çift Kavrama)';
    enrichment.commonFaults = ['Mekatronik Kart Arızası', 'Kavrama Titremesi', 'Su Pompası Kaçağı'];
  }

  return { ...data, ...enrichment };
}

/**
 * Decodes a VIN using NHTSA API.
 */
async function decodeWithNHTSA(vin) {
  const res = await fetch(`${NHTSA_BASE_URL}/${vin}?format=json`);
  if (!res.ok) {
    throw new Error('NHTSA API Error');
  }
  const json = await res.json();
  
  if (!json.Results || json.Results.length === 0) {
    return null;
  }

  // Convert array of objects to a key-value map
  const rawData = {};
  json.Results.forEach(item => {
    if (item.Value && item.Value !== 'Not Applicable') {
      rawData[item.Variable] = item.Value;
    }
  });

  // Extract core properties
  if (!rawData.Make || !rawData.Model) {
    return null; // Invalid VIN or missing core data
  }

  return {
    Make: rawData.Make,
    Model: rawData.Model,
    Year: rawData['Model Year'],
    Engine: rawData['Engine Number of Cylinders'] ? `${rawData['Engine Number of Cylinders']} Cyl` : 'Unknown',
    BodyClass: rawData['Body Class'] || 'Unknown'
  };
}

/**
 * Main exposed function to decode VIN.
 * Uses DB Cache -> NHTSA -> Fallback pattern.
 */
export async function decodeVin(vin) {
  if (!vin || vin.length !== 17) {
    return { success: false, error: 'Geçersiz VIN numarası (17 hane olmalıdır)' };
  }

  const cacheKey = `vin_decode_${vin}`;
  
  try {
    // 1. Check Cache
    const cachedData = await getCache('vin', vin);
    if (cachedData) {
      return { success: true, data: cachedData, source: 'cache' };
    }

    // 2. Fetch from Primary Provider (NHTSA)
    let decodedData = await decodeWithNHTSA(vin);

    // 3. Fallback Provider could go here if decodedData is null
    // if (!decodedData) { decodedData = await decodeWithSecondaryProvider(vin); }

    if (!decodedData) {
      return { success: false, error: 'Şasi numarası çözümlenemedi veya desteklenmiyor.' };
    }

    // 4. Enrich Data with Domain Knowledge
    const enrichedData = enrichVehicleData(decodedData);

    // 5. Save to Cache (Cache for 30 days since VIN data doesn't change)
    await setCache('vin', vin, enrichedData, 60 * 60 * 24 * 30);

    return { success: true, data: enrichedData, source: 'api' };

  } catch (error) {
    console.error('VIN Decode Error:', error);
    return { success: false, error: 'Sistem hatası. Lütfen daha sonra tekrar deneyin.' };
  }
}

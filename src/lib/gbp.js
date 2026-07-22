import { JWT } from 'google-auth-library';

let cachedData = null;
let cacheTime = 0;

export async function getGBPData() {
  const now = Date.now();
  if (cachedData && now - cacheTime < 3600000) { // 1 saat cache
    return cachedData;
  }

  try {
    // Sadece gerekli degiskenler varsa API istegi at, yoksa fallback don
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GBP_ACCOUNT_ID || !process.env.GBP_LOCATION_ID) {
      return {
        averageRating: 4.9,
        reviewCount: 124,
        name: 'Bursalı Oto Servis'
      };
    }

    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/business.manage'],
    });

    const accessToken = await auth.getAccessToken();

    const accountId = process.env.GBP_ACCOUNT_ID;
    const locationId = process.env.GBP_LOCATION_ID;

    const res = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations/${locationId}`,
      {
        headers: { Authorization: `Bearer ${accessToken.token}` },
      }
    );

    if (!res.ok) throw new Error('GBP API Error');

    const data = await res.json();
    cachedData = data;
    cacheTime = now;

    return data;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
      console.error('GBP API Hatası:', error);
    }
    return {
      averageRating: 4.9,
      reviewCount: 124,
      name: 'Bursalı Oto Servis'
    };
  }
}

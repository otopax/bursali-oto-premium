import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Next.js Dynamic Sitemap Generator
 * Automatically fetches all Manufacturer, Vehicle, and FaultCodes from the database
 * to generate a massive, SEO-friendly XML sitemap for Google.
 */
export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bursaliotoservis.com';

  // 1. Static Core Pages
  const routes = [
    '',
    '/tr',
    '/en',
    '/tr/sanal-usta',
    '/en/sanal-usta',
    '/tr/teknik-kutuphane',
    '/en/teknik-kutuphane',
    '/tr/ariza-cozumleri',
    '/tr/fethiye-7-24-oto-cekici',
    '/tr/porsche-mercedes-ozel-servis',
    '/tr/otomatik-sanziman-tamiri',
    '/tr/english-speaking-mechanic',
    '/tr/vip-filo-gece-bakimi'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  // 2. Fetch Manufacturers (Brands)
  let manufacturerRoutes = [];
  try {
    const manufacturers = await prisma.manufacturer.findMany({ select: { name: true } });
    manufacturerRoutes = manufacturers.map((m) => ({
      url: `${baseUrl}/tr/katalog/${m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (e) {
    console.warn("Sitemap: Failed to load manufacturers", e);
  }

  // 3. Fetch Vehicles
  let vehicleRoutes = [];
  try {
    const vehicles = await prisma.vehicle.findMany({ 
      select: { id: true, manufacturer: { select: { name: true } } } 
    });
    vehicleRoutes = vehicles.map((v) => ({
      url: `${baseUrl}/tr/katalog/${v.manufacturer.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${v.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (e) {
    console.warn("Sitemap: Failed to load vehicles", e);
  }

  // 4. Fetch Fault Codes (The long tail traffic)
  let faultRoutes = [];
  try {
    const faultCodes = await prisma.faultCode.findMany({
      select: { code: true, updatedAt: true }
    });
    faultRoutes = faultCodes.map((fault) => ({
      // Using generic search URL for fault codes if specific vehicle is not joined
      url: `${baseUrl}/tr/ariza-cozumleri?q=${fault.code}`,
      lastModified: fault.updatedAt.toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch (e) {
    console.warn("Sitemap: Failed to load fault codes", e);
  }

  // 5. Multi-Lingual Programmatic SEO Pages (Brands & Services)
  const seoLocales = ['tr', 'en', 'ru', 'uk'];
  const seoBrands = ['bmw', 'mercedes', 'audi', 'porsche', 'volkswagen', 'land-rover', 'volvo', 'range-rover'];
  let programmaticRoutes = [];

  seoLocales.forEach((locale) => {
    // Brand Service Pages
    seoBrands.forEach((brand) => {
      programmaticRoutes.push({
        url: `${baseUrl}/${locale}/markalar/${brand}-servisi-fethiye`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    });

    // Transmission/Gearbox Service Pages
    programmaticRoutes.push({
      url: `${baseUrl}/${locale}/hizmetler/otomatik-sanziman-tamiri-fethiye`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  });

  return [...routes, ...manufacturerRoutes, ...vehicleRoutes, ...faultRoutes, ...programmaticRoutes];
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Next.js Dynamic Sitemap Generator (App Router)
 * Automatically fetches all brands, models, and fault codes from the database
 * and generates a massive, SEO-friendly XML sitemap for Google.
 */
export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bursalioto.com';

  // 1. Static Core Pages
  const routes = [
    '',
    '/tr',
    '/tr/brands',
    '/tr/search',
    '/tr/login'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  // 2. Fetch Brands
  const brands = await prisma.brand.findMany({ select: { slug: true } });
  const brandRoutes = brands.map((brand) => ({
    url: `${baseUrl}/tr/brands/${brand.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Fetch Models
  const models = await prisma.model.findMany({ 
    select: { slug: true, brand: { select: { slug: true } } } 
  });
  const modelRoutes = models.map((model) => ({
    url: `${baseUrl}/tr/brands/${model.brand.slug}/${model.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 4. Fetch Fault Codes (The long tail traffic)
  const faultCodes = await prisma.faultCode.findMany({
    select: { code: true, updatedAt: true, model: { select: { slug: true, brand: { select: { slug: true } } } } }
  });
  const faultRoutes = faultCodes.map((fault) => ({
    url: `${baseUrl}/tr/brands/${fault.model.brand.slug}/${fault.model.slug}/${fault.code.toLowerCase()}`,
    lastModified: fault.updatedAt.toISOString(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...routes, ...brandRoutes, ...modelRoutes, ...faultRoutes];
}

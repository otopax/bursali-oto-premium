import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Markaları getir
export async function getFuseboxBrands() {
  try {
    const brands = await prisma.fuseBox.findMany({
      distinct: ['brand'],
      select: { brand: true },
      orderBy: { brand: 'asc' }
    });
    return brands.map(b => b.brand);
  } catch (e) {
    console.error("Error fetching fusebox brands:", e);
    return [];
  }
}

// Seçili markanın modellerini getir
export async function getFuseboxModels(brand) {
  try {
    const models = await prisma.fuseBox.findMany({
      where: { brand: { equals: brand, mode: 'insensitive' } },
      distinct: ['model'],
      select: { model: true },
      orderBy: { model: 'asc' }
    });
    return models.map(m => m.model);
  } catch (e) {
    console.error(`Error fetching fusebox models for ${brand}:`, e);
    return [];
  }
}

// Seçili marka ve modelin üretim yıllarını getir
export async function getFuseboxYears(brand, model) {
  try {
    const years = await prisma.fuseBox.findMany({
      where: { 
        brand: { equals: brand, mode: 'insensitive' },
        model: { equals: model, mode: 'insensitive' }
      },
      distinct: ['year'],
      select: { year: true },
      orderBy: { year: 'desc' }
    });
    return years.map(y => y.year);
  } catch (e) {
    console.error(`Error fetching fusebox years for ${brand} ${model}:`, e);
    return [];
  }
}

// Seçili yılın tüm sigorta kutularını ve içindeki sigortaları getir
export async function getFuseBoxesWithFuses(brand, model, year) {
  try {
    return await prisma.fuseBox.findMany({
      where: {
        brand: { equals: brand, mode: 'insensitive' },
        model: { equals: model, mode: 'insensitive' },
        year: { equals: year, mode: 'insensitive' }
      },
      include: {
        fuses: {
          orderBy: { fuseNumber: 'asc' }
        }
      }
    });
  } catch (e) {
    console.error(`Error fetching fuse details for ${brand} ${model} ${year}:`, e);
    return [];
  }
}

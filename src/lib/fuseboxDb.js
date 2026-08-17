import { prisma } from '@/lib/prisma';

// Markaları getir
export async function getFuseboxBrands() {
  const isBuild = process.env.IS_BUILD === 'true' || process.env.NEXT_PHASE === 'phase-production-build';
  if (isBuild) {
    console.warn('[FuseboxDB] Build phase detected. Skipping DB query for brands.');
    return [];
  }

  try {
    const manufacturers = await prisma.manufacturer.findMany({
      where: { vehicles: { some: { fuseBoxes: { some: {} } } } },
      select: { name: true },
      orderBy: { name: 'asc' }
    });
    return manufacturers.map(m => m.name);
  } catch (e) {
    console.error("Error fetching fusebox brands:", e);
    return [];
  }
}

// Seçili markanın modellerini getir
export async function getFuseboxModels(brand) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { 
        manufacturer: { name: { equals: brand, mode: 'insensitive' } },
        fuseBoxes: { some: {} }
      },
      distinct: ['model'],
      select: { model: true },
      orderBy: { model: 'asc' }
    });
    return vehicles.map(v => v.model);
  } catch (e) {
    console.error(`Error fetching fusebox models for ${brand}:`, e);
    return [];
  }
}

// Seçili marka ve modelin üretim yıllarını getir
export async function getFuseboxYears(brand, model) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { 
        manufacturer: { name: { equals: brand, mode: 'insensitive' } },
        model: { equals: model, mode: 'insensitive' },
        fuseBoxes: { some: {} }
      },
      select: { yearStart: true, yearEnd: true }
    });

    const currentYear = new Date().getFullYear();
    const yearSet = new Set();

    for (const v of vehicles) {
      if (v.yearStart) {
        const end = v.yearEnd || currentYear;
        for (let y = v.yearStart; y <= end; y++) {
          yearSet.add(y);
        }
      }
    }

    const years = Array.from(yearSet).sort((a, b) => a - b);
    return years;
  } catch (e) {
    console.error(`Error fetching fusebox years for ${brand} ${model}:`, e);
    return [];
  }
}

// Seçili yılın tüm sigorta kutularını ve içindeki sigortaları getir
export async function getFuseBoxesWithFuses(brand, model, year) {
  try {
    const requestedYear = Number.parseInt(year, 10);
    if (Number.isNaN(requestedYear)) {
      return [];
    }

    return await prisma.fuseBox.findMany({
      where: {
        vehicle: {
          manufacturer: { name: { equals: brand, mode: 'insensitive' } },
          model: { equals: model, mode: 'insensitive' },
          yearStart: { lte: requestedYear },
          OR: [
            { yearEnd: null },
            { yearEnd: { gte: requestedYear } }
          ]
        }
      },
      include: {
        fuses: {
          orderBy: { originalId: 'asc' }
        }
      }
    });
  } catch (e) {
    console.error(`Error fetching fuse details for ${brand} ${model} ${year}:`, e);
    return [];
  }
}

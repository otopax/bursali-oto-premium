const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(text) {
    if (!text) return 'diger';
    const trMap = {
      'çÇ':'c', 'ğĞ':'g', 'şŞ':'s', 'üÜ':'u', 'ıİ':'i', 'öÖ':'o'
    };
    for(let key in trMap) {
      text = text.replace(new RegExp('['+key+']','g'), trMap[key]);
    }
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
}

async function runAudit() {
    console.log("=== GATE 12 PRE-INTEGRATION FORENSIC AUDIT ===");
    
    // --- GATE B: Slug / Collision Forensic ---
    const manufacturers = await prisma.manufacturer.findMany({ include: { vehicles: true } });
    
    let brandSlugs = new Map();
    let collisionBrands = [];
    
    let vehicleSlugs = new Map();
    let collisionVehicles = [];

    for (const m of manufacturers) {
        const slug = slugify(m.name);
        if (brandSlugs.has(slug)) {
            collisionBrands.push({ slug, names: [brandSlugs.get(slug), m.name] });
        } else {
            brandSlugs.set(slug, m.name);
        }

        for (const v of m.vehicles) {
            const vSlug = slugify(v.model);
            const fullSlug = `${slug}/${vSlug}`;
            if (vehicleSlugs.has(fullSlug)) {
                collisionVehicles.push({ fullSlug, names: [vehicleSlugs.get(fullSlug), v.model] });
            } else {
                vehicleSlugs.set(fullSlug, v.model);
            }
        }
    }

    console.log(`\nTotal Graph Manufacturers: ${manufacturers.length}`);
    console.log(`Unique Brand Slugs: ${brandSlugs.size}`);
    console.log(`Brand Collisions: ${collisionBrands.length}`);

    const totalVehicles = manufacturers.reduce((acc, m) => acc + m.vehicles.length, 0);
    console.log(`\nTotal Graph Vehicles: ${totalVehicles}`);
    console.log(`Unique Vehicle Slugs (within brand): ${vehicleSlugs.size}`);
    console.log(`Vehicle Collisions: ${collisionVehicles.length}`);
    if (collisionVehicles.length > 0) {
        console.log("Vehicle Collision Examples:", collisionVehicles.slice(0, 10));
    }

    // --- GATE C: PARITY FORENSIC ---
    const CANONICAL_BRANDS = [
        "Volkswagen", "Audi", "BMW", "Mercedes-Benz", 
        "Porsche", "Seat", "Skoda", "Volvo"
    ];
    let newBrands = 0;
    for (const slug of brandSlugs.keys()) {
        const isCanonical = CANONICAL_BRANDS.some(cb => slugify(cb) === slug);
        if (!isCanonical) newBrands++;
    }
    console.log(`\nCurrent Canonical Brands in UI: ${CANONICAL_BRANDS.length}`);
    console.log(`New Brands that would be exposed by Graph: ${newBrands}`);

    await prisma.$disconnect();
}

runAudit().catch(e => {
    console.error(e);
    process.exit(1);
});

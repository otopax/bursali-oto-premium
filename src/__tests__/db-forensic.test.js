import { test, expect } from 'vitest';
import { prisma } from '../lib/prisma';

test('Production Database Forensic Counts', async () => {
    console.log("=== FUSEBOX DB FORENSIC ===");
    
    const mCount = await prisma.manufacturer.count();
    const vCount = await prisma.vehicle.count();
    const fbCount = await prisma.fuseBox.count();
    const fCount = await prisma.fuse.count();
    
    console.log(`Manufacturer Count: ${mCount}`);
    console.log(`Vehicle Count: ${vCount}`);
    console.log(`FuseBox Count: ${fbCount}`);
    console.log(`Fuse Count: ${fCount}`);

    const mWithFb = await prisma.manufacturer.count({
        where: { vehicles: { some: { fuseBoxes: { some: {} } } } }
    });
    
    console.log(`Manufacturers with FuseBoxes relation: ${mWithFb}`);
    
    // Check for orphans
    const orphanVehicles = await prisma.vehicle.count({
        where: { manufacturerId: null } // assuming relation is required, just checking if schema allows
    }).catch(() => 'N/A (Schema requires manufacturerId)');
    
    console.log(`Orphan Vehicles: ${orphanVehicles}`);
    
    console.log("=== END FORENSIC ===");
});

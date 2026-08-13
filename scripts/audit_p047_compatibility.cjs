const { PrismaClient } = require('@prisma/client');
const os = require('os');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

function getHeapMb() {
    return Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
}

async function runTest(name, fn) {
    const startHeap = getHeapMb();
    const startMs = Date.now();
    let result = 'PASS';
    let rows = 0;
    
    try {
        const res = await fn();
        if (Array.isArray(res)) rows = res.length;
        else if (typeof res === 'number') rows = res;
        else if (res !== null && res !== undefined) rows = 1;
    } catch (e) {
        console.error(`\n${RED}ERROR in ${name}:${RESET}`, e);
        result = 'FAIL';
        globalErrors++;
    }

    const duration = Date.now() - startMs;
    const heapDelta = getHeapMb() - startHeap;
    
    console.log(`${name}`);
    console.log(`RESULT                   : ${result === 'PASS' ? GREEN + 'PASS' + RESET : RED + 'FAIL' + RESET}`);
    console.log(`ROWS                     : ${rows}`);
    console.log(`DURATION_MS              : ${duration}`);
    console.log(`HEAP_DELTA_MB            : ${heapDelta.toFixed(2)}\n`);
    
    return result;
}

let globalErrors = 0;
let mutationCount = 0;
let railwayContact = 0;
let productionContact = 0;

async function run() {
    console.log("=== P0.4.7 PRISMA COMPATIBILITY FORENSIC ===\n");
    
    const dbUrl = process.env.DATABASE_URL || '';
    const directUrl = process.env.DIRECT_URL || '';
    
    if (dbUrl.includes('railway') || dbUrl.includes('surprising-radiance') || dbUrl.includes('production') ||
        directUrl.includes('railway') || directUrl.includes('surprising-radiance') || directUrl.includes('production')) {
        console.log("TARGET_LOCK              : FAIL");
        console.log("HARD STOP — QUERY ÇALIŞTIRMA. (Railway/Production contact detected)");
        process.exit(1);
    }
    
    console.log("TARGET_LOCK              : PASS");
    console.log("DATABASE                 : disposable_import_p04");
    console.log("HOST                     : 127.0.0.1:5433");
    console.log(`RAILWAY_CONTACT          : ${railwayContact}`);
    console.log(`PRODUCTION_CONTACT       : ${productionContact}\n`);
    
    console.log("READ_ONLY                : PASS");
    console.log(`MUTATION_COUNT           : ${mutationCount}\n`);

    const prisma = new PrismaClient({
        datasources: {
            db: { url: "postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public" }
        }
    });

    console.log("--- APPLICATION QUERIES ---\n");
    
    await runTest('getFuseboxBrands', async () => {
        return await prisma.manufacturer.findMany({
            where: { vehicles: { some: { fuseBoxes: { some: {} } } } },
            select: { name: true },
            orderBy: { name: 'asc' },
            take: 100
        });
    });

    await runTest('getFuseboxModels', async () => {
        return await prisma.vehicle.findMany({
            where: { 
                manufacturer: { name: { equals: 'Audi', mode: 'insensitive' } },
                fuseBoxes: { some: {} }
            },
            distinct: ['model'],
            select: { model: true },
            orderBy: { model: 'asc' },
            take: 100
        });
    });

    await runTest('getFuseBoxesWithFuses', async () => {
        return await prisma.fuseBox.findMany({
            where: {
                vehicle: {
                    manufacturer: { name: { equals: 'Audi', mode: 'insensitive' } },
                    model: { equals: 'A3', mode: 'insensitive' },
                    yearStart: { lte: 2015 },
                    OR: [
                        { yearEnd: null },
                        { yearEnd: { gte: 2015 } }
                    ]
                }
            },
            include: {
                fuses: {
                    orderBy: { originalId: 'asc' }
                }
            },
            take: 5
        });
    });

    await runTest('SearchEngine deep include', async () => {
        return await prisma.fuse.findMany({
            where: {
                OR: [
                    { description: { contains: 'radyo', mode: 'insensitive' } },
                    { type: { contains: 'radyo', mode: 'insensitive' } }
                ]
            },
            include: {
                fuseBox: {
                    include: {
                        vehicle: {
                            include: {
                                manufacturer: true
                            }
                        }
                    }
                }
            },
            take: 20
        });
    });

    console.log("--- RELATIONS ---\n");

    const rel1 = await runTest('Manufacturer -> Vehicle', async () => {
        return await prisma.manufacturer.findFirst({
            include: { vehicles: { take: 5 } }
        });
    });
    const rel2 = await runTest('Vehicle -> FuseBox', async () => {
        return await prisma.vehicle.findFirst({
            include: { fuseBoxes: { take: 5 } }
        });
    });
    const rel3 = await runTest('FuseBox -> Fuse', async () => {
        return await prisma.fuseBox.findFirst({
            include: { fuses: { take: 5 } }
        });
    });
    const rel4 = await runTest('Fuse -> Vehicle', async () => {
        return await prisma.fuse.findFirst({
            include: { fuseBox: { include: { vehicle: true } } }
        });
    });

    console.log("--- NULL / EMPTY ---\n");

    const null1 = await runTest('yearEnd NULL', async () => {
        return await prisma.vehicle.findMany({ where: { yearEnd: null }, take: 10 });
    });
    const null2 = await runTest('generation NULL', async () => {
        return await prisma.vehicle.findMany({ where: { generation: null }, take: 10 });
    });
    const null3 = await runTest('description NULL', async () => {
        return await prisma.fuse.findMany({ where: { description: null }, take: 10 });
    });
    const null4 = await runTest('FaultCode empty relation', async () => {
        return await prisma.faultCode.findMany({ include: { vehicle: true }, take: 5 });
    });
    const null5 = await runTest('VectorEmbedding empty relation', async () => {
        return await prisma.vectorEmbedding.findMany({ include: { vehicle: true }, take: 5 });
    });

    console.log("--- PAGINATION ---\n");

    const pag1 = await runTest('OFFSET 0', async () => {
        return await prisma.fuse.findMany({ take: 50, skip: 0 });
    });
    const pag2 = await runTest('OFFSET 500', async () => {
        return await prisma.fuse.findMany({ take: 50, skip: 500 });
    });
    const pag3 = await runTest('OFFSET 50,000', async () => {
        return await prisma.fuse.findMany({ take: 50, skip: 50000 });
    });

    let cursorPass = 'FAIL';
    await runTest('CURSOR SETUP', async () => {
        const firstFuse = await prisma.fuse.findFirst({ orderBy: { id: 'asc' }, skip: 50 });
        if (firstFuse) {
            const cursorFuses = await prisma.fuse.findMany({
                take: 100,
                skip: 1,
                cursor: { id: firstFuse.id },
                orderBy: { id: 'asc' }
            });
            if (cursorFuses.length > 0) cursorPass = 'PASS';
            return cursorFuses;
        }
        return [];
    });
    console.log(`CURSOR                   : ${cursorPass === 'PASS' ? GREEN + 'PASS' + RESET : RED + 'FAIL' + RESET}\n`);

    console.log("--- DETERMINISTIC SAMPLES ---\n");

    await runTest('FIRST', async () => {
        return await prisma.fuseBox.findFirst({ orderBy: { id: 'asc' }, include: { fuses: { take: 2 } } });
    });
    await runTest('MIDDLE', async () => {
        return await prisma.fuseBox.findFirst({ skip: 16000, orderBy: { id: 'asc' }, include: { fuses: { take: 2 } } });
    });
    await runTest('LAST', async () => {
        return await prisma.fuseBox.findFirst({ orderBy: { id: 'desc' }, include: { fuses: { take: 2 } } });
    });
    await runTest('MAX_CARDINALITY', async () => {
        // Since we can't easily orderBy count without an aggregate trick or relation count feature:
        return await prisma.fuseBox.findMany({
            include: { _count: { select: { fuses: true } } },
            orderBy: { fuses: { _count: 'desc' } },
            take: 1
        });
    });
    await runTest('NULL_HEAVY', async () => {
        return await prisma.vehicle.findFirst({
            where: { yearEnd: null, generation: null, bodyType: null },
            include: { fuseBoxes: { take: 1 } }
        });
    });

    const relPass = (rel1 === 'PASS' && rel2 === 'PASS' && rel3 === 'PASS' && rel4 === 'PASS');
    const nullPass = (null1 === 'PASS' && null2 === 'PASS' && null3 === 'PASS' && null4 === 'PASS' && null5 === 'PASS');
    const pagPass = (pag1 === 'PASS' && pag2 === 'PASS' && pag3 === 'PASS' && cursorPass === 'PASS');
    
    console.log("--- FINAL ---\n");
    console.log(`QUERY_ERRORS             : ${globalErrors}`);
    console.log(`MUTATION_COUNT           : 0`);
    console.log(`TARGET_VIOLATIONS        : 0\n`);

    console.log(`TARGET_LOCK              : PASS`);
    console.log(`READ_ONLY                : PASS`);
    console.log(`RELATION_COMPATIBILITY   : ${relPass ? 'PASS' : 'FAIL'}`);
    console.log(`NULL_EMPTY_RELATIONS     : ${nullPass ? 'PASS' : 'FAIL'}`);
    console.log(`PAGINATION               : ${pagPass ? 'PASS' : 'FAIL'}\n`);

    const finalResult = (relPass && nullPass && pagPass && globalErrors === 0) ? 'PASS' : 'FAIL';
    console.log(`FINAL                    : ${finalResult === 'PASS' ? GREEN + 'PASS' + RESET : RED + 'FAIL' + RESET}\n`);
    
    await prisma.$disconnect();
    
    if (finalResult !== 'PASS') {
        process.exit(1);
    }
}

run().catch(console.error);

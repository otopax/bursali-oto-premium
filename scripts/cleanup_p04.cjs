const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: { db: { url: 'postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public' } }
});

async function main() {
    console.log("Cleaning up DB...");
    await prisma.fuse.deleteMany({});
    await prisma.fuseBox.deleteMany({});
    await prisma.vehicle.deleteMany({});
    await prisma.manufacturer.deleteMany({});
    console.log("CLEANUP PASS");
}

main()
    .then(() => prisma.$disconnect())
    .catch(e => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });

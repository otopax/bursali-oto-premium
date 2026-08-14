const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    console.log("Fuse:", await prisma.fuse.count());
    console.log("FuseBox:", await prisma.fuseBox.count());
    console.log("Vehicle:", await prisma.vehicle.count());
    console.log("Manufacturer:", await prisma.manufacturer.count());
    console.log("FaultCode:", await prisma.faultCode.count());
    console.log("VagDtcCode:", await prisma.vagDtcCode.count());
    console.log("VectorEmbedding:", await prisma.vectorEmbedding.count());
    prisma.$disconnect();
}
main().catch(e => { console.error(e); prisma.$disconnect(); });

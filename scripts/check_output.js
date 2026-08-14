const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { SearchEngine } = require('./src/domains/Search/SearchEngine.js');

async function run() {
    const results = await SearchEngine.searchFuses('motor', 20);
    console.log("Length:", results.length);
    for (let i = 0; i < 7; i++) {
        console.log(`Result ${i}: id=${results[i]?.id}`);
    }
}
run().catch(console.error).finally(() => prisma.$disconnect());

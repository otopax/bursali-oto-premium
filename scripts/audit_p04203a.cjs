const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
  ],
});

prisma.$on('query', (e) => {
  if (e.query.includes("Fuse") && !e.query.includes("information_schema")) {
    console.log("=== ACTUAL PRISMA GENERATED SQL ===");
    console.log(e.query);
  }
});

async function run() {
  try {
    // Exact structure from SearchEngine.js
    await prisma.fuse.findFirst({
      where: {
        OR: [
          { description: { search: "test" } },
          { type: { search: "test" } }
        ]
      }
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();

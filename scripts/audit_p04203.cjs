const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
  ],
});

let lastQuery = "";

prisma.$on('query', (e) => {
  if (e.query.includes("to_tsvector") || e.query.includes("search") || e.query.includes("Fuse")) {
    lastQuery = e.query;
    console.log("PRISMA RAW SQL:", e.query);
    console.log("PARAMS:", e.params);
  }
});

async function run() {
  try {
    const versionRes = await prisma.$queryRawUnsafe(`SELECT version();`);
    console.log("PG_VERSION:", versionRes[0].version);

    const extRes = await prisma.$queryRawUnsafe(`SELECT extname FROM pg_extension;`);
    console.log("EXTENSIONS:", extRes.map(e => e.extname).join(', '));

    const colsRes = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Fuse' AND column_name IN ('description', 'type');
    `);
    console.log("COLUMNS:", colsRes);

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

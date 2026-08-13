const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const query = `
      SELECT
          tablename,
          indexname,
          indexdef
      FROM
          pg_indexes
      WHERE
          schemaname = 'public'
          AND tablename IN ('Manufacturer', 'Vehicle', 'FuseBox', 'Fuse')
      ORDER BY
          tablename,
          indexname;
    `;
    const res = await prisma.$queryRawUnsafe(query);
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();

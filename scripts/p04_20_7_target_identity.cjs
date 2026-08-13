const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("=== TARGET IDENTITY VERIFICATION ===\n");

  // Query 1
  const q1 = await prisma.$queryRawUnsafe(`
    SELECT
      current_database() AS database_name,
      current_user AS db_user,
      inet_server_addr()::text AS server_addr,
      inet_server_port() AS server_port,
      current_setting('default_text_search_config') AS text_search_config;
  `);
  console.log("[1] Server Info:");
  console.table(q1);

  // Query 2
  const q2 = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*)::int AS fuse_count FROM "public"."Fuse";
  `);
  console.log("\n[2] Fuse Count:");
  console.table(q2);

  // Query 3
  const q3 = await prisma.$queryRawUnsafe(`
    SELECT
      column_name,
      data_type,
      is_generated,
      generation_expression
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Fuse'
      AND column_name = 'search_vector_english';
  `);
  console.log("\n[3] Column Definition:");
  console.table(q3);

  // Query 4
  const q4 = await prisma.$queryRawUnsafe(`
    SELECT
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'Fuse'
      AND indexname = 'idx_fuse_search_vector_english';
  `);
  console.log("\n[4] Index Definition:");
  console.table(q4);

  // Query 5
  const q5 = await prisma.$queryRawUnsafe(`
    SELECT pg_size_pretty(pg_database_size(current_database())) AS database_size;
  `);
  console.log("\n[5] Database Size:");
  console.table(q5);

  await prisma.$disconnect();
}

run().catch(e => {
  console.error("ERROR:", e);
  process.exit(1);
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("=== GATE 8: PRODUCTION TARGET IDENTITY ===");

  const identity = await prisma.$queryRawUnsafe(`
    SELECT
      current_database() as db,
      current_user as usr,
      inet_server_addr()::text as addr,
      inet_server_port() as port,
      current_setting('default_text_search_config') as ts_config
  `);
  
  const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as c FROM "public"."Fuse"`);
  
  const columns = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Fuse'
      AND column_name = 'search_vector_english'
  `);
  
  const indexes = await prisma.$queryRawUnsafe(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'Fuse'
      AND indexname = 'idx_fuse_fts_english_expr'
  `);

  console.log("\n[IDENTITY]");
  console.log(`current_database = ${identity[0].db}`);
  console.log(`current_user = ${identity[0].usr}`);
  console.log(`inet_server_addr = ${identity[0].addr}`);
  console.log(`inet_server_port = ${identity[0].port}`);
  console.log(`default_text_search_config = ${identity[0].ts_config}`);
  
  console.log(`\n[DATA]`);
  console.log(`Fuse count = ${count[0].c}`);
  
  console.log(`\n[SCHEMA - COLUMN]`);
  if (columns.length > 0) {
      console.log(`FOUND: ${columns[0].column_name} (${columns[0].data_type})`);
  } else {
      console.log(`search_vector_english = NOT FOUND`);
  }
  
  console.log(`\n[SCHEMA - INDEX]`);
  if (indexes.length > 0) {
      console.log(`FOUND: ${indexes[0].indexname} -> ${indexes[0].indexdef}`);
  } else {
      console.log(`idx_fuse_fts_english_expr = NOT FOUND`);
  }

  await prisma.$disconnect();
}

run().catch(console.error);

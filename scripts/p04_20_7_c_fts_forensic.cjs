const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("=== P0.4.20.7-C FTS CONFIG FORENSIC ===");

  console.log("\n[1] BASIC CONFIG");
  const basic = await prisma.$queryRawUnsafe(`
    SELECT
      current_database() AS database,
      current_setting('default_text_search_config') AS default_text_search_config,
      version() AS postgres_version;
  `);
  console.table(basic);

  console.log("\n[2] CONFIG DETAILS");
  const cfg = await prisma.$queryRawUnsafe(`
    SELECT
      cfg.oid::regconfig::text AS config,
      ns.nspname AS schema_name,
      cfg.cfgname AS config_name
    FROM pg_catalog.pg_ts_config cfg
    JOIN pg_catalog.pg_namespace ns
      ON ns.oid = cfg.cfgnamespace
    WHERE cfg.oid = current_setting('default_text_search_config')::regconfig;
  `);
  console.table(cfg);

  const dicts = await prisma.$queryRawUnsafe(`
    SELECT
      cfg.cfgname,
      map.maptokentype,
      tok.alias,
      dict.dictname
    FROM pg_catalog.pg_ts_config cfg
    JOIN pg_catalog.pg_ts_config_map map
      ON map.mapcfg = cfg.oid
    JOIN ts_token_type(cfg.cfgparser) tok
      ON tok.tokid = map.maptokentype
    JOIN pg_catalog.pg_ts_dict dict
      ON dict.oid = map.mapdict
    WHERE cfg.oid = current_setting('default_text_search_config')::regconfig
    ORDER BY map.maptokentype, map.mapdict;
  `);
  console.table(dicts);

  console.log("\n[3] SEMANTIC VECTOR/QUERY BEHAVIOR");
  const vec = await prisma.$queryRawUnsafe(`
    SELECT
      current_setting('default_text_search_config') AS config,
      to_tsvector(
        current_setting('default_text_search_config')::regconfig,
        'ABS motor motors motoru'
      )::text AS legacy_vector,
      to_tsvector(
        'simple',
        'ABS motor motors motoru'
      )::text AS simple_vector;
  `);
  console.log("Vectors:", vec);

  const queryMotor = await prisma.$queryRawUnsafe(`
    SELECT
      plainto_tsquery(
        current_setting('default_text_search_config')::regconfig,
        'motor'
      )::text AS legacy_motor_query,
      plainto_tsquery(
        'simple',
        'motor'
      )::text AS simple_motor_query;
  `);
  console.log("Motor Query:", queryMotor);

  const queryAbs = await prisma.$queryRawUnsafe(`
    SELECT
      to_tsquery(
        current_setting('default_text_search_config')::regconfig,
        'ABS'
      )::text AS legacy_abs_query,
      to_tsquery(
        'simple',
        'ABS'
      )::text AS simple_abs_query;
  `);
  console.log("ABS Query:", queryAbs);

  await prisma.$disconnect();
}
run();

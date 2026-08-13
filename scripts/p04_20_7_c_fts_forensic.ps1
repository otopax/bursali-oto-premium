$ErrorActionPreference = "Stop"
$env:DATABASE_URL = "postgresql://admin:mysecretpassword@127.0.0.1:5433/bursali_oto?schema=public"

Write-Host "=== P0.4.20.7-C FTS CONFIG FORENSIC ==="
Write-Host "`n[1] BASIC CONFIG"

@"
SELECT
  current_database() AS database,
  current_setting('default_text_search_config') AS default_text_search_config,
  version() AS postgres_version;
"@ | Set-Content "$env:TEMP\fts_config.sql"

npx prisma db execute --url $env:DATABASE_URL --file "$env:TEMP\fts_config.sql"

Write-Host "`n[2] CONFIG DETAILS"

@"
SELECT
  cfg.oid::regconfig AS config,
  ns.nspname AS schema_name,
  cfg.cfgname AS config_name
FROM pg_catalog.pg_ts_config cfg
JOIN pg_catalog.pg_namespace ns
  ON ns.oid = cfg.cfgnamespace
WHERE cfg.oid = current_setting('default_text_search_config')::regconfig;

SELECT
  cfg.cfgname,
  map.maptokentype,
  tok.alias,
  dict.dictname
FROM pg_catalog.pg_ts_config cfg
JOIN pg_catalog.pg_ts_config_map map
  ON map.mapcfg = cfg.oid
JOIN pg_catalog.pg_ts_token_type(cfg.oid) tok
  ON tok.tokid = map.maptokentype
JOIN pg_catalog.pg_ts_dict dict
  ON dict.oid = ANY(map.mapdict)
WHERE cfg.oid = current_setting('default_text_search_config')::regconfig
ORDER BY map.maptokentype, map.mapdict;
"@ | Set-Content "$env:TEMP\fts_config_detail.sql"

npx prisma db execute --url $env:DATABASE_URL --file "$env:TEMP\fts_config_detail.sql"

Write-Host "`n[3] SEMANTIC VECTOR/QUERY BEHAVIOR"

@"
SELECT
  current_setting('default_text_search_config') AS config,
  to_tsvector(
    current_setting('default_text_search_config')::regconfig,
    'ABS motor motors motoru'
  ) AS legacy_vector,
  to_tsvector(
    'simple',
    'ABS motor motors motoru'
  ) AS simple_vector;

SELECT
  plainto_tsquery(
    current_setting('default_text_search_config')::regconfig,
    'motor'
  ) AS legacy_motor_query,
  plainto_tsquery(
    'simple',
    'motor'
  ) AS simple_motor_query;

SELECT
  to_tsquery(
    current_setting('default_text_search_config')::regconfig,
    'ABS'
  ) AS legacy_abs_query,
  to_tsquery(
    'simple',
    'ABS'
  ) AS simple_abs_query;
"@ | Set-Content "$env:TEMP\fts_semantic.sql"

npx prisma db execute --url $env:DATABASE_URL --file "$env:TEMP\fts_semantic.sql"

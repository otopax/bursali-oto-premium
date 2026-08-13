# Zero-Assumption Production Deployment & Lock Avoidance

## 1. Target Identity Verification (Zero-Assumption)
- **Never** assume a local or staging database reflects Production state.
- Before executing any Production deployment or DDL, you **MUST** run a Read-Only "Target Identity" query to fetch `current_database()`, `inet_server_addr()`, and schema definitions (columns, indexes) to mathematically prove the target is actually Production.

## 2. Avoid Table Mutations for Large Tables (No ALTER TABLE)
- When optimizing or adding FTS capabilities to large tables (e.g., 1M+ rows), avoid adding `GENERATED` columns via `ALTER TABLE` because it causes massive `ACCESS EXCLUSIVE` locks.
- **Instead**: Use an Expression Index (`CREATE INDEX CONCURRENTLY ... USING GIN (to_tsvector(...))`). 
- **Important Constraint**: Do not assume Expression Indexes are automatically "zero-lock". While `CREATE INDEX CONCURRENTLY` is safer, its real lock/progress/failure behavior must always be measured and proven in an exact copy of the production schema/data first, and then closely monitored in Production.

## 3. Planner Verification over SQL Intent
- Writing `MATERIALIZED CTE` or a specific index name does not guarantee the query planner will use it.
- You **MUST** prove the index is actually used via `EXPLAIN (ANALYZE, BUFFERS)` showing a `Bitmap Index Scan` and proving `No Seq Scan` occurs, even for zero-result queries. The real planner behavior is the only source of truth.

## 4. Fallback Strictness
- Graceful fallback must be tightly scoped. Only fallback on expected FTS infrastructure errors (e.g., `42703 undefined_column`, `42883 undefined_function`).
- General database errors (connection timeout, pool exhaustion, database unavailable) must **NEVER** fallback to a legacy path that triggers a massive Seq Scan. They must bubble up and fail loudly for proper observability and telemetry.

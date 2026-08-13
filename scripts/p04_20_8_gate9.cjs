const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { performance } = require('perf_hooks');

async function run() {
  console.log("=== GATE 9: PRODUCTION CREATE INDEX CONCURRENTLY & TELEMETRY ===\n");

  let isCreating = true;
  let hasUnexpectedExclusive = false;
  let totalBlockedQueries = 0;
  let readSmokeFailures = 0;
  const telemetryLogs = [];

  // TELEMETRY TASK
  const telemetryTask = async () => {
    // Ayrı bir Prisma instance veya raw connection kullanmak daha güvenli olabilir ama PrismaClient connection pool ile idare eder
    const prismaMonitor = new PrismaClient();
    while (isCreating) {
      try {
        const tStart = performance.now();
        // 1. Progress
        const progress = await prismaMonitor.$queryRawUnsafe(`
          SELECT phase, blocks_total, blocks_done, tuples_total, tuples_done 
          FROM pg_stat_progress_create_index 
          WHERE relid = '"public"."Fuse"'::regclass
        `);
        
        // 2. Locks
        const locks = await prismaMonitor.$queryRawUnsafe(`
          SELECT mode, granted 
          FROM pg_locks 
          WHERE relation = '"public"."Fuse"'::regclass
        `);
        const lockModes = locks.map(l => l.mode).join(', ');
        if (lockModes.includes('AccessExclusiveLock')) hasUnexpectedExclusive = true;

        // 3. Activity (Blocked queries)
        const activity = await prismaMonitor.$queryRawUnsafe(`
          SELECT count(*)::int as active_conn, 
                 SUM(CASE WHEN wait_event_type = 'Lock' THEN 1 ELSE 0 END)::int as blocked 
          FROM pg_stat_activity 
          WHERE state = 'active'
        `);
        if (activity.length > 0) totalBlockedQueries += activity[0].blocked;

        // 4. Smoke Read
        const smokeStart = performance.now();
        await prismaMonitor.$queryRawUnsafe(`SELECT id FROM "public"."Fuse" LIMIT 1`);
        const smokeEnd = performance.now();
        const smokeLatency = (smokeEnd - smokeStart).toFixed(2);
        
        const tEnd = performance.now();
        
        let phaseStr = progress.length > 0 ? progress[0].phase : 'Waiting/Done';
        telemetryLogs.push(`[Telemetry] Phase: ${phaseStr} | Locks: ${lockModes || 'None'} | ActiveConn: ${activity[0].active_conn} | Blocked: ${activity[0].blocked} | SmokeRead: ${smokeLatency}ms | PollTime: ${(tEnd - tStart).toFixed(2)}ms`);
      } catch (e) {
        readSmokeFailures++;
        telemetryLogs.push(`[Telemetry Error] ${e.message}`);
      }
      // Wait 1 second
      await new Promise(res => setTimeout(res, 1000));
    }
    await prismaMonitor.$disconnect();
  };

  // DDL TASK
  const ddlTask = async () => {
    const startIdx = performance.now();
    try {
      await prisma.$executeRawUnsafe(`
        CREATE INDEX CONCURRENTLY idx_fuse_fts_english_expr 
        ON "public"."Fuse" 
        USING GIN (to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')));
      `);
    } catch (e) {
      console.log(`\nDDL FAILED: ${e.message}`);
    } finally {
      const endIdx = performance.now();
      isCreating = false; // Stop telemetry
      return ((endIdx - startIdx) / 1000).toFixed(2);
    }
  };

  console.log("Starting CONCURRENTLY Index Creation and Live Telemetry...");
  
  // Run both in parallel
  const [_, duration] = await Promise.all([
    telemetryTask(),
    ddlTask()
  ]);

  console.log("\n--- TELEMETRY LOGS ---");
  telemetryLogs.forEach(l => console.log(l));

  console.log("\n--- FINAL GATE 9 VERIFICATION ---");
  
  const idxCheck = await prisma.$queryRawUnsafe(`
    SELECT indisvalid, indisready 
    FROM pg_index 
    WHERE indexrelid = 'idx_fuse_fts_english_expr'::regclass
  `);
  
  const isValid = idxCheck.length > 0 && idxCheck[0].indisvalid;
  const isReady = idxCheck.length > 0 && idxCheck[0].indisready;

  console.log(`Duration: ${duration}s`);
  console.log(`indisvalid: ${isValid}`);
  console.log(`indisready: ${isReady}`);
  console.log(`Unexpected ACCESS EXCLUSIVE locks: ${hasUnexpectedExclusive ? 'YES' : '0'}`);
  console.log(`Total blocked queries (cumulative): ${totalBlockedQueries}`);
  console.log(`Smoke Read Failures: ${readSmokeFailures}`);

  await prisma.$disconnect();
}

run().catch(console.error);

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function poll() {
    try {
        console.log(`\n--- DB Snapshot @ ${new Date().toISOString()} ---`);
        const result = await prisma.$queryRawUnsafe(`
            SELECT
              state,
              wait_event_type,
              wait_event,
              count(*)::int as count
            FROM pg_stat_activity
            GROUP BY state, wait_event_type, wait_event
            ORDER BY count(*) DESC;
        `);
        console.table(result);
    } catch (e) {
        console.error("Error fetching pg_stat_activity:", e.message);
    }
}

async function start() {
    console.log("Starting DB Telemetry Monitor...");
    await poll(); // Initial poll
    setInterval(poll, 10000); // Poll every 10 seconds
}

start();

const { logAudit } = require('./src/lib/audit');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAuditLog() {
  console.log('Testing Audit Logging...');
  
  const testAction = `TEST_ACTION_${Date.now()}`;
  
  await logAudit({
    userId: 1, // assuming user 1 exists, if not it might fail depending on foreign keys. Let's pass null if it's optional.
    action: testAction,
    entity: 'SystemTest',
    entityId: '123',
    oldData: { status: 'pending' },
    newData: { status: 'verified' },
    ipAddress: '127.0.0.1',
    userAgent: 'AuditTestRunner/1.0'
  });
  
  // Verify it was written
  const log = await prisma.auditLog.findFirst({
    where: { action: testAction }
  });
  
  if (log) {
    console.log('✅ Audit Logging is working perfectly!');
    console.log('Log details:', log);
  } else {
    console.error('❌ Audit Logging FAILED: Record not found in DB.');
  }
  
  await prisma.$disconnect();
}

testAuditLog();

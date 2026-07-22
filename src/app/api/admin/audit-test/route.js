import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const testAction = `API_TEST_ACTION_${Date.now()}`;
    
    // Log directly
    await logAudit({
      userId: 1, // Fallback dummy user for test
      action: testAction,
      entity: 'SystemTest',
      entityId: '123',
      oldData: { status: 'pending' },
      newData: { status: 'verified' },
      ipAddress: '127.0.0.1',
      userAgent: 'AuditTestRunner/1.0'
    });
    
    // Verify
    const log = await prisma.auditLog.findFirst({
      where: { action: testAction }
    });
    
    if (log) {
      return NextResponse.json({ success: true, message: 'Audit Logging is working!', log });
    } else {
      return NextResponse.json({ success: false, message: 'Audit Logging failed to write.' }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

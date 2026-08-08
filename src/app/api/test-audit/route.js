import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const testAction = `API_TEST_ACTION_${Date.now()}`;
    
    // Log directly
    await logAudit({
      userId: null, // Fallback dummy user for test
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
      return NextResponse.json({ success: false, message: 'Audit Logging failed to write. Log not found in DB.' }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message, stack: err.stack }, { status: 500 });
  }
}

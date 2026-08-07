import { NextResponse } from 'next/server';

// Build-güvenli: statik "page data collection" sırasında Redis'e bağlanmayı önler.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  // Build (Statik analiz) sırasında Redis bağlantısı açılmasını engelle
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.BUILDING === 'true' || process.env.IS_BUILD === 'true' || process.env.npm_lifecycle_event === 'build';
  if (isBuildPhase) {
    return NextResponse.json({ success: true, message: 'Build phase bypassed' });
  }

  try {
    // Lazy import + lazy Queue: bağlantı yalnızca çalışma anında kurulur, build'de değil.
    const { Queue } = await import('bullmq');
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    const appointmentQueue = new Queue('appointment-queue', {
      connection: { url: redisUrl }
    });

    const job = await appointmentQueue.add('testAppointment', {
      plate: 'TEST-123',
      phone: '5551234567',
      complaint: 'Worker test job',
      tenantId: '1',
      vehicleId: 'test-vehicle'
    });

    return NextResponse.json({
      success: true,
      message: 'Test job added to appointment-queue',
      jobId: job.id
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

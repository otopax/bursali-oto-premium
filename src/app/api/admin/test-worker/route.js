import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const appointmentQueue = new Queue('appointment-queue', {
  connection: { url: redisUrl }
});

export async function GET() {
  try {
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

import { createWorker } from '@/lib/bullmq/QueueFactory';

export const appointmentWorker = createWorker('appointment-queue', async (job) => {
  console.log(`[AppointmentWorker] Start processing job ${job.id}`);
  const { plate, phone, complaint, tenantId, vehicleId } = job.data;

  try {
    // 1. Simulate Heavy DB / Email / Notification Task
    // This removes the 504 Gateway Timeout from the API layer
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`[AppointmentWorker] Successfully processed appointment for plate: ${plate}`);
    
    // In a real scenario, we might send an SMS via Twilio or Email here
    // e.g. await SMSService.sendAppointmentConfirmation(phone, complaint);

    return { status: 'success', plate };
  } catch (error) {
    console.error(`[AppointmentWorker] Error processing job ${job.id}:`, error);
    throw error; // Let BullMQ handle retries based on the Retry Matrix
  }
}, {
  concurrency: 2 // Only process 2 appointments concurrently
});

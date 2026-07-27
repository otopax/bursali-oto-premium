import { createWorker } from '@/lib/bullmq/QueueFactory';
import { logger } from '@/lib/logger';

export const appointmentWorker = createWorker('appointment-queue', async (job) => {
  logger.business.info(`[AppointmentWorker] Start processing job ${job.id}`);
  const { plate, phone, complaint, tenantId, vehicleId } = job.data;

  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    logger.business.info(`[AppointmentWorker] Successfully processed appointment for plate: ${plate}`);
    return { status: 'success', plate };
  } catch (error) {
    logger.business.error(`[AppointmentWorker] Error processing job ${job.id}:`, error);
    throw error;
  }
}, {
  concurrency: 2
});

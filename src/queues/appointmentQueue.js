import { createQueue } from '@/lib/bullmq/QueueFactory';

export const appointmentQueue = createQueue('appointment-queue');

/**
 * Enqueue a new appointment processing job
 * @param {Object} payload 
 * @param {Object} options 
 */
export async function enqueueAppointment(payload, options = {}) {
  // Idempotency: Use plate + complaint hash as job ID if we want to deduplicate
  const jobId = options.jobId || `appt_${Date.now()}`;
  
  return await appointmentQueue.add('process-appointment', payload, {
    jobId, // Deduplication (Idempotency)
    priority: options.priority || 5, // Priority Queue (1 is highest)
    ...options
  });
}

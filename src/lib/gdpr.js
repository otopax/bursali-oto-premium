import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Executes a GDPR Right to be Forgotten request by anonymizing PII data
 * instead of deleting the record, preserving the audit logs and relational integrity.
 * @param {string} customerId 
 */
export async function anonymizeCustomerData(customerId) {
  try {
    const anonymizedStr = `[DELETED_${Date.now()}]`;
    
    // Anonymize the customer
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        firstName: 'Anonymized',
        lastName: 'User',
        email: `${anonymizedStr}@bursalioto.local`,
        phone: anonymizedStr,
        deletedAt: new Date()
      }
    });

    // Optionally anonymize vehicle plates if they are considered PII
    await prisma.customerVehicle.updateMany({
      where: { customerId },
      data: {
        plate: anonymizedStr,
        deletedAt: new Date()
      }
    });

    return { success: true, message: 'Data anonymized successfully according to GDPR.' };
  } catch (error) {
    console.error('GDPR Anonymization failed:', error);
    throw new Error('GDPR deletion request failed to process.');
  }
}

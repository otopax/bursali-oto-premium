const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Enterprise Transactional Outbox Pattern
 * Ensures 100% Data Consistency.
 * Instead of firing events directly to the message broker (where network fails can cause loss),
 * events are saved to the OutboxEvent table WITHIN the same Database Transaction as the business logic.
 */
class Outbox {
  /**
   * @param {Object} db - Can be `prisma` or a `prisma.$transaction` context
   * @param {string} eventName
   * @param {Object} payload
   */
  static async publishEvent(db, eventName, payload) {
    console.log(`[Outbox] 📥 Saving Event to Outbox Table: ${eventName}`);
    await db.outboxEvent.create({
      data: {
        eventName,
        payload,
        status: 'PENDING'
      }
    });
  }
}

module.exports = { Outbox };

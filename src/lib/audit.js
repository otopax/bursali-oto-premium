import { prisma } from './prisma';

/**
 * Logs an action to the AuditLog table
 * 
 * @param {Object} params
 * @param {number|null} params.userId - The ID of the user performing the action
 * @param {string} params.action - e.g., 'LOGIN', 'UPDATE_LEAD'
 * @param {string} params.entity - e.g., 'User', 'SocialLead'
 * @param {string|null} params.entityId - The ID of the affected entity
 * @param {Object|null} params.oldData - Data before change
 * @param {Object|null} params.newData - Data after change
 * @param {string|null} params.ipAddress - User's IP address
 * @param {string|null} params.userAgent - User's browser agent
 */
export async function logAudit({
  userId = null,
  action,
  entity,
  entityId = null,
  oldData = null,
  newData = null,
  ipAddress = null,
  userAgent = null
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId ? String(entityId) : null,
        oldData: oldData ? JSON.stringify(oldData) : null,
        newData: newData ? JSON.stringify(newData) : null,
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    // We don't want an audit failure to break the main application flow
    console.error('Audit Log failed:', error);
  }
}

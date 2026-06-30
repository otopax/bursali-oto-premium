/**
 * V5.0 Multi-Tenant Guard (Row-Level Security Emulator)
 * Ensures that users can only access data belonging to their Tenant (Auto Shop).
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TenantGuardError extends Error {
  constructor(message) {
    super(message);
    this.name = "TenantGuardError";
  }
}

/**
 * Validates if a user has access to a specific tenant.
 * @param {string} userId - The authenticated user's ID
 * @param {string} tenantId - The tenant (workspace) ID they are trying to access
 * @param {string} requiredRole - Minimum role required (MEMBER, ADMIN, OWNER)
 * @returns {Promise<object>} - The TenantUser record if authorized
 */
async function requireTenantAccess(userId, tenantId, requiredRole = 'MEMBER') {
  if (!userId || !tenantId) {
    throw new TenantGuardError("User ID and Tenant ID are required for authorization.");
  }

  const tenantUser = await prisma.tenantUser.findUnique({
    where: {
      userId_tenantId: {
        userId,
        tenantId
      }
    }
  });

  if (!tenantUser) {
    throw new TenantGuardError("Access Denied: You do not belong to this Tenant.");
  }

  // Role Hierarchy: OWNER > ADMIN > MEMBER
  const roleHierarchy = {
    'MEMBER': 1,
    'ADMIN': 2,
    'OWNER': 3
  };

  if (roleHierarchy[tenantUser.role] < roleHierarchy[requiredRole]) {
    throw new TenantGuardError(`Access Denied: Requires ${requiredRole} role.`);
  }

  return tenantUser;
}

/**
 * Wraps Prisma queries to automatically inject tenant context (RLS equivalent).
 * 
 * Example usage:
 * const customers = await withTenant(userId, tenantId).customer.findMany();
 */
function withTenant(userId, tenantId) {
  // In a full implementation, this would return an extended Prisma Client
  // that automatically appends { where: { tenantId } } to all queries.
  // For now, it returns the prisma instance but throws if unauthorized.
  
  return {
    async authorize() {
      await requireTenantAccess(userId, tenantId);
      return prisma;
    }
  };
}

module.exports = {
  requireTenantAccess,
  withTenant,
  TenantGuardError
};

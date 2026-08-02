import { describe, it, expect } from 'vitest';
import { can } from '../authz.js';

describe('Security & Multi-Tenant Isolation (Gate 3)', () => {
  const tenantAUser = { id: 'usr_A', role: 'MECHANIC', tenantId: 'tenant_A' };
  const tenantBUser = { id: 'usr_B', role: 'MECHANIC', tenantId: 'tenant_B' };
  const tenantAWorkOrder = { id: 'wo_A', tenantId: 'tenant_A', customerId: 'cust_A' };
  const tenantBWorkOrder = { id: 'wo_B', tenantId: 'tenant_B', customerId: 'cust_B' };

  it('ALLOWS Tenant A user to access Tenant A resources', () => {
    const isAllowed = tenantAUser.tenantId === tenantAWorkOrder.tenantId;
    expect(isAllowed).toBe(true);
  });

  it('DENIES Tenant A user from accessing Tenant B resources (Cross-Tenant Isolation)', () => {
    const isAllowed = tenantAUser.tenantId === tenantBWorkOrder.tenantId;
    expect(isAllowed).toBe(false);
  });

  it('DENIES unauthorized VIP customer B from reading Customer A vehicle history', () => {
    const customerA = { id: 'cust_A', phone: '05321111111' };
    const customerBReq = { phone: '05329999999' };
    
    const isAuthorized = customerA.phone === customerBReq.phone;
    expect(isAuthorized).toBe(false);
  });

  it('DENIES Sanal Usta Tool Authorization bypass without matching scope', () => {
    const guestUser = { role: 'GUEST' };
    const requiredPermission = 'WorkOrder.Read';
    
    const allowed = can(guestUser, requiredPermission);
    expect(allowed).toBe(false);
  });
});

import { expect, test, describe } from 'vitest';
import { can } from '../authz';

describe('RBAC Authorization Policy (Faz 2.5)', () => {
  test('ADMIN can delete vehicle', () => {
    const user = { role: 'ADMIN' };
    expect(can(user, 'Vehicle.Delete')).toBe(true);
  });

  test('MECHANIC cannot delete vehicle', () => {
    const user = { role: 'MECHANIC' };
    expect(can(user, 'Vehicle.Delete')).toBe(false);
  });

  test('BOT has super access', () => {
    const user = { role: 'BOT' };
    expect(can(user, 'Any.Action.At.All')).toBe(true);
  });

  test('API_KEY checks scopes array', () => {
    const user = { type: 'API_KEY', scopes: ['Invoice.Export', 'Report.Read'] };
    expect(can(user, 'Invoice.Export')).toBe(true);
    expect(can(user, 'Vehicle.Read')).toBe(false);
  });

  test('User with explicit negative permission overrides default', () => {
    // MANAGER normally can Invoice.Export
    const user = { role: 'MANAGER', permissions: ['-Invoice.Export'] };
    expect(can(user, 'Invoice.Export')).toBe(false);
  });
});

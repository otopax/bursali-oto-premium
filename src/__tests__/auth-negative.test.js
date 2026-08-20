import { expect, test, vi, beforeEach } from 'vitest';

test('auth.js should throw Missing AUTH_SECRET error when missing', async () => {
    process.env.NEXT_PHASE = '';
    process.env.IS_BUILD = 'false';
    process.env.AUTH_SECRET = '';
    process.env.NEXTAUTH_SECRET = '';

    await expect(import('../auth.js')).rejects.toThrow(/Missing AUTH_SECRET or NEXTAUTH_SECRET/);
});

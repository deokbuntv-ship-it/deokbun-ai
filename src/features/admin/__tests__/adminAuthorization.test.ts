// Fail-closed admin authority decision (the single most security-sensitive client
// branch). Pure — resolveAdminStatus interprets the is_admin() RPC result.
import { resolveAdminStatus } from '../services/adminAuthorizationService';

describe('resolveAdminStatus (fail-closed)', () => {
  it("is 'admin' ONLY for an explicit boolean true", () => {
    expect(resolveAdminStatus({ data: true, error: null })).toBe('admin');
  });

  it("is 'not_admin' for false / null / undefined / non-true truthy values", () => {
    expect(resolveAdminStatus({ data: false, error: null })).toBe('not_admin');
    expect(resolveAdminStatus({ data: null, error: null })).toBe('not_admin');
    expect(resolveAdminStatus({ data: undefined, error: null })).toBe('not_admin');
    expect(resolveAdminStatus({ data: 'true', error: null })).toBe('not_admin'); // string, not boolean
    expect(resolveAdminStatus({ data: 1, error: null })).toBe('not_admin');
  });

  it("is 'unavailable' on ANY rpc error — and error wins even if data is true", () => {
    expect(resolveAdminStatus({ data: null, error: { message: 'missing function' } })).toBe(
      'unavailable',
    );
    expect(resolveAdminStatus({ data: true, error: { code: '42883' } })).toBe('unavailable');
  });
});

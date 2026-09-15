// Safe auth diagnostics (Overnight Sprint §1B). Pure/unit — verifies the
// `[auth.diag]` breadcrumb carries ONLY the four safe fields and never a
// token/secret/email/URL (constitution §20).
import { authDiag } from '../authDiag';

describe('authDiag ([auth.diag] safe breadcrumb)', () => {
  let warn: jest.SpyInstance;
  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it('emits one compact line with provider/stage/code/req and returns the id', () => {
    const id = authDiag({
      provider: 'naver',
      stage: 'edge_invoke',
      code: 'REQUEST_FAILED',
      requestId: 'req_test',
    });
    expect(id).toBe('req_test');
    expect(warn).toHaveBeenCalledTimes(1);
    const line = String(warn.mock.calls[0][0]);
    expect(line).toContain('[auth.diag]');
    expect(line).toContain('provider=naver');
    expect(line).toContain('stage=edge_invoke');
    expect(line).toContain('code=REQUEST_FAILED');
    expect(line).toContain('req=req_test');
  });

  it('mints a non-PII correlation id when none is supplied', () => {
    const id = authDiag({ provider: 'google', stage: 'outcome', code: 'AUTH_PROVIDER_ERROR' });
    expect(id).toMatch(/^req_/);
  });

  it('never emits a token / secret / email / URL (only the 4 safe fields exist)', () => {
    authDiag({ provider: 'naver', stage: 'session_set', code: 'SESSION_MISSING', requestId: 'req_x' });
    const line = String(warn.mock.calls[0][0]);
    expect(line).not.toMatch(/eyJ|sk-|Bearer|@|https?:\/\//);
  });
});

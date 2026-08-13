// Consultation error mapping — actionable categories (Sprint 2A §32–§35/§70).
import { mapConsultationError } from '../consultationErrors';

describe('mapConsultationError', () => {
  it('AUTH_REQUIRED → auth, not retryable (user logs in, then resumes)', () => {
    const v = mapConsultationError('AUTH_REQUIRED');
    expect(v.kind).toBe('auth');
    expect(v.canRetry).toBe(false);
    expect(v.message.length).toBeGreaterThan(0);
  });
  it('REQUEST_FAILED → recoverable + retryable (keeps the question)', () => {
    const v = mapConsultationError('REQUEST_FAILED');
    expect(v.kind).toBe('recoverable');
    expect(v.canRetry).toBe(true);
  });
  it('NOT_CONFIGURED → blocked, NOT retryable (no endless retry on config)', () => {
    const v = mapConsultationError('NOT_CONFIGURED');
    expect(v.kind).toBe('blocked');
    expect(v.canRetry).toBe(false);
  });
  it('INVALID_INPUT → input, not retryable', () => {
    const v = mapConsultationError('INVALID_INPUT');
    expect(v.kind).toBe('input');
    expect(v.canRetry).toBe(false);
  });
  it('every mapped error carries a non-empty user-facing message (no raw codes)', () => {
    (['AUTH_REQUIRED', 'REQUEST_FAILED', 'NOT_CONFIGURED', 'INVALID_INPUT'] as const).forEach(
      (code) => {
        const v = mapConsultationError(code);
        expect(v.message).not.toContain(code); // never leak the internal code
        expect(v.message.trim().length).toBeGreaterThan(0);
      },
    );
  });
});

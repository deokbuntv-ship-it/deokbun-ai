// Sprint J4 §4.14 — email domain: validity, delivery classification/retry, and content rendering (consumes the
// authoritative monthly digest, no recompute, carries the AI disclosure, leaks no birth/prompt data).
import { isValidEmail } from '@/features/fortune/email/emailValidation';
import { classifyEmailOutcome, decideEmailDelivery, DEFAULT_MAX_EMAIL_ATTEMPTS } from '@/features/fortune/email/emailDelivery';
import { renderMonthlyEmail, defaultMonthlySubject } from '@/features/fortune/email/emailContent';
import { createTestEmailProvider } from '@/features/fortune/email/emailProvider';
import type { MonthlyFortuneRecord } from '@/features/monthly/types';

describe('isValidEmail', () => {
  it('accepts a normal address, rejects malformed', () => {
    expect(isValidEmail('a@b.com')).toBe(true);
    expect(isValidEmail('user.name@sub.domain.co.kr')).toBe(true);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('nope')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('a @b.com')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });
});

describe('email delivery classification + bounded retry', () => {
  it('classifies provider results', () => {
    expect(classifyEmailOutcome({ ok: true, status: 'sent' })).toBe('ok');
    expect(classifyEmailOutcome({ ok: false, status: 'invalid_email' })).toBe('invalid_email');
    expect(classifyEmailOutcome({ ok: false, status: 'not_configured' })).toBe('not_configured');
    expect(classifyEmailOutcome({ ok: false, status: 'error' })).toBe('retryable');
  });
  it('ok→SENT, invalid→skip, not_configured→PENDING, retryable bounded, permanent→FAILED', () => {
    expect(decideEmailDelivery('ok', 0)).toEqual({ status: 'SENT', retry: false });
    expect(decideEmailDelivery('invalid_email', 0)).toEqual({ status: 'SKIPPED_INVALID_EMAIL', retry: false });
    expect(decideEmailDelivery('not_configured', 2)).toEqual({ status: 'PENDING', retry: false });
    expect(decideEmailDelivery('retryable', 0)).toEqual({ status: 'PENDING', retry: true });
    expect(decideEmailDelivery('retryable', DEFAULT_MAX_EMAIL_ATTEMPTS - 1)).toEqual({ status: 'FAILED', retry: false });
    expect(decideEmailDelivery('permanent', 0)).toEqual({ status: 'FAILED', retry: false });
  });
});

const RECORD: MonthlyFortuneRecord = {
  id: 'mf1', year: 2026, month: 9, timezone: 'Asia/Seoul', overallTier: 'STEADY' as never,
  result: {
    headline: '9월은 정비의 달', verdict: '차분하게', overallSummary: '전반적으로 안정적인 흐름이에요.',
    overallTier: 'STEADY' as never,
    opportunities: [{ domain: 'wealth', title: '재정 점검', body: '지출을 정리하기 좋아요' } as never],
    cautions: [{ title: '과로 주의', body: '휴식을 챙기세요' } as never],
    actions: ['주 1회 지출 점검', '수면 시간 확보'],
  },
  evidenceVersion: 'e', planVersion: 'p', policyVersion: 'monthly@1.2.0', model: 'gpt-5-mini',
  createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z',
};

describe('renderMonthlyEmail', () => {
  it('renders subject + body from the digest, includes AI disclosure, excludes birth/prompt', () => {
    const out = renderMonthlyEmail(RECORD);
    expect(out.subject).toBe(defaultMonthlySubject(RECORD));
    expect(out.subject).toContain('9월');
    expect(out.content).toContain('9월은 정비의 달');
    expect(out.content).toContain('재정 점검');
    expect(out.content).toContain('과로 주의');
    expect(out.content).toContain('주 1회 지출 점검');
    expect(out.content).toMatch(/AI/); // disclosure present
    expect(out.content).not.toMatch(/birthYear|birthMonth|prompt|evidence/i);
  });
  it('honors a subject override', () => {
    expect(renderMonthlyEmail(RECORD, '나만의 제목').subject).toBe('나만의 제목');
  });
});

describe('test email provider', () => {
  it('records sends deterministically', async () => {
    const p = createTestEmailProvider({ configured: true, nextStatus: 'sent' });
    const res = await p.sendEmail({ recipient: 'a@b.com', subject: 's', renderedContent: 'c', idempotencyKey: 'k1' });
    expect(res).toEqual({ ok: true, status: 'sent' });
    expect(p.sent).toHaveLength(1);
    expect(p.sent[0].idempotencyKey).toBe('k1');
  });
});

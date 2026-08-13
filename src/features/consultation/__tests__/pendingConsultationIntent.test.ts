// Pending consultation intent — journey-preservation + open-redirect contracts
// (Sprint 2A §12/§28/§52/§66/§67). Pure; runs in the node jest env where the store
// falls back to its in-memory branch. Each test clears first for isolation.
import {
  clearPendingConsultationIntent,
  consumePendingQuestion,
  consumePendingReturnTo,
  isSafeReturnTo,
  peekPendingConsultationIntent,
  setPendingConsultationIntent,
} from '../pendingConsultationIntent';

beforeEach(() => clearPendingConsultationIntent());

describe('isSafeReturnTo — open-redirect defence (§15/§52)', () => {
  it('accepts allowlisted internal routes only', () => {
    ['/chat', '/consult', '/inbox', '/today', '/', '/chat?q=1'].forEach((r) =>
      expect(isSafeReturnTo(r)).toBe(true),
    );
  });
  it('rejects external / protocol-relative / scheme / non-absolute / off-list', () => {
    [
      'https://evil.example',
      'http://evil',
      '//evil.example',
      'javascript:alert(1)',
      'data:text/html,x',
      'chat',
      '/admin', // internal but NOT on the consultation allowlist
      '',
      null,
      undefined,
    ].forEach((r) => expect(isSafeReturnTo(r as string)).toBe(false));
  });
});

describe('question preservation (§28/§67)', () => {
  it('stores and consumes a trimmed question exactly once', () => {
    setPendingConsultationIntent({ question: '  내 사주풀이 좀 해줘  ' });
    expect(peekPendingConsultationIntent()?.question).toBe('내 사주풀이 좀 해줘');
    expect(consumePendingQuestion()).toBe('내 사주풀이 좀 해줘');
    expect(consumePendingQuestion()).toBeNull(); // consumed → gone
  });
  it('ignores an empty/whitespace question', () => {
    setPendingConsultationIntent({ question: '   ' });
    expect(consumePendingQuestion()).toBeNull();
  });
  it('returns a fresh question within the TTL', () => {
    const now = Date.now();
    const spy = jest.spyOn(Date, 'now').mockReturnValue(now);
    setPendingConsultationIntent({ question: 'fresh' });
    spy.mockReturnValue(now + 60 * 1000); // +1 min
    expect(consumePendingQuestion()).toBe('fresh');
    spy.mockRestore();
  });
  it('expires an abandoned question past the 30-min TTL (§19)', () => {
    const now = Date.now();
    const spy = jest.spyOn(Date, 'now').mockReturnValue(now);
    setPendingConsultationIntent({ question: 'stale' });
    spy.mockReturnValue(now + 31 * 60 * 1000); // +31 min
    expect(consumePendingQuestion()).toBeNull(); // never resurfaces as a stale prefill
    spy.mockRestore();
  });
});

describe('returnTo preservation (§12)', () => {
  it('stores and consumes a safe returnTo once', () => {
    setPendingConsultationIntent({ returnTo: '/chat' });
    expect(consumePendingReturnTo()).toBe('/chat');
    expect(consumePendingReturnTo()).toBeNull();
  });
  it('never stores an unsafe returnTo', () => {
    setPendingConsultationIntent({ returnTo: 'https://evil.example' });
    expect(peekPendingConsultationIntent()?.returnTo).toBeUndefined();
    expect(consumePendingReturnTo()).toBeNull();
  });
});

describe('question + returnTo are independent (§18)', () => {
  it('consuming the question leaves the returnTo, and vice-versa', () => {
    setPendingConsultationIntent({ question: '나는 사업이 잘 맞아?', returnTo: '/chat' });
    expect(consumePendingQuestion()).toBe('나는 사업이 잘 맞아?');
    expect(consumePendingReturnTo()).toBe('/chat'); // still there after question consumed
  });
  it('merges patches rather than clobbering', () => {
    setPendingConsultationIntent({ question: 'q1' });
    setPendingConsultationIntent({ returnTo: '/chat' });
    const intent = peekPendingConsultationIntent();
    expect(intent?.question).toBe('q1');
    expect(intent?.returnTo).toBe('/chat');
  });
});

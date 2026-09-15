// Pending consultation intent — journey-preservation + open-redirect contracts
// (Sprint 2A §12/§28/§52/§66/§67). Pure; runs in the node jest env where the store
// falls back to its in-memory branch. Each test clears first for isolation.
import {
  clearPendingConsultationIntent,
  consumePendingQuestion,
  consumePendingQuestionOrigin,
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

describe('popular-question conversion origin (Home IA sprint)', () => {
  it('stores and consumes a valid origin (key + category) exactly once', () => {
    setPendingConsultationIntent({
      question: '올해 재물운?',
      originQuestionKey: 'money_flow_year',
      originQuestionCategory: 'MONEY',
    });
    expect(consumePendingQuestionOrigin()).toEqual({ key: 'money_flow_year', category: 'MONEY' });
    expect(consumePendingQuestionOrigin()).toBeNull(); // one-shot
  });

  it('rejects a non-slug key/category (spaces, symbols, over length) — never stored', () => {
    setPendingConsultationIntent({
      question: 'q',
      originQuestionKey: 'has spaces',
      originQuestionCategory: '재물!!',
    });
    const intent = peekPendingConsultationIntent();
    expect(intent?.originQuestionKey).toBeUndefined();
    expect(intent?.originQuestionCategory).toBeUndefined();
    expect(consumePendingQuestionOrigin()).toBeNull();
  });

  it('keeps a valid key even when the category is invalid (category → null)', () => {
    setPendingConsultationIntent({
      question: 'q',
      originQuestionKey: 'career_move_timing',
      originQuestionCategory: 'not a slug',
    });
    expect(consumePendingQuestionOrigin()).toEqual({ key: 'career_move_timing', category: null });
  });

  it('expires the origin past the 30-min TTL (never attaches to a much-later consultation, §19)', () => {
    const now = Date.now();
    const spy = jest.spyOn(Date, 'now').mockReturnValue(now);
    setPendingConsultationIntent({ question: 'q', originQuestionKey: 'new_relationship', originQuestionCategory: 'LOVE' });
    spy.mockReturnValue(now + 31 * 60 * 1000); // +31 min
    expect(consumePendingQuestionOrigin()).toBeNull();
    spy.mockRestore();
  });

  it('a typed question carries NO origin (direct composer never gets a fake id)', () => {
    setPendingConsultationIntent({ question: '그냥 직접 입력한 질문' });
    expect(consumePendingQuestionOrigin()).toBeNull();
    expect(consumePendingQuestion()).toBe('그냥 직접 입력한 질문');
  });

  it('consuming the origin leaves the question intact', () => {
    setPendingConsultationIntent({ question: 'q', originQuestionKey: 'biggest_change_year', originQuestionCategory: 'CHANGE' });
    expect(consumePendingQuestionOrigin()).toEqual({ key: 'biggest_change_year', category: 'CHANGE' });
    expect(consumePendingQuestion()).toBe('q'); // question survives origin consumption
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

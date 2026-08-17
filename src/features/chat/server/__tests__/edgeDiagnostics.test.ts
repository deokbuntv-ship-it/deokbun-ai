// Edge diagnostics — the pure classification + SAFE redaction the chat Edge uses to attribute a 502 to an
// exact class without leaking content. (The Deno Edge can't run under Jest; these test the same bundled code.)
import {
  extractResponsesText,
  openAiFailureCode,
  redactDiag,
  SAFE_DIAG_KEYS,
} from '@/features/chat/server';

describe('extractResponsesText — tolerant OpenAI Responses parsing', () => {
  it('extracts assistant text from output[].content[].output_text', () => {
    expect(
      extractResponsesText({ output: [{ type: 'message', content: [{ type: 'output_text', text: '안녕하세요' }] }] }),
    ).toBe('안녕하세요');
  });
  it('falls back to the top-level output_text convenience field', () => {
    expect(extractResponsesText({ output_text: '요약본' })).toBe('요약본');
  });
  it('malformed / empty / reasoning-only payloads → "" (never throws)', () => {
    expect(extractResponsesText(null)).toBe('');
    expect(extractResponsesText({})).toBe('');
    expect(extractResponsesText({ output: [] })).toBe('');
    expect(extractResponsesText({ output: [{ type: 'reasoning' }] })).toBe(''); // reasoning item, no message
    expect(extractResponsesText({ output: 'not-an-array' })).toBe('');
  });
});

describe('openAiFailureCode — 502 class classification', () => {
  it('transport failure (fetch threw) → OPENAI_FETCH_FAILED', () => {
    expect(openAiFailureCode({ ok: false, statusCode: 0, text: '' })).toBe('OPENAI_FETCH_FAILED');
  });
  it('non-2xx HTTP → OPENAI_HTTP_<status>', () => {
    expect(openAiFailureCode({ ok: false, statusCode: 401, text: '' })).toBe('OPENAI_HTTP_401');
    expect(openAiFailureCode({ ok: false, statusCode: 429, text: '' })).toBe('OPENAI_HTTP_429');
    expect(openAiFailureCode({ ok: false, statusCode: 404, text: '' })).toBe('OPENAI_HTTP_404');
  });
  it('2xx but incomplete → OPENAI_INCOMPLETE_<reason> EVEN WITH partial text (truncated = unusable)', () => {
    expect(openAiFailureCode({ ok: true, statusCode: 200, text: '', incompleteReason: 'max_output_tokens' })).toBe(
      'OPENAI_INCOMPLETE_max_output_tokens',
    );
    // a truncated structured answer has partial text but must still fail closed (never proceed to parse)
    expect(openAiFailureCode({ ok: true, statusCode: 200, text: '{"coreSummary":"차분', incompleteReason: 'max_output_tokens' })).toBe(
      'OPENAI_INCOMPLETE_max_output_tokens',
    );
  });
  it('2xx, complete, but no visible text → OPENAI_EMPTY_OUTPUT (incl. whitespace-only / malformed)', () => {
    expect(openAiFailureCode({ ok: true, statusCode: 200, text: '' })).toBe('OPENAI_EMPTY_OUTPUT');
    expect(openAiFailureCode({ ok: true, statusCode: 200, text: '   ' })).toBe('OPENAI_EMPTY_OUTPUT');
  });
  it('2xx with visible text → OK', () => {
    expect(openAiFailureCode({ ok: true, statusCode: 200, text: '실제 답변입니다.' })).toBe('OK');
  });
});

describe('redactDiag — allowlist (never leaks prompt/birth/question/key/auth/body)', () => {
  it('keeps only the safe allowlisted fields', () => {
    const out = redactDiag({
      // safe
      requestId: 'req_1', stage: 'OPENAI_RESPONSE', code: 'OPENAI_HTTP_401', path: 'consultation',
      model: 'gpt-5-mini', upstreamStatus: 401, responseStatus: 'failed', incompleteReason: null,
      outputTokens: 800, totalTokens: 1200,
      // SENSITIVE — must all be dropped
      prompt: 'SYSTEM: ...', systemPrompt: '...', messages: [{ role: 'system', content: 'x' }],
      birthInput: { birthYear: '1990' }, question: '제 사주 좀 봐줘', grounding: { evidence: {} },
      apiKey: 'sk-secret-xyz', authorization: 'Bearer secret', openaiBody: { output: '...' }, userId: 'u1',
    } as Record<string, unknown>);

    // present (safe)
    expect(out).toMatchObject({ requestId: 'req_1', stage: 'OPENAI_RESPONSE', code: 'OPENAI_HTTP_401', model: 'gpt-5-mini', upstreamStatus: 401, outputTokens: 800 });
    // absent (sensitive) — hard guarantee
    for (const bad of ['prompt', 'systemPrompt', 'messages', 'birthInput', 'question', 'grounding', 'apiKey', 'authorization', 'openaiBody', 'userId']) {
      expect(out).not.toHaveProperty(bad);
    }
    // every emitted key is in the allowlist
    for (const key of Object.keys(out)) expect(SAFE_DIAG_KEYS).toContain(key);
  });

  it('drops null/undefined safe fields (keeps the line compact)', () => {
    const out = redactDiag({ requestId: 'r', stage: 'OPENAI_RESPONSE', code: 'OPENAI_EMPTY_OUTPUT', incompleteReason: null, model: undefined });
    expect(out).toEqual({ requestId: 'r', stage: 'OPENAI_RESPONSE', code: 'OPENAI_EMPTY_OUTPUT' });
  });
});

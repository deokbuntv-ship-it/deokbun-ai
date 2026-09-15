// Spec for the engine-external analysis layer (directive §25 / §2-G).
//
// A minimal runner is now wired (jest + ts-jest; see jest.config.js and the
// `test` script). This harness stays framework-free — `tsc --noEmit` verifies it
// compiles and stays type-correct — and analysis.test.ts drives it under jest by
// calling `runAnalysisSpecs()`. NOT imported by app code (not bundled).

import {
  buildInterpretationContext,
  checkRateLimit,
  emptyRateState,
  parseStructuredAiResponse,
  releaseInFlight,
  resolveEngineAvailability,
  resolveEngineEligibility,
  toAppErrorCode,
  type AnalysisQuestionContext,
} from '../index';
import {
  computeCost,
  type ModelPricingConfig,
} from '@/features/admin/operational/operationalContracts';
import {
  canTransition,
  fortuneIdempotencyKey,
  validateFortuneContent,
} from '@/features/fortune/domain/fortuneDomain';

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
}
function eq<T>(a: T, b: T, msg: string): void {
  assert(a === b, `${msg} (got ${String(a)}, want ${String(b)})`);
}

const withSubject: AnalysisQuestionContext = {
  hasSubject: true,
  birthDateKnown: true,
  birthTimeKnown: true,
  isTimingQuestion: false,
};

export function runAnalysisSpecs(): { passed: number } {
  let passed = 0;
  const ok = (fn: () => void) => {
    fn();
    passed += 1;
  };

  // --- error mapping ---
  ok(() => eq(toAppErrorCode('AUTH_REQUIRED'), 'AUTH_REQUIRED', 'passthrough'));
  ok(() => eq(toAppErrorCode('RATE_LIMITED'), 'LLM_RATE_LIMIT', 'edge rate limit map'));
  ok(() => eq(toAppErrorCode('OPENAI_FETCH_FAILED'), 'NETWORK_ERROR', 'edge fetch map'));
  ok(() => eq(toAppErrorCode('INVALID_HEAVENLY_STEM'), 'ENGINE_FAILURE', 'engine INVALID_* → ENGINE_FAILURE'));
  ok(() => eq(toAppErrorCode('something_else'), 'UNKNOWN', 'unknown → UNKNOWN'));
  ok(() => eq(toAppErrorCode(null), 'UNKNOWN', 'null → UNKNOWN'));

  // --- engine eligibility (product rule) ---
  ok(() => eq(resolveEngineEligibility(withSubject, 'saju'), 'available', 'saju eligible w/ birth date'));
  ok(() =>
    eq(
      resolveEngineEligibility({ ...withSubject, birthTimeKnown: false }, 'ziwei'),
      'missing_birth_time',
      'ziwei needs birth time',
    ),
  );
  ok(() => eq(resolveEngineEligibility(withSubject, 'qimen'), 'not_applicable', 'qimen not for non-timing Q'));
  ok(() =>
    eq(
      resolveEngineEligibility({ ...withSubject, isTimingQuestion: true }, 'qimen'),
      'available',
      'qimen for timing Q',
    ),
  );
  ok(() => eq(resolveEngineEligibility({ ...withSubject, hasSubject: false }, 'saju'), 'not_applicable', 'no subject'));

  // --- SAJU and ZIWEI are now WIRED (consultation grounding path) → effective availability is
  //     'available' when eligible; an eligible-but-time-unknown ziwei stays missing_birth_time;
  //     qimen remains unwired (downgrades to engine_not_connected when eligible) ---
  ok(() => eq(resolveEngineAvailability(withSubject, 'saju'), 'available', 'saju eligible and wired'));
  ok(() =>
    eq(
      resolveEngineAvailability({ ...withSubject, birthTimeKnown: true }, 'ziwei'),
      'available',
      'ziwei eligible and wired',
    ),
  );
  ok(() =>
    eq(
      resolveEngineAvailability({ ...withSubject, birthTimeKnown: false }, 'ziwei'),
      'missing_birth_time',
      'ziwei without birth time → missing_birth_time (never fabricated)',
    ),
  );
  ok(() =>
    eq(
      resolveEngineAvailability({ ...withSubject, isTimingQuestion: true }, 'qimen'),
      'available',
      'qimen eligible (timing question) and wired',
    ),
  );
  ok(() =>
    eq(
      resolveEngineAvailability({ ...withSubject, isTimingQuestion: false }, 'qimen'),
      'not_applicable',
      'qimen not applicable for a non-timing question',
    ),
  );

  // --- normalized context: no fabricated facts, warnings surface ---
  ok(() => {
    const c = buildInterpretationContext({
      question: '올해 이직운은?',
      ctx: { ...withSubject, birthTimeKnown: false },
      subject: { displayName: '본인', relationship: null },
    });
    assert(c.engines.saju.fact === undefined, 'no fabricated saju fact');
    assert(c.warnings.some((w) => w.startsWith('birth_time_unknown')), 'birth-time warning present');
  });

  // --- structured AI parser: not-structured → null (Markdown fallback) ---
  ok(() => assert(parseStructuredAiResponse('그냥 평범한 마크다운 답변입니다.') === null, 'plain text → null'));
  ok(() => {
    const structured = parseStructuredAiResponse(
      '```json\n{"conclusion":"c","overallAssessment":"o","evidence":{"myungri":{"availability":"available","summary":"s"},"ziwei":{"availability":"missing_birth_time"},"qimen":{"availability":"not_applicable"}},"followUpQuestions":["q1"]}\n```',
    );
    assert(structured !== null, 'valid structured parses');
    assert(structured?.evidence.ziwei.availability === 'missing_birth_time', 'ziwei availability parsed');
    assert(structured?.followUpQuestions.length === 1, 'follow-ups parsed');
  });

  // --- rate limit ---
  ok(() => {
    const cfg = { windowMs: 1000, maxRequests: 2, maxConcurrent: 5, seenIdCap: 10 };
    let s = emptyRateState();
    const d1 = checkRateLimit(s, 'r1', 1000, cfg);
    assert(d1.allowed, 'first request allowed');
    s = d1.state;
    const d2 = checkRateLimit(s, 'r2', 1100, cfg);
    assert(d2.allowed, 'second within burst allowed');
    s = d2.state;
    const d3 = checkRateLimit(s, 'r3', 1200, cfg);
    assert(!d3.allowed && d3.code === 'LLM_RATE_LIMIT', 'third exceeds burst → rate limited');
    // duplicate id
    const dDup = checkRateLimit(s, 'r1', 1300, cfg);
    assert(!dDup.allowed && dDup.code === 'DUPLICATE_REQUEST', 'duplicate id blocked');
    // window expiry re-allows
    const d4 = checkRateLimit(s, 'r4', 3000, cfg);
    assert(d4.allowed, 'after window expiry re-allowed');
  });
  ok(() => {
    const cfg = { windowMs: 1000, maxRequests: 100, maxConcurrent: 1, seenIdCap: 10 };
    const d = checkRateLimit({ ...emptyRateState(), inFlight: 1 }, 'x', 0, cfg);
    assert(!d.allowed && d.code === 'LLM_RATE_LIMIT', 'concurrent cap blocks');
  });
  ok(() => {
    // isolation: user A's state does not affect user B (separate state objects)
    const cfg = { windowMs: 1000, maxRequests: 1, maxConcurrent: 5, seenIdCap: 10 };
    const a = checkRateLimit(emptyRateState(), 'a1', 0, cfg);
    const b = checkRateLimit(emptyRateState(), 'b1', 0, cfg);
    assert(a.allowed && b.allowed, 'separate users independent');
    assert(releaseInFlight(a.state).inFlight === 0, 'release frees slot');
  });

  // --- fortune domain ---
  ok(() =>
    eq(
      fortuneIdempotencyKey('u1', 's1', { type: 'monthly', year: 2026, month: 8 }),
      'ftn:u1:s1:monthly:2026-08',
      'idempotency key deterministic',
    ),
  );
  ok(() =>
    assert(
      fortuneIdempotencyKey('u1', 's1', { type: 'monthly', year: 2026, month: 8 }) !==
        fortuneIdempotencyKey('u1', 's2', { type: 'monthly', year: 2026, month: 8 }),
      'different subject → different key',
    ),
  );
  ok(() => assert(canTransition('generating', 'generated'), 'valid transition'));
  ok(() => assert(!canTransition('sent', 'generating'), 'invalid transition blocked'));
  ok(() => assert(validateFortuneContent({}).valid === false, 'empty content invalid'));
  ok(() =>
    assert(
      validateFortuneContent({ title: 't', summary: 's', content: 'c', schemaVersion: 'v1' }).valid,
      'complete content valid',
    ),
  );

  // --- cost calculator ---
  ok(() => assert(computeCost({ model: 'x', inputTokens: 1000, outputTokens: 1000 }, null) === null, 'no pricing → null (not fake 0)'));
  ok(() => {
    const pricing: ModelPricingConfig = {
      provider: 'openai',
      model: 'x',
      effectiveFrom: '2026-01-01',
      currency: 'KRW',
      unit: 'per_1k_tokens',
      inputUnitPrice: 2,
      cachedInputUnitPrice: null,
      outputUnitPrice: 4,
    };
    const cost = computeCost({ model: 'x', inputTokens: 1000, outputTokens: 1000 }, pricing);
    assert(cost !== null && cost.total === 6, 'cost = 2 + 4 per 1k');
  });

  // --- structured parser edge cases ---
  ok(() => assert(parseStructuredAiResponse('{ not valid json') === null, 'malformed JSON → null'));
  ok(() => assert(parseStructuredAiResponse('{"conclusion":"c"}') === null, 'missing evidence → null'));

  return { passed };
}

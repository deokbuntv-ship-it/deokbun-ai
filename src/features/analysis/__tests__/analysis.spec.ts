// Spec for the engine-external analysis layer (directive §25).
//
// NOTE: this project has no test RUNNER yet (adding jest-expo/vitest is a
// dependency decision left to the owner/next session — see CODEX_HANDOFF). These
// specs are written against the real public API so `tsc --noEmit` verifies they
// compile and stay type-correct, and any future runner can execute them by
// calling `runAnalysisSpecs()`. They are NOT imported by app code (not bundled).

import {
  buildInterpretationContext,
  parseStructuredAiResponse,
  resolveEngineAvailability,
  resolveEngineEligibility,
  toAppErrorCode,
  type AnalysisQuestionContext,
} from '../index';

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

  // --- effective availability downgrades to engine_not_connected while unwired ---
  ok(() => eq(resolveEngineAvailability(withSubject, 'saju'), 'engine_not_connected', 'saju eligible but unwired'));

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

  return { passed };
}

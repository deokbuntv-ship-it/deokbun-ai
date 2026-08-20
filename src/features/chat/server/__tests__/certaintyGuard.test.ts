// Sprint A — post-output guarantee / event-certainty guard + one-regeneration-then-fallback policy.
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import { classifyWithGuards, containsForbiddenCertainty } from '@/features/chat/server/certaintyGuard';

describe('containsForbiddenCertainty — narrow + high precision', () => {
  it('flags certainty adverb + assertive outcome, concrete event guarantees, and guaranteed finance', () => {
    expect(containsForbiddenCertainty('이 사주는 반드시 성공합니다.')).toBe(true);
    expect(containsForbiddenCertainty('무조건 부자가 됩니다.')).toBe(true);
    expect(containsForbiddenCertainty('이번 일은 합격합니다.')).toBe(true); // concrete event (shipped detector)
    expect(containsForbiddenCertainty('기다리던 연락이 옵니다.')).toBe(true);
    expect(containsForbiddenCertainty('원금 보장됩니다.')).toBe(true); // guaranteed financial return
  });

  it('does NOT flag hedged / suitability / negated phrasing (no over-rejection)', () => {
    expect(containsForbiddenCertainty('반드시 성공한다고 단정할 수는 없습니다.')).toBe(false);
    expect(containsForbiddenCertainty('무조건 좋다고 보기는 어렵습니다.')).toBe(false);
    expect(containsForbiddenCertainty('반드시 그런 것은 아닙니다.')).toBe(false);
    expect(containsForbiddenCertainty('원금 보장은 어렵습니다.')).toBe(false);
    expect(containsForbiddenCertainty('재물 흐름을 점검하기 좋은 시기입니다.')).toBe(false);
    expect(containsForbiddenCertainty('')).toBe(false);
  });

  it('evaluates per-sentence — a guarantee is caught even next to a hedged sentence', () => {
    expect(
      containsForbiddenCertainty('상황은 유동적일 수 있습니다. 그래도 이번 투자는 반드시 성공합니다.'),
    ).toBe(true);
  });
});

// A substantive structured answer classifyConsultationOutput accepts (no timing/engine claims → ok with
// UNAVAILABLE grounding). Variants toggle the guaranteed phrasing and the presence of a mitigation caution.
const LONG =
  '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. ' +
  '꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.';
const CLEAN = JSON.stringify({ coreSummary: '차분한 흐름입니다.', coreInterpretation: LONG, strengths: ['끈기'] });
const CLEAN_WITH_CAUTION = JSON.stringify({
  coreSummary: '차분한 흐름입니다.',
  coreInterpretation: LONG,
  strengths: ['끈기'],
  cautions: ['조급하게 서두르기보다 속도를 조절하는 편이 좋습니다.'],
});
const GUARANTEE = JSON.stringify({
  coreSummary: '반드시 성공합니다.',
  coreInterpretation: '이 사주는 기운이 좋아 반드시 성공합니다. ' + LONG,
  strengths: ['추진력'],
});

describe('classifyWithGuards — certainty guard with one constrained regeneration', () => {
  it('a clean answer passes with no regeneration', async () => {
    const g = await classifyWithGuards({
      raw: CLEAN,
      grounding: GROUNDING_UNAVAILABLE,
      requireMitigation: false,
      regenerate: async () => { throw new Error('should not regenerate'); },
    });
    expect(g.outcome.kind).toBe('ACCEPTED');
    expect(g.regenerated).toBe(false);
    expect(g.guardRejected).toBe(false);
  });

  it('a guarantee triggers exactly one regeneration; a clean retry is accepted', async () => {
    let calls = 0;
    const g = await classifyWithGuards({
      raw: GUARANTEE,
      grounding: GROUNDING_UNAVAILABLE,
      requireMitigation: false,
      regenerate: async () => { calls += 1; return CLEAN; },
    });
    expect(calls).toBe(1);
    expect(g.regenerated).toBe(true);
    expect(g.outcome.kind).toBe('ACCEPTED');
    expect(g.guardRejected).toBe(false);
  });

  it('a guarantee that persists after regeneration → SEMANTIC_REJECTED (safe fallback)', async () => {
    let calls = 0;
    const g = await classifyWithGuards({
      raw: GUARANTEE,
      grounding: GROUNDING_UNAVAILABLE,
      requireMitigation: false,
      regenerate: async () => { calls += 1; return GUARANTEE; },
    });
    expect(calls).toBe(1); // exactly one retry, never more
    expect(g.outcome.kind).toBe('SEMANTIC_REJECTED');
    expect(g.guardRejected).toBe(true);
  });

  it('a failed regeneration (throw / empty) → SEMANTIC_REJECTED, no infinite retry', async () => {
    const thrown = await classifyWithGuards({
      raw: GUARANTEE, grounding: GROUNDING_UNAVAILABLE, requireMitigation: false,
      regenerate: async () => null,
    });
    expect(thrown.outcome.kind).toBe('SEMANTIC_REJECTED');
    expect(thrown.guardRejected).toBe(true);
  });
});

describe('classifyWithGuards — mitigation infra (wired now, activates with the polarity kernel)', () => {
  it('requireMitigation=false: a cautionary-less answer is accepted (INACTIVE in V1)', async () => {
    const g = await classifyWithGuards({
      raw: CLEAN, grounding: GROUNDING_UNAVAILABLE, requireMitigation: false,
      regenerate: async () => CLEAN,
    });
    expect(g.outcome.kind).toBe('ACCEPTED');
    expect(g.regenerated).toBe(false);
  });

  it('requireMitigation=true: an answer with no cautions regenerates; one WITH a caution is accepted', async () => {
    const g = await classifyWithGuards({
      raw: CLEAN, grounding: GROUNDING_UNAVAILABLE, requireMitigation: true,
      regenerate: async () => CLEAN_WITH_CAUTION,
    });
    expect(g.regenerated).toBe(true);
    expect(g.outcome.kind).toBe('ACCEPTED');
  });

  it('requireMitigation=true: still-missing mitigation after regeneration → SEMANTIC_REJECTED', async () => {
    const g = await classifyWithGuards({
      raw: CLEAN, grounding: GROUNDING_UNAVAILABLE, requireMitigation: true,
      regenerate: async () => CLEAN,
    });
    expect(g.outcome.kind).toBe('SEMANTIC_REJECTED');
    expect(g.guardRejected).toBe(true);
  });
});

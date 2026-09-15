// Consultation V1 Finalization — Phase B interpretation-depth guards (§10/§13/§14/§19). Covers: the
// productivity/service-checklist collapse guard (reuses the shipped Today/Monthly detectors, hooked into the
// EXISTING single-regeneration path so retries stay bounded), and the QUESTION-FIRST domain-routing directive.
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import { classifyWithGuards, containsChecklistCoachTone } from '@/features/chat/server/certaintyGuard';
import { deriveAnswerPlan, renderAnswerPlanDirective } from '@/features/chat/server/answerPlan';

describe('containsChecklistCoachTone — behavioral direction OK, to-do/admin checklist rejected (§13)', () => {
  it('flags productivity/service-checklist + micro-task constructs', () => {
    expect(containsChecklistCoachTone('할 일을 우선순위 3개로 정리하세요.')).toBe(true);
    expect(containsChecklistCoachTone('목록으로 만들어 하나씩 지워 나가세요.')).toBe(true);
    expect(containsChecklistCoachTone('영수증과 계좌 내역을 정리하세요.')).toBe(true);
    expect(containsChecklistCoachTone('최근 30일 지출을 점검하세요.')).toBe(true);
  });
  it('does NOT flag genuine behavioral direction (no over-rejection)', () => {
    expect(containsChecklistCoachTone('지금은 새로 벌이기보다 이미 하는 일을 다듬는 쪽이 유리합니다.')).toBe(false);
    expect(containsChecklistCoachTone('남의 결정을 기다리기보다 직접 움직일수록 성과를 내기 좋은 흐름이에요.')).toBe(false);
    expect(containsChecklistCoachTone('수익 구조를 단단히 하는 방향이 좋습니다.')).toBe(false);
    expect(containsChecklistCoachTone('')).toBe(false);
  });
});

// A substantive structured answer classifyConsultationOutput accepts under UNAVAILABLE grounding (no
// timing/engine claims). One variant collapses into a to-do checklist; the clean one is behavioral direction.
const LONG =
  '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. ' +
  '꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.';
const CLEAN = JSON.stringify({ coreSummary: '차분한 흐름입니다.', coreInterpretation: LONG, strengths: ['끈기'] });
const CHECKLIST = JSON.stringify({
  coreSummary: '차분한 흐름입니다.',
  coreInterpretation: '지금은 할 일을 우선순위 3개로 정리하고 목록으로 만들어 하나씩 점검해 나가는 방식이 필요합니다. ' + LONG,
  strengths: ['끈기'],
});

describe('classifyWithGuards — checklist-tone guard, bounded single regeneration (§13/§19)', () => {
  it('a clean behavioral-direction answer passes with no regeneration', async () => {
    const g = await classifyWithGuards({
      raw: CLEAN,
      grounding: GROUNDING_UNAVAILABLE,
      requireMitigation: false,
      forbidChecklistTone: true,
      regenerate: async () => { throw new Error('should not regenerate'); },
    });
    expect(g.outcome.kind).toBe('ACCEPTED');
    expect(g.regenerated).toBe(false);
  });

  it('a checklist answer triggers exactly one regeneration; a clean retry is accepted', async () => {
    let calls = 0;
    const g = await classifyWithGuards({
      raw: CHECKLIST,
      grounding: GROUNDING_UNAVAILABLE,
      requireMitigation: false,
      forbidChecklistTone: true,
      regenerate: async () => { calls += 1; return CLEAN; },
    });
    expect(calls).toBe(1);
    expect(g.regenerated).toBe(true);
    expect(g.outcome.kind).toBe('ACCEPTED');
  });

  it('a checklist answer that persists after regeneration → SEMANTIC_REJECTED, never an infinite retry', async () => {
    let calls = 0;
    const g = await classifyWithGuards({
      raw: CHECKLIST,
      grounding: GROUNDING_UNAVAILABLE,
      requireMitigation: false,
      forbidChecklistTone: true,
      regenerate: async () => { calls += 1; return CHECKLIST; },
    });
    expect(calls).toBe(1); // bounded — exactly one retry
    expect(g.outcome.kind).toBe('SEMANTIC_REJECTED');
    expect(g.guardRejected).toBe(true);
  });

  it('with the guard OFF, the same checklist answer is not rejected for tone (opt-in only)', async () => {
    const g = await classifyWithGuards({
      raw: CHECKLIST,
      grounding: GROUNDING_UNAVAILABLE,
      requireMitigation: false,
      forbidChecklistTone: false,
      regenerate: async () => { throw new Error('should not regenerate'); },
    });
    expect(g.outcome.kind).toBe('ACCEPTED');
  });
});

describe('renderAnswerPlanDirective — QUESTION-FIRST domain routing (§10/§14)', () => {
  const plan = deriveAnswerPlan('연애운 어때?', GROUNDING_UNAVAILABLE);
  it('names the asked domain and forbids opening with unrelated personality analysis', () => {
    const d = renderAnswerPlanDirective(plan, '연애');
    expect(d).toContain('연애');
    expect(d).toMatch(/성격·타고난 기질 분석으로 답을 시작하지/);
  });
  it('omits the domain line for the generic 전반 topic and when no domain is given', () => {
    expect(renderAnswerPlanDirective(plan, '전반')).not.toMatch(/핵심 주제는/);
    expect(renderAnswerPlanDirective(plan)).not.toMatch(/핵심 주제는/);
  });
});

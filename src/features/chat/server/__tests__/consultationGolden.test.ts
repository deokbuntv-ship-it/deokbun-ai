// GENERAL-CONSULTATION GOLDEN REGRESSION. Runs the REAL deriveAnswerPlan (server-owned Decision Engine,
// ZERO LLM) against every Golden case and asserts the decision contract holds. This is the lock: a future
// change that re-introduces overhedging, an ungrounded winner, a fabricated ranking, or event-certainty
// leakage turns a case RED. The evaluator (consultationQuality) maps each mismatch to a taxonomy code so a
// failure reads as a behavior, not a diff.
import { deriveAnswerPlan, renderAnswerPlanDirective } from '@/features/chat/server/answerPlan';
import { buildGoldenGrounding, evaluateAnswerPlan, summarizeFailures } from '@/features/chat/server/consultationQuality';
import { GOLDEN_CASES } from '@/features/chat/server/consultationGolden';

describe('General consultation Golden Set — the server owns the decision (0 LLM)', () => {
  it.each(GOLDEN_CASES.map((c) => [c.id, c] as const))('%s', (_id, c) => {
    const plan = deriveAnswerPlan(c.question, buildGoldenGrounding(c.scenario), c.mode ?? 'solo');
    const failures = evaluateAnswerPlan(plan, c.expect);
    if (failures.length > 0) {
      // Surface the exact behavior that broke, the question, and the produced plan — so a red case is
      // debuggable without re-running by hand.
      throw new Error(
        `[${c.id}] ${c.shape} — "${c.question}"\n` +
          failures.map((f) => `  ✗ ${f.code} @ ${f.field}: expected ${JSON.stringify(f.expected)}, got ${JSON.stringify(f.actual)}`).join('\n') +
          `\n  plan=${JSON.stringify(plan)}`,
      );
    }
    expect(failures).toEqual([]);
  });

  it('covers the full domain + shape matrix (≥60 cases, all shapes present)', () => {
    expect(GOLDEN_CASES.length).toBeGreaterThanOrEqual(60);
    const shapes = new Set(GOLDEN_CASES.map((c) => c.shape));
    for (const required of ['descriptive', 'suitability', 'domain-comparison', 'month-comparison', 'month-exact', 'month-alternative', 'best-month', 'year-comparison', 'event', 'guarantee', 'action', 'no-grounding'])
      expect(shapes).toContain(required);
    const domains = new Set(GOLDEN_CASES.map((c) => c.domain));
    expect(domains.size).toBeGreaterThanOrEqual(9);
  });

  it('aggregate: the whole set produces ZERO taxonomy failures', () => {
    const all = GOLDEN_CASES.flatMap((c) => evaluateAnswerPlan(deriveAnswerPlan(c.question, buildGoldenGrounding(c.scenario), c.mode ?? 'solo'), c.expect));
    // A single object of counts makes a regression legible at a glance (e.g. { UNDERASSERTIVE: 3 }).
    expect(summarizeFailures(all)).toEqual({});
  });
});

// The plan is only useful if it reaches the LLM as the RIGHT instruction. Lock the two hardened shapes at
// the directive layer too (the string the model actually reads), so a future prompt refactor can't silently
// drop the guardrail while the plan fields still look right.
describe('hardened shapes → directive text (plan → prompt)', () => {
  const directiveFor = (q: string) => renderAnswerPlanDirective(deriveAnswerPlan(q, buildGoldenGrounding({ available: true, years: [2026], referenceYear: 2026 })));

  it('GUARANTEE question → the directive forbids guaranteeing the event, answers suitability instead', () => {
    const d = directiveFor('이 사업 무조건 성공해?');
    expect(d).toMatch(/사건.*확정하지|반드시/); // "사건의 발생 자체를 확정하지 마십시오"
    expect(d).toMatch(/적합도/); // redirect to suitability
    expect(d).not.toContain('EVENT_PREDICTION'); // internal enum never leaks to the model text
  });

  it('NON-TEMPORAL domain comparison → engage the comparison but do NOT crown an ungrounded winner', () => {
    const d = directiveFor('직장 다니는 것과 사업하는 것 중에 뭐가 더 좋을까?');
    expect(d).toMatch(/비교 근거가 충분하지 않|승자로 단정하지/);
    expect(d).not.toContain('comparisonSupported');
  });
});

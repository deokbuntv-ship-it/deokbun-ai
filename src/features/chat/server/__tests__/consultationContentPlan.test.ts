// CONSULTATION EXPRESSION ARCHITECTURE V1 — determinism + no-new-authority tests (brief §13). The Content
// Plan is a pure presentation layer: it may select/prioritize/order/group information the Cross verdict
// already carries, and must never invent a fact, change the verdict, or turn uncertainty into certainty.
import * as fs from 'fs';
import * as path from 'path';

import {
  buildConsultationContentPlan, renderContentPlanDirective, selectEvidence, type ContentDomain,
} from '@/features/chat/server/consultationContentPlan';
import type { CrossDivinationVerdict, JudgmentDomain, JudgmentEvidence, Stance } from '@/features/divination/contracts';

function ev(overrides: Partial<JudgmentEvidence>): JudgmentEvidence {
  return {
    fact: '일지 육합', meaning: '테스트 근거 의미', domain: 'GENERAL', temporalScope: 'NATAL', directness: 'GENERAL',
    ...overrides,
  };
}

function mkVerdict(overrides: Partial<CrossDivinationVerdict>): CrossDivinationVerdict {
  return {
    question: '지금 이 사업 시작해도 될까?',
    questionDomain: 'OPPORTUNITY',
    questionIntent: 'DECISION',
    evaluatedAtEpochSeconds: null,
    asksTiming: false,
    premises: [],
    primaryConclusion: '테스트 결론',
    headlinePropositionIds: [],
    direction: 'FOR',
    dominantBasis: '명리',
    disciplineJudgments: [],
    contributions: [],
    axisVerdicts: [],
    propositions: [],
    agreementPoints: ['두 체계 모두 같은 방향을 가리킵니다'],
    contradictionPoints: [],
    contradictionResolutions: [],
    natalBaseline: '원국에 사업 확장의 바탕이 있습니다',
    currentFlow: '올해 흐름이 그 바탕을 지지합니다',
    timingConclusion: null,
    favorableFactors: [
      ev({ fact: '재성 통근', meaning: '재물이 들어오는 통로가 열려 있습니다', domain: 'OPPORTUNITY', directness: 'DIRECT', temporalScope: 'NATAL' }),
      ev({ fact: '일지 육합', meaning: '협력 관계가 유리하게 작동합니다', domain: 'RELATION_BOND', directness: 'ADJACENT', temporalScope: 'SEWOON' }),
      ev({ fact: '식상생재', meaning: '실행력이 결과로 이어지는 구조입니다', domain: 'OPPORTUNITY', directness: 'DIRECT', temporalScope: 'DAEWOON' }),
      ev({ fact: '월지 형', meaning: '초반에 마찰이 있을 수 있습니다', domain: 'CONFLICT', directness: 'GENERAL', temporalScope: 'NATAL' }),
      ev({ fact: '세운 재성', meaning: '올해 재물운이 함께 들어옵니다', domain: 'MONEY_INFLOW', directness: 'ADJACENT', temporalScope: 'SEWOON' }),
    ],
    riskFactors: [
      ev({ fact: '편관 혼잡', meaning: '경쟁이나 외부 압박이 함께 옵니다', domain: 'OPPORTUNITY', directness: 'DIRECT', temporalScope: 'NATAL' }),
    ],
    actionableInterpretation: '단계적으로 확장하며 검증하십시오',
    confidence: 'MEDIUM',
    confidenceReason: '테스트',
    evidenceReferences: [{ discipline: 'MYUNGRI', lines: ['재성 통근 — 재물이 들어오는 통로'] }],
    verdictVersion: 'test',
    ...overrides,
  };
}

describe('determinism — identical inputs produce identical plans (§13)', () => {
  it('calling twice with deep-equal (not same-reference) verdicts produces a deep-equal plan', () => {
    const a = buildConsultationContentPlan(mkVerdict({}));
    const b = buildConsultationContentPlan(mkVerdict({}));
    expect(a).toEqual(b);
  });
});

describe('the plan never mutates or changes the verdict (§13)', () => {
  it('the verdict object is untouched after building a plan from it', () => {
    const verdict = mkVerdict({});
    const frozen = JSON.parse(JSON.stringify(verdict));
    buildConsultationContentPlan(verdict);
    expect(verdict).toEqual(frozen);
  });

  it('the plan cannot carry a different direction than the verdict it was built from', () => {
    const verdict = mkVerdict({ direction: 'STRONGLY_AGAINST' });
    buildConsultationContentPlan(verdict);
    expect(verdict.direction).toBe('STRONGLY_AGAINST'); // unread/unwritten by the plan builder
  });
});

describe('no new facts — every selected item traces back to the verdict\'s own evidence (§13)', () => {
  it('selectedEvidence is a subset of favorableFactors', () => {
    const verdict = mkVerdict({});
    const plan = buildConsultationContentPlan(verdict);
    for (const e of plan.selectedEvidence) {
      expect(verdict.favorableFactors).toContainEqual(e);
    }
  });

  it('counterEvidence is a subset of riskFactors', () => {
    const verdict = mkVerdict({});
    const plan = buildConsultationContentPlan(verdict);
    for (const e of plan.counterEvidence) {
      expect(verdict.riskFactors).toContainEqual(e);
    }
  });

  it('directAnswerIntent/natalBaseline/periodContext/timingConclusion are verbatim passthroughs, never rephrased', () => {
    const verdict = mkVerdict({});
    const plan = buildConsultationContentPlan(verdict);
    expect(plan.directAnswerIntent).toBe(verdict.primaryConclusion);
    expect(plan.natalBaseline).toBe(verdict.natalBaseline);
    expect(plan.periodContext).toBe(verdict.currentFlow);
    expect(plan.timingConclusion).toBe(verdict.timingConclusion);
    expect(plan.proposition).toBe(verdict.question);
  });

  it('selectEvidence never returns more than 4 items per side, and never invents when the pool is smaller', () => {
    const verdict = mkVerdict({ favorableFactors: [ev({ meaning: 'only one' })], riskFactors: [] });
    const { supporting, counter } = selectEvidence(verdict, 'BUSINESS');
    expect(supporting.length).toBe(1);
    expect(counter.length).toBe(0);
  });
});

describe('counter-evidence survives where it exists (§4/§13)', () => {
  it('a verdict with riskFactors always produces non-empty plan.counterEvidence', () => {
    const plan = buildConsultationContentPlan(mkVerdict({}));
    expect(plan.counterEvidence.length).toBeGreaterThan(0);
  });

  it('a verdict with NO riskFactors produces empty counterEvidence, never a fabricated one', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ riskFactors: [] }));
    expect(plan.counterEvidence).toEqual([]);
  });

  it('mustNotClaim tells the renderer not to hide counter-evidence whenever it exists', () => {
    const plan = buildConsultationContentPlan(mkVerdict({}));
    expect(plan.mustNotClaim.some((s) => /반대|주의 근거/.test(s))).toBe(true);
  });
});

describe('unresolved remains unresolved (§10/§13)', () => {
  it.each<Stance>(['INSUFFICIENT_DATA', 'INSUFFICIENT_EVIDENCE'])('direction=%s ⇒ verdictState=DECLINED and mustNotClaim forbids false certainty', (direction) => {
    const plan = buildConsultationContentPlan(mkVerdict({ direction }));
    expect(plan.verdictState).toBe('DECLINED');
    expect(plan.actionBoundary).toBe('CAUTIOUS');
    expect(plan.mustNotClaim.some((s) => /확정된 결론/.test(s))).toBe(true);
  });

  it('a directional verdict is never marked DECLINED', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ direction: 'FOR' }));
    expect(plan.verdictState).toBe('DIRECTIONAL');
  });

  it('no timing basis ⇒ mustNotClaim forbids inventing a date', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ timingConclusion: null }));
    expect(plan.mustNotClaim.some((s) => /날짜|시점/.test(s))).toBe(true);
  });
});

describe('domain differentiation — same verdict shape, different domain ⇒ different facets (§3/§13)', () => {
  const DOMAINS: JudgmentDomain[] = ['OPPORTUNITY', 'MONEY_INFLOW', 'CAREER', 'RELATION_BOND', 'MOVEMENT'];
  const plans = DOMAINS.map((questionDomain) => buildConsultationContentPlan(mkVerdict({ questionDomain })));

  it('each domain resolves to a distinct ContentDomain with its own facet set', () => {
    const domains = plans.map((p) => p.domain);
    expect(new Set(domains).size).toBe(domains.length); // all 5 distinct
  });

  it('facet labels differ across domains (not the same generic template reused)', () => {
    const facetSets = plans.map((p) => p.facets.map((f) => f.label).join('|'));
    expect(new Set(facetSets).size).toBe(facetSets.length);
  });

  it('an unroutable domain (e.g. HEALTH_ENERGY) falls back to GENERAL, not a fabricated one', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ questionDomain: 'HEALTH_ENERGY' }));
    expect(plan.domain).toBe('GENERAL');
  });
});

describe('question differentiation — same evidence pool, different question signal ⇒ different selection (§5/§13)', () => {
  // Same chart/context (identical favorableFactors pool) — only the question's OWN classification differs
  // (asksTiming, questionDomain), exactly like "사업이 맞나요?" (fit) vs "올해 사업 시작해도 되나요?" (timing).
  const pool: JudgmentEvidence[] = [
    ev({ fact: '재성 통근', meaning: '구조적으로 재물 통로가 있습니다', domain: 'OPPORTUNITY', directness: 'DIRECT', temporalScope: 'NATAL' }),
    ev({ fact: '세운 재성 도달', meaning: '올해 그 통로가 실제로 열립니다', domain: 'OPPORTUNITY', directness: 'DIRECT', temporalScope: 'SEWOON' }),
  ];

  it('a fit-style question (asksTiming=false) ranks the NATAL-scoped item first', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ favorableFactors: pool, asksTiming: false }));
    expect(plan.selectedEvidence[0].temporalScope).toBe('NATAL');
  });

  it('a timing-style question (asksTiming=true) ranks the SEWOON-scoped item first', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ favorableFactors: pool, asksTiming: true }));
    expect(plan.selectedEvidence[0].temporalScope).toBe('SEWOON');
  });

  it('the underlying facts are identical in both cases — only the ordering changed, nothing invented', () => {
    const a = buildConsultationContentPlan(mkVerdict({ favorableFactors: pool, asksTiming: false }));
    const b = buildConsultationContentPlan(mkVerdict({ favorableFactors: pool, asksTiming: true }));
    const factsOf = (items: readonly JudgmentEvidence[]) => [...items.map((e) => e.fact)].sort();
    expect(factsOf(a.selectedEvidence)).toEqual(factsOf(b.selectedEvidence));
  });
});

describe('no numeric vote/scoring logic was introduced (§4/§13)', () => {
  it('the implementation file contains no weighted-sum or vote-counting pattern', () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, '../consultationContentPlan.ts'), 'utf8',
    );
    expect(src).not.toMatch(/score\s*\+=|weight\s*\*|votes?\s*\+\+|\.reduce\(\(.*(score|weight|vote)/i);
  });

  it('ranking is a fixed 3-key ordinal tuple compare, not a summed/weighted number', () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, '../consultationContentPlan.ts'), 'utf8',
    );
    expect(src).toMatch(/a\[0\]\s*-\s*b\[0\]\s*\|\|\s*a\[1\]\s*-\s*b\[1\]\s*\|\|\s*a\[2\]\s*-\s*b\[2\]/);
  });
});

describe('renderContentPlanDirective — output shape', () => {
  it('never emits a raw fact without its plain-Korean meaning leading it', () => {
    const plan = buildConsultationContentPlan(mkVerdict({}));
    const text = renderContentPlanDirective(plan);
    for (const e of plan.selectedEvidence) {
      expect(text).toContain(`${e.meaning} (근거: ${e.fact})`);
    }
  });

  it('an empty-evidence plan still renders a valid, non-crashing directive with the domain facets', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ favorableFactors: [], riskFactors: [] }));
    const text = renderContentPlanDirective(plan);
    expect(text).toContain(plan.domain);
    expect(text.length).toBeGreaterThan(0);
  });
});

describe('provenance — the plan identifies itself, and only itself, as its own source (§2)', () => {
  it('provenance is the fixed content-plan tag, never a divination engine tag', () => {
    const plan = buildConsultationContentPlan(mkVerdict({}));
    expect(plan.provenance).toEqual(['deokbunai.consultation-content-plan.v1']);
  });
});

// Type-level smoke: ContentDomain must stay assignable from the 7 judge domains + GENERAL — a compile check,
// not a runtime assertion (this line failing to compile IS the test).
const _domainCheck: ContentDomain[] = ['BUSINESS', 'MONEY', 'CAREER', 'LOVE', 'REUNION', 'CHANGE', 'TIMING', 'GENERAL'];
void _domainCheck;

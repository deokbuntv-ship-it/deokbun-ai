// CONSULTATION EXPRESSION ARCHITECTURE V1 + QUALITY-94 DEVELOPMENT REPAIR — determinism, evidence-budget,
// role-awareness, and no-new-authority tests. The Content Plan is a pure presentation layer: it may select/
// prioritize/order/group information the Cross verdict already carries, and must never invent a fact, change
// the verdict, or turn uncertainty into certainty.
import * as fs from 'fs';
import * as path from 'path';

import {
  buildConsultationContentPlan, renderContentPlanDirective, type ContentDomain,
} from '@/features/chat/server/consultationContentPlan';
import { applyVerdictAuthorityClamp } from '@/features/chat/server/buildServerConsultation';
import { DECLINED_TO_DECIDE_SUMMARY } from '@/features/divination/verdictDirective';
import type { ConsultationOutcome, ParsedStructuredConsultation } from '@/features/chat/prompts/structuredConsultation';
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

describe('§1/§11.1 — evidence budget: never more than 4 items TOTAL', () => {
  it('a rich pool (5 favorable + 1 risk) still yields <= 4 selected items', () => {
    const plan = buildConsultationContentPlan(mkVerdict({}));
    expect(plan.selectedEvidence.length).toBeLessThanOrEqual(4);
  });

  it('an even richer pool (10 favorable + 5 risk) still yields <= 4 selected items', () => {
    const bigFavorable = Array.from({ length: 10 }, (_, i) => ev({ fact: `fact-${i}`, meaning: `meaning-${i}`, directness: 'DIRECT' }));
    const bigRisk = Array.from({ length: 5 }, (_, i) => ev({ fact: `risk-${i}`, meaning: `risk-meaning-${i}`, directness: 'DIRECT' }));
    const plan = buildConsultationContentPlan(mkVerdict({ favorableFactors: bigFavorable, riskFactors: bigRisk }));
    expect(plan.selectedEvidence.length).toBeLessThanOrEqual(4);
  });
});

describe('§11.2 — selected evidence always derives from the supplied verdict', () => {
  it('every selected anchor/meaning pair traces back to favorableFactors or riskFactors', () => {
    const verdict = mkVerdict({});
    const plan = buildConsultationContentPlan(verdict);
    const pool = [...verdict.favorableFactors, ...verdict.riskFactors];
    for (const item of plan.selectedEvidence) {
      expect(pool.some((e) => e.fact === item.anchor && e.meaning === item.meaning)).toBe(true);
    }
  });

  it('directAnswerIntent/natalBaseline/periodContext/timingConclusion are verbatim passthroughs', () => {
    const verdict = mkVerdict({});
    const plan = buildConsultationContentPlan(verdict);
    expect(plan.directAnswerIntent).toBe(verdict.primaryConclusion);
    expect(plan.natalBaseline).toBe(verdict.natalBaseline);
    expect(plan.periodContext).toBe(verdict.currentFlow);
    expect(plan.timingConclusion).toBe(verdict.timingConclusion);
    expect(plan.proposition).toBe(verdict.question);
  });
});

describe('§11.3/§11.4 — counter-evidence: preserved within budget, never forced', () => {
  it('a verdict with riskFactors always includes exactly one COUNTER item within the 4-item budget', () => {
    const plan = buildConsultationContentPlan(mkVerdict({}));
    const counters = plan.selectedEvidence.filter((e) => e.role === 'COUNTER');
    expect(counters.length).toBe(1);
    expect(plan.selectedEvidence.length).toBeLessThanOrEqual(4);
  });

  it('a verdict with NO riskFactors selects zero counter items — never fabricated', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ riskFactors: [] }));
    expect(plan.selectedEvidence.some((e) => e.role === 'COUNTER')).toBe(false);
  });

  it('mustNotClaim only warns against hiding counter-evidence when one was actually selected', () => {
    const withRisk = buildConsultationContentPlan(mkVerdict({}));
    const withoutRisk = buildConsultationContentPlan(mkVerdict({ riskFactors: [] }));
    expect(withRisk.mustNotClaim.some((s) => /반대·주의 근거/.test(s))).toBe(true);
    expect(withoutRisk.mustNotClaim.some((s) => /반대·주의 근거/.test(s))).toBe(false);
  });
});

describe('§2/§11.5 — question relevance: business-fit vs current-business-timing on the SAME chart', () => {
  // Same evidence pool — a NATAL/structural item and a CURRENT/period item both exist. Only the question's
  // OWN asksTiming signal differs, exactly like "나는 사업 체질인가?" (fit) vs "지금 이 사업 시작해도 되나?"
  // (execution timing).
  const pool: JudgmentEvidence[] = [
    ev({ fact: '재성 통근', meaning: '구조적으로 사업 체질이 맞습니다', domain: 'OPPORTUNITY', directness: 'DIRECT', temporalScope: 'NATAL' }),
    ev({ fact: '질문시 국세', meaning: '지금 이 순간 실행하기 좋은 기운입니다', domain: 'OPPORTUNITY', directness: 'DIRECT', temporalScope: 'PRESENT_MOMENT' }),
  ];

  it('a fit-style question (asksTiming=false) ranks the NATAL item first', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ favorableFactors: pool, asksTiming: false }));
    expect(plan.selectedEvidence[0].temporalRole).toBe('NATAL');
  });

  it('a current-timing question (asksTiming=true) ranks the CURRENT item first', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ favorableFactors: pool, asksTiming: true }));
    expect(plan.selectedEvidence[0].temporalRole).toBe('CURRENT');
  });
});

describe('§9/§11.6 — question relevance: wealth-capacity vs current-investment on the SAME chart', () => {
  const pool: JudgmentEvidence[] = [
    ev({ fact: '재백 뿌리', meaning: '평생 재물을 담는 그릇 자체가 큽니다', domain: 'MONEY_INFLOW', directness: 'DIRECT', temporalScope: 'NATAL' }),
    ev({ fact: '세운 재성 도달', meaning: '올해 투자처가 실제로 열립니다', domain: 'MONEY_INFLOW', directness: 'DIRECT', temporalScope: 'SEWOON' }),
  ];

  it('"재물 그릇이 큰가" (asksTiming=false) leads with the NATAL capacity fact', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ favorableFactors: pool, asksTiming: false, question: '재물 그릇이 큰가?' }));
    expect(plan.selectedEvidence[0].temporalRole).toBe('NATAL');
  });

  it('"올해 투자해도 되나" (asksTiming=true) leads with the PERIOD/current fact', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ favorableFactors: pool, asksTiming: true, question: '올해 투자해도 되나?' }));
    expect(plan.selectedEvidence[0].temporalRole).not.toBe('NATAL');
  });

  it('the underlying facts are identical either way — only ranking changed, nothing invented', () => {
    const a = buildConsultationContentPlan(mkVerdict({ favorableFactors: pool, asksTiming: false }));
    const b = buildConsultationContentPlan(mkVerdict({ favorableFactors: pool, asksTiming: true }));
    const anchorsOf = (items: typeof a.selectedEvidence) => [...items.map((e) => e.anchor)].sort();
    expect(anchorsOf(a.selectedEvidence)).toEqual(anchorsOf(b.selectedEvidence));
  });
});

describe('§11.7 — natal / period / current-situation roles are not silently collapsed', () => {
  it('natalBaseline, periodContext, and timingConclusion stay three distinct fields, never merged', () => {
    const verdict = mkVerdict({ timingConclusion: '올해 하반기가 실행 적기입니다' });
    const plan = buildConsultationContentPlan(verdict);
    expect(plan.natalBaseline).toBe(verdict.natalBaseline);
    expect(plan.periodContext).toBe(verdict.currentFlow);
    expect(plan.timingConclusion).toBe(verdict.timingConclusion);
    expect(new Set([plan.natalBaseline, plan.periodContext, plan.timingConclusion]).size).toBe(3);
  });

  it('evidence roles (NATAL/PERIOD/CURRENT) are individually preserved per item, not reduced to one flag', () => {
    const pool: JudgmentEvidence[] = [
      ev({ fact: 'a', meaning: 'a-meaning', temporalScope: 'NATAL', directness: 'DIRECT' }),
      ev({ fact: 'b', meaning: 'b-meaning', temporalScope: 'DAEWOON', directness: 'DIRECT' }),
      ev({ fact: 'c', meaning: 'c-meaning', temporalScope: 'PRESENT_MOMENT', directness: 'DIRECT' }),
    ];
    const plan = buildConsultationContentPlan(mkVerdict({ favorableFactors: pool }));
    const roles = new Set(plan.selectedEvidence.map((e) => e.temporalRole));
    expect(roles.size).toBeGreaterThan(1); // distinct roles survive as distinct roles
  });
});

describe('§11.8 — unresolved remains unresolved', () => {
  it.each<Stance>(['INSUFFICIENT_DATA', 'INSUFFICIENT_EVIDENCE'])('direction=%s ⇒ verdictState=DECLINED, mustNotClaim forbids false certainty', (direction) => {
    const plan = buildConsultationContentPlan(mkVerdict({ direction }));
    expect(plan.verdictState).toBe('DECLINED');
    expect(plan.actionBoundary).toBe('CAUTIOUS');
    expect(plan.mustNotClaim.some((s) => /확정된 결론/.test(s))).toBe(true);
  });

  it('a directional verdict is never marked DECLINED', () => {
    expect(buildConsultationContentPlan(mkVerdict({ direction: 'FOR' })).verdictState).toBe('DIRECTIONAL');
  });

  it('no timing basis ⇒ mustNotClaim forbids inventing a date', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ timingConclusion: null }));
    expect(plan.mustNotClaim.some((s) => /날짜|시점/.test(s))).toBe(true);
  });
});

describe('§11.9 — the plan can never change the Cross verdict', () => {
  it('the verdict object is byte-for-byte untouched after building a plan from it', () => {
    const verdict = mkVerdict({});
    const frozen = JSON.parse(JSON.stringify(verdict));
    buildConsultationContentPlan(verdict);
    expect(verdict).toEqual(frozen);
  });

  it('calling twice with deep-equal (not same-reference) verdicts produces a deep-equal plan (determinism)', () => {
    expect(buildConsultationContentPlan(mkVerdict({}))).toEqual(buildConsultationContentPlan(mkVerdict({})));
  });
});

describe('§11.10 — the renderer directive is bounded and never dumps every fact', () => {
  it('the directive never renders more than 4 evidence bullet lines', () => {
    const bigFavorable = Array.from({ length: 12 }, (_, i) => ev({ fact: `fact-${i}`, meaning: `meaning-${i}`, directness: 'DIRECT' }));
    const plan = buildConsultationContentPlan(mkVerdict({ favorableFactors: bigFavorable }));
    const text = renderContentPlanDirective(plan);
    const bulletLines = text.split('\n').filter((l) => /^\s*- \[(뒷받침|반대\/주의)\]/.test(l));
    expect(bulletLines.length).toBeLessThanOrEqual(4);
  });

  it('at most 3 domain facets are ever mentioned, never the full reference list', () => {
    const plan = buildConsultationContentPlan(mkVerdict({}));
    const text = renderContentPlanDirective(plan);
    const facetLine = text.split('\n').find((l) => l.includes('질문 영역'));
    const mentionedCount = plan.facets.filter((f) => facetLine?.includes(f.label)).length;
    expect(mentionedCount).toBeLessThanOrEqual(3);
  });

  it('opens with a direct-answer-first instruction, before any evidence/facet content', () => {
    const text = renderContentPlanDirective(buildConsultationContentPlan(mkVerdict({})));
    expect(text.split('\n')[0]).toMatch(/직접 답/);
  });

  it('an empty-evidence plan still renders a valid, non-crashing directive', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ favorableFactors: [], riskFactors: [] }));
    const text = renderContentPlanDirective(plan);
    expect(text).toContain(plan.domain);
    expect(text.length).toBeGreaterThan(0);
  });
});

describe('§11.11 — Verdict Authority Clamp remains downstream and final, untouched by this repair', () => {
  const richResult: ParsedStructuredConsultation = {
    coreSummary: 'B가 안전합니다.',
    coreInterpretation: '기다리는 편이 낫습니다.',
    strengths: [], cautions: [], domainInterpretation: [], futureFlow: '', followUps: [],
  };
  const accepted = (result: ParsedStructuredConsultation): ConsultationOutcome => ({ kind: 'ACCEPTED', result });

  it('a declined verdict still clamps coreSummary to the deterministic neutral sentence, regardless of any Content Plan content', () => {
    const verdict = mkVerdict({ direction: 'INSUFFICIENT_EVIDENCE' });
    buildConsultationContentPlan(verdict); // the plan runs; the clamp is a SEPARATE, later step and cannot see it
    const out = applyVerdictAuthorityClamp(accepted(richResult), verdict);
    expect(out?.coreSummary).toBe(DECLINED_TO_DECIDE_SUMMARY);
  });

  it('applyVerdictAuthorityClamp is still a pure, 2-argument, synchronous function (no new dependency on the Content Plan)', () => {
    expect(applyVerdictAuthorityClamp.length).toBe(2);
  });
});

describe('no numeric vote/scoring logic was introduced', () => {
  it('the implementation file contains no weighted-sum or vote-counting pattern', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../consultationContentPlan.ts'), 'utf8');
    expect(src).not.toMatch(/score\s*\+=|weight\s*\*|votes?\s*\+\+|\.reduce\(\(.*(score|weight|vote)/i);
  });

  it('ranking is a fixed 3-key ordinal tuple compare, not a summed/weighted number', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../consultationContentPlan.ts'), 'utf8');
    expect(src).toMatch(/a\[0\]\s*-\s*b\[0\]\s*\|\|\s*a\[1\]\s*-\s*b\[1\]\s*\|\|\s*a\[2\]\s*-\s*b\[2\]/);
  });
});

describe('cross-synthesis material is surfaced only from the verdict\'s own fields', () => {
  it('synthesis.agreement is a verbatim passthrough of agreementPoints[0]', () => {
    const verdict = mkVerdict({ agreementPoints: ['명리와 자미두수가 같은 결론을 가리킵니다'] });
    expect(buildConsultationContentPlan(verdict).synthesis?.agreement).toBe(verdict.agreementPoints[0]);
  });

  it('synthesis.scopeSeparation is a verbatim passthrough of the first contradictionResolution', () => {
    const verdict = mkVerdict({
      agreementPoints: [],
      contradictionResolutions: [{ conflict: '명리는 유리, 기문은 불리', resolution: '원국은 유리하나 상황판은 지금 불리합니다', dominant: 'QIMEN' }],
    });
    const plan = buildConsultationContentPlan(verdict);
    expect(plan.synthesis?.scopeSeparation).toEqual({ conflict: '명리는 유리, 기문은 불리', resolution: '원국은 유리하나 상황판은 지금 불리합니다' });
  });

  it('no agreement and no contradiction resolution ⇒ synthesis is null, never fabricated', () => {
    const plan = buildConsultationContentPlan(mkVerdict({ agreementPoints: [], contradictionResolutions: [] }));
    expect(plan.synthesis).toBeNull();
  });

  it('the directive never renders a flat "명리는 A, 자미는 B" list in place of synthesis instruction', () => {
    const text = renderContentPlanDirective(buildConsultationContentPlan(mkVerdict({})));
    expect(text).toMatch(/종합하십시오/);
  });
});

describe('domain differentiation — same verdict shape, different domain ⇒ different facets', () => {
  const DOMAINS: JudgmentDomain[] = ['OPPORTUNITY', 'MONEY_INFLOW', 'CAREER', 'RELATION_BOND', 'MOVEMENT'];
  const plans = DOMAINS.map((questionDomain) => buildConsultationContentPlan(mkVerdict({ questionDomain })));

  it('each domain resolves to a distinct ContentDomain', () => {
    expect(new Set(plans.map((p) => p.domain)).size).toBe(plans.length);
  });

  it('an unroutable domain (e.g. HEALTH_ENERGY) falls back to GENERAL, not a fabricated one', () => {
    expect(buildConsultationContentPlan(mkVerdict({ questionDomain: 'HEALTH_ENERGY' })).domain).toBe('GENERAL');
  });
});

describe('provenance — the plan identifies itself, and only itself, as its own source', () => {
  it('provenance is the fixed content-plan tag, never a divination engine tag', () => {
    expect(buildConsultationContentPlan(mkVerdict({})).provenance).toEqual(['deokbunai.consultation-content-plan.v1']);
  });
});

// Type-level smoke: ContentDomain must stay assignable from the 7 judge domains + GENERAL.
const _domainCheck: ContentDomain[] = ['BUSINESS', 'MONEY', 'CAREER', 'LOVE', 'REUNION', 'CHANGE', 'TIMING', 'GENERAL'];
void _domainCheck;

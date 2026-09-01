// DECISION JUDGMENT V1 — each discipline judges the PROPOSITION, not just its own axis panel.
//
// The V6.1 census left 34 declines. 11 of them (D1) had abundant directional judgment inside the disciplines
// and none of it on the axis the question was actually about, because all three Consultation Judge V1 results
// — computed on every paid turn — were structurally unable to reach Cross. These tests lock what the new
// layer may do, and, with equal weight, what it may not: no invented relation, no invented timing, no fake
// option winner, no CONTEXT axis deciding anything, and no discipline silently answering a different
// proposition from its peers.
//
// Every fixture is SYNTHETIC, written for the semantic family it exercises. None is copied from any benchmark.
import { createHash } from 'crypto';

import { buildDecisionProposition } from '@/features/chat/server/decisionProposition';
import { parseDivinationVerdict } from '@/features/chat/server/decisionMeta';
import {
  resolveAskedTarget, resolveJudgmentDomain, resolveQuestionIntent, buildConsultationGrounding,
} from '@/features/chat/services/consultationGrounding';
import { classifyTimingQuestion } from '@/features/chat/selectors/qimenActivation';
import {
  judgeCross, judgeDecision, projectDecisionJudgments, propositionIdOf,
} from '@/features/divination';
import type {
  DecisionJudgmentV1, DomainJudgeSummary, JudgedProposition,
} from '@/features/divination';
import type {
  CrossDivinationVerdict, DivinationJudgment, JudgmentDomain, JudgmentEvidence, Stance,
} from '@/features/divination/contracts';
import type { ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

/** The proposition, resolved exactly as the server resolves it (same resolvers, same order). */
const propose = (q: string) => buildDecisionProposition(q, {
  askedAxis: resolveJudgmentDomain(q), intent: resolveQuestionIntent(q),
  asksTiming: classifyTimingQuestion(q), askedTarget: resolveAskedTarget(q),
});

const ev = (fact: string, domain: JudgmentDomain, meaning = `${fact} 관련 근거`): JudgmentEvidence => ({
  fact, meaning, domain, temporalScope: 'NATAL', directness: 'DIRECT',
});

/** A discipline judgment whose axis panel is deliberately silent on the axis under test. */
const judgment = (over: Partial<DivinationJudgment> = {}): DivinationJudgment => ({
  discipline: 'MYUNGRI', applicable: true, dataReliability: 'EXACT',
  questionDomain: 'GENERAL', temporalScope: 'NATAL', stance: 'INSUFFICIENT_EVIDENCE',
  dominantConclusion: '판단 보류', dominantFactor: '없음',
  directEvidence: [], counterEvidence: [], internalContradictions: [], timingSignals: [],
  domainSubJudgments: [], confidence: 'MEDIUM', questionDirectness: 'ADJACENT', evidenceStrength: 'NONE',
  factGroupsUsed: [], ...over,
});

const domainJudge = (over: Partial<DomainJudgeSummary> = {}): DomainJudgeSummary => ({
  domain: 'MONEY', status: 'FAVORABLE', conclusion: '재물 축이 열려 있는 배치입니다.',
  supportingEvidence: [ev('재성 통근', 'MONEY_RETENTION')], counterEvidence: [], uncertaintyReasons: [],
  provenance: ['deokbunai.myungri-consultation-judge.v1'], ...over,
});

const judged = (p: ReturnType<typeof propose>): JudgedProposition => p;

// ════ 1–4. EACH DISCIPLINE JUDGES THE SAME PROPOSITION, INDEPENDENTLY ═══════════════════════════════
describe('the three disciplines each judge the same proposition', () => {
  const p = judged(propose('지금 다니는 회사를 그만두고 다른 데로 옮겨도 될까요?'));

  it('1 — Myungri evaluates the proposition from its own domain judgment when its panel is silent', () => {
    const d = judgeDecision({
      judgment: judgment({ discipline: 'MYUNGRI' }),
      proposition: p,
      domainResult: domainJudge({ domain: 'CAREER', supportingEvidence: [ev('정관 투간', 'CAREER')] }),
    });
    expect(d.discipline).toBe('MYUNGRI');
    expect(d.primaryAssessment).not.toBeNull();
    expect(d.primaryAssessment!.basis).toBe('DOMAIN_JUDGE');
    expect(d.decisionStance).toBe('FOR');
  });

  it('2 — Ziwei evaluates the SAME proposition from ITS own material, reaching its own conclusion', () => {
    const d = judgeDecision({
      judgment: judgment({ discipline: 'ZIWEI' }),
      proposition: p,
      domainResult: domainJudge({
        domain: 'CAREER', status: 'CAUTION',
        supportingEvidence: [], counterEvidence: [ev('관록궁 화기', 'CAREER')],
      }),
    });
    expect(d.discipline).toBe('ZIWEI');
    expect(d.decisionStance).toBe('AGAINST');
    // Independence is the point: same proposition id, opposite reading, neither contaminated by the other.
    expect(d.propositionId).toBe(propositionIdOf(p));
  });

  it('3 — Qimen evaluates it when applicable, and says NOT_APPLICABLE rather than a weak no when it is not', () => {
    const applicable = judgeDecision({
      judgment: judgment({ discipline: 'QIMEN', temporalScope: 'PRESENT_MOMENT' }),
      proposition: p,
      domainResult: domainJudge({ domain: 'CAREER', supportingEvidence: [ev('값부 생 값사', 'CAREER')] }),
    });
    expect(applicable.decisionStance).toBe('FOR');
    const inapplicable = judgeDecision({
      judgment: judgment({ discipline: 'QIMEN', applicable: false, applicabilityReason: '국이 서지 않았습니다.' }),
      proposition: p, domainResult: null,
    });
    expect(inapplicable.decisionStance).toBe('NOT_APPLICABLE');
    expect(inapplicable.primaryAssessment).toBeNull();
    expect(inapplicable.unresolvedReasons).toContain('국이 서지 않았습니다.');
  });

  it('4 — a discipline cannot silently substitute a different proposition', () => {
    const other = judged(propose('올해 좋은 사람을 만날 수 있을까요?'));
    const a = judgeDecision({ judgment: judgment({ discipline: 'MYUNGRI' }), proposition: p });
    const b = judgeDecision({ judgment: judgment({ discipline: 'ZIWEI' }), proposition: p });
    const c = judgeDecision({ judgment: judgment({ discipline: 'QIMEN' }), proposition: other });
    // Same turn ⇒ byte-identical id across disciplines. A different ask ⇒ a different id, always.
    expect(a.propositionId).toBe(b.propositionId);
    expect(c.propositionId).not.toBe(a.propositionId);
    // The id is built from the ASK alone — no discipline field can leak into it.
    expect(a.propositionId).not.toMatch(/MYUNGRI|ZIWEI|QIMEN/);
  });
});

// ════ 5–6. WHOLE-DOMAIN ASKS ════════════════════════════════════════════════════════════════════════
describe('a whole-domain ask gets a bounded assessment, never an invented whole-domain score', () => {
  it('5 — an ask that names the domain and no aspect is answered from the domain judgment', () => {
    const p = judged(propose('제 연애운 전반이 어떤지 봐주세요.'));
    expect(p.wholeDomain).toBe(true);
    const d = judgeDecision({
      judgment: judgment({
        // The panel HAS a single-aspect reading; a whole-domain ask is broader than it, so the domain
        // judgment answers and the aspect reading steps aside — without being overridden or deleted.
        domainSubJudgments: [{
          domain: 'RELATION_BOND', stance: 'CONDITIONAL_FOR', conclusion: '끌리는 힘은 있습니다.',
          temporalScope: 'NATAL', directness: 'DIRECT', reliability: 'EXACT',
          evidence: [ev('일지 육합', 'RELATION_BOND')], counterEvidence: [],
        }],
      }),
      proposition: p,
      domainResult: domainJudge({
        domain: 'LOVE', status: 'CAUTION', supportingEvidence: [],
        counterEvidence: [ev('부처궁 충', 'RELATION_STABILITY')],
        conclusion: '연애 전반에 걸리는 지점이 있습니다.',
      }),
    });
    expect(d.primaryAssessment!.basis).toBe('DOMAIN_JUDGE');
    expect(d.decisionStance).toBe('AGAINST');
  });

  it('6 — a whole-domain judgment that found both an opportunity and a risk stays MIXED, no winner', () => {
    const p = judged(propose('제 재물운 전반이 어떤지 봐주세요.'));
    expect(p.wholeDomain).toBe(true);
    const d = judgeDecision({
      judgment: judgment(),
      proposition: p,
      domainResult: domainJudge({
        status: 'MIXED',
        supportingEvidence: [ev('재성 투간', 'MONEY_INFLOW')],
        counterEvidence: [ev('비겁 왕', 'MONEY_RETENTION')],
      }),
    });
    expect(d.decisionStance).toBe('MIXED');
    // MIXED asserts NO direction, and nothing may promote it into one downstream.
    expect(d.primaryAssessment!.stance).toBe('INSUFFICIENT_EVIDENCE');
    const projected = projectDecisionJudgments([judgment()], [d]);
    expect(projected[0].domainSubJudgments).toHaveLength(0);
  });
});

// ════ 7–9. NON-DIRECTION REQUESTS ═══════════════════════════════════════════════════════════════════
describe('a request that is not for a direction is not answered with a declined direction', () => {
  it('7 — a conduct/caution ask is CONDUCT, and is answered from grounded limits', () => {
    for (const q of [
      '목돈을 굴리면서 제가 주의해야 할 대목이 뭘까요?',
      '집안 어른들을 대할 때 제가 어떻게 처신하면 좋겠습니까?',
      '아이 학교 문제로 상의가 잦은데 뭘 신경 쓰면 좋겠습니까?',
    ]) {
      expect(propose(q).requestedOutcome).toBe('CONDUCT');
    }
    const p = judged(propose('목돈을 굴리면서 제가 주의해야 할 대목이 뭘까요?'));
    // The counter-evidence below has to sit on an axis the proposition actually bound, or the fixture is
    // testing nothing — assert the binding rather than assuming it.
    expect(p.bearingAxes.map((b) => b.axis)).toContain('MONEY_RETENTION');
    const d = judgeDecision({
      judgment: judgment({
        domainSubJudgments: [{
          domain: 'MONEY_RETENTION', stance: 'INSUFFICIENT_EVIDENCE', conclusion: '방향 없음',
          temporalScope: 'NATAL', directness: 'ADJACENT', reliability: 'EXACT',
          evidence: [], counterEvidence: [ev('비겁 겁재', 'MONEY_RETENTION')],
        }],
      }),
      proposition: p,
      domainResult: null,
    });
    // No FOR/AGAINST is available and none is manufactured — the grounded limit IS the answer.
    expect(d.decisionStance).toBe('ADVISORY');
    expect(d.evidenceIds).toContain('비겁 겁재');
  });

  it('8 — a DIRECTION ask still receives a proposition-directed stance when evidence exists', () => {
    const p = judged(propose('작은 가게를 하나 차려도 될까요?'));
    expect(p.requestedOutcome).toBe('DIRECTION');
    expect(p.askedDomain).toBe('BUSINESS');
    const d = judgeDecision({
      judgment: judgment(),
      proposition: p,
      domainResult: domainJudge({ domain: 'BUSINESS', supportingEvidence: [ev('식상 생재', 'OPPORTUNITY')] }),
    });
    expect(d.decisionStance).toBe('FOR');
    expect(d.primaryAssessment!.axis).toBe('OPPORTUNITY');
  });

  it('9 — a PERIOD ask exposes the temporal reading instead of a directional decline', () => {
    const p = judged(propose('이 일을 언제쯤 시작하는 게 좋을지 시기를 알고 싶어요.'));
    expect(p.requestedOutcome).toBe('PERIOD');
    const d = judgeDecision({
      judgment: judgment({
        timingSignals: [{
          fact: '세운 재성 입묘', meaning: '올해 하반기로 갈수록 흐름이 열립니다.',
          domain: 'TIMING', temporalScope: 'SEWOON', directness: 'DIRECT',
        }],
      }),
      proposition: p,
    });
    expect(d.decisionStance).toBe('PERIOD');
    expect(d.timingAssessments.length).toBeGreaterThan(0);
    // And when the discipline has no temporal material, it says so rather than inventing a period.
    const silent = judgeDecision({ judgment: judgment(), proposition: p });
    expect(silent.decisionStance).toBe('UNRESOLVED');
    expect(silent.timingAssessments).toHaveLength(0);
  });
});

// ════ 10–12. ROLE AUTHORITY ═════════════════════════════════════════════════════════════════════════
describe('bearing-axis roles keep their authority boundaries', () => {
  it('10 — a CONTEXT axis never decides the proposition', () => {
    const p: JudgedProposition = {
      ...judged(propose('이번 봄에 방을 옮겨도 무리가 없을는지요?')),
      bearingAxes: [{ axis: 'MOVEMENT', role: 'PRIMARY' }, { axis: 'GENERAL', role: 'CONTEXT' }],
    };
    const d = judgeDecision({
      judgment: judgment({
        domainSubJudgments: [{
          domain: 'GENERAL', stance: 'STRONGLY_FOR', conclusion: '전반 흐름은 좋습니다.',
          temporalScope: 'NATAL', directness: 'GENERAL', reliability: 'EXACT',
          evidence: [ev('전반 호조', 'GENERAL')], counterEvidence: [],
        }],
      }),
      proposition: p,
    });
    // A STRONGLY_FOR sitting on a CONTEXT axis produces no direction and no assessment at all.
    expect(d.primaryAssessment).toBeNull();
    expect(d.decisionStance).toBe('UNRESOLVED');
    const all = [...d.supportingAssessments, ...d.limitingAssessments, ...d.timingAssessments];
    expect(all.some((a) => a.axis === 'GENERAL')).toBe(false);
  });

  it('11 — an OUTCOME axis explains the consequence but never replaces the PRIMARY answer', () => {
    const p: JudgedProposition = {
      ...judged(propose('돈이 좀 모일 수 있을까요?')),
      bearingAxes: [{ axis: 'MONEY_RETENTION', role: 'PRIMARY' }, { axis: 'MONEY_INFLOW', role: 'OUTCOME' }],
    };
    const d = judgeDecision({
      judgment: judgment({
        domainSubJudgments: [
          {
            domain: 'MONEY_RETENTION', stance: 'AGAINST', conclusion: '남기 어렵습니다.',
            temporalScope: 'NATAL', directness: 'DIRECT', reliability: 'EXACT',
            evidence: [], counterEvidence: [ev('겁재 투간', 'MONEY_RETENTION')],
          },
          {
            domain: 'MONEY_INFLOW', stance: 'STRONGLY_FOR', conclusion: '들어오기는 합니다.',
            temporalScope: 'NATAL', directness: 'DIRECT', reliability: 'EXACT',
            evidence: [ev('재성 왕', 'MONEY_INFLOW')], counterEvidence: [],
          },
        ],
      }),
      proposition: p,
    });
    expect(d.decisionStance).toBe('AGAINST');
    expect(d.primaryAssessment!.axis).toBe('MONEY_RETENTION');
    expect(d.supportingAssessments.map((a) => a.axis)).toEqual(['MONEY_INFLOW']);
  });

  it('12 — a CONSTRAINT axis qualifies a primary stance without overturning it', () => {
    const p: JudgedProposition = {
      ...judged(propose('직장을 옮겨도 될까요?')),
      bearingAxes: [{ axis: 'CAREER', role: 'PRIMARY' }, { axis: 'MOVEMENT', role: 'CONSTRAINT' }],
    };
    const d = judgeDecision({
      judgment: judgment({
        domainSubJudgments: [
          {
            domain: 'CAREER', stance: 'FOR', conclusion: '자리는 열립니다.',
            temporalScope: 'NATAL', directness: 'DIRECT', reliability: 'EXACT',
            evidence: [ev('정관 통근', 'CAREER')], counterEvidence: [],
          },
          {
            domain: 'MOVEMENT', stance: 'AGAINST', conclusion: '움직임 자체는 걸립니다.',
            temporalScope: 'SEWOON', directness: 'DIRECT', reliability: 'EXACT',
            evidence: [], counterEvidence: [ev('역마 충', 'MOVEMENT')],
          },
        ],
      }),
      proposition: p,
    });
    expect(d.decisionStance).toBe('FOR');
    expect(d.limitingAssessments.map((a) => a.axis)).toEqual(['MOVEMENT']);
    expect(d.limitingAssessments[0].stance).toBe('AGAINST');
  });
});

// ════ 13–14. COMPARISON ═════════════════════════════════════════════════════════════════════════════
describe('named options are preserved and never given an invented winner', () => {
  it('13 — an action against its own status quo is marked as such', () => {
    const p = propose('지금 회사에 그대로 남는 쪽과 다른 회사로 옮기는 쪽 중 어느 쪽이 나을까요?');
    expect(p.kind).toBe('A_VS_B');
    expect(p.optionComparability).toBe('STATUS_QUO_INVERSE');
  });

  it('14 — two genuinely distinct options get no winner, at any layer', () => {
    const p = propose('연봉이 높은 곳과 사람이 편한 곳 중 어느 쪽을 골라야 할까요?');
    expect(p.kind).toBe('A_VS_B');
    expect(p.optionComparability).toBe('DISTINCT_OPTIONS');
    const d = judgeDecision({
      judgment: judgment(),
      proposition: judged(p),
      domainResult: domainJudge({ domain: 'CAREER', supportingEvidence: [ev('정관 통근', 'CAREER')] }),
    });
    // The judgment may still say something about the AXIS — it may never name an option.
    expect(d.optionComparability).toBe('DISTINCT_OPTIONS');
    expect(Object.keys(d)).not.toContain('preferredOption');
    expect(Object.keys(d)).not.toContain('winner');
    expect(JSON.stringify(d)).not.toContain('연봉이 높은');
  });
});

// ════ 15–16. NO NEW FACT AUTHORITY ══════════════════════════════════════════════════════════════════
describe('the decision layer invents no fact', () => {
  it('15 — every evidence id traces to a fact the discipline itself supplied', () => {
    const p = judged(propose('올해 돈이 좀 모일 수 있을까요?'));
    const supplied = ['재성 통근', '겁재 투간'];
    const d = judgeDecision({
      judgment: judgment(),
      proposition: p,
      domainResult: domainJudge({
        status: 'MIXED',
        supportingEvidence: [ev(supplied[0], 'MONEY_RETENTION')],
        counterEvidence: [ev(supplied[1], 'MONEY_RETENTION')],
      }),
    });
    expect(d.evidenceIds.every((id) => supplied.includes(id))).toBe(true);
    // A coverage-gap line is a withholding notice, not a fact, and never becomes evidence.
    const withGap = judgeDecision({
      judgment: judgment(),
      proposition: p,
      domainResult: domainJudge({
        supportingEvidence: [{ ...ev('경로 없음', 'MONEY_RETENTION'), coverageGap: true }],
      }),
    });
    expect(withGap.evidenceIds).toHaveLength(0);
    // With no real fact behind it, nothing is projected into the judgment either (audit E1).
    expect(projectDecisionJudgments([judgment()], [withGap])[0].domainSubJudgments).toHaveLength(0);
  });

  it('16 — no timing is invented: a discipline with no temporal material produces no timing assessment', () => {
    const p = judged(propose('이 일을 언제 시작하면 좋을까요?'));
    const d = judgeDecision({ judgment: judgment({ timingSignals: [] }), proposition: p });
    expect(d.timingAssessments).toHaveLength(0);
    expect(JSON.stringify(d)).not.toMatch(/\d{4}년|\d+월/);
  });
});

// ════ 17. D2 INVARIANT ══════════════════════════════════════════════════════════════════════════════
describe('a valid proposition-relevant directional judgment still reaches Cross', () => {
  it('17 — D2 stays zero: the projection adds to the candidate set and never removes from it', () => {
    const p = judged(propose('돈이 좀 모일 수 있을까요?'));
    const withPanel = judgment({
      questionDomain: 'MONEY_RETENTION', stance: 'FOR', dominantConclusion: '남습니다.',
      directEvidence: [ev('재성 통근', 'MONEY_RETENTION')],
      domainSubJudgments: [{
        domain: 'MONEY_RETENTION', stance: 'FOR', conclusion: '남습니다.',
        temporalScope: 'NATAL', directness: 'DIRECT', reliability: 'EXACT',
        evidence: [ev('재성 통근', 'MONEY_RETENTION')], counterEvidence: [],
      }],
    });
    const d = judgeDecision({
      judgment: withPanel, proposition: p,
      domainResult: domainJudge({ status: 'CAUTION', supportingEvidence: [], counterEvidence: [ev('겁재', 'MONEY_RETENTION')] }),
    });
    // The panel outranks the domain judge INSIDE one discipline — the consultation judge stays additional
    // evidence and never overrides a structural stance the judge itself made.
    expect(d.primaryAssessment!.basis).toBe('AXIS_SUB_JUDGMENT');
    expect(d.decisionStance).toBe('FOR');
    const projected = projectDecisionJudgments([withPanel], [d]);
    expect(projected[0].domainSubJudgments).toEqual(withPanel.domainSubJudgments);
    const verdict = judgeCross({
      question: '돈이 좀 모일 수 있을까요?', questionDomain: 'MONEY_INFLOW', subject: '본인',
      judgments: projected, asksTiming: false, decidingAxes: ['MONEY_RETENTION'],
    });
    expect(verdict.direction).not.toBe('INSUFFICIENT_EVIDENCE');
  });

  it('17b — the projection is visible as such: an added reading is never mistaken for a panel finding', () => {
    const p = judged(propose('이사해도 괜찮을까요?'));
    const j = judgment({ discipline: 'ZIWEI' });
    const d = judgeDecision({
      judgment: j, proposition: p,
      domainResult: domainJudge({ domain: 'CHANGE', supportingEvidence: [ev('천이궁 록', 'MOVEMENT')] }),
    });
    const [projected] = projectDecisionJudgments([j], [d]);
    expect(projected.domainSubJudgments).toHaveLength(1);
    expect(projected.domainSubJudgments[0].source).toBe('DECISION_JUDGMENT_V1');
    expect(projected.domainSubJudgments[0].domain).toBe('MOVEMENT');
    // ADJACENT on purpose — a domain summary must never outrank a direct structural finding.
    expect(projected.domainSubJudgments[0].directness).toBe('ADJACENT');
  });
});

// ════ 18. PRIOR SAFETY INVARIANTS ═══════════════════════════════════════════════════════════════════
//
// The V6.1/Decision-Semantics guarantee that a widened deciding axis does not re-open off-axis contamination,
// re-checked here because this batch adds a NEW way for an axis reading to appear.
describe('previous safety invariants hold', () => {
  it('18 — a domain judgment for a DIFFERENT domain than the one asked is never bound to the answer', () => {
    const p = judged(propose('지금 만나는 사람과 오래 갈 수 있을까요?'));
    expect(p.askedDomain).toBe('LOVE');
    const j = judgment();
    // The discipline's MONEY judgment is real and strong — and completely irrelevant to a LOVE proposition.
    const d = judgeDecision({
      judgment: j, proposition: p,
      domainResult: domainJudge({ domain: 'MONEY', supportingEvidence: [ev('재성 왕', 'MONEY_INFLOW')] }),
    });
    expect(d.primaryAssessment).toBeNull();
    expect(projectDecisionJudgments([j], [d])[0].domainSubJudgments).toHaveLength(0);
    // The matching domain, on the other hand, binds to the proposition's own PRIMARY relationship axis —
    // never to whatever axis the domain judge's own evidence happens to be tagged with.
    const ok = judgeDecision({
      judgment: j, proposition: p,
      domainResult: domainJudge({ domain: 'LOVE', supportingEvidence: [ev('부처궁 록', 'RELATION_BOND')] }),
    });
    const [projected] = projectDecisionJudgments([j], [ok]);
    for (const sub of projected.domainSubJudgments) {
      expect(['RELATION_BOND', 'RELATION_STABILITY']).toContain(sub.domain);
    }
  });
});

// ════ 19–21. THE PERSISTED-VERDICT REGRESSION THIS BATCH ALSO CLOSES ════════════════════════════════
//
// `decisionMeta.parseDivinationVerdict` re-derives direction/headlines/conclusion from the restored graph and
// rejects the row on any disagreement ("the graph is the sole verdict authority"). That re-derivation selects
// candidates by axis. Decision Semantics V1 widened the deciding axes past `questionDomain` WITHOUT persisting
// them, so a verdict answered on a widened axis re-projected against the wrong candidate set and was dropped
// on the follow-up turn — silently, because the parser's contract is to return `undefined`.
describe('a verdict answered on a widened deciding axis survives the restore boundary', () => {
  const build = (): CrossDivinationVerdict => {
    const stance: Stance = 'FOR';
    const j = judgment({
      questionDomain: 'MONEY_RETENTION', stance,
      dominantConclusion: '모이는 흐름으로 봅니다.', dominantFactor: '재성 통근',
      directEvidence: [ev('재성 통근', 'MONEY_RETENTION')],
      domainSubJudgments: [{
        domain: 'MONEY_RETENTION', stance, conclusion: '모이는 흐름으로 봅니다.',
        temporalScope: 'NATAL', directness: 'DIRECT', reliability: 'EXACT',
        evidence: [ev('재성 통근', 'MONEY_RETENTION')], counterEvidence: [],
      }],
    });
    return judgeCross({
      question: '돈이 좀 모일 수 있을까요?', questionDomain: 'MONEY_INFLOW', subject: '본인',
      judgments: [j], asksTiming: false, decidingAxes: ['MONEY_RETENTION'],
    });
  };

  it('19 — the verdict carries the axes its answer was actually selected over', () => {
    expect(build().decidingAxes).toEqual(['MONEY_RETENTION']);
  });

  it('20 — it round-trips through the persistence boundary intact', () => {
    const v = build();
    // Answered, not declined — which is exactly what makes the restore check run at all.
    expect(['FOR', 'CONDITIONAL_FOR']).toContain(v.direction);
    const restored = parseDivinationVerdict(JSON.parse(JSON.stringify(v)));
    expect(restored).toBeDefined();
    expect(restored!.direction).toBe(v.direction);
    expect(restored!.primaryConclusion).toBe(v.primaryConclusion);
    expect(restored!.decidingAxes).toEqual(['MONEY_RETENTION']);
  });

  it('21 — WITHOUT the persisted axes the same row is rejected (the defect this closes), and a verdict whose deciding axis IS its asked axis is unaffected', () => {
    const v = build();
    const stripped = JSON.parse(JSON.stringify(v)) as Record<string, unknown>;
    delete stripped.decidingAxes;
    // Exactly the pre-fix shape: an answered widened-axis verdict with no record of which axes answered it.
    expect(parseDivinationVerdict(stripped)).toBeUndefined();
    // A narrow verdict never had the problem and must keep parsing exactly as before.
    const narrow = judgeCross({
      question: '돈이 좀 모일 수 있을까요?', questionDomain: 'MONEY_RETENTION', subject: '본인',
      judgments: [judgment({
        questionDomain: 'MONEY_RETENTION', stance: 'FOR', dominantConclusion: '모입니다.',
        dominantFactor: '재성 통근', directEvidence: [ev('재성 통근', 'MONEY_RETENTION')],
        domainSubJudgments: [{
          domain: 'MONEY_RETENTION', stance: 'FOR', conclusion: '모입니다.',
          temporalScope: 'NATAL', directness: 'DIRECT', reliability: 'EXACT',
          evidence: [ev('재성 통근', 'MONEY_RETENTION')], counterEvidence: [],
        }],
      })],
      asksTiming: false,
    });
    expect(narrow.decidingAxes).toBeUndefined();
    expect(parseDivinationVerdict(JSON.parse(JSON.stringify(narrow)))).toBeDefined();
  });
});

// ════ 22. LIVE PIPELINE ═════════════════════════════════════════════════════════════════════════════
describe('the layer is reachable on the real paid path', () => {
  const digestProvider: DigestProvider = {
    async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
  };
  const NOW = Math.floor(Date.UTC(2026, 6, 15, 1, 0, 0) / 1000);
  const draft = {
    subject: { id: 's1', displayName: '테스트', relationship: null },
    birthInfo: {
      displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
      birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact',
      birthHour: '14', birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
    },
  } as unknown as ConsultationDraft;

  beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

  it('22 — a real three-engine turn produces a verdict whose deciding axes are persistable and restorable', async () => {
    const q = '지금 사는 곳에서 다른 동네로 옮겨도 괜찮을까요?';
    const g = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, q);
    expect(g.status).toBe('available');
    if (g.status !== 'available') return;
    const v = g.divinationVerdict!;
    expect(v).toBeTruthy();
    // Whatever the chart says, the row this turn would persist has to survive its own restore check.
    expect(parseDivinationVerdict(JSON.parse(JSON.stringify(v)))).toBeDefined();
    // Any projected reading present is attributed, and sits on an axis the proposition actually bound.
    const bound = new Set(propose(q).bearingAxes.map((b) => b.axis));
    const injected = v.disciplineJudgments
      .flatMap((j) => j.domainSubJudgments)
      .filter((s) => s.source === 'DECISION_JUDGMENT_V1');
    for (const s of injected) expect(bound.has(s.domain)).toBe(true);
  });
});

// PRE-BENCHMARK FINAL QUALITY GATE V4 — the two defects the consumed 40-case regression left standing.
//
// 1. DECLINED LEAD FIDELITY. Under a DECLINED verdict the grounded causal lead could still be a directional
//    support/counter claim, producing a neutral headline over a directional body — the single measured hard
//    fail (MONEY-04). A directional claim may now only appear LABELLED as one side of a competing pair.
//
// 2. PAYABLE GROUNDED FALLBACK. The deterministic answer was factually safe but read as a claim dump: a
//    boundary sentence with no grounded reason behind it, and no cross-system meaning anywhere the reader
//    could see it. The fallback now answers the proposition directly, explains it causally, renders the
//    scope separation, and attaches the grounded reason to the action boundary — all from the SAME claim
//    catalog, with no new fact and no new authority.
//
// Pure presentation modules only: no LLM, no network.
import {
  buildConsultationContentPlan, type ConsultationContentPlan,
} from '@/features/chat/server/consultationContentPlan';
import {
  buildGroundedNarrativePlan, composeGroundedFallback, untraceableFacts,
  SYNTHESIS_SECTION_TITLE, type GroundedNarrativePlan, type NarrativeIntent,
} from '@/features/chat/server/groundedNarrative';
import { realize } from '@/features/chat/server/koreanRealization';
import type { ParsedStructuredConsultation } from '@/features/chat/prompts/structuredConsultation';
import type {
  CrossDivinationVerdict, DisciplineContribution, DivinationJudgment, JudgmentEvidence,
} from '@/features/divination/contracts';

// ── fixtures — production-shaped (natalBaseline/currentFlow null, as the live Cross Judge leaves them) ────
function ev(o: Partial<JudgmentEvidence>): JudgmentEvidence {
  return { fact: '일지 육합', meaning: '테스트 근거 의미', domain: 'GENERAL', temporalScope: 'NATAL', directness: 'GENERAL', ...o };
}

function mkJudgment(o: Partial<DivinationJudgment> = {}): DivinationJudgment {
  return {
    discipline: 'ZIWEI', applicable: true, dataReliability: 'EXACT',
    questionDomain: 'MONEY_INFLOW', temporalScope: 'NATAL', stance: 'INSUFFICIENT_EVIDENCE',
    dominantConclusion: '테스트 결론', dominantFactor: '테스트 근거',
    directEvidence: [], counterEvidence: [], internalContradictions: [],
    timingSignals: [], domainSubJudgments: [],
    confidence: 'LOW', questionDirectness: 'DIRECT', evidenceStrength: 'WEAK', factGroupsUsed: [],
    ...o,
  };
}

/** The MONEY-04 shape: a DECLINED headline with a strongly ANCHORED directional support claim available. */
function mkDeclined(o: Partial<CrossDivinationVerdict> = {}): CrossDivinationVerdict {
  return {
    question: '큰돈이 들어오는 구조가 있어?',
    questionDomain: 'MONEY_INFLOW',
    questionIntent: 'DECISION',
    evaluatedAtEpochSeconds: null,
    asksTiming: false,
    premises: [],
    primaryConclusion: '돈이 들어오는 쪽에 대해서는 방향을 정할 만한 신호가 잡히지 않습니다.',
    headlinePropositionIds: [],
    direction: 'INSUFFICIENT_EVIDENCE',
    dominantBasis: '자미두수',
    disciplineJudgments: [
      mkJudgment({
        directEvidence: [
          ev({ fact: '자녀(대궁)에 태음 화권', meaning: '대궁에 주도권을 쥐고 밀어붙이는 힘이 들어옵니다.', domain: 'MONEY_INFLOW', directness: 'DIRECT' }),
        ],
        counterEvidence: [
          ev({ fact: '재백에 타라', meaning: '들어온 재물이 새는 자리가 함께 걸립니다.', domain: 'MONEY_RETENTION', directness: 'DIRECT' }),
        ],
      }),
    ],
    contributions: [
      { discipline: 'ZIWEI', applied: true, contribution: '재물 축을 직접 봅니다' },
      { discipline: 'MYUNGRI', applied: false, contribution: '이 축을 직접 보는 자리가 없습니다' },
    ] as DisciplineContribution[],
    axisVerdicts: [],
    propositions: [],
    agreementPoints: [],
    contradictionPoints: ['자리·직업에서 서로 다른 신호가 함께 잡힙니다'],
    contradictionResolutions: [],
    natalBaseline: null,
    currentFlow: null,
    timingConclusion: null,
    favorableFactors: [],
    riskFactors: [
      { fact: '지금의 큰 흐름 → 원국 월주 천간충', meaning: '지금의 큰 흐름이 원국 월주 천간충를 정면으로 흔든다.', domain: 'MONEY_INFLOW', temporalScope: 'DAEWOON', directness: 'DIRECT' },
    ],
    actionableInterpretation: '되돌릴 수 있는 형태로만 확인해 보십시오.',
    confidence: 'LOW',
    confidenceReason: '테스트',
    evidenceReferences: [{ discipline: 'ZIWEI', lines: ['자녀(대궁)에 태음 화권 — 주도권'] }],
    verdictVersion: 'test',
    ...o,
  };
}

/** The same chart with a decided direction — the DIRECTIONAL control for every fidelity assertion below. */
const mkDirectional = (o: Partial<CrossDivinationVerdict> = {}): CrossDivinationVerdict => mkDeclined({
  primaryConclusion: '지금 크게 벌일 자리는 아닙니다.',
  direction: 'AGAINST',
  confidence: 'MEDIUM',
  disciplineJudgments: [mkJudgment({ stance: 'AGAINST', confidence: 'MEDIUM', evidenceStrength: 'STRONG' })],
  ...o,
});

function planFor(v: CrossDivinationVerdict, intent: NarrativeIntent = 'DECISION'):
{ content: ConsultationContentPlan; grounded: GroundedNarrativePlan } {
  const content = buildConsultationContentPlan(v);
  return { content, grounded: buildGroundedNarrativePlan(v, content, intent) };
}

const bodyOf = (a: ParsedStructuredConsultation): string => [
  a.coreSummary, a.coreInterpretation, ...(a.strengths ?? []), ...(a.cautions ?? []),
  ...(a.domainInterpretation ?? []).map((d) => `${d.title} ${d.body}`), a.futureFlow, ...(a.followUps ?? []),
].filter(Boolean).join('\n');

const sectionOf = (a: ParsedStructuredConsultation, title: string) =>
  (a.domainInterpretation ?? []).find((d) => d.title === title);

/** The first sentence of the causal body — the AUTHORITATIVE lead the whole defect is about. */
const leadSentenceOf = (a: ParsedStructuredConsultation): string =>
  (a.coreInterpretation ?? '').split(/(?<=[.!?…])\s+/)[0] ?? '';

// ── 1. DECLINED CANNOT LEAD WITH A DIRECTIONAL CLAIM ─────────────────────────────────────────────────
describe('1 — a DECLINED verdict never uses a directional claim as the authoritative lead', () => {
  it('does not open the body with the anchored support claim it used to lead with', () => {
    const { grounded } = planFor(mkDeclined());
    expect(grounded.verdictState).toBe('DECLINED');
    const lead = leadSentenceOf(composeGroundedFallback(grounded));
    // The exact MONEY-04 regression: a neutral headline followed by "대궁에 주도권을 쥐고 …" as the answer.
    expect(lead).not.toContain('대궁에 주도권을 쥐고 밀어붙이는 힘이 들어옵니다');
  });

  it('leads with insufficiency / scope-separation material under every question shape', () => {
    const directional = new Set(
      planFor(mkDeclined()).grounded.claims
        .filter((c) => c.polarity === 'SUPPORT' || c.polarity === 'LIMIT')
        .map((c) => c.authoritativeMeaning.replace(/\s+/g, '')),
    );
    for (const intent of ['DECISION', 'TIMING', 'EXPLANATION', 'TRAIT', 'COMPARISON'] as const) {
      const { grounded } = planFor(mkDeclined(), intent);
      const lead = leadSentenceOf(composeGroundedFallback(grounded)).replace(/\s+/g, '');
      for (const d of directional) expect(lead.includes(d)).toBe(false);
    }
  });

  it('a DIRECTIONAL verdict still leads with its dominant directional claim (no over-correction)', () => {
    const { grounded } = planFor(mkDirectional());
    expect(grounded.verdictState).toBe('DIRECTIONAL');
    const body = composeGroundedFallback(grounded).coreInterpretation ?? '';
    const directional = grounded.claims.filter((c) => c.polarity === 'SUPPORT' || c.polarity === 'LIMIT');
    expect(directional.some((c) => body.includes(realize(c.authoritativeMeaning).replace(/\.$/, '')))).toBe(true);
    expect(body).not.toContain(SIDE_LABELS[0]);
  });
});

const SIDE_LABELS = ['한쪽으로는', '다른 쪽으로는'] as const;

// ── 2. DIRECTIONAL CLAIMS SURVIVE, BUT ONLY AS COMPETING EVIDENCE ────────────────────────────────────
describe('2 — under DECLINED a directional claim appears only as explicitly competing evidence', () => {
  it('labels both sides and chooses neither', () => {
    const { grounded } = planFor(mkDeclined());
    const body = composeGroundedFallback(grounded).coreInterpretation ?? '';
    expect(body).toContain(SIDE_LABELS[0]);
    expect(body).toContain(SIDE_LABELS[1]);
    // No "so this is the way to see it" sentence anywhere: the contrast connective that picks a winner is
    // never used to introduce a directional claim on the declined path.
    expect(body).not.toMatch(/다만\s*대궁에 주도권/);
  });

  it('the support claim is not dropped — hiding disagreement is not the fix', () => {
    const { grounded } = planFor(mkDeclined());
    const body = bodyOf(composeGroundedFallback(grounded));
    expect(body).toContain('대궁에 주도권을 쥐고 밀어붙이는 힘이 들어옵니다');
  });

  it('every directional sentence in the declined body is introduced by a side label', () => {
    const { grounded } = planFor(mkDeclined());
    const core = composeGroundedFallback(grounded).coreInterpretation ?? '';
    const directional = grounded.claims.filter((c) => c.polarity === 'SUPPORT' || c.polarity === 'LIMIT');
    for (const c of directional) {
      const at = core.indexOf(c.authoritativeMeaning.replace(/\.$/, ''));
      if (at < 0) continue;
      const before = core.slice(0, at);
      expect(SIDE_LABELS.some((l) => before.endsWith(`${l} `))).toBe(true);
    }
  });
});

// ── 3-6. QUESTION-INTENT-SPECIFIC FALLBACK ───────────────────────────────────────────────────────────
describe('3-6 — the grounded fallback answers the shape of question that was asked', () => {
  it('3 — DECISION: answers the proposition and closes on an action boundary', () => {
    const f = composeGroundedFallback(planFor(mkDirectional(), 'DECISION').grounded);
    expect(f.coreSummary).toBe(realize('지금 크게 벌일 자리는 아닙니다.'));
    expect(sectionOf(f, '이렇게 움직이시면 됩니다')).toBeDefined();
  });

  it('4 — EXPLANATION: causal framing, and never decision language', () => {
    const f = composeGroundedFallback(planFor(mkDirectional(), 'EXPLANATION').grounded);
    expect(f.coreInterpretation).toContain('왜 그런지부터 보겠습니다');
    const action = sectionOf(f, '이렇게 이해하시면 됩니다');
    expect(action?.body).toContain('이유입니다');
    expect(action?.body).not.toContain('큰 비용이나 되돌리기 어려운 약속은 아직 확정하지 마십시오');
  });

  it('5 — TIMING: timing-first framing, and the temporal section carries the authoritative window', () => {
    const v = mkDirectional({ timingConclusion: '올해 후반부터 흐름이 열립니다.', asksTiming: true });
    const f = composeGroundedFallback(planFor(v, 'TIMING').grounded);
    expect(f.coreInterpretation?.startsWith('시점만 놓고 보면')).toBe(true);
    expect(sectionOf(f, '시점을 이렇게 보시면 됩니다')).toBeDefined();
    expect(f.futureFlow).toContain('올해 후반부터 흐름이 열립니다');
  });

  it('6 — TRAIT: no yes/no decision language', () => {
    const f = composeGroundedFallback(planFor(mkDirectional(), 'TRAIT').grounded);
    expect(f.coreInterpretation).toContain('타고난 결부터 보겠습니다');
    expect(sectionOf(f, '이 결을 이렇게 쓰시면 됩니다')).toBeDefined();
    expect(bodyOf(f)).not.toContain('큰 비용이나 되돌리기 어려운 약속은 아직 확정하지 마십시오');
  });
});

// ── 7. CROSS SYNTHESIS SURVIVES INTO WHAT THE READER ACTUALLY SEES ───────────────────────────────────
describe('7 — the fallback preserves the compound Cross truth', () => {
  it('renders scope separation — which system carried the question and which had no seat for it', () => {
    const { grounded } = planFor(mkDeclined());
    expect(grounded.coveredBy).toEqual(['ZIWEI']);
    expect(grounded.coverageGaps).toEqual(['MYUNGRI']);
    // Under DECLINED the scope separation is exactly the non-directional material allowed to LEAD, so it is
    // delivered as the causal lead rather than held back for a trailing section — either position is the
    // reader seeing it, which is the point; what must never happen is it not reaching the body at all.
    const body = bodyOf(composeGroundedFallback(grounded));
    expect(body).toContain('자미두수 쪽에 이 질문을 직접 보는 자리가 있어');
    expect(body).toContain('명리에는 이 축을 직접 다루는 자리가 없어');
    // §15 — NOT_COVERED, never a calculation failure.
    expect(body).not.toMatch(/계산\s*(실패|오류)|엔진\s*(오류|실패)|분석\s*실패/);
  });

  it('keeps a contradiction resolution as two surviving sides, not one collapsed side', () => {
    const { grounded } = planFor(mkDeclined({
      contradictionResolutions: [
        { conflict: '재물과 이동은 다르게 봅니다', resolution: '재물은 범위를 좁혀야 합니다, 이동은 열립니다', dominant: 'ZIWEI', kind: 'SCOPE' } as never,
      ],
    }));
    const body = bodyOf(composeGroundedFallback(grounded));
    expect(body).toContain('재물은 범위를 좁혀야 합니다');
    expect(body).toContain('이동은 열립니다');
  });

  it('emits no synthesis section when the verdict carries no cross material', () => {
    const { grounded } = planFor(mkDirectional({ contributions: [], agreementPoints: [], contradictionResolutions: [] }));
    expect(sectionOf(composeGroundedFallback(grounded), SYNTHESIS_SECTION_TITLE)).toBeUndefined();
  });
});

// ── 8. EXPLANATORY SELECTION, NOT RAW FIRST-N ────────────────────────────────────────────────────────
describe('8 — claims are selected for what they explain, not for their array position', () => {
  it('the action boundary carries the grounded reason it follows from', () => {
    const { grounded } = planFor(mkDeclined());
    const action = sectionOf(composeGroundedFallback(grounded), '이렇게 움직이시면 됩니다');
    // Not the bare boundary sentence: a grounded claim precedes it, so "되돌릴 수 있는 범위에서" has a WHY.
    expect(action?.body).not.toBe('되돌릴 수 있는 범위에서 준비·확인하시고, 큰 비용이나 되돌리기 어려운 약속은 아직 확정하지 마십시오.');
    expect(action?.body).toContain('되돌릴 수 있는 범위에서 준비·확인하시고');
    const grounds = grounded.claims.map((c) => c.authoritativeMeaning.replace(/\.$/, ''));
    expect(grounds.some((g) => (action?.body ?? '').includes(g))).toBe(true);
  });

  it('a CAUTIOUS boundary is grounded in a limitation, a GUIDED one in a support', () => {
    const cautious = sectionOf(composeGroundedFallback(planFor(mkDeclined()).grounded), '이렇게 움직이시면 됩니다');
    expect(cautious?.body).toContain('들어온 재물이 새는 자리가 함께 걸립니다');
    const guided = composeGroundedFallback(planFor(mkDirectional({ direction: 'FOR', confidence: 'HIGH' })).grounded);
    const guidedAction = sectionOf(guided, '이렇게 움직이시면 됩니다');
    expect(guidedAction?.body).toContain('지금 확인된 근거 안에서 움직이시고');
  });

  it('prefers the claim standing on a technical fact over the head of the array', () => {
    const { grounded } = planFor(mkDirectional());
    const body = composeGroundedFallback(grounded).coreInterpretation ?? '';
    const anchors = grounded.claims.map((c) => c.technicalAnchor).filter(Boolean) as string[];
    expect(anchors.length).toBeGreaterThan(0);
    expect(anchors.some((a) => body.includes(a))).toBe(true);
  });
});

// ── 9. NO UNSUPPORTED TIMING / FUTURE SECTION ────────────────────────────────────────────────────────
describe('9 — the fallback invents no temporal claim', () => {
  it('omits the temporal section entirely when no authoritative timing claim exists', () => {
    for (const intent of ['DECISION', 'TIMING', 'EXPLANATION', 'TRAIT', 'COMPARISON'] as const) {
      const { grounded } = planFor(mkDeclined({ timingConclusion: null }), intent);
      expect(composeGroundedFallback(grounded).futureFlow).toBeUndefined();
    }
  });

  it('emits no age range anywhere the grounded material did not supply one', () => {
    const { grounded } = planFor(mkDeclined());
    expect(bodyOf(composeGroundedFallback(grounded))).not.toMatch(/\d{1,3}\s*[~\-–—]\s*\d{1,3}\s*(?:세|살)/);
  });
});

// ── 10. NO NEW FACTUAL AUTHORITY ─────────────────────────────────────────────────────────────────────
describe('10 — the fallback introduces no fact of its own', () => {
  it('passes the SAME gate that judges the LLM, on both verdict states and every question shape', () => {
    for (const mk of [mkDeclined, mkDirectional]) {
      for (const intent of ['DECISION', 'TIMING', 'EXPLANATION', 'TRAIT', 'COMPARISON'] as const) {
        const { grounded } = planFor(mk(), intent);
        expect(untraceableFacts(bodyOf(composeGroundedFallback(grounded)), grounded)).toEqual([]);
      }
    }
  });

  it('every claim it renders is an authoritative string, never a paraphrase', () => {
    const { grounded } = planFor(mkDeclined());
    const f = composeGroundedFallback(grounded);
    const corpus = grounded.claims.map((c) => realize(c.authoritativeMeaning)).join('\n').replace(/\s+/g, '');
    for (const bullet of [...(f.strengths ?? []), ...(f.cautions ?? [])]) {
      expect(corpus).toContain(bullet.replace(/\s+/g, '').replace(/\.$/, ''));
    }
  });

  it('a LIMIT claim is never delivered as a strength, on the declined path either', () => {
    const { grounded } = planFor(mkDeclined());
    const f = composeGroundedFallback(grounded);
    const limits = grounded.claims.filter((c) => c.polarity === 'LIMIT').map((c) => c.authoritativeMeaning.replace(/\s+/g, ''));
    for (const s of f.strengths ?? []) {
      expect(limits.some((l) => l.includes(s.replace(/\s+/g, '').replace(/\.$/, '')))).toBe(false);
    }
  });
});

// ── 11. DEDUPLICATION ────────────────────────────────────────────────────────────────────────────────
describe('11 — exact claim deduplication is preserved across the new sections', () => {
  it('no sentence is delivered twice across headline, body, action, synthesis and bullets', () => {
    for (const mk of [mkDeclined, mkDirectional]) {
      for (const intent of ['DECISION', 'TIMING', 'EXPLANATION', 'TRAIT', 'COMPARISON'] as const) {
        const sentences = bodyOf(composeGroundedFallback(planFor(mk(), intent).grounded))
          .split(/(?<=[.!?…])\s+|\n/).map((s) => s.trim().replace(/\s+/g, '')).filter((s) => s.length > 8);
        expect(new Set(sentences).size).toBe(sentences.length);
      }
    }
  });

  it('the action reason is not repeated as a bullet', () => {
    const { grounded } = planFor(mkDeclined());
    const f = composeGroundedFallback(grounded);
    const action = sectionOf(f, '이렇게 움직이시면 됩니다')?.body ?? '';
    for (const b of [...(f.strengths ?? []), ...(f.cautions ?? [])]) {
      expect(action).not.toContain(b.replace(/\.$/, ''));
    }
  });
});

// ── 12. KOREAN REALIZATION ───────────────────────────────────────────────────────────────────────────
describe('12 — the bounded Korean realization layer still runs on every new surface', () => {
  it('repairs 조사 agreement and speech level in the action reason and the synthesis section', () => {
    const { grounded } = planFor(mkDeclined({
      riskFactors: [
        { fact: '지금의 큰 흐름 → 원국 월주 천간충', meaning: '지금의 큰 흐름이 원국 월주 천간충를 정면으로 흔든다.', domain: 'MONEY_INFLOW', temporalScope: 'DAEWOON', directness: 'DIRECT' },
      ],
    }));
    const rendered = bodyOf(composeGroundedFallback(grounded));
    expect(rendered).not.toContain('천간충를');
    expect(rendered).not.toContain('흔든다.');
  });

  it('determinism — the same verdict always produces the same fallback', () => {
    const a = composeGroundedFallback(planFor(mkDeclined()).grounded);
    const b = composeGroundedFallback(planFor(mkDeclined()).grounded);
    expect(a).toEqual(b);
  });
});

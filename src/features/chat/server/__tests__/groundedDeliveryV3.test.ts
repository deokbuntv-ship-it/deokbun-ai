// GROUNDED CONSULTATION DELIVERY QUALITY V3 — §13 structural proof.
//
// V2 made the answer FACTUALLY safe. This suite covers what the consumed 40-case regression then showed was
// still wrong with the answer the user actually pays for: a deterministic fallback that repeated its own
// headline, printed engine strings with disagreeing 조사 and 해라체 endings, said the same claim under three
// different ids, framed every question as a yes/no decision, and — on a semantic rejection — delivered a
// canned error instead of the grounded answer the server was already holding.
//
// Every test here is on the PURE presentation modules (no LLM, no network). The fact boundary is unchanged
// and is re-asserted, not relaxed: nothing below may introduce a technical entity the plan did not supply.
import {
  buildConsultationContentPlan, renderVerifiedEvidenceSection, type ConsultationContentPlan,
} from '@/features/chat/server/consultationContentPlan';
import {
  buildGroundedNarrativePlan, classifyGroundedViolations, composeGroundedFallback,
  narrativeIntentOf, renderGroundedSections, untraceableFacts,
  type GroundedNarrativePlan, type NarrativeIntent,
} from '@/features/chat/server/groundedNarrative';
import {
  joinDistinctSentences, realize, realizeParticles, realizePoliteEndings,
} from '@/features/chat/server/koreanRealization';
import type { ParsedStructuredConsultation } from '@/features/chat/prompts/structuredConsultation';
import type {
  CrossDivinationVerdict, DisciplineContribution, DivinationJudgment, JudgmentEvidence,
} from '@/features/divination/contracts';

// ── fixtures ─────────────────────────────────────────────────────────────────────────────────────────
function ev(o: Partial<JudgmentEvidence>): JudgmentEvidence {
  return { fact: '일지 육합', meaning: '테스트 근거 의미', domain: 'GENERAL', temporalScope: 'NATAL', directness: 'GENERAL', ...o };
}

function mkJudgment(o: Partial<DivinationJudgment> = {}): DivinationJudgment {
  return {
    discipline: 'MYUNGRI', applicable: true, dataReliability: 'EXACT',
    questionDomain: 'OPPORTUNITY', temporalScope: 'NATAL', stance: 'FOR',
    dominantConclusion: '테스트 결론', dominantFactor: '테스트 근거',
    directEvidence: [], counterEvidence: [], internalContradictions: [],
    timingSignals: [], domainSubJudgments: [],
    confidence: 'MEDIUM', questionDirectness: 'DIRECT', evidenceStrength: 'STRONG', factGroupsUsed: [],
    ...o,
  };
}

// Deliberately shaped like PRODUCTION, not like the V2 unit fixture: natalBaseline/currentFlow are null,
// because the live Cross Judge never populates them (they are optional pass-throughs on the reasoner input
// that no caller supplies). That is precisely the state in which V2's fallback degenerated to the headline.
function mkVerdict(o: Partial<CrossDivinationVerdict> = {}): CrossDivinationVerdict {
  return {
    question: '지금 이 사업 시작해도 될까?',
    questionDomain: 'OPPORTUNITY',
    questionIntent: 'DECISION',
    evaluatedAtEpochSeconds: null,
    asksTiming: false,
    premises: [],
    primaryConclusion: '지금 크게 벌일 자리는 아닙니다.',
    headlinePropositionIds: [],
    direction: 'AGAINST',
    dominantBasis: '명리',
    disciplineJudgments: [
      mkJudgment({
        directEvidence: [ev({ fact: '재성 통근', meaning: '돈이 들어오는 통로가 열려 있습니다.', domain: 'OPPORTUNITY', directness: 'DIRECT' })],
        counterEvidence: [ev({ fact: '편관 혼잡', meaning: '외부 압박이 함께 옵니다.', domain: 'OPPORTUNITY', directness: 'DIRECT' })],
      }),
    ],
    contributions: [] as DisciplineContribution[],
    axisVerdicts: [],
    propositions: [],
    agreementPoints: [],
    contradictionPoints: [],
    contradictionResolutions: [],
    natalBaseline: null,
    currentFlow: null,
    timingConclusion: null,
    favorableFactors: [],
    riskFactors: [
      { fact: '지금의 큰 흐름 → 원국 월주 천간충', meaning: '지금의 큰 흐름이 원국 월주 천간충를 정면으로 흔든다.', domain: 'OPPORTUNITY', temporalScope: 'DAEWOON', directness: 'DIRECT' },
    ],
    actionableInterpretation: '규모를 줄이고, 되돌릴 수 있는 형태로만 움직이십시오.',
    confidence: 'MEDIUM',
    confidenceReason: '테스트',
    evidenceReferences: [{ discipline: 'MYUNGRI', lines: ['재성 통근 — 돈이 들어오는 통로'] }],
    verdictVersion: 'test',
    ...o,
  };
}

function planFor(v: CrossDivinationVerdict, intent: NarrativeIntent = 'DECISION'):
{ content: ConsultationContentPlan; grounded: GroundedNarrativePlan } {
  const content = buildConsultationContentPlan(v);
  return { content, grounded: buildGroundedNarrativePlan(v, content, intent) };
}

const bodyOf = (a: ParsedStructuredConsultation): string => [
  a.coreSummary, a.coreInterpretation, ...(a.strengths ?? []), ...(a.cautions ?? []),
  ...(a.domainInterpretation ?? []).map((d) => `${d.title} ${d.body}`), a.futureFlow, ...(a.followUps ?? []),
].filter(Boolean).join('\n');

// ── 1. THE FALLBACK INTRODUCES NO FACT ───────────────────────────────────────────────────────────────
describe('the deterministic fallback stays inside the fact boundary', () => {
  it('introduces zero technical entities the plan did not supply', () => {
    const { grounded } = planFor(mkVerdict());
    // The fallback is checked by the very gate that judges the LLM: same rule, no exemption.
    expect(untraceableFacts(bodyOf(composeGroundedFallback(grounded)), grounded)).toEqual([]);
  });

  it('introduces no fact under any question shape', () => {
    for (const intent of ['DECISION', 'TIMING', 'EXPLANATION', 'TRAIT', 'COMPARISON'] as const) {
      const { grounded } = planFor(mkVerdict(), intent);
      expect(untraceableFacts(bodyOf(composeGroundedFallback(grounded)), grounded)).toEqual([]);
    }
  });

  it('every claim it renders is an authoritative string, never a paraphrase', () => {
    const { grounded } = planFor(mkVerdict());
    const fallback = composeGroundedFallback(grounded);
    // The realized surface differs from the raw engine string only in 조사 and speech level, so the claim is
    // still recognizable word-for-word after realization.
    const corpus = grounded.claims.map((c) => realize(c.authoritativeMeaning)).join('\n').replace(/\s+/g, '');
    for (const bullet of [...(fallback.strengths ?? []), ...(fallback.cautions ?? [])]) {
      expect(corpus).toContain(bullet.replace(/\s+/g, '').replace(/\.$/, ''));
    }
  });

  it('preserves claim polarity — a LIMIT claim is never delivered as a strength', () => {
    const { grounded } = planFor(mkVerdict());
    const fallback = composeGroundedFallback(grounded);
    const limits = grounded.claims.filter((c) => c.polarity === 'LIMIT').map((c) => c.authoritativeMeaning);
    for (const s of fallback.strengths ?? []) {
      expect(limits.some((l) => l.replace(/\s+/g, '').includes(s.replace(/\s+/g, '').replace(/\.$/, '')))).toBe(false);
    }
  });

  it('preserves a Cross contradiction instead of collapsing it to one side', () => {
    const { grounded } = planFor(mkVerdict({
      contradictionResolutions: [
        { conflict: '자리·직업과 이동은 다르게 봅니다', resolution: '자리·직업은 범위를 좁혀야 합니다, 이동은 열립니다', dominant: 'MYUNGRI', kind: 'SCOPE' } as never,
      ],
    }));
    const section = renderGroundedSections(grounded).find((s) => s.title === '왜 이렇게 보나요');
    expect(section?.body).toContain('자리·직업은 범위를 좁혀야 합니다');
    expect(section?.body).toContain('이동은 열립니다');
  });

  it('omits the temporal section entirely when no grounded timing claim exists', () => {
    const { grounded } = planFor(mkVerdict({ timingConclusion: null }));
    expect(grounded.timingClaims).toEqual([]);
    expect(composeGroundedFallback(grounded).futureFlow).toBeUndefined();
    expect(renderGroundedSections(grounded).map((s) => s.title)).not.toContain('앞으로의 흐름');
  });

  it('renders the temporal section when one does', () => {
    const { grounded } = planFor(mkVerdict({ timingConclusion: '올해 후반부터 흐름이 열립니다.', asksTiming: true }));
    expect(composeGroundedFallback(grounded).futureFlow).toContain('올해 후반부터 흐름이 열립니다');
  });
});

// ── 2. THE BODY IS NOT THE HEADLINE ──────────────────────────────────────────────────────────────────
describe('the fallback body is a reason, not a second copy of the headline', () => {
  it('never repeats the conclusion as the interpretation, even with no CORE_REASON available', () => {
    const { grounded } = planFor(mkVerdict());
    expect(grounded.coreReasons).toEqual([]); // production shape
    const fallback = composeGroundedFallback(grounded);
    expect(fallback.coreInterpretation).not.toBe(fallback.coreSummary);
    expect(fallback.coreInterpretation).not.toContain(fallback.coreSummary as string);
  });

  it('closes the causal chain with the verdict own implication sentence', () => {
    const { grounded } = planFor(mkVerdict());
    expect(grounded.implicationClaims.length).toBe(1);
    expect(composeGroundedFallback(grounded).coreInterpretation)
      .toContain('규모를 줄이고, 되돌릴 수 있는 형태로만 움직이십시오');
  });

  it('carries a concrete technical anchor into the judged body when one exists (§7)', () => {
    const { grounded } = planFor(mkVerdict());
    const anchors = grounded.claims.map((c) => c.technicalAnchor).filter(Boolean) as string[];
    expect(anchors.length).toBeGreaterThan(0);
    const body = composeGroundedFallback(grounded).coreInterpretation ?? '';
    expect(anchors.some((a) => body.includes(a))).toBe(true);
  });
});

// ── 3. DEDUPLICATION ─────────────────────────────────────────────────────────────────────────────────
describe('one authoritative claim is delivered once', () => {
  const SHARED = '삼합궁에 막히거나 얽혀서 애를 먹는 힘이 걸립니다.';

  it('collapses ids that carry identical authoritative text', () => {
    const { grounded } = planFor(mkVerdict({
      riskFactors: [
        { fact: '명궁(삼합궁)에 태음 화기', meaning: SHARED, domain: 'OPPORTUNITY', temporalScope: 'NATAL', directness: 'DIRECT' },
        { fact: '재백(삼합궁)에 태음 화기', meaning: SHARED, domain: 'MONEY_INFLOW', temporalScope: 'NATAL', directness: 'ADJACENT' },
        { fact: '관록(삼합궁)에 태음 화기', meaning: SHARED, domain: 'CAREER', temporalScope: 'NATAL', directness: 'ADJACENT' },
      ],
    }));
    expect(grounded.claims.filter((c) => c.authoritativeMeaning === SHARED)).toHaveLength(1);
  });

  it('keeps a technical anchor when the surviving copy had none', () => {
    const { grounded } = planFor(mkVerdict({
      axisVerdicts: [{ domain: 'CAREER', stance: 'CONDITIONAL_AGAINST', conclusion: SHARED, dominantDiscipline: 'ZIWEI', contested: false }],
      riskFactors: [{ fact: '명궁(삼합궁)에 태음 화기', meaning: SHARED, domain: 'CAREER', temporalScope: 'NATAL', directness: 'DIRECT' }],
    }));
    const kept = grounded.claims.filter((c) => c.authoritativeMeaning === SHARED);
    expect(kept).toHaveLength(1);
    expect(kept[0].technicalAnchor).toBe('명궁(삼합궁)에 태음 화기');
  });

  it('deduplication never shrinks the grounded corpus (it must not tighten the gate)', () => {
    const v = mkVerdict({
      riskFactors: [
        { fact: '명궁(삼합궁)에 태음 화기', meaning: SHARED, domain: 'OPPORTUNITY', temporalScope: 'NATAL', directness: 'DIRECT' },
        { fact: '재백(삼합궁)에 태음 화기', meaning: SHARED, domain: 'MONEY_INFLOW', temporalScope: 'NATAL', directness: 'ADJACENT' },
      ],
    });
    const { grounded } = planFor(v);
    for (const r of v.riskFactors) expect(grounded.groundedCorpus).toContain(r.fact);
  });

  it('never delivers the same sentence as both a strength and a caution', () => {
    // A two-sentence risk meaning that CONTAINS a one-sentence supporting evidence meaning verbatim — the
    // shape that produced the duplicate in the consumed run.
    const { grounded } = planFor(mkVerdict({
      disciplineJudgments: [mkJudgment({
        directEvidence: [ev({ fact: '부처(대궁)에 천기 화록', meaning: '대궁에 흐름이 열립니다.', domain: 'OPPORTUNITY', directness: 'DIRECT' })],
      })],
      riskFactors: [{ fact: '부처(대궁)에 태음 화기', meaning: '대궁에 흐름이 열립니다. 다만 그 자리는 스스로 끌고 가지 못합니다.', domain: 'OPPORTUNITY', temporalScope: 'NATAL', directness: 'DIRECT' }],
    }));
    const f = composeGroundedFallback(grounded);
    const overlap = (f.strengths ?? []).filter((s) => (f.cautions ?? []).includes(s));
    expect(overlap).toEqual([]);
  });

  it('does not repeat a sentence across the headline, the body and the bullets', () => {
    const { grounded } = planFor(mkVerdict());
    const f = composeGroundedFallback(grounded);
    const sentences = bodyOf(f).split(/(?<=[.!?…])\s+|\n/).map((s) => s.trim().replace(/\s+/g, '')).filter((s) => s.length > 8);
    expect(new Set(sentences).size).toBe(sentences.length);
  });
});

// ── 4. QUESTION-SHAPED DELIVERY ──────────────────────────────────────────────────────────────────────
describe('the answer is framed by the question that was asked', () => {
  const actionOf = (intent: NarrativeIntent) => {
    const { grounded } = planFor(mkVerdict(), intent);
    return composeGroundedFallback(grounded).domainInterpretation?.[0];
  };

  it('a WHY question receives explanation framing, never a decision prompt', () => {
    const a = actionOf('EXPLANATION');
    expect(a?.title).toBe('이렇게 이해하시면 됩니다');
    expect(a?.body).toContain('이유입니다');
    expect(a?.body).not.toContain('큰 비용이나 되돌리기 어려운 약속은 아직 확정하지 마십시오');
  });

  it('a TIMING question leads with the timing frame', () => {
    const { grounded } = planFor(mkVerdict(), 'TIMING');
    expect(actionOf('TIMING')?.title).toBe('시점을 이렇게 보시면 됩니다');
    expect(composeGroundedFallback(grounded).coreInterpretation).toContain('시점만 놓고 보면');
  });

  it('a DECISION question keeps decision framing', () => {
    expect(actionOf('DECISION')?.title).toBe('이렇게 움직이시면 됩니다');
  });

  it('a TRAIT question does not read as a yes/no decision', () => {
    const a = actionOf('TRAIT');
    expect(a?.title).toBe('이 결을 이렇게 쓰시면 됩니다');
    expect(a?.body).not.toMatch(/확정하지는 마십시오$/);
  });

  it('the follow-up offer is shaped by the question too', () => {
    const { grounded: why } = planFor(mkVerdict(), 'EXPLANATION');
    const { grounded: when } = planFor(mkVerdict(), 'TIMING');
    expect(composeGroundedFallback(why).followUps?.[0]).toContain('구조');
    expect(composeGroundedFallback(when).followUps?.[0]).toContain('시기');
  });

  it('the intent comes from the ALREADY-COMPUTED question intent, not a new classifier', () => {
    expect(narrativeIntentOf('CAUSE_WHY', false)).toBe('EXPLANATION');
    expect(narrativeIntentOf('DESCRIPTIVE', false)).toBe('TRAIT');
    expect(narrativeIntentOf('TIMING', false)).toBe('TIMING');
    expect(narrativeIntentOf('DECISION', true)).toBe('COMPARISON');
  });
});

// ── 5. KOREAN REALIZATION ────────────────────────────────────────────────────────────────────────────
describe('Korean realization repairs the surface without touching the claim', () => {
  it('agrees 조사 on the canonical anchor forms produced by the engines', () => {
    // The four defect forms actually measured in the consumed run.
    expect(realizeParticles('원국 월주 천간충를 정면으로')).toBe('원국 월주 천간충을 정면으로');
    expect(realizeParticles('원국 시주 형를 정면으로')).toBe('원국 시주 형을 정면으로');
    expect(realizeParticles('원국 월주 반합와 맞물려')).toBe('원국 월주 반합과 맞물려');
    expect(realizeParticles('부처은 힘도 실리지만')).toBe('부처는 힘도 실리지만');
  });

  it('resolves an unresolved placeholder particle', () => {
    expect(realizeParticles('원국 년주은(는) 가까운 시기에')).toBe('원국 년주는 가까운 시기에');
    expect(realizeParticles('일간을(를) 중심으로')).toBe('일간을 중심으로');
  });

  it('leaves correct agreement, and ordinary Korean, exactly as it is', () => {
    const untouched = [
      '원국 월주 천간충을 정면으로 흔듭니다',
      '반합과 맞물려 풀립니다',
      '사과와 효과를 비교하면 결과가 다릅니다',
      '가을에 마을을 지나 파를 샀습니다',
      '해가 뜨고 파는 사람이 늘었습니다',
    ];
    for (const s of untouched) expect(realizeParticles(s)).toBe(s);
  });

  it('lifts 해라체 engine endings to the product speech level without changing the verb', () => {
    expect(realizePoliteEndings('원국 월주 파에 마찰을 일으킨다.')).toBe('원국 월주 파에 마찰을 일으킵니다.');
    expect(realizePoliteEndings('반합과 맞물려 풀린다.')).toBe('반합과 맞물려 풀립니다.');
    expect(realizePoliteEndings('정면으로 흔든다.')).toBe('정면으로 흔듭니다.');
    expect(realizePoliteEndings('기운이 들어온다.')).toBe('기운이 들어옵니다.');
    expect(realizePoliteEndings('채택되어 있지 않다.')).toBe('채택되어 있지 않습니다.');
    expect(realizePoliteEndings('그런 자리가 아니다.')).toBe('그런 자리가 아닙니다.');
  });

  it('does not touch a connective form mid-sentence', () => {
    const s = '이 흐름이 이어진다면 결과가 달라지고, 된다고 보기는 어렵습니다.';
    expect(realizePoliteEndings(s)).toBe(s);
  });

  it('joins claims without repeating a sentence, and closes every sentence', () => {
    const joined = joinDistinctSentences([
      '기회가 열립니다. 한쪽으로 정하지 않겠습니다.',
      '자리가 흔들립니다. 한쪽으로 정하지 않겠습니다.',
    ]);
    expect(joined).toBe('기회가 열립니다. 한쪽으로 정하지 않겠습니다. 자리가 흔들립니다.');
    expect(joinDistinctSentences(['마침표가 없는 문장'])).toBe('마침표가 없는 문장.');
  });

  it('realizes the server-rendered 전문근거 section, which is shown word for word', () => {
    const { content } = planFor(mkVerdict());
    const bodies = renderVerifiedEvidenceSection(content.selectedEvidence).map((s) => s.body).join('\n');
    expect(bodies).not.toMatch(/충를|합와|형를/);
    expect(bodies).not.toMatch(/흔든다|일으킨다|풀린다/);
  });

  it('realization is applied to the fallback, so no defect form survives into the answer', () => {
    const { grounded } = planFor(mkVerdict());
    const body = bodyOf(composeGroundedFallback(grounded));
    expect(body).not.toMatch(/충를|합와|형를|은\(는\)|을\(를\)/);
    expect(body).not.toMatch(/흔든다\.|일으킨다\.|풀린다\./);
  });
});

// ── 6. FACT AUTHORITY IS STILL THE SERVER'S ──────────────────────────────────────────────────────────
describe('no technical fact authority returns to the LLM', () => {
  it('the gate still rejects an ungrounded technical entity in LLM prose', () => {
    const { grounded } = planFor(mkVerdict());
    expect(untraceableFacts('관록궁의 화기가 흔들립니다.', grounded)).toEqual(
      expect.arrayContaining(['관록궁', '화기']),
    );
  });

  it('the gate still rejects an ungrounded exact age range', () => {
    const { grounded } = planFor(mkVerdict());
    expect(untraceableFacts('28~37세 구간에 크게 열립니다.', grounded)).toContain('28~37세');
  });

  it('the fallback fact boundary is the SAME corpus the LLM is checked against', () => {
    const { grounded } = planFor(mkVerdict());
    // Not a separate, looser rule for server text: the composition is fed straight back through the gate.
    expect(untraceableFacts(bodyOf(composeGroundedFallback(grounded)), grounded)).toEqual([]);
  });

  it('classifies why the fallback fired, without logging any answer content', () => {
    expect(classifyGroundedViolations(['대운'])).toEqual(['UNSUPPORTED_TEMPORAL_CLAIM']);
    expect(classifyGroundedViolations(['28~37세'])).toEqual(['UNSUPPORTED_TEMPORAL_CLAIM']);
    expect(classifyGroundedViolations(['관록궁'])).toEqual(['UNSUPPORTED_TECHNICAL_ENTITY']);
    expect(classifyGroundedViolations(['NOT_COVERED_AS_FAILURE'])).toEqual(['COVERAGE_GAP_AS_FAILURE']);
    expect(classifyGroundedViolations([])).toEqual([]);
  });
});

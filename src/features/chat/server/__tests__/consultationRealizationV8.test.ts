// CONSULTATION REALIZATION V8 — the customer answer says what the system decided.
//
// V7.1 made the semantics correct; the controlled comparison then measured that the ANSWER did not carry
// them: 15 of 77 delivered consultations opened with the generic decline while their own synthesis had
// resolved, and CROSS sat at 8.31/15 across three releases because the systems were listed, never
// synthesised for the reader. These tests lock the realization contract, and with equal weight lock what it
// may not do: no invented winner, no forced third discipline, no invented timing, no unsupported technical
// reference, and no second model attempt.
//
// Every fixture is SYNTHETIC. None is copied from any benchmark.
import {
  buildNarrativeContract, deliveryDeclines, renderNarrativeSections, validateRealization,
  CROSS_SECTION_TITLE, MEANING_SECTION_TITLE, CONFLICT_SECTION_TITLE,
} from '@/features/chat/server/consultationNarrativeContract';
import { applyVerdictAuthorityClamp } from '@/features/chat/server';
import { closingDirectionOf } from '@/features/chat/server/consultationSurfacePlan';
import type {
  CrossDivinationVerdict, Discipline, JudgmentDomain, JudgmentEvidence, Stance,
} from '@/features/divination/contracts';
import type {
  CrossResolutionKind, DecisionCrossSynthesisV1, FinalStance, SynthesisParticipant, SynthesisTruth,
} from '@/features/divination';

// ── fixtures ─────────────────────────────────────────────────────────────────────────────────────────
const ev = (fact: string, domain: JudgmentDomain = 'CAREER'): JudgmentEvidence => ({
  fact, meaning: `${fact} 근거`, domain, temporalScope: 'NATAL', directness: 'DIRECT',
});

const participant = (over: Partial<SynthesisParticipant> = {}): SynthesisParticipant => ({
  discipline: 'MYUNGRI', authority: 'DIRECT_PROPOSITION', axis: 'CAREER', role: 'PRIMARY',
  direction: 'FAVORABLE', restriction: null, statement: '자리는 열립니다.', directness: 'DIRECT',
  reliability: 'EXACT', temporalBand: 'STRUCTURAL', evidenceIds: ['정관 통근'], derivedFromAxes: [],
  ...over,
});

const truth = (over: Partial<SynthesisTruth> = {}): SynthesisTruth => ({
  discipline: 'MYUNGRI', axis: 'MONEY_RETENTION', role: 'CONSTRAINT', direction: 'UNFAVORABLE',
  temporalBand: 'STRUCTURAL', statement: '남는 쪽은 약합니다.', evidenceIds: ['겁재 투간'], ...over,
});

const synthesis = (
  kind: CrossResolutionKind, stance: FinalStance, over: Partial<DecisionCrossSynthesisV1> = {},
): DecisionCrossSynthesisV1 => ({
  propositionId: 'SHOULD_I_DO_X|DIRECTION|CAREER|CAREER|ASPECT',
  requestedOutcome: 'DIRECTION',
  participatingJudgments: [participant()],
  primaryJudgments: [participant()],
  qualifiers: [],
  resolutionKind: kind,
  finalStance: stance,
  supportingTruths: [],
  limitingTruths: [],
  temporalQualifications: [],
  outcomeQualifications: [],
  conflictPairs: [],
  provenance: ['deokbunai.decision-cross-synthesis.v1'],
  ...over,
});

/** A verdict whose GRAPH declined — the exact shape that produced the 15-case leak. */
const verdict = (s: DecisionCrossSynthesisV1, over: Partial<CrossDivinationVerdict> = {}): CrossDivinationVerdict => ({
  question: '지금 다니는 곳을 그만두고 다른 데로 옮겨도 될까요?',
  questionDomain: 'CAREER', questionIntent: 'DECISION', evaluatedAtEpochSeconds: 0, asksTiming: false,
  premises: [], primaryConclusion: '서로 다른 결론이 함께 성립합니다.', headlinePropositionIds: [],
  direction: 'INSUFFICIENT_EVIDENCE' as Stance, dominantBasis: '미확정',
  disciplineJudgments: [], contributions: [], axisVerdicts: [], propositions: [],
  agreementPoints: [], contradictionPoints: [], contradictionResolutions: [],
  natalBaseline: null, currentFlow: null, timingConclusion: null,
  favorableFactors: [ev('정관 통근')], riskFactors: [ev('겁재 투간', 'MONEY_RETENTION')],
  actionableInterpretation: '', confidence: 'MEDIUM', confidenceReason: '', evidenceReferences: [],
  verdictVersion: 'x', decisionCrossSynthesis: s, ...over,
} as unknown as CrossDivinationVerdict);

const clampOf = (v: CrossDivinationVerdict) => applyVerdictAuthorityClamp(
  { kind: 'ACCEPTED', result: { coreSummary: 'LLM 원문 결론', coreInterpretation: '', strengths: [], cautions: [] } as never },
  v, 'DECISION',
);
const DECLINE = /확정하기 어렵습니다|한쪽 방향을 확정/;

// ════ 1–6. THE 15-CASE LEAK, PER RESOLUTION KIND ════════════════════════════════════════════════════
describe('a useful synthesis never renders as a generic decline', () => {
  const USEFUL: [CrossResolutionKind, FinalStance][] = [
    ['AGREED', 'FOR'], ['SINGLE_AUTHORITY', 'FOR'], ['QUALIFIED', 'QUALIFIED_FOR'],
    ['OUTCOME_SPLIT', 'COMPOUND'], ['TEMPORAL_SPLIT', 'COMPOUND'], ['COMPOUND_MIXED', 'COMPOUND'],
  ];
  it.each(USEFUL)('1–6 — %s does not deliver a declined conclusion', (kind, stance) => {
    const v = verdict(synthesis(kind, stance, {
      outcomeQualifications: kind === 'OUTCOME_SPLIT' ? [truth({ role: 'OUTCOME' })] : [],
      limitingTruths: kind === 'COMPOUND_MIXED' || kind === 'QUALIFIED' ? [truth()] : [],
      temporalQualifications: kind === 'TEMPORAL_SPLIT'
        ? [truth({ axis: 'TIMING', role: 'TIMING', temporalBand: 'NEAR', statement: '가까운 시기는 눌립니다.' })] : [],
    }));
    expect(deliveryDeclines(v)).toBe(false);
    const summary = clampOf(v)!.coreSummary ?? '';
    expect(summary).not.toMatch(DECLINE);
    expect(summary).toBe(buildNarrativeContract(v)!.customerConclusionMeaning);
  });
});

// ════ 7. STANDOFF ═══════════════════════════════════════════════════════════════════════════════════
describe('a true standoff is never given a winner', () => {
  const standoff = () => synthesis('TRUE_STANDOFF', 'UNRESOLVED', {
    primaryJudgments: [participant(), participant({ discipline: 'ZIWEI', direction: 'UNFAVORABLE', statement: '자리는 막힙니다.' })],
    participatingJudgments: [participant(), participant({ discipline: 'ZIWEI', direction: 'UNFAVORABLE', statement: '자리는 막힙니다.' })],
    unresolvedReason: '어느 쪽이 더 직접적이라고 볼 근거가 없습니다.',
  });

  it('7 — it still declines, and the decline explains the disagreement', () => {
    const v = verdict(standoff());
    expect(deliveryDeclines(v)).toBe(true);
    const c = buildNarrativeContract(v)!;
    expect(c.primaryDirection).toBe('NONE');
    expect(c.crossExplanation).toContain('명리');
    expect(c.crossExplanation).toContain('자미두수');
    expect(c.crossExplanation).toMatch(/반대 방향/);
    expect(c.crossExplanation).toMatch(/넘어서게|근거가 없어/);
    const conflict = renderNarrativeSections(c).find((s) => s.title === CONFLICT_SECTION_TITLE)!;
    expect(conflict.body).toContain('자리는 열립니다.');
    expect(conflict.body).toContain('자리는 막힙니다.');
  });
});

// ════ 8–9, 12. PARTICIPANT TRUTHFULNESS ═════════════════════════════════════════════════════════════
describe('the answer names exactly the systems that contributed', () => {
  it('8–9 — a single-discipline answer never gains a second or third', () => {
    const c = buildNarrativeContract(verdict(synthesis('SINGLE_AUTHORITY', 'FOR', {
      primaryJudgments: [participant({ discipline: 'ZIWEI' })],
      participatingJudgments: [participant({ discipline: 'ZIWEI' })],
    })))!;
    expect(c.participatingDisciplines).toEqual(['ZIWEI']);
    expect(c.crossExplanation).toContain('자미두수');
    expect(c.crossExplanation).not.toContain('기문둔갑');
    expect(c.crossExplanation).not.toMatch(/세\s*체계|모든 체계/);
  });

  it('12 — SINGLE_AUTHORITY never claims cross-system agreement', () => {
    const c = buildNarrativeContract(verdict(synthesis('SINGLE_AUTHORITY', 'FOR')))!;
    // The AFFIRMATIVE corroboration forms — the ones AGREED uses — must be absent. A substring test for
    // "같은 결론에 이르렀" cannot be used here: this text contains it inside an explicit NEGATION, which is
    // precisely the disclosure the contract owes the reader.
    expect(c.crossExplanation).not.toMatch(/같은 쪽을 가리킵니다|각각 따로 본 결과가 겹친/);
    expect(c.crossExplanation).toMatch(/같은 결론에 이르렀다고는 말씀드리지 않는다/);
    // …and the validator catches it if a realization tries to.
    expect(validateRealization(c, { conclusion: '', action: '', body: '세 체계 모두 같은 방향입니다.' }, closingDirectionOf))
      .toContain('AUTHORITY_OVERCLAIM');
  });
});

// ════ 10–11. THE COMPOUND SHAPES ARE VISIBLE ════════════════════════════════════════════════════════
describe('compound truth reaches the reader with both sides and an implication', () => {
  it('10 — OUTCOME_SPLIT shows the action AND what follows it', () => {
    const c = buildNarrativeContract(verdict(synthesis('OUTCOME_SPLIT', 'COMPOUND', {
      outcomeQualifications: [truth({ role: 'OUTCOME' })],
    })))!;
    expect(c.crossExplanation).toMatch(/그 뒤에 남는|하고 난 뒤/);
    expect(c.crossExplanation).toContain('돈이 남는 쪽');
    const sections = renderNarrativeSections(c);
    const meaning = sections.find((s) => s.title === MEANING_SECTION_TITLE)!;
    expect(meaning.body).toContain('남는 쪽은 약합니다.');
    expect(c.practicalImplications.length).toBeGreaterThan(0);
  });

  it('11 — COMPOUND_MIXED shows supporting AND limiting truths plus the implication', () => {
    const c = buildNarrativeContract(verdict(synthesis('COMPOUND_MIXED', 'COMPOUND', {
      supportingTruths: [truth({ axis: 'MONEY_INFLOW', role: 'OUTCOME', direction: 'FAVORABLE', statement: '들어오는 쪽은 열립니다.' })],
      limitingTruths: [truth()],
    })))!;
    const meaning = renderNarrativeSections(c).find((s) => s.title === MEANING_SECTION_TITLE)!;
    expect(meaning.body).toContain('들어오는 쪽은 열립니다.');
    expect(meaning.body).toContain('남는 쪽은 약합니다.');
    expect(c.practicalImplications.length).toBeGreaterThan(0);
    expect(meaning.body).not.toMatch(/^좋은 점도 있고 나쁜 점도 있습니다\.?$/);
  });
});

// ════ 13–14. TIMING ═════════════════════════════════════════════════════════════════════════════════
describe('timing is interpreted, never invented', () => {
  it('13 — a temporal truth is explained, not merely printed', () => {
    const c = buildNarrativeContract(verdict(synthesis('TEMPORAL_SPLIT', 'COMPOUND', {
      temporalQualifications: [truth({ axis: 'TIMING', role: 'TIMING', temporalBand: 'NEAR', statement: '가까운 시기는 눌립니다.' })],
    })))!;
    expect(c.crossExplanation).toMatch(/큰 흐름과 가까운 시기/);
    expect(c.crossExplanation).toMatch(/시점이 어긋나|같은 것으로 묶지/);
    expect(c.practicalImplications.some((s) => /시점/.test(s))).toBe(true);
  });

  it('14 — absent timing is never invented', () => {
    const c = buildNarrativeContract(verdict(synthesis('AGREED', 'FOR')))!;
    expect(c.temporalTruths).toHaveLength(0);
    expect(JSON.stringify(c)).not.toMatch(/\d{4}년|\d+월|\d+일/);
  });
});

// ════ 15–16. ACTION ═════════════════════════════════════════════════════════════════════════════════
describe('action follows the judgment', () => {
  it('15 — the action never contradicts the conclusion', () => {
    for (const [kind, stance] of [['AGREED', 'FOR'], ['AGREED', 'AGAINST'], ['QUALIFIED', 'QUALIFIED_AGAINST']] as [CrossResolutionKind, FinalStance][]) {
      const c = buildNarrativeContract(verdict(synthesis(kind, stance, {
        primaryJudgments: [participant(stance.includes('AGAINST') ? { direction: 'UNFAVORABLE' } : {})],
        participatingJudgments: [participant(stance.includes('AGAINST') ? { direction: 'UNFAVORABLE' } : {})],
      })))!;
      const v = validateRealization(c, {
        conclusion: c.customerConclusionMeaning, action: c.actionBoundaries.join(' '), body: '',
      }, closingDirectionOf);
      expect(v).not.toContain('ACTION_CONTRADICTION');
      expect(v).not.toContain('CONCLUSION_POLARITY');
    }
  });

  it('16 — the action preserves the material limitation rather than dropping it', () => {
    const c = buildNarrativeContract(verdict(synthesis('QUALIFIED', 'QUALIFIED_FOR', { limitingTruths: [truth()] })))!;
    expect(c.actionBoundaries.join(' ')).toContain('돈이 남는 쪽');
    expect(c.actionBoundaries.join(' ')).not.toMatch(/^\s*(신중하게 결정|상황을 지켜보|현실적으로 확인)/);
  });
});

// ════ 17–23. NOTHING FABRICATED ═════════════════════════════════════════════════════════════════════
describe('the realization fabricates nothing', () => {
  it('17–18 — no raw primitive headline and no internal identifier', () => {
    const c = buildNarrativeContract(verdict(synthesis('AGREED', 'FOR')))!;
    const all = [c.customerConclusionMeaning, c.crossExplanation, ...c.practicalImplications, ...c.actionBoundaries].join(' ');
    expect(all).not.toMatch(/원국|월주|일주|자형|통근|투간/);
    expect(all).not.toMatch(/[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+/);
  });

  it('19–21 — a technical entity the verdict never carried is rejected', () => {
    const c = buildNarrativeContract(verdict(synthesis('AGREED', 'FOR')))!;
    expect(validateRealization(c, { conclusion: '', action: '', body: '관록궁에 화기가 들어와 있습니다.' }, closingDirectionOf))
      .toContain('UNSUPPORTED_TECHNICAL_REF');
    // A reference the verdict DID carry passes.
    const ok = buildNarrativeContract(verdict(synthesis('AGREED', 'FOR'), {
      favorableFactors: [ev('정관 통근'), ev('재백궁 록')],
    }))!;
    expect(validateRealization(ok, { conclusion: '', action: '', body: '재백궁 록이 받쳐 줍니다.' }, closingDirectionOf))
      .not.toContain('UNSUPPORTED_TECHNICAL_REF');
  });

  it('22–23 — a discipline that did not participate cannot be named as judging', () => {
    const c = buildNarrativeContract(verdict(synthesis('SINGLE_AUTHORITY', 'FOR', {
      primaryJudgments: [participant({ discipline: 'MYUNGRI' })],
      participatingJudgments: [participant({ discipline: 'MYUNGRI' })],
    })))!;
    expect(validateRealization(c, { conclusion: '', action: '', body: '기문둔갑도 같은 쪽으로 봅니다.' }, closingDirectionOf))
      .toContain('FORCED_THIRD_DISCIPLINE');
  });
});

// ════ 24–27. REALIZATION CONTROL ════════════════════════════════════════════════════════════════════
describe('an invalid realization is replaced deterministically, once', () => {
  it('24 — a polarity-inverted realization is rejected', () => {
    const c = buildNarrativeContract(verdict(synthesis('AGREED', 'FOR')))!;
    expect(validateRealization(c, {
      conclusion: '지금은 미루십시오.', action: '미루십시오.', body: '',
    }, closingDirectionOf)).toContain('CONCLUSION_POLARITY');
  });

  it('25 — a compound truth delivered with only one side is rejected', () => {
    const c = buildNarrativeContract(verdict(synthesis('OUTCOME_SPLIT', 'COMPOUND', {
      outcomeQualifications: [truth({ role: 'OUTCOME' })],
    })))!;
    expect(validateRealization(c, { conclusion: '', action: '', body: '전반적으로 좋습니다.' }, closingDirectionOf))
      .toContain('MATERIAL_SIDE_MISSING');
  });

  it('26–27 — the deterministic realization carries every mandatory piece of meaning', () => {
    for (const [kind, stance] of [
      ['AGREED', 'FOR'], ['SINGLE_AUTHORITY', 'FOR'], ['QUALIFIED', 'QUALIFIED_FOR'],
      ['OUTCOME_SPLIT', 'COMPOUND'], ['TEMPORAL_SPLIT', 'COMPOUND'], ['COMPOUND_MIXED', 'COMPOUND'],
      ['TRUE_STANDOFF', 'UNRESOLVED'],
    ] as [CrossResolutionKind, FinalStance][]) {
      const c = buildNarrativeContract(verdict(synthesis(kind, stance, {
        outcomeQualifications: kind === 'OUTCOME_SPLIT' ? [truth({ role: 'OUTCOME' })] : [],
        limitingTruths: ['QUALIFIED', 'COMPOUND_MIXED'].includes(kind) ? [truth()] : [],
        temporalQualifications: kind === 'TEMPORAL_SPLIT' ? [truth({ axis: 'TIMING', role: 'TIMING' })] : [],
      })))!;
      const sections = renderNarrativeSections(c);
      // The cross synthesis is ALWAYS present — that is the piece that never reached the reader before.
      const cross = sections.find((s) => s.title === CROSS_SECTION_TITLE);
      expect(cross).toBeTruthy();
      expect(cross!.body.length).toBeGreaterThan(30);
      expect(c.actionBoundaries.join('').length).toBeGreaterThan(0);
    }
  });
});

// ════ 28–29. PRIOR INVARIANTS ═══════════════════════════════════════════════════════════════════════
describe('previous invariants hold', () => {
  it('28 — the V7.1 polarity repair is preserved end to end', () => {
    const v = verdict(synthesis('QUALIFIED', 'QUALIFIED_AGAINST', {
      primaryJudgments: [participant({ direction: 'RESTRICTED', restriction: 'SCOPE' })],
      participatingJudgments: [participant({ direction: 'RESTRICTED', restriction: 'SCOPE' })],
      limitingTruths: [truth()],
    }));
    const c = buildNarrativeContract(v)!;
    expect(c.primaryDirection).toBe('HOLD');
    expect(clampOf(v)!.coreSummary).not.toMatch(/열려 있는 쪽으로 봅니다/);
  });

  it('29 — a verdict with no synthesis keeps the pre-V8 declined behaviour exactly', () => {
    const v = verdict(synthesis('AGREED', 'FOR'), { decisionCrossSynthesis: undefined });
    expect(buildNarrativeContract(v)).toBeNull();
    expect(deliveryDeclines(v)).toBe(true);          // graph direction is INSUFFICIENT_EVIDENCE
    expect(clampOf(v)!.coreSummary).toMatch(DECLINE);
  });
});

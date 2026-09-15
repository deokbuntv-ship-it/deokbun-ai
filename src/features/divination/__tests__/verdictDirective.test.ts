// FINAL_VERDICT_FIDELITY_MICRO_FIX — targeted tests proving the prompt-directive contract (§12 A-E):
//  A. a declined verdict (INSUFFICIENT_DATA/INSUFFICIENT_EVIDENCE) cannot produce a decisive instruction —
//     the raw (directionally-phrased) `actionableInterpretation` is replaced by an explicit risk-limiting
//     instruction, and a new warning against smuggling a direction into the advice sentence is present.
//  B. MIXED (this codebase's actual vocabulary: compound axis/contradiction truth) is still preserved
//     unconditionally — unchanged existing behavior.
//  C. FAVORABLE (FOR-family) stays directional, unaffected by the declined-only branch.
//  D. CAUTION (AGAINST-family) stays cautionary, unaffected by the declined-only branch.
//  E. the evidence-specific verbalization directive (Repair A) is untouched.
import { renderVerdictDirective, renderEvidenceDirective } from '@/features/divination/verdictDirective';
import type { CrossDivinationVerdict, Stance } from '@/features/divination/contracts';

function mkVerdict(overrides: Partial<CrossDivinationVerdict> & { direction: Stance }): CrossDivinationVerdict {
  return {
    question: '테스트 질문',
    questionDomain: '전반',
    questionIntent: 'DECISION',
    evaluatedAtEpochSeconds: null,
    asksTiming: false,
    premises: [],
    primaryConclusion: '테스트 결론',
    headlinePropositionIds: [],
    dominantBasis: '명리',
    disciplineJudgments: [],
    contributions: [],
    axisVerdicts: [],
    propositions: [],
    agreementPoints: [],
    contradictionPoints: [],
    contradictionResolutions: [],
    natalBaseline: null,
    currentFlow: null,
    timingConclusion: null,
    favorableFactors: [],
    riskFactors: [],
    actionableInterpretation: '지금은 크게 방향을 틀기보다, 이미 하고 있는 일을 유지하시는 편이 낫습니다.',
    confidence: 'MODERATE',
    confidenceReason: '테스트',
    evidenceReferences: [],
    verdictVersion: 'test',
    ...overrides,
  };
}

describe('A — a declined verdict (INSUFFICIENT_DATA/INSUFFICIENT_EVIDENCE) cannot yield a decisive instruction', () => {
  it.each<Stance>(['INSUFFICIENT_DATA', 'INSUFFICIENT_EVIDENCE'])(
    'direction=%s: the raw directionally-phrased actionableInterpretation is NOT rendered verbatim',
    (direction) => {
      const out = renderVerdictDirective(mkVerdict({ direction }));
      // The server's own fallback string ("...유지하시는 편이 낫습니다") must not appear — that IS the bug.
      expect(out).not.toContain('지금은 크게 방향을 틀기보다, 이미 하고 있는 일을 유지하시는 편이 낫습니다.');
    },
  );

  it.each<Stance>(['INSUFFICIENT_DATA', 'INSUFFICIENT_EVIDENCE'])(
    'direction=%s: warns explicitly against smuggling a direction into the advice sentence',
    (direction) => {
      const out = renderVerdictDirective(mkVerdict({ direction }));
      expect(out).toMatch(/슬쩍 한쪽으로 되돌리지 마십시오/);
      expect(out).toMatch(/기다리는 편이 좋습니다/); // the exact example phrasing the model must avoid
    },
  );

  it.each<Stance>(['INSUFFICIENT_DATA', 'INSUFFICIENT_EVIDENCE'])(
    'direction=%s: instructs risk-limiting advice instead (reversible prep, no forced pick)',
    (direction) => {
      const out = renderVerdictDirective(mkVerdict({ direction }));
      expect(out).toMatch(/한쪽을 권하지 말고/);
      expect(out).toMatch(/되돌릴 수 있는 범위에서만 준비·검증하기/);
    },
  );
});

describe('B — MIXED (compound axis/contradiction truth) preserved regardless of direction', () => {
  it('other-axis and contradiction-resolution lines still render for a declined verdict', () => {
    const v = mkVerdict({
      direction: 'INSUFFICIENT_EVIDENCE',
      questionDomain: 'LOVE',
      axisVerdicts: [{ domain: 'MONEY', stance: 'FOR', conclusion: '재물은 열려 있음', dominantDiscipline: 'MYUNGRI', contested: false }],
      contradictionResolutions: [
        { kind: 'DIFFERENT_DOMAIN', between: ['MYUNGRI', 'ZIWEI'], conflict: '자리·직업에서 서로 다른 신호', resolution: '도메인이 다름', dominant: 'MYUNGRI', whyOtherDidNotDominate: '' },
      ],
    });
    const out = renderVerdictDirective(v);
    expect(out).toContain('축별 결론(하나로 뭉뚱그리지 말 것)');
    expect(out).toContain('MONEY=FOR(재물은 열려 있음)');
    expect(out).toContain('엇갈리는 지점과 정리');
    expect(out).toContain('자리·직업에서 서로 다른 신호');
  });
});

describe('C — FAVORABLE (FOR-family) stays directional, unaffected by the declined-only branch', () => {
  it.each<Stance>(['STRONGLY_FOR', 'FOR', 'CONDITIONAL_FOR'])('direction=%s: no declined-only warning/risk-limiting text; original actionableInterpretation intact', (direction) => {
    const out = renderVerdictDirective(mkVerdict({ direction, actionableInterpretation: '지금 흐름을 그대로 밀고 가셔도 됩니다.' }));
    expect(out).not.toMatch(/슬쩍 한쪽으로 되돌리지 마십시오/);
    expect(out).not.toMatch(/한쪽을 권하지 말고/);
    expect(out).toContain('지금 흐름을 그대로 밀고 가셔도 됩니다.');
  });
});

describe('D — CAUTION (AGAINST-family) stays cautionary, unaffected by the declined-only branch', () => {
  it.each<Stance>(['AGAINST', 'CONDITIONAL_AGAINST', 'AGAINST_FOR_NOW'])('direction=%s: no declined-only warning/risk-limiting text; original actionableInterpretation intact', (direction) => {
    const out = renderVerdictDirective(mkVerdict({ direction, actionableInterpretation: '규모를 줄이고, 되돌릴 수 있는 형태로만 움직이십시오.' }));
    expect(out).not.toMatch(/슬쩍 한쪽으로 되돌리지 마십시오/);
    expect(out).not.toMatch(/한쪽을 권하지 말고/);
    expect(out).toContain('규모를 줄이고, 되돌릴 수 있는 형태로만 움직이십시오.');
  });
});

describe('E — evidence-specific verbalization (Repair A) untouched', () => {
  it('renderEvidenceDirective still surfaces real evidence lines regardless of direction', () => {
    const v = mkVerdict({
      direction: 'INSUFFICIENT_EVIDENCE',
      evidenceReferences: [{ discipline: 'ZIWEI', lines: ['부처궁에 태양 화록'] }],
    });
    expect(renderEvidenceDirective(v)).toContain('부처궁에 태양 화록');
  });
});

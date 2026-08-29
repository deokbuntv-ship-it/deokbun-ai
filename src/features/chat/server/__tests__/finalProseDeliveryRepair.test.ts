// FINAL_PROSE_DELIVERY_REPAIR_V1 — targeted tests for the two product-layer repairs that SHIPPED (§20 A/D/E):
//  A. evidence-specific verbalization: `renderEvidenceDirective` surfaces the REAL, already-computed
//     evidence lines (never invents), instructs 1-3 item selection + plain-language-first.
//  D. a supported hedged domain-comparison answer still ACCEPTS (no regression) — mirrors
//     domainTemporalWinnerGuard.test.ts's existing coverage.
//  E. unsupported certainty is rejected regardless (unchanged, existing containsForbiddenCertainty).
//
// A third mechanism ("verdict fidelity" — widening the winner guard to also forbid a decisive HEADLINE
// claim whenever the Cross verdict itself was INSUFFICIENT_DATA/INSUFFICIENT_EVIDENCE, even for a
// non-comparison question) was implemented, passed its own unit tests, and was then MEASURED via the real
// 100-case rerun this same batch — and REVERTED after the data showed it net-harmful (SEMANTIC_REJECTED
// fallback cases jumped from ~4-5 to 11 of 100; see buildServerConsultation.ts's `domainComparisonAllowed`
// comment and the batch report for the full data). No test for it remains here since the code path was
// fully removed, not merely disabled.
import { renderEvidenceDirective } from '@/features/divination/verdictDirective';
import type { CrossDivinationVerdict, Stance } from '@/features/divination/contracts';
import { classifyWithGuards } from '@/features/chat/server/certaintyGuard';
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';

// Minimal-but-type-complete verdict builder — only `evidenceReferences` varies per test; every other field
// is a harmless, unused-by-renderEvidenceDirective default.
function mkVerdict(direction: Stance, evidenceReferences: CrossDivinationVerdict['evidenceReferences'] = []): CrossDivinationVerdict {
  return {
    question: '테스트 질문',
    questionDomain: '전반',
    questionIntent: 'DECISION',
    evaluatedAtEpochSeconds: null,
    asksTiming: false,
    premises: [],
    primaryConclusion: '테스트 결론',
    headlinePropositionIds: [],
    direction,
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
    actionableInterpretation: '테스트 행동 지침',
    confidence: 'MODERATE',
    confidenceReason: '테스트',
    evidenceReferences,
    verdictVersion: 'test',
  };
}

const LONG = '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. 꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.';
const card = (summary: string) => JSON.stringify({ coreSummary: summary, coreInterpretation: `${summary} ${LONG}`, strengths: ['끈기'] });

describe('A — renderEvidenceDirective (evidence-specific verbalization)', () => {
  it('surfaces the REAL evidence lines verbatim, never fabricated', () => {
    const v = mkVerdict('FOR', [
      { discipline: 'ZIWEI', lines: ['부처궁에 태양 화록', '신궁이 관록궁'] },
      { discipline: 'MYUNGRI', lines: ['일지 충 — 배우자 자리의 마찰'] },
    ]);
    const out = renderEvidenceDirective(v);
    expect(out).toContain('부처궁에 태양 화록');
    expect(out).toContain('신궁이 관록궁');
    expect(out).toContain('일지 충 — 배우자 자리의 마찰');
  });

  it('instructs selecting 1-3 relevant items, plain language first, and forbids inventing facts', () => {
    const v = mkVerdict('FOR', [{ discipline: 'MYUNGRI', lines: ['원국 재성 없음'] }]);
    const out = renderEvidenceDirective(v);
    expect(out).toMatch(/1~3개/);
    expect(out).toMatch(/새로 만들지 마십시오/);
    expect(out).toMatch(/쉬운 말로/);
  });

  it('empty when the verdict carries no evidence lines (never invents a placeholder)', () => {
    expect(renderEvidenceDirective(mkVerdict('FOR', []))).toBe('');
    expect(renderEvidenceDirective(mkVerdict('FOR', [{ discipline: 'MYUNGRI', lines: [] }]))).toBe('');
  });
});

describe('D — supported hedged domain comparison still ACCEPTS (domainComparisonAllowed unchanged since the Domain/Temporal Winner Guard batch)', () => {
  it('domainComparisonAllowed:true (verdict directional + DOMAIN comparison) still relaxes the soft tier', async () => {
    const claim = '지금은 확장보다 안정화 쪽이 낫습니다.';
    const out = await classifyWithGuards({
      raw: card(claim), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false,
      forbidWinner: true, domainComparisonAllowed: true,
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('ACCEPTED');
  });
});

describe('E — unsupported certainty is rejected regardless', () => {
  it('an absolute guarantee is rejected even when forbidWinner is false', async () => {
    const claim = '무조건 이직해서 성공합니다.';
    const out = await classifyWithGuards({
      raw: card(claim), grounding: GROUNDING_UNAVAILABLE, requireMitigation: false,
      forbidWinner: false, domainComparisonAllowed: false,
      regenerate: async () => card(claim),
    });
    expect(out.outcome.kind).toBe('SEMANTIC_REJECTED');
  });
});

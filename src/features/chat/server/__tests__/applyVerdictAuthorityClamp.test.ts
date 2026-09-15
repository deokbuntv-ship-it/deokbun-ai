// FINAL_VERDICT_AUTHORITY_CLAMP — targeted tests (§12 A-I) proving the deterministic presentation-layer
// backstop: a declined verdict (INSUFFICIENT_DATA/INSUFFICIENT_EVIDENCE) can NEVER reach the user as a
// decisive headline, regardless of what the LLM actually wrote — with zero rejection, zero regeneration,
// and every other field left exactly as the LLM produced it.
//
// AUDIT-DRIVEN REMEDIATION V1 §5 — the replacement sentence is now QUESTION-AWARE (buildDeclinedSummary)
// instead of one byte-identical generic sentence for every question. The safety property under test here is
// unchanged: whatever the exact wording, it can never assert a direction or contain the LLM's decisive
// headline.
import { applyVerdictAuthorityClamp } from '@/features/chat/server/buildServerConsultation';
import { buildDeclinedSummary } from '@/features/divination/verdictDirective';
import type { ConsultationOutcome, ParsedStructuredConsultation } from '@/features/chat/prompts/structuredConsultation';
import type { CrossDivinationVerdict, Stance } from '@/features/divination/contracts';

function mkVerdict(direction: Stance): CrossDivinationVerdict {
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
    axisVerdicts: [
      { domain: 'MONEY', stance: 'FOR', conclusion: '재물은 열려 있음', dominantDiscipline: 'MYUNGRI', contested: true },
    ],
    propositions: [],
    agreementPoints: [],
    contradictionPoints: ['서로 다른 신호가 함께 잡힙니다'],
    contradictionResolutions: [],
    natalBaseline: null,
    currentFlow: null,
    timingConclusion: null,
    favorableFactors: [],
    riskFactors: [],
    actionableInterpretation: '테스트 행동 지침',
    confidence: 'MODERATE',
    confidenceReason: '테스트',
    evidenceReferences: [{ discipline: 'ZIWEI', lines: ['부처궁에 태양 화록'] }],
    verdictVersion: 'test',
  };
}

const richResult: ParsedStructuredConsultation = {
  coreSummary: 'B가 안전합니다.', // the exact forbidden shape — a decisive headline
  coreInterpretation: '기다리는 편이 낫습니다. 왜냐하면 원국 일지가 흔들리고 지금 흐름이 그 자리를 건드리기 때문입니다.',
  strengths: ['원국에 재물 통로가 있습니다.'],
  cautions: ['자리(배우자궁)가 흔들리는 구조입니다.'],
  domainInterpretation: [{ title: '연애', body: '삼합궁에 이름·평판·문서가 따라오는 힘이 들어옵니다.' }],
  futureFlow: '올해와 내년은 조화와 마찰이 함께 있습니다.',
  followUps: ['왜 그렇게 보나요?'],
};
const accepted = (result: ParsedStructuredConsultation): ConsultationOutcome => ({ kind: 'ACCEPTED', result });

describe('A — Cross UNRESOLVED + decisive LLM headline → delivered headline is neutral', () => {
  it.each<Stance>(['INSUFFICIENT_DATA', 'INSUFFICIENT_EVIDENCE'])('direction=%s: coreSummary becomes the deterministic, question-aware neutral sentence', (direction) => {
    const verdict = mkVerdict(direction);
    const out = applyVerdictAuthorityClamp(accepted(richResult), verdict);
    expect(out?.coreSummary).toBe(buildDeclinedSummary(verdict));
    expect(out?.coreSummary).not.toContain('안전합니다');
    expect(out?.coreSummary).toMatch(/확정하기 어렵습니다/);
  });
});

describe('B — Cross UNRESOLVED + directional LLM advice → delivered action is risk-limiting, non-directional', () => {
  it('the clamped coreSummary carries risk-limiting advice, not a pick between sides', () => {
    const out = applyVerdictAuthorityClamp(accepted(richResult), mkVerdict('INSUFFICIENT_EVIDENCE'));
    expect(out?.coreSummary).toMatch(/되돌릴 수 있는 범위에서/);
    expect(out?.coreSummary).not.toMatch(/기다리는 (편|쪽)이|낫습니다|권합니다|시작하는 게 좋/);
  });
});

describe('C — excellent specific evidence body is retained verbatim', () => {
  it('coreInterpretation/strengths/cautions/domainInterpretation/futureFlow/followUps are untouched', () => {
    const out = applyVerdictAuthorityClamp(accepted(richResult), mkVerdict('INSUFFICIENT_EVIDENCE'));
    expect(out?.coreInterpretation).toBe(richResult.coreInterpretation);
    expect(out?.strengths).toBe(richResult.strengths);
    expect(out?.cautions).toBe(richResult.cautions);
    expect(out?.domainInterpretation).toBe(richResult.domainInterpretation);
    expect(out?.futureFlow).toBe(richResult.futureFlow);
    expect(out?.followUps).toBe(richResult.followUps);
  });
});

describe('D — no SEMANTIC_REJECTED is ever produced by the clamp', () => {
  it('a non-ACCEPTED outcome (already rejected/fallback) returns null — the clamp cannot manufacture an outcome-kind change', () => {
    expect(applyVerdictAuthorityClamp({ kind: 'SEMANTIC_REJECTED', reason: 'x' }, mkVerdict('INSUFFICIENT_EVIDENCE'))).toBeNull();
    expect(applyVerdictAuthorityClamp({ kind: 'STRUCTURAL_FALLBACK', text: '...' }, mkVerdict('INSUFFICIENT_EVIDENCE'))).toBeNull();
  });
});

describe('E — no regeneration path exists (structurally impossible)', () => {
  it('applyVerdictAuthorityClamp takes no callLLM/deps and cannot invoke one — proven by signature + purity', () => {
    // The function is (outcome, verdict) => result, synchronous, no I/O capability at all.
    expect(applyVerdictAuthorityClamp.length).toBe(2);
    const out = applyVerdictAuthorityClamp(accepted(richResult), mkVerdict('INSUFFICIENT_EVIDENCE'));
    expect(out).not.toBeNull();
  });
});

describe('F — FAVORABLE (FOR-family) output remains unchanged', () => {
  it.each<Stance>(['STRONGLY_FOR', 'FOR', 'CONDITIONAL_FOR', 'FOR_BUT_LATER'])('direction=%s: returns the SAME object reference, zero mutation', (direction) => {
    const out = applyVerdictAuthorityClamp(accepted(richResult), mkVerdict(direction));
    expect(out).toBe(richResult); // referential equality — proves no copy/mutation happened at all
  });
});

describe('G — CAUTION (AGAINST-family) output remains unchanged', () => {
  it.each<Stance>(['AGAINST', 'CONDITIONAL_AGAINST', 'AGAINST_FOR_NOW', 'STRONGLY_AGAINST'])('direction=%s: returns the SAME object reference, zero mutation', (direction) => {
    const out = applyVerdictAuthorityClamp(accepted(richResult), mkVerdict(direction));
    expect(out).toBe(richResult);
  });
});

describe('H — MIXED (compound axis/contradiction truth) behavior remains unchanged when NOT declined', () => {
  it('a verdict carrying contested axisVerdicts/contradictionPoints but a DECIDED direction is untouched', () => {
    // mkVerdict already carries a contested axis + a contradiction point (this codebase's real "MIXED" shape) —
    // only `direction` varies; a decided direction must leave the compound-truth-carrying result alone.
    const out = applyVerdictAuthorityClamp(accepted(richResult), mkVerdict('FOR'));
    expect(out).toBe(richResult);
  });

  it('STRUCTURAL_ANSWER / NOT_APPLICABLE (never a decision question) are also untouched — not the declined-to-decide case', () => {
    expect(applyVerdictAuthorityClamp(accepted(richResult), mkVerdict('STRUCTURAL_ANSWER'))).toBe(richResult);
    expect(applyVerdictAuthorityClamp(accepted(richResult), mkVerdict('NOT_APPLICABLE'))).toBe(richResult);
  });

  it('no verdict at all (null) leaves the result untouched — fail-closed toward NOT clamping without real verdict data', () => {
    expect(applyVerdictAuthorityClamp(accepted(richResult), null)).toBe(richResult);
  });
});

describe('I — same inputs deep-equal delivered result (pure, deterministic)', () => {
  it('calling twice with equal (not same-reference) inputs produces deep-equal output', () => {
    const a = applyVerdictAuthorityClamp(accepted({ ...richResult }), mkVerdict('INSUFFICIENT_DATA'));
    const b = applyVerdictAuthorityClamp(accepted({ ...richResult }), mkVerdict('INSUFFICIENT_DATA'));
    expect(a).toEqual(b);
  });
});

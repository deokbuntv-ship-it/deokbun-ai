// V5 MEASUREMENT-CONTRACT TESTS — free, offline, and the guard against the V4 rescore's own defect:
// scoring an artifact that is not the delivered product, and letting internal reference material count as
// delivered content. These run without QA_LIVE_RUN and make no network call.
//
//   npx jest --roots scripts/qa --testMatch "**/qaContract.test.ts"
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';

import {
  completeProductView, invalidSingleContributorZero, materialContributorsOf,
} from './qaCompleteProduct';
import { selectRegressionCases } from './regressionCases';

const INTERNAL_LINE = '원국 일지 육합 — 내부 참고 전용 문장';

const verdict = {
  primaryConclusion: '규모를 줄여 시작하시는 편이 낫습니다.',
  agreementPoints: ['두 체계가 같은 자리를 가리킵니다.'],
  contradictionPoints: [],
  evidenceReferences: [{ discipline: 'MYUNGRI', lines: [INTERNAL_LINE] }],
  disciplineJudgments: [
    {
      discipline: 'MYUNGRI', applicable: true, stance: 'FOR',
      directEvidence: [{ fact: '식상생재', meaning: '실행이 결과로 이어집니다', domain: 'OPPORTUNITY', temporalScope: 'NATAL', directness: 'DIRECT' }],
      counterEvidence: [], timingSignals: [],
    },
    {
      discipline: 'ZIWEI', applicable: true, stance: 'INSUFFICIENT_EVIDENCE',
      directEvidence: [{ fact: '질문 축', meaning: '이 축을 직접 보는 경로가 아직 채택되어 있지 않다.', domain: 'GENERAL', temporalScope: 'UNSCOPED', directness: 'DIRECT', coverageGap: true }],
      counterEvidence: [], timingSignals: [],
    },
    { discipline: 'QIMEN', applicable: false, stance: 'NOT_APPLICABLE', directEvidence: [], counterEvidence: [], timingSignals: [] },
  ],
};

const structuredResult = {
  coreSummary: '규모를 줄여 시작하시는 편이 낫습니다.',
  coreInterpretation: '실행이 결과로 이어지는 결은 있지만, 한 번에 크게 벌리면 되돌리기 어렵습니다.',
  strengths: ['실행이 결과로 이어집니다'],
  cautions: ['한 번에 크게 벌리면 되돌리기 어렵습니다'],
  verifiedEvidence: [
    { title: '이렇게 움직이시면 됩니다', body: '되돌릴 수 있는 범위부터 확인하십시오.' },
    { title: '전문근거 · 명리 (E1)', body: '실행이 결과로 이어집니다 (근거: 식상생재)' },
  ],
  followUps: ['가장 크게 걸리는 근거 하나만 더 봐주세요.'],
  decisionMeta: { divinationVerdict: verdict },
} as unknown as StructuredConsultationViewModel;

describe('V5 QA contract — USER_VISIBLE_ANSWER is the delivered product', () => {
  it('includes the action section and 전문근거, because the reader receives both', () => {
    const p = completeProductView(structuredResult, '');
    const titles = p.userVisibleAnswer.sections.map((s) => s.title);
    expect(titles).toContain('이렇게 움직이시면 됩니다');
    expect(titles).toContain('전문근거 · 명리 (E1)');
    expect(p.verifiedEvidence).toHaveLength(2);
    expect(p.userVisibleText).toBe(p.userVisibleAnswer.text);
  });

  it('keeps AUTHORITATIVE_REFERENCE out of the visible answer, so internal facts cannot earn visible-content points', () => {
    const p = completeProductView(structuredResult, '');
    expect(p.authoritativeReference).toEqual([`[MYUNGRI] ${INTERNAL_LINE}`]);
    expect(p.userVisibleText).not.toContain(INTERNAL_LINE);
    expect(p.userVisibleText).not.toContain('내부 참고 전용');
  });

  it('reports MATERIAL contributors, not merely applicable ones', () => {
    const { material, notCovered } = materialContributorsOf(verdict as never);
    expect(material).toEqual(['MYUNGRI']);
    expect(notCovered.sort()).toEqual(['QIMEN', 'ZIWEI']);
  });
});

describe('V5 QA contract — the consumed 40 is one shared, deterministic set', () => {
  it('selects exactly 40 unique cases across 7 domains, identically every call', () => {
    const a = selectRegressionCases();
    expect(a).toHaveLength(40);
    expect(new Set(a.map((c) => c.caseId)).size).toBe(40);
    expect(new Set(a.map((c) => c.domain)).size).toBe(7);
    expect(selectRegressionCases().map((c) => c.caseId)).toEqual(a.map((c) => c.caseId));
  });
});

// V5.2 §5 — SPECIFIC-EVIDENCE LOCATION SEMANTICS. The triage showed the scorer was failing answers whose
// question-relevant anchor was present but sat in 전문근거 instead of being duplicated into body prose. The
// correction is location-agnostic BUT keeps the relevance requirement, and internal reference still cannot
// count. Weights are untouched.
import { readFileSync } from 'fs';
import { join } from 'path';

const JUDGE_SOURCE = readFileSync(join(__dirname, 'qaJudge.ts'), 'utf8');

describe('V5.2 QA contract — specific evidence is judged on the complete product', () => {
  it('K — a visible 전문근거 anchor counts wherever it sits in the product', () => {
    const p = completeProductView(structuredResult, '');
    const evidenceSection = p.userVisibleAnswer.sections.find((s) => s.title.startsWith('전문근거'))!;
    expect(evidenceSection.body).toContain('식상생재');
    expect(p.userVisibleText).toContain('식상생재');
    // The scorer is told not to require the same anchor to be repeated in body prose.
    expect(JUDGE_SOURCE).toContain('위치를 따지지 마십시오');
  });

  it('L — technical does not mean relevant: the rubric still requires question relevance', () => {
    expect(JUDGE_SOURCE).toContain('기술적이라는 이유만으로 자동 인정되지는 않습니다');
    expect(JUDGE_SOURCE).toContain('지금 질문한 사안과 관련이 있어야 합니다');
    expect(JUDGE_SOURCE).toContain('질문한 사안과 무관한 자리만 제시되어 있으면 인정하지 마십시오');
  });

  it('M — evidence that exists only in the internal reference cannot count', () => {
    const p = completeProductView(structuredResult, '');
    expect(p.userVisibleText).not.toContain(INTERNAL_LINE);
    expect(JUDGE_SOURCE).toContain('사용자에게 보이지 않는 근거는 인정하지 마십시오');
  });

  it('rubric weights are unchanged by this batch', () => {
    expect(JUDGE_SOURCE).toContain('personalization (0-20)');
    expect(JUDGE_SOURCE).toContain('crossSystemSynthesis (0-15)');
    expect(JUDGE_SOURCE).toContain('actionUsefulness (0-5)');
  });
});

// V5.2 CLOSURE — the single-material-contributor rubric, and a consistency check that makes an invalid
// zero VISIBLE in future measurement. Nothing here rewrites a score, retries a judge, or calls one.
describe('V5.2 closure — single-material-contributor cross scoring', () => {
  const judge = (cross: number, issues: string[] = [], notes = '') => ({
    scoreBreakdown: { crossSystemSynthesis: cross }, issues, notes,
  });
  const rec = (o: Partial<Parameters<typeof invalidSingleContributorZero>[0]> = {}) => ({
    caseId: 'CASE-1',
    materialContributors: ['ZIWEI'],
    notCoveredSystems: ['MYUNGRI', 'QIMEN'],
    judge: judge(0),
    ...o,
  });

  it('the rubric requires the four criteria and forbids a reflexive zero', () => {
    expect(JUDGE_SOURCE).toContain('그것만을 이유로 0점을 주는 것은 잘못된 채점입니다');
    expect(JUDGE_SOURCE).toContain('적용 범위를 정직하게 처리했는가');
    expect(JUDGE_SOURCE).toContain('없는 결합을 지어내지 않았는가');
    expect(JUDGE_SOURCE).toContain('결론(입장)을 분명하게 설명했는가');
    expect(JUDGE_SOURCE).toContain('커버되지 않은 부분을 이 질문과 관련지어 밝혔는가');
    // The 15-point weight is untouched by this closure patch.
    expect(JUDGE_SOURCE).toContain('crossSystemSynthesis (0-15)');
  });

  it('flags a zero given to a single material contributor with no stated reason', () => {
    const flag = invalidSingleContributorZero(rec());
    expect(flag).not.toBeNull();
    expect(flag!.caseId).toBe('CASE-1');
    expect(flag!.statedReason).toBe('(근거 없음)');
  });

  it('does NOT flag a zero the judge actually reasoned through', () => {
    expect(invalidSingleContributorZero(rec({
      judge: judge(0, ['한 체계뿐인데 여러 체계가 맞물린 것처럼 서술해 적용 범위를 잘못 다뤘습니다.']),
    }))).toBeNull();
  });

  it('does NOT flag a non-zero score, or a genuine multi-contributor case', () => {
    expect(invalidSingleContributorZero(rec({ judge: judge(11) }))).toBeNull();
    expect(invalidSingleContributorZero(rec({ materialContributors: ['MYUNGRI', 'ZIWEI'] }))).toBeNull();
    // Nothing to be honest ABOUT when no system was excluded.
    expect(invalidSingleContributorZero(rec({ notCoveredSystems: [] }))).toBeNull();
    expect(invalidSingleContributorZero(rec({ judge: null }))).toBeNull();
  });

  it('never rewrites a score — it only reports', () => {
    const before = rec();
    const snapshot = JSON.stringify(before);
    invalidSingleContributorZero(before);
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});

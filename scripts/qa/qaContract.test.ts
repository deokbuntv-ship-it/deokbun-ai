// V5 MEASUREMENT-CONTRACT TESTS — free, offline, and the guard against the V4 rescore's own defect:
// scoring an artifact that is not the delivered product, and letting internal reference material count as
// delivered content. These run without QA_LIVE_RUN and make no network call.
//
//   npx jest --roots scripts/qa --testMatch "**/qaContract.test.ts"
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';

import { completeProductView, materialContributorsOf } from './qaCompleteProduct';
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

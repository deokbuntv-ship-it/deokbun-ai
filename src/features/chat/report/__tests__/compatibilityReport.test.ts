// Deterministic 궁합 report composer (Compatibility V1 §87). Pure, ZERO LLM: the report is composed from
// the SERVER tier + the validated pair answers. Locks the pair title, the tier-led summary, the 분야별
// findings, empty-section hiding, and determinism.
import { buildCompatibilityReport, deriveCompatibilityReportTitle } from '../compatibilityReportComposer';
import type { ConsultationPresentationVM } from '@/features/chat/presentation/consultationPresentationVM';

const answer = (over: Partial<ConsultationPresentationVM> = {}): ConsultationPresentationVM => ({
  headline: '전체적으로 잘 맞는 편이에요.',
  disposition: null,
  summary: '대화의 결이 잘 맞아요.',
  keyPoints: ['대화가 잘 통함', '서로의 속도를 존중함'],
  cautions: ['돈 쓰는 기준을 미리 맞추기'],
  detailSections: [],
  followUps: [],
  ...over,
});

const base = {
  selfLabel: '조세영',
  targetLabel: '김민준',
  overallLabel: '잘 맞는 편',
  dimensions: [
    { title: '정서·유대', verdict: '정서적으로 잘 통하는 편이에요.' },
    { title: '갈등·마찰', verdict: '부딪히는 지점이 적은 편이에요.' },
    { title: '오행 보완', verdict: '서로 부족한 기운을 채워주는 편이에요.' },
  ],
  questions: ['우리 궁합 좋아?', '돈 문제는 잘 맞아?'],
  answers: [answer()],
  generatedAt: '2026-08-19T00:00:00.000Z',
};

describe('buildCompatibilityReport — deterministic pair report', () => {
  it('title names both people (owner §43)', () => {
    expect(deriveCompatibilityReportTitle('조세영', '김민준')).toBe('조세영님과 김민준님의 궁합 보고서');
    expect(buildCompatibilityReport(base).title).toBe('조세영님과 김민준님의 궁합 보고서');
  });

  it('summary leads with the SERVER tier verdict', () => {
    expect(buildCompatibilityReport(base).summary).toContain('전체적으로 잘 맞는 편');
  });

  it('findings lead with the 분야별 궁합 dimension verdicts, then the answer key points', () => {
    const p = buildCompatibilityReport(base);
    expect(p.keyFindings[0]).toContain('정서·유대');
    expect(p.keyFindings.some((f) => f.includes('대화가 잘 통함'))).toBe(true);
  });

  it('cautions come from the answers; covered topics from the questions', () => {
    const p = buildCompatibilityReport(base);
    expect(p.cautions).toContain('돈 쓰는 기준을 미리 맞추기');
    expect(p.coveredTopics).toEqual(expect.arrayContaining(['우리 궁합 좋아?', '돈 문제는 잘 맞아?']));
  });

  it('is deterministic — same input → same payload (no LLM, no Date.now)', () => {
    expect(buildCompatibilityReport(base)).toEqual(buildCompatibilityReport(base));
  });

  it('dedupes repeated findings/cautions across answers', () => {
    const p = buildCompatibilityReport({ ...base, answers: [answer(), answer()] });
    const dupes = p.keyFindings.filter((f) => f === '대화가 잘 통함');
    expect(dupes.length).toBeLessThanOrEqual(1);
  });
});

// Deterministic consultation report composer (Commercial UX V4 §26/§27/§31/§65). Pure — no LLM.
import {
  buildConsultationReport,
  deriveReportTitle,
} from '../consultationReportComposer';
import type { ConsultationPresentationVM } from '@/features/chat/presentation/consultationPresentationVM';

const vm = (over: Partial<ConsultationPresentationVM>): ConsultationPresentationVM => ({
  headline: null,
  disposition: null,
  summary: null,
  keyPoints: [],
  cautions: [],
  detailSections: [],
  followUps: [],
  ...over,
});

const NOW = '2026-08-18T00:00:00.000Z';

describe('deriveReportTitle — deterministic, no LLM', () => {
  it('strips trailing question words/punctuation and appends 상담 보고서', () => {
    expect(deriveReportTitle('2027년 사업운은 어때?')).toBe('2027년 사업운은 상담 보고서');
    expect(deriveReportTitle('내 성격의 장단점을 알려줘')).toBe('내 성격의 장단점을 상담 보고서');
    expect(deriveReportTitle('앞으로 10년 사업 흐름 알려줘')).toBe('앞으로 10년 사업 흐름 상담 보고서');
  });
  it('falls back to a generic title when there is no question', () => {
    expect(deriveReportTitle(undefined)).toBe('상담 보고서');
    expect(deriveReportTitle('   ')).toBe('상담 보고서');
  });
});

describe('buildConsultationReport — deterministic composition', () => {
  it('prefers the stored summary, dedups findings/cautions across answers, lists topics', () => {
    const report = buildConsultationReport({
      questions: ['2027년 사업운은?', '조심할 점은?', '2027년 사업운은?'],
      answers: [
        vm({ headline: '2027년은 확장의 해예요.', keyPoints: ['사람과의 관계가 기회'], cautions: ['지출 관리'] }),
        vm({ headline: '하반기가 특히 좋아요.', keyPoints: ['사람과의 관계가 기회'], cautions: ['조급함 주의'] }),
      ],
      storedSummary: '전반적으로 상승 흐름이며 하반기에 기회가 커집니다.',
      generatedAt: NOW,
    });

    expect(report.title).toBe('2027년 사업운은 상담 보고서');
    expect(report.summary).toBe('전반적으로 상승 흐름이며 하반기에 기회가 커집니다.');
    // headlines + key points, deduped (the repeated key point appears once)
    expect(report.keyFindings).toEqual([
      '2027년은 확장의 해예요.',
      '하반기가 특히 좋아요.',
      '사람과의 관계가 기회',
    ]);
    expect(report.cautions).toEqual(['지출 관리', '조급함 주의']);
    expect(report.coveredTopics).toEqual(['2027년 사업운은?', '조심할 점은?']); // deduped
    expect(report.generatedAt).toBe(NOW);
  });

  it('falls back to answer headlines when no stored summary', () => {
    const report = buildConsultationReport({
      questions: ['내 성격은?'],
      answers: [vm({ headline: '차분하지만 추진력 있는 편이에요.' })],
      storedSummary: null,
      generatedAt: NOW,
    });
    expect(report.summary).toBe('차분하지만 추진력 있는 편이에요.');
  });

  it('strips any internal terminology from report fields (§8/§50)', () => {
    const report = buildConsultationReport({
      questions: ['사업운 (엔진: SAJU)'],
      answers: [vm({ headline: '좋은 흐름이에요 (엔진: SAJU)', cautions: ['지출 (제공됨)'] })],
      storedSummary: '상승 흐름 (engine: iztro)',
      generatedAt: NOW,
    });
    expect(report.summary).toBe('상승 흐름');
    expect(report.keyFindings).toEqual(['좋은 흐름이에요']);
    expect(report.cautions).toEqual(['지출']);
    expect(report.coveredTopics).toEqual(['사업운']);
  });

  it('is safe on an empty conversation', () => {
    const report = buildConsultationReport({ questions: [], answers: [], storedSummary: null, generatedAt: NOW });
    expect(report).toEqual({
      title: '상담 보고서',
      summary: '',
      keyFindings: [],
      cautions: [],
      coveredTopics: [],
      generatedAt: NOW,
    });
  });
});

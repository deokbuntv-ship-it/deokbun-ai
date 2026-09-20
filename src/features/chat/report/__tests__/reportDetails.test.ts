// 리포트가 자세한 내용을 받는다 (2026-09-19, PART 4-2).
//
// 왜 필요한가. 리포트는 답변에서 **headline · keyPoints · cautions 세 가지만** 모으고 있었다. 조립기가
// 만든 자세한 해석(전문근거 · 왜 이렇게 보나요 · 행동 · 시기)은 `detailSections` 에 있었는데 리포트로
// **한 줄도 오지 않았다**. 상담 답변을 짧게 만드는 이번 묶음에서 이것을 그대로 두면, 자세한 내용이
// 상담에서도 리포트에서도 사라진다. 그래서 리포트가 받게 했다 — 상담은 짧은 대화, 리포트는 자세한 문서.
import { buildConsultationReport } from '@/features/chat/report/consultationReportComposer';
import { toReportDetailView } from '@/features/chat/report/reportPresentation';
import type { ConsultationPresentationVM } from '@/features/chat/presentation/consultationPresentationVM';
import type { ConsultationReport } from '@/features/chat/report/reportTypes';

const shortAnswer: ConsultationPresentationVM = {
  headline: '이번 달은 맡은 자리가 흐릿해지는 때예요.',
  disposition: '버티면서 중심을 잡는 편이에요.',
  summary: '평소보다 부딪히는 일이 늘어요. 혹시 요즘 누가 자꾸 걸리세요?',
  keyPoints: [],
  cautions: [],
  detailSections: [
    { title: '왜 이렇게 보나요', body: '명리·자미두수 쪽에 이 질문을 직접 보는 자리가 있어 그 근거로 판단했습니다.' },
    { title: '전문근거 · 명리', body: '오행 분포에서 토가 가장 많습니다.' },
    { title: '전문근거 · 자미두수', body: '명궁 주성이 자미입니다.' },
  ],
  followUps: [],
};

const asReport = (payload: unknown): ConsultationReport => ({
  id: 'r1', conversationId: 'c1', title: '상담 보고서', status: 'ready',
  payload, createdAt: '2026-09-19T00:00:00Z', updatedAt: '2026-09-19T00:00:00Z',
} as unknown as ConsultationReport);

describe('짧은 답변이어도 리포트는 얇아지지 않는다', () => {
  it('⚠ 접혀 있던 자세한 해석이 리포트에 담긴다', () => {
    const p = buildConsultationReport({
      questions: ['이번 달 일 운이 어떤가요?'], answers: [shortAnswer],
      storedSummary: null, generatedAt: '2026-09-19T00:00:00Z',
    });
    expect(p.details).toHaveLength(3);
    expect(p.details?.map((d) => d.title)).toEqual(['왜 이렇게 보나요', '전문근거 · 명리', '전문근거 · 자미두수']);
  });

  it('⚠ 반례 — 예전 방식이라면 자세한 내용이 하나도 없었다 (keyPoints·cautions 가 비어 있으므로)', () => {
    const p = buildConsultationReport({
      questions: ['이번 달 일 운이 어떤가요?'], answers: [shortAnswer],
      storedSummary: null, generatedAt: '2026-09-19T00:00:00Z',
    });
    expect(p.keyFindings).toEqual([shortAnswer.headline]); // 결론 한 줄뿐
    expect(p.cautions).toEqual([]);
    // 자세한 내용은 오직 details 에만 있다 — 이 칸이 없으면 리포트가 결론 한 줄짜리가 된다
    expect((p.details ?? []).length).toBeGreaterThan(0);
  });

  it('제목이 같은 근거는 한 번만 담는다 (여러 답변에서 되풀이되지 않게)', () => {
    const p = buildConsultationReport({
      questions: ['q1', 'q2'], answers: [shortAnswer, shortAnswer],
      storedSummary: null, generatedAt: '2026-09-19T00:00:00Z',
    });
    expect(p.details).toHaveLength(3);
  });

  it('화면에서 문단으로 펼쳐진다 — 리포트는 문서라 접지 않는다', () => {
    const p = buildConsultationReport({
      questions: ['이번 달 일 운이 어떤가요?'], answers: [shortAnswer],
      storedSummary: null, generatedAt: '2026-09-19T00:00:00Z',
    });
    const view = toReportDetailView(asReport(p));
    const titles = view.sections.map((s) => s.title);
    expect(titles).toContain('전문근거 · 명리');
    const evi = view.sections.find((s) => s.title === '전문근거 · 명리');
    expect(evi?.kind).toBe('paragraph');
  });

  it('⚠ 예전에 저장된 리포트(details 없음)도 그대로 열린다', () => {
    const legacy = {
      title: '상담 보고서', summary: '요약입니다.', keyFindings: ['핵심'], cautions: [],
      coveredTopics: ['질문'], generatedAt: '2026-09-01T00:00:00Z',
    };
    const view = toReportDetailView(asReport(legacy));
    expect(view.sections.map((s) => s.title)).toEqual(['한눈에 보는 요약', '핵심 포인트', '상담에서 다룬 주요 질문']);
  });

  it('빈 자세한 해석은 칸을 만들지 않는다', () => {
    const p = buildConsultationReport({
      questions: ['q'], answers: [{ ...shortAnswer, detailSections: [{ title: '  ', body: '  ' }] }],
      storedSummary: null, generatedAt: '2026-09-19T00:00:00Z',
    });
    expect(p.details).toEqual([]);
  });
});

// Report presentation (Commercial UX V4 §14/§17/§18/§19/§28). Verifies the deterministic list-item +
// detail projections: date formatting, empty-section filtering (§18 — never render an empty/"없음"
// section), title fallback, and preview derivation.
import type { ConsultationReport } from '@/features/chat/report/reportService';
import {
  formatReportDate,
  toReportDetailView,
  toReportListItem,
} from '@/features/chat/report/reportPresentation';

const NOW = '2026-08-18T09:30:00.000Z';

const makeReport = (over: Partial<ConsultationReport['payload']> = {}, top: Partial<ConsultationReport> = {}): ConsultationReport => ({
  id: 'r1',
  conversationId: 'c1',
  title: '2027년 사업운 상담 보고서',
  createdAt: NOW,
  updatedAt: NOW,
  payload: {
    title: '2027년 사업운 상담 보고서',
    summary: '올해는 확장보다 기반을 다질 때예요.',
    keyFindings: ['끈기가 강점', '하반기 흐름 개선'],
    cautions: ['성급한 확장 주의'],
    coveredTopics: ['2027년 사업운은?'],
    generatedAt: NOW,
    ...over,
  },
  ...top,
});

describe('formatReportDate', () => {
  it('formats an ISO timestamp to YYYY.MM.DD', () => {
    expect(formatReportDate(NOW)).toBe('2026.08.18');
  });
  it('returns "" for malformed / missing input (no "Invalid Date")', () => {
    expect(formatReportDate('nonsense')).toBe('');
    expect(formatReportDate(null)).toBe('');
    expect(formatReportDate(undefined)).toBe('');
  });
});

describe('toReportListItem', () => {
  it('maps title, date, and a summary-derived preview', () => {
    const v = toReportListItem(makeReport());
    expect(v.id).toBe('r1');
    expect(v.title).toBe('2027년 사업운 상담 보고서');
    expect(v.dateLabel).toBe('2026.08.18');
    expect(v.preview).toBe('올해는 확장보다 기반을 다질 때예요.');
  });
  it('falls back to the first key finding when there is no summary', () => {
    const v = toReportListItem(makeReport({ summary: '' }));
    expect(v.preview).toBe('끈기가 강점');
  });
  it('falls back to a default title when the title is blank', () => {
    const v = toReportListItem(makeReport({}, { title: '   ' }));
    expect(v.title).toBe('상담 보고서');
  });
});

describe('toReportDetailView', () => {
  it('emits sections in reading order, all populated', () => {
    const v = toReportDetailView(makeReport());
    expect(v.dateLabel).toBe('2026.08.18');
    expect(v.sections.map((s) => s.title)).toEqual([
      '한눈에 보는 요약',
      '핵심 포인트',
      '주의할 점',
      '상담에서 다룬 주요 질문',
    ]);
  });

  it('OMITS empty sections — never renders an empty/"없음" block (§18)', () => {
    const v = toReportDetailView(makeReport({ summary: '', cautions: [], coveredTopics: [] }));
    expect(v.sections.map((s) => s.title)).toEqual(['핵심 포인트']); // only the one with content
  });

  it('drops blank list entries but keeps the populated ones', () => {
    const v = toReportDetailView(makeReport({ keyFindings: ['진짜 항목', '   ', ''] }));
    const key = v.sections.find((s) => s.title === '핵심 포인트');
    expect(key?.kind).toBe('list');
    expect(key && key.kind === 'list' ? key.items : []).toEqual(['진짜 항목']);
  });

  it('renders the summary as a paragraph section', () => {
    const v = toReportDetailView(makeReport());
    const summary = v.sections.find((s) => s.title === '한눈에 보는 요약');
    expect(summary?.kind).toBe('paragraph');
    expect(summary && summary.kind === 'paragraph' ? summary.body : '').toContain('기반을 다질');
  });
});

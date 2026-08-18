// Consultation report service (Commercial UX V4 §16/§33). Verifies the eligibility gate (no report
// without a structured answer, no spurious DB write) and the deterministic insert path. The composer +
// presentation VM it uses are tested separately; this locks the orchestration.
import { toConsumerAssessmentView } from '@/features/intelligence/presentation/assessmentView';
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import type { ChatMessage } from '@/features/chat/types/chat';

type Res = { data: unknown; error: unknown };
const cfg: {
  loaded: { conversationId: string; messages: ChatMessage[]; summary: string | null } | null;
  reportsSelectMaybeSingle: Res;
  reportsSingle: Res;
  calls: string[];
} = {
  loaded: null,
  reportsSelectMaybeSingle: { data: null, error: null },
  reportsSingle: { data: null, error: null },
  calls: [],
};

jest.mock('@/features/chat/services/conversationService', () => ({
  conversationService: { loadConversationById: async () => cfg.loaded },
}));

jest.mock('@/services/supabase', () => {
  const client = {
    from(table: string) {
      cfg.calls.push(`from:${table}`);
      const q: Record<string, unknown> = {
        select: () => q,
        eq: () => q,
        order: () => Promise.resolve({ data: [], error: null }),
        insert: () => {
          cfg.calls.push(`insert:${table}`);
          return q;
        },
        update: () => {
          cfg.calls.push(`update:${table}`);
          return q;
        },
        maybeSingle: () => Promise.resolve(cfg.reportsSelectMaybeSingle),
        single: () => Promise.resolve(cfg.reportsSingle),
      };
      return q;
    },
  };
  return { getSupabaseClient: () => client };
});

import { reportService } from '../reportService';

const NOW = '2026-08-18T00:00:00.000Z';
const assistantWithStructured = (): ChatMessage => ({
  id: 'a1',
  role: 'assistant',
  text: '올해는 기반을 다질 때예요.',
  structuredResult: {
    coreSummary: '올해는 기반을 다질 때예요.',
    assessment: toConsumerAssessmentView([]),
    coreInterpretation: '확장보다 정비가 어울리는 흐름입니다.',
    strengths: ['끈기'],
    grounding: GROUNDING_UNAVAILABLE,
    followUps: ['재물운은?', '2027년은?', '조심할 점은?'],
  },
});

beforeEach(() => {
  cfg.loaded = null;
  cfg.reportsSelectMaybeSingle = { data: null, error: null };
  cfg.reportsSingle = { data: null, error: null };
  cfg.calls = [];
});

describe('reportService.createOrUpdateReport', () => {
  it('is NOT eligible without a structured answer → null, and NO DB write', async () => {
    cfg.loaded = { conversationId: 'c1', messages: [{ id: 'u1', role: 'user', text: '내 사업운?' }], summary: null };
    const report = await reportService.createOrUpdateReport('c1', NOW);
    expect(report).toBeNull();
    expect(cfg.calls.filter((c) => c.includes('consultation_reports'))).toEqual([]); // never touched reports
    expect(cfg.calls.filter((c) => c.startsWith('insert'))).toEqual([]);
  });

  it('returns null for an absent/non-owned conversation (loadConversationById null)', async () => {
    cfg.loaded = null;
    expect(await reportService.createOrUpdateReport('nope', NOW)).toBeNull();
    expect(cfg.calls).toEqual([]);
  });

  it('composes deterministically + inserts a new report (idempotent path: no existing → insert)', async () => {
    cfg.loaded = {
      conversationId: 'c1',
      messages: [{ id: 'u1', role: 'user', text: '2027년 사업운은?' }, assistantWithStructured()],
      summary: null,
    };
    cfg.reportsSingle = {
      data: {
        id: 'r1',
        conversation_id: 'c1',
        title: '2027년 사업운은 상담 보고서',
        report_payload: { title: '2027년 사업운은 상담 보고서', summary: 's', keyFindings: [], cautions: [], coveredTopics: ['2027년 사업운은?'], generatedAt: NOW },
        created_at: NOW,
      },
      error: null,
    };
    const report = await reportService.createOrUpdateReport('c1', NOW);
    expect(report?.id).toBe('r1');
    expect(report?.title).toContain('상담 보고서');
    expect(cfg.calls).toContain('insert:consultation_reports'); // inserted (no existing report)
    expect(cfg.calls).not.toContain('update:consultation_reports');
  });

  it('updates the existing report instead of inserting a duplicate (idempotency §37)', async () => {
    cfg.loaded = {
      conversationId: 'c1',
      messages: [{ id: 'u1', role: 'user', text: '내 성격은?' }, assistantWithStructured()],
      summary: null,
    };
    cfg.reportsSelectMaybeSingle = { data: { id: 'r1' }, error: null }; // a report already exists
    cfg.reportsSingle = {
      data: { id: 'r1', conversation_id: 'c1', title: 't', report_payload: { title: 't', summary: '', keyFindings: [], cautions: [], coveredTopics: [], generatedAt: NOW }, created_at: NOW },
      error: null,
    };
    await reportService.createOrUpdateReport('c1', NOW);
    expect(cfg.calls).toContain('update:consultation_reports');
    expect(cfg.calls).not.toContain('insert:consultation_reports');
  });
});

// Report CTA logic (Commercial UX V4 §5/§6/§7/§9). Verifies conversation eligibility and the single
// CTA state machine — visible only when there's a real answer, and the correct one-per-conversation
// state (create / generating / created / view / hidden).
import type { ChatMessage } from '@/features/chat/types/chat';
import { isReportEligible, resolveReportCtaView, type ReportCtaState } from '@/features/chat/report/reportCta';

const structured = () => ({ coreSummary: '요약' }) as unknown as ChatMessage['structuredResult'];

const welcome: ChatMessage = { id: 'welcome-message', role: 'assistant', text: '안녕하세요' };
const userMsg: ChatMessage = { id: 'u1', role: 'user', text: '내 사업운?' };
const answer: ChatMessage = { id: 'a1', role: 'assistant', text: '…', structuredResult: structured() };
const plainAnswer: ChatMessage = { id: 'a2', role: 'assistant', text: '평문 답변' };

describe('isReportEligible', () => {
  it('is false for an empty conversation', () => {
    expect(isReportEligible([])).toBe(false);
  });
  it('is false with only the welcome message / plain-text answers (no structured answer)', () => {
    expect(isReportEligible([welcome])).toBe(false);
    expect(isReportEligible([welcome, userMsg, plainAnswer])).toBe(false);
  });
  it('is true once there is a structured assistant answer', () => {
    expect(isReportEligible([welcome, userMsg, answer])).toBe(true);
  });
});

const base: ReportCtaState = {
  eligible: true,
  conversationId: 'c1',
  reportId: null,
  justCreated: false,
  generating: false,
};

describe('resolveReportCtaView', () => {
  it('is hidden when not eligible or when there is no conversation yet (§7)', () => {
    expect(resolveReportCtaView({ ...base, eligible: false }).mode).toBe('hidden');
    expect(resolveReportCtaView({ ...base, conversationId: null }).mode).toBe('hidden');
  });

  it('shows the create CTA when eligible with no existing report (§6)', () => {
    expect(resolveReportCtaView(base).mode).toBe('create');
  });

  it('shows the generating state while in flight (§8)', () => {
    expect(resolveReportCtaView({ ...base, generating: true }).mode).toBe('generating');
  });

  it('shows the success state (with id) right after creation (§9)', () => {
    const v = resolveReportCtaView({ ...base, reportId: 'r9', justCreated: true });
    expect(v).toEqual({ mode: 'created', reportId: 'r9' });
  });

  it('shows the view state for a report loaded on entry (§29)', () => {
    const v = resolveReportCtaView({ ...base, reportId: 'r9', justCreated: false });
    expect(v).toEqual({ mode: 'view', reportId: 'r9' });
  });

  it('prioritises the in-flight state over an existing report id', () => {
    expect(resolveReportCtaView({ ...base, reportId: 'r9', generating: true }).mode).toBe('generating');
  });
});

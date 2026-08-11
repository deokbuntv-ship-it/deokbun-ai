// Non-UI regression coverage for the pure chat-logic modules (directive §13):
// conversation memory windowing, the local-response gateway, and consultation
// context selection. All pure — no network, no React, no mocks.
import { chatConfig } from '@/features/chat/config/chatConfig';
import { evaluateMessage } from '@/features/chat/gateway/AIGateway';
import { computeConversationMemory } from '@/features/chat/memory/conversationMemory';
import { selectConsultationContext } from '@/features/chat/selectors/contextSelector';
import type { ChatMessage } from '@/features/chat/types/chat';
import type { ConversationMemoryState } from '@/features/chat/types/chatArchitecture';

const msg = (id: string, role: ChatMessage['role'], text: string): ChatMessage => ({ id, role, text });
const seq = (n: number): ChatMessage[] =>
  Array.from({ length: n }, (_, i) => msg(`m${i + 1}`, i % 2 === 0 ? 'user' : 'assistant', `t${i + 1}`));
const noSummary: ConversationMemoryState = { summary: null, lastSummarizedMessageId: null };

describe('computeConversationMemory', () => {
  const RECENT = chatConfig.maxRecentMessages; // 8
  const THRESH = chatConfig.summaryThreshold; // 20

  it('keeps everything as recent when below the recent window (no checkpoint)', () => {
    const r = computeConversationMemory(seq(5), noSummary);
    expect(r.recentMessages).toHaveLength(5);
    expect(r.messagesToSummarize).toHaveLength(0);
    expect(r.shouldUpdateSummary).toBe(false);
    expect(r.existingSummary).toBeNull();
  });

  it('splits into recent tail + to-summarize head; flags summary when head >= threshold', () => {
    const total = RECENT + THRESH; // 28 → 8 recent, 20 to summarize
    const r = computeConversationMemory(seq(total), noSummary);
    expect(r.recentMessages).toHaveLength(RECENT);
    expect(r.messagesToSummarize).toHaveLength(THRESH);
    expect(r.recentMessages[r.recentMessages.length - 1].id).toBe(`m${total}`);
    expect(r.shouldUpdateSummary).toBe(true);
  });

  it('does not flag summary until the head reaches the threshold', () => {
    const r = computeConversationMemory(seq(RECENT + THRESH - 1), noSummary);
    expect(r.messagesToSummarize).toHaveLength(THRESH - 1);
    expect(r.shouldUpdateSummary).toBe(false);
  });

  it('only considers messages AFTER the checkpoint as unsummarized', () => {
    const messages = seq(12);
    const state: ConversationMemoryState = { summary: 'prev', lastSummarizedMessageId: 'm4' };
    const r = computeConversationMemory(messages, state);
    // 8 messages after m4 (m5..m12); all fit the recent window, none to summarize
    expect(r.recentMessages.map((m) => m.id)).toEqual(['m5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12']);
    expect(r.messagesToSummarize).toHaveLength(0);
    expect(r.existingSummary).toBe('prev');
  });

  it('falls back safely (last N recent, no summary update) when the checkpoint id is missing', () => {
    const messages = seq(30);
    const state: ConversationMemoryState = { summary: 'S', lastSummarizedMessageId: 'does-not-exist' };
    const r = computeConversationMemory(messages, state);
    expect(r.recentMessages).toHaveLength(RECENT);
    expect(r.messagesToSummarize).toHaveLength(0);
    expect(r.shouldUpdateSummary).toBe(false);
    expect(r.existingSummary).toBe('S');
  });

  it('handles an empty conversation', () => {
    const r = computeConversationMemory([], noSummary);
    expect(r.recentMessages).toHaveLength(0);
    expect(r.messagesToSummarize).toHaveLength(0);
    expect(r.shouldUpdateSummary).toBe(false);
  });
});

describe('evaluateMessage (local-response gateway)', () => {
  it('returns INVALID_INPUT for blank / whitespace input', () => {
    expect(evaluateMessage('').type).toBe('INVALID_INPUT');
    expect(evaluateMessage('   ').type).toBe('INVALID_INPUT');
  });

  it('matches greeting/thanks/farewell/ack local rules', () => {
    expect(evaluateMessage('안녕')).toEqual({ type: 'LOCAL_RESPONSE', text: '안녕하세요 😊' });
    expect(evaluateMessage('감사합니다')).toEqual({ type: 'LOCAL_RESPONSE', text: '도움이 되어 기쁩니다 😊' });
    expect(evaluateMessage('잘가')).toEqual({ type: 'LOCAL_RESPONSE', text: '다음에 또 편하게 이야기해요 😊' });
    expect(evaluateMessage('네')).toEqual({ type: 'LOCAL_RESPONSE', text: '네, 알겠습니다 😊' });
  });

  it('normalizes case, surrounding whitespace, and trailing punctuation before matching', () => {
    expect(evaluateMessage('  HELLO  ').type).toBe('LOCAL_RESPONSE');
    expect(evaluateMessage('안녕하세요!!!').type).toBe('LOCAL_RESPONSE');
    expect(evaluateMessage('thanks.').type).toBe('LOCAL_RESPONSE');
  });

  it('routes real consultation questions to the LLM', () => {
    expect(evaluateMessage('올해 재물운은 어때?').type).toBe('NEED_LLM');
    expect(evaluateMessage('이직하기 좋은 시기가 언제일까요?').type).toBe('NEED_LLM');
  });
});

describe('selectConsultationContext', () => {
  const subject = { id: 's1', displayName: '홍길동', relationship: null } as never;
  const baseBirth = {
    displayName: '홍길동',
    gender: 'male',
    calendarType: 'solar',
    lunarMonthType: null,
    birthYear: '1990',
    birthMonth: '5',
    birthDay: '3',
    birthTimeAccuracy: 'exact',
    birthHour: '10',
    birthMinute: '30',
    approximateTimePeriod: null,
    birthPlace: '  서울  ',
  } as never;

  it('returns null when subject or birthInfo is missing', () => {
    expect(selectConsultationContext({ subject: null, birthInfo: baseBirth } as never)).toBeNull();
    expect(selectConsultationContext({ subject, birthInfo: null } as never)).toBeNull();
  });

  it('maps an exact-time draft (gender label, date, HH시 MM분, trimmed place)', () => {
    const c = selectConsultationContext({ subject, birthInfo: baseBirth } as never)!;
    expect(c.subjectDisplayName).toBe('홍길동');
    expect(c.gender).toBe('남성');
    expect(c.birthDate).toBe('1990.5.3');
    expect(c.birthTimeSummary).toBe('10시 30분');
    expect(c.birthPlace).toBe('서울');
  });

  it('summarizes an approximate time as "<period> 무렵"', () => {
    const c = selectConsultationContext({
      subject,
      birthInfo: { ...baseBirth, birthTimeAccuracy: 'approximate', approximateTimePeriod: 'afternoon' },
    } as never)!;
    expect(c.birthTimeSummary).toBe('오후 무렵');
  });

  it('summarizes unknown birth time as "출생시간 미상"', () => {
    const c = selectConsultationContext({
      subject,
      birthInfo: { ...baseBirth, birthTimeAccuracy: 'unknown' },
    } as never)!;
    expect(c.birthTimeSummary).toBe('출생시간 미상');
  });
});

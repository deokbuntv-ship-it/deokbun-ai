// buildPrompt assembly coverage (AI_CONSTITUTION 제10조 pipeline order, 제15조
// PromptBuilder purity). Pure, no mocks — matches the chatLogic.test.ts convention.
import type { ChatMessage } from '@/features/chat/types/chat';
import type {
  PromptBuildInput,
  SelectedConsultationContext,
} from '@/features/chat/types/chatArchitecture';

import { buildPrompt } from '../promptBuilder';

const ctx: SelectedConsultationContext = {
  subjectDisplayName: '홍길동',
  gender: '남성',
  birthDate: '1990.5.3',
  birthTimeSummary: '10시 30분',
  birthPlace: '서울',
};

const recent: ChatMessage[] = [
  { id: 'm1', role: 'user', text: '안녕하세요' },
  { id: 'm2', role: 'assistant', text: '반갑습니다' },
];

const base = (over?: Partial<PromptBuildInput>): PromptBuildInput => ({
  selectedContext: ctx,
  conversationSummary: null,
  recentMessages: recent,
  currentUserMessage: '올해 운세는?',
  ...over,
});

describe('buildPrompt', () => {
  it('assembles system-instruction, context, recent turns, then the user turn (no summary when null)', () => {
    const m = buildPrompt(base());
    expect(m.map((x) => x.role)).toEqual(['system', 'system', 'user', 'assistant', 'user']);
    expect(m[0].content).toContain('DeokbunAI');
    expect(m[1].content).toContain('대상: 홍길동');
    expect(m[1].content).toContain('출생시간: 10시 30분');
    expect(m[m.length - 1]).toEqual({ role: 'user', content: '올해 운세는?' });
  });

  it('inserts the conversation summary as a 3rd system message ONLY when present', () => {
    const withSummary = buildPrompt(base({ conversationSummary: '이전 상담 요약' }));
    expect(withSummary.map((x) => x.role)).toEqual([
      'system',
      'system',
      'system',
      'user',
      'assistant',
      'user',
    ]);
    expect(withSummary[2]).toEqual({ role: 'system', content: '이전 상담 요약' });
  });

  it('preserves recent message order and roles verbatim', () => {
    const m = buildPrompt(base());
    expect(m.slice(2, 4)).toEqual([
      { role: 'user', content: '안녕하세요' },
      { role: 'assistant', content: '반갑습니다' },
    ]);
  });

  it('trims the current user message', () => {
    const m = buildPrompt(base({ recentMessages: [], currentUserMessage: '  질문  ' }));
    expect(m[m.length - 1]).toEqual({ role: 'user', content: '질문' });
  });
});

// Sprint J2 §2/§18 — the AI disclosure wording must keep its required meaning. If someone softens or truncates
// it, this fails. (The component is RN; a separate source-scan test asserts every required screen renders it.)
import {
  AI_DISCLOSURE_TEXT, AI_DISCLOSURE_SHORT, AI_DISCLOSURE_DOC, AI_DISCLOSURE_VERSION,
} from '@/features/legal/aiDisclosure';

describe('AI disclosure wording', () => {
  it('full text carries all three required ideas: AI use, may be inaccurate, verify important decisions', () => {
    expect(AI_DISCLOSURE_TEXT).toContain('AI');
    expect(AI_DISCLOSURE_TEXT).toMatch(/부정확|다를 수 있/);
    expect(AI_DISCLOSURE_TEXT).toContain('중요한 결정');
  });
  it('short text stays honest (inaccuracy + caution) for tight spaces', () => {
    expect(AI_DISCLOSURE_SHORT).toMatch(/AI/);
    expect(AI_DISCLOSURE_SHORT).toMatch(/다를 수 있|부정확/);
  });
  it('notice doc is a factual notice (no DRAFT legal status) with the same intro wording', () => {
    expect(AI_DISCLOSURE_DOC.title).toBe('AI 생성 콘텐츠 안내');
    expect(AI_DISCLOSURE_DOC).not.toHaveProperty('status'); // not a legal draft
    expect(AI_DISCLOSURE_DOC.intro[0]).toBe(AI_DISCLOSURE_TEXT);
    expect(AI_DISCLOSURE_DOC.sections.length).toBeGreaterThanOrEqual(2);
  });
  it('is versioned', () => {
    expect(AI_DISCLOSURE_VERSION).toMatch(/^ai-disclosure@/);
  });
});

import { STRUCTURED_OUTPUT_INSTRUCTION } from '../structuredConsultation';

// CONSULTATION_PLAIN_LANGUAGE — the consumer-facing consultation answer must lead with 생활언어 and use 명리
// terms only as 보조 (terms stay in the 근거, never deleted). The LLM output itself can't be unit-tested, so
// this locks the prompt INSTRUCTION that produces it: the rule, the fields it applies to, the BAD→GOOD
// examples the owner approved, and that evidence is preserved (ordering, not deletion).
const T = STRUCTURED_OUTPUT_INSTRUCTION;

describe('plain-language-first rule is in the consultation instruction', () => {
  it('requires 쉬운 말 먼저 for the consumer-facing fields', () => {
    expect(T).toContain('쉬운 말 먼저');
    expect(T).toMatch(/생활언어로 먼저/);
    for (const field of ['coreSummary', 'coreInterpretation', 'strengths', 'cautions']) {
      expect(T).toContain(field);
    }
  });

  it('allows 명리 terms only as 보조 after a plain explanation (not deleted)', () => {
    expect(T).toMatch(/보조로만/);
    // the flow terms the owner said to KEEP (used with a plain gloss, never banned)
    for (const term of ['재성', '관성', '식상', '비겁', '인성', '합', '충', '형', '대운', '세운']) {
      expect(T).toContain(term);
    }
  });

  it('encodes the approved BAD → GOOD examples (재성/식상, 대운)', () => {
    expect(T).toContain('재성이 활성화되고 식상이 강해집니다'); // BAD, as the counter-example
    expect(T).toMatch(/돈과 현실적인 성과를[\s\S]*재성·식상의 움직임으로 설명/); // GOOD style
    expect(T).toMatch(/직접 결정하고 움직일수록 성과/); // 대운 → plain meaning
  });

  it('preserves evidence: terms move to the 근거 (domainInterpretation), never deleted', () => {
    expect(T).toContain('domainInterpretation');
    expect(T).toContain('근거를 삭제하라는 뜻이 아닙니다');
  });
});

describe('follow-up generation stays in the 역학 상담 scope', () => {
  it('bans out-of-scope professional-service suggestions', () => {
    expect(T).toMatch(/역학 상담 범위/);
    expect(T).toMatch(/계약서·법률문서 검토/);
    expect(T).toMatch(/의료 진단/);
    expect(T).toMatch(/투자 종목 추천/);
  });
});

describe('engine/theory bans are untouched (no semantics changed)', () => {
  it('still forbids 신강/신약/용신/격국 and raw 천간·지지 hanja in the answer', () => {
    expect(T).toMatch(/신강·신약·용신·격국/);
    expect(T).toMatch(/천간·지지 한자/);
  });
});

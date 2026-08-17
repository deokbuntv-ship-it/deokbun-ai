// Commercial consultation answer contract (Quality Sprint §3-6/§9/§16). Locks the
// STRUCTURED_OUTPUT_INSTRUCTION rules that turn the answer from a research report into a
// readable consultation: conclusion-first + concise, no internal/developer terminology, no
// implementation-limitation exposure, no absolute guarantees, exactly 3 follow-ups. The
// SAFETY rules (no fake scores, no unprovided engines, per-perspective, no 전문용어) are kept.
import { STRUCTURED_OUTPUT_INSTRUCTION } from '@/features/chat/prompts/structuredConsultation';

describe('STRUCTURED_OUTPUT_INSTRUCTION — commercial answer rules', () => {
  const I = STRUCTURED_OUTPUT_INSTRUCTION;

  it('leads with the conclusion and forbids report-length padding (the old "길게, 여러 문단" is gone)', () => {
    expect(I).toContain('핵심 결론을 맨 먼저');
    expect(I).toContain('간결하게');
    expect(I).not.toContain('길게, 여러 문단'); // the previous verbose directive is removed
  });

  it('forbids internal/developer terminology and prescribes natural 학문명', () => {
    expect(I).toContain('내부·개발 용어');
    for (const term of ['엔진', 'SAJU', 'iztro', 'grounding', 'V1']) expect(I).toContain(term); // named in the ban list
    expect(I).toContain('사주에서 보면');
    expect(I).toContain('자미두수에서는');
  });

  it('forbids exposing implementation limitations to the user', () => {
    expect(I).toContain('계산되지 않았습니다');
    expect(I).toContain('구현 한계를 사용자에게 설명하지');
  });

  it('bans absolute/overclaiming guarantees', () => {
    expect(I).toMatch(/무조건 성공|단정·과장/);
  });

  it('requires EXACTLY 3 contextual follow-ups (2 short + 1 deeper), not a 2~4 range', () => {
    expect(I).toContain('정확히 3개');
    expect(I).not.toContain('2~4개');
  });

  it('KEEPS the safety rules (no fake scores, no unprovided engine, per-perspective, no 전문용어)', () => {
    expect(I).toContain('근거 없는 점수');
    expect(I).toContain('기문둔갑');
    expect(I).toMatch(/완전히 일치.*단정하지|각 관점을 따로/);
    expect(I).toMatch(/신강·신약·용신·격국/);
  });
});

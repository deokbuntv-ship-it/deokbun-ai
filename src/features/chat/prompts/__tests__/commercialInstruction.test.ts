// Commercial consultation answer contract (Quality Sprint §3-6/§9/§16). Locks the
// STRUCTURED_OUTPUT_INSTRUCTION rules that turn the answer from a research report into a
// readable consultation: conclusion-first + concise, no internal/developer terminology, no
// implementation-limitation exposure, no absolute guarantees, exactly 3 follow-ups. The
// SAFETY rules (no fake scores, no unprovided engines, per-perspective, no 전문용어) are kept.
import { STRUCTURED_OUTPUT_INSTRUCTION } from '@/features/chat/prompts/structuredConsultation';
import { SYSTEM_CONSTITUTION } from '@/features/chat/prompts/consultationPolicy';

describe('STRUCTURED_OUTPUT_INSTRUCTION — commercial answer rules', () => {
  const I = STRUCTURED_OUTPUT_INSTRUCTION;

  it('leads with the conclusion and forbids report-length padding (the old "길게, 여러 문단" is gone)', () => {
    expect(I).toContain('핵심 결론을 맨 먼저');
    expect(I).toContain('간결하게');
    expect(I).not.toContain('길게, 여러 문단'); // the previous verbose directive is removed
  });

  it('handles multi-year questions as a flow summary + key periods, not N full yearly reports (§13/§14)', () => {
    expect(I).toContain('여러 해');
    expect(I).toContain('전환점');
    expect(I).toContain('연도별 상세는 사용자가 다시 물을 때');
  });

  it('forbids internal/developer terminology and prescribes natural 학문명', () => {
    expect(I).toContain('내부·개발 용어');
    for (const term of ['엔진', 'SAJU', 'iztro', 'grounding', 'V1']) expect(I).toContain(term); // named in the ban list
    expect(I).toContain('사주에서 보면');
    expect(I).toContain('자미두수에서는');
  });

  it('V1.4: bans raw 천간·지지 hanja in the consumer answer, requires translation (§20)', () => {
    expect(I).toContain('천간·지지 한자');
    expect(I).toMatch(/甲乙丙丁/); // the stems are listed as forbidden-to-echo
    expect(I).toMatch(/寅卯/); // and the branches
    expect(I).toMatch(/뜻을 풀어/); // must translate to plain language
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

  // ── Commercial Answer V5 additions ──────────────────────────────────────────
  it('V5: the headline states the conclusion AND the actionable direction (first sentence answers "그래서")', () => {
    expect(I).toMatch(/좋은가|좋은지/);
    expect(I).toContain('그래서 어떤 방향이 유리한지'); // headline carries the "what to do" direction
    expect(I).toContain('사업운은 좋은 편입니다'); // the worked example pattern
  });

  it('V5: bans machine-like Korean filler (§17)', () => {
    expect(I).toContain('종합적으로 볼 때');
    expect(I).toContain('이를 바탕으로');
    expect(I).toMatch(/같은 어미로 끝내지 말/);
  });

  it('V5: length self-scales to the question (simple short, complex fuller) without padding', () => {
    expect(I).toMatch(/단순한 질문/);
    expect(I).toMatch(/짧게/);
    expect(I).toMatch(/억지로 늘이지/);
  });

  it('V5: detail must add NEW value — not restate the core in more words (§15/§19)', () => {
    expect(I).toMatch(/되풀이하지 말|반복하지 말/);
    expect(I).toMatch(/새로운 내용/);
  });

  it('V5: cautions must be specific, not vague fortune-cookie language (§12)', () => {
    expect(I).toMatch(/막연한 말/);
    expect(I).toMatch(/실제로 무엇을 조심/);
  });

  // ── Evidence-Calibrated Decision + Best-Supported-Alternative (P0) ───────────
  it('decision questions lead with a direction (추천/비추천/더 나은 쪽) before the reason (§24/§25)', () => {
    expect(I).toMatch(/결정을 묻는 질문/);
    expect(I).toMatch(/방향.*먼저 밝히|먼저 밝히.*이유/);
  });

  it('best-supported-alternative: never give up on a granularity mismatch — answer the supported scope + alternative (§7/§10)', () => {
    expect(I).toMatch(/답변을 포기하지 마/);
    expect(I).toMatch(/가장 가까운 범위|근거가 있는 가장 가까운/);
    expect(I).toMatch(/대안/);
  });

  it('does NOT blame the user / tell them to re-ask (§9)', () => {
    expect(I).toMatch(/미루지 마|사용자에게 미루지/);
    expect(I).toContain('사용자의 질문은 유효합니다');
  });
});

// The System Constitution carries the mode-independent evidence-calibrated confidence policy (P0-A).
describe('SYSTEM_CONSTITUTION — evidence-calibrated confidence (P0-A §4/§5/§6)', () => {
  const C = SYSTEM_CONSTITUTION;

  it('encourages CLEAR judgment when grounded (not habitual hedging §5)', () => {
    expect(C).toMatch(/근거 안에서는 가능한 한 분명하게 판단|분명하게 판단/);
    expect(C).toMatch(/약하게 말하는 것도 품질 실패/);
  });

  it('distinguishes event-certainty (banned) from suitability assessment (allowed when grounded, §6)', () => {
    expect(C).toMatch(/사건.*확정|반드시 일어난다|반드시 이사합니다/);
    expect(C).toMatch(/적합도 평가/);
  });

  it('Option B (Sprint C.1): comparison questions NEVER authorize a winner/1순위 — discuss each candidate', () => {
    expect(C).toMatch(/승자로 단정하지 마/);
    expect(C).toMatch(/한쪽을 1순위로 정하지/);
    expect(C).toMatch(/각 후보의 적합도|각 후보의 근거를 각각/);
  });

  it('KEEPS the no-fabricated-score/timing safety floor', () => {
    expect(C).toMatch(/근거 없는 점수·등급·별점/);
  });
});

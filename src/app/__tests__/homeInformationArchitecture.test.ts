import { readFileSync } from 'fs';
import { resolve } from 'path';

// Home IA lock (Home IA / consultation-conversion sprint). Source-contract checks (the jest runner is
// node-only — no RN render) that pin the FINAL V1 Home information architecture and the data-driven
// popular-question conversion surface, so neither can silently regress:
//   • the five quick-prompt pills below the composer are gone (composer is the single primary CTA);
//   • section order is greeting+composer → Today → Monthly → 궁합 → 지금 많이 물어보는 질문 → 최근 상담 →
//     최근 운세우편 (궁합 sits ABOVE the popular questions);
//   • the popular-question list is loaded from the service (with curated defaults), not a hard-coded array;
//   • the impression/click funnel is wired and a typed composer question carries no origin.
const home = readFileSync(resolve(__dirname, '..', '(tabs)', 'index.tsx'), 'utf8');

describe('the removed quick-prompt pills stay removed', () => {
  it('has no QUICK_PROMPTS constant or render', () => {
    expect(home).not.toMatch(/QUICK_PROMPTS/);
  });
  it('no longer imports or renders the Chip pill component', () => {
    expect(home).not.toMatch(/\bChip\b/);
    expect(home).not.toMatch(/styles\.quickChip/);
  });
});

describe('popular questions are data-driven, not a hard-coded array', () => {
  it('has no hard-coded POPULAR_QUESTIONS array literal', () => {
    // The old array was `const POPULAR_QUESTIONS: {...}[] = [`. Any such declaration must be gone.
    expect(home).not.toMatch(/const\s+POPULAR_QUESTIONS\s*[:=]/);
  });
  it('loads active questions from the service with a curated fallback', () => {
    // Method chain may wrap across lines — assert the service and the call independently.
    expect(home).toMatch(/popularQuestionService/);
    expect(home).toMatch(/\.listActive\(\)/);
    expect(home).toMatch(/DEFAULT_POPULAR_QUESTIONS/);
  });
  it('renders from the popularQuestions state', () => {
    expect(home).toMatch(/popularQuestions\.map\(/);
  });
});

describe('conversion funnel is wired on Home', () => {
  it('fires deduped impressions and per-tap clicks', () => {
    expect(home).toMatch(/trackPopularQuestionImpression/);
    expect(home).toMatch(/trackPopularQuestionClick/);
  });
  it('carries a stable origin only for popular questions (composer passes none)', () => {
    // The composer is wrapped so it can never forward a second arg as an origin.
    expect(home).toMatch(/onSubmit=\{\(q\)\s*=>\s*startConsult\(q\)\}/);
    // The popular handler passes the analytics key + category as the origin.
    expect(home).toMatch(/startConsult\(q\.questionText,\s*\{\s*key:\s*q\.analyticsKey/);
  });
});

describe('final V1 section order', () => {
  // Unique per-section comment markers (the bare titles recur — e.g. the birthday card also says
  // "이번 달 운세 보기" above the Today section — so anchor on the one-per-section comments instead).
  const order = [
    'QuestionComposer', // composer (primary CTA)
    '{/* 오늘의 운세', // Today
    '{/* 이번 달 운세', // Monthly
    '{/* 궁합', // Compatibility (moved above popular questions)
    '{/* 지금 많이 물어보는 질문', // Popular questions
    '{/* 최근 상담', // Recent consultation
    '{/* 최근 운세우편', // Recent fortune mail
  ];

  it('places every section exactly once, in the final order', () => {
    const indices = order.map((marker) => home.indexOf(marker));
    indices.forEach((idx, i) => expect(idx).toBeGreaterThanOrEqual(0)); // present
    for (let i = 1; i < indices.length; i += 1) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1]); // strictly increasing → correct order
    }
  });

  it('keeps 궁합 above the popular-question list', () => {
    expect(home.indexOf('{/* 궁합')).toBeLessThan(home.indexOf('{/* 지금 많이 물어보는 질문'));
  });
});

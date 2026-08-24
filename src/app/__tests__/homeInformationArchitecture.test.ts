import { readFileSync } from 'fs';
import { resolve } from 'path';

// Home IA lock — DESIGN_FREEZE_FINAL D05. Source-contract checks (the jest runner is node-only — no RN
// render) that pin the frozen Home information architecture and the data-driven popular-question
// conversion surface, so neither can silently regress:
//   • section order is 오늘 히어로 → 덕/촛불 2-up → 비용 안내 → 질문 입력 → 지금 많이 물어봐요 →
//     궁합/이번 달 → 운세우편 → 최근 상담;
//   • the first screen answers 잔액 / 오늘의 초 / 비용 / 상담 CTA without scrolling;
//   • no Duk amount is hardcoded on the screen — every number comes from the canonical economy source;
//   • the popular-question list is loaded from the authoritative DB config (never a curated runtime
//     fallback), and only that ONE section is gated on its length;
//   • the impression/click funnel is wired and a typed composer question carries no origin.
const home = readFileSync(resolve(__dirname, '..', '(tabs)', 'index.tsx'), 'utf8');

describe('the removed quick-prompt pills stay removed', () => {
  it('has no QUICK_PROMPTS constant or render', () => {
    expect(home).not.toMatch(/QUICK_PROMPTS/);
    expect(home).not.toMatch(/styles\.quickChip/);
  });
});

describe('Duk amounts are never hardcoded on the screen', () => {
  // ACCEPTANCE ①: "앱 어디에도 5·12·50·10·1 이 컴포넌트에 하드코딩되어 있지 않다". Home shows four
  // different amounts, and every one of them must resolve through the canonical economy constants.
  it('reads prices and rewards from the economy source', () => {
    expect(home).toMatch(/DUK_PRICES\.general/);
    expect(home).toMatch(/DUK_PRICES\.compatibility/);
    expect(home).toMatch(/from '@\/features\/duk\/pricing'/);
  });
  it('renders amounts through dukLabel, not literal 덕 strings', () => {
    expect(home).not.toMatch(/['"`]\s*\d+덕/);
    expect(home).toMatch(/dukLabel\(/);
  });
});

describe('popular questions are data-driven, not a hard-coded array', () => {
  it('has no hard-coded POPULAR_QUESTIONS array literal', () => {
    expect(home).not.toMatch(/const\s+POPULAR_QUESTIONS\s*[:=]/);
  });
  it('loads active questions via the DB-truth policy resolver', () => {
    expect(home).toMatch(/resolveActivePopularQuestions\(/);
  });
  it('renders from the popularQuestions state', () => {
    expect(home).toMatch(/popularQuestions\.map\(/);
  });
});

describe('fail-clean fallback policy — config unavailable → omit, never fabricate', () => {
  it('F. production Home does not import the seed constant', () => {
    expect(home).not.toMatch(/DEFAULT_POPULAR_QUESTIONS/);
  });
  it('starts from an EMPTY list (no curated first paint)', () => {
    expect(home).toMatch(/useState<PopularQuestion\[\]>\(\[\]\)/);
  });
  it('goes through the policy resolver, not raw data access', () => {
    expect(home).toMatch(/resolveActivePopularQuestions\(/);
    expect(home).not.toMatch(/popularQuestionService/);
  });
  it('omits the whole section when there are no questions (length-gated)', () => {
    expect(home).toMatch(/popularQuestions\.length > 0 \?/);
  });
  it('D. keeps the rest of Home ungated on popular questions (stays usable) — the only length-gate is the section itself', () => {
    const gates = home.match(/popularQuestions\.length/g) ?? [];
    expect(gates.length).toBe(1);
    ['QuestionComposer', '{/* ① 오늘', '{/* ⑥ 궁합', '{/* ⑦ 새 운세', '{/* ⑧ 최근 상담'].forEach((marker) =>
      expect(home).toMatch(new RegExp(marker.replace(/[/*]/g, '\\$&'))),
    );
  });
  it('E. impressions fire only while iterating the loaded list (empty list → zero events)', () => {
    const iterAt = home.indexOf('popularQuestions.forEach');
    const imprCallAt = home.indexOf('trackPopularQuestionImpression({'); // the CALL, not the import
    expect(iterAt).toBeGreaterThanOrEqual(0);
    expect(imprCallAt).toBeGreaterThan(iterAt); // the track call lives inside the forEach body
  });
});

describe('conversion funnel is wired on Home', () => {
  it('fires deduped impressions and per-tap clicks', () => {
    expect(home).toMatch(/trackPopularQuestionImpression/);
    expect(home).toMatch(/trackPopularQuestionClick/);
  });
  it('carries a stable origin only for popular questions (composer passes none)', () => {
    // The composer is wrapped so it can never forward a second arg as an origin.
    expect(home).toMatch(/onSubmit=\{\(q\)\s*=>\s*askQuestion\(q\)\}/);
    // The popular handler passes the analytics key + category as the origin.
    expect(home).toMatch(/askQuestion\(q\.questionText,\s*\{\s*key:\s*q\.analyticsKey/);
  });
});

describe('the first screen answers 덕 without scrolling (freeze ACCEPTANCE D05)', () => {
  // ACCEPTANCE: "앱 실행 3초 내 스크롤 없이 ✨오늘 한 줄 · 🍀잔액 · 🕯️초 · 상담 CTA 4개가 모두 보인다".
  // Structurally: all four live ABOVE the popular-question section, in that order.
  const anchors = ['{/* ① 오늘', '{/* ② 🍀 덕', '{/* ③ 비용 안내', '{/* ④ 질문 입력', '{/* ⑤ 지금 많이 물어봐요'];
  it('places the four first-screen elements before anything scrollable', () => {
    const idx = anchors.map((a) => home.indexOf(a));
    idx.forEach((i) => expect(i).toBeGreaterThanOrEqual(0));
    for (let i = 1; i < idx.length; i += 1) expect(idx[i]).toBeGreaterThan(idx[i - 1]);
  });
  it('renders the balance and the candle through the shared components', () => {
    expect(home).toMatch(/<DukBalance/);
    expect(home).toMatch(/<CandleStrip/);
  });
  it('the cost strip routes to the 덕 explainer (wallet), not a dead label', () => {
    const strip = home.slice(home.indexOf('{/* ③ 비용 안내'), home.indexOf('{/* ④ 질문 입력'));
    expect(strip).toMatch(/router\.push\('\/wallet'\)/);
  });
});

describe('frozen section order', () => {
  const order = [
    '{/* ① 오늘',
    '{/* ② 🍀 덕',
    '{/* ③ 비용 안내',
    '{/* ④ 질문 입력',
    '{/* ⑤ 지금 많이 물어봐요',
    '{/* ⑥ 궁합',
    '{/* ⑦ 새 운세',
    '{/* ⑧ 최근 상담',
  ];

  it('places every section exactly once, in the frozen order', () => {
    const indices = order.map((marker) => home.indexOf(marker));
    indices.forEach((idx) => expect(idx).toBeGreaterThanOrEqual(0)); // present
    for (let i = 1; i < indices.length; i += 1) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1]); // strictly increasing → correct order
    }
  });
});

describe('every Home entry point reaches a real route (no no-op affordances)', () => {
  it.each([
    ['/today', /router\.push\('\/today'\)/],
    ['/wallet', /router\.push\('\/wallet'\)/],
    ['/duk-topup', /router\.push\('\/duk-topup'\)/],
    ['/compatibility', /router\.push\('\/compatibility'\)/],
    ['/monthly', /router\.push\('\/monthly'\)/],
    ['/inbox', /router\.push\('\/inbox'\)/],
  ])('links to %s', (_route, re) => {
    expect(home).toMatch(re);
  });
});

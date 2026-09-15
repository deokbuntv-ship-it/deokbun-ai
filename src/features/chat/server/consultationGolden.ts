// GENERAL-CONSULTATION GOLDEN SET (Answer-Quality Sprint). 64 behavioral-contract cases across the real
// consultation domains (사업/직업/재물/이직/창업/이사/연애/결혼/인간관계/시험/계약) and every answer SHAPE
// (descriptive / suitability / timing / month-exact / month-comparison / best-month / year-comparison /
// best-year / event / guarantee / action / ambiguous-follow-up / no-grounding). Each case pins the DECISION
// CONTRACT the server must produce — NOT prose. The evaluator (consultationQuality) runs the real
// deriveAnswerPlan (ZERO LLM) against these; the Jest suite locks 0 failures as a regression.
//
// Contract in one line: "덕분AI 사용자는 답을 찾으러 온다. 근거가 있으면 명확히 판단하고, 근거가 부족하면 가장 가까운
// 유효 범위로 실제 답을 준다." EVENT certainty (사건 확정) is forbidden; DECISION/적합도 certainty (근거가 있으면)
// is REQUIRED. NONE-support is rare (only when nothing is grounded).
import type { ConsultationMode } from './answerPlan';
import type { GoldenExpect, GoldenGroundingScenario } from './consultationQuality';

export type GoldenShape =
  | 'descriptive'
  | 'suitability'
  | 'suitability-year'
  | 'timing-year'
  | 'timing-year-partial'
  | 'domain-comparison' // non-temporal "A vs B" — recognized, NOT temporally supported (the hardening target)
  | 'month-comparison'
  | 'month-exact'
  | 'month-alternative' // exact month asked, only the year is grounded → fall back to the year
  | 'best-month'
  | 'best-month-alternative'
  | 'year-comparison'
  | 'best-year'
  | 'event' // "~하게 돼?" — event-certainty must be forbidden, decision still given
  | 'guarantee' // "무조건/반드시/100% ~?" — guarantee certainty must be forbidden (the hardening target)
  | 'action'
  | 'no-grounding';

export type GoldenCase = {
  id: string;
  question: string;
  domain: string;
  shape: GoldenShape;
  mode?: ConsultationMode;
  scenario: GoldenGroundingScenario;
  expect: GoldenExpect;
};

// ── grounding builders (year*100+month for months) ───────────────────────────
const AV = (years: number[], months: number[] = [], referenceYear?: number): GoldenGroundingScenario => ({
  available: true,
  years,
  ...(months.length ? { months } : {}),
  ...(referenceYear !== undefined ? { referenceYear } : {}),
});
const NA: GoldenGroundingScenario = { available: false };
const mo = (year: number, list: number[]): number[] => list.map((m) => year * 100 + m);
const year12 = (year: number): number[] => Array.from({ length: 12 }, (_, i) => year * 100 + (i + 1));

export const GOLDEN_CASES: GoldenCase[] = [
  // ── A. descriptive, non-temporal, grounded → DIRECT / STRONG (NOT overhedged) ──
  { id: 'A1', question: '내 사업운이 궁금해', domain: '사업', shape: 'descriptive', scenario: AV([2026]),
    expect: { intents: ['DESCRIPTIVE'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'A2', question: '제 재물운이 어떤지 알고 싶어요', domain: '재물', shape: 'descriptive', scenario: AV([2026]),
    expect: { intents: ['DESCRIPTIVE'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'A3', question: '내 직업적 성향을 알려줘', domain: '직업', shape: 'descriptive', scenario: AV([2026]),
    expect: { intents: ['DESCRIPTIVE'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'A4', question: '제 대인관계 기질이 궁금합니다', domain: '인간관계', shape: 'descriptive', scenario: AV([2026]),
    expect: { intents: ['DESCRIPTIVE'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'A5', question: '내 연애 스타일이 궁금해', domain: '연애', shape: 'descriptive', scenario: AV([2026]),
    expect: { intents: ['DESCRIPTIVE'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },

  // ── B. suitability, non-temporal, grounded → SUITABILITY / DIRECT / STRONG ──
  { id: 'B1', question: '지금 이직해도 괜찮을까?', domain: '이직', shape: 'suitability', scenario: AV([2026]),
    expect: { intents: ['SUITABILITY'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'], forbidEventCertainty: false } },
  { id: 'B2', question: '지금 창업해도 될까요?', domain: '창업', shape: 'suitability', scenario: AV([2026]),
    expect: { intents: ['SUITABILITY'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'B3', question: '이 계약 진행해도 괜찮을까?', domain: '계약', shape: 'suitability', scenario: AV([2026]),
    expect: { intents: ['SUITABILITY'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'B4', question: '이 사람과 동업해도 괜찮을까요?', domain: '인간관계', shape: 'suitability', scenario: AV([2026]),
    expect: { intents: ['SUITABILITY'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'B5', question: '카페 창업 지금 시작해도 될까요?', domain: '창업', shape: 'suitability', scenario: AV([2026]),
    expect: { intents: ['SUITABILITY'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },

  // ── B-year. suitability WITH a grounded year → SUITABILITY + TIMING / YEAR / DIRECT / STRONG ──
  { id: 'C1', question: '올해 이사하면 좋을까?', domain: '이사', shape: 'suitability-year', scenario: AV([2026], [], 2026),
    expect: { intents: ['SUITABILITY', 'TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'C2', question: '내년에 결혼하면 좋을까요?', domain: '결혼', shape: 'suitability-year', scenario: AV([2026, 2027], [], 2026),
    expect: { intents: ['SUITABILITY', 'TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'C3', question: '2027년에 이직하면 어떨까?', domain: '이직', shape: 'suitability-year', scenario: AV([2026, 2027], [], 2026),
    expect: { intents: ['SUITABILITY', 'TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'C4', question: '2027년에 이사 가도 괜찮을까?', domain: '이사', shape: 'suitability-year', scenario: AV([2026, 2027], [], 2026),
    expect: { intents: ['SUITABILITY', 'TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },

  // ── D. timing (year), grounded → TIMING / YEAR / DIRECT / STRONG ──
  { id: 'D1', question: '2028년 재물운이 어떤지 봐줘', domain: '재물', shape: 'timing-year', scenario: AV([2028], [], 2028),
    expect: { intents: ['TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'D2', question: '앞으로 3년 사업운 흐름을 알려줘', domain: '사업', shape: 'timing-year', scenario: AV([2026, 2027, 2028], [], 2026),
    expect: { intents: ['TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'D3', question: '2027년부터 2029년까지 재물운 흐름 알려줘', domain: '재물', shape: 'timing-year', scenario: AV([2027, 2028, 2029], [], 2027),
    expect: { intents: ['TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'D4', question: '다가오는 2년 안에 이사 시기 괜찮은 해 있을까?', domain: '이사', shape: 'timing-year', scenario: AV([2026, 2027], [], 2026),
    expect: { intents: ['TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },

  // ── D-partial. year requested but NOT grounded (adjacent years are) → PARTIAL / MODERATE ──
  { id: 'E1', question: '2030년에 이직 어떨까?', domain: '이직', shape: 'timing-year-partial', scenario: AV([2026, 2027], [], 2026),
    expect: { intents: ['SUITABILITY', 'TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'PARTIAL', assertivenessIn: ['MODERATE'] } },
  { id: 'E2', question: '2035년 재물운 궁금해', domain: '재물', shape: 'timing-year-partial', scenario: AV([2026], [], 2026),
    expect: { intents: ['TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'PARTIAL', assertivenessIn: ['MODERATE'] } },
  { id: 'E3', question: '2029년 이직운 어때?', domain: '이직', shape: 'timing-year-partial', scenario: AV([2026, 2027], [], 2026),
    expect: { intents: ['SUITABILITY', 'TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'PARTIAL', assertivenessIn: ['MODERATE'] } },
  { id: 'E4', question: '앞으로 5년 사업운 알려줘', domain: '사업', shape: 'timing-year-partial', scenario: AV([2026, 2027], [], 2026),
    expect: { intents: ['TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'PARTIAL', assertivenessIn: ['MODERATE'] } },

  // ── F. NON-TEMPORAL DOMAIN COMPARISON — recognized as COMPARISON, but NOT temporally supported ──
  //     (the answer discusses both honestly; it must NOT fabricate a temporal "winner"). HARDENING TARGET.
  { id: 'F1', question: '직장 다니는 것과 사업하는 것 중에 뭐가 더 좋을까?', domain: '직업', shape: 'domain-comparison', scenario: AV([2026]),
    expect: { intents: ['COMPARISON'], comparisonSupported: false, supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'F2', question: '취업할까 창업할까 고민이야, 뭐가 나아?', domain: '창업', shape: 'domain-comparison', scenario: AV([2026]),
    expect: { intents: ['COMPARISON', 'ACTION'], comparisonSupported: false, supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'F3', question: '지금 집 유지가 나아, 이사가 나아?', domain: '이사', shape: 'domain-comparison', scenario: AV([2026]),
    expect: { intents: ['COMPARISON'], comparisonSupported: false, supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'F4', question: '지금 사람이랑 계속 만나는 게 나아 헤어지는 게 나아?', domain: '연애', shape: 'domain-comparison', scenario: AV([2026]),
    expect: { intents: ['COMPARISON'], comparisonSupported: false, supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },

  // ── G. month-vs-month comparison — BOTH grounded → candidates supported / STRONG (Option B: discuss each,
  //     NO server winner, Sprint C §9-§11) ; ONE grounded → not supported ──
  { id: 'G1', question: '2027년 3월이 좋아 7월이 좋아?', domain: '이사', shape: 'month-comparison', scenario: AV([2027], mo(2027, [3, 7]), 2027),
    expect: { intents: ['COMPARISON'], requestedGranularity: 'MONTH', resolvedGranularity: 'MONTH', supportLevel: 'DIRECT', comparisonSupported: true, assertivenessIn: ['STRONG'] } },
  { id: 'G2', question: '2028년 5월 결혼 vs 2028년 11월 결혼 뭐가 좋아?', domain: '결혼', shape: 'month-comparison', scenario: AV([2028], mo(2028, [5, 11]), 2028),
    expect: { intents: ['COMPARISON'], requestedGranularity: 'MONTH', resolvedGranularity: 'MONTH', supportLevel: 'DIRECT', comparisonSupported: true, assertivenessIn: ['STRONG'] } },
  { id: 'G3', question: '2027년 3월이랑 9월 중에 언제가 더 좋아?', domain: '이직', shape: 'month-comparison', scenario: AV([2027], mo(2027, [3]), 2027),
    expect: { intents: ['COMPARISON'], requestedGranularity: 'MONTH', resolvedGranularity: 'MONTH', supportLevel: 'PARTIAL', comparisonSupported: false, assertivenessIn: ['MODERATE'] } },

  // ── H. exact single month, grounded → SUITABILITY + TIMING / MONTH / DIRECT / STRONG ──
  { id: 'H1', question: '2027년 4월에 이사해도 될까?', domain: '이사', shape: 'month-exact', scenario: AV([2027], mo(2027, [4]), 2027),
    expect: { intents: ['SUITABILITY', 'TIMING'], requestedGranularity: 'MONTH', resolvedGranularity: 'MONTH', supportLevel: 'DIRECT', comparisonSupported: false, assertivenessIn: ['STRONG'] } },
  { id: 'H2', question: '2026년 12월에 계약하면 괜찮을까?', domain: '계약', shape: 'month-exact', scenario: AV([2026], mo(2026, [12]), 2026),
    expect: { intents: ['SUITABILITY', 'TIMING'], requestedGranularity: 'MONTH', resolvedGranularity: 'MONTH', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'H3', question: '2027년 10월에 결혼해도 괜찮을까요?', domain: '결혼', shape: 'month-exact', scenario: AV([2027], mo(2027, [10]), 2027),
    expect: { intents: ['SUITABILITY', 'TIMING'], requestedGranularity: 'MONTH', resolvedGranularity: 'MONTH', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'H4', question: '2027년 3월에 이직해도 될까? 아니면 그냥 있을까?', domain: '이직', shape: 'month-exact', scenario: AV([2027], mo(2027, [3]), 2027),
    expect: { intents: ['SUITABILITY', 'TIMING'], requestedGranularity: 'MONTH', resolvedGranularity: 'MONTH', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },

  // ── I. exact month asked, month NOT grounded but YEAR is → best-supported ALTERNATIVE / LIMITED ──
  { id: 'J1', question: '2027년 4월에 이사해도 될까?', domain: '이사', shape: 'month-alternative', scenario: AV([2026, 2027], [], 2026),
    expect: { intents: ['SUITABILITY', 'TIMING'], requestedGranularity: 'MONTH', resolvedGranularity: 'YEAR', supportLevel: 'ALTERNATIVE', assertivenessIn: ['LIMITED'] } },
  { id: 'J2', question: '2027년 6월 시험 붙을까?', domain: '시험', shape: 'month-alternative', scenario: AV([2027], [], 2027),
    expect: { intents: ['TIMING'], requestedGranularity: 'MONTH', resolvedGranularity: 'YEAR', supportLevel: 'ALTERNATIVE', assertivenessIn: ['LIMITED'] } },

  // ── K. best-month ranking — all 12 grounded → candidates supported / STRONG (Option B: describe each,
  //     NO 1순위/best manufactured, Sprint C §9-§11) ; none grounded → alternative ──
  { id: 'K1', question: '2027년에 이사 언제 하는 게 제일 좋아?', domain: '이사', shape: 'best-month', scenario: AV([2027], year12(2027), 2027),
    expect: { intents: ['RANKING'], requestedGranularity: 'MONTH', resolvedGranularity: 'MONTH', supportLevel: 'DIRECT', rankingSupported: true, assertivenessIn: ['STRONG'] } },
  { id: 'K2', question: '그럼 언제가 좋아?', domain: '사업', shape: 'best-month', scenario: AV([2026], year12(2026), 2026),
    expect: { intents: ['RANKING'], requestedGranularity: 'MONTH', resolvedGranularity: 'MONTH', supportLevel: 'DIRECT', rankingSupported: true, assertivenessIn: ['STRONG'] } },
  { id: 'K3', question: '2027년 상반기 중 이사 언제가 좋아?', domain: '이사', shape: 'best-month', scenario: AV([2027], mo(2027, [1, 2, 3, 4, 5, 6]), 2027),
    expect: { intents: ['RANKING'], requestedGranularity: 'MONTH', resolvedGranularity: 'MONTH', supportLevel: 'DIRECT', rankingSupported: true, assertivenessIn: ['STRONG'] } },
  { id: 'K4', question: '2027년 하반기 재물운 어때?', domain: '재물', shape: 'best-month', scenario: AV([2027], mo(2027, [7, 8, 9, 10, 11, 12]), 2027),
    expect: { intents: ['RANKING'], requestedGranularity: 'MONTH', resolvedGranularity: 'MONTH', supportLevel: 'DIRECT', rankingSupported: true, assertivenessIn: ['STRONG'] } },
  { id: 'K5', question: '2027년 중에 재물운 가장 좋은 달이 언제야?', domain: '재물', shape: 'best-month-alternative', scenario: AV([2027], [], 2027),
    expect: { intents: ['RANKING'], requestedGranularity: 'MONTH', resolvedGranularity: 'YEAR', supportLevel: 'ALTERNATIVE', rankingSupported: false, assertivenessIn: ['LIMITED'] } },
  { id: 'K6', question: '언제 이직하는 게 가장 좋아?', domain: '직업', shape: 'best-month-alternative', scenario: AV([2026], [], 2026),
    expect: { intents: ['RANKING'], requestedGranularity: 'MONTH', resolvedGranularity: 'YEAR', supportLevel: 'ALTERNATIVE', rankingSupported: false, assertivenessIn: ['LIMITED'] } },

  // ── L. year comparison / best-year ──
  { id: 'L1', question: '2027년이 나아 2028년이 나아?', domain: '이직', shape: 'year-comparison', scenario: AV([2027, 2028], [], 2027),
    expect: { intents: ['COMPARISON'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'DIRECT', comparisonSupported: true, assertivenessIn: ['STRONG'] } },
  { id: 'L2', question: '2027년하고 2028년 중 사업 확장은 어느 해가 더 좋아?', domain: '사업', shape: 'year-comparison', scenario: AV([2027], [], 2027),
    expect: { intents: ['COMPARISON', 'ACTION'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'PARTIAL', comparisonSupported: false, assertivenessIn: ['MODERATE'] } },
  { id: 'L3', question: '앞으로 3년 중 재물운이 가장 좋은 해는?', domain: '재물', shape: 'best-year', scenario: AV([2026, 2027, 2028], [], 2026),
    expect: { intents: ['RANKING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'DIRECT', rankingSupported: true, assertivenessIn: ['STRONG'] } },

  // ── M. EVENT prediction — forbid event certainty, still a usable timing/suitability plan ──
  { id: 'M1', question: '2027년에 이사하게 될까?', domain: '이사', shape: 'event', scenario: AV([2026, 2027], [], 2026),
    expect: { intents: ['EVENT_PREDICTION', 'TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'DIRECT', forbidEventCertainty: true, assertivenessIn: ['STRONG'] } },
  { id: 'M2', question: '내년에 시험 합격하게 되나요?', domain: '시험', shape: 'event', scenario: AV([2026, 2027], [], 2026),
    expect: { intents: ['EVENT_PREDICTION', 'TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'DIRECT', forbidEventCertainty: true, assertivenessIn: ['STRONG'] } },
  { id: 'M3', question: '이 사업이 올해 성공하게 될까요?', domain: '사업', shape: 'event', scenario: AV([2026], [], 2026),
    expect: { intents: ['EVENT_PREDICTION', 'TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'DIRECT', forbidEventCertainty: true, assertivenessIn: ['STRONG'] } },
  { id: 'M4', question: '그 사람이랑 잘 이뤄지나요?', domain: '연애', shape: 'event', scenario: AV([2026]),
    expect: { intents: ['EVENT_PREDICTION'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', forbidEventCertainty: true, assertivenessIn: ['STRONG'] } },

  // ── N. GUARANTEE-seeking — must forbid certainty even though it is not phrased as "~하게 돼". HARDENING TARGET.
  { id: 'N1', question: '이 사업 무조건 성공해?', domain: '사업', shape: 'guarantee', scenario: AV([2026]),
    expect: { intents: ['EVENT_PREDICTION'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', forbidEventCertainty: true, assertivenessIn: ['STRONG'] } },
  { id: 'N2', question: '저 이번 시험에 반드시 붙나요?', domain: '시험', shape: 'guarantee', scenario: AV([2026]),
    expect: { intents: ['EVENT_PREDICTION'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', forbidEventCertainty: true, assertivenessIn: ['STRONG'] } },
  { id: 'N3', question: '올해 안에 100% 부자 될까요?', domain: '재물', shape: 'guarantee', scenario: AV([2026], [], 2026),
    expect: { intents: ['EVENT_PREDICTION', 'TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'YEAR', supportLevel: 'DIRECT', forbidEventCertainty: true, assertivenessIn: ['STRONG'] } },
  { id: 'N4', question: '우리 꼭 결혼하게 되나요?', domain: '연애', shape: 'guarantee', scenario: AV([2026]),
    expect: { intents: ['EVENT_PREDICTION'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', forbidEventCertainty: true, assertivenessIn: ['STRONG'] } },

  // ── O. action decisions → ACTION / DIRECT / STRONG ──
  { id: 'O1', question: '지금 사업을 접어야 할까?', domain: '사업', shape: 'action', scenario: AV([2026]),
    expect: { intents: ['ACTION'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'O2', question: '지금 회사 계속 다녀야 할까 말까?', domain: '직업', shape: 'action', scenario: AV([2026]),
    expect: { intents: ['ACTION'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'O3', question: '사업을 더 확장해야 할까?', domain: '창업', shape: 'action', scenario: AV([2026]),
    expect: { intents: ['ACTION'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'O4', question: '지금 회사를 옮길까 말까 고민이에요', domain: '이직', shape: 'action', scenario: AV([2026]),
    expect: { intents: ['ACTION'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },

  // ── P. ambiguous / explanation follow-ups, grounded → still answerable (DESCRIPTIVE / DIRECT) ──
  { id: 'P1', question: '왜 그래?', domain: '재물', shape: 'descriptive', scenario: AV([2026]),
    expect: { intents: ['DESCRIPTIVE'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'P2', question: '이번 주에 계약해도 될까?', domain: '계약', shape: 'suitability', scenario: AV([2026]),
    expect: { intents: ['SUITABILITY'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'P3', question: '제 돈 그릇이 큰 편인가요?', domain: '재물', shape: 'descriptive', scenario: AV([2026]),
    expect: { intents: ['DESCRIPTIVE'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },
  { id: 'P4', question: '제 적성에 맞는 일이 궁금해요', domain: '직업', shape: 'descriptive', scenario: AV([2026]),
    expect: { intents: ['DESCRIPTIVE'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'DIRECT', assertivenessIn: ['STRONG'] } },

  // ── Q. NO grounding at all → NONE support / LIMITED (never fabricate confidence) ──
  { id: 'Q1', question: '2027년 2월에 이사하면 어때?', domain: '이사', shape: 'no-grounding', scenario: NA,
    expect: { intents: ['SUITABILITY', 'TIMING'], requestedGranularity: 'MONTH', resolvedGranularity: 'NONE', supportLevel: 'NONE', comparisonSupported: false, rankingSupported: false, assertivenessIn: ['LIMITED'] } },
  { id: 'Q2', question: '내 사업운 어때?', domain: '사업', shape: 'no-grounding', scenario: NA,
    expect: { intents: ['SUITABILITY'], requestedGranularity: 'NONE', resolvedGranularity: 'NONE', supportLevel: 'NONE', assertivenessIn: ['LIMITED'] } },
  { id: 'Q3', question: '2028년에 좋은 인연 만날까?', domain: '연애', shape: 'no-grounding', scenario: NA,
    expect: { intents: ['TIMING'], requestedGranularity: 'YEAR', resolvedGranularity: 'NONE', supportLevel: 'NONE', assertivenessIn: ['LIMITED'] } },
];

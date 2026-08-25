// The MONTHLY generation orchestrator (§28/§34) — the runtime-neutral single-LLM-call path, mirroring
// buildTodayFortune. It CALCULATES nothing new beyond the deterministic monthly evidence + plan; the LLM only
// verbalizes the plan, and the SERVER attaches the authoritative tier / mode / domain statuses. The SERVER
// owns the target month (deps.nowEpochSeconds = receipt time). Exactly ONE callLLM (§28) — no critic, rewrite,
// judge, or daily aggregation. Output is parsed, capped, de-duplicated (§35, no extra LLM), and scrubbed of
// leaked engine labels, raw 간지, fabricated event guarantees (§37), and unsupported exact-date claims (§24).
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider, HistoricalTimezoneResolver } from '@/features/interpretation';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import { containsRawGanji, stripEngineLabels } from '@/features/chat/presentation/commercialText';
import { buildMonthlyFortuneEvidence } from '@/features/monthly/engine/monthlyEvidence';
import { deriveMonthlyPlan, type MonthlyPlan } from '@/features/monthly/engine/monthlyPlan';
import { buildMonthlyFortunePrompt } from '@/features/monthly/server/monthlyFortunePrompt';
import { MONTHLY_POLICY_VERSION, type MonthlyFollowUp, type MonthlyFortuneResult, type MonthlyOverallTier } from '@/features/monthly/types';

export type MonthlyFortuneRequest = { birthInput: BirthInfoDraft };

export type MonthlyFortuneDeps = {
  digestProvider: DigestProvider;
  historicalTimezoneResolver?: HistoricalTimezoneResolver;
  /** SERVER receipt epoch (seconds) — the authority for the current target month (never a client month). */
  nowEpochSeconds: number;
  callLLM: (messages: LLMMessage[]) => Promise<string>;
};

export type MonthlyFortuneServerResult =
  | {
      ok: true;
      year: number;
      month: number;
      overallTier: MonthlyOverallTier;
      result: MonthlyFortuneResult;
      policyVersion: string;
      evidenceVersion: string;
      planVersion: string;
    }
  | { ok: false; reason: 'EVIDENCE_UNAVAILABLE' | 'LLM_FAILED' | 'INVALID_OUTPUT'; year: number; month: number };

const clean = (s: unknown): string => (typeof s === 'string' ? stripEngineLabels(s).trim() : '');

function firstSentence(s: string): string {
  const m = /^[^.!?。\n]*[.!?。]?/.exec(s.trim());
  return (m ? m[0] : s).trim();
}

function toDisplayLabel(rawLabel: string, question: string): string {
  const base = (rawLabel || question).trim().replace(/[?？.!。·\s]+$/u, '');
  return base.length <= 20 ? base : `${base.slice(0, 18).trim()}…`;
}

// Deterministic semantic category (§35 — normalize categories, no embeddings, no LLM). Drops cards that
// restate one underlying signal. `(?<!마)무리` so 마무리(finishing) ≠ 무리(overdoing).
const CATEGORY_PATTERNS: { key: string; re: RegExp }[] = [
  { key: 'RUSH', re: /서두르|성급|(?<!마)무리|급하게|급한|밀어붙이|조급/ },
  { key: 'ORGANIZE', re: /정리|점검|마무리|재점검|정돈|조건을?\s*(다시\s*)?확인/ },
  { key: 'PACE', re: /속도|천천히|여유|리듬|쉬어|휴식|무리하지/ },
  { key: 'RELATION', re: /관계|사람|소통|말을?\s*아끼|경청|협의|대화/ },
  { key: 'DECIDE', re: /결정|판단|선택|계약|서명|협상/ },
  { key: 'MONEY', re: /지출|비용|예산|투자|자금|씀씀이|수익/ },
  { key: 'EXPAND', re: /확장|추진|도전|시작|새로운\s*일|벌이/ },
];
function semanticCategory(text: string): string | null {
  for (const c of CATEGORY_PATTERNS) if (c.re.test(text)) return c.key;
  return null;
}

// NARROW, high-precision event-guarantee detector (§37). Matches only explicit "X will happen" guarantees.
const EVENT_GUARANTEE =
  /(돈|재물|자금|목돈)[^.\n]{0,8}(들어옵니다|들어와요|생깁니다|생겨요)|(합격|당첨|승진|성사|성공|이직|퇴사)(합니다|됩니다|해요|돼요)|(연락|전화|고백)[^.\n]{0,8}(옵니다|와요|받습니다)|(헤어집니다|이혼합니다|사고가\s*납니다)/;
export function containsEventGuarantee(text: string): boolean {
  return EVENT_GUARANTEE.test(text);
}

// NARROW exact-DATE / week detector (§24/§82). Monthly evidence grounds a MONTH; a specific day/week/date is
// finer than the evidence supports, so a claim like "17~21일이 가장 좋다" is fail-closed. Soft month-granular
// hints (초순/중순/하순) are NOT rejected — they stay month-level.
const UNSUPPORTED_DATE =
  /\d{1,2}\s*[~\-–]\s*\d{1,2}\s*일|\d{1,2}\s*일[^\d]{0,8}(가장|제일|최고|좋|유리|추천|길|적합)|\d{1,2}\s*월\s*\d{1,2}\s*일|(첫째|둘째|셋째|넷째|마지막)\s*주[^\d]{0,8}(가장|제일|좋|유리|추천)/;
export function containsUnsupportedDatePrecision(text: string): boolean {
  return UNSUPPORTED_DATE.test(text);
}

// Parse + validate + cap + de-dup + scrub the model JSON into the compact MonthlyFortuneResult. The tier,
// mode, and domain statuses are the SERVER's (from `plan`), never the model's. Returns null on unusable output.
export function parseMonthlyFortune(raw: string, plan: MonthlyPlan): MonthlyFortuneResult | null {
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== 'object') return null;
  const o = obj as Record<string, unknown>;

  const headline = clean(o.headline);
  const overallSummary = clean(o.overallSummary);
  if (headline.length === 0 || overallSummary.length === 0) return null;
  const verdict = clean(o.verdict) || firstSentence(overallSummary);

  const seen = new Set<string>();
  const opportunities: MonthlyFortuneResult['opportunities'] = [];
  for (const h of Array.isArray(o.opportunities) ? o.opportunities : []) {
    const hh = (h ?? {}) as Record<string, unknown>;
    const domain = clean(hh.domain);
    const title = clean(hh.title);
    const body = clean(hh.body);
    if (title.length === 0 || body.length === 0) continue;
    const cat = semanticCategory(`${title} ${body}`);
    if (cat && seen.has(cat)) continue;
    if (cat) seen.add(cat);
    opportunities.push({ domain, title, body });
    if (opportunities.length >= plan.maxOpportunities) break;
  }

  const covered = new Set<string>([...seen]);
  for (const t of [verdict, headline]) {
    const c = semanticCategory(t);
    if (c) covered.add(c);
  }
  const cautions: MonthlyFortuneResult['cautions'] = [];
  for (const c of Array.isArray(o.cautions) ? o.cautions : []) {
    const cc = (c ?? {}) as Record<string, unknown>;
    const title = clean(cc.title);
    const body = clean(cc.body);
    if (title.length === 0 || body.length === 0) continue;
    const cat = semanticCategory(`${title} ${body}`);
    if (cat && covered.has(cat)) continue;
    if (cat) covered.add(cat);
    cautions.push({ title, body });
    if (cautions.length >= plan.maxCautions) break;
  }

  // Actions — concrete steps; de-dup by category so the plan is not one idea repeated.
  const actionSeen = new Set<string>();
  const actions: string[] = [];
  for (const a of Array.isArray(o.actions) ? o.actions : []) {
    const text = clean(a);
    if (text.length === 0) continue;
    const cat = semanticCategory(text);
    if (cat && actionSeen.has(cat)) continue;
    if (cat) actionSeen.add(cat);
    actions.push(text);
    if (actions.length >= plan.maxActions) break;
  }

  const followUps: MonthlyFollowUp[] = [];
  const rawFollowUps = Array.isArray(o.followUps) ? o.followUps : Array.isArray(o.consultationPrompts) ? o.consultationPrompts : [];
  for (const f of rawFollowUps) {
    let displayLabel = '';
    let question = '';
    if (typeof f === 'string') {
      question = clean(f);
    } else if (f && typeof f === 'object') {
      const ff = f as Record<string, unknown>;
      displayLabel = clean(ff.displayLabel);
      question = clean(ff.question);
    }
    if (question.length === 0) continue;
    followUps.push({ displayLabel: toDisplayLabel(displayLabel, question), question });
    if (followUps.length >= 3) break;
  }

  // A month result with no load-bearing content is filler — reject.
  if (verdict.length === 0 || actions.length === 0) return null;

  const surfaced = [
    headline, verdict, overallSummary,
    ...opportunities.flatMap((h) => [h.title, h.body]),
    ...cautions.flatMap((c) => [c.title, c.body]),
    ...actions,
    ...followUps.flatMap((f) => [f.displayLabel, f.question]),
  ].join(' ');
  if (containsRawGanji(surfaced)) return null;
  if (containsEventGuarantee(surfaced)) return null;
  if (containsUnsupportedDatePrecision(surfaced)) return null;

  return {
    headline,
    verdict,
    overallSummary,
    overallTier: plan.overallTier,
    primaryMode: plan.primaryMode,
    primaryModeLabel: plan.primaryModeLabel,
    domainSignals: plan.domainSignals,
    opportunities,
    cautions,
    actions,
    followUps,
    // Server-owned within-month transition (§5) — the LLM never emits the 節 date; it comes from the plan.
    transition: plan.transition
      ? {
          transitionDate: plan.transition.transitionCivilDate,
          early: { tierLabel: plan.transition.early.tier, modeLabel: plan.transition.early.modeLabel },
          later: { tierLabel: plan.transition.later.tier, modeLabel: plan.transition.later.modeLabel },
        }
      : null,
    // Deterministic, server-owned (§21/§9) — the LLM never authors these.
    evidence: plan.evidence,
    backgroundSummary: plan.backgroundSummary ?? null,
  };
}

export async function buildMonthlyFortune(
  request: MonthlyFortuneRequest,
  deps: MonthlyFortuneDeps,
): Promise<MonthlyFortuneServerResult> {
  const evidence = await buildMonthlyFortuneEvidence(
    { birthInfo: request.birthInput },
    { digestProvider: deps.digestProvider, historicalTimezoneResolver: deps.historicalTimezoneResolver, nowEpochSeconds: deps.nowEpochSeconds },
  );
  if (!evidence.available) return { ok: false, reason: 'EVIDENCE_UNAVAILABLE', year: evidence.year, month: evidence.month };

  const plan = deriveMonthlyPlan(evidence);
  const messages = buildMonthlyFortunePrompt(plan);

  let raw: string;
  try {
    raw = await deps.callLLM(messages);
  } catch {
    return { ok: false, reason: 'LLM_FAILED', year: plan.year, month: plan.month };
  }

  const result = parseMonthlyFortune(raw, plan);
  if (result === null) return { ok: false, reason: 'INVALID_OUTPUT', year: plan.year, month: plan.month };

  return {
    ok: true,
    year: plan.year,
    month: plan.month,
    overallTier: plan.overallTier,
    result,
    policyVersion: MONTHLY_POLICY_VERSION,
    evidenceVersion: plan.evidenceVersion,
    planVersion: plan.planVersion,
  };
}

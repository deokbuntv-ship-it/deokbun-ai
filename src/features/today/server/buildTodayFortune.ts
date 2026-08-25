// The DAILY generation orchestrator (§15) — the runtime-neutral single-LLM-call path, mirroring
// buildServerConsultation. It CALCULATES nothing new beyond the deterministic daily evidence + plan; the LLM
// only verbalizes the plan, and the SERVER attaches the authoritative tier / mode / domain statuses. The
// SERVER owns the date (deps.nowEpochSeconds = receipt time). Exactly ONE callLLM. Output is parsed, capped
// (≤3 highlights / ≤2 cautions / 3 follow-ups), de-duplicated (§25-§27, no extra LLM), and scrubbed of any
// leaked engine labels, raw 간지, or fabricated event guarantees (§54).
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider, HistoricalTimezoneResolver } from '@/features/interpretation';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import { containsRawGanji, stripEngineLabels } from '@/features/chat/presentation/commercialText';
import { buildTodayFortuneEvidence } from '@/features/today/engine/todayEvidence';
import { deriveDailyPlan, type DailyPlan } from '@/features/today/engine/todayPlan';
import { buildTodayFortunePrompt } from '@/features/today/server/todayFortunePrompt';
import { TODAY_POLICY_VERSION, type DailyFollowUp, type DailyFortuneResult, type DailyOverallTone } from '@/features/today/types';

export type TodayFortuneRequest = { birthInput: BirthInfoDraft };

export type TodayFortuneDeps = {
  digestProvider: DigestProvider;
  historicalTimezoneResolver?: HistoricalTimezoneResolver;
  /** SERVER receipt epoch (seconds) — the authority for the fortune_date. */
  nowEpochSeconds: number;
  callLLM: (messages: LLMMessage[]) => Promise<string>;
};

export type TodayFortuneServerResult =
  | {
      ok: true;
      fortuneDate: string;
      overallTone: DailyOverallTone;
      result: DailyFortuneResult;
      policyVersion: string;
      evidenceVersion: string;
      planVersion: string;
    }
  | { ok: false; reason: 'EVIDENCE_UNAVAILABLE' | 'LLM_FAILED' | 'INVALID_OUTPUT'; fortuneDate: string };

const clean = (s: unknown): string => (typeof s === 'string' ? stripEngineLabels(s).trim() : '');

// First sentence of the summary — the verdict fallback if the model omits one, so a record always answers the
// day (never an empty verdict field).
function firstSentence(s: string): string {
  const m = /^[^.!?。\n]*[.!?。]?/.exec(s.trim());
  return (m ? m[0] : s).trim();
}

// A SHORT chip label (§37/§38): strip trailing punctuation, cap length so chips never truncate on mobile.
function toDisplayLabel(rawLabel: string, question: string): string {
  const base = (rawLabel || question).trim().replace(/[?？.!。·\s]+$/u, '');
  return base.length <= 20 ? base : `${base.slice(0, 18).trim()}…`;
}

// Deterministic semantic category of a piece of prose (§26 — normalize categories, no embeddings, no LLM).
// Used to drop cards that restate one underlying signal as several (the "four white cards, one idea" problem).
const CATEGORY_PATTERNS: { key: string; re: RegExp }[] = [
  { key: 'RUSH', re: /서두르|성급|(?<!마)무리|급하게|급한|밀어붙이|조급/ }, // (?<!마) so 마무리(finishing) ≠ 무리(overdoing)
  { key: 'ORGANIZE', re: /정리|점검|마무리|재점검|정돈|조건을?\s*(다시\s*)?확인/ },
  { key: 'PACE', re: /속도|천천히|여유|리듬|쉬어|휴식|무리하지/ },
  { key: 'LISTEN', re: /말을?\s*아끼|경청|듣는|들어주|한 발 물러/ },
  { key: 'DECIDE', re: /결정|판단|선택|확답|계약서|서명/ },
  { key: 'MONEY', re: /지출|비용|예산|투자|자금|씀씀이/ },
];
function semanticCategory(text: string): string | null {
  for (const c of CATEGORY_PATTERNS) if (c.re.test(text)) return c.key;
  return null;
}

// NARROW, high-precision event-guarantee detector (§54). Matches only explicit "X will happen" guarantees —
// never suitability phrasing ("~하기에 좋은 흐름"), so grounded prose is not falsely rejected.
const EVENT_GUARANTEE =
  /(돈|재물|자금|목돈)[^.\n]{0,8}(들어옵니다|들어와요|들어옴|생깁니다|생겨요)|(합격|당첨|승진|성사|성공)(합니다|됩니다|해요|돼요)|(연락|전화|고백)[^.\n]{0,8}(옵니다|와요|받습니다|올\s*거예요)/;
export function containsEventGuarantee(text: string): boolean {
  return EVENT_GUARANTEE.test(text);
}

// Parse + validate + cap + de-dup + scrub the model JSON into the compact DailyFortuneResult. The tier, mode,
// and domain statuses are the SERVER's (from `plan`), never the model's. Returns null on unusable output
// (§26/§54 — never persist filler, leaked 간지, or a fabricated guarantee).
export function parseDailyFortune(raw: string, plan: DailyPlan): DailyFortuneResult | null {
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
  const actionTip = clean(o.actionTip);
  // Require the load-bearing fields; a result that is only empty/filler is rejected (§82).
  if (headline.length === 0 || overallSummary.length === 0 || actionTip.length === 0) return null;
  // The verdict answers the day; if the model omits it, fall back to the first sentence of the summary.
  const verdict = clean(o.verdict) || firstSentence(overallSummary);

  // De-dup highlights by semantic category (§26): the first card of a category wins; later paraphrases drop.
  const seenCategories = new Set<string>();
  const highlights: DailyFortuneResult['highlights'] = [];
  for (const h of Array.isArray(o.highlights) ? o.highlights : []) {
    const hh = (h ?? {}) as Record<string, unknown>;
    const domain = clean(hh.domain);
    const title = clean(hh.title);
    const body = clean(hh.body);
    if (title.length === 0 || body.length === 0) continue;
    const cat = semanticCategory(`${title} ${body}`);
    if (cat && seenCategories.has(cat)) continue; // a distinct-looking card that repeats an earlier signal
    if (cat) seenCategories.add(cat);
    highlights.push({ domain, title, body });
    if (highlights.length >= plan.maxHighlights) break;
  }

  // A caution that merely restates the verdict/headline or an already-shown highlight adds nothing → drop it.
  const coveredByOthers = new Set<string>([...seenCategories]);
  for (const t of [verdict, headline]) {
    const c = semanticCategory(t);
    if (c) coveredByOthers.add(c);
  }
  const cautions: DailyFortuneResult['cautions'] = [];
  for (const c of Array.isArray(o.cautions) ? o.cautions : []) {
    const cc = (c ?? {}) as Record<string, unknown>;
    const title = clean(cc.title);
    const body = clean(cc.body);
    if (title.length === 0 || body.length === 0) continue;
    const cat = semanticCategory(`${title} ${body}`);
    if (cat && coveredByOthers.has(cat)) continue;
    if (cat) coveredByOthers.add(cat);
    cautions.push({ title, body });
    if (cautions.length >= plan.maxCautions) break;
  }

  // Follow-ups: prefer the V1.1 {displayLabel, question} shape; tolerate the legacy string[] (§77) so a retry
  // of an old prompt still parses. Short label for the chip, rich question for the consultation.
  const followUps: DailyFollowUp[] = [];
  const rawFollowUps = Array.isArray(o.followUps)
    ? o.followUps
    : Array.isArray(o.consultationPrompts)
      ? o.consultationPrompts
      : [];
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

  // Fail-closed hygiene (§19/§54/§77): raw 천간지지 OR a fabricated event guarantee in any surfaced field means
  // the model ignored the directive — reject rather than show it (retry, never persist).
  const surfaced = [
    headline, verdict, overallSummary, actionTip,
    ...highlights.flatMap((h) => [h.title, h.body]),
    ...cautions.flatMap((c) => [c.title, c.body]),
    ...followUps.flatMap((f) => [f.displayLabel, f.question]),
  ].join(' ');
  if (containsRawGanji(surfaced)) return null;
  if (containsEventGuarantee(surfaced)) return null;

  return {
    headline,
    verdict,
    overallSummary,
    overallTone: plan.overallTone,
    primaryMode: plan.primaryMode,
    primaryModeLabel: plan.primaryModeLabel,
    domainSignals: plan.domainSignals,
    highlights,
    cautions,
    actionTip,
    followUps,
    // Deterministic, server-owned (§20/§9) — the LLM never authors these.
    evidence: plan.evidence,
    backgroundSummary: plan.backgroundSummary ?? null,
  };
}

export async function buildTodayFortune(
  request: TodayFortuneRequest,
  deps: TodayFortuneDeps,
): Promise<TodayFortuneServerResult> {
  const evidence = await buildTodayFortuneEvidence(
    { birthInfo: request.birthInput, nowEpochSeconds: deps.nowEpochSeconds },
    { digestProvider: deps.digestProvider, historicalTimezoneResolver: deps.historicalTimezoneResolver },
  );
  if (!evidence.available) return { ok: false, reason: 'EVIDENCE_UNAVAILABLE', fortuneDate: evidence.fortuneDate };

  const plan = deriveDailyPlan(evidence);
  const messages = buildTodayFortunePrompt(plan);

  let raw: string;
  try {
    raw = await deps.callLLM(messages);
  } catch {
    return { ok: false, reason: 'LLM_FAILED', fortuneDate: plan.fortuneDate };
  }

  const result = parseDailyFortune(raw, plan);
  if (result === null) return { ok: false, reason: 'INVALID_OUTPUT', fortuneDate: plan.fortuneDate };

  return {
    ok: true,
    fortuneDate: plan.fortuneDate,
    overallTone: plan.overallTone,
    result,
    policyVersion: TODAY_POLICY_VERSION,
    evidenceVersion: plan.evidenceVersion,
    planVersion: plan.planVersion,
  };
}

// The DAILY generation orchestrator (§15) — the runtime-neutral single-LLM-call path, mirroring
// buildServerConsultation. It CALCULATES nothing new beyond the deterministic daily evidence + plan; the LLM
// only verbalizes the plan. The SERVER owns the date (deps.nowEpochSeconds = receipt time). Exactly ONE
// callLLM. Output is parsed, capped (≤3 highlights / ≤2 cautions), and scrubbed of any leaked engine labels.
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider, HistoricalTimezoneResolver } from '@/features/interpretation';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';
import { containsRawGanji, stripEngineLabels } from '@/features/chat/presentation/commercialText';
import { buildTodayFortuneEvidence } from '@/features/today/engine/todayEvidence';
import { deriveDailyPlan, type DailyPlan } from '@/features/today/engine/todayPlan';
import { buildTodayFortunePrompt } from '@/features/today/server/todayFortunePrompt';
import { TODAY_POLICY_VERSION, type DailyFortuneResult, type DailyOverallTone } from '@/features/today/types';

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

// Parse + validate + cap + scrub the model JSON into the compact DailyFortuneResult. The tier is the SERVER's
// (plan.overallTone), never the model's. Returns null on unusable output (§26/§82 — never persist filler).
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

  const highlights = (Array.isArray(o.highlights) ? o.highlights : [])
    .map((h) => {
      const hh = (h ?? {}) as Record<string, unknown>;
      return { domain: clean(hh.domain), title: clean(hh.title), body: clean(hh.body) };
    })
    .filter((h) => h.title.length > 0 && h.body.length > 0)
    .slice(0, plan.maxHighlights);

  const cautions = (Array.isArray(o.cautions) ? o.cautions : [])
    .map((c) => {
      const cc = (c ?? {}) as Record<string, unknown>;
      return { title: clean(cc.title), body: clean(cc.body) };
    })
    .filter((c) => c.title.length > 0 && c.body.length > 0)
    .slice(0, plan.maxCautions);

  const consultationPrompts = (Array.isArray(o.consultationPrompts) ? o.consultationPrompts : [])
    .map((p) => clean(p))
    .filter((p) => p.length > 0)
    .slice(0, 3);

  // Fail-closed hygiene (§19/§77): raw 천간지지 in any surfaced field means the model ignored the
  // consumer-language directive — reject rather than show 간지 to the user (retry, never persist).
  const surfaced = [headline, overallSummary, actionTip, ...highlights.flatMap((h) => [h.title, h.body]), ...cautions.flatMap((c) => [c.title, c.body])].join(' ');
  if (containsRawGanji(surfaced)) return null;

  return { headline, overallSummary, overallTone: plan.overallTone, highlights, cautions, actionTip, consultationPrompts };
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

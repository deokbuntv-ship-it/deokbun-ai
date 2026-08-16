// Consultation GROUNDING production path (sprint §10 · Ziwei V1 §17/§18/§19). Runs the FROZEN
// Saju/Myungri engine AND the iztro-based Ziwei engine for the draft's subject and packages both
// engines' deterministic facts as ConsultationGrounding for the prompt.
//
// This is the wire that ends "engine exists but the consultation doesn't use it." It CALCULATES
// nothing itself — it invokes the frozen Saju producer (executeSajuFromBirthInput) + the frozen-
// consuming Myungri fact modules, and the Ziwei producer (computeZiweiChartMemoized), then hands
// each to its facts-only adapter.
//
// FAIL-CLOSED + DEGRADED MODES (§18): the two engines are independent. Ziwei (iztro) supports a
// wider year span than the frozen Saju range, so it is computed regardless of whether Saju can
// produce a chart. Grounding is `available` when EITHER engine produced facts:
//   • Saju available + Ziwei available   → dual-engine grounding
//   • Saju available + Ziwei unavailable  → Saju-only (ziwei slot shows its truthful state)
//   • Saju unavailable + Ziwei available → Ziwei-only (myungri slot shows calculation_failed)
//   • both unavailable                    → grounding `unavailable` (nothing fabricated)
// qimen stays engine_not_connected (§28). Nothing is ever fabricated to fill a slot.
import type { EngineEvidence } from '@/features/analysis';
import type { ConsultationDraft, BirthInfoDraft } from '@/features/consultation';
import {
  ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  LUNAR_JS_SOLAR_TERM_ADAPTER,
  calculateSajuDaewoon,
  executeSajuFromBirthInput,
  type DigestProvider,
  type HistoricalTimezoneResolver,
} from '@/features/interpretation';
import {
  calculateDaewoonTenGods,
  calculateMonthCommand,
  calculateNatalRelations,
  calculateRootingTransparency,
  calculateSewoonForInstant,
  calculateWolwoonForInstant,
  natalContextFromFourPillars,
  toSajuEvidence,
} from '@/features/myungri';
import {
  ZIWEI_RULESET_VERSION,
  computeZiweiChartMemoized,
  toZiweiBirthInput,
  toZiweiEvidence,
} from '@/features/ziwei';
import { toSajuEngineInput } from '@/features/manse/services/birthInputMapper';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';

export type SajuGroundingDeps = {
  digestProvider: DigestProvider;
  historicalTimezoneResolver?: HistoricalTimezoneResolver;
  /** UTC seconds used for the current-year 세운/월운 facts. Injectable for deterministic tests. */
  nowEpochSeconds?: number;
};

const ENGINE_NOT_CONNECTED: EngineEvidence = { availability: 'engine_not_connected' };
const MYUNGRI_UNAVAILABLE: EngineEvidence = { availability: 'calculation_failed' };

/**
 * Ziwei evidence for the draft's birth. Independent of the Saju range. Fail-closed: any throw or
 * unsupported/missing-time input yields a truthful non-available EngineEvidence (never a fabricated
 * chart, never a thrown error that could crash the whole consultation — §18/§39).
 */
export function buildZiweiEvidence(birthInfo: BirthInfoDraft): EngineEvidence {
  try {
    return toZiweiEvidence(computeZiweiChartMemoized(toZiweiBirthInput(birthInfo)));
  } catch {
    return MYUNGRI_UNAVAILABLE; // { availability: 'calculation_failed' }
  }
}

type MyungriOutcome = { evidence: EngineEvidence; engineVersion: string | null };

/** Run the FROZEN Saju engine + Myungri facts. Fail-closed → calculation_failed (never throws up). */
async function buildMyungriEvidence(
  draft: ConsultationDraft & { birthInfo: BirthInfoDraft },
  deps: SajuGroundingDeps,
): Promise<MyungriOutcome> {
  const execution = await executeSajuFromBirthInput(toSajuEngineInput(draft.birthInfo), {
    digestProvider: deps.digestProvider,
    historicalTimezoneResolver:
      deps.historicalTimezoneResolver ?? ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  });

  // Normalization/fingerprint failure (invalid/unsupported input) — no fabricated evidence.
  if (!execution.success) return { evidence: MYUNGRI_UNAVAILABLE, engineVersion: null };
  const engineResult = execution.engineResult;
  // Engine could not produce a chart (unsupported date / ambiguous boundary / unknown-time-on-
  // boundary all surface here) — fail-closed, never a fabricated pillar (§16).
  if (engineResult.status === 'UNAVAILABLE') return { evidence: MYUNGRI_UNAVAILABLE, engineVersion: null };

  // SUCCESS or PARTIAL (시주 미상) → derive the Myungri facts from the frozen chart (no new calc).
  const fourPillars = engineResult.output.fourPillars;
  const natal = natalContextFromFourPillars(fourPillars);
  const natalRelations = calculateNatalRelations(natal);
  const monthCommand = calculateMonthCommand(natal);
  const rooting = calculateRootingTransparency(natal);
  const daewoon = calculateSajuDaewoon(
    { normalizedBirth: execution.normalizedBirth, yearPillar: fourPillars.year, monthPillar: fourPillars.month },
    LUNAR_JS_SOLAR_TERM_ADAPTER,
  );
  const daewoonTenGods =
    daewoon.capability === 'AVAILABLE'
      ? calculateDaewoonTenGods({ dayMaster: natal.dayMaster, cycles: daewoon.cycles })
      : null;

  const now = deps.nowEpochSeconds ?? Math.floor(Date.now() / 1000);
  const sewoon = calculateSewoonForInstant({ natal, instantEpochSeconds: now });
  const wolwoon = calculateWolwoonForInstant({ natal, instantEpochSeconds: now });

  const evidence = toSajuEvidence({
    engineResult,
    natalRelations,
    monthCommand,
    rooting,
    daewoonTenGods,
    sewoon: sewoon.capability === 'AVAILABLE' ? sewoon : null,
    wolwoon: wolwoon.capability === 'AVAILABLE' ? wolwoon : null,
  });
  return { evidence, engineVersion: engineResult.engine.ruleSetVersion };
}

/**
 * Build the deterministic grounding for a consultation draft by running the Saju + Ziwei engines.
 * `available` when either engine produced facts; `unavailable` (fail-closed) when the subject/birth
 * is missing or neither engine can produce a chart. Nothing is fabricated.
 */
export async function buildConsultationGrounding(
  draft: ConsultationDraft,
  deps: SajuGroundingDeps,
): Promise<ConsultationGrounding> {
  if (draft.subject === null || draft.birthInfo === null) {
    return GROUNDING_UNAVAILABLE;
  }
  const withBirth = draft as ConsultationDraft & { birthInfo: BirthInfoDraft };

  // Ziwei is computed independently (wider iztro span → enables Ziwei-only degraded mode).
  const ziwei = buildZiweiEvidence(withBirth.birthInfo);
  const { evidence: myungri, engineVersion: myungriVersion } = await buildMyungriEvidence(withBirth, deps);

  const groundingAvailable = myungri.availability === 'available' || ziwei.availability === 'available';
  if (!groundingAvailable) {
    return { status: 'unavailable', reason: 'calculation_failed' };
  }

  return {
    status: 'available',
    evidence: { myungri, ziwei, qimen: ENGINE_NOT_CONNECTED },
    // Prefer the Saju rule version (spine); fall back to the Ziwei ruleset in Ziwei-only mode.
    engineVersion: myungriVersion ?? ZIWEI_RULESET_VERSION,
  };
}

/** Bind the deps once (production) → a `(draft) => grounding` the chat service can await. */
export function createSajuGroundingBuilder(
  deps: SajuGroundingDeps,
): (draft: ConsultationDraft) => Promise<ConsultationGrounding> {
  return (draft) => buildConsultationGrounding(draft, deps);
}

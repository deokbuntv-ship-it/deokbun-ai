// Consultation GROUNDING production path (sprint §10). Runs the FROZEN Saju/Myungri engine for the
// draft's subject and packages its deterministic facts as ConsultationGrounding for the prompt.
//
// This is the wire that ends "engine exists but the consultation doesn't use it." It CALCULATES
// nothing itself — it invokes the frozen producer (executeSajuFromBirthInput) + the frozen-consuming
// Myungri fact modules, then hands the result to the facts-only adapter. Fail-closed: if the engine
// cannot produce a chart (unsupported date, ambiguous boundary, unknown-time-on-boundary), grounding
// is `unavailable` and nothing is fabricated (sprint §6/§16). ziwei/qimen stay engine_not_connected
// (Sprint 2/3 — §17); Cross-Analysis therefore sees SAJU-only, honestly.
import type { EngineEvidence } from '@/features/analysis';
import type { ConsultationDraft } from '@/features/consultation';
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
  calculateRootingTransparency,
  calculateSewoonForInstant,
  calculateWolwoonForInstant,
  natalContextFromFourPillars,
  toSajuEvidence,
} from '@/features/myungri';
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

/**
 * Build the deterministic grounding for a consultation draft by running the frozen Saju engine.
 * `unavailable` (fail-closed) when the subject/birth is missing or the engine cannot produce a chart.
 */
export async function buildConsultationGrounding(
  draft: ConsultationDraft,
  deps: SajuGroundingDeps,
): Promise<ConsultationGrounding> {
  if (draft.subject === null || draft.birthInfo === null) {
    return GROUNDING_UNAVAILABLE;
  }

  const execution = await executeSajuFromBirthInput(toSajuEngineInput(draft.birthInfo), {
    digestProvider: deps.digestProvider,
    historicalTimezoneResolver:
      deps.historicalTimezoneResolver ?? ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  });

  // Normalization/fingerprint failure (invalid/unsupported input) — no fabricated evidence.
  if (!execution.success) {
    return { status: 'unavailable', reason: 'calculation_failed' };
  }
  const engineResult = execution.engineResult;
  // Engine could not produce a chart (unsupported date / ambiguous boundary / unknown-time-on-
  // boundary all surface here as UNAVAILABLE) — fail-closed, never a fabricated pillar (§16).
  if (engineResult.status === 'UNAVAILABLE') {
    return { status: 'unavailable', reason: 'calculation_failed' };
  }

  // SUCCESS or PARTIAL (시주 미상) → derive the Myungri facts from the frozen chart (no new calc).
  const fourPillars = engineResult.output.fourPillars;
  const natal = natalContextFromFourPillars(fourPillars);
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

  const myungri = toSajuEvidence({
    engineResult,
    monthCommand,
    rooting,
    daewoonTenGods,
    sewoon: sewoon.capability === 'AVAILABLE' ? sewoon : null,
    wolwoon: wolwoon.capability === 'AVAILABLE' ? wolwoon : null,
  });

  return {
    status: 'available',
    evidence: { myungri, ziwei: ENGINE_NOT_CONNECTED, qimen: ENGINE_NOT_CONNECTED },
    engineVersion: engineResult.engine.ruleSetVersion,
  };
}

/** Bind the deps once (production) → a `(draft) => grounding` the chat service can await. */
export function createSajuGroundingBuilder(
  deps: SajuGroundingDeps,
): (draft: ConsultationDraft) => Promise<ConsultationGrounding> {
  return (draft) => buildConsultationGrounding(draft, deps);
}

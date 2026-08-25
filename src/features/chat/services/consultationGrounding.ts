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
import { derivePolarity } from '@/features/polarity/polarityKernel';
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
  calculateMyungriTimeAxis,
  calculateNatalRelations,
  calculateRootingTransparency,
  calculateSewoonForInstant,
  calculateWolwoonForInstant,
  natalContextFromFourPillars,
  resolveActiveDaewoonOrdinal,
  toSajuEvidence,
  type MyungriStemAndBranch,
  type RelationsToNatal,
} from '@/features/myungri';
import { epochForSajuMonth, epochForSajuYear, resolveQuestionYears } from '@/features/chat/services/questionYears';
import { resolveQuestionMonths } from '@/features/chat/services/questionMonths';
import {
  ZIWEI_RULESET_VERSION,
  computeZiweiChartMemoized,
  toZiweiBirthInput,
  toZiweiEvidence,
} from '@/features/ziwei';
import { computeQimenBoard, toQimenEvidence } from '@/features/qimen';
import { toSajuEngineInput } from '@/features/manse/services/birthInputMapper';
import type { ConsultationGrounding, TargetPolarity } from '@/features/chat/prompts/grounding';
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import { resolveQimenActivation } from '@/features/chat/selectors/qimenActivation';

export type SajuGroundingDeps = {
  digestProvider: DigestProvider;
  historicalTimezoneResolver?: HistoricalTimezoneResolver;
  /** UTC seconds used for the current-year 세운/월운 facts. Injectable for deterministic tests. */
  nowEpochSeconds?: number;
};

const MYUNGRI_UNAVAILABLE: EngineEvidence = { availability: 'calculation_failed' };
const QIMEN_NOT_APPLICABLE: EngineEvidence = { availability: 'not_applicable' };

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

/**
 * Qimen evidence for the CURRENT consultation question (Qimen V1, §1/§2/§13). Question-time based: it
 * runs ONLY for a timing/decision question, using the question instant (Asia/Seoul) — never the birth.
 * Non-timing question → not_applicable. Unsupported 節氣/input or a provider throw → fail-closed
 * (never a fabricated board, never crashes the consultation). No question text → not_applicable.
 */
export function buildQimenEvidence(question: string | undefined, questionEpochSeconds: number): EngineEvidence {
  if (!question || question.trim().length === 0) return QIMEN_NOT_APPLICABLE;
  try {
    return toQimenEvidence(computeQimenBoard(resolveQimenActivation(question, questionEpochSeconds)));
  } catch {
    return MYUNGRI_UNAVAILABLE; // { availability: 'calculation_failed' }
  }
}

type MyungriOutcome = {
  evidence: EngineEvidence;
  engineVersion: string | null;
  targetPolarities: TargetPolarity[];
  referenceYear: number | null; // KST CIVIL year (§8)
  referenceMonth: number | null;
};

/** Run the FROZEN Saju engine + Myungri facts. Fail-closed → calculation_failed (never throws up). */
async function buildMyungriEvidence(
  draft: ConsultationDraft & { birthInfo: BirthInfoDraft },
  deps: SajuGroundingDeps,
  question: string,
): Promise<MyungriOutcome> {
  const execution = await executeSajuFromBirthInput(toSajuEngineInput(draft.birthInfo), {
    digestProvider: deps.digestProvider,
    historicalTimezoneResolver:
      deps.historicalTimezoneResolver ?? ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  });

  // Normalization/fingerprint failure (invalid/unsupported input) — no fabricated evidence.
  if (!execution.success) return { evidence: MYUNGRI_UNAVAILABLE, engineVersion: null, targetPolarities: [], referenceYear: null, referenceMonth: null };
  const engineResult = execution.engineResult;
  // Engine could not produce a chart (unsupported date / ambiguous boundary / unknown-time-on-
  // boundary all surface here) — fail-closed, never a fabricated pillar (§16).
  if (engineResult.status === 'UNAVAILABLE') return { evidence: MYUNGRI_UNAVAILABLE, engineVersion: null, targetPolarities: [], referenceYear: null, referenceMonth: null };

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
  const kstNow = new Date((now + 9 * 3600) * 1000); // Asia/Seoul civil date from the trusted server instant
  const civilYear = kstNow.getUTCFullYear(); // KST CIVIL year — the linguistic reference for 올해/내년 (Sprint E.1 §8)
  const currentCivilMonth = kstNow.getUTCMonth() + 1;
  const sewoon = calculateSewoonForInstant({ natal, instantEpochSeconds: now });
  const wolwoon = calculateWolwoonForInstant({ natal, instantEpochSeconds: now });

  // Question-targeted 세운. 올해/내년/N년 resolve from the KST CIVIL year (Sprint E.1 §8 — NOT the 立春-based
  // 세운 year), then each civil year is grounded via the FROZEN engine at a mid-year epoch (→ the saju year
  // that governs that civil year). The current standalone 세운 already covers its own year, so it is skipped
  // to avoid a duplicate; between Jan 1 and 立春 the civil year differs from the current 세운 year, so BOTH are
  // correctly grounded (fixing the pre-立春 "올해"→wrong-year bug). Bounded + range-checked; ungroundable → skipped.
  const currentSajuYearForTargets = sewoon.capability === 'AVAILABLE' ? sewoon.targetYear : null;
  const extraSewoon = resolveQuestionYears(question, civilYear)
    .filter((y) => y !== currentSajuYearForTargets)
    .map((y) => calculateSewoonForInstant({ natal, instantEpochSeconds: epochForSajuYear(y) }))
    .filter((s) => s.capability === 'AVAILABLE');

  // Question-targeted future MONTHS (Answer-Seeking Engine §3/§4). Resolve the SPECIFIC months the user
  // asked (server time is authoritative — never the LLM), compute each one's 월운 from the FROZEN engine,
  // and label it by the CIVIL month asked. Bounded (≤12) + fail-closed (an ungroundable month is skipped,
  // so a fabricated month is still rejected). Deterministic; ZERO extra LLM calls. Cost-guarded by the
  // resolver's intent (EXACT=1, COMPARE=2, RANGE=window, BEST≤12; year-level/non-timing questions → 0).
  const extraWolwoon = resolveQuestionMonths(question, civilYear, currentCivilMonth)
    .targets.map((t) => ({
      requestedYear: t.year,
      requestedMonth: t.month,
      result: calculateWolwoonForInstant({ natal, instantEpochSeconds: epochForSajuMonth(t.year, t.month) }),
    }))
    .filter((x) => x.result.capability === 'AVAILABLE');

  // Gregorian birth year (from the SAME lunar→solar authority Ziwei uses) — an allowed timing anchor.
  const solarBirthYear = Number(toZiweiBirthInput(draft.birthInfo).birthYear);

  // ACTIVE 대운 via the CANONICAL date-based resolver (shared with Today/Monthly). It uses the engine's own
  // birth date for true elapsed years (만나이), replacing the prior year-subtraction (which was ±1 near a
  // decade boundary). One resolver everywhere → the same subject/instant can never get a different current 대운
  // across surfaces. Marks the already-computed cycle; no cycle is recomputed.
  const activeCycleOrdinal = resolveActiveDaewoonOrdinal(daewoon, now);
  let activeDaewoonPillar: MyungriStemAndBranch | null = null;
  if (activeCycleOrdinal !== null && daewoon.capability === 'AVAILABLE') {
    const active = daewoon.cycles.find((c) => c.ordinal === activeCycleOrdinal);
    if (active) activeDaewoonPillar = { stem: active.pillar.stem, branch: active.pillar.branch };
  }

  // Connected 원국↔대운↔세운↔월운 axis (Codex FIX #3) — reuses the existing time-axis service
  // (which internally reuses the frozen 세운/월운 pillar rules); facts only, no new calc.
  const timeAxis =
    sewoon.capability === 'AVAILABLE'
      ? calculateMyungriTimeAxis({
          natal,
          daewoonPillar: activeDaewoonPillar,
          targetYear: sewoon.targetYear,
          lunarMonth: wolwoon.capability === 'AVAILABLE' ? wolwoon.lunarMonth : null,
        })
      : null;

  const evidence = toSajuEvidence({
    engineResult,
    natalRelations,
    monthCommand,
    rooting,
    daewoon,
    daewoonTenGods,
    activeCycleOrdinal,
    sewoon: sewoon.capability === 'AVAILABLE' ? sewoon : null,
    wolwoon: wolwoon.capability === 'AVAILABLE' ? wolwoon : null,
    extraSewoon,
    extraWolwoon,
    timeAxis,
    birthGregorianYear: Number.isFinite(solarBirthYear) ? solarBirthYear : null,
  });

  // SERVER-owned TARGET-SCOPED polarity (Sprint C.1 §2-§4): one categorical tier per grounded temporal
  // target — the current-year 세운, each question-targeted year (extraSewoon), and each question-targeted
  // month (extraWolwoon). KEYED so the plan binds a conclusion to the question's resolved target. Same
  // kernel, no new astrology semantics. There is deliberately NO cross-target winner/order.
  const targetPolarities: TargetPolarity[] = [];
  const toTargetPolarity = (
    granularity: 'YEAR' | 'MONTH',
    targetKey: number,
    relations: RelationsToNatal,
  ): TargetPolarity => {
    const polarity = derivePolarity(relations);
    return {
      granularity,
      targetKey,
      polarity: polarity.tier,
      derivation: {
        ...polarity.evidence,
        stemRelations: relations.stem.map(({ position, relation }) => ({ position, kind: relation.kind })),
        branchRelations: relations.branch.map(({ position, relation }) => ({ position, kind: relation.kind })),
      },
    };
  };
  if (sewoon.capability === 'AVAILABLE') {
    targetPolarities.push(toTargetPolarity('YEAR', sewoon.targetYear, sewoon.relationsToNatal));
  }
  for (const ex of extraSewoon) {
    if (ex.capability === 'AVAILABLE') targetPolarities.push(toTargetPolarity('YEAR', ex.targetYear, ex.relationsToNatal));
  }
  for (const ew of extraWolwoon) {
    if (ew.result.capability === 'AVAILABLE') {
      targetPolarities.push(toTargetPolarity('MONTH', ew.requestedYear * 100 + ew.requestedMonth, ew.result.relationsToNatal));
    }
  }

  return { evidence, engineVersion: engineResult.engine.ruleSetVersion, targetPolarities, referenceYear: civilYear, referenceMonth: currentCivilMonth };
}

/**
 * Build the deterministic grounding for a consultation draft by running the Saju + Ziwei engines.
 * `available` when either engine produced facts; `unavailable` (fail-closed) when the subject/birth
 * is missing or neither engine can produce a chart. Nothing is fabricated.
 */
export async function buildConsultationGrounding(
  draft: ConsultationDraft,
  deps: SajuGroundingDeps,
  question?: string,
): Promise<ConsultationGrounding> {
  if (draft.subject === null || draft.birthInfo === null) {
    return GROUNDING_UNAVAILABLE;
  }
  const withBirth = draft as ConsultationDraft & { birthInfo: BirthInfoDraft };
  const now = deps.nowEpochSeconds ?? Math.floor(Date.now() / 1000);

  // Ziwei is computed independently (wider iztro span → enables Ziwei-only degraded mode).
  const ziwei = buildZiweiEvidence(withBirth.birthInfo);
  const { evidence: myungri, engineVersion: myungriVersion, targetPolarities, referenceYear, referenceMonth } = await buildMyungriEvidence(
    withBirth,
    deps,
    question ?? '',
  );
  // Qimen is QUESTION-TIME based: it consumes the current question + instant, NOT the birth. It is
  // supplementary (not_applicable for natal questions) and never makes the grounding available on its
  // own — the natal spine (Saju/Ziwei) governs availability (§13/§14).
  const qimen = buildQimenEvidence(question, now);

  const groundingAvailable = myungri.availability === 'available' || ziwei.availability === 'available';
  if (!groundingAvailable) {
    return { status: 'unavailable', reason: 'calculation_failed' };
  }

  return {
    status: 'available',
    evidence: { myungri, ziwei, qimen },
    // Prefer the Saju rule version (spine); fall back to the Ziwei ruleset in Ziwei-only mode.
    engineVersion: myungriVersion ?? ZIWEI_RULESET_VERSION,
    // Server-derived CIVIL reference year+month + target-scoped polarities — present only with Saju.
    ...(referenceYear !== null ? { referenceYear } : {}),
    ...(referenceMonth !== null ? { referenceMonth } : {}),
    ...(targetPolarities.length > 0 ? { targetPolarities } : {}),
  };
}

/** Bind the deps once (production) → a `(draft, question?) => grounding` the chat service can await. */
export function createSajuGroundingBuilder(
  deps: SajuGroundingDeps,
): (draft: ConsultationDraft, question?: string) => Promise<ConsultationGrounding> {
  return (draft, question) => buildConsultationGrounding(draft, deps, question);
}

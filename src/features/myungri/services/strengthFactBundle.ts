// MyungriStrengthFactBundle — the single future-facing aggregate FACT contract for a not-yet-built
// Strength Reasoner. Composes every clean, doctrine-neutral fact provider added this sprint plus
// the pre-existing clean facts (month command, natal relations) into ONE citable bundle.
//
// HARD INVARIANT: this bundle contains ONLY facts. It does not, and must never, contain a
// `strength`, `confidence`, `specialPatternStatus`, `rootIntegrity`, `transformationStatus`,
// `functionalForce`, or `yongshin` field of any kind — those are INFERENCE/VERDICT, reserved for a
// future reasoner once docs/MYUNGRI_STRENGTH_V1_CANONICAL_DOCTRINE.md's doctrine survives
// independent re-audit. See docs/MYUNGRI_STRENGTH_V1_FACT_FOUNDATION.md for the full FACT vs
// INFERENCE vs VERDICT boundary this file sits on, and for how a future reasoner should consume
// this bundle.
//
// Every sub-provider composed here is independently fail-closed (AVAILABLE | UNAVAILABLE); this
// bundle is itself fail-closed the same way — any sub-provider's UNAVAILABLE makes the whole
// bundle UNAVAILABLE, never a partial/best-effort guess.
import type { NatalPillarContext } from '../domain/contracts';
import { calculateMonthCommand, type MonthCommandResult } from './monthCommand';
import { calculateNatalRelations, type NatalRelationsResult } from './natalRelations';
import {
  calculateRelationParticipants, type RelationParticipantsResult,
} from './relationParticipants';
import {
  calculateSameElementRooting, type SameElementRootingResult,
} from './sameElementRooting';
import {
  calculateSpecialPatternPrerequisites, type SpecialPatternPrerequisitesResult,
} from './specialPatternPrerequisites';
import { calculateTenGodFacts, type TenGodFactsResult } from './tenGodFacts';

export const DEOKBUNAI_MYUNGRI_STRENGTH_FACT_BUNDLE_V1_RULE = {
  ruleId: 'DEOKBUNAI_MYUNGRI_STRENGTH_FACT_BUNDLE_V1',
  ruleVersion: 'deokbunai.myungri-strength-fact-bundle.v1',
} as const;

export type MyungriStrengthFactBundle = {
  ruleVersion: typeof DEOKBUNAI_MYUNGRI_STRENGTH_FACT_BUNDLE_V1_RULE.ruleVersion;
  /** Chart identity — the exact natal input every sub-fact below was derived from. */
  chart: NatalPillarContext;
  /** 월령 — reused unchanged from the frozen month-command provider (no re-derivation). Carries
   *  the Day Master's own 旺相休囚死 phase; NOT the final month-command day-count (사령) precision
   *  — that remains a P1 gap, doctrine §4.2. */
  monthCommand: Extract<MonthCommandResult, { capability: 'AVAILABLE' }>;
  /** Every hidden stem in every natal branch, with its relationship (same element / same stem /
   *  same polarity) to the Day Master. Existence facts only — see sameElementRooting.ts. */
  sameElementRooting: Extract<SameElementRootingResult, { capability: 'AVAILABLE' }>;
  /** Raw ten-god identity for every visible (non-DAY) and hidden stem. No role grouping, no
   *  support/drain side — see tenGodFacts.ts. */
  tenGodFacts: Extract<TenGodFactsResult, { capability: 'AVAILABLE' }>;
  /** Raw natal-internal relation detection (합/충/형/파/해/삼합/방합) — unchanged from the
   *  pre-existing clean provider. Detection only, no effect judgment. */
  natalRelations: NatalRelationsResult;
  /** Participant linkage (positions/stems/branches + candidate co-located root fact ids) for every
   *  relation natalRelations detects. Linkage only, no effect judgment — see relationParticipants.ts. */
  relationParticipants: Extract<RelationParticipantsResult, { capability: 'AVAILABLE' }>;
  /** Raw element/role counts and same-element-root positions for a future special-pattern gate to
   *  consume. No pattern verdict — see specialPatternPrerequisites.ts. */
  specialPatternPrerequisites: Extract<SpecialPatternPrerequisitesResult, { capability: 'AVAILABLE' }>;
  /** FUTURE-ONLY documentation placeholders (docs/MYUNGRI_STRENGTH_V1_FACT_FOUNDATION.md §"Future
   *  integration points"). Deliberately typed `undefined`-only — no runtime value is ever assigned,
   *  and no code path in this bundle builder ever sets them. They exist solely so a future reasoner's
   *  type contract can extend this bundle without re-deriving its shape, per this sprint's
   *  requirement to keep RootFact/RootFunctionInference and climate facts explicitly separated
   *  from what THIS sprint actually computes. */
  future: {
    /** Root FUNCTIONAL inference (weakened/destroyed/survived) — NOT computed this sprint. */
    rootFunction: undefined;
    /** Relation transformation/formation judgment (合化/三合局 성립 등) — NOT computed this sprint. */
    relationEffect: undefined;
    /** Special-pattern verdict (從强/從財/從官殺/... CONFIRMED/CANDIDATE/REJECTED) — NOT computed this sprint. */
    specialPatternVerdict: undefined;
    /** 調候/climate facts — NOT computed this sprint (doctrine §9/§11; deliberately deferred). */
    climate: undefined;
    /** Day-Master strength verdict (WEAK/BALANCED/STRONG, seven-band) — NOT computed this sprint. */
    strength: undefined;
    /** Yongshin — NOT computed this sprint, out of scope. */
    yongshin: undefined;
  };
};

export type StrengthFactBundleResult =
  | { capability: 'AVAILABLE'; bundle: MyungriStrengthFactBundle }
  | {
      capability: 'UNAVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_STRENGTH_FACT_BUNDLE_V1_RULE.ruleVersion;
      /** Which sub-provider first reported UNAVAILABLE, and its own reason — never a guess. */
      failedProvider: string;
      reason: string;
    };

function fail(failedProvider: string, reason: string): StrengthFactBundleResult {
  return {
    capability: 'UNAVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_STRENGTH_FACT_BUNDLE_V1_RULE.ruleVersion,
    failedProvider, reason,
  };
}

/**
 * Compose every clean deterministic Myungri fact provider into ONE citable bundle for a future
 * (not-yet-implemented) Strength Reasoner. FACT ONLY — see module header.
 */
export function buildMyungriStrengthFactBundle(natal: NatalPillarContext): StrengthFactBundleResult {
  const monthCommand = calculateMonthCommand(natal);
  if (monthCommand.capability !== 'AVAILABLE') return fail('monthCommand', monthCommand.reason);

  const sameElementRooting = calculateSameElementRooting(natal);
  if (sameElementRooting.capability !== 'AVAILABLE') return fail('sameElementRooting', sameElementRooting.reason);

  const tenGodFacts = calculateTenGodFacts(natal);
  if (tenGodFacts.capability !== 'AVAILABLE') return fail('tenGodFacts', tenGodFacts.reason);

  const natalRelations = calculateNatalRelations(natal);
  if (!natalRelations) return fail('natalRelations', 'INVALID_NATAL_CONTEXT');

  const relationParticipants = calculateRelationParticipants(natal);
  if (relationParticipants.capability !== 'AVAILABLE') return fail('relationParticipants', relationParticipants.reason);

  const specialPatternPrerequisites = calculateSpecialPatternPrerequisites(natal);
  if (specialPatternPrerequisites.capability !== 'AVAILABLE') {
    return fail('specialPatternPrerequisites', specialPatternPrerequisites.reason);
  }

  return {
    capability: 'AVAILABLE',
    bundle: {
      ruleVersion: DEOKBUNAI_MYUNGRI_STRENGTH_FACT_BUNDLE_V1_RULE.ruleVersion,
      chart: natal,
      monthCommand, sameElementRooting, tenGodFacts, natalRelations, relationParticipants,
      specialPatternPrerequisites,
      future: {
        rootFunction: undefined, relationEffect: undefined, specialPatternVerdict: undefined,
        climate: undefined, strength: undefined, yongshin: undefined,
      },
    },
  };
}

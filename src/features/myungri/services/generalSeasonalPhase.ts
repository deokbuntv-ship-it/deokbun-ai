// General 旺相休囚死 (five-phase seasonal vitality) utility — deterministic FACT ONLY.
//
// monthCommand.ts already computes this exact five-phase relation, but only reachable via a full
// NatalPillarContext, framed around "the Day Master's own phase" (docs/MYUNGRI_STRENGTH_V1_
// IMPLEMENTATION_GAP.md's P1-2 gap: "the logic is structurally element-vs-element already... not
// exposed as a general generalSeasonalPhase(element, monthBranch) utility"). A future strength
// reasoner needs this same five-phase relation for OTHER elements too — an opposition candidate's
// own seasonal vitality (canonical doctrine §7.3), or a root's own seasonal vitality independent
// of the Day Master's (canonical doctrine §5.3) — neither of which is "the Day Master."
//
// This file is a WHOLLY INDEPENDENT re-derivation, not an edit to monthCommand.ts: the Myungri
// deterministic CALC layer (docs/MYUNGRI_V1_FREEZE.md, commit 7c7ed82) explicitly includes month
// command among its frozen scope, and this sprint does not reopen or modify any frozen-commit
// file. The five-phase generation/control mapping below is the SAME mechanical fact monthCommand.ts
// already encodes (reusing the identical frozen calculateTenGod() primitive), duplicated here as
// its own small, independently-auditable, general-purpose provider — not new theory, a pure
// re-derivation of a five-cell table from the frozen ten-god rule.
//
// FACT ONLY. No 신강/신약, no strength score, no verdict — see monthCommand.ts's own LIMITATIONS
// tag, restated here: input fact only.
import {
  calculateTenGod, getBranchElement,
  type EarthlyBranch, type FiveElement, type HeavenlyStem,
} from '../../interpretation';
import type { SeasonalPhase } from './monthCommand';

export const DEOKBUNAI_MYUNGRI_GENERAL_SEASONAL_PHASE_V1_RULE = {
  ruleId: 'DEOKBUNAI_MYUNGRI_GENERAL_SEASONAL_PHASE_V1',
  ruleVersion: 'deokbunai.myungri-general-seasonal-phase.v1',
} as const;

// A representative YANG stem per element — the five-phase relation depends only on the GENERATE/
// CONTROL cycle between two ELEMENTS, so any one stem of each element is a valid probe via the
// frozen calculateTenGod() rule. Identical table to monthCommand.ts's own (independently
// re-derived, not imported, per this file's header note on the CALC-layer freeze).
const ELEMENT_YANG_STEM: Readonly<Record<FiveElement, HeavenlyStem>> = {
  WOOD: 'JIA', FIRE: 'BING', EARTH: 'WU', METAL: 'GENG', WATER: 'REN',
};

// 旺相休囚死: TARGET element's phase relative to REFERENCE element, read off the frozen ten-god
// relation TARGET→REFERENCE. Identical mapping to monthCommand.ts's own TEN_GOD_TO_PHASE.
const TEN_GOD_TO_PHASE: Readonly<Partial<Record<string, SeasonalPhase>>> = {
  PEER: 'WANG', // TARGET = REFERENCE → 旺
  INDIRECT_RESOURCE: 'XIANG', // REFERENCE generates TARGET → 相
  EATING_GOD: 'XIU', // TARGET generates REFERENCE → 休
  INDIRECT_WEALTH: 'QIU', // TARGET controls REFERENCE → 囚
  SEVEN_KILLINGS: 'SI', // REFERENCE controls TARGET → 死
};

export type GeneralSeasonalPhaseResult =
  | {
      capability: 'AVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_GENERAL_SEASONAL_PHASE_V1_RULE.ruleVersion;
      targetElement: FiveElement;
      referenceElement: FiveElement;
      phase: SeasonalPhase;
    }
  | {
      capability: 'UNAVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_GENERAL_SEASONAL_PHASE_V1_RULE.ruleVersion;
      reason: 'FROZEN_RULE_FAILURE';
    };

/**
 * The five-phase (旺相休囚死) relation of `targetElement` given a `referenceElement` (typically the
 * month branch's own dominant element, but any element may be supplied — a root's own element, an
 * opposition candidate's element). FACT ONLY, no strength/verdict — see module header.
 */
export function generalSeasonalPhase(
  targetElement: FiveElement,
  referenceElement: FiveElement,
): GeneralSeasonalPhaseResult {
  const tenGod = calculateTenGod(ELEMENT_YANG_STEM[targetElement], ELEMENT_YANG_STEM[referenceElement]);
  const phase = tenGod.ok ? TEN_GOD_TO_PHASE[tenGod.value] : undefined;
  if (!tenGod.ok || !phase) {
    return {
      capability: 'UNAVAILABLE',
      ruleVersion: DEOKBUNAI_MYUNGRI_GENERAL_SEASONAL_PHASE_V1_RULE.ruleVersion,
      reason: 'FROZEN_RULE_FAILURE',
    };
  }
  return {
    capability: 'AVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_GENERAL_SEASONAL_PHASE_V1_RULE.ruleVersion,
    targetElement, referenceElement, phase,
  };
}

/** Convenience: `generalSeasonalPhase` against a month BRANCH's own dominant element directly. */
export function generalSeasonalPhaseForMonthBranch(
  targetElement: FiveElement,
  monthBranch: EarthlyBranch,
): GeneralSeasonalPhaseResult {
  const monthElement = getBranchElement(monthBranch);
  if (!monthElement.ok) {
    return {
      capability: 'UNAVAILABLE',
      ruleVersion: DEOKBUNAI_MYUNGRI_GENERAL_SEASONAL_PHASE_V1_RULE.ruleVersion,
      reason: 'FROZEN_RULE_FAILURE',
    };
  }
  return generalSeasonalPhase(targetElement, monthElement.value);
}

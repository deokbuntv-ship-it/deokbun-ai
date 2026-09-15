// 통근 (rooting) + 투간 (transparency) — objective same-干 matches between the natal visible
// heavenly stems and the branch 지장간 (hidden stems). FACTS ONLY.
//   • 통근: a visible 천간 is "rooted" when the SAME 천간 appears among some natal 지지's 지장간.
//   • 투간: a 지장간 천간 is "revealed" when it actually appears as a visible natal 천간.
// These are inverse views of the same stem-in-both-places relation; both are recorded per directive.
//
// STRICTLY NO strength, NO score, NO weighting (no 0.7/0.5/0.3), NO interpretation. 본기/중기/여기
// (MAIN/MIDDLE/RESIDUAL) roles are preserved verbatim from the frozen 지장간 data.
import { getHiddenStems } from '../../interpretation';
import type {
  EarthlyBranch,
  HeavenlyStem,
  HiddenStemRole,
  SajuPillarPosition,
} from '../../interpretation';
import {
  DEOKBUNAI_MYUNGRI_ROOTING_TRANSPARENCY_V1_RULE,
  type MyungriProvenance,
  type NatalPillarContext,
} from '../domain/contracts';
import { isValidNatalContext, myungriProvenance } from './pillarFacts';

export type RootingMatch = {
  branchPosition: SajuPillarPosition;
  branch: EarthlyBranch;
  /** 본기(MAIN)/중기(MIDDLE)/여기(RESIDUAL) of the branch where the same 干 is stored. */
  hiddenStemRole: HiddenStemRole;
};

export type StemRooting = {
  stemPosition: SajuPillarPosition;
  stem: HeavenlyStem;
  isRooted: boolean;
  /** Every branch (incl. its own pillar) whose 지장간 contains the identical 干. */
  roots: readonly RootingMatch[];
};

export type HiddenStemTransparency = {
  branchPosition: SajuPillarPosition;
  branch: EarthlyBranch;
  hiddenStem: HeavenlyStem;
  hiddenStemRole: HiddenStemRole;
  isRevealed: boolean;
  /** Visible stem positions where this 지장간 干 actually appears. */
  revealedAt: readonly SajuPillarPosition[];
};

export type RootingTransparencyUnavailableReason =
  | 'INVALID_NATAL_CONTEXT'
  | 'HIDDEN_STEMS_UNAVAILABLE';

type Base = { provenance: MyungriProvenance; assumptions: readonly string[]; limitations: readonly string[] };

export type RootingTransparencyResult =
  | (Base & {
      capability: 'AVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_ROOTING_TRANSPARENCY_V1_RULE.ruleVersion;
      dayMaster: HeavenlyStem;
      rooting: readonly StemRooting[];
      transparency: readonly HiddenStemTransparency[];
    })
  | (Base & {
      capability: 'UNAVAILABLE';
      ruleVersion: typeof DEOKBUNAI_MYUNGRI_ROOTING_TRANSPARENCY_V1_RULE.ruleVersion;
      reason: RootingTransparencyUnavailableReason;
    });

const ASSUMPTIONS = [
  'ROOTING_IS_SAME_STEM_IDENTITY_MATCH_NOT_SAME_ELEMENT',
  'HIDDEN_STEM_DATA_AND_ROLES_COME_FROM_THE_FROZEN_SAJU_RULES',
] as const;

const LIMITATIONS = [
  'FACTS_ONLY_NO_STRENGTH_NO_SCORE_NO_WEIGHTING_NO_INTERPRETATION',
  'SAME_ELEMENT_ROOTING_IS_A_SEPARATE_DEFERRED_POLICY_NOT_COMPUTED_HERE',
] as const;

type Cell = { position: SajuPillarPosition; stem: HeavenlyStem; branch: EarthlyBranch };

function cells(natal: NatalPillarContext): Cell[] {
  const out: Cell[] = [
    { position: 'YEAR', ...natal.pillars.year },
    { position: 'MONTH', ...natal.pillars.month },
    { position: 'DAY', ...natal.pillars.day },
  ];
  if (natal.pillars.hour) out.push({ position: 'HOUR', ...natal.pillars.hour });
  return out;
}

function unavailable(reason: RootingTransparencyUnavailableReason): RootingTransparencyResult {
  return {
    capability: 'UNAVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_ROOTING_TRANSPARENCY_V1_RULE.ruleVersion,
    reason,
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS,
    limitations: LIMITATIONS,
  };
}

export function calculateRootingTransparency(
  natal: NatalPillarContext,
): RootingTransparencyResult {
  if (!isValidNatalContext(natal)) return unavailable('INVALID_NATAL_CONTEXT');
  const grid = cells(natal);

  // Frozen 지장간 for each present branch.
  const hidden: { cell: Cell; stems: readonly { stem: HeavenlyStem; role: HiddenStemRole }[] }[] = [];
  for (const cell of grid) {
    const hs = getHiddenStems(cell.branch);
    if (!hs.ok) return unavailable('HIDDEN_STEMS_UNAVAILABLE');
    hidden.push({ cell, stems: hs.value });
  }

  const rooting: StemRooting[] = grid.map((cell) => {
    const roots: RootingMatch[] = [];
    for (const h of hidden) {
      for (const s of h.stems) {
        if (s.stem === cell.stem) {
          roots.push({ branchPosition: h.cell.position, branch: h.cell.branch, hiddenStemRole: s.role });
        }
      }
    }
    return { stemPosition: cell.position, stem: cell.stem, isRooted: roots.length > 0, roots };
  });

  const transparency: HiddenStemTransparency[] = [];
  for (const h of hidden) {
    for (const s of h.stems) {
      const revealedAt = grid.filter((c) => c.stem === s.stem).map((c) => c.position);
      transparency.push({
        branchPosition: h.cell.position,
        branch: h.cell.branch,
        hiddenStem: s.stem,
        hiddenStemRole: s.role,
        isRevealed: revealedAt.length > 0,
        revealedAt,
      });
    }
  }

  return {
    capability: 'AVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_ROOTING_TRANSPARENCY_V1_RULE.ruleVersion,
    dayMaster: natal.dayMaster,
    rooting,
    transparency,
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS,
    limitations: LIMITATIONS,
  };
}

// 현재 운의 영향 (current luck influence) — 대운/세운이 원국에 주는 보강/약화 방향.
//
// NON_AUTHORITY / REFERENCE_ONLY (P0-07, Codex audit 2026-08-28). This composes `natalStrength.ts`'s
// quarantined seven-band candidate with luck influence; it inherits the same quarantine and is NOT
// exported from the public `src/features/myungri/index.ts` barrel. Kept only for its own consistency
// tests (`__tests__/currentStrength.test.ts`) — do not add a new caller.
//
// CRITICAL SEPARATION (§5,§6,§25): this NEVER changes the 원국(natal) label. `natalStrength` is the immutable
// baseline (computed from `natal` alone); daewoon/sewoon influence is a SEPARATE directional layer laid on top.
// A supportive 세운 does NOT turn a 중화신약 원국 into 신강 — it says "지금은 지원이 들어온다". Deterministic,
// reuses the frozen 십신 side map (`tenGodSide`) — no new theory, no numeric score (§7,§8).
import type { PillarTenGodProfile } from '../domain/contracts';
import { tenGodSide } from './dayMasterStrengthInputs';
import {
  DEOKBUNAI_MYUNGRI_STRENGTH_V1_RULE,
  evaluateNatalStrength,
  type NatalStrengthProfile,
} from './natalStrength';
import type { NatalPillarContext } from '../domain/contracts';

/** Direction a luck pillar pushes the day master: 지원/약화/혼재/중립. */
export type LuckDirection = 'SUPPORTIVE' | 'DRAINING' | 'MIXED' | 'NEUTRAL';
/** Net current tilt vs the natal baseline (§27). */
export type CombinedDirection = 'MORE_SUPPORTED' | 'MORE_DRAINED' | 'MIXED' | 'STABLE';

export type LuckInfluence = {
  label: string;
  direction: LuckDirection;
  stemTenGodSide: 'SUPPORT' | 'DRAIN';
  branchTenGodSide: 'SUPPORT' | 'DRAIN';
  evidence: string;
};

export type CurrentStrengthContext = {
  /** IMMUTABLE 원국 baseline — luck never mutates it (§6). */
  natalStrength: NatalStrengthProfile;
  daewoon: LuckInfluence | null;
  sewoon: LuckInfluence | null;
  combinedDirection: CombinedDirection;
  warnings: string[];
  algorithmVersion: typeof DEOKBUNAI_MYUNGRI_STRENGTH_V1_RULE.ruleVersion;
};

/** SUPPORT/DRAIN of a luck pillar's 천간십신 + 지지 정기십신 → a single direction (facts-only). */
export function luckInfluence(label: string, profile: PillarTenGodProfile): LuckInfluence {
  const stemSide = tenGodSide(profile.stemTenGod);
  const branchSide = tenGodSide(profile.branchMainTenGod);
  const direction: LuckDirection = stemSide === branchSide ? (stemSide === 'SUPPORT' ? 'SUPPORTIVE' : 'DRAINING') : 'MIXED';
  return {
    label,
    direction,
    stemTenGodSide: stemSide,
    branchTenGodSide: branchSide,
    evidence: `${label}: 천간십신 ${profile.stemTenGod}(${stemSide}) · 지지 정기 ${profile.branchMainTenGod}(${branchSide}) → ${direction}`,
  };
}

function combine(daewoon: LuckInfluence | null, sewoon: LuckInfluence | null): CombinedDirection {
  const dirs = [daewoon?.direction, sewoon?.direction].filter((d): d is LuckDirection => !!d);
  if (dirs.length === 0) return 'STABLE';
  const support = dirs.filter((d) => d === 'SUPPORTIVE').length;
  const drain = dirs.filter((d) => d === 'DRAINING').length;
  if (support > drain) return 'MORE_SUPPORTED';
  if (drain > support) return 'MORE_DRAINED';
  // equal counts: if anything is happening (mixed or offsetting) it's MIXED; all-NEUTRAL is STABLE.
  return dirs.every((d) => d === 'NEUTRAL') ? 'STABLE' : 'MIXED';
}

/**
 * Compose the immutable natal baseline with the current 대운/세운 influence.
 * `daewoonProfile`/`sewoonProfile` are the frozen 십신 profiles of the CURRENT cycles (pass null if unknown).
 * Pure + deterministic. The natal label is produced by `evaluateNatalStrength(natal)` and is never touched by luck.
 */
export function buildCurrentStrengthContext(input: {
  natal: NatalPillarContext;
  daewoon?: { label: string; profile: PillarTenGodProfile } | null;
  sewoon?: { label: string; profile: PillarTenGodProfile } | null;
}): CurrentStrengthContext {
  const natalStrength = evaluateNatalStrength(input.natal);
  const daewoon = input.daewoon ? luckInfluence(input.daewoon.label, input.daewoon.profile) : null;
  const sewoon = input.sewoon ? luckInfluence(input.sewoon.label, input.sewoon.profile) : null;

  const warnings: string[] = [];
  if (!daewoon) warnings.push('현재 대운 미상 — 대운 영향 제외');
  if (!sewoon) warnings.push('현재 세운 미상 — 세운 영향 제외');

  return {
    natalStrength,
    daewoon,
    sewoon,
    combinedDirection: combine(daewoon, sewoon),
    warnings,
    algorithmVersion: DEOKBUNAI_MYUNGRI_STRENGTH_V1_RULE.ruleVersion,
  };
}

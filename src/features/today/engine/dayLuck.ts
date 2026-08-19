// 일운 (day luck) — the one capability the engine did not yet expose, composed from primitives that ALL
// already exist and are frozen/approved. It calls the FROZEN day-pillar arithmetic (calculateDayPillar) and
// the pillar-GENERIC Myungri fact builders (buildTenGodProfile / buildRelationsToNatal) — no engine rule is
// modified or reimplemented. The result is today's 일진 pillar + its 십신 and 합/충/형/파/해 against the natal
// chart, exactly as 세운/월운 are built for their pillars.
import { calculateDayPillar, DEOKBUNAI_SAJU_DAY_V1_RULE } from '@/features/interpretation';
import { buildRelationsToNatal, buildTenGodProfile } from '@/features/myungri';
import type { NatalPillarContext, PillarTenGodProfile, RelationsToNatal } from '@/features/myungri/domain/contracts';
import type { SexagenaryPillar } from '@/features/interpretation/saju/contracts';
import type { LocalCivilDate } from '@/features/today/engine/fortuneDate';

export type DayLuck =
  | { available: false; reason: 'DAY_PILLAR_FAILED' | 'TEN_GOD_FAILED' }
  | {
      available: true;
      /** 일진 pillar (stem + branch) for the civil date. */
      pillar: SexagenaryPillar;
      /** 일진 십신 relative to the natal 일간 (day master). */
      tenGods: PillarTenGodProfile;
      /** 일진 pillar's 합/충/형/파/해 against each natal pillar. */
      relationsToNatal: RelationsToNatal;
      dayPillarRuleVersion: string;
    };

export function calculateDayLuck(input: { natal: NatalPillarContext; civilDate: LocalCivilDate }): DayLuck {
  const dp = calculateDayPillar(input.civilDate);
  if (!dp.ok) return { available: false, reason: 'DAY_PILLAR_FAILED' };
  const pillar = dp.value;
  const tenGods = buildTenGodProfile(input.natal.dayMaster, pillar);
  if (!tenGods) return { available: false, reason: 'TEN_GOD_FAILED' };
  const relationsToNatal = buildRelationsToNatal(pillar, input.natal);
  return {
    available: true,
    pillar,
    tenGods,
    relationsToNatal,
    dayPillarRuleVersion: DEOKBUNAI_SAJU_DAY_V1_RULE.ruleVersion,
  };
}

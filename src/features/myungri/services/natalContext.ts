// The read-only seam FROM the frozen SAJU engine INTO the Myungri time-axis. A caller runs the
// frozen `calculateFourPillars` / `executeSaju`, then adapts the result here — the time-axis never
// re-derives the natal chart, it consumes it. Hour is carried only when the frozen engine marks it
// AVAILABLE (시주 미상 → omitted, so downstream 십신/관계 simply skip the hour position).
import type { SajuFourPillars } from '../../interpretation';
import type { NatalPillarContext } from '../domain/contracts';

export function natalContextFromFourPillars(
  fourPillars: SajuFourPillars,
): NatalPillarContext {
  const context: NatalPillarContext = {
    dayMaster: fourPillars.day.stem,
    pillars: {
      year: { stem: fourPillars.year.stem, branch: fourPillars.year.branch },
      month: { stem: fourPillars.month.stem, branch: fourPillars.month.branch },
      day: { stem: fourPillars.day.stem, branch: fourPillars.day.branch },
    },
  };
  if (fourPillars.hour.status === 'AVAILABLE') {
    context.pillars.hour = {
      stem: fourPillars.hour.pillar.stem,
      branch: fourPillars.hour.pillar.branch,
    };
  }
  return context;
}

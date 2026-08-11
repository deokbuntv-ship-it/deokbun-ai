// Structural validation of a normalized ZiweiChart (directive §25). Checks SHAPE
// only — it never judges astrological correctness (that would require verified
// references; see docs/ZIWEI_SCHOOL_DIFFERENCES.md). A malformed Core result must
// surface as `calculation_failed`, not a silently-wrong chart.
import type { ZiweiChart } from '../domain/ziweiTypes';

export type ZiweiValidationResult = { valid: boolean; errors: string[] };

export function validateZiweiChart(chart: ZiweiChart): ZiweiValidationResult {
  const errors: string[] = [];

  if (chart.palaces.length !== 12) errors.push('palace_count_not_12');
  if (!chart.soulPalaceBranch) errors.push('soul_palace_branch_missing');
  if (!chart.bodyPalaceBranch) errors.push('body_palace_branch_missing');
  if (!chart.fiveElementsClass) errors.push('five_elements_class_missing');
  if (!chart.soul) errors.push('soul_missing');
  if (!chart.body) errors.push('body_missing');

  const bodyPalaces = chart.palaces.filter((p) => p.isBodyPalace).length;
  if (bodyPalaces !== 1) errors.push('body_palace_count_not_1');

  // 命宮 must exist among the palaces (matched by its branch).
  if (chart.soulPalaceBranch && !chart.palaces.some((p) => p.earthlyBranch === chart.soulPalaceBranch)) {
    errors.push('soul_palace_not_in_palaces');
  }

  return { valid: errors.length === 0, errors };
}

// ZiweiResult → engine-external EngineEvidence (directive §21/§22). Produces a
// BOUNDED, FACTS-ONLY evidence object for the LLM/cross-analysis layer. It states
// what the chart IS (命宮, 五行局, 命主/身主, 주요 별, 四化) — it does NOT interpret
// ("재물운이 좋다" 등). Availability maps onto the shared EngineEvidence contract so
// the pipeline treats an unavailable ziwei engine truthfully.
import type { EngineEvidence, EngineEvidenceAvailability } from '@/features/analysis';

import type { ZiweiChart, ZiweiResult } from '../domain/ziweiTypes';

function mapAvailability(a: ZiweiResult['availability']): EngineEvidenceAvailability {
  switch (a) {
    case 'available':
    case 'partial':
      return 'available';
    case 'missing_birth_time':
      return 'missing_birth_time';
    default:
      return 'calculation_failed';
  }
}

// 命宮 is located by its branch (robust across output languages / palace order).
function findSoulPalace(chart: ZiweiChart) {
  return chart.palaces.find((p) => p.earthlyBranch === chart.soulPalaceBranch);
}

function starLabels(stars: { name: string; transformation?: string }[]): string {
  return stars.map((s) => (s.transformation ? `${s.name}(${s.transformation})` : s.name)).join('·');
}

function factSummary(chart: ZiweiChart): string {
  const ming = findSoulPalace(chart);
  const mingStars = ming ? starLabels(ming.majorStars) : '';
  const parts = [
    `命宮 ${chart.soulPalaceBranch}`,
    `五行局 ${chart.fiveElementsClass}`,
    `命主 ${chart.soul}`,
    `身主 ${chart.body}`,
  ];
  if (mingStars) parts.push(`命宮 주성 ${mingStars}`);
  return parts.join(' · ');
}

function factDetail(chart: ZiweiChart): string {
  const palaceLines = chart.palaces.map((p) => {
    const stars = starLabels([...p.majorStars, ...p.minorStars]);
    return `${p.name}(${p.earthlyBranch}${p.isBodyPalace ? '·身' : ''})${stars ? `: ${stars}` : ''}`;
  });
  const sihwa = chart.transformations
    .map((t) => `${t.star} ${t.transformation}→${t.palaceName}`)
    .join(', ');
  const lines = [...palaceLines];
  if (sihwa) lines.push(`四化: ${sihwa}`);
  return lines.join('\n');
}

export function toZiweiEvidence(result: ZiweiResult): EngineEvidence {
  const availability = mapAvailability(result.availability);
  if (result.chart) {
    return {
      availability,
      summary: factSummary(result.chart),
      detail: factDetail(result.chart),
    };
  }
  return { availability };
}

// ZiweiResult → engine-external EngineEvidence (directive §14/§15/§21/§22). Produces a
// BOUNDED, FACTS-ONLY evidence object for the LLM/cross-analysis layer. It states what the
// chart IS (命宮, 五行局, 命主/身主, 주요 별, 四化) — it does NOT interpret ("재물운이 좋다" 등).
// Availability maps onto the shared EngineEvidence contract so the pipeline treats an
// unavailable ziwei engine truthfully.
//
// STRUCTURED SECTIONS (Ziwei V1): additionally emits `sections` (명반 기준 / 12궁 / 사화 /
// 근거·한계) so the grounding renderer delivers the facts to the prompt — mirroring the Saju
// evidence adapter. The `근거·한계` section carries the engine identity + ruleset version, the
// Saju↔Ziwei calendar-convention difference (자미 = 음력월 간지; NOT a bug), and the
// characterization limitation (별·四化 배치는 iztro default 학파 기준; 완전 독립 검증 아님).
// CONVERTER ONLY: no calculation, no interpretation, nothing the Core did not produce.
import type { EngineEvidence, EngineEvidenceAvailability, EngineEvidenceSection } from '@/features/analysis';

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

// ── structured sections (delivered to the prompt via the grounding renderer) ──────────
function chartBasisLines(chart: ZiweiChart): string[] {
  const lines = [
    `命宮 ${chart.soulPalaceBranch} · 身宮 ${chart.bodyPalaceBranch}`,
    `五行局 ${chart.fiveElementsClass} · 命主 ${chart.soul} · 身主 ${chart.body}`,
  ];
  const cal = [chart.lunarDate ? `음력 ${chart.lunarDate}` : '', chart.chineseDate ? `간지 ${chart.chineseDate}` : '']
    .filter(Boolean)
    .join(' · ');
  if (cal) lines.push(cal);
  const t = [chart.timeRange, chart.zodiac ? `띠 ${chart.zodiac}` : ''].filter(Boolean).join(' · ');
  if (t) lines.push(t);
  return lines;
}

function palaceLines(chart: ZiweiChart): string[] {
  return chart.palaces.map((p) => {
    const major = starLabels(p.majorStars);
    return `${p.name}(${p.earthlyBranch}${p.isBodyPalace ? '·身' : ''})${major ? `: ${major}` : ''}`;
  });
}

function provenanceLines(chart: ZiweiChart): string[] {
  return [
    `엔진 자미두수(${chart.library}@${chart.libraryVersion}) · 규칙 ${chart.ruleSetVersion} · 출력 ko-KR`,
    // Assumptions — the REAL deterministic assumptions of the Ziwei calculation (parity with the Saju
    // evidence's 가정: line). These are provider/profile facts, not fabricated interpretation.
    '가정: exact 시진(출생 시간) 필요 · fixLeap=true(윤달 처리) · 별·四化 배치는 provider(iztro default 학파) 소유(재계산 아님).',
    // Validation HONESTY (Codex PART B): the calendar/干支 foundation is independently cross-checked, but
    // palace/star/五行局 placements are provider-characterization-locked — NOT independently verified.
    '검증 범위: 일·시·년 간지(달력 기반)만 독립 오라클(lunar-javascript)로 교차 검증됨. 명궁·신궁·오행국·명주·신주·궁/성계 배치·四化는 iztro default 학파 기준의 결정론적 provider 계산이며 제2 권위 오라클로 독립 검증된 것이 아닙니다(특성 고정, characterization-locked).',
    '역법 관례: 자미두수는 자체 음력월 간지를 사용하므로, 명리(立春·12절 기준)와 월주 간지 표기가 다를 수 있습니다 — 계산 오류가 아니라 학문별 관례 차이입니다.',
    // Honest limitation of the actual code path: raw local hour → 时辰, no timezone/LMT/true-solar-time.
    '한계: 시(時)는 입력 시각을 그대로 时辰(0~12)에 매핑하며 타임존/지방시(LMT)/진태양시 보정을 적용하지 않습니다(현재 구현 기준). 개별 성계/四化 배치의 절대 정확도는 학파에 의존합니다.',
  ];
}

function factSections(chart: ZiweiChart): EngineEvidenceSection[] {
  const sections: EngineEvidenceSection[] = [
    { label: '명반 기준', lines: chartBasisLines(chart) },
    { label: '12궁', lines: palaceLines(chart) },
  ];
  const sihwa = chart.transformations.map((t) => `${t.star} ${t.transformation} → ${t.palaceName}`);
  if (sihwa.length > 0) sections.push({ label: '사화(四化)', lines: sihwa });
  sections.push({ label: '근거·한계', lines: provenanceLines(chart) });
  return sections;
}

export function toZiweiEvidence(result: ZiweiResult): EngineEvidence {
  const availability = mapAvailability(result.availability);
  if (result.chart) {
    return {
      availability,
      summary: factSummary(result.chart),
      detail: factDetail(result.chart),
      sections: factSections(result.chart),
      // Natal chart only. 大限(decadal) is natal structure — intentionally excluded from V1
      // grounding, and no current 유년/流年 timing is computed. Ziwei therefore does NOT unlock
      // the LLM's futureFlow; timing stays gated on the Saju 대운/세운/월운 evidence (§24).
      hasTimingEvidence: false,
    };
  }
  return { availability };
}

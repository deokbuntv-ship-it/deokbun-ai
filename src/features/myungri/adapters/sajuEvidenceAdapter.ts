// SajuEngineResult (+ Myungri time-axis facts) → app-level EngineEvidence (facts-only).
//
// CONVERTER ONLY (sprint §3): this NEVER calculates. Every value here is read from the already-
// computed frozen SajuEngineResult and the frozen-consuming Myungri fact modules. It states what
// the chart IS (4주·일간·오행·십신·지장간·대운·통근/투간·월령/득령) — it does NOT interpret
// ("재물운이 좋다"), score, or infer strength. Provenance (立春/12-Jie + ruleVersions) is preserved
// into the detail so the grounding can trace the year/month attribution basis (sprint §5).
import type { EngineEvidence, EngineEvidenceAvailability } from '@/features/analysis';
import {
  EARTHLY_BRANCH_LABELS,
  FIVE_ELEMENT_LABELS,
  HEAVENLY_STEM_LABELS,
  HIDDEN_STEM_ROLE_LABELS,
  TEN_GOD_LABELS,
  type EarthlyBranch,
  type FiveElement,
  type HeavenlyStem,
  type SajuDerivedPillarAnnotation,
  type SajuEngineResult,
  type SajuFourPillars,
  type SexagenaryPillar,
} from '@/features/interpretation';
import type { DaewoonTenGodsResult } from '../services/daewoonTenGods';
import type { MonthCommandResult } from '../services/monthCommand';
import type { RootingTransparencyResult } from '../services/rootingTransparency';
import type { SewoonResult, WolwoonResult } from '../domain/contracts';

export type SajuEvidenceBundle = {
  engineResult: SajuEngineResult;
  monthCommand?: MonthCommandResult | null;
  rooting?: RootingTransparencyResult | null;
  daewoonTenGods?: DaewoonTenGodsResult | null;
  sewoon?: SewoonResult | null;
  wolwoon?: WolwoonResult | null;
};

const stemH = (s: HeavenlyStem): string => HEAVENLY_STEM_LABELS[s].hanja;
const branchH = (b: EarthlyBranch): string => EARTHLY_BRANCH_LABELS[b].hanja;
const gz = (p: { stem: HeavenlyStem; branch: EarthlyBranch }): string => stemH(p.stem) + branchH(p.branch);
const el = (e: FiveElement): string => FIVE_ELEMENT_LABELS[e].hangul;
const tg = (g: SajuDerivedPillarAnnotation['stem']['tenGod']): string => TEN_GOD_LABELS[g].hangul;
const role = (r: 'MAIN' | 'MIDDLE' | 'RESIDUAL'): string => HIDDEN_STEM_ROLE_LABELS[r].hangul;

function pillarLabel(p: SexagenaryPillar): string {
  return `${gz(p)}(${stemH(p.stem)}${branchH(p.branch)})`;
}

function hourText(hour: SajuFourPillars['hour']): string {
  return hour.status === 'AVAILABLE' ? gz(hour.pillar) : '미상';
}

/** Availability from the frozen engine status — never upgraded. */
function mapAvailability(result: SajuEngineResult): EngineEvidenceAvailability {
  switch (result.status) {
    case 'SUCCESS':
    case 'PARTIAL':
      return 'available';
    default:
      return 'calculation_failed';
  }
}

function buildSummary(fp: SajuFourPillars, bundle: SajuEvidenceBundle): string {
  const counts = bundle.engineResult.status === 'UNAVAILABLE' ? null : bundle.engineResult.output.fiveElementDistribution.direct.counts;
  const dayStem = fp.day.stem;
  const parts = [
    `사주 년 ${gz(fp.year)} · 월 ${gz(fp.month)} · 일 ${gz(fp.day)} · 시 ${hourText(fp.hour)}`,
    `일간 ${stemH(dayStem)}`,
  ];
  if (counts) {
    const dist = (['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'] as FiveElement[])
      .map((e) => `${el(e)}${counts[e]}`)
      .join(' ');
    parts.push(`오행 ${dist}`);
  }
  return parts.join(' / ');
}

function pillarTenGodLine(name: string, p: SajuDerivedPillarAnnotation): string {
  const hidden = p.branch.hiddenStems
    .map((h) => `${stemH(h.stem)}(${role(h.role)}·${tg(h.tenGod)})`)
    .join(' ');
  return `${name}주 천간 ${tg(p.stem.tenGod)} / 지지 ${el(p.branch.element)} 지장간 ${hidden}`;
}

function buildDetail(bundle: SajuEvidenceBundle): string {
  const result = bundle.engineResult;
  if (result.status === 'UNAVAILABLE') return '';
  const { fourPillars, derivedFacts, provenance } = result.output;
  const lines: string[] = [];

  lines.push(
    `[명식] 년 ${pillarLabel(fourPillars.year)} · 월 ${pillarLabel(fourPillars.month)} · 일 ${pillarLabel(fourPillars.day)} · 시 ${hourText(fourPillars.hour)}`,
  );
  lines.push(pillarTenGodLine('년', derivedFacts.pillars.year));
  lines.push(pillarTenGodLine('월', derivedFacts.pillars.month));
  lines.push(pillarTenGodLine('일', derivedFacts.pillars.day));
  if (derivedFacts.pillars.hour) lines.push(pillarTenGodLine('시', derivedFacts.pillars.hour));

  const mc = bundle.monthCommand;
  if (mc && mc.capability === 'AVAILABLE') {
    lines.push(
      `[월령] 월지 ${branchH(mc.monthBranch)}(${el(mc.monthElement)}) · 일간 ${el(mc.dayMasterElement)} 왕상휴수사=${mc.dayMasterSeasonalPhase} · 득령여부=${mc.commandStatus === 'IN_COMMAND' ? '득령' : '실령'}`,
    );
  }
  const rt = bundle.rooting;
  if (rt && rt.capability === 'AVAILABLE') {
    const rooted = rt.rooting
      .filter((r) => r.isRooted)
      .map((r) => `${stemH(r.stem)}(${r.roots.map((x) => branchH(x.branch)).join(',')})`)
      .join(' ');
    lines.push(`[통근] ${rooted || '없음'}`);
  }
  const dw = bundle.daewoonTenGods;
  if (dw && dw.capability === 'AVAILABLE') {
    const cyc = dw.cycles
      .slice(0, 10)
      .map((c) => `${c.startAgeInclusive}세 ${gz(c.tenGods)}(${tg(c.tenGods.stemTenGod)})`)
      .join(' · ');
    lines.push(`[대운] ${cyc}`);
  }
  const se = bundle.sewoon;
  if (se && se.capability === 'AVAILABLE') {
    lines.push(`[세운 ${se.targetYear}] ${gz(se.pillar)}(${tg(se.tenGods.stemTenGod)})`);
  }
  const wo = bundle.wolwoon;
  if (wo && wo.capability === 'AVAILABLE') {
    lines.push(`[월운 ${wo.targetYear}·${wo.lunarMonth}월] ${gz(wo.pillar)}(${tg(wo.tenGods.stemTenGod)})`);
  }

  // Provenance (sprint §5) — the 立春/12-Jie attribution basis + rule versions survive to grounding.
  lines.push(
    `[출처] 년주=${provenance.yearMonthAttributionRule.yearBoundary} · 월주=${provenance.yearMonthAttributionRule.monthBoundary} · ${provenance.productRule.ruleVersion} · 십신 ${derivedFacts.ruleVersions.tenGods}`,
  );
  return lines.join('\n');
}

export function toSajuEvidence(bundle: SajuEvidenceBundle): EngineEvidence {
  const availability = mapAvailability(bundle.engineResult);
  if (availability !== 'available' || bundle.engineResult.status === 'UNAVAILABLE') {
    return { availability };
  }
  return {
    availability,
    summary: buildSummary(bundle.engineResult.output.fourPillars, bundle),
    detail: buildDetail(bundle),
  };
}

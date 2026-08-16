// SajuEngineResult (+ Myungri facts) → app-level EngineEvidence (facts-only, STRUCTURED sections).
//
// CONVERTER ONLY (sprint §3): never calculates. Reads already-computed frozen facts + Myungri fact
// modules and FORMATS them into labeled sections the grounding renderer delivers to the prompt.
// Preserves EVERYTHING computed upstream (Codex FIX #1): 명식·십신·지장간·오행·관계(합충형파해/삼합/방합)·
// 통근·투간·월령/득령·대운·대운십신·세운·월운 + provenance(立春/12-Jie + ruleVersions) + limitations.
// Transparency(투간) is serialized as a first-class section (Codex FIX #2). No interpretation.
import type { EngineEvidence, EngineEvidenceAvailability, EngineEvidenceSection } from '@/features/analysis';
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
import type { NatalRelationsResult } from '../services/natalRelations';
import type { RootingTransparencyResult } from '../services/rootingTransparency';
import type {
  BranchPairRelationKind,
  BranchSetRelationKind,
  StemRelationKind,
} from '../rules/pillarRelations';
import type { SewoonResult, WolwoonResult } from '../domain/contracts';

export type SajuEvidenceBundle = {
  engineResult: SajuEngineResult;
  natalRelations?: NatalRelationsResult | null;
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

const STEM_REL: Record<StemRelationKind, string> = { STEM_COMBINATION: '천간합', STEM_CLASH: '천간충' };
const BRANCH_REL: Record<BranchPairRelationKind, string> = {
  BRANCH_SIX_COMBINATION: '육합', BRANCH_CLASH: '충', BRANCH_HALF_THREE_HARMONY: '반합',
  BRANCH_PUNISHMENT: '형', BRANCH_SELF_PUNISHMENT: '자형', BRANCH_DESTRUCTION: '파', BRANCH_HARM: '해',
};
const SET_REL: Record<BranchSetRelationKind, string> = {
  BRANCH_THREE_HARMONY: '삼합', BRANCH_DIRECTIONAL_UNION: '방합', BRANCH_THREE_PUNISHMENT: '삼형',
};

function hourText(hour: SajuFourPillars['hour']): string {
  return hour.status === 'AVAILABLE' ? gz(hour.pillar) : '미상';
}
function pillarLabel(p: SexagenaryPillar): string {
  return `${gz(p)}(${stemH(p.stem)}${branchH(p.branch)})`;
}
function pillarTenGodLine(name: string, p: SajuDerivedPillarAnnotation): string {
  const hidden = p.branch.hiddenStems.map((h) => `${stemH(h.stem)}(${role(h.role)}·${tg(h.tenGod)})`).join(' ');
  return `${name}주: 천간 ${tg(p.stem.tenGod)} / 지지 ${el(p.branch.element)} 지장간 ${hidden}`;
}

function mapAvailability(result: SajuEngineResult): EngineEvidenceAvailability {
  return result.status === 'SUCCESS' || result.status === 'PARTIAL' ? 'available' : 'calculation_failed';
}

export function toSajuEvidence(bundle: SajuEvidenceBundle): EngineEvidence {
  const availability = mapAvailability(bundle.engineResult);
  if (availability !== 'available' || bundle.engineResult.status === 'UNAVAILABLE') {
    return { availability };
  }
  const { fourPillars, derivedFacts, fiveElementDistribution, provenance } = bundle.engineResult.output;
  const sections: EngineEvidenceSection[] = [];

  // 명식 (natal four pillars)
  sections.push({
    label: '명식(사주)',
    lines: [
      `년 ${pillarLabel(fourPillars.year)} · 월 ${pillarLabel(fourPillars.month)} · 일 ${pillarLabel(fourPillars.day)} · 시 ${hourText(fourPillars.hour)}`,
      `일간 ${stemH(fourPillars.day.stem)}`,
    ],
  });

  // 오행 분포
  const counts = fiveElementDistribution.direct.counts;
  sections.push({
    label: '오행 분포',
    lines: [(['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'] as FiveElement[]).map((e) => `${el(e)} ${counts[e]}`).join(' · ')],
  });

  // 십신 · 지장간
  const tgLines = [pillarTenGodLine('년', derivedFacts.pillars.year), pillarTenGodLine('월', derivedFacts.pillars.month), pillarTenGodLine('일', derivedFacts.pillars.day)];
  if (derivedFacts.pillars.hour) tgLines.push(pillarTenGodLine('시', derivedFacts.pillars.hour));
  sections.push({ label: '십신·지장간', lines: tgLines });

  // 관계 (natal relations) — FIX #1
  const nr = bundle.natalRelations;
  if (nr) {
    const relLines: string[] = [];
    for (const s of nr.stem) relLines.push(`${STEM_REL[s.relation.kind]} ${stemH(s.relation.stems[0])}${stemH(s.relation.stems[1])}(${s.positions.join('-')})`);
    for (const b of nr.branch) relLines.push(`${BRANCH_REL[b.relation.kind]} ${branchH(b.relation.branches[0])}${branchH(b.relation.branches[1])}(${b.positions.join('-')})`);
    for (const st of nr.sets) relLines.push(`${SET_REL[st.kind]} ${st.branches.map(branchH).join('')}`);
    sections.push({ label: '원국 관계(합충형파해·삼합/방합)', lines: relLines.length ? relLines : ['특이 관계 없음'] });
  }

  // 통근 (rooting) + 투간 (transparency) — FIX #2 (transparency was previously discarded)
  const rt = bundle.rooting;
  if (rt && rt.capability === 'AVAILABLE') {
    const rooted = rt.rooting.filter((r) => r.isRooted).map((r) => `${stemH(r.stem)}(${r.roots.map((x) => branchH(x.branch)).join(',')})`);
    sections.push({ label: '통근', lines: [rooted.length ? rooted.join(' ') : '없음'] });
    const revealed = rt.transparency.filter((t) => t.isRevealed).map((t) => `${branchH(t.branch)}장간 ${stemH(t.hiddenStem)}→${t.revealedAt.join(',')}`);
    sections.push({ label: '투간', lines: [revealed.length ? revealed.join(' ') : '없음'] });
  }

  // 월령 · 득령
  const mc = bundle.monthCommand;
  if (mc && mc.capability === 'AVAILABLE') {
    sections.push({
      label: '월령·득령(입력 사실)',
      lines: [`월지 ${branchH(mc.monthBranch)}(${el(mc.monthElement)}) · 일간 왕상휴수사=${mc.dayMasterSeasonalPhase} · ${mc.commandStatus === 'IN_COMMAND' ? '득령' : '실령'}`],
    });
  }

  // 대운 (+ 대운십신), 세운, 월운 — TIME
  const dw = bundle.daewoonTenGods;
  const hasDaewoon = !!dw && dw.capability === 'AVAILABLE';
  if (dw && dw.capability === 'AVAILABLE') {
    sections.push({
      label: '대운(+대운십신)',
      lines: dw.cycles.slice(0, 10).map((c) => `${c.startAgeInclusive}세~ ${gz(c.tenGods)} ${tg(c.tenGods.stemTenGod)}`),
    });
  }
  const se = bundle.sewoon;
  const wo = bundle.wolwoon;
  const timeLines: string[] = [];
  if (se && se.capability === 'AVAILABLE') timeLines.push(`세운 ${se.targetYear}: ${gz(se.pillar)} ${tg(se.tenGods.stemTenGod)}`);
  if (wo && wo.capability === 'AVAILABLE') timeLines.push(`월운 ${wo.targetYear}·${wo.lunarMonth}월: ${gz(wo.pillar)} ${tg(wo.tenGods.stemTenGod)}`);
  if (timeLines.length) sections.push({ label: '세운·월운', lines: timeLines });

  const hasTimingEvidence = hasDaewoon || (se?.capability === 'AVAILABLE') || (wo?.capability === 'AVAILABLE');

  // 근거·한계 (provenance + limitations) — provenance survives to grounding (FIX #1/#3, §16)
  sections.push({
    label: '근거·한계',
    lines: [
      `엔진 SAJU · 년주=${provenance.yearMonthAttributionRule.yearBoundary} · 월주=${provenance.yearMonthAttributionRule.monthBoundary}`,
      `ruleVersion ${provenance.productRule.ruleVersion} · 십신 ${derivedFacts.ruleVersions.tenGods}`,
      fourPillars.hour.status === 'AVAILABLE' ? '시주 확정' : '시주 미상(시간 의존 해석 제한)',
      '강약/용신/격국/12운성/12신살은 V1 미계산(사실로 단정 금지)',
    ],
  });

  const summary = `사주 ${gz(fourPillars.year)}·${gz(fourPillars.month)}·${gz(fourPillars.day)}·${hourText(fourPillars.hour)} / 일간 ${stemH(fourPillars.day.stem)}`;
  const detail = sections.map((s) => `[${s.label}] ${s.lines.join(' | ')}`).join('\n');
  return { availability, summary, detail, sections, hasTimingEvidence };
}

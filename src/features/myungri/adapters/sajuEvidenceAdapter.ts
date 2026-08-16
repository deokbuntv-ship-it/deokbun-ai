// SajuEngineResult (+ Myungri facts) → app-level EngineEvidence (facts-only, STRUCTURED sections).
//
// CONVERTER ONLY (sprint §3): never calculates. Reads already-computed frozen facts + Myungri fact
// modules and FORMATS them into labeled sections the grounding renderer delivers to the prompt.
// Preserves EVERYTHING computed upstream: 명식·십신·지장간·오행·관계(합충형파해/삼합/방합)·통근·투간·
// 월령/득령·대운(방향·시작/종료 나이·현재 대운·대운십신)·세운(+원국관계)·월운(+원국관계·세운관계)·
// 원국↔대운↔세운↔월운 연결(교차 합충형파해·삼합/방합) + provenance(立春/12-Jie + ruleVersions) +
// per-layer assumptions/limitations + structured timing anchors. No interpretation.
import type {
  EngineEvidence,
  EngineEvidenceAvailability,
  EngineEvidenceSection,
  EngineEvidenceTimingAnchors,
} from '@/features/analysis';
import {
  EARTHLY_BRANCH_LABELS,
  FIVE_ELEMENT_LABELS,
  HEAVENLY_STEM_LABELS,
  HIDDEN_STEM_ROLE_LABELS,
  TEN_GOD_LABELS,
  type EarthlyBranch,
  type FiveElement,
  type HeavenlyStem,
  type SajuDaewoonResult,
  type SajuDerivedPillarAnnotation,
  type SajuEngineResult,
  type SajuFourPillars,
  type SajuPillarPosition,
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
import type {
  MyungriTimeAxisResult,
  RelationsToNatal,
  SewoonResult,
  TimeAxisLayer,
  WolwoonResult,
} from '../domain/contracts';

export type SajuEvidenceBundle = {
  engineResult: SajuEngineResult;
  natalRelations?: NatalRelationsResult | null;
  monthCommand?: MonthCommandResult | null;
  rooting?: RootingTransparencyResult | null;
  /** Raw ENGINE-12 Daewoon (for direction + start/end age). Facts are read, never recomputed. */
  daewoon?: SajuDaewoonResult | null;
  daewoonTenGods?: DaewoonTenGodsResult | null;
  /** Ordinal of the Daewoon cycle active at the current age, when deterministically resolvable. */
  activeCycleOrdinal?: number | null;
  sewoon?: SewoonResult | null;
  wolwoon?: WolwoonResult | null;
  /** Connected 원국↔대운↔세운↔월운 axis (cross-layer relations). */
  timeAxis?: MyungriTimeAxisResult | null;
  /** Gregorian birth year — an allowed timing anchor (so "2024년생" is not flagged unsupported). */
  birthGregorianYear?: number | null;
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
const POS: Record<SajuPillarPosition, string> = { YEAR: '년', MONTH: '월', DAY: '일', HOUR: '시' };
const LAYER: Record<TimeAxisLayer, string> = {
  NATAL_YEAR: '년주', NATAL_MONTH: '월주', NATAL_DAY: '일주', NATAL_HOUR: '시주',
  DAEWOON: '대운', SEWOON: '세운', WOLWOON: '월운',
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
function relationsToNatalText(rel: RelationsToNatal): string {
  const parts: string[] = [];
  for (const s of rel.stem) parts.push(`${POS[s.position]}간 ${STEM_REL[s.relation.kind]}`);
  for (const b of rel.branch) parts.push(`${POS[b.position]}지 ${BRANCH_REL[b.relation.kind]}`);
  return parts.join(', ');
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

  // 관계 (natal relations)
  const nr = bundle.natalRelations;
  if (nr) {
    const relLines: string[] = [];
    for (const s of nr.stem) relLines.push(`${STEM_REL[s.relation.kind]} ${stemH(s.relation.stems[0])}${stemH(s.relation.stems[1])}(${s.positions.join('-')})`);
    for (const b of nr.branch) relLines.push(`${BRANCH_REL[b.relation.kind]} ${branchH(b.relation.branches[0])}${branchH(b.relation.branches[1])}(${b.positions.join('-')})`);
    for (const st of nr.sets) relLines.push(`${SET_REL[st.kind]} ${st.branches.map(branchH).join('')}`);
    sections.push({ label: '원국 관계(합충형파해·삼합/방합)', lines: relLines.length ? relLines : ['특이 관계 없음'] });
  }

  // 통근 (rooting) + 투간 (transparency)
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

  // 대운 (방향 + 시작/종료 나이 + 현재 대운 + 대운십신)
  const dw = bundle.daewoonTenGods;
  const hasDaewoon = !!dw && dw.capability === 'AVAILABLE';
  if (dw && dw.capability === 'AVAILABLE') {
    const direction =
      bundle.daewoon && bundle.daewoon.capability === 'AVAILABLE'
        ? bundle.daewoon.direction === 'FORWARD' ? '순행' : '역행'
        : null;
    const lines = dw.cycles.slice(0, 10).map((c) => {
      const marker = bundle.activeCycleOrdinal != null && c.ordinal === bundle.activeCycleOrdinal ? '〈현재〉 ' : '';
      // Preserve the canonical ENGINE-12 cycle ORDINAL (Codex FIX #1) + the FULL ten-god profile
      // (천간 + 지지 정기 + 지장간 십신). Read verbatim; never renumbered from array position.
      const hidden = c.tenGods.hiddenStemTenGods.map((h) => `${stemH(h.stem)}(${role(h.role)}·${tg(h.tenGod)})`).join(' ');
      return `${marker}제${c.ordinal}대운 ${c.startAgeInclusive}~${c.endAgeInclusive}세 ${gz(c.tenGods)} 천간${tg(c.tenGods.stemTenGod)}/지지${tg(c.tenGods.branchMainTenGod)} 지장간 ${hidden}`;
    });
    sections.push({ label: `대운(+대운십신)${direction ? ` · ${direction}` : ''}`, lines });
  }

  // 세운 · 월운 (+ 원국관계 / 세운관계)
  const se = bundle.sewoon;
  const wo = bundle.wolwoon;
  const timeLines: string[] = [];
  if (se && se.capability === 'AVAILABLE') {
    const rel = relationsToNatalText(se.relationsToNatal);
    timeLines.push(`세운 ${se.targetYear}: ${gz(se.pillar)} ${tg(se.tenGods.stemTenGod)}${rel ? ` · 원국관계 ${rel}` : ''}`);
  }
  if (wo && wo.capability === 'AVAILABLE') {
    const rel = relationsToNatalText(wo.relationsToNatal);
    const sewoonRel = [
      wo.relationToSewoon.stem ? STEM_REL[wo.relationToSewoon.stem.kind] : '',
      ...wo.relationToSewoon.branch.map((b) => BRANCH_REL[b.kind]),
    ].filter(Boolean).join(',');
    timeLines.push(
      `월운 ${wo.targetYear}·${wo.lunarMonth}월: ${gz(wo.pillar)} ${tg(wo.tenGods.stemTenGod)}` +
        `${rel ? ` · 원국관계 ${rel}` : ''}${sewoonRel ? ` · 세운관계 ${sewoonRel}` : ''}`,
    );
  }
  if (timeLines.length) sections.push({ label: '세운·월운', lines: timeLines });

  // 원국 ↔ 대운 ↔ 세운 ↔ 월운 connected time-axis (cross-layer relations, facts only)
  const ax = bundle.timeAxis;
  if (ax && ax.capability === 'AVAILABLE') {
    const axisLines: string[] = [];
    for (const r of ax.crossLayerStemRelations) axisLines.push(`${LAYER[r.from]}↔${LAYER[r.to]} ${STEM_REL[r.relation.kind]}`);
    for (const r of ax.crossLayerBranchRelations) axisLines.push(`${LAYER[r.from]}↔${LAYER[r.to]} ${BRANCH_REL[r.relation.kind]}`);
    for (const s of ax.branchSetRelations) axisLines.push(`${SET_REL[s.kind]} ${s.branches.map(branchH).join('')}`);
    sections.push({ label: '시간축 연결(원국↔대운↔세운↔월운)', lines: axisLines.length ? axisLines : ['현재 교차 관계 없음'] });
  }

  const hasTimingEvidence = hasDaewoon || (se?.capability === 'AVAILABLE') || (wo?.capability === 'AVAILABLE');

  // structured timing anchors (allowlist for timing validation — Codex pipeline FIX #2 + FIX A)
  const anchorYears = new Set<number>();
  if (typeof bundle.birthGregorianYear === 'number') anchorYears.add(bundle.birthGregorianYear);
  if (se?.capability === 'AVAILABLE') anchorYears.add(se.targetYear);
  if (wo?.capability === 'AVAILABLE') anchorYears.add(wo.targetYear);
  let daewoonAgeSpan: EngineEvidenceTimingAnchors['daewoonAgeSpan'] = null;
  if (dw && dw.capability === 'AVAILABLE' && dw.cycles.length > 0) {
    daewoonAgeSpan = {
      min: dw.cycles[0].startAgeInclusive,
      max: dw.cycles[dw.cycles.length - 1].endAgeInclusive,
    };
  }
  const timingAnchors: EngineEvidenceTimingAnchors = {
    years: [...anchorYears].sort((a, b) => a - b),
    referenceYear: se?.capability === 'AVAILABLE' ? se.targetYear : null, // resolves 올해/내년/내후년
    daewoonAgeSpan,
    hasMonthlyEvidence: wo?.capability === 'AVAILABLE', // gates 이번 달 / 다음 달
  };

  // 근거·한계 — 立春/12-Jie provenance + every reused ruleVersion + the ACTUAL assumptions/limitations
  // arrays produced by each time-axis result (Codex FIX B §3-2/3-3/3-4 — real values, not handcrafted).
  const meta = (r: unknown): { rule?: string; a: readonly string[]; l: readonly string[] } => {
    const o = r as { capability?: string; ruleVersion?: string; assumptions?: readonly string[]; limitations?: readonly string[] } | null;
    if (!o || o.capability !== 'AVAILABLE') return { a: [], l: [] };
    return { rule: o.ruleVersion, a: o.assumptions ?? [], l: o.limitations ?? [] };
  };
  // Collect the ACTUAL ruleVersions/assumptions/limitations from every result object — INCLUDING the
  // raw ENGINE-12 Daewoon result (Codex FIX #1: its provenance/assumptions/limitations were dropped).
  const ruleVersions = [`product=${provenance.productRule.ruleVersion}`, `tenGods=${derivedFacts.ruleVersions.tenGods}`];
  const assumptions = new Set<string>();
  const limitations = new Set<string>();
  for (const [name, r] of [['대운(ENGINE-12)', bundle.daewoon], ['대운십신', dw], ['세운', se], ['월운', wo], ['시간축', ax], ['월령', mc], ['통근투간', rt]] as const) {
    const m = meta(r);
    if (m.rule) ruleVersions.push(`${name}=${m.rule}`);
    m.a.forEach((x) => assumptions.add(x));
    m.l.forEach((x) => limitations.add(x));
  }
  const provLines = [
    `엔진 SAJU · 년주=${provenance.yearMonthAttributionRule.yearBoundary} · 월주=${provenance.yearMonthAttributionRule.monthBoundary}`,
    `ruleVersions ${ruleVersions.join(' · ')}`,
  ];
  // ENGINE-12 Daewoon provenance object (direction/progression/interval/start-age/rounding/solar-term
  // basis + provider identity) — the real source values, not a handcrafted summary (Codex FIX #1 §2-2).
  if (bundle.daewoon && bundle.daewoon.capability === 'AVAILABLE') {
    const dp = bundle.daewoon.provenance;
    provLines.push(
      `대운 도출(ENGINE-12) ${dp.ruleId}@${dp.ruleVersion} · 방향 ${dp.directionRule} · 진행 ${dp.progressionRule} · 간격 ${dp.intervalRule} · 시작나이 ${dp.startOffsetRule} · 반올림 ${dp.roundingRule} · 절기 ${dp.solarTerm.provider}@${dp.solarTerm.providerVersion}/${dp.solarTerm.solarTermRuleVersion} · 경계 ${dp.solarTerm.canonicalBoundaryPrecision}`,
    );
  }
  if (ax && ax.capability === 'AVAILABLE') {
    const p = ax.provenance;
    provLines.push(`도출 근거 년월주=${p.yearMonthPillarRuleVersion} 십신=${p.tenGodRuleVersion} 지장간=${p.hiddenStemRuleVersion} 관계=${p.relationRuleVersion} · 대운 방향/나이는 ENGINE-12 소유(재계산 아님)`);
  }
  if (assumptions.size > 0) provLines.push(`가정: ${[...assumptions].join(', ')}`);
  if (limitations.size > 0) provLines.push(`한계(계산): ${[...limitations].join(', ')}`);
  provLines.push(fourPillars.hour.status === 'AVAILABLE' ? '시주 확정' : '시주 미상(시간 의존 해석 제한)');
  provLines.push('강약/용신/격국/12운성/12신살은 V1 미계산(사실로 단정 금지)');
  sections.push({ label: '근거·한계', lines: provLines });

  const summary = `사주 ${gz(fourPillars.year)}·${gz(fourPillars.month)}·${gz(fourPillars.day)}·${hourText(fourPillars.hour)} / 일간 ${stemH(fourPillars.day.stem)}`;
  const detail = sections.map((s) => `[${s.label}] ${s.lines.join(' | ')}`).join('\n');
  return { availability, summary, detail, sections, hasTimingEvidence, timingAnchors };
}

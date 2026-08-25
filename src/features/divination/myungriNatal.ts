// DEPTH REBUILD §4 — MYUNGRI NATAL STRUCTURE READER.
//
// The independent audit found the previous judge threw the ENTIRE natal chart away: four pillars, Day Master,
// 십신 by position, 지장간, 월령 structure, 통근/투간 and the natal 합충형파해 were all computed and then
// ignored (production even passed `natalRelations: null`). Variation therefore collapsed into
// "십신 family + relation count + scope", which is why professionally different charts collided.
//
// This module turns the ALREADY-VERIFIED natal facts into the baseline a temporal layer is judged AGAINST —
// "why does THIS chart receive THIS luck differently". It computes no new astrology: every field below is
// read from the frozen engine's own output.
//
// STILL NO DEFERRED THEORY: no 신강/신약, 용신, 희신, 기신, 격국, 종격, no element weighting. Counting how many
// pillars carry 재성 is not a strength verdict — it is reading the chart's own 십신 distribution.
import type { FiveElement, HeavenlyStem } from '@/features/interpretation';
import type { NatalRelationsResult } from '@/features/myungri/services/natalRelations';
import type { SajuPillarPosition, TenGod } from '@/features/interpretation/saju/derived/contracts';

import type { JudgmentDomain, JudgmentEvidence } from './contracts';
import { tenGodFamily, type TenGodFamily } from './myungriJudge';

/** The 십신 sitting at each position, as the frozen engine derived them. */
export type PositionedTenGod = { position: SajuPillarPosition; tenGod: TenGod; source: 'STEM' | 'BRANCH' | 'HIDDEN' };

export type NatalStructureInput = {
  /** 십신 by pillar position (stem / branch main / hidden), straight from the engine. */
  positionedTenGods: PositionedTenGod[];
  /** 원국 내부 관계 (합충형파해) between the natal pillars — was discarded entirely before this rebuild. */
  natalRelations: NatalRelationsResult | null;
  /** 득령 여부 + the season phase label the engine computed. */
  monthCommandInCommand: boolean | null;
  seasonalPhase: string | null;
  /** 통근 (a stem rooted in a branch) / 투간 (a hidden stem surfacing) counts from the frozen service. */
  rootedCount: number | null;
  transparentCount: number | null;
  hourKnown: boolean;
  /** CONSTITUTION V2 §8 — the structural inputs the 강약/용신 judge needs. All frozen-service outputs. */
  strengthInputs?: {
    dayMaster: HeavenlyStem;
    dayMasterElement: FiveElement;
    /** Positions where the DAY MASTER's own 干 sits in a branch's 지장간 (통근, same-干). */
    dayMasterRootPositions: SajuPillarPosition[];
    /** Positions where a same-ELEMENT 비겁 sits hidden (득지 — kept distinct from 통근). */
    peerHiddenPositions: SajuPillarPosition[];
    /** Visible stems that are 아군(비겁·인성) / 타군(식상·재성·관성). */
    visibleSupportPositions: SajuPillarPosition[];
    visibleDrainPositions: SajuPillarPosition[];
    supportRevealed: boolean;
    elementCounts: Record<FiveElement, number>;
    /** Only when the chart's season is genuinely extreme; used ONLY as a separate 조후 note. */
    extremeSeason: '한랭' | '염열' | null;
  } | null;
};

/**
 * WHICH LIFE AREAS THIS CHART IS NATIVELY BUILT AROUND. A chart with 재성 in three positions receives a
 * wealth luck cycle very differently from one with none — that difference is exactly what the old judge lost.
 */
export type NatalBaseline = {
  /** How many DISTINCT positions carry each 십신 family (never a strength score). */
  familyPresence: Record<TenGodFamily, number>;
  /** Families the chart genuinely leans on (present in ≥2 positions). */
  dominantFamilies: TenGodFamily[];
  /** Families entirely absent — a real structural gap the reading may name. */
  absentFamilies: TenGodFamily[];
  /** 원국 자체의 마찰 (충/형/파/해 among the natal pillars), by position pair. */
  natalFrictionPositions: string[];
  /** 원국 자체의 결속 (합/삼합/방합). */
  natalHarmonyPositions: string[];
  /** True when the chart's own 배우자 자리(일지) is already strained — decisive for marriage questions. */
  spouseSeatStrained: boolean;
  /** True when the day master has seasonal footing (득령) — context, never a 신강/신약 verdict. */
  inCommand: boolean | null;
  /** 통근/투간 presence — whether the chart's stems are anchored or floating. */
  anchored: 'ROOTED' | 'PARTLY_ROOTED' | 'FLOATING' | 'UNKNOWN';
  evidence: JudgmentEvidence[];
};

const FAMILY_LABEL: Record<TenGodFamily, string> = {
  WEALTH: '재물', OFFICER: '자리·책임', OUTPUT: '활동·표현', PEER: '경쟁·동료', RESOURCE: '지원·배움',
};
const POSITION_LABEL: Record<SajuPillarPosition, string> = { YEAR: '년주', MONTH: '월주', DAY: '일주', HOUR: '시주' };

const FRICTION_KINDS = new Set(['STEM_CLASH', 'BRANCH_CLASH', 'BRANCH_PUNISHMENT', 'BRANCH_SELF_PUNISHMENT', 'BRANCH_DESTRUCTION', 'BRANCH_HARM']);

/** The family a question's domain is natively answered from (used to test natal support for THAT domain). */
export function domainFamily(domain: JudgmentDomain): TenGodFamily | null {
  switch (domain) {
    case 'MONEY_INFLOW':
    case 'MONEY_RETENTION':
      return 'WEALTH';
    case 'CAREER':
    case 'OUTCOME':
      return 'OFFICER';
    case 'OPPORTUNITY':
    case 'MOVEMENT':
      return 'OUTPUT';
    case 'INFLUENCE':
    case 'CONFLICT':
      return 'PEER';
    default:
      return null;
  }
}

export function readNatalBaseline(input: NatalStructureInput): NatalBaseline {
  const familyPresence: Record<TenGodFamily, number> = { WEALTH: 0, OFFICER: 0, OUTPUT: 0, PEER: 0, RESOURCE: 0 };
  const seen = new Set<string>();
  for (const p of input.positionedTenGods) {
    const fam = tenGodFamily(p.tenGod);
    const key = `${fam}:${p.position}`;
    if (seen.has(key)) continue; // count DISTINCT positions, not stem+branch+hidden repeats
    seen.add(key);
    familyPresence[fam] += 1;
  }

  const dominantFamilies = (Object.keys(familyPresence) as TenGodFamily[]).filter((f) => familyPresence[f] >= 2);
  const absentFamilies = (Object.keys(familyPresence) as TenGodFamily[]).filter((f) => familyPresence[f] === 0);

  const natalFrictionPositions: string[] = [];
  const natalHarmonyPositions: string[] = [];
  let spouseSeatStrained = false;
  // Natal relations are between TWO natal pillars (positions is a pair) — that pairing is exactly the detail
  // the old count-based judge threw away.
  for (const r of input.natalRelations?.stem ?? []) {
    const label = `${r.positions.map((p) => POSITION_LABEL[p]).join('↔')} ${r.relation.kind}`;
    if (FRICTION_KINDS.has(r.relation.kind)) natalFrictionPositions.push(label);
    else natalHarmonyPositions.push(label);
  }
  for (const r of input.natalRelations?.branch ?? []) {
    const label = `${r.positions.map((p) => POSITION_LABEL[p]).join('↔')} ${r.relation.kind}`;
    if (FRICTION_KINDS.has(r.relation.kind)) {
      natalFrictionPositions.push(label);
      if (r.positions.includes('DAY')) spouseSeatStrained = true; // 일지 = 배우자 자리
    } else natalHarmonyPositions.push(label);
  }

  const rooted = input.rootedCount ?? null;
  const transparent = input.transparentCount ?? null;
  const anchored: NatalBaseline['anchored'] =
    rooted === null ? 'UNKNOWN' : rooted >= 3 ? 'ROOTED' : rooted >= 1 ? 'PARTLY_ROOTED' : 'FLOATING';

  const evidence: JudgmentEvidence[] = [];
  for (const f of dominantFamilies) {
    evidence.push({
      fact: `원국 ${FAMILY_LABEL[f]} ${familyPresence[f]}자리`,
      meaning: `타고나기를 ${FAMILY_LABEL[f]} 쪽에 무게가 실린 구조입니다.`,
      domain: 'GENERAL', temporalScope: 'NATAL', directness: 'ADJACENT',
    });
  }
  for (const f of absentFamilies) {
    evidence.push({
      fact: `원국 ${FAMILY_LABEL[f]} 없음`,
      meaning: `${FAMILY_LABEL[f]} 쪽은 타고난 바탕에서 받쳐 주는 자리가 없습니다.`,
      domain: 'GENERAL', temporalScope: 'NATAL', directness: 'ADJACENT',
    });
  }
  if (spouseSeatStrained) {
    evidence.push({
      fact: '원국 일지(배우자 자리) 충·형·파·해',
      meaning: '타고난 배우자 자리 자체가 흔들리는 구조라, 관계는 유지보다 조율에 힘이 듭니다.',
      domain: 'RELATION_STABILITY', temporalScope: 'NATAL', directness: 'DIRECT',
    });
  }
  if (input.monthCommandInCommand !== null) {
    evidence.push({
      fact: input.monthCommandInCommand ? '원국 득령' : '원국 실령',
      meaning: input.monthCommandInCommand
        ? '계절의 기운을 등에 업어, 흐름이 올 때 밀고 나갈 힘이 있습니다.'
        : '계절의 기운을 얻지 못해, 좋은 흐름이 와도 혼자 밀어붙이면 힘에 부칩니다.',
      domain: 'GENERAL', temporalScope: 'NATAL', directness: 'ADJACENT',
    });
  }
  if (anchored !== 'UNKNOWN') {
    evidence.push({
      fact: `통근 ${rooted}자리${transparent !== null ? ` · 투간 ${transparent}` : ''}`,
      meaning:
        anchored === 'ROOTED'
          ? '뿌리가 단단해 한번 잡은 것은 오래 끌고 갑니다.'
          : anchored === 'PARTLY_ROOTED'
            ? '뿌리가 일부만 있어, 받쳐 주는 자리에서만 오래 갑니다.'
            : '뿌리가 약해 벌인 일이 오래 남기 어렵습니다.',
      domain: 'MONEY_RETENTION', temporalScope: 'NATAL', directness: 'ADJACENT',
    });
  }

  return {
    familyPresence, dominantFamilies, absentFamilies,
    natalFrictionPositions, natalHarmonyPositions, spouseSeatStrained,
    inCommand: input.monthCommandInCommand, anchored, evidence,
  };
}

/**
 * Does the NATAL chart support the asked domain at all? This is the "why does this chart receive this luck
 * differently" test the old judge lacked: the same 세운 lands very differently on a chart with three 재성
 * positions than on one with none.
 */
export function natalSupportForDomain(baseline: NatalBaseline, domain: JudgmentDomain): {
  support: 'STRONG' | 'PRESENT' | 'ABSENT' | 'UNKNOWN';
  note: string;
} {
  const fam = domainFamily(domain);
  if (fam === null) return { support: 'UNKNOWN', note: '' };
  const count = baseline.familyPresence[fam];
  if (count >= 2) return { support: 'STRONG', note: `원국에 ${FAMILY_LABEL[fam]} 자리가 ${count}곳 있어 바탕이 받쳐 줍니다.` };
  if (count === 1) return { support: 'PRESENT', note: `원국에 ${FAMILY_LABEL[fam]} 자리가 하나 있습니다.` };
  return { support: 'ABSENT', note: `원국에 ${FAMILY_LABEL[fam]} 자리가 없어, 흐름이 와도 붙잡을 바탕이 약합니다.` };
}

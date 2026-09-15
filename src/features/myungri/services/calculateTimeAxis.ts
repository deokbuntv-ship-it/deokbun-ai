// 원국 ↔ 대운 ↔ 세운 ↔ 월운 — the connected Myungri time-axis.
//
// This is the deliverable that makes the axis ONE object rather than isolated slices: it composes
// 세운 + 월운 (each already built from the frozen pillar + ten-god rules), then computes how the
// MOVING layers (대운/세운/월운) touch the natal chart and each other — pairwise 합/충/형/파/해 plus
// SET-level 삼합/방합/삼형 that only appear when a luck branch completes a natal half-set. Every
// pair involves at least one luck layer; static natal-internal relations belong to the (frozen)
// natal chart, not here. Facts only — no strength, no interpretation.
import {
  branchRelations,
  branchSetRelations,
  stemRelation,
} from '../rules/pillarRelations';
import {
  DEOKBUNAI_MYUNGRI_TIME_AXIS_V1_RULE,
  type CrossLayerBranchRelation,
  type CrossLayerStemRelation,
  type MyungriStemAndBranch,
  type MyungriTimeAxisResult,
  type NatalPillarContext,
  type TimeAxisLayer,
} from '../domain/contracts';
import { calculateSewoon } from './calculateSewoon';
import { calculateWolwoon } from './calculateWolwoon';
import {
  isEarthlyBranch,
  isHeavenlyStem,
  isValidNatalContext,
  myungriProvenance,
} from './pillarFacts';

const ASSUMPTIONS = [
  'AXIS_COMPOSES_FROZEN_NATAL_PILLARS_WITH_SEWOON_AND_WOLWOON',
  'CROSS_LAYER_RELATIONS_REQUIRE_AT_LEAST_ONE_LUCK_LAYER_DAEWOON_SEWOON_OR_WOLWOON',
  'ACTIVE_DAEWOON_PILLAR_IS_SELECTED_BY_THE_CALLER_FROM_AGE',
  'SET_RELATIONS_SCAN_THE_UNION_OF_ALL_BRANCHES_PRESENT_ON_THE_AXIS',
] as const;

const LIMITATIONS = [
  'DAEWOON_PILLAR_IS_OPTIONAL_CONTEXT_AN_INVALID_ONE_IS_OMITTED_NOT_FAILED',
  'NATAL_INTERNAL_RELATIONS_ARE_OUT_OF_SCOPE_THEY_BELONG_TO_THE_NATAL_CHART',
  'RELATION_FACTS_ARE_UNWEIGHTED_NO_HAPHWA_SEONGRIP_OR_STRENGTH',
] as const;

const LUCK_LAYERS: ReadonlySet<TimeAxisLayer> = new Set(['DAEWOON', 'SEWOON', 'WOLWOON']);

type LayerNode = MyungriStemAndBranch & { layer: TimeAxisLayer };

function unavailable(
  reason: Extract<MyungriTimeAxisResult, { capability: 'UNAVAILABLE' }>['reason'],
): MyungriTimeAxisResult {
  return {
    capability: 'UNAVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_TIME_AXIS_V1_RULE.ruleVersion,
    reason,
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS,
    limitations: LIMITATIONS,
  };
}

export type MyungriTimeAxisInput = {
  natal: NatalPillarContext;
  /** Active 대운 pillar for the queried age (caller selects it from Daewoon cycles). Optional. */
  daewoonPillar?: MyungriStemAndBranch | null;
  targetYear: number;
  /** 사주 月 ordinal 1..12 for 월운; omit for a year-only axis. */
  lunarMonth?: number | null;
};

export function calculateMyungriTimeAxis(
  input: MyungriTimeAxisInput,
): MyungriTimeAxisResult {
  const { natal, targetYear } = input;
  if (!isValidNatalContext(natal)) return unavailable('INVALID_NATAL_CONTEXT');

  const sewoon = calculateSewoon({ targetYear, natal });
  if (sewoon.capability !== 'AVAILABLE') return unavailable('SEWOON_UNAVAILABLE');

  const hasMonth = input.lunarMonth !== null && input.lunarMonth !== undefined;
  const wolwoon = hasMonth
    ? calculateWolwoon({ targetYear, lunarMonth: input.lunarMonth as number, natal })
    : null;
  if (wolwoon && wolwoon.capability !== 'AVAILABLE') return unavailable('WOLWOON_UNAVAILABLE');

  const daewoon: MyungriStemAndBranch | null =
    input.daewoonPillar &&
    isHeavenlyStem(input.daewoonPillar.stem) &&
    isEarthlyBranch(input.daewoonPillar.branch)
      ? { stem: input.daewoonPillar.stem, branch: input.daewoonPillar.branch }
      : null;

  // Ordered layer list: natal (static) then the moving layers.
  const nodes: LayerNode[] = [
    { layer: 'NATAL_YEAR', ...natal.pillars.year },
    { layer: 'NATAL_MONTH', ...natal.pillars.month },
    { layer: 'NATAL_DAY', ...natal.pillars.day },
  ];
  if (natal.pillars.hour) nodes.push({ layer: 'NATAL_HOUR', ...natal.pillars.hour });
  if (daewoon) nodes.push({ layer: 'DAEWOON', ...daewoon });
  nodes.push({ layer: 'SEWOON', stem: sewoon.pillar.stem, branch: sewoon.pillar.branch });
  if (wolwoon) {
    nodes.push({ layer: 'WOLWOON', stem: wolwoon.pillar.stem, branch: wolwoon.pillar.branch });
  }

  const crossLayerStemRelations: CrossLayerStemRelation[] = [];
  const crossLayerBranchRelations: CrossLayerBranchRelation[] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      if (!LUCK_LAYERS.has(a.layer) && !LUCK_LAYERS.has(b.layer)) continue;
      const sr = stemRelation(a.stem, b.stem);
      if (sr) crossLayerStemRelations.push({ from: a.layer, to: b.layer, relation: sr });
      for (const relation of branchRelations(a.branch, b.branch)) {
        crossLayerBranchRelations.push({ from: a.layer, to: b.layer, relation });
      }
    }
  }

  const branchSetRelationsOut = branchSetRelations(nodes.map((n) => n.branch));

  return {
    capability: 'AVAILABLE',
    ruleVersion: DEOKBUNAI_MYUNGRI_TIME_AXIS_V1_RULE.ruleVersion,
    dayMaster: natal.dayMaster,
    natal,
    daewoon,
    sewoon,
    wolwoon,
    crossLayerStemRelations,
    crossLayerBranchRelations,
    branchSetRelations: branchSetRelationsOut,
    provenance: myungriProvenance(),
    assumptions: ASSUMPTIONS,
    limitations: LIMITATIONS,
  };
}

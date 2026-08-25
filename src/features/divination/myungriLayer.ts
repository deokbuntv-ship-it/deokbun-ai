// DEPTH REBUILD §4 — TEMPORAL LAYER READER (position- and kind-aware).
//
// The audit's core Myungri finding: every 합/충/형/파/해 was collapsed into two integers (harmony/friction)
// and then into a 4-step tier, so "이 운이 원국의 어느 자리를 건드리는가" — the thing a professional reading
// is actually about — never reached the verdict. A 충 on the 일지(배우자 자리) and a 충 on the 년지(초년·조상
// 자리) are not the same event, and the previous build could not tell them apart.
//
// This module keeps the frozen relation facts INTACT (kind + which natal pillar was hit) and maps them to the
// life axis that pillar governs — canonical 궁위 semantics (년=초년·뿌리, 월=사회·직업 자리, 일=배우자·자기
// 자리, 시=말년·자식·결과 자리). No new astrology, no counting-as-verdict.
import type { RelationsToNatal } from '@/features/myungri/domain/contracts';
import type { SajuPillarPosition, TenGod } from '@/features/interpretation/saju/derived/contracts';

import type { JudgmentDomain, JudgmentEvidence, TemporalScope } from './contracts';
import { tenGodFamily, type TenGodFamily } from './myungriJudge';

const POSITION_LABEL: Record<SajuPillarPosition, string> = { YEAR: '년주', MONTH: '월주', DAY: '일주', HOUR: '시주' };

/** Which life axis each natal pillar governs when a luck cycle strikes it (canonical 궁위 semantics). */
const POSITION_AXIS: Record<SajuPillarPosition, { domain: JudgmentDomain; label: string }> = {
  YEAR: { domain: 'GENERAL', label: '뿌리·집안 자리' },
  MONTH: { domain: 'CAREER', label: '사회·직업 자리' },
  DAY: { domain: 'RELATION_STABILITY', label: '배우자·자기 자리' },
  HOUR: { domain: 'OUTCOME', label: '말년·결과 자리' },
};

const FRICTION_KINDS = new Set(['STEM_CLASH', 'BRANCH_CLASH', 'BRANCH_PUNISHMENT', 'BRANCH_SELF_PUNISHMENT', 'BRANCH_DESTRUCTION', 'BRANCH_HARM']);
const KIND_LABEL: Record<string, string> = {
  STEM_COMBINATION: '천간합', STEM_CLASH: '천간충',
  BRANCH_SIX_COMBINATION: '육합', BRANCH_HALF_THREE_HARMONY: '반합', BRANCH_CLASH: '충',
  BRANCH_PUNISHMENT: '형', BRANCH_SELF_PUNISHMENT: '자형', BRANCH_DESTRUCTION: '파', BRANCH_HARM: '해',
};
/** 충 and 형 are structural hits; 파/해 are frictional but lighter. Kind matters, not just sign. */
const HEAVY_KINDS = new Set(['STEM_CLASH', 'BRANCH_CLASH', 'BRANCH_PUNISHMENT', 'BRANCH_THREE_PUNISHMENT']);

export type PositionedHit = {
  position: SajuPillarPosition;
  kind: string;
  friction: boolean;
  heavy: boolean;
  axis: JudgmentDomain;
  evidence: JudgmentEvidence;
};

export type LayerAnalysis = {
  scope: TemporalScope;
  family: TenGodFamily;
  /** Every relation this layer forms with the natal chart, with the natal position it struck. */
  hits: PositionedHit[];
  /** Axes this layer actually disturbs (from the positions it hit) — the real decomposition source. */
  frictionAxes: JudgmentDomain[];
  harmonyAxes: JudgmentDomain[];
  /** True when the layer forms NO relation at all with the natal chart — an absence, not a positive. */
  silent: boolean;
  robWealth: boolean;
};

const SCOPE_LABEL: Record<TemporalScope, string> = {
  NATAL: '타고난 바탕', DAEWOON: '지금의 큰 흐름', SEWOON: '올해 흐름',
  WOLWOON: '이 시기 흐름', PRESENT_MOMENT: '지금 시점', UNSCOPED: '전반 흐름',
};

export function analyzeLayer(
  scope: TemporalScope,
  stemTenGod: TenGod,
  branchTenGod: TenGod,
  relations: RelationsToNatal,
): LayerAnalysis {
  const where = SCOPE_LABEL[scope];
  const hits: PositionedHit[] = [];

  const push = (position: SajuPillarPosition, kind: string) => {
    const friction = FRICTION_KINDS.has(kind);
    const axis = POSITION_AXIS[position];
    hits.push({
      position, kind, friction, heavy: HEAVY_KINDS.has(kind), axis: axis.domain,
      evidence: {
        fact: `${where} → 원국 ${POSITION_LABEL[position]} ${KIND_LABEL[kind] ?? kind}`,
        meaning: friction
          ? `${axis.label}가 이 흐름에 직접 흔들립니다.`
          : `${axis.label}가 이 흐름과 맞물려 풀립니다.`,
        domain: axis.domain,
        temporalScope: scope,
        directness: 'DIRECT',
      },
    });
  };

  for (const r of relations.stem) push(r.position, r.relation.kind);
  for (const r of relations.branch) push(r.position, r.relation.kind);

  const frictionAxes = [...new Set(hits.filter((h) => h.friction).map((h) => h.axis))];
  const harmonyAxes = [...new Set(hits.filter((h) => !h.friction).map((h) => h.axis))];

  return {
    scope,
    family: tenGodFamily(stemTenGod),
    hits,
    frictionAxes,
    harmonyAxes,
    silent: hits.length === 0, // NO relation → no directional signal (was previously read as STEADY=positive)
    robWealth: stemTenGod === 'ROB_WEALTH' || branchTenGod === 'ROB_WEALTH',
  };
}

export type AxisPressure = {
  /** WHICH relation kinds struck this axis (충/형/파/해…). A structure, deliberately never a magnitude. */
  frictionKinds: string[];
  harmonyKinds: string[];
  /** A 충/형 landed directly on this axis — a named structural hit, not a heavier tally. */
  heavyHit: boolean;
  touched: boolean;
  evidence: JudgmentEvidence[];
  counterEvidence: JudgmentEvidence[];
};

/**
 * What this layer does to ONE axis, as structure.
 *
 * V3 §5 — this used to return `friction`/`harmony` integers with 충/형 weighted 2 and 파/해 weighted 1, which
 * the consumer then compared. That is a score: the weights were ours, no canon sets them, and "friction 3 vs
 * harmony 2" is a fabricated magnitude. What actually distinguishes these events is KIND and POSITION, both of
 * which are already carried — so they are handed to the judge intact and the judge names the configuration.
 */
export function axisPressure(layer: LayerAnalysis, axis: JudgmentDomain): AxisPressure {
  const onAxis = layer.hits.filter((h) => h.axis === axis);
  const friction = onAxis.filter((h) => h.friction);
  const harmony = onAxis.filter((h) => !h.friction);
  return {
    frictionKinds: [...new Set(friction.map((h) => KIND_LABEL[h.kind] ?? h.kind))],
    harmonyKinds: [...new Set(harmony.map((h) => KIND_LABEL[h.kind] ?? h.kind))],
    heavyHit: friction.some((h) => h.heavy),
    touched: onAxis.length > 0,
    evidence: harmony.map((h) => h.evidence),
    counterEvidence: friction.map((h) => h.evidence),
  };
}

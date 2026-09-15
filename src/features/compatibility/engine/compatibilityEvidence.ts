// Pairwise facts + tier → app-level `EngineEvidence` (facts-only, STRUCTURED sections), mirroring
// `sajuEvidenceAdapter`. CONVERTER ONLY: never calculates — it formats the deterministic pairwise
// relations + the transparent tier tally into the labeled `sections` the grounding renderer hands
// the prompt. This is what makes 궁합 an ANSWER about the RELATIONSHIP, not two solo dumps.
import type { EngineEvidence, EngineEvidenceSection } from '@/features/analysis';
import {
  EARTHLY_BRANCH_LABELS,
  FIVE_ELEMENT_LABELS,
  HEAVENLY_STEM_LABELS,
  SAJU_FIVE_ELEMENT_KEYS,
  TEN_GOD_LABELS,
  type EarthlyBranch,
  type FiveElement,
  type HeavenlyStem,
  type SajuEngineResult,
  type SajuFiveElementCounts,
  type SajuPillarPosition,
  type TenGod,
} from '@/features/interpretation';
import {
  natalContextFromFourPillars,
  type BranchPairRelationKind,
  type BranchSetRelationKind,
  type StemRelationKind,
} from '@/features/myungri';

import { computePairwiseRelations } from './pairwiseRelations';
import { deriveCompatibilityAssessment } from './compatibilityTiers';
import {
  COMPATIBILITY_ENGINE_VERSION,
  type CompatibilityAssessment,
  type PairwiseRelationFacts,
  type PersonPairwiseInput,
} from './types';

const stemH = (s: HeavenlyStem): string => HEAVENLY_STEM_LABELS[s].hanja;
const branchH = (b: EarthlyBranch): string => EARTHLY_BRANCH_LABELS[b].hanja;
const el = (e: FiveElement): string => FIVE_ELEMENT_LABELS[e].hangul;
const tg = (g: TenGod): string => TEN_GOD_LABELS[g].hangul;

const STEM_REL: Record<StemRelationKind, string> = { STEM_COMBINATION: '천간합', STEM_CLASH: '천간충' };
const BRANCH_REL: Record<BranchPairRelationKind, string> = {
  BRANCH_SIX_COMBINATION: '육합', BRANCH_CLASH: '충', BRANCH_HALF_THREE_HARMONY: '반합',
  BRANCH_PUNISHMENT: '형', BRANCH_SELF_PUNISHMENT: '자형', BRANCH_DESTRUCTION: '파', BRANCH_HARM: '해',
};
const SET_REL: Record<BranchSetRelationKind, string> = {
  BRANCH_THREE_HARMONY: '삼합', BRANCH_DIRECTIONAL_UNION: '방합', BRANCH_THREE_PUNISHMENT: '삼형',
};
const POS: Record<SajuPillarPosition, string> = { YEAR: '년', MONTH: '월', DAY: '일', HOUR: '시' };

export type CompatibilityPersonInput = {
  engineResult: SajuEngineResult;
  /** consumer-facing name/label (본인 / 상대방 name). */
  label: string;
};

export type CompatibilityEvidenceResult =
  | { availability: 'unavailable'; reason: 'self_unavailable' | 'target_unavailable' }
  | {
      availability: 'available';
      assessment: CompatibilityAssessment;
      facts: PairwiseRelationFacts;
      evidence: EngineEvidence;
      selfLabel: string;
      targetLabel: string;
    };

function toPairwiseInput(result: SajuEngineResult): PersonPairwiseInput | null {
  if (result.status !== 'SUCCESS' && result.status !== 'PARTIAL') return null;
  const { fourPillars, fiveElementDistribution } = result.output;
  return {
    natal: natalContextFromFourPillars(fourPillars),
    elementCounts: fiveElementDistribution.direct.counts,
    hourKnown: fourPillars.hour.status === 'AVAILABLE',
  };
}

function dayPillarText(input: PersonPairwiseInput): string {
  const d = input.natal.pillars.day;
  return `${stemH(d.stem)}${branchH(d.branch)} (일간 ${stemH(input.natal.dayMaster)})`;
}

function elementCountsLine(counts: SajuFiveElementCounts): string {
  return SAJU_FIVE_ELEMENT_KEYS.map((e) => `${el(e)} ${counts[e] ?? 0}`).join(' · ');
}

/**
 * Build the deterministic compatibility EVIDENCE (tier + facts + EngineEvidence sections) for a
 * pair. Fail-closed: if either chart is UNAVAILABLE, returns `unavailable` (never a fabricated pair
 * verdict). Timing is NOT produced here — the pairwise reading is natal/timeless; temporal anchors
 * are merged in by the server orchestrator from the asker's own 세운/월운.
 */
export function buildCompatibilityEvidence(
  self: CompatibilityPersonInput,
  target: CompatibilityPersonInput,
): CompatibilityEvidenceResult {
  const selfInput = toPairwiseInput(self.engineResult);
  if (!selfInput) return { availability: 'unavailable', reason: 'self_unavailable' };
  const targetInput = toPairwiseInput(target.engineResult);
  if (!targetInput) return { availability: 'unavailable', reason: 'target_unavailable' };

  const facts = computePairwiseRelations(selfInput, targetInput);
  if (!facts) return { availability: 'unavailable', reason: 'self_unavailable' };

  const assessment = deriveCompatibilityAssessment(facts);
  const sections: EngineEvidenceSection[] = [];

  // 두 사람 (each person's day pillar — the couple axis anchor)
  sections.push({
    label: '두 사람(일주)',
    lines: [`${self.label}: ${dayPillarText(selfInput)}`, `${target.label}: ${dayPillarText(targetInput)}`],
  });

  // 일주 궁합 (the classical core: day-master + day-branch interaction)
  const coreLines: string[] = [];
  if (facts.dayStemRelation) {
    coreLines.push(`일간 ${STEM_REL[facts.dayStemRelation.kind]} (${stemH(facts.dayStemRelation.stems[0])}${stemH(facts.dayStemRelation.stems[1])})`);
  }
  for (const r of facts.dayBranchRelations) {
    coreLines.push(`일지 ${BRANCH_REL[r.kind]} (${branchH(r.branches[0])}${branchH(r.branches[1])})`);
  }
  if (facts.tenGodTargetToSelf) coreLines.push(`상대는 나에게 ${tg(facts.tenGodTargetToSelf)} 관계`);
  if (facts.tenGodSelfToTarget) coreLines.push(`나는 상대에게 ${tg(facts.tenGodSelfToTarget)} 관계`);
  if (coreLines.length === 0) coreLines.push('일주 사이 두드러진 합·충 없음');
  sections.push({ label: '일주 궁합(핵심)', lines: coreLines });

  // 교차 관계 (all cross relations across the two charts)
  const crossLines: string[] = [];
  for (const r of facts.crossStemRelations) {
    crossLines.push(`${POS[r.self]}간↔${POS[r.target]}간 ${STEM_REL[r.relation.kind]}`);
  }
  for (const r of facts.crossBranchRelations) {
    crossLines.push(`${POS[r.self]}지↔${POS[r.target]}지 ${BRANCH_REL[r.relation.kind]}`);
  }
  for (const s of facts.unionSetRelations) {
    crossLines.push(`${SET_REL[s.kind]} ${s.branches.map(branchH).join('')}`);
  }
  sections.push({ label: '교차 관계(두 사람 합충형파해)', lines: crossLines.length ? crossLines : ['두드러진 교차 관계 없음'] });

  // 오행 보완
  const compLines: string[] = [
    `${self.label} 오행: ${elementCountsLine(selfInput.elementCounts)}`,
    `${target.label} 오행: ${elementCountsLine(targetInput.elementCounts)}`,
  ];
  const { selfSuppliesTarget, targetSuppliesSelf, sharedMissing } = facts.elementComplement;
  if (selfSuppliesTarget.length) compLines.push(`${self.label}가 채워줌: ${selfSuppliesTarget.map(el).join('·')}`);
  if (targetSuppliesSelf.length) compLines.push(`${target.label}가 채워줌: ${targetSuppliesSelf.map(el).join('·')}`);
  if (sharedMissing.length) compLines.push(`공통으로 약한 기운: ${sharedMissing.map(el).join('·')}`);
  sections.push({ label: '오행 보완', lines: compLines });

  // 분야별 궁합 (the transparent tier tally)
  sections.push({
    label: '분야별 궁합(정서·갈등·오행)',
    lines: assessment.dimensions.map((d) => `${d.title}: ${d.verdict} [${d.tally.join(', ')}]`),
  });

  // 종합
  sections.push({
    label: '종합 궁합',
    lines: [
      `전반 tier: ${assessment.overallLabel}`,
      assessment.reducedPrecision
        ? '두 사람 중 한 명 이상 시주 미상 → 정밀도 제한(단정 금지)'
        : '두 사람 모두 시주 확정',
    ],
  });

  // 근거·한계
  sections.push({
    label: '근거·한계',
    lines: [
      `궁합 엔진 ${COMPATIBILITY_ENGINE_VERSION} · tier ${assessment.tierModelVersion}`,
      '명리 원국 관계(합충형파해·삼합/방합)·십신·오행 기반. 강약/용신/격국은 미계산(사실 단정 금지).',
      '자미두수는 개인 성향 참고용(궁합 점수 미산출), 기문둔갑은 특정 시점 질문에만 사용.',
    ],
  });

  const summary = `${self.label}·${target.label} 궁합: ${assessment.overallLabel} (정서 ${assessment.dimensions[0].signal}/갈등 ${assessment.dimensions[1].signal}/오행 ${assessment.dimensions[2].signal})`;
  const detail = sections.map((s) => `[${s.label}] ${s.lines.join(' | ')}`).join('\n');

  return {
    availability: 'available',
    assessment,
    facts,
    selfLabel: self.label,
    targetLabel: target.label,
    evidence: { availability: 'available', summary, detail, sections, hasTimingEvidence: false },
  };
}

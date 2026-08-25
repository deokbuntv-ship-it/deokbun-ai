// V4A §14 — MYUNGRI REASONER. facts → premises → propositions → derivations → (projection) judgment.
//
// THE DEPENDENCY DIRECTION IS THE POINT. Nothing in this file chooses a stance and then looks for reasons:
// `buildMyungriPremises` runs first and knows nothing about any conclusion, the derivation rules run second and
// know nothing about the legacy `Stance` enum, and only `project()` — last — translates the finished graph into
// the `DivinationJudgment` shape the prose layer and the guards already consume. Delete `project()` and the
// reasoning is untouched; that is the test of whether a wrapper has become a layer.
import {
  NO_SIGNAL,
  type DataReliability, type DivinationJudgment, type DomainSubJudgment, type EvidenceStrength,
  type JudgmentDomain, type JudgmentEvidence, type QuestionDirectness, type Stance,
} from '../contracts';
import { analyzeLayer, type LayerAnalysis } from '../myungriLayer';
import { readNatalBaseline } from '../myungriNatal';
import type { MyungriJudgeInput } from '../myungriJudge';
import { buildMyungriPremises } from './myungriPremises';
import { MYUNGRI_RULES, primitivePropositions } from './myungriRules';
import {
  PRIMITIVE_RULE, countRealSynthesis, runDerivations, standingPropositions,
  type DerivationContext, type DivinationPremise, type ReasonedProposition,
} from './kernel';

export type MyungriReasoning = {
  premises: DivinationPremise[];
  propositions: ReasonedProposition[];
  /** The graph leaves — what nothing else supersedes. Synthesis reads these. */
  standing: ReasonedProposition[];
  judgment: DivinationJudgment;
};

/**
 * PROJECTION, not reasoning. Maps a finished semantic conclusion onto the legacy stance enum. No lookup ladder
 * is needed because the rule that produced the conclusion already declared what kind of restriction it found.
 */
function stanceOf(p: ReasonedProposition): Stance {
  if (p.conclusionType === 'STRUCTURAL' || p.conclusionType === 'CAUSAL') return 'STRUCTURAL_ANSWER';
  const solid = p.adequacy.supportAdequacy === 'ADEQUATE';
  switch (p.direction) {
    case 'FAVORABLE': return solid ? 'FOR' : 'CONDITIONAL_FOR';
    case 'UNFAVORABLE': return p.adequacy.counterAdequacy === 'ADEQUATE' ? 'AGAINST' : 'CONDITIONAL_AGAINST';
    case 'RESTRICTED': return p.restriction === 'TIMING' ? 'FOR_BUT_LATER' : 'CONDITIONAL_AGAINST';
    default: return NO_SIGNAL;
  }
}

const evidenceOf = (
  premises: DivinationPremise[], ids: string[], axis: JudgmentDomain, asked: JudgmentDomain,
): JudgmentEvidence[] =>
  ids
    .map((id) => premises.find((p) => p.id === id))
    .filter((p): p is DivinationPremise => !!p)
    .map((p) => ({
      fact: p.sourceFactIds[0] ?? p.target,
      meaning: p.assertion,
      domain: axis,
      temporalScope: p.temporalScope,
      directness: (p.questionAxis === asked ? 'DIRECT' : p.applicability === 'BACKGROUND' ? 'GENERAL' : 'ADJACENT') as QuestionDirectness,
    }));

/**
 * Adequacy → the legacy `EvidenceStrength`. NOTE the asymmetry that V3 got wrong: counter-adequacy is NOT
 * added in. A well-opposed claim is not a well-supported one.
 */
function strengthOf(p: ReasonedProposition): EvidenceStrength {
  if (p.conclusionType === 'STRUCTURAL' || p.conclusionType === 'CAUSAL') {
    return p.adequacy.supportAdequacy === 'ADEQUATE' || p.adequacy.counterAdequacy === 'ADEQUATE' ? 'STRONG' : 'MODERATE';
  }
  const side = p.direction === 'UNFAVORABLE' ? p.adequacy.counterAdequacy : p.adequacy.supportAdequacy;
  if (side === 'ADEQUATE') return p.adequacy.dataCompleteness === 'COMPLETE' ? 'STRONG' : 'MODERATE';
  if (side === 'THIN') return 'WEAK';
  return p.derivationRule === PRIMITIVE_RULE ? 'NONE' : 'WEAK';
}

export function reasonMyungri(input: MyungriJudgeInput): MyungriReasoning {
  const asked = input.questionDomain;
  const subject = input.subject ?? '본인';
  const intent = input.questionIntent ?? 'OUTCOME';
  const reliability: DataReliability = input.hourKnown ? 'EXACT' : 'REDUCED';

  const layers: LayerAnalysis[] = [];
  if (input.activeDaewoon) layers.push(analyzeLayer('DAEWOON', input.activeDaewoon.stemTenGod, input.activeDaewoon.branchTenGod, input.activeDaewoon.relationsToNatal));
  if (input.sewoon) layers.push(analyzeLayer('SEWOON', input.sewoon.stemTenGod, input.sewoon.branchTenGod, input.sewoon.relationsToNatal));
  if (input.wolwoon) layers.push(analyzeLayer('WOLWOON', input.wolwoon.stemTenGod, input.wolwoon.branchTenGod, input.wolwoon.relationsToNatal));
  const baseline = input.natal ? readNatalBaseline(input.natal) : null;

  // ── 1. PREMISES (no stance exists yet, and nothing here can see one) ────────────────────────────
  const premises = buildMyungriPremises({
    subject, questionIntent: intent, askedAxis: asked, baseline, layers, reliability,
    strengthInputsPresent: input.natal?.strengthInputs !== undefined && input.natal?.strengthInputs !== null,
  });

  // ── 2/3. PROPOSITIONS + DERIVATIONS to a fixed point ───────────────────────────────────────────
  const ctx: DerivationContext = { subject, questionIntent: intent, askedAxis: asked, dataComplete: input.hourKnown };
  const propositions = runDerivations(MYUNGRI_RULES, premises, primitivePropositions(premises, ctx), ctx);
  const standing = standingPropositions(propositions);

  // ── 4. PROJECTION onto the legacy judgment shape ────────────────────────────────────────────────
  const subs: DomainSubJudgment[] = standing.map((p) => ({
    domain: p.questionAxis,
    stance: stanceOf(p),
    conclusion: p.assertion,
    temporalScope: p.temporalScope,
    directness: (p.questionAxis === asked ? 'DIRECT' : 'ADJACENT') as QuestionDirectness,
    reliability,
    evidence: evidenceOf(premises, p.supportingPremiseIds, p.questionAxis, asked),
    counterEvidence: evidenceOf(premises, p.opposingPremiseIds, p.questionAxis, asked),
  }));

  const onAsked = standing.filter((p) => p.questionAxis === asked);
  // A COMPOUND conclusion was DERIVED FROM both sides, so it already accounts for the disagreement; that is
  // why it answers rather than the fragments it reconciles. Structural, not a priority table.
  const compound = onAsked.find((p) => p.conclusionType === 'COMPOUND');
  const nonDecision = intent === 'DESCRIPTIVE' || intent === 'CAUSE_WHY';
  const descriptive = nonDecision
    ? standing.find((p) => (p.conclusionType === 'CAUSAL' && intent === 'CAUSE_WHY') || p.conclusionType === 'STRUCTURAL')
    : undefined;

  const directions = new Set(onAsked.filter((p) => p.direction !== 'NONE').map((p) => p.direction));
  const agreed = directions.size === 1 ? onAsked.find((p) => p.direction !== 'NONE') : undefined;
  const primary = descriptive ?? compound ?? agreed ?? null;

  const internalContradictions: string[] = [];
  if (!primary && onAsked.length > 1) {
    internalContradictions.push(
      `같은 축에서 서로 다른 결론이 함께 성립합니다: ${onAsked.map((p) => p.assertion).join(' / ')}`,
    );
  }
  const blocked = premises.filter((p) => p.doctrineReference.startsWith('BLOCKED'));

  // `factGroupsUsed` is the user-facing depth-utilization report ("이 판단에 무엇을 실제로 썼는가"), so it keeps
  // the product's own vocabulary rather than the internal doctrine-reference strings.
  const used = new Set(premises.map((p) => p.doctrineReference));
  const factGroupsUsed = [
    ...(used.has('십신 배치 → 축 (frozen 십신 분포)') ? ['원국 십신 배치'] : []),
    ...(used.has('원국 합충형파해 (frozen natal relations)') || used.has('궁위: 일지=배우자·자기 자리') ? ['원국 합충형파해'] : []),
    ...(used.has('월령 득령/실령 (frozen month-command)') ? ['월령'] : []),
    ...(used.has('통근(同干) (frozen rooting)') ? ['통근·투간'] : []),
    ...(layers.some((l) => l.scope === 'DAEWOON') ? ['대운'] : []),
    ...(layers.some((l) => l.scope === 'SEWOON') ? ['세운'] : []),
    ...(layers.some((l) => l.scope === 'WOLWOON') ? ['월운'] : []),
    ...(used.has('궁위 + 합충형파해 (frozen relations to natal)') ? ['원국×운 관계(종류·위치)'] : []),
    // Reported as WITHHELD, not as used — the depth report must not imply a capability the engine declines to use.
    ...(used.has('BLOCKED: 강약 학파 미채택 → 강약 등급·억부용신 판정 보류') ? ['일간 강약·용신(판정 보류)'] : []),
  ];

  const judgment: DivinationJudgment = {
    discipline: 'MYUNGRI',
    applicable: premises.length > 0,
    ...(input.hourKnown ? {} : { applicabilityReason: '출생시간이 확정되지 않아 시(時)에 기대는 해석은 제한됩니다.' }),
    dataReliability: reliability,
    questionDomain: asked,
    temporalScope: primary?.temporalScope ?? 'NATAL',
    stance: primary ? stanceOf(primary) : NO_SIGNAL,
    dominantConclusion: primary?.assertion
      ?? (blocked.length > 0
        ? '명리에서 이 축을 직접 보는 경로가 아직 채택되어 있지 않습니다.'
        : '명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.'),
    dominantFactor: primary
      ? `${primary.derivationRule === PRIMITIVE_RULE ? '단일 근거' : primary.derivationRule} · ${primary.target}`
      : '해당 축 근거 없음',
    // The doctrine blockers ride along in directEvidence so the withholding stays VISIBLE in the persisted
    // verdict and in the "왜 이렇게 보나요?" layer. A capability that is declined silently reads as a capability
    // that was never considered.
    directEvidence: [
      ...(primary ? evidenceOf(premises, primary.supportingPremiseIds, asked, asked) : []),
      ...evidenceOf(premises, blocked.map((b) => b.id), 'GENERAL', asked),
    ],
    counterEvidence: primary ? evidenceOf(premises, primary.opposingPremiseIds, asked, asked) : [],
    internalContradictions,
    timingSignals: standing
      .filter((p) => p.temporalScope === 'WOLWOON' || p.temporalScope === 'SEWOON')
      .slice(0, 1)
      .flatMap((p) => evidenceOf(premises, [...p.supportingPremiseIds, ...p.opposingPremiseIds], p.questionAxis, asked).slice(0, 1)),
    domainSubJudgments: subs,
    confidence: primary === null
      ? 'LOW'
      : strengthOf(primary) === 'STRONG' && reliability === 'EXACT' ? 'HIGH'
        : strengthOf(primary) === 'NONE' ? 'LOW' : 'MEDIUM',
    questionDirectness: primary ? (primary.questionAxis === asked ? 'DIRECT' : 'ADJACENT') : 'GENERAL',
    evidenceStrength: primary ? strengthOf(primary) : 'NONE',
    factGroupsUsed,
  };

  return { premises, propositions, standing, judgment };
}

/** Convenience for tests and the QA pack: the synthesis census of one reasoning run. */
export function myungriSynthesisCensus(r: MyungriReasoning) {
  return countRealSynthesis(r.propositions, r.premises);
}

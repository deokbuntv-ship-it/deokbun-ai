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
  PRIMITIVE_RULE, resolveAnswer, screenAll, runDerivations, standingPropositions,
  type DerivationContext, type DivinationPremise, type ReasonedProposition, type Resolution,
} from './kernel';

export type MyungriReasoning = {
  premises: DivinationPremise[];
  propositions: ReasonedProposition[];
  /** The graph leaves — what nothing else supersedes. Synthesis reads these. */
  standing: ReasonedProposition[];
  judgment: DivinationJudgment;
};

/**
 * PROJECTION — semantic conclusion → legacy stance enum.
 *
 * V4B §11: the firmness of a claim is read from the premises that SUPPORT THAT CLAIM, whatever its real-world
 * valence. V4A read `counterAdequacy` for an UNFAVORABLE conclusion — i.e. it judged how firmly to say "안
 * 됩니다" from the material ARGUING AGAINST that very conclusion. The sides are about the proposition, not
 * about whether the news is good.
 */
function stanceOf(p: ReasonedProposition): Stance {
  if (p.conclusionType === 'STRUCTURAL' || p.conclusionType === 'CAUSAL') return 'STRUCTURAL_ANSWER';
  const solid = p.adequacy.supportAdequacy === 'ADEQUATE';
  switch (p.direction) {
    case 'FAVORABLE': return solid ? 'FOR' : 'CONDITIONAL_FOR';
    case 'UNFAVORABLE': return p.adequacy.supportAdequacy === 'ADEQUATE' ? 'AGAINST' : 'CONDITIONAL_AGAINST';
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
      fact: p.sourceFactIds[0] ?? p.target.label,
      meaning: p.assertion,
      domain: axis,
      temporalScope: p.temporalScope,
      directness: (p.questionAxis === asked ? 'DIRECT' : p.applicability === 'BACKGROUND' ? 'GENERAL' : 'ADJACENT') as QuestionDirectness,
    }));

/**
 * Adequacy → the legacy `EvidenceStrength`. Always read from the SUPPORTING side, because that is the side
 * that backs this proposition's assertion. A well-OPPOSED claim is not a well-supported one, and a negative
 * claim is not made firmer by the evidence that disputes it.
 */
function strengthOf(p: ReasonedProposition): EvidenceStrength {
  if (p.conclusionType === 'STRUCTURAL' || p.conclusionType === 'CAUSAL') {
    return p.adequacy.supportAdequacy === 'ADEQUATE' ? 'STRONG' : 'MODERATE';
  }
  const side = p.adequacy.supportAdequacy;
  if (side === 'ADEQUATE') return p.adequacy.dataCompleteness === 'COMPLETE' ? 'STRONG' : 'MODERATE';
  if (side === 'THIN') return 'WEAK';
  return p.derivationRule === PRIMITIVE_RULE ? 'NONE' : 'WEAK';
}

/**
 * The conclusions the judgment is speaking about. One when the set settles; ALL of them when it does not.
 *
 * An unsettled set is not an absence of findings — the findings are real and the user is owed them under
 * "왜 이렇게 보나요?". What is withheld is the WINNER, not the evidence.
 */
const answering = (r: Resolution): ReasonedProposition[] =>
  (r.kind === 'SINGLE' ? [r.primary] : r.members);
const agreedMembers = (r: Resolution): ReasonedProposition[] => (r.kind === 'AGREED' ? r.members : []);
/**
 * The stance an AGREED set actually supports.
 *
 * When every member projects to the SAME stance, that stance IS the answer — softening it would understate a
 * unanimous reading. When they share a direction but differ in firmness (FOR beside CONDITIONAL_FOR), the
 * verdict asserts only the weaker claim, because that is the most all of them back. Neither branch picks a
 * member: the first reads a unanimous value, the second falls back to what the shared direction alone licenses.
 */
const agreedStance = (r: Resolution): Stance => {
  if (r.kind !== 'AGREED') return NO_SIGNAL;
  const stances = new Set(r.members.map(stanceOf));
  if (stances.size === 1) return [...stances][0];
  switch (r.direction) {
    case 'FAVORABLE': return 'CONDITIONAL_FOR';
    case 'UNFAVORABLE': return 'CONDITIONAL_AGAINST';
    case 'RESTRICTED': return 'CONDITIONAL_AGAINST';
    default: return NO_SIGNAL;
  }
};

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
  const nonDecision = intent === 'DESCRIPTIVE' || intent === 'CAUSE_WHY';
  // V4C §7 — NO FIRST-MATCH SELECTION.
  //
  // V4B built the answer from three chained `.find()` calls (`descriptive ?? compound ?? agreed`), which is
  // arbitration by array order dressed as precedence: reorder the premises and the headline changes for a
  // reason no reader could inspect, and the two conclusions that lost were never mentioned. The candidate set
  // is now named explicitly and resolved AS A SET by `resolveAnswer`, which returns no winner when the set
  // does not settle — a real outcome under §31, not a failure to be papered over.
  const candidates = nonDecision
    ? standing.filter((p) => (intent === 'CAUSE_WHY' && p.conclusionType === 'CAUSAL')
      || p.conclusionType === 'STRUCTURAL')
    : onAsked.filter((p) => p.conclusionType === 'COMPOUND' || p.direction !== 'NONE');
  const resolution = resolveAnswer(candidates);
  const primary = resolution.kind === 'SINGLE' ? resolution.primary : null;

  const internalContradictions: string[] = [];
  if (resolution.kind === 'UNRESOLVED') {
    internalContradictions.push(
      `같은 축에서 서로 다른 결론이 함께 성립합니다: ${resolution.members.map((p) => p.assertion).join(' / ')}`,
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
    temporalScope: primary?.temporalScope ?? agreedMembers(resolution)[0]?.temporalScope ?? 'NATAL',
    stance: primary ? stanceOf(primary) : agreedStance(resolution),
    dominantConclusion: primary?.assertion
      // §7 — several conclusions stand and every one points the same way. The direction is answerable, but no
      // single conclusion owns it, so ALL of them are stated rather than the first one being promoted.
      ?? (resolution.kind === 'AGREED'
        ? resolution.members.map((p) => p.assertion).join(' 그리고 ')
        // §7/§31 — an unsettled set is stated as one, with every conclusion named. V4B promoted whichever
        // conclusion happened to sort first and never mentioned the others; saying "근거가 없습니다" here
        // would be worse still, because the findings exist and simply do not agree.
        : resolution.kind === 'UNRESOLVED'
          ? `이 축에는 서로 다른 결론이 함께 성립합니다: ${resolution.members.map((p) => p.assertion).join(' / ')} 한쪽으로 정하지 않겠습니다.`
          : blocked.length > 0
            ? '명리에서 이 축을 직접 보는 경로가 아직 채택되어 있지 않습니다.'
            : '명리에서 이 질문을 직접 흔드는 신호는 확인되지 않습니다.'),
    dominantFactor: primary
      ? `${primary.derivationRule === PRIMITIVE_RULE ? '단일 근거' : primary.derivationRule} · ${primary.target.label}`
      : resolution.kind === 'AGREED'
        ? `같은 방향으로 함께 서는 근거 ${resolution.members.length}건`
        : resolution.kind === 'UNRESOLVED'
          ? `서로 다른 방향으로 함께 서는 결론 ${resolution.members.length}건 (미확정)`
          : '해당 축 근거 없음',
    // The doctrine blockers ride along in directEvidence so the withholding stays VISIBLE in the persisted
    // verdict and in the "왜 이렇게 보나요?" layer. A capability that is declined silently reads as a capability
    // that was never considered.
    directEvidence: [
      ...evidenceOf(premises, answering(resolution).flatMap((p) => p.supportingPremiseIds), asked, asked),
      ...evidenceOf(premises, blocked.map((b) => b.id), 'GENERAL', asked),
    ],
    counterEvidence: evidenceOf(premises, answering(resolution).flatMap((p) => p.opposingPremiseIds), asked, asked),
    internalContradictions,
    timingSignals: standing
      .filter((p) => p.temporalScope === 'WOLWOON' || p.temporalScope === 'SEWOON')
      .slice(0, 1)
      .flatMap((p) => evidenceOf(premises, [...p.supportingPremiseIds, ...p.opposingPremiseIds], p.questionAxis, asked).slice(0, 1)),
    domainSubJudgments: subs,
    // An AGREED resolution is never HIGH confidence: several conclusions point the same way but none accounts
    // for the others, so the engine cannot say which reading is doing the work.
    confidence: primary === null
      ? (resolution.kind === 'AGREED' ? 'MEDIUM' : 'LOW')
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
  return screenAll(r.propositions, r.premises);
}

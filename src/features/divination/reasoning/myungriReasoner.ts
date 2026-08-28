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
import { agreedHeadline, unresolvedHeadline } from './headlineProse';
import { analyzeLayer, type LayerAnalysis } from '../myungriLayer';
import { readNatalBaseline } from '../myungriNatal';
import type { MyungriJudgeInput } from '../myungriJudge';
import { tenGodFamily } from '../myungriJudge';
import { judgeMyungriStructuralV2FromStrengthInputs, type MyungriStructuralV2Result } from '../myungriStructuralV2';
import { judgeMyungriYongshin, type MyungriYongshinResult } from '../myungriYongshin';
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
const SCOPE_WIDTH: Record<string, number> = {
  PRESENT_MOMENT: 0, WOLWOON: 1, SEWOON: 2, DAEWOON: 3, NATAL: 4, UNSCOPED: 5,
};
const narrowestScopeOf = (ps: ReasonedProposition[]) =>
  [...ps].sort((a, b) => SCOPE_WIDTH[a.temporalScope] - SCOPE_WIDTH[b.temporalScope])[0]?.temporalScope;
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

  // Myungri Structural V2 (frozen judgment graph) — computed ONCE here, from exactly the fields
  // `NatalStructureInput`/`.strengthInputs` already carries; passed down as a finished RESULT so
  // `myungriPremises.ts` only has to report it, never recompute it (§4 — no duplicated logic).
  const structuralV2: MyungriStructuralV2Result | null = input.natal?.strengthInputs
    ? judgeMyungriStructuralV2FromStrengthInputs({
        dayMaster: input.natal.strengthInputs.dayMaster,
        dayMasterElement: input.natal.strengthInputs.dayMasterElement,
        seasonalPhase: input.natal.seasonalPhase,
        dayMasterRootPositions: input.natal.strengthInputs.dayMasterRootPositions,
        peerHiddenPositions: input.natal.strengthInputs.peerHiddenPositions,
        hourKnown: input.natal.hourKnown,
        positionedTenGods: input.natal.positionedTenGods,
      })
    : null;

  // Myungri Yongshin V1 — computed ONCE here, from the structural V2 result above plus exactly the
  // natal-relation and ten-god facts `NatalStructureInput` already carries; passed down as a finished
  // RESULT so `myungriPremises.ts` only has to report it, never recompute it (same seam as Structural
  // V2). `null` only when Structural V2 itself never ran (no chart at all) — an INSUFFICIENT
  // Structural V2 result still reaches judgeMyungriYongshin, which reports that honestly as UNRESOLVED.
  const yongshin: MyungriYongshinResult | null = structuralV2
    ? judgeMyungriYongshin({
        structuralV2,
        branchClashes: (input.natal?.natalRelations?.branch ?? [])
          .filter((r) => r.relation.kind === 'BRANCH_CLASH')
          .map((r) => ({ branches: r.relation.branches })),
        familyExists: (family) => (input.natal?.positionedTenGods ?? []).some((p) => tenGodFamily(p.tenGod) === family),
      })
    : null;

  // ── 1. PREMISES (no stance exists yet, and nothing here can see one) ────────────────────────────
  const premises = buildMyungriPremises({
    subject, questionIntent: intent, askedAxis: asked, baseline, layers, reliability,
    structuralV2, yongshin,
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
  // §7 of the live-pipeline integration brief: strength is no longer PERMANENTLY blocked — a real
  // Structural V2 premise is reported here as genuine evidence, the same visibility mechanism the
  // withheld marker used, just not filed under 'BLOCKED'.
  const structural = premises.filter((p) => p.doctrineReference.startsWith('STRUCTURAL_V2'));

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
    // Reported as USED (a real classification was computed), not withheld — Myungri Structural V2.
    ...(structural.length > 0 ? ['일간 강약(구조)'] : []),
    // Genuinely withheld — strength inputs were unavailable.
    ...(used.has('BLOCKED: 일간 강약 판정에 필요한 입력 부족') ? ['일간 강약(판정 보류)'] : []),
    // Reported as USED (a real treatment direction was computed), not withheld — Myungri Yongshin V1.
    ...(premises.some((p) => p.doctrineReference.startsWith('YONGSHIN_V1:')) ? ['억부용신(구조)'] : []),
    // Genuinely withheld — no deterministic candidate from current facts, or Structural V2 never ran.
    ...(used.has('BLOCKED: 억부용신 판정에 필요한 근거 부족') ? ['억부용신(판정 보류)'] : []),
  ];

  const judgment: DivinationJudgment = {
    discipline: 'MYUNGRI',
    applicable: premises.length > 0,
    ...(input.hourKnown ? {} : { applicabilityReason: '출생시간이 확정되지 않아 시(時)에 기대는 해석은 제한됩니다.' }),
    dataReliability: reliability,
    questionDomain: asked,
    // §28 — the NARROWEST layer the agreeing set covers, decided by the layers themselves rather than by
    // which member happened to be first.
    temporalScope: primary?.temporalScope ?? narrowestScopeOf(agreedMembers(resolution)) ?? 'NATAL',
    stance: primary ? stanceOf(primary) : agreedStance(resolution),
    dominantConclusion: primary?.assertion
      // §7 — several conclusions stand and every one points the same way. The direction is answerable, but no
      // single conclusion owns it, so ALL of them are stated rather than the first one being promoted.
      ?? (resolution.kind === 'AGREED'
        ? agreedHeadline(asked, resolution.direction, resolution.members.length)
        // §7/§31 — an unsettled set is stated as one, with every conclusion named. V4B promoted whichever
        // conclusion happened to sort first and never mentioned the others; saying "근거가 없습니다" here
        // would be worse still, because the findings exist and simply do not agree.
        : resolution.kind === 'UNRESOLVED'
          // The members themselves are reported as `internalContradictions` and as evidence — not concatenated
          // into the headline, where the engine's own vocabulary would become the professional answer.
          ? unresolvedHeadline(asked)
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
      ...evidenceOf(premises, structural.map((s) => s.id), 'GENERAL', asked),
    ],
    counterEvidence: evidenceOf(premises, answering(resolution).flatMap((p) => p.opposingPremiseIds), asked, asked),
    internalContradictions,
    // §33 — a top-1 over an unordered set was array-position arbitration. The NARROWEST layer is chosen by
    // the layers themselves, and content breaks a tie, so the same graph always reports the same signal.
    timingSignals: [...standing]
      .filter((p) => p.temporalScope === 'WOLWOON' || p.temporalScope === 'SEWOON')
      .sort((x, y) => (SCOPE_WIDTH[x.temporalScope] - SCOPE_WIDTH[y.temporalScope])
        || x.assertion.localeCompare(y.assertion))
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

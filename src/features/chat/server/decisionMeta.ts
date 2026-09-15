// Server-produced decision/audit context (Sprint D §D1). Composed from the Answer Plan + grounding +
// resolved temporal context and persisted inside structured_result JSON, so a follow-up can reason about
// the previous decision (§D2/§D3) and detect a decision-version mismatch (§D4). Pure; no LLM, no I/O.
import { CONSULTATION_PROMPT_VERSION } from '@/features/chat/prompts/consultationPromptVersion';
import { ANSWER_PLAN_VERSION, DECISION_POLICY_VERSION, type AnswerPlan } from './answerPlan';
import { classifyConsultationDomain, type ConsultationDomain } from './consultationDomain';
import {
  ALL_CONFIDENCES, ALL_CONTRADICTION_KINDS, ALL_DERIVATION_RULES, ALL_DIRECTNESS,
  ALL_EVIDENCE_STRENGTHS, ALL_STANCES, MYUNGRI_RULES, PRIMITIVE_RULE, isCanonicalTarget,
  sideAdequacy,
} from '@/features/divination';
import { CROSS_RULE_IDS } from '@/features/divination/reasoning/crossRules';
import {
  authoritativeConclusionForState, controlledDeclineConclusions,
} from '@/features/divination/reasoning/crossReasoner';
import {
  projectVerdictFromGraph, validateCrossDerivation, validateMyungriDerivation, validatePersistedPrimitive,
} from '@/features/divination/reasoning/persistedGraphValidation';
import type {
  CrossDivinationVerdict, Discipline, DivinationPremise, JudgmentDomain, ReasonedProposition,
} from '@/features/divination';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import type { ConsultationDecisionMeta, ResolvedTemporalContext } from './serverConsultationTypes';

export function buildConsultationDecisionMeta(
  question: string,
  plan: AnswerPlan,
  grounding: ConsultationGrounding,
  resolvedTemporalContext: ResolvedTemporalContext,
  modelId?: string | null,
  // Sprint E.1 §18 — a follow-up ("그럼 내년은?") that inherits the prior topic supplies it here, so the NEW
  // decision persists the CARRIED domain (the bare follow-up question classifies as 전반 on its own). When
  // absent/전반, the domain is classified fresh from the question.
  carriedDomain?: ConsultationDomain | null,
  // V4D §23 — where this graph came from in this conversation. Provenance only; nothing branches on it.
  graphRevision?: ConsultationDecisionMeta['graphRevision'],
  // G6 PATCH 2 §7 — set true ONLY on a turn that declined because ITS OWN prior history was malformed or
  // unloadable and this turn was itself trying to depend on it. See ConsultationDecisionMeta's own doc
  // comment for why this needs to be durable (persisted), not just an in-memory flag for one turn.
  priorHistoryUnavailable?: boolean,
): ConsultationDecisionMeta {
  const domain = carriedDomain && carriedDomain !== '전반' ? carriedDomain : classifyConsultationDomain(question);
  return {
    answerPlanVersion: ANSWER_PLAN_VERSION,
    decisionPolicyVersion: DECISION_POLICY_VERSION,
    promptVersion: CONSULTATION_PROMPT_VERSION,
    ...(grounding.status === 'available' && grounding.engineVersion ? { engineVersion: grounding.engineVersion } : {}),
    ...(modelId ? { modelId } : {}), // Sprint E §10 — actual runtime model id, server-supplied (never client)
    resolvedGranularity: plan.resolvedGranularity,
    resolvedTargets: resolvedTemporalContext.resolvedTargets,
    ...(plan.polarity ? { polarity: plan.polarity } : {}),
    domain,
    comparisonContext: plan.comparisonContext,
    ...(priorHistoryUnavailable ? { priorHistoryUnavailable: true as const } : {}),
    // §17 — persist the FULL cross verdict so a later "왜요?" explains the SAME judgment (subject, evidence
    // and contradiction resolution), instead of falling back to a Myungri-only polarity snapshot.
    ...(graphRevision ? { graphRevision } : {}),
    ...(grounding.status === 'available' && grounding.divinationVerdict
      ? { divinationVerdict: grounding.divinationVerdict }
      : {}),
    ...(plan.selectedTargetPolarity && grounding.status === 'available' && grounding.engineVersion
      ? {
          evidenceSnapshot: {
            schemaVersion: 'decision-evidence@1.0.0' as const,
            target: {
              granularity: plan.selectedTargetPolarity.granularity,
              key: plan.selectedTargetPolarity.targetKey,
            },
            polarity: plan.selectedTargetPolarity.polarity,
            derivation: plan.selectedTargetPolarity.derivation,
            supportLevel: plan.supportLevel,
            assertiveness: plan.assertiveness,
            intents: plan.intents,
            engineVersion: grounding.engineVersion,
          },
        }
      : {}),
    resolvedTemporalContext,
  };
}

const POLARITY_TIERS = ['FAVORABLE', 'STEADY', 'DYNAMIC', 'CAUTION'];
// The persisted-row allowlist. It MUST cover every ConsultationDomain the classifier can emit: a stored
// decision carrying a label this list omits fails the parser, and a later follow-up over it then fails
// closed as malformed history (G6 PATCH 2 §9) — so a routing label added without this line would silently
// break continuation for exactly the questions the new axis was added to serve. V6.1 adds 변화 and 시기.
const DOMAINS = ['사업', '창업', '이직', '직업', '재물', '결혼', '연애', '재회', '관계', '건강', '시험', '이사', '계약', '변화', '시기', '전반'];
const PILLAR_POSITIONS = ['YEAR', 'MONTH', 'DAY', 'HOUR'];
const STEM_RELATION_KINDS = ['STEM_COMBINATION', 'STEM_CLASH'];
const BRANCH_RELATION_KINDS = [
  'BRANCH_SIX_COMBINATION', 'BRANCH_CLASH', 'BRANCH_HALF_THREE_HARMONY',
  'BRANCH_PUNISHMENT', 'BRANCH_SELF_PUNISHMENT', 'BRANCH_DESTRUCTION', 'BRANCH_HARM',
];
const isFiniteInteger = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && Number.isInteger(v);
const strictNumArray = (v: unknown): number[] | undefined =>
  Array.isArray(v) && v.length <= 24 && v.every(isFiniteInteger) ? v : undefined;
const validRelationArray = (v: unknown, kinds: readonly string[]): boolean =>
  Array.isArray(v) && v.length <= 8 && v.every((item) => {
    if (item === null || typeof item !== 'object') return false;
    const r = item as Record<string, unknown>;
    return typeof r.position === 'string' && PILLAR_POSITIONS.includes(r.position) &&
      typeof r.kind === 'string' && kinds.includes(r.kind);
  });

function parseEvidenceSnapshot(v: unknown): ConsultationDecisionMeta['evidenceSnapshot'] | undefined {
  if (v === null || typeof v !== 'object') { return undefined; }
  const ev = v as Record<string, unknown>;
  const target = ev.target as Record<string, unknown> | null;
  const derivation = ev.derivation as Record<string, unknown> | null;
  if (ev.schemaVersion !== 'decision-evidence@1.0.0' || !target || typeof target !== 'object') { return undefined; }
  if ((target.granularity !== 'YEAR' && target.granularity !== 'MONTH') || !isFiniteInteger(target.key)) { return undefined; }
  if (typeof ev.polarity !== 'string' || !POLARITY_TIERS.includes(ev.polarity)) { return undefined; }
  if (!derivation || typeof derivation !== 'object') { return undefined; }
  if (!isFiniteInteger(derivation.harmony) || derivation.harmony < 0 || derivation.harmony > 8) { return undefined; }
  if (!isFiniteInteger(derivation.friction) || derivation.friction < 0 || derivation.friction > 8) { return undefined; }
  if (!validRelationArray(derivation.stemRelations, STEM_RELATION_KINDS) ||
      !validRelationArray(derivation.branchRelations, BRANCH_RELATION_KINDS)) { return undefined; }
  if (typeof ev.supportLevel !== 'string' || typeof ev.assertiveness !== 'string' || typeof ev.engineVersion !== 'string' || ev.engineVersion.length === 0) { return undefined; }
  if (!Array.isArray(ev.intents) || ev.intents.length > 8 || !ev.intents.every((x) => typeof x === 'string')) { return undefined; }
  return ev as ConsultationDecisionMeta['evidenceSnapshot'];
}

/**
 * Fail-closed parse of a persisted decisionMeta (Sprint D/E). Malformed → undefined (never a silent default
 * that pretends a legacy row used the current versions). Server-side so the Edge follow-up loader can reuse
 * it on a row it queried; also used by the client persistence layer.
 */
/**
 * V3 §34/§44 — deserialize the persisted cross-discipline verdict. Validates the SHAPE the follow-up turn
 * actually depends on (direction + per-discipline judgments + axes + evidence), so a truncated or foreign
 * payload is rejected instead of silently restoring a hollow judgment. Structure only — no astrology here.
 */
export function parseDivinationVerdict(v: unknown): CrossDivinationVerdict | undefined {
  if (v === null || typeof v !== 'object') { return undefined; }
  const o = v as Record<string, unknown>;
  if (typeof o.direction !== 'string' || typeof o.primaryConclusion !== 'string') { return undefined; }
  // Optional so rows persisted before V4C still restore; when present it must be a real list of ids, and the
  // referential check below proves every one of them resolves.
  if (o.headlinePropositionIds !== undefined
    && !(Array.isArray(o.headlinePropositionIds) && o.headlinePropositionIds.every((x) => typeof x === 'string'))) {
    { return undefined; }
  }
  if (typeof o.verdictVersion !== 'string') { return undefined; }

  // V4B §23 — FULL GRAPH INTEGRITY. FAIL CLOSED.
  //
  // This parser is a strict WHITELIST: a field it does not validate is silently dropped on restore, which is
  // exactly how the V2 verdict vanished between turns while an in-memory test stayed green. V4A validated the
  // SHAPE of each node but not the graph: duplicate ids, dangling links, self-references and cycles all passed,
  // and a follow-up would then reason over a graph that could not be traversed. Everything below is validated
  // as a GRAPH, and any violation rejects the whole verdict — a partially restored graph is worse than none,
  // because the follow-up would answer from it without knowing what was missing.
  const CONCLUSION_TYPES = new Set(['STRUCTURAL', 'CAUSAL', 'DIRECTIONAL', 'TEMPORAL', 'COMPOUND']);
  const DIRECTIONS = new Set(['FAVORABLE', 'UNFAVORABLE', 'RESTRICTED', 'NONE']);
  const SCOPES = new Set(['NATAL', 'DAEWOON', 'SEWOON', 'WOLWOON', 'PRESENT_MOMENT', 'UNSCOPED']);
  const RELATIONS = new Set([
    'SUPPORTS', 'OPPOSES', 'ACTIVATES', 'WEAKENS', 'DELAYS', 'ACCELERATES', 'CONNECTS', 'SEPARATES',
    'STABILIZES', 'DESTABILIZES', 'CONSTRAINS', 'ENABLES', 'ABSENT',
  ]);
  const ADEQUACY_LEVELS = new Set(['ADEQUATE', 'THIN', 'NONE']);
  // V4C §25 — EVERY enum the restored graph carries is checked. V4B validated four of them and let the rest
  // through as "typeof === string", so a persisted row could restore a proposition whose intent, axis,
  // discipline, concept, role or adequacy grade was a value the kernel has no branch for — and the follow-up
  // would then reason over it.
  const DISCIPLINES = new Set(['MYUNGRI', 'ZIWEI', 'QIMEN']);
  const PROPOSITION_DISCIPLINES = new Set([...DISCIPLINES, 'CROSS']);
  const INTENTS = new Set(['DESCRIPTIVE', 'CAUSE_WHY', 'DECISION', 'TIMING', 'OUTCOME', 'PROBABILITY']);
  const AXES = new Set([
    'OPPORTUNITY', 'OUTCOME', 'MONEY_INFLOW', 'MONEY_RETENTION', 'CAREER', 'MOVEMENT', 'RELATION_BOND',
    'RELATION_STABILITY', 'CONFLICT', 'INFLUENCE', 'HEALTH_ENERGY', 'DECISION', 'TIMING', 'GENERAL',
  ]);
  const CONCEPTS = new Set([
    'NATAL_FAMILY', 'SEASONAL_FOOTING', 'ROOTING', 'NATAL_SEAT_STRAIN', 'LAYER_ACTIVATION', 'RIVAL_CLAIM',
    'SEAT_CONTACT', 'LAYER_SILENT', 'DOCTRINE_BLOCK', 'DAY_MASTER_STRENGTH', 'DAY_MASTER_YONGSHIN',
    'CONSULTATION_JUDGMENT', 'ADAPTED',
  ]);
  const ROLES = new Set(['ASSERTS', 'QUALIFIES', 'DESCRIBES']);
  const APPLICABILITIES = new Set(['DIRECT', 'CONTEXTUAL', 'BACKGROUND']);
  const RELIABILITIES = new Set(['EXACT', 'REDUCED', 'MINIMAL', 'UNUSABLE']);
  const COMPLETENESS = new Set(['COMPLETE', 'PARTIAL', 'INSUFFICIENT']);
  const DOCTRINE_APPLICABILITY = new Set(['ADOPTED', 'PARTIAL', 'BLOCKED']);
  const RESTRICTIONS = new Set(['TIMING', 'SCOPE', 'CAPACITY']);
  const SUPPORT_GROUP_ROLES = new Set(['REQUIRED', 'ALTERNATIVE']);
  // V4D §27/§28 — the remaining unions, taken from the kernel's own registries rather than re-typed here.
  const STANCES = new Set<string>(ALL_STANCES);
  const CONFIDENCES = new Set<string>(ALL_CONFIDENCES);
  const DIRECTNESS = new Set<string>(ALL_DIRECTNESS);
  const EVIDENCE_STRENGTHS = new Set<string>(ALL_EVIDENCE_STRENGTHS);
  const CONTRADICTION_KINDS = new Set<string>(ALL_CONTRADICTION_KINDS);
  const DERIVATION_RULES = new Set<string>(ALL_DERIVATION_RULES);
  const CROSS_RULES = new Set<string>(CROSS_RULE_IDS);
  const MYUNGRI_RULE_IDS = new Set<string>(MYUNGRI_RULES.map((r) => r.id));

  /** One piece of named evidence, fully checked. Reused by judgments, sub-judgments and the verdict lists. */
  const evidenceOk = (x: unknown): boolean => {
    if (!Array.isArray(x)) return false;
    return x.every((e) => {
      if (e === null || typeof e !== 'object') return false;
      const ev = e as Record<string, unknown>;
      return typeof ev.fact === 'string' && typeof ev.meaning === 'string'
        && enumOk(AXES, ev.domain) && enumOk(SCOPES, ev.temporalScope) && enumOk(DIRECTNESS, ev.directness);
    });
  };
  const enumOk = (set: Set<string>, x: unknown): boolean => typeof x === 'string' && set.has(x);
  const isStringArray = (a: unknown): a is string[] =>
    Array.isArray(a) && a.every((x) => typeof x === 'string');
  if (!Array.isArray(o.disciplineJudgments) || o.disciplineJudgments.length === 0) { return undefined; }
  for (const j of o.disciplineJudgments) {
    if (j === null || typeof j !== 'object') { return undefined; }
    const dj = j as Record<string, unknown>;
    // V4D §27 — V4C accepted any string for `discipline` and `stance` here, and never looked inside the
    // sub-judgments at all. A restored judgment could therefore carry a stance the projection layer has no
    // branch for, and a sub-judgment of an entirely foreign shape.
    if (typeof dj.applicable !== 'boolean') { return undefined; }
    if (!enumOk(DISCIPLINES, dj.discipline)) { return undefined; }
    if (!enumOk(STANCES, dj.stance)) { return undefined; }
    if (!enumOk(RELIABILITIES, dj.dataReliability)) { return undefined; }
    if (!enumOk(AXES, dj.questionDomain)) { return undefined; }
    if (!enumOk(SCOPES, dj.temporalScope)) { return undefined; }
    if (!enumOk(CONFIDENCES, dj.confidence)) { return undefined; }
    if (!enumOk(DIRECTNESS, dj.questionDirectness)) { return undefined; }
    if (!enumOk(EVIDENCE_STRENGTHS, dj.evidenceStrength)) { return undefined; }
    if (typeof dj.dominantConclusion !== 'string' || typeof dj.dominantFactor !== 'string') { return undefined; }
    if (!evidenceOk(dj.directEvidence) || !evidenceOk(dj.counterEvidence) || !evidenceOk(dj.timingSignals)) {
      { return undefined; }
    }
    if (!isStringArray(dj.internalContradictions) || !isStringArray(dj.factGroupsUsed)) { return undefined; }
    if (!Array.isArray(dj.domainSubJudgments)) { return undefined; }
    for (const sj of dj.domainSubJudgments) {
      if (sj === null || typeof sj !== 'object') { return undefined; }
      const sub = sj as Record<string, unknown>;
      if (!enumOk(AXES, sub.domain) || !enumOk(STANCES, sub.stance)) { return undefined; }
      if (!enumOk(SCOPES, sub.temporalScope) || !enumOk(DIRECTNESS, sub.directness)) { return undefined; }
      if (!enumOk(RELIABILITIES, sub.reliability)) { return undefined; }
      if (typeof sub.conclusion !== 'string') { return undefined; }
      if (!evidenceOk(sub.evidence) || !evidenceOk(sub.counterEvidence)) { return undefined; }
    }
  }
  if (!Array.isArray(o.axisVerdicts) || !Array.isArray(o.contributions)) { return undefined; }
  if (!Array.isArray(o.evidenceReferences)) { return undefined; }
  if (!enumOk(STANCES, o.direction)) { return undefined; }
  if (!enumOk(CONFIDENCES, o.confidence)) { return undefined; }
  if (!evidenceOk(o.favorableFactors) || !evidenceOk(o.riskFactors)) { return undefined; }
  for (const a of o.axisVerdicts) {
    if (a === null || typeof a !== 'object') { return undefined; }
    const av = a as Record<string, unknown>;
    if (!enumOk(AXES, av.domain) || !enumOk(STANCES, av.stance)) { return undefined; }
    if (!enumOk(DISCIPLINES, av.dominantDiscipline)) { return undefined; }
    if (typeof av.conclusion !== 'string' || typeof av.contested !== 'boolean') { return undefined; }
  }
  for (const c of o.contributions) {
    if (c === null || typeof c !== 'object') { return undefined; }
    const co = c as Record<string, unknown>;
    if (!enumOk(DISCIPLINES, co.discipline) || !enumOk(STANCES, co.stance)) { return undefined; }
    if (typeof co.applied !== 'boolean' || typeof co.contribution !== 'string') { return undefined; }
  }
  for (const r of (Array.isArray(o.contradictionResolutions) ? o.contradictionResolutions : [])) {
    if (r === null || typeof r !== 'object') { return undefined; }
    const re = r as Record<string, unknown>;
    if (!enumOk(CONTRADICTION_KINDS, re.kind)) { return undefined; }
    if (!enumOk(DISCIPLINES, re.dominant)) { return undefined; }
    if (!isStringArray(re.between) || !re.between.every((d) => DISCIPLINES.has(d))) { return undefined; }
    if (typeof re.conflict !== 'string' || typeof re.resolution !== 'string') { return undefined; }
    if (typeof re.whyOtherDidNotDominate !== 'string') { return undefined; }
  }
  for (const e of o.evidenceReferences) {
    if (e === null || typeof e !== 'object') { return undefined; }
    const ev = e as Record<string, unknown>;
    if (typeof ev.discipline !== 'string') { return undefined; }
    if (!DISCIPLINES.has(ev.discipline) && ev.discipline !== 'CROSS') { return undefined; }
    if (!isStringArray(ev.lines)) { return undefined; }
  }


  // V4C §3 — target validation is DELEGATED to the canonical registry, which checks that the declared kind
  // matches the key's namespace (rejecting kind=PALACE with key=RELATION_STABILITY:…) and that the id is a
  // registered one. A second hand-maintained list here would drift from the registry the moment a target is
  // added, and the drift would show up as a legitimate graph failing to restore.
  const isTarget = isCanonicalTarget;

  // ── PREMISES ───────────────────────────────────────────────────────────────────────────────────
  const premiseIds = new Set<string>();
  const premisesOut: Record<string, unknown>[] = [];
  if (o.premises !== undefined) {
    if (!Array.isArray(o.premises)) { return undefined; }
    for (const p of o.premises) {
      if (p === null || typeof p !== 'object') { return undefined; }
      const pr = p as Record<string, unknown>;
      if (typeof pr.id !== 'string' || pr.id.length === 0) { return undefined; }
      if (premiseIds.has(pr.id)) { return undefined; }              // duplicate premise id
      premiseIds.add(pr.id);
      if (typeof pr.assertion !== 'string' || pr.assertion.length === 0) { return undefined; }
      if (typeof pr.semanticRelation !== 'string' || !RELATIONS.has(pr.semanticRelation)) { return undefined; }
      if (!enumOk(AXES, pr.questionAxis) || typeof pr.subject !== 'string' || pr.subject.length === 0) { return undefined; }
      if (!enumOk(SCOPES, pr.temporalScope)) { return undefined; }
      if (!enumOk(DISCIPLINES, pr.discipline)) { return undefined; }
      if (!enumOk(INTENTS, pr.questionIntent)) { return undefined; }
      if (!enumOk(CONCEPTS, pr.concept)) { return undefined; }
      if (!enumOk(ROLES, pr.role)) { return undefined; }
      if (!enumOk(APPLICABILITIES, pr.applicability)) { return undefined; }
      if (!enumOk(RELIABILITIES, pr.reliability)) { return undefined; }
      if (typeof pr.doctrineReference !== 'string') { return undefined; }
      if (!isTarget(pr.target)) { return undefined; }
      if (!isStringArray(pr.sourceFactIds)) { return undefined; }
      // §28 — the contract says an empty fact list is legal ONLY for an ABSENT relation ("부재도 사실이다").
      // A premise asserting a relation while naming no engine fact is exactly the ungrounded interpretation
      // the premise layer exists to make impossible.
      if (pr.sourceFactIds.length === 0 && pr.semanticRelation !== 'ABSENT') { return undefined; }
      premisesOut.push({
        id: pr.id, discipline: pr.discipline, sourceFactIds: [...(pr.sourceFactIds as string[])],
        subject: pr.subject, target: { key: pr.target.key, label: pr.target.label, kind: pr.target.kind },
        questionIntent: pr.questionIntent, questionAxis: pr.questionAxis, temporalScope: pr.temporalScope,
        semanticRelation: pr.semanticRelation, concept: pr.concept, assertion: pr.assertion, role: pr.role,
        reliability: pr.reliability, applicability: pr.applicability, doctrineReference: pr.doctrineReference,
      });
    }
  }

  // V4F §2 — indexed for RECOMPUTING adequacy below, from the SAME validated premise objects propositions
  // will cite. Built once here rather than per-proposition.
  const premiseById = new Map(premisesOut.map((p) => [p.id as string, p]));

  // ── PROPOSITIONS ───────────────────────────────────────────────────────────────────────────────
  if (!Array.isArray(o.propositions)) { return undefined; }
  const propositionIds = new Set<string>();
  const parsed: Record<string, unknown>[] = [];
  for (const p of o.propositions) {
    if (p === null || typeof p !== 'object') { return undefined; }
    const pr = p as Record<string, unknown>;
    if (typeof pr.id !== 'string' || pr.id.length === 0) { return undefined; }
    if (propositionIds.has(pr.id)) { return undefined; }            // duplicate proposition id
    propositionIds.add(pr.id);
    if (typeof pr.assertion !== 'string' || pr.assertion.length === 0) { return undefined; }
    // §28 — a rule this kernel does not have cannot be re-derived, explained or attacked.
    if (!enumOk(DERIVATION_RULES, pr.derivationRule)) { return undefined; }
    if (typeof pr.conclusionType !== 'string' || !CONCLUSION_TYPES.has(pr.conclusionType)) { return undefined; }
    if (typeof pr.direction !== 'string' || !DIRECTIONS.has(pr.direction)) { return undefined; }
    if (!enumOk(SCOPES, pr.temporalScope)) { return undefined; }
    if (!enumOk(AXES, pr.questionAxis)) { return undefined; }
    if (typeof pr.subject !== 'string' || pr.subject.length === 0) { return undefined; }
    if (!enumOk(PROPOSITION_DISCIPLINES, pr.discipline)) { return undefined; }
    if (!enumOk(INTENTS, pr.questionIntent)) { return undefined; }
    if (pr.restriction !== undefined && !enumOk(RESTRICTIONS, pr.restriction)) { return undefined; }
    if (pr.answersAsked !== undefined && typeof pr.answersAsked !== 'boolean') { return undefined; }
    if (pr.qualified !== undefined && typeof pr.qualified !== 'boolean') { return undefined; }
    if (!isStringArray(pr.doctrineReferences)) { return undefined; }
    if (!isStringArray(pr.unresolvedPremiseIds)) { return undefined; }
    // V4D §15 — support groups round-trip, or the certification harness silently loses the declaration the
    // deriving rule made and falls back to the weaker "some removal moved something" test on restored graphs.
    if (pr.supportGroups !== undefined) {
      if (!Array.isArray(pr.supportGroups)) { return undefined; }
      for (const g of pr.supportGroups) {
        if (g === null || typeof g !== 'object') { return undefined; }
        const grp = g as Record<string, unknown>;
        if (!enumOk(SUPPORT_GROUP_ROLES, grp.role)) { return undefined; }
        if (typeof grp.label !== 'string') { return undefined; }
        if (!isStringArray(grp.ids) || grp.ids.length === 0) { return undefined; }
      }
    }
    if (!isTarget(pr.target)) { return undefined; }
    if (!isStringArray(pr.supportingPremiseIds) || !isStringArray(pr.opposingPremiseIds)) { return undefined; }
    if (!isStringArray(pr.derivedFromPropositionIds)) { return undefined; }
    if (pr.adequacy === null || typeof pr.adequacy !== 'object') { return undefined; }
    const ad = pr.adequacy as Record<string, unknown>;
    if (!enumOk(ADEQUACY_LEVELS, ad.supportAdequacy)) { return undefined; }
    if (!enumOk(ADEQUACY_LEVELS, ad.counterAdequacy)) { return undefined; }
    if (!enumOk(COMPLETENESS, ad.dataCompleteness)) { return undefined; }
    if (!enumOk(DOCTRINE_APPLICABILITY, ad.doctrineApplicability)) { return undefined; }
    // A premise cannot both support and oppose the same claim.
    const sup = new Set(pr.supportingPremiseIds as string[]);
    if ((pr.opposingPremiseIds as string[]).some((id) => sup.has(id))) { return undefined; }

    // ── V4E §7 — SEMANTIC INVARIANTS, FAIL CLOSED. Syntax and enums are necessary but not sufficient: a
    // graph can be enum-valid and still assert something the kernel could never have produced, and a restored
    // impossibility would flow straight into standing and arbitration. Nothing here is "repaired" — a
    // malformed graph is rejected whole.
    //
    // A restriction is the SHAPE of a RESTRICTED direction; on any other direction it is a contradiction in
    // terms (and stanceOf would read it anyway). V4F Sec3 completes the converse: for a DERIVED conclusion,
    // RESTRICTED with no restriction at all is equally shapeless — stanceOf's own RESTRICTED branch reads
    // pr.restriction to choose FOR_BUT_LATER vs CONDITIONAL_AGAINST. PRIMITIVE is exempt: primitivePropositions()
    // maps a bare CONSTRAINS premise straight to RESTRICTED with no restriction kind, because a single restated
    // premise has no TIMING-vs-SCOPE shape to name in the first place — only a compound that relates two things
    // can be about one or the other.
    if (pr.restriction !== undefined && pr.direction !== 'RESTRICTED') { return undefined; }
    // V4F Sec3 completes the converse — but only for the rules PROVEN (by reading every apply()/emit() body)
    // to always MINT a restriction fresh when they set RESTRICTED: CONTESTED_SHARE, DIRECTION_VS_EXECUTION and
    // INFLOW_VS_RETENTION (myungriRules.ts) and CROSS_TIMING_SPLIT (crossRules.ts) all set a literal
    // restriction beside every RESTRICTED they emit. Everyone else may legitimately omit it: a PRIMITIVE's
    // bare CONSTRAINS premise has no TIMING-vs-SCOPE shape to name, and CROSS_REINFORCEMENT /
    // CROSS_CONTRADICTION_RESOLVED / CROSS_AXIS_COMPOUND all COPY `direction`/`restriction` forward from
    // whichever operand they relay (e.g. `direction: asked.direction, ...(asked.restriction ? {...} : {})`),
    // so a RESTRICTED verdict relayed from a restriction-less PRIMITIVE parent is itself restriction-less by
    // the same, real construction — not a corrupted row.
    const RULES_REQUIRING_RESTRICTION = new Set([
      'CONTESTED_SHARE', 'DIRECTION_VS_EXECUTION', 'INFLOW_VS_RETENTION', 'CROSS_TIMING_SPLIT',
    ]);
    if (pr.direction === 'RESTRICTED' && pr.restriction === undefined
      && RULES_REQUIRING_RESTRICTION.has(pr.derivationRule as string)) {
      { return undefined; }
    }
    // A derivation rule belongs to the layer that owns it: a CROSS rule on a discipline proposition (or the
    // reverse) is a conclusion no reasoner could have minted.
    if (CROSS_RULES.has(pr.derivationRule as string) !== (pr.discipline === 'CROSS')) { return undefined; }
    if (MYUNGRI_RULE_IDS.has(pr.derivationRule as string) && pr.discipline !== 'MYUNGRI') { return undefined; }
    // G6 PATCH 2 §2 — a PRIMITIVE restates one premise and has no parents. Every OTHER rule's actual required
    // parent SHAPE (not just a count) is validated in a second pass below, once every proposition's own id is
    // known — a persisted proposition can reference a sibling that has not been reached yet in array order.
    const ancestry = (pr.derivedFromPropositionIds as string[]).length;
    if (pr.derivationRule === PRIMITIVE_RULE && ancestry !== 0) { return undefined; }
    // V4F §3 — A DESCRIPTION OR A CAUSE NEVER CARRIES A DIRECTION. Every STRUCTURAL/CAUSAL proposition this
    // kernel actually produces sets `direction: 'NONE'` (primitivePropositions for ABSENT/ACTIVATES;
    // CONVERGENT_SEAT_PRESSURE and RECURRING_FRICTION_CAUSE explicitly, "a CAUSE is not a VERDICT"; CROSS_STANDOFF
    // explicitly). Combined with the restriction gate above, this is what makes "STRUCTURAL + RESTRICTED +
    // TIMING" — a combination no reasoner could produce — actually unreachable rather than merely unlikely.
    if ((pr.conclusionType === 'STRUCTURAL' || pr.conclusionType === 'CAUSAL') && pr.direction !== 'NONE') {
      { return undefined; }
    }
    // V4F §2 — PERSISTED ADEQUACY IS NOT AUTHORITY. RECOMPUTE IT.
    //
    // `sideAdequacy` is a pure function of the cited premises' own `applicability`/`reliability` fields,
    // and every one of those premises is already validated and sitting in `premiseById` by this point in
    // parsing — so the grade a proposition claims is not trusted, it is REPRODUCED from the same premise
    // objects the reasoner would have used, with the kernel's own current rule (one premise DIRECT *and*
    // EXACT), and compared. A mismatch — most dangerously a forged upgrade, DIRECT from one premise plus EXACT
    // from an unrelated one composed into a persisted `ADEQUATE` neither actually earned — rejects the row
    // rather than silently trusting a grade nothing here can verify was ever produced by this reasoning.
    //
    // Referential integrity (every cited id resolves to a real premise) is checked in the pass below this
    // loop; if that later rejects the graph, this recomputation was performed against whatever ANY dangling
    // id happened to resolve to = nothing, so it is re-validated there regardless — this check is not weakened
    // by running before it.
    const ad2 = pr.adequacy as Record<string, unknown>;
    const lookUp = (ids: unknown) => (Array.isArray(ids) ? ids : [])
      .map((id) => premiseById.get(id as string))
      .filter((x): x is DivinationPremise => !!x);
    const supportPremises = lookUp(pr.supportingPremiseIds);
    const opposePremises = lookUp(pr.opposingPremiseIds);
    if (sideAdequacy(supportPremises) !== ad2.supportAdequacy) { return undefined; }
    if (sideAdequacy(opposePremises) !== ad2.counterAdequacy) { return undefined; }

    // G6 PATCH 2 §1 — ONE SHARED PRIMITIVE VALIDATOR, NATIVE + ADAPTER ALIKE.
    //
    // A PRIMITIVE restates exactly one premise. persistedGraphValidation.ts's validatePersistedPrimitive()
    // checks it against the SAME relation/direction table BOTH myungriRules.ts's primitivePropositions() and
    // disciplineAdapter.ts's adaptJudgment() actually use to mint one — not a Myungri-only allowlist that
    // skipped ZIWEI/QIMEN/pair-MYUNGRI (the V4F gap the audit's OPPOSES-forgery example exploited).
    if (pr.derivationRule === PRIMITIVE_RULE) {
      if (!validatePersistedPrimitive(
        pr as unknown as Parameters<typeof validatePersistedPrimitive>[0],
        premiseById as unknown as Map<string, DivinationPremise>,
      )) { return undefined; }
    }
    parsed.push(pr);
  }

  // ── REFERENTIAL INTEGRITY + ACYCLICITY ─────────────────────────────────────────────────────────
  // Premise links are only checked when premises were transmitted at all; a verdict from a discipline that is
  // not on the graph legitimately carries none.
  for (const pr of parsed) {
    // V4C §25 — CHECKED EVEN WHEN NO PREMISES WERE TRANSMITTED. V4B skipped this whole block when the premise
    // list was empty, on the theory that a discipline off the graph legitimately carries none. But a
    // proposition that CITES a premise id while no premises exist is exactly the dangling reference the check
    // is for, and the exemption made an empty premise list the way to smuggle one past.
    for (const id of [...(pr.supportingPremiseIds as string[]), ...(pr.opposingPremiseIds as string[]),
      ...(pr.unresolvedPremiseIds as string[])]) {
      if (!premiseIds.has(id)) { return undefined; }                // dangling premise link
    }
    for (const id of pr.derivedFromPropositionIds as string[]) {
      if (id === pr.id) { return undefined; }                       // self-reference
      if (!propositionIds.has(id)) { return undefined; }            // dangling proposition link
    }
    // §15 — a group may only name inputs this proposition ALREADY cites, so declaring groups can never
    // introduce a new class of reference for the integrity pass to miss.
    const cited = new Set([
      ...(pr.supportingPremiseIds as string[]),
      ...(pr.opposingPremiseIds as string[]),
      ...(pr.derivedFromPropositionIds as string[]),
    ]);
    for (const g of (Array.isArray(pr.supportGroups) ? pr.supportGroups as Record<string, unknown>[] : [])) {
      for (const id of g.ids as string[]) if (!cited.has(id)) { return undefined; }
    }
  }
  // The derivation graph must be a DAG: a follow-up traverses it, and a cycle would not terminate.
  const edges = new Map(parsed.map((pr) => [pr.id as string, pr.derivedFromPropositionIds as string[]]));
  const state = new Map<string, 'VISITING' | 'DONE'>();
  const hasCycle = (id: string): boolean => {
    const seen = state.get(id);
    if (seen === 'DONE') return false;
    if (seen === 'VISITING') return true;
    state.set(id, 'VISITING');
    for (const next of edges.get(id) ?? []) if (hasCycle(next)) return true;
    state.set(id, 'DONE');
    return false;
  };
  for (const id of edges.keys()) if (hasCycle(id)) { return undefined; }

  // ── CONTEXT CONSISTENCY ────────────────────────────────────────────────────────────────────────
  if (!enumOk(INTENTS, o.questionIntent)) { return undefined; }
  if (!enumOk(AXES, o.questionDomain)) { return undefined; }
  if (typeof o.asksTiming !== 'boolean') { return undefined; }
  // DECISION JUDGMENT V1 — the axes the answer was selected over. Validated as a real axis list (fail-closed
  // on anything else), absent on every row written before Decision Semantics V1. `undefined` makes every
  // projection below fall back to `[questionDomain]`, which is exactly what those rows were produced with.
  if (o.decidingAxes !== undefined && !(Array.isArray(o.decidingAxes) && o.decidingAxes.every((a) => enumOk(AXES, a)))) {
    return undefined;
  }
  const decidingAxes: JudgmentDomain[] | undefined = Array.isArray(o.decidingAxes)
    ? (o.decidingAxes as JudgmentDomain[]) : undefined;

  // ── DELIVERY V7 — THE SYNTHESIS, STRICTLY VALIDATED ────────────────────────────────────────────
  //
  // It is now the CUSTOMER authority: the headline, the close, the compound/standoff sections and the
  // language layer's reading contract all derive from it. A follow-up turn that silently dropped it would
  // answer the same question under the older vocabulary — the defect class this batch closes for the
  // deciding axes. It is therefore parsed field by field into a NEW object like everything else here; a row
  // that fails any check loses the synthesis and falls back to the graph verdict, never to a partly-trusted
  // pass-through.
  const KINDS = new Set([
    'AGREED', 'QUALIFIED', 'COMPOUND_MIXED', 'TEMPORAL_SPLIT', 'OUTCOME_SPLIT', 'TRUE_STANDOFF',
    'SINGLE_AUTHORITY', 'NON_DIRECTIONAL', 'NO_APPLICABLE_JUDGMENT',
  ]);
  const SY_STANCES = new Set(['FOR', 'AGAINST', 'QUALIFIED_FOR', 'QUALIFIED_AGAINST', 'COMPOUND', 'UNRESOLVED']);
  const OUTCOMES = new Set(['DIRECTION', 'OCCURRENCE', 'PERIOD', 'CAUSE', 'DESCRIPTION', 'CONDUCT']);
  const AUTHORITIES = new Set([
    'DIRECT_PROPOSITION', 'BOUNDED_DOMAIN_SUMMARY', 'INDIRECT_QUALIFIER', 'CONTEXT_ONLY',
  ]);
  const SY_ROLES = new Set(['PRIMARY', 'OUTCOME', 'CONSTRAINT', 'TIMING', 'CONTEXT']);
  const CONCLUSION_DIRECTIONS = new Set(['FAVORABLE', 'UNFAVORABLE', 'RESTRICTED', 'NONE']);
  const BANDS = new Set(['NEAR', 'STRUCTURAL', 'UNSCOPED']);
  const RECONCILED = new Set(['AUTHORITY_DIRECTNESS', 'STRICT_DOMINANCE', 'TEMPORAL_SCOPE', 'QUALIFICATION']);

  let decisionCrossSynthesis: CrossDivinationVerdict['decisionCrossSynthesis'];
  if (o.decisionCrossSynthesis !== undefined) {
    const raw = o.decisionCrossSynthesis;
    if (raw === null || typeof raw !== 'object') { return undefined; }
    const sy = raw as Record<string, unknown>;
    if (typeof sy.propositionId !== 'string' || sy.propositionId.length === 0) { return undefined; }
    if (!enumOk(KINDS, sy.resolutionKind)) { return undefined; }
    if (!enumOk(SY_STANCES, sy.finalStance)) { return undefined; }
    if (!enumOk(OUTCOMES, sy.requestedOutcome)) { return undefined; }
    const parts = (x: unknown): Record<string, unknown>[] | null => {
      if (!Array.isArray(x)) return null;
      return x.every((e) => e !== null && typeof e === 'object') ? (x as Record<string, unknown>[]) : null;
    };
    const participants = parts(sy.participatingJudgments);
    const primaries = parts(sy.primaryJudgments);
    const qualifiers = parts(sy.qualifiers);
    const pairs = parts(sy.conflictPairs);
    if (!participants || !primaries || !qualifiers || !pairs) { return undefined; }
    const parseParticipant = (p: Record<string, unknown>) => {
      if (!enumOk(DISCIPLINES, p.discipline)) return null;
      if (!enumOk(AUTHORITIES, p.authority)) return null;
      if (!enumOk(CONCLUSION_DIRECTIONS, p.direction)) return null;
      if (!enumOk(RELIABILITIES, p.reliability)) return null;
      if (!enumOk(DIRECTNESS, p.directness)) return null;
      if (p.axis !== null && !enumOk(AXES, p.axis)) return null;
      if (p.role !== null && !enumOk(SY_ROLES, p.role)) return null;
      // V7.1 — the restriction KIND behind a RESTRICTED direction. Dropping it on restore would flip a
      // conditional negative back to a positive direction on the follow-up turn, which is the exact defect
      // this repair closes.
      if (p.restriction !== null && p.restriction !== undefined && !enumOk(RESTRICTIONS, p.restriction)) return null;
      if (p.temporalBand !== null && !enumOk(BANDS, p.temporalBand)) return null;
      if (typeof p.statement !== 'string') return null;
      if (!isStringArray(p.evidenceIds) || !isStringArray(p.derivedFromAxes)) return null;
      if (!(p.derivedFromAxes as string[]).every((a) => AXES.has(a))) return null;
      return {
        discipline: p.discipline, authority: p.authority, axis: p.axis, role: p.role,
        direction: p.direction, restriction: p.restriction ?? null,
        statement: p.statement, directness: p.directness,
        reliability: p.reliability, temporalBand: p.temporalBand,
        evidenceIds: [...(p.evidenceIds as string[])],
        derivedFromAxes: [...(p.derivedFromAxes as string[])],
      };
    };
    const parseTruths = (x: unknown) => {
      const arr = parts(x);
      if (!arr) return null;
      const out = arr.map((t) => {
        if (!enumOk(DISCIPLINES, t.discipline) || !enumOk(AXES, t.axis) || !enumOk(SY_ROLES, t.role)) return null;
        if (!enumOk(CONCLUSION_DIRECTIONS, t.direction) || !enumOk(BANDS, t.temporalBand)) return null;
        if (typeof t.statement !== 'string' || !isStringArray(t.evidenceIds)) return null;
        return {
          discipline: t.discipline, axis: t.axis, role: t.role, direction: t.direction,
          temporalBand: t.temporalBand, statement: t.statement, evidenceIds: [...(t.evidenceIds as string[])],
        };
      });
      return out.some((t) => t === null) ? null : out;
    };
    const participantsOut = participants.map(parseParticipant);
    const primariesOut = primaries.map(parseParticipant);
    const qualifiersOut = qualifiers.map(parseParticipant);
    if ([...participantsOut, ...primariesOut, ...qualifiersOut].some((p) => p === null)) { return undefined; }
    const supporting = parseTruths(sy.supportingTruths);
    const limiting = parseTruths(sy.limitingTruths);
    const temporal = parseTruths(sy.temporalQualifications);
    const outcomes = parseTruths(sy.outcomeQualifications);
    if (!supporting || !limiting || !temporal || !outcomes) { return undefined; }
    const pairsOut = pairs.map((c) => {
      if (!enumOk(DISCIPLINES, c.a) || !enumOk(DISCIPLINES, c.b) || !enumOk(AXES, c.axis)) return null;
      if (!Array.isArray(c.directions) || c.directions.length !== 2) return null;
      if (!c.directions.every((d) => enumOk(CONCLUSION_DIRECTIONS, d))) return null;
      if (c.reconciledBy !== null && !enumOk(RECONCILED, c.reconciledBy)) return null;
      return {
        a: c.a, b: c.b, axis: c.axis,
        directions: [c.directions[0], c.directions[1]], reconciledBy: c.reconciledBy,
      };
    });
    if (pairsOut.some((c) => c === null)) { return undefined; }
    if (!Array.isArray(sy.provenance) || sy.provenance.length !== 1
      || sy.provenance[0] !== 'deokbunai.decision-cross-synthesis.v1') { return undefined; }
    if (sy.unresolvedReason !== undefined && typeof sy.unresolvedReason !== 'string') { return undefined; }
    decisionCrossSynthesis = {
      propositionId: sy.propositionId,
      requestedOutcome: sy.requestedOutcome,
      participatingJudgments: participantsOut,
      primaryJudgments: primariesOut,
      qualifiers: qualifiersOut,
      resolutionKind: sy.resolutionKind,
      finalStance: sy.finalStance,
      supportingTruths: supporting,
      limitingTruths: limiting,
      temporalQualifications: temporal,
      outcomeQualifications: outcomes,
      conflictPairs: pairsOut,
      ...(typeof sy.unresolvedReason === 'string' ? { unresolvedReason: sy.unresolvedReason } : {}),
      provenance: ['deokbunai.decision-cross-synthesis.v1'],
    } as unknown as CrossDivinationVerdict['decisionCrossSynthesis'];
  }
  if (o.evaluatedAtEpochSeconds !== null && !isFiniteInteger(o.evaluatedAtEpochSeconds)) { return undefined; }
  // Every proposition must belong to the same person the verdict is about.
  const subjects = new Set(parsed.map((pr) => pr.subject as string));
  if (subjects.size > 1) { return undefined; }
  // V4E §7 — and so must every premise a proposition stands on. A premise about another person supporting
  // this person's conclusion is a relation the kernel never mints (classifyPair refuses cross-subject pairs;
  // a premise graph is built per chart), so restoring one would smuggle in evidence no reasoner produced.
  if (subjects.size === 1 && Array.isArray(o.premises)) {
    const [subject] = subjects;
    for (const p of o.premises as Record<string, unknown>[]) {
      if (p.subject !== subject) { return undefined; }
    }
  }
  // A headline that names a conclusion the graph does not contain is a dangling reference like any other.
  const headlineIds = Array.isArray(o.headlinePropositionIds) ? o.headlinePropositionIds as string[] : [];
  for (const id of headlineIds) {
    if (!propositionIds.has(id)) { return undefined; }
  }

  // G6 PATCH 2 §2 — RULE-AWARE DERIVATION VALIDATION, ONCE EVERY PROPOSITION'S OWN ID IS KNOWN.
  //
  // A derived conclusion's parents are resolved by id via propositionById, so this must run after every
  // proposition in the array has its OWN id registered (a parent may be referenced regardless of array
  // position) and after CONTEXT CONSISTENCY has validated questionDomain/asksTiming, which the Cross
  // validators need. Dispatches to persistedGraphValidation.ts, which checks the ACTUAL required parent
  // relation each rule's apply()/emit() body needs — not merely a parent count.
  const propositionById = new Map(parsed.map((pr) => [pr.id as string, pr]));
  const crossValidationCtx = {
    premiseById: premiseById as unknown as Map<string, DivinationPremise>,
  };
  for (const pr of parsed) {
    if (pr.derivationRule === PRIMITIVE_RULE) continue; // already validated above
    if (MYUNGRI_RULE_IDS.has(pr.derivationRule as string)) {
      if (!validateMyungriDerivation(
        pr as unknown as Parameters<typeof validateMyungriDerivation>[0],
        premiseById as unknown as Map<string, DivinationPremise>,
        propositionById as unknown as Map<string, ReasonedProposition>,
      )) { return undefined; }
    } else if (CROSS_RULES.has(pr.derivationRule as string)) {
      if (!validateCrossDerivation(
        pr as unknown as Parameters<typeof validateCrossDerivation>[0],
        propositionById as unknown as Map<string, ReasonedProposition>,
        crossValidationCtx,
      )) { return undefined; }
    }
  }

  // G6 PATCH 2 §3/§4/§7 — THE GRAPH IS THE SOLE VERDICT AUTHORITY.
  //
  // Recomputes direction/headlinePropositionIds from the VALIDATED graph via the SAME exported pipeline the
  // live reasoner uses (standingPropositions -> selectAnswerCandidates -> resolveAnswer -> stanceOf/
  // agreedStance) and rejects on any disagreement — the persisted copies are compared for corruption
  // detection, never independently trusted. This subsumes the empty-graph case (zero propositions projects
  // to INSUFFICIENT_EVIDENCE with no headlines, so a persisted FOR/AGAINST over an empty graph disagrees and
  // is rejected the same way any other mismatch is) and legacy pre-V4C rows that never persisted
  // headlinePropositionIds at all: the RECONSTRUCTION below uses this projection for that field precisely
  // because it is always deterministically recomputable from a graph that has already passed every check
  // above it, never "trusted because it's old."
  // A persisted verdict may always be MORE CONSERVATIVE than the graph's own maximal resolution — never more
  // assertive. refinementFailure() (graphExtension.ts) is the real, legitimate case: it deliberately declines
  // with `direction: INSUFFICIENT_EVIDENCE, headlinePropositionIds: []` over the PRESERVED original graph
  // when an extension attempt failed, even though that graph could still technically resolve to something —
  // the decline is about the failed extension, not about what the graph supports. An honest "we are choosing
  // not to claim an answer this turn" is never a security concern; only a claim the graph does NOT support is.
  const NON_ASSERTIVE_STANCES = new Set(['INSUFFICIENT_DATA', 'INSUFFICIENT_EVIDENCE', 'NOT_APPLICABLE']);
  const isHonestDecline = headlineIds.length === 0 && NON_ASSERTIVE_STANCES.has(o.direction as string);
  if (!isHonestDecline) {
    const projectedVerdict = projectVerdictFromGraph(
      parsed as unknown as ReasonedProposition[],
      o.questionDomain as ReasonedProposition['questionAxis'],
      o.questionIntent as ReasonedProposition['questionIntent'],
      decidingAxes,
    );
    if (projectedVerdict.direction !== o.direction) { return undefined; }
    if (Array.isArray(o.headlinePropositionIds)) {
      const persistedHeadlineSet = new Set(headlineIds);
      const projectedHeadlineSet = new Set(projectedVerdict.headlinePropositionIds);
      if (persistedHeadlineSet.size !== projectedHeadlineSet.size
        || [...persistedHeadlineSet].some((id) => !projectedHeadlineSet.has(id))) { return undefined; }
    }
  }
  // G6 FINAL PATCH 3 — `primaryConclusion` is the text rendered as the BINDING "결론" instruction
  // (verdictDirective.ts), and its validity is COUPLED to which of the two states above this row is actually
  // in — never checked against a flat union of both. The AUTHORITATIVE branch (`!isHonestDecline`, direction/
  // headlines already verified against the graph projection) accepts ONLY the one conclusion that SAME
  // resolution states — never a decline template, however conservative-sounding. The DECLINE branch accepts
  // ONLY one of the three legitimate decline shapes — never the graph's own assertive answer, even when the
  // graph would actually support one (a decline may be more conservative than the graph, never less).
  if (!isHonestDecline) {
    const expectedConclusion = authoritativeConclusionForState(
      parsed as unknown as ReasonedProposition[],
      o.questionDomain as ReasonedProposition['questionAxis'],
      o.questionIntent as ReasonedProposition['questionIntent'],
      decidingAxes,
    );
    if (expectedConclusion === null || o.primaryConclusion !== expectedConclusion) { return undefined; }
  } else {
    const applicableDisciplines = (o.disciplineJudgments as Record<string, unknown>[])
      .filter((j) => j.applicable === true).map((j) => j.discipline as Discipline);
    const declineConclusions = controlledDeclineConclusions(
      parsed as unknown as ReasonedProposition[],
      o.questionDomain as ReasonedProposition['questionAxis'],
      o.questionIntent as ReasonedProposition['questionIntent'],
      applicableDisciplines,
      decidingAxes,
    );
    if (!declineConclusions.includes(o.primaryConclusion as string)) { return undefined; }
  }
  // G6 PATCH 2 §4 — legacy rows that never persisted headlinePropositionIds at all are reconstructed from
  // the graph projection (an honest decline already has an explicit `[]` to restore, never reaching here).
  const projectedHeadlinesForReconstruction = Array.isArray(o.headlinePropositionIds) ? headlineIds
    : projectVerdictFromGraph(
      parsed as unknown as ReasonedProposition[],
      o.questionDomain as ReasonedProposition['questionAxis'],
      o.questionIntent as ReasonedProposition['questionIntent'],
      decidingAxes,
    ).headlinePropositionIds;

  // ── V4C §25 — RECONSTRUCTION, NOT PASS-THROUGH ─────────────────────────────────────────────────
  //
  // V4B validated the payload field by field and then returned the ORIGINAL object. Everything the checks
  // did not name — an extra key, a prototype-polluting property, a nested field of a shape only checked
  // shallowly — survived into the restored verdict and into the follow-up prompt built from it. A whitelist
  // that returns the untrusted object is not a whitelist; it is a validated pass-through.
  //
  // A NEW object is assembled below from validated values only. Anything not named here does not exist
  // downstream, so adding a field to the verdict means adding it here deliberately.
  const str = (x: unknown, fallback = ''): string => (typeof x === 'string' ? x : fallback);
  const strArr = (x: unknown): string[] => (isStringArray(x) ? [...x] : []);
  const arr = (x: unknown): Record<string, unknown>[] =>
    (Array.isArray(x) ? x.filter((e): e is Record<string, unknown> => e !== null && typeof e === 'object') : []);
  const evidence = (x: unknown) => arr(x).map((e) => ({
    fact: str(e.fact), meaning: str(e.meaning), domain: e.domain, temporalScope: e.temporalScope,
    directness: e.directness,
    // Deliberately restored: without it a follow-up would re-count a coverage gap as evidence.
    ...(e.coverageGap === true ? { coverageGap: true } : {}),
  }));
  const optional = (k: string, x: unknown) => (typeof x === 'string' ? { [k]: x } : {});

  const restored = {
    question: str(o.question),
    questionDomain: o.questionDomain,
    questionIntent: o.questionIntent,
    ...(decidingAxes ? { decidingAxes: [...decidingAxes] } : {}),
    ...(decisionCrossSynthesis ? { decisionCrossSynthesis } : {}),
    evaluatedAtEpochSeconds: typeof o.evaluatedAtEpochSeconds === 'number' ? o.evaluatedAtEpochSeconds : null,
    asksTiming: o.asksTiming,
    premises: premisesOut,
    primaryConclusion: str(o.primaryConclusion),
    // G6 PATCH 2 §4 — legacy rows that never persisted this field are reconstructed from the graph
    // projection rather than restored as an empty/trusted-absent list.
    headlinePropositionIds: Array.isArray(o.headlinePropositionIds)
      ? strArr(o.headlinePropositionIds) : projectedHeadlinesForReconstruction,
    direction: o.direction,
    dominantBasis: str(o.dominantBasis),
    disciplineJudgments: arr(o.disciplineJudgments).map((j) => ({
      discipline: j.discipline,
      applicable: j.applicable === true,
      ...optional('applicabilityReason', j.applicabilityReason),
      dataReliability: j.dataReliability,
      questionDomain: j.questionDomain,
      temporalScope: j.temporalScope,
      stance: j.stance,
      dominantConclusion: str(j.dominantConclusion),
      dominantFactor: str(j.dominantFactor),
      directEvidence: evidence(j.directEvidence),
      counterEvidence: evidence(j.counterEvidence),
      internalContradictions: strArr(j.internalContradictions),
      timingSignals: evidence(j.timingSignals),
      domainSubJudgments: arr(j.domainSubJudgments).map((sj) => ({
        domain: sj.domain, stance: sj.stance, conclusion: str(sj.conclusion),
        temporalScope: sj.temporalScope, directness: sj.directness, reliability: sj.reliability,
        evidence: evidence(sj.evidence), counterEvidence: evidence(sj.counterEvidence),
        // Deliberately restored: without it a projected proposition-level reading comes back looking like a
        // structural finding the discipline's own panel made.
        ...(sj.source === 'DECISION_JUDGMENT_V1' ? { source: 'DECISION_JUDGMENT_V1' as const } : {}),
      })),
      confidence: j.confidence,
      questionDirectness: j.questionDirectness,
      evidenceStrength: j.evidenceStrength,
      factGroupsUsed: strArr(j.factGroupsUsed),
    })),
    contributions: arr(o.contributions).map((c) => ({
      discipline: c.discipline, applied: c.applied === true, stance: c.stance,
      contribution: str(c.contribution),
      ...optional('whyItDidNotDominate', c.whyItDidNotDominate),
    })),
    axisVerdicts: arr(o.axisVerdicts).map((a) => ({
      domain: a.domain, stance: a.stance, conclusion: str(a.conclusion),
      dominantDiscipline: a.dominantDiscipline, contested: a.contested === true,
    })),
    // The proposition nodes are rebuilt from the fields the graph integrity pass actually validated.
    propositions: parsed.map((pr) => ({
      id: pr.id, discipline: pr.discipline, subject: pr.subject,
      target: {
        key: (pr.target as Record<string, unknown>).key,
        label: (pr.target as Record<string, unknown>).label,
        kind: (pr.target as Record<string, unknown>).kind,
      },
      questionIntent: pr.questionIntent, questionAxis: pr.questionAxis, temporalScope: pr.temporalScope,
      assertion: pr.assertion, conclusionType: pr.conclusionType, direction: pr.direction,
      ...(typeof pr.restriction === 'string' ? { restriction: pr.restriction } : {}),
      ...(pr.answersAsked === true ? { answersAsked: true } : {}),
      ...(pr.qualified === true ? { qualified: true } : {}),
      supportingPremiseIds: strArr(pr.supportingPremiseIds),
      opposingPremiseIds: strArr(pr.opposingPremiseIds),
      derivedFromPropositionIds: strArr(pr.derivedFromPropositionIds),
      ...(Array.isArray(pr.supportGroups)
        ? {
          supportGroups: (pr.supportGroups as Record<string, unknown>[])
            .map((g) => ({ role: g.role, label: str(g.label), ids: strArr(g.ids) })),
        }
        : {}),
      unresolvedPremiseIds: strArr(pr.unresolvedPremiseIds),
      doctrineReferences: strArr(pr.doctrineReferences),
      derivationRule: pr.derivationRule,
      adequacy: {
        supportAdequacy: (pr.adequacy as Record<string, unknown>).supportAdequacy,
        counterAdequacy: (pr.adequacy as Record<string, unknown>).counterAdequacy,
        dataCompleteness: (pr.adequacy as Record<string, unknown>).dataCompleteness,
        doctrineApplicability: (pr.adequacy as Record<string, unknown>).doctrineApplicability,
      },
    })),
    agreementPoints: strArr(o.agreementPoints),
    contradictionPoints: strArr(o.contradictionPoints),
    contradictionResolutions: arr(o.contradictionResolutions).map((r) => ({
      kind: r.kind, between: strArr(r.between), conflict: str(r.conflict), resolution: str(r.resolution),
      dominant: r.dominant, whyOtherDidNotDominate: str(r.whyOtherDidNotDominate),
    })),
    natalBaseline: typeof o.natalBaseline === 'string' ? o.natalBaseline : null,
    currentFlow: typeof o.currentFlow === 'string' ? o.currentFlow : null,
    timingConclusion: typeof o.timingConclusion === 'string' ? o.timingConclusion : null,
    favorableFactors: evidence(o.favorableFactors),
    riskFactors: evidence(o.riskFactors),
    actionableInterpretation: str(o.actionableInterpretation),
    confidence: o.confidence,
    confidenceReason: str(o.confidenceReason),
    evidenceReferences: arr(o.evidenceReferences).map((e) => ({
      discipline: e.discipline, lines: strArr(e.lines),
    })),
    verdictVersion: str(o.verdictVersion),
  };
  return restored as unknown as CrossDivinationVerdict;
}

export function parseDecisionMeta(v: unknown): ConsultationDecisionMeta | undefined {
  if (v === null || typeof v !== 'object') { return undefined; }
  const o = v as Record<string, unknown>;
  if (typeof o.answerPlanVersion !== 'string' || typeof o.decisionPolicyVersion !== 'string' || typeof o.promptVersion !== 'string') { return undefined; }
  if (o.resolvedGranularity !== 'NONE' && o.resolvedGranularity !== 'YEAR' && o.resolvedGranularity !== 'MONTH') { return undefined; }
  const resolvedTargets = strictNumArray(o.resolvedTargets);
  if (!resolvedTargets) { return undefined; }
  const rtc = o.resolvedTemporalContext as Record<string, unknown> | null;
  if (rtc === null || typeof rtc !== 'object' || !isFiniteInteger(rtc.anchorEpochSeconds)) { return undefined; }
  const rtcTargets = strictNumArray(rtc.resolvedTargets);
  if (!rtcTargets || rtc.timezone !== 'Asia/Seoul' || typeof rtc.qimenActive !== 'boolean') { return undefined; }
  if (rtc.referenceYear !== null && !isFiniteInteger(rtc.referenceYear)) { return undefined; }
  if (rtc.referenceMonth !== null && (!isFiniteInteger(rtc.referenceMonth) || rtc.referenceMonth < 1 || rtc.referenceMonth > 12)) { return undefined; }
  const p = typeof o.polarity === 'string' && POLARITY_TIERS.includes(o.polarity) ? (o.polarity as ConsultationDecisionMeta['polarity']) : undefined;
  if (o.polarity !== undefined && !p) { return undefined; }
  // Sprint E.1 §16-17 — comparison context is parsed fail-closed: a malformed/absent value → NOT a comparison
  // (never a silent "true" that would let a follow-up invent a winner over ungrounded candidates).
  const cc = o.comparisonContext as Record<string, unknown> | null | undefined;
  let comparisonContext: ConsultationDecisionMeta['comparisonContext'];
  if (o.comparisonContext !== undefined) {
    const candidates = cc && typeof cc === 'object' ? strictNumArray(cc.candidates) : undefined;
    if (!cc || typeof cc !== 'object' || typeof cc.isComparison !== 'boolean' || !candidates) { return undefined; }
    if (cc.isComparison && candidates.length < 2) { return undefined; }
    comparisonContext = { isComparison: cc.isComparison, candidates };
  }
  // A claimed optional authority object is all-or-nothing. Malformed claims reject the whole row instead of
  // being silently dropped and letting an action proceed with a weaker authority substrate.
  const evidenceSnapshot = o.evidenceSnapshot === undefined ? undefined : parseEvidenceSnapshot(o.evidenceSnapshot);
  if (o.evidenceSnapshot !== undefined && !evidenceSnapshot) { return undefined; }
  // V3 §34 — the cross-discipline verdict was WRITTEN by the builder but never read back here, so on the REAL
  // production path (write → JSONB → parse) it was silently discarded and a follow-up explained a degraded,
  // Myungri-only judgment. Restored fail-closed: a malformed claim rejects the row rather than downgrading
  // the session's judgment behind the user's back.
  const divinationVerdict =
    o.divinationVerdict === undefined || o.divinationVerdict === null
      ? undefined
      : parseDivinationVerdict(o.divinationVerdict);
  if (o.divinationVerdict !== undefined && o.divinationVerdict !== null && !divinationVerdict) { return undefined; }

  // V4D §23 — GRAPH PROVENANCE, PARSED ALL-OR-NOTHING. A row that CLAIMS a revision and gets it wrong is
  // rejected outright: a half-restored provenance record would assert continuity the graph may not have.
  let graphRevision: ConsultationDecisionMeta['graphRevision'];
  if (o.graphRevision !== undefined && o.graphRevision !== null) {
    if (typeof o.graphRevision !== 'object') { return undefined; }
    const gr = o.graphRevision as Record<string, unknown>;
    if (gr.schemaVersion !== 'graph-revision@1.0.0') { return undefined; }
    if (gr.kind !== 'EXTENDED' && gr.kind !== 'REEVALUATED') { return undefined; }
    if (!isFiniteInteger(gr.previousEvaluatedAtEpochSeconds)) { return undefined; }
    if (!isFiniteInteger(gr.evaluationInstantEpochSeconds)) { return undefined; }
    if (typeof gr.axis !== 'string') { return undefined; }
    // An EXTENDED graph did NOT move in time — that is what distinguishes it from a re-evaluation — and when
    // the verdict is present it must be the very graph that was extended.
    if (gr.kind === 'EXTENDED') {
      if (gr.previousEvaluatedAtEpochSeconds !== gr.evaluationInstantEpochSeconds) { return undefined; }
      if (divinationVerdict && divinationVerdict.evaluatedAtEpochSeconds !== gr.evaluationInstantEpochSeconds) {
        { return undefined; }
      }
    }
    graphRevision = {
      schemaVersion: 'graph-revision@1.0.0',
      kind: gr.kind,
      previousEvaluatedAtEpochSeconds: gr.previousEvaluatedAtEpochSeconds,
      evaluationInstantEpochSeconds: gr.evaluationInstantEpochSeconds,
      axis: gr.axis as ConsultationDecisionMeta['graphRevision'] extends undefined ? never
        : NonNullable<ConsultationDecisionMeta['graphRevision']>['axis'],
    };
  }
  if (evidenceSnapshot && (
    p !== evidenceSnapshot.polarity ||
    o.engineVersion !== evidenceSnapshot.engineVersion ||
    o.resolvedGranularity !== evidenceSnapshot.target.granularity ||
    !resolvedTargets.includes(evidenceSnapshot.target.key)
  )) { return undefined; }
  if (comparisonContext?.isComparison &&
      !comparisonContext.candidates.every((candidate) => resolvedTargets.includes(candidate))) { return undefined; }
  if (o.domain !== undefined && (typeof o.domain !== 'string' || !DOMAINS.includes(o.domain))) { return undefined; }
  return {
    answerPlanVersion: o.answerPlanVersion,
    decisionPolicyVersion: o.decisionPolicyVersion,
    promptVersion: o.promptVersion,
    ...(typeof o.engineVersion === 'string' ? { engineVersion: o.engineVersion } : {}),
    ...(typeof o.modelId === 'string' ? { modelId: o.modelId } : {}),
    resolvedGranularity: o.resolvedGranularity,
    resolvedTargets,
    ...(p ? { polarity: p } : {}),
    ...(typeof o.domain === 'string' ? { domain: o.domain as ConsultationDecisionMeta['domain'] } : {}),
    ...(comparisonContext ? { comparisonContext } : {}),
    ...(evidenceSnapshot ? { evidenceSnapshot } : {}),
    ...(divinationVerdict ? { divinationVerdict } : {}),
    ...(graphRevision ? { graphRevision } : {}),
    // G6 PATCH 2 §7 — restored as a strict boolean-or-absent so the loader's post-parse taint check
    // (`parsed.priorHistoryUnavailable === true`) can never be defeated by a non-boolean forgery.
    ...(o.priorHistoryUnavailable === true ? { priorHistoryUnavailable: true as const } : {}),
    resolvedTemporalContext: {
      anchorEpochSeconds: rtc.anchorEpochSeconds,
      timezone: 'Asia/Seoul',
      referenceYear: typeof rtc.referenceYear === 'number' ? rtc.referenceYear : null,
      referenceMonth: typeof rtc.referenceMonth === 'number' ? rtc.referenceMonth : null,
      resolvedTargets: rtcTargets,
      qimenActive: rtc.qimenActive,
    },
  };
}

// True when a persisted decision was produced under a DIFFERENT decision version than the current server
// (§D4). Compares only the decision-affecting versions (engine ruleset + answer plan + decision policy) —
// a prompt/model change alone is verbalization-only and does not count as a decision mismatch.
export function isDecisionVersionMismatch(
  persisted: ConsultationDecisionMeta | undefined,
  current?: { engineVersion?: string | null },
): boolean {
  if (!persisted) return false; // legacy row with no meta → caller decides how to treat (never silently equal)
  if (persisted.answerPlanVersion !== ANSWER_PLAN_VERSION) return true;
  if (persisted.decisionPolicyVersion !== DECISION_POLICY_VERSION) return true;
  // engineVersion is decision-affecting too (Sprint E.1 §7) — compared when a current value is available.
  if (current?.engineVersion && persisted.engineVersion && persisted.engineVersion !== current.engineVersion) return true;
  return false;
}

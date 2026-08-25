// DIVINATION_ENGINE_V1 — the judgment layer between verified engine facts and user-facing prose.
//
//   frozen engines (facts)  →  per-discipline JUDGE  →  CROSS JUDGE  →  verdict directive  →  LLM prose
//                                                                    ↘  quality guard re-checks the prose
//
// Nothing in this module calculates astrology: it reads what 명리/자미두수/기문둔갑 already computed and
// decides what that MEANS for the asked question. No deferred theory is activated here (no 신강/신약, 용신,
// 격국, 12운성, 12신살, no element weighting).
export {
  DIVINATION_VERDICT_VERSION,
  AGAINST_STANCES,
  FOR_STANCES,
  evidenceAdequacy,
  isDirectional,
  stanceValence,
  type ContradictionResolution,
  type ContradictionResolutionKind,
  type CrossDivinationVerdict,
  type DataReliability,
  type Discipline,
  type DisciplineContribution,
  type DivinationJudgment,
  type DomainSubJudgment,
  type EvidenceStrength,
  NO_SIGNAL,
  type JudgmentConfidence,
  type JudgmentDomain,
  type JudgmentEvidence,
  type QuestionDirectness,
  type Stance,
  type QuestionIntent,
  NON_DECISION_INTENTS,
  type TemporalScope,
} from './contracts';

export { tenGodFamily, tenGodJudgmentDomain, type MyungriJudgeInput, type TemporalLayerFacts } from './myungriJudge';
export { readNatalBaseline, domainFamily, type NatalBaseline, type NatalStructureInput, type PositionedTenGod } from './myungriNatal';
export { analyzeLayer, axisPressure, type LayerAnalysis, type PositionedHit } from './myungriLayer';
export { judgeZiwei, palaceForDomain, sihuaKind, type ZiweiJudgeInput } from './ziweiJudge';
export { judgeQimen, doorClass, type QimenJudgeInput } from './qimenJudge';
export { judgeCross, judgeCrossReasoned, type CrossJudgeInput } from './crossJudge';
export { judgePairMyungri, judgePairZiwei, type PairMyungriJudgeInput } from './compatibilityJudge';
export { renderVerdictDirective, verdictEvidenceLines, verdictIsDirectional } from './verdictDirective';
export {
  isPaidReadingAcceptable,
  validatePaidReading,
  type QualityFailureCode,
  type QualityFinding,
} from './qualityGuard';
export {
  judgeDayMasterStrength, judgeYongshin, luckElementEffect,
  DIVINATION_STRENGTH_METHOD, DIVINATION_YONGSHIN_METHOD, STRENGTH_LABEL,
  type DayMasterStrengthJudgment, type YongshinJudgment, type StrengthClassification, type StrengthInput,
} from './myungriStrength';

// ── V4A — PROPOSITION GRAPH REASONING KERNEL ────────────────────────────────────────────────────
export {
  screenSynthesis,
  computeAdequacy,
  screenAll,
  runDerivations,
  standingPropositions,
  supersedes,
  resetIds,
  PRIMITIVE_RULE,
  type AdequacyLevel,
  type ConclusionDirection,
  type ConclusionType,
  type DerivationContext,
  type DerivationRule,
  type DivinationPremise,
  type PremiseApplicability,
  type PremiseRole,
  type PropositionAdequacy,
  type ReasonedProposition,
  type RestrictionKind,
  type SemanticRelation,
  type SynthesisCandidacy,
  type SynthesisClass,
  type SemanticTarget,
  type TargetKind,
  sameTarget,
  target,
} from './reasoning/kernel';
export { buildMyungriPremises, type MyungriPremiseInput } from './reasoning/myungriPremises';
export { MYUNGRI_RULES, primitivePropositions } from './reasoning/myungriRules';
export { reasonMyungri, myungriSynthesisCensus, type MyungriReasoning } from './reasoning/myungriReasoner';
 export { reasonCross, crossSynthesisCensus, type CrossReasoning, type CrossReasonInput } from './reasoning/crossReasoner';
 export { adaptJudgment } from './reasoning/disciplineAdapter';
export {
  explainProposition, explainHeadline, refineOnAxis, renderChain,
  type DerivationChain, type AxisRefinement,
} from './reasoning/graphQuery';
 export {
  classifyPair, deriveCross, subordinate, SUBORDINATION_TEXT,
  type CrossRelation, type CrossDerivation, type SubordinationReason, type Subordination,
} from './reasoning/crossRules';

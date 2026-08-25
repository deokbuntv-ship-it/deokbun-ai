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
  type TemporalScope,
} from './contracts';

export { judgeMyungri, tenGodFamily, tenGodJudgmentDomain, type MyungriJudgeInput, type TemporalLayerFacts } from './myungriJudge';
export { readNatalBaseline, natalSupportForDomain, domainFamily, type NatalBaseline, type NatalStructureInput, type PositionedTenGod } from './myungriNatal';
export { analyzeLayer, axisPressure, type LayerAnalysis, type PositionedHit } from './myungriLayer';
export { judgeZiwei, palaceForDomain, sihuaKind, type ZiweiJudgeInput } from './ziweiJudge';
export { judgeQimen, doorClass, type QimenJudgeInput } from './qimenJudge';
export { judgeCross, type CrossJudgeInput } from './crossJudge';
export { judgePairMyungri, judgePairZiwei, type PairMyungriJudgeInput } from './compatibilityJudge';
export { renderVerdictDirective, verdictEvidenceLines, verdictIsDirectional } from './verdictDirective';
export {
  isPaidReadingAcceptable,
  validatePaidReading,
  type QualityFailureCode,
  type QualityFinding,
} from './qualityGuard';

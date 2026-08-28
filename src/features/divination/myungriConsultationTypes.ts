// MYUNGRI CORE CONSULTATION JUDGES V1 — shared result contract.
//
// One typed shape for all 7 domain judges (`myungriConsultationJudge.ts`), so BUSINESS/MONEY/CAREER/
// LOVE/REUNION/CHANGE/TIMING are one architecture with domain-specific rules, not seven duplicated
// engines (§21 of the implementation brief). Structured deterministic judgment only — never final user
// prose (§4); the downstream LLM explains this, it does not decide it (§19-equivalent for this layer).
import type { JudgmentEvidence } from './contracts';

export const MYUNGRI_CONSULTATION_JUDGE_V1_METHOD = 'deokbunai.myungri-consultation-judge.v1' as const;

export type ConsultationJudgeDomain = 'BUSINESS' | 'MONEY' | 'CAREER' | 'LOVE' | 'REUNION' | 'CHANGE' | 'TIMING';

/**
 * FAVORABLE/CAUTION/MIXED/UNRESOLVED — never an ordinal scale (matches `PolarityTier`'s own categorical
 * discipline). MIXED is first-class, not an average of FAVORABLE and CAUTION: it means a grounded
 * opportunity AND a grounded risk both genuinely exist, and neither cancels the other.
 */
export type DomainJudgeStatus = 'FAVORABLE' | 'CAUTION' | 'MIXED' | 'UNRESOLVED';

/** One real multi-premise inference: named premises → a conclusion that is not a restatement of either. */
export type SyntheticInference = {
  premises: string[];
  conclusion: string;
};

export type DomainJudgeResult = {
  domain: ConsultationJudgeDomain;
  status: DomainJudgeStatus;
  /** Short, structured, plain-Korean conclusion — not final consumer prose. */
  conclusion: string;
  supportingEvidence: JudgmentEvidence[];
  counterEvidence: JudgmentEvidence[];
  syntheticInferences: SyntheticInference[];
  /** Which structural facts (Structural V2 state, rooting, natal family presence, relation kind) drove this. */
  structuralDrivers: string[];
  /** How Yongshin V1's result bore on this domain, or [] when Yongshin was not relevant/resolved. */
  yongshinRelevance: string[];
  /** Which temporal layers (대운/세운/월운) actually contributed, or [] when none did. */
  temporalDrivers: string[];
  risks: string[];
  opportunities: string[];
  uncertaintyReasons: string[];
  reasoningRuleIds: string[];
  provenance: readonly [typeof MYUNGRI_CONSULTATION_JUDGE_V1_METHOD];
};

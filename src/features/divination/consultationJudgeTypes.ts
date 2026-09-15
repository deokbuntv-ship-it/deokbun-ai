// CONSULTATION DOMAIN JUDGES — shared result contract, used by BOTH `myungriConsultationJudge.ts`
// (Myungri V1) and `ziweiConsultationJudge.ts` (Ziwei V1) — one typed shape for all 7 domain judges
// per discipline (BUSINESS/MONEY/CAREER/LOVE/REUNION/CHANGE/TIMING), so each discipline reasons with
// its OWN facts through the SAME architecture rather than being duplicated engines (§21 of the Myungri
// brief this contract was originally built for). Structured deterministic judgment only — never final
// user prose; the downstream LLM explains this, it does not decide it.
//
// Each discipline mints its OWN `provenance` method-version string (e.g.
// `deokbunai.myungri-consultation-judge.v1` / `deokbunai.ziwei-consultation-judge.v1`) — this file only
// types the shape, never a specific discipline's constant, so a Ziwei result is never mistaken for a
// Myungri one and vice versa.
import type { JudgmentEvidence } from './contracts';

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
  /** Which structural facts drove this (Myungri: Structural V2 state/rooting/family presence/relation
   *  kind; Ziwei: palace role/삼방사정/무주성). */
  structuralDrivers: string[];
  /** How the discipline's own "treatment/transformation" layer bore on this domain (Myungri: Yongshin
   *  V1; Ziwei: 四化 role), or [] when not relevant/resolved. */
  yongshinRelevance: string[];
  /** Which temporal layers actually contributed (Myungri: 대운/세운/월운; Ziwei: 大限), or [] when none did. */
  temporalDrivers: string[];
  risks: string[];
  opportunities: string[];
  uncertaintyReasons: string[];
  reasoningRuleIds: string[];
  /** One discipline-specific method-version string, e.g. `deokbunai.myungri-consultation-judge.v1`. */
  provenance: readonly [string];
};

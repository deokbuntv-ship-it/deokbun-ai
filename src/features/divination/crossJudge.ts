// CROSS DIVINATION JUDGE — V4A entry point.
//
// This file used to BE the reasoning: it built `Claim` objects out of discipline sub-judgments, ran an ordered
// dominance ladder over them, picked a winner, and only afterwards wrapped the winner in a "proposition". The
// independent re-audit's verdict on that shape was correct — a conclusion chosen first and labelled second is
// not an inference, and the synthesis census it produced (108 claimed, 0 real) measured nothing.
//
// The reasoning now lives in `reasoning/`, where premises exist before propositions and propositions exist
// before the verdict. What remains here is the public entry point, kept so callers, prompts, guards and the
// persisted decision metadata do not have to change shape in the same sprint.
import type { CrossDivinationVerdict, DivinationJudgment, JudgmentDomain, QuestionIntent } from './contracts';
import { reasonCross, type CrossReasoning } from './reasoning/crossReasoner';
import type { DivinationPremise, ReasonedProposition, SemanticTarget } from './reasoning/kernel';

export type CrossJudgeInput = {
  question: string;
  questionDomain: JudgmentDomain;
  /** Canonical chart-owner subject. Required by production callers; legacy/synthetic callers may omit it. */
  subject?: string;
  judgments: DivinationJudgment[];
  asksTiming: boolean;
  /** Server evaluation instant, preserved into the verdict so follow-ups share the temporal frame. */
  evaluatedAtEpochSeconds?: number | null;
  /** What SHAPE of answer the question wants. Absent → OUTCOME (legacy behaviour). */
  questionIntent?: QuestionIntent;
  /**
   * The premise graph from a discipline that has been migrated to the reasoning kernel (Myungri today).
   * When absent, that discipline is adapted from its finished judgment like Ziwei/Qimen — honestly, as
   * PRIMITIVE propositions that the synthesis census will never count as inference.
   */
  myungriPremises?: DivinationPremise[];
  myungriPropositions?: ReasonedProposition[];
  /** That discipline's full graph including superseded ancestry — persisted so derivation links resolve. */
  myungriPropositionGraph?: ReasonedProposition[];
  /** V4D §10 — the matter the question named, or null/absent for UNKNOWN. */
  askedTarget?: SemanticTarget | null;
  natalBaseline?: string | null;
  currentFlow?: string | null;
};

/** Full reasoning result — propositions, derivations and the verdict. Used by tests and the QA pack. */
export function judgeCrossReasoned(input: CrossJudgeInput): CrossReasoning {
  return reasonCross({
    question: input.question,
    questionDomain: input.questionDomain,
    subject: input.subject,
    questionIntent: input.questionIntent,
    askedTarget: input.askedTarget,
    judgments: input.judgments,
    asksTiming: input.asksTiming,
    evaluatedAtEpochSeconds: input.evaluatedAtEpochSeconds,
    premises: input.myungriPremises,
    propositions: input.myungriPropositions,
    propositionGraph: input.myungriPropositionGraph,
    natalBaseline: input.natalBaseline,
    currentFlow: input.currentFlow,
  });
}

export function judgeCross(input: CrossJudgeInput): CrossDivinationVerdict {
  return judgeCrossReasoned(input).verdict;
}

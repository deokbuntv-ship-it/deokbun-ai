// MYUNGRI STRUCTURAL V2 — deterministic runtime implementation of the frozen 11-node judgment graph
// (data/myungri-strength-v2/judgment-graph-v2.json, v3.1.0, FROZEN_FOR_AUDIT after two independent
// Codex closure rounds). This module is a straight, literal translation of that graph's node logic
// into TypeScript — it does not redesign, extend, or narrow the frozen specification. If this file
// and the JSON ever disagree, the JSON is authoritative (see that file's own DESCRIPTION field).
//
// SCOPE, deliberately narrow (do not extend without re-freezing the graph first):
//   - structural state (root × season synthesis) and its derived strength view
//   - special-structure SCREEN (NONE_DETECTED / CANDIDATE / INSUFFICIENT) — never a following/
//     transformation VERDICT, never HIGH_CONFIDENCE, never DISPUTED
//   - numerousness as descriptive evidence ONLY — no decision anywhere in this file reads it
// NOT in scope this batch (see judgment-graph-v2.json's own DESCRIPTION and
// docs/myungri-strength-v2/S2_S3_FREEZE_GATE_REPORT.md): EXTREME_* bands, BALANCED, the seven-band
// consumer label, task capacity (WEALTH_LOAD/CONTROL_LOAD/OUTPUT_LOAD), transformation judgment
// (TRANSFORMATION_JUDGMENT_V2 = DEFERRED), GEJU, climate, Yongshin.
//
// This is the SOLE canonical Myungri structural-strength verdict authority going forward. The
// previously-rejected seven-band `services/natalStrength.ts` stays quarantined (P0-07) and the
// existing evidence-only `myungriStrength.ts` (`judgeDayMasterStrength`) is untouched — it still
// returns `UNDETERMINED` by its own design, and is not wired to this module this batch (wiring it
// into the live consultation reasoning pipeline — `reasoning/myungriReasoner.ts` and its premise/
// derivation kernel — would mean editing frozen kernel files, which this batch does not do; see this
// module's own handoff note at the bottom of the file).
import type { FiveElement, HeavenlyStem, SajuPillarPosition } from '@/features/interpretation';
import type { MyungriStrengthFactBundle } from '@/features/myungri/services/strengthFactBundle';
import { tenGodSide } from '@/features/myungri/services/dayMasterStrengthInputs';

import type { JudgmentEvidence } from './contracts';

export const MYUNGRI_STRUCTURAL_V2_METHOD = 'deokbunai.myungri-structural-v2.judgment-graph.v3.1.0' as const;
/** Matches judgment-graph-v2.json's own GRAPH_VERSION field — bump only together with that file. */
export const MYUNGRI_STRUCTURAL_V2_GRAPH_VERSION = 'v3.1.0' as const;

// ── AX01/AX02 fact enums (FACT-03/FACT-04 in the frozen graph) ─────────────────────────────────────
export type RootExistsFact = 'ROOT_EXISTS_TRUE' | 'ROOT_EXISTS_FALSE' | 'ROOT_EXISTS_UNKNOWN';
export type SeasonRoleFact = 'IN_COMMAND' | 'SUPPORTED' | 'NEUTRAL' | 'DRAINED' | 'OPPOSED';

// ── SYNTH-01 / SV-01 outputs ────────────────────────────────────────────────────────────────────
export type StructuralState = 'ANCHORED' | 'UNANCHORED' | 'MIXED_STRUCTURE' | 'UNRESOLVED';
export type StrengthClassification = 'WEAK_LEANING' | 'STRONG_LEANING' | 'MIXED_EVIDENCE' | 'UNRESOLVED';

// ── SPECIAL-01 output ───────────────────────────────────────────────────────────────────────────
export type SpecialStructureStatusValue = 'NONE_DETECTED' | 'CANDIDATE' | 'INSUFFICIENT';

export type ConfidenceClass = 'HIGH' | 'MODERATE' | 'LOW';

export type StrengthView = {
  classification: StrengthClassification;
  evidence: JudgmentEvidence[];
  /** Guards against the exact invalid-converse error the V1 closure was built to stop — carried as
   *  plain strings, never a separate contract, per the graph's own DOES_NOT_IMPLY fields. */
  doesNotImply: string[];
  reasoningNodeIds: string[];
};

export type SpecialStructureStatus = {
  status: SpecialStructureStatusValue;
  evidence: JudgmentEvidence[];
  doesNotImply: string[];
  reasoningNodeIds: string[];
};

export type NumerousnessEvidence = {
  supportCount: number;
  drainCount: number;
  incompleteCount: boolean;
};

/** One node's contribution, for §21 traceability — every inference is attributable to a frozen node id. */
export type ReasoningTraceEntry = {
  nodeId: string;
  nodeType: 'FACT_CHECK' | 'INFERENCE' | 'SPECIAL_SCREEN' | 'STRUCTURAL_SYNTHESIS' | 'STRENGTH_VIEW' | 'UNCERTAINTY_EXIT';
  premises: string[];
  conclusion: string;
};

export type MyungriStructuralV2Result =
  | {
      capability: 'AVAILABLE';
      ruleVersion: typeof MYUNGRI_STRUCTURAL_V2_METHOD;
      graphVersion: typeof MYUNGRI_STRUCTURAL_V2_GRAPH_VERSION;
      dayMaster: HeavenlyStem;
      dayMasterElement: FiveElement;
      hourKnown: boolean;
      structuralState: StructuralState;
      strengthView: StrengthView;
      specialStructureStatus: SpecialStructureStatus;
      confidenceClass: ConfidenceClass;
      /** Descriptive evidence ONLY — no node in this module ever reads these counts to decide
       *  anything (P0-05 hard contract, enforced by a dedicated test). */
      numerousnessEvidence: NumerousnessEvidence;
      /** Reserved for a FUTURE domain-level judge (money/career/relationship) — never populated
       *  here (P0-04). */
      taskCapacities: 'NOT_EVALUATED';
      reasoningTrace: ReasoningTraceEntry[];
      schoolSensitiveFlags: { nodeId: string; reason: string }[];
    }
  | {
      capability: 'INSUFFICIENT';
      ruleVersion: typeof MYUNGRI_STRUCTURAL_V2_METHOD;
      graphVersion: typeof MYUNGRI_STRUCTURAL_V2_GRAPH_VERSION;
      reason: string;
      blockedAtNodeId: string;
    };

// ── evidence-builder helper, matching the existing kernel's own convention exactly
//    (myungriStrength.ts's `ev()` — domain/temporalScope/directness are fixed here because every
//    fact this module reasons over is a NATAL structural fact, never question-specific) ──────────
const ev = (fact: string, meaning: string): JudgmentEvidence => ({
  fact, meaning, domain: 'GENERAL', temporalScope: 'NATAL', directness: 'ADJACENT',
});

// ── FACT-03: AX01_fact — root/hidden-peer existence, EXISTENCE ONLY (no rank, no survivability). ──
function computeRootExistsFact(
  bundle: MyungriStrengthFactBundle,
): { fact: RootExistsFact; hourKnown: boolean; rootPositions: SajuPillarPosition[] } {
  const hourKnown = bundle.sameElementRooting.branches.some((b) => b.position === 'HOUR');
  const rootPositions = [...new Set(bundle.sameElementRooting.sameElementRoots.map((r) => r.position))];
  if (rootPositions.length > 0) return { fact: 'ROOT_EXISTS_TRUE', hourKnown, rootPositions };
  if (!hourKnown) return { fact: 'ROOT_EXISTS_UNKNOWN', hourKnown, rootPositions };
  return { fact: 'ROOT_EXISTS_FALSE', hourKnown, rootPositions };
}

// ── FACT-04: AX02_fact — raw month-command role, descriptive only. ─────────────────────────────
const PHASE_TO_SEASON_ROLE: Readonly<Record<string, SeasonRoleFact>> = {
  WANG: 'IN_COMMAND', XIANG: 'SUPPORTED', XIU: 'NEUTRAL', QIU: 'DRAINED', SI: 'OPPOSED',
};
function computeSeasonRoleFact(bundle: MyungriStrengthFactBundle): SeasonRoleFact {
  return PHASE_TO_SEASON_ROLE[bundle.monthCommand.dayMasterSeasonalPhase];
}

// ── FACT-05: AX03_fact — relation existence + context annotations, no effect claim. ────────────
function computeRelationContextFact(
  bundle: MyungriStrengthFactBundle,
): { touchesRootPosition: boolean; transformationGlyphPresent: boolean } {
  const { relationParticipants } = bundle;
  const touchesRootPosition =
    relationParticipants.branchPair.some((r) => r.candidateAffectedRootFactIds.length > 0)
    || relationParticipants.branchSet.some((r) => r.candidateAffectedRootFactIds.length > 0);
  // Every 天干 STEM_COMBINATION is one of the five classical transformation glyphs (甲己/乙庚/丙辛/
  // 丁壬/戊癸) — there is no other kind of stem "combination" in the frozen relation detector, so
  // kind alone is sufficient; no new glyph table is invented here.
  const transformationGlyphPresent = relationParticipants.stem.some((r) => r.relation.kind === 'STEM_COMBINATION');
  return { touchesRootPosition, transformationGlyphPresent };
}

// ── FACT-06: AX09_fact — numerousness, FACT ONLY. Deduplicated by DISTINCT POSITION, never by raw
//    stem/hidden-stem occurrence count, matching the frozen graph's own POSITIVE_CONDITIONS. ─────
function computeNumerousnessEvidence(bundle: MyungriStrengthFactBundle, hourKnown: boolean): NumerousnessEvidence {
  const supportPositions = new Set<SajuPillarPosition>();
  const drainPositions = new Set<SajuPillarPosition>();
  for (const f of [...bundle.tenGodFacts.visibleStems, ...bundle.tenGodFacts.hiddenStems]) {
    (tenGodSide(f.tenGod) === 'SUPPORT' ? supportPositions : drainPositions).add(f.position);
  }
  return { supportCount: supportPositions.size, drainCount: drainPositions.size, incompleteCount: !hourKnown };
}

// ── SPECIAL-01: special-structure SCREEN. CANDIDATE ceiling only — see graph node for the full
//    rationale on why HIGH_CONFIDENCE/DISPUTED/a transformation disjunct do not exist here.
//    Exported (alongside runStructuralSynthesis below) so the decision LOGIC itself is directly and
//    exhaustively unit-testable without having to construct a full MyungriStrengthFactBundle for
//    every one of the 2x5 AX01xAX02 combinations — see __tests__/myungriStructuralV2.test.ts. ────
export function runSpecialScreen(
  rootFact: RootExistsFact, seasonFact: SeasonRoleFact,
): { status: SpecialStructureStatusValue; evidence: JudgmentEvidence[] } {
  if (seasonFact === 'OPPOSED' && rootFact === 'ROOT_EXISTS_UNKNOWN') {
    return {
      status: 'INSUFFICIENT',
      evidence: [ev('시주 미상', '뿌리 존재 여부를 확정할 수 없어 특수구조 후보 판정을 완료할 수 없습니다.')],
    };
  }
  if (seasonFact === 'OPPOSED' && rootFact === 'ROOT_EXISTS_FALSE') {
    return {
      status: 'CANDIDATE',
      evidence: [
        ev('계절 실령(死)', '계절이 일간을 정면으로 극합니다.'),
        ev('무근', '지지 어디에도 일간과 같은 오행의 뿌리가 없습니다.'),
      ],
    };
  }
  return {
    status: 'NONE_DETECTED',
    evidence: [],
  };
}

// ── SYNTH-01: the one genuine two-premise structural inference in this graph. ──────────────────
export function runStructuralSynthesis(rootFact: RootExistsFact, seasonFact: SeasonRoleFact): StructuralState {
  if (rootFact === 'ROOT_EXISTS_UNKNOWN') return 'UNRESOLVED';
  if (seasonFact === 'NEUTRAL') return rootFact === 'ROOT_EXISTS_TRUE' ? 'ANCHORED' : 'UNANCHORED';
  const seasonSupports = seasonFact === 'IN_COMMAND' || seasonFact === 'SUPPORTED';
  const rootSupports = rootFact === 'ROOT_EXISTS_TRUE';
  if (rootSupports && seasonSupports) return 'ANCHORED';
  if (!rootSupports && !seasonSupports) return 'UNANCHORED';
  return 'MIXED_STRUCTURE'; // root and season disagree — no canonical executable rule resolves it (P0-03/§17)
}

// ── SV-01: thin 1:1 mapping — kept as a distinct node to preserve the architectural seam. ──────
export const STRUCTURAL_STATE_TO_STRENGTH: Readonly<Record<StructuralState, StrengthClassification>> = {
  ANCHORED: 'STRONG_LEANING', UNANCHORED: 'WEAK_LEANING',
  MIXED_STRUCTURE: 'MIXED_EVIDENCE', UNRESOLVED: 'UNRESOLVED',
};

/**
 * Judge the frozen Myungri Structural V2 graph against one already-built fact bundle. Pure,
 * deterministic, synchronous — same bundle always produces the same result (no clock, no random,
 * no network, no LLM). See module header for exact scope.
 */
export function judgeMyungriStructuralV2(bundle: MyungriStrengthFactBundle): MyungriStructuralV2Result {
  const trace: ReasoningTraceEntry[] = [];

  // FACT-01/FACT-02 — chart completeness + Day Master identity. The bundle builder
  // (buildMyungriStrengthFactBundle) already fails closed on an invalid natal context before this
  // function is ever reached, so both are always satisfied for an AVAILABLE bundle; recorded in the
  // trace for completeness, not because either can fail here.
  const dayMaster = bundle.sameElementRooting.dayMaster.stem;
  const dayMasterElement = bundle.sameElementRooting.dayMaster.element;
  trace.push({ nodeId: 'FACT-01', nodeType: 'FACT_CHECK', premises: [], conclusion: 'chart facts available' });
  trace.push({ nodeId: 'FACT-02', nodeType: 'FACT_CHECK', premises: [], conclusion: `dayMaster=${dayMaster}` });

  // FACT-03
  const { fact: rootFact, hourKnown, rootPositions } = computeRootExistsFact(bundle);
  trace.push({ nodeId: 'FACT-03', nodeType: 'FACT_CHECK', premises: ['sameElementRooting.sameElementRoots'], conclusion: `AX01_fact=${rootFact}` });

  // FACT-04
  const seasonFact = computeSeasonRoleFact(bundle);
  trace.push({ nodeId: 'FACT-04', nodeType: 'FACT_CHECK', premises: ['monthCommand.dayMasterSeasonalPhase'], conclusion: `AX02_fact=${seasonFact}` });

  // FACT-05
  const { touchesRootPosition, transformationGlyphPresent } = computeRelationContextFact(bundle);
  trace.push({ nodeId: 'FACT-05', nodeType: 'FACT_CHECK', premises: ['relationParticipants'], conclusion: `AX03_fact.touchesRootPosition=${touchesRootPosition}` });

  // FACT-06 — HARD CONTRACT: numerousness is computed and returned, but nothing below this line
  // reads `numerousnessEvidence` to decide anything (P0-05). See the dedicated non-authority test.
  const numerousnessEvidence = computeNumerousnessEvidence(bundle, hourKnown);
  trace.push({ nodeId: 'FACT-06', nodeType: 'FACT_CHECK', premises: ['tenGodFacts'], conclusion: `AX09_fact=${JSON.stringify(numerousnessEvidence)}` });

  // SPECIAL-01
  const special = runSpecialScreen(rootFact, seasonFact);
  trace.push({
    nodeId: 'SPECIAL-01', nodeType: 'SPECIAL_SCREEN',
    premises: [`AX01_fact=${rootFact}`, `AX02_fact=${seasonFact}`],
    conclusion: `specialStructureStatus=${special.status}`,
  });

  // SYNTH-01 — the graph's one genuine two-premise inference.
  const structuralState = runStructuralSynthesis(rootFact, seasonFact);
  trace.push({
    nodeId: 'SYNTH-01', nodeType: 'STRUCTURAL_SYNTHESIS',
    premises: [`AX01_fact=${rootFact}`, `AX02_fact=${seasonFact}`],
    conclusion: `structuralState=${structuralState}`,
  });

  // SV-01
  const strengthClassification = STRUCTURAL_STATE_TO_STRENGTH[structuralState];
  trace.push({
    nodeId: 'SV-01', nodeType: 'STRENGTH_VIEW',
    premises: [`structuralState=${structuralState}`],
    conclusion: `strengthClassification=${strengthClassification}`,
  });

  // UNC-FINAL — confidence, per the graph's own named lookup (never a numeric score).
  const confidenceClass: ConfidenceClass =
    strengthClassification === 'MIXED_EVIDENCE' || strengthClassification === 'UNRESOLVED'
      ? 'LOW'
      : touchesRootPosition ? 'MODERATE' : 'HIGH';
  trace.push({
    nodeId: 'UNC-FINAL', nodeType: 'UNCERTAINTY_EXIT',
    premises: [`strengthClassification=${strengthClassification}`, `touchesRootPosition=${touchesRootPosition}`],
    conclusion: `confidenceClass=${confidenceClass}`,
  });

  const strengthEvidence: JudgmentEvidence[] = [];
  if (rootPositions.length > 0) {
    strengthEvidence.push(ev(`통근/득지 ${rootPositions.length}자리`, '지지에 일간과 같은 오행의 뿌리 또는 비겁이 있습니다.'));
  } else if (rootFact === 'ROOT_EXISTS_FALSE') {
    strengthEvidence.push(ev('무근', '지지 어디에도 일간과 같은 오행의 뿌리가 없습니다.'));
  }
  strengthEvidence.push(ev(`월령 ${seasonFact}`, seasonRoleMeaning(seasonFact)));
  if (touchesRootPosition) {
    strengthEvidence.push(ev('관계-뿌리 중첩', '합충형파해 중 하나가 뿌리 자리와 겹치지만, 그 효과는 이 판정에서 다루지 않습니다.'));
  }
  if (transformationGlyphPresent) {
    // Non-decision descriptive metadata only (NEW-P0-01) — never promoted to evidence FOR/AGAINST a
    // classification; carried here purely so a downstream reader can see the raw fact exists.
    strengthEvidence.push(ev('천간합 존재', '변화 판정은 이번 배치에서 다루지 않습니다(TRANSFORMATION_JUDGMENT_V2 = DEFERRED).'));
  }

  const strengthView: StrengthView = {
    classification: strengthClassification,
    evidence: strengthEvidence,
    doesNotImply: [
      'WEAK_LEANING는 어떤 부담도 감당할 수 없다는 뜻이 아닙니다 — capacity(부담 감당력)는 이 배치에서 평가하지 않습니다.',
      'STRONG_LEANING는 모든 부담을 감당할 수 있다는 뜻이 아닙니다.',
      'EXTREME_WEAK/EXTREME_STRONG, BALANCED, 칠단계(七段階) 소비자 라벨은 이 배치에 존재하지 않습니다.',
    ],
    reasoningNodeIds: ['FACT-03', 'FACT-04', 'SYNTH-01', 'SV-01'],
  };

  const specialStructureStatus: SpecialStructureStatus = {
    status: special.status,
    evidence: special.evidence,
    doesNotImply: [
      'CANDIDATE는 종격(從格) 확정 판정이 아니라 후속 검토가 필요하다는 구조적 신호일 뿐입니다.',
      'CANDIDATE는 strengthView를 차단하거나 변경하지 않습니다 — 두 필드는 항상 독립적으로 보고됩니다.',
      'NONE_DETECTED는 이 배치가 종격 가능성을 부정한다는 뜻이 아니라, 실행 가능한 근거를 찾지 못했다는 뜻입니다.',
    ],
    reasoningNodeIds: ['FACT-03', 'FACT-04', 'SPECIAL-01'],
  };

  return {
    capability: 'AVAILABLE',
    ruleVersion: MYUNGRI_STRUCTURAL_V2_METHOD,
    graphVersion: MYUNGRI_STRUCTURAL_V2_GRAPH_VERSION,
    dayMaster, dayMasterElement, hourKnown,
    structuralState, strengthView, specialStructureStatus, confidenceClass,
    numerousnessEvidence,
    taskCapacities: 'NOT_EVALUATED',
    reasoningTrace: trace,
    schoolSensitiveFlags: [
      { nodeId: 'SPECIAL-01', reason: 'CF-011 (root vs following) — see docs/myungri-strength-v2/CONFLICT_REGISTER.md' },
      { nodeId: 'SYNTH-01', reason: 'root-vs-season conflict resolution scope — see docs/myungri-strength-v2/S2_STRUCTURAL_AXES_FREEZE.md' },
    ],
  };
}

function seasonRoleMeaning(fact: SeasonRoleFact): string {
  switch (fact) {
    case 'IN_COMMAND': return '계절이 일간과 같은 오행입니다(旺).';
    case 'SUPPORTED': return '계절이 일간을 생(生)해 줍니다(相).';
    case 'NEUTRAL': return '계절이 일간의 힘을 밀지도 빼지도 않습니다(休).';
    case 'DRAINED': return '계절이 일간에게 극(剋)을 당합니다(囚).';
    case 'OPPOSED': return '계절이 일간을 정면으로 극(剋)합니다(死).';
  }
}

// ── HANDOFF NOTE (not code) ─────────────────────────────────────────────────────────────────────
// This module is not yet wired into the live consultation reasoning pipeline
// (`reasoning/myungriReasoner.ts` / `reasoning/myungriPremises.ts` / `reasoning/kernel.ts`). That
// pipeline currently marks Myungri strength as a named BLOCKED premise
// ('BLOCKED: 강약 학파 미채택 → 강약 등급·억부용신 판정 보류') precisely because no classification was
// available to report. Wiring this module in would mean editing those frozen kernel files to consume
// a real classification instead of the BLOCKED marker — a separate, larger integration task with its
// own scoping, not attempted this batch per the instruction to STOP rather than touch frozen kernel
// code for an adapter. `myungriStrength.ts` (`judgeDayMasterStrength`) is untouched and continues to
// return `UNDETERMINED` by its own design; this module does not compete with it, it simply has not
// been connected to the same call site yet.

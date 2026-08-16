// Engine Orchestration seam (directive §9/§10/§11) — the CLAUDE↔CODEX boundary.
//
// This lives OUTSIDE the frozen engine (`src/features/interpretation/**`) and
// never imports/edits it. It owns the ENGINE-EXTERNAL concerns:
//   - product-level ELIGIBILITY: which discipline is relevant for a question
//     (NOT the academic calculation rules — those are Codex/engine-owned),
//   - the CONNECTION state (is a discipline wired into the pipeline yet),
//   - a NORMALIZED CONTEXT envelope the LLM/cross-analysis layer consumes.
//
// On 2026-08-17 Codex fills the `fact` slots by executing the real engines behind
// `runEngine` (SAJU is implemented but not yet wired; ZIWEI/QIMEN are unimplemented
// per their contracts). Until then every eligible engine resolves to
// 'engine_not_connected' — no fabricated results (제3조).

import type { EngineEvidenceAvailability } from './aiOutput';

// App-external engine ids. Map 1:1 to the frozen `EngineId` union
// ('SAJU' | 'ZIWEI' | 'QIMEN') — kept as a separate lowercase surface so the app
// layer does not depend on a frozen contract path.
export type EngineKind = 'saju' | 'ziwei' | 'qimen';
export const ENGINE_KINDS: readonly EngineKind[] = ['saju', 'ziwei', 'qimen'];
export const FROZEN_ENGINE_ID: Record<EngineKind, 'SAJU' | 'ZIWEI' | 'QIMEN'> = {
  saju: 'SAJU',
  ziwei: 'ZIWEI',
  qimen: 'QIMEN',
};

// Whether each discipline is currently wired into the app pipeline.
// SAJU is CONNECTED (2026-08-16) and ZIWEI is CONNECTED (Ziwei V1): both the frozen Saju/Myungri
// engine and the iztro-based Ziwei engine run in the consultation grounding path
// (chat/services/consultationGrounding.ts → chatService), producing real EngineEvidence (dual-
// engine, with honest Saju-only / Ziwei-only degraded modes). QIMEN remains false — its
// calculator is not wired into grounding (sprint §28). Do not flip a flag without a real, tested path.
export const ENGINE_CONNECTED: Record<EngineKind, boolean> = {
  saju: true,
  ziwei: true,
  qimen: false,
};

// The minimum context needed to decide eligibility. No raw birth values here —
// only presence flags + the question's timing nature (privacy §19/§42).
export type AnalysisQuestionContext = {
  hasSubject: boolean;
  birthDateKnown: boolean;
  birthTimeKnown: boolean;
  isTimingQuestion: boolean; // question about a specific date/time/choice (기문 조건)
};

// PRODUCT eligibility — relevance/input-sufficiency only, NOT calculation rules.
// - saju: needs a birth date (time-unknown is fine; 년/월/일주 don't require it,
//   and the engine must never fabricate a 시주 for unknown time — §13).
// - ziwei: requires birth time.
// - qimen: only applicable to timing/choice questions (§21).
export function resolveEngineEligibility(
  ctx: AnalysisQuestionContext,
  kind: EngineKind,
): EngineEvidenceAvailability {
  if (!ctx.hasSubject) return 'not_applicable';
  switch (kind) {
    case 'saju':
      return ctx.birthDateKnown ? 'available' : 'not_applicable';
    case 'ziwei':
      return ctx.birthTimeKnown ? 'available' : 'missing_birth_time';
    case 'qimen':
      return ctx.isTimingQuestion ? 'available' : 'not_applicable';
    default:
      return 'not_applicable';
  }
}

// Effective availability = eligibility, downgraded to 'engine_not_connected' when
// eligible-but-not-wired. This is what the UI/LLM see.
export function resolveEngineAvailability(
  ctx: AnalysisQuestionContext,
  kind: EngineKind,
): EngineEvidenceAvailability {
  const eligible = resolveEngineEligibility(ctx, kind);
  if (eligible !== 'available') return eligible;
  return ENGINE_CONNECTED[kind] ? 'available' : 'engine_not_connected';
}

export type EngineEnvelope = {
  kind: EngineKind;
  availability: EngineEvidenceAvailability;
  // Structured engine facts — filled by Codex's `runEngine` when connected.
  // `unknown` here keeps the app layer decoupled from the frozen result types;
  // the LLM/cross layer treats it as opaque bounded evidence.
  fact?: unknown;
};

// Normalized context passed toward the LLM / cross-analysis. Bounded + PII-minimal.
export type NormalizedInterpretationContext = {
  question: string;
  isTimingQuestion: boolean;
  subject: {
    displayName: string | null;
    relationship: string | null;
    birthDateKnown: boolean;
    birthTimeKnown: boolean;
  };
  engines: Record<EngineKind, EngineEnvelope>;
  warnings: string[];
};

export type BuildContextInput = {
  question: string;
  ctx: AnalysisQuestionContext;
  subject: { displayName: string | null; relationship: string | null };
};

// SEAM. Builds the normalized envelope. Engine `fact` is intentionally empty
// until Codex wires `runEngine`; nothing is fabricated. Claude owns this shaping;
// Codex owns filling the facts behind the connection flags.
export function buildInterpretationContext(
  input: BuildContextInput,
): NormalizedInterpretationContext {
  const { question, ctx, subject } = input;
  const warnings: string[] = [];
  if (ctx.hasSubject && !ctx.birthTimeKnown) {
    warnings.push('birth_time_unknown: time-dependent analysis (시주/자미) is limited');
  }

  const engines = ENGINE_KINDS.reduce(
    (acc, kind) => {
      acc[kind] = { kind, availability: resolveEngineAvailability(ctx, kind) };
      return acc;
    },
    {} as Record<EngineKind, EngineEnvelope>,
  );

  return {
    question,
    isTimingQuestion: ctx.isTimingQuestion,
    subject: {
      displayName: subject.displayName,
      relationship: subject.relationship,
      birthDateKnown: ctx.birthDateKnown,
      birthTimeKnown: ctx.birthTimeKnown,
    },
    engines,
    warnings,
  };
}

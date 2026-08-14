// Consultation Intelligence — ENGINE EVIDENCE & GROUNDING presentation adapter
// (Sprint 3A-B, §10/§24/§28). Maps the EngineEvidence triplet + ConsultationGrounding
// CONTRACTS → fail-closed ViewModels for the consumer Explainability sheet and the admin
// Engine Evidence / Grounding panels.
//
// HARD boundary (§4/§11): this file NEVER decides availability, never runs an engine,
// never classifies polarity. Codex produces `availability`/`summary`; here we only look
// values up and DECIDE VISIBILITY:
//   • the five availability states stay DISTINCT (not_applicable ≠ calculation_failed ≠
//     engine_not_connected ≠ missing_birth_time ≠ available) — §11/§24;
//   • the consumer "활용된 관점" lists ONLY engines actually `available` (§10/§27) — never
//     all three by default;
//   • Qimen is shown as used ONLY when its own evidence says `available` (§11).
import type { EngineEvidence, EngineEvidenceAvailability } from '@/features/analysis';
import type {
  ConsultationGrounding,
  EngineEvidenceTriplet,
} from '@/features/chat/prompts/grounding';

import {
  AVAILABILITY_LABELS,
  AVAILABILITY_TONES,
  ENGINE_LABELS,
  GROUNDING_REASON_LABELS,
  type LabelTone,
} from './labels';

export type EngineKey = 'saju' | 'ziwei' | 'qimen';

// The triplet keys engines by myungri/ziwei/qimen; the label maps key by saju/ziwei/qimen.
const TRIPLET_TO_ENGINE: Record<keyof EngineEvidenceTriplet, EngineKey> = {
  myungri: 'saju',
  ziwei: 'ziwei',
  qimen: 'qimen',
};

// ── One engine's evidence row (admin panel + consumer 분석 범위) ──────────────────────
export type EngineEvidenceView = {
  engineKey: EngineKey;
  engineLabel: string;
  availability: EngineEvidenceAvailability;
  availabilityLabel: string;
  availabilityTone: LabelTone;
  isAvailable: boolean; // availability === 'available' — the ONLY "used" state (§10/§27)
  summary: string; // '' unless available AND a summary was provided (never fabricated)
  detail: string; // '' unless provided — secondary/expandable (§24)
};

export function toEngineEvidenceView(
  engineKey: EngineKey,
  ev: EngineEvidence,
): EngineEvidenceView {
  const isAvailable = ev.availability === 'available';
  return {
    engineKey,
    engineLabel: ENGINE_LABELS[engineKey],
    availability: ev.availability,
    availabilityLabel: AVAILABILITY_LABELS[ev.availability],
    availabilityTone: AVAILABILITY_TONES[ev.availability],
    isAvailable,
    // Never invent a summary: only surface one the backend actually attached to an
    // available engine (§37 — no fabricated evidence).
    summary: isAvailable ? (ev.summary ?? '') : '',
    detail: ev.detail ?? '',
  };
}

// ── Grounding (admin) ─────────────────────────────────────────────────────────────────
export type GroundingView =
  | { status: 'unavailable'; reasonLabel: string }
  | { status: 'available'; engines: EngineEvidenceView[]; usedCount: number };

/**
 * Fail-closed: when grounding is `unavailable` (the current default — pipeline not wired),
 * the operator sees the REASON, not an empty "all engines" table. When available, every
 * engine row is shown with its DISTINCT availability state; `usedCount` counts only the
 * engines whose evidence is actually `available` (§11 — UI never decides usage).
 */
export function toGroundingView(grounding: ConsultationGrounding): GroundingView {
  if (grounding.status === 'unavailable') {
    return { status: 'unavailable', reasonLabel: GROUNDING_REASON_LABELS[grounding.reason] };
  }
  const engines = (Object.keys(TRIPLET_TO_ENGINE) as (keyof EngineEvidenceTriplet)[]).map((k) =>
    toEngineEvidenceView(TRIPLET_TO_ENGINE[k], grounding.evidence[k]),
  );
  return {
    status: 'available',
    engines,
    usedCount: engines.filter((e) => e.isAvailable).length,
  };
}

// ── Consumer Explainability "왜 이렇게 해석했나요?" (§10) ──────────────────────────────
// Approved structure: 활용된 관점 (only engines actually used) · 종합하면 (summary) ·
// 분석 범위 (each engine's honest state). NEVER shows all three engines by default.
export type ExplainabilityView =
  | { status: 'unavailable'; reasonLabel: string }
  | {
      status: 'available';
      usedPerspectives: { engineLabel: string; summary: string }[]; // 활용된 관점
      scope: { engineLabel: string; stateLabel: string; tone: LabelTone }[]; // 분석 범위
    };

export function toExplainabilityView(grounding: ConsultationGrounding): ExplainabilityView {
  const g = toGroundingView(grounding);
  if (g.status === 'unavailable') {
    return { status: 'unavailable', reasonLabel: g.reasonLabel };
  }
  return {
    status: 'available',
    usedPerspectives: g.engines
      .filter((e) => e.isAvailable)
      .map((e) => ({ engineLabel: e.engineLabel, summary: e.summary })),
    scope: g.engines.map((e) => ({
      engineLabel: e.engineLabel,
      stateLabel: e.availabilityLabel,
      tone: e.availabilityTone,
    })),
  };
}

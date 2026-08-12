// Consultation Intelligence — EVIDENCE LEDGER (directive §8/§9). Layer A = the
// deterministic calculation FACTS, kept separate from Assessment (layer B). PURE
// contracts + validator/builder; NO astrology/polarity logic (that is Codex, §5).
//
// An EvidenceRecord captures WHAT a frozen engine produced, WITH provenance, so it
// can be traced later. It reuses the engine-external `EngineEvidence` (facts-only:
// availability + bounded summary/detail) — the raw engine internals are never
// duplicated here. Assessment NEVER overwrites an EvidenceRecord (§8): a
// re-computation is a NEW record/run (§9), never an in-place mutation.
import type {
  EngineEvidence,
  EngineEvidenceAvailability,
  EngineKind,
} from '@/features/analysis';

import { EVIDENCE_LEDGER_SCHEMA_VERSION } from './versions';

// Provenance is what makes a past consultation reproducible (§9/§36).
export type EvidenceProvenance = {
  engine: EngineKind; // 'saju' | 'ziwei' | 'qimen'
  engineVersion: string; // e.g. 'iztro@2.5.8', 'qimen-dunjia@2.1.0', a saju build id
  engineRulesetVersion: string; // e.g. 'iztro-default@2.5.8', 'qimen-dunjia-chaibu@2.1.0'
};

export type EvidenceType = 'engine_output' | 'derived_fact';

export type EvidenceRecord = {
  evidenceId: string;
  provenance: EvidenceProvenance;
  evidenceType: EvidenceType;
  availability: EngineEvidenceAvailability; // mirrors evidence.availability (indexable)
  // Facts-only (never fabricated prose, never full raw engine internals).
  evidence: EngineEvidence;
  // Optional pointer to the engine run / stored snapshot this evidence came from.
  sourceRef: string | null;
  schemaVersion: string;
  createdAt: string; // ISO — immutable
};

export type EvidenceRecordInput = {
  evidenceId: string;
  provenance: EvidenceProvenance;
  evidence: EngineEvidence;
  evidenceType?: EvidenceType;
  sourceRef?: string | null;
  createdAt: string;
};

// Build an immutable ledger record from a real engine's EngineEvidence. It copies
// availability from the evidence (single source of truth) and never invents facts.
export function toEvidenceRecord(input: EvidenceRecordInput): EvidenceRecord {
  return {
    evidenceId: input.evidenceId,
    provenance: input.provenance,
    evidenceType: input.evidenceType ?? 'engine_output',
    availability: input.evidence.availability,
    evidence: input.evidence,
    sourceRef: input.sourceRef ?? null,
    schemaVersion: EVIDENCE_LEDGER_SCHEMA_VERSION,
    createdAt: input.createdAt,
  };
}

// Structural validity (NOT semantic astrology correctness). Provenance + a
// non-empty id are required so nothing untraceable enters the ledger.
export function isValidEvidenceRecord(r: EvidenceRecord): boolean {
  return (
    typeof r.evidenceId === 'string' &&
    r.evidenceId.length > 0 &&
    typeof r.provenance?.engine === 'string' &&
    r.provenance.engineVersion.length > 0 &&
    r.provenance.engineRulesetVersion.length > 0 &&
    r.availability === r.evidence.availability &&
    typeof r.schemaVersion === 'string' &&
    r.schemaVersion.length > 0 &&
    typeof r.createdAt === 'string' &&
    r.createdAt.length > 0
  );
}

// Fortune-mail DOMAIN infrastructure (directive §2-E/§7–§10) — PURE, no I/O.
//
// Builds the fortune-mail generation domain WITHOUT generating any academic
// content: types, the status machine, a deterministic idempotency key, a pipeline
// skeleton that STOPS at ENGINE_NOT_CONNECTED (the current reality — no fabricated
// fortune, 제3조), and a STRUCTURAL validation seam (never judges interpretive
// correctness). Codex/engine work fills the engine + AI-generation steps later.

export type FortuneMailType = 'weekly' | 'monthly' | 'yearly' | 'special';

// Aligns with the admin AdminFortuneMailStatus terms.
export type FortuneMailStatus =
  | 'pending'
  | 'generating'
  | 'generated'
  | 'scheduled'
  | 'sent'
  | 'generation_failed'
  | 'delivery_failed'
  | 'cancelled';

// Allowed status transitions (state machine). Anything not listed is invalid.
const TRANSITIONS: Record<FortuneMailStatus, FortuneMailStatus[]> = {
  pending: ['generating', 'cancelled'],
  generating: ['generated', 'generation_failed', 'cancelled'],
  generated: ['scheduled', 'sent', 'cancelled'],
  scheduled: ['sent', 'delivery_failed', 'cancelled'],
  sent: [],
  generation_failed: ['generating', 'cancelled'], // retryable
  delivery_failed: ['scheduled', 'sent', 'cancelled'], // retryable
  cancelled: [],
};

export function canTransition(from: FortuneMailStatus, to: FortuneMailStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

// Period reference (which fortune window). weekly→W##, monthly→month, yearly→year,
// special→tag.
export type FortunePeriodRef =
  | { type: 'weekly'; year: number; week: number }
  | { type: 'monthly'; year: number; month: number }
  | { type: 'yearly'; year: number }
  | { type: 'special'; tag: string };

function periodToken(p: FortunePeriodRef): string {
  switch (p.type) {
    case 'weekly':
      return `${p.year}-W${String(p.week).padStart(2, '0')}`;
    case 'monthly':
      return `${p.year}-${String(p.month).padStart(2, '0')}`;
    case 'yearly':
      return `${p.year}`;
    case 'special':
      return `special:${p.tag}`;
  }
}

// Deterministic idempotency key: same (user, subject, type, period) → same key;
// any of them changing → a different key. Enables a DB unique constraint to
// prevent duplicate generation (migration artifact only; not applied here).
export function fortuneIdempotencyKey(
  userId: string,
  subjectId: string,
  period: FortunePeriodRef,
): string {
  return `ftn:${userId}:${subjectId}:${period.type}:${periodToken(period)}`;
}

// ---- pipeline skeleton -------------------------------------------------------
export type FortunePipelineStage =
  | 'eligibility'
  | 'idempotency'
  | 'context'
  | 'engine'
  | 'ai_generation'
  | 'validation'
  | 'persistence'
  | 'delivery';

export type FortuneGenerationRequest = {
  userId: string;
  subjectId: string;
  period: FortunePeriodRef;
  hasBirthDate: boolean;
};

export type FortunePipelineDeps = {
  engineConnected: boolean; // Codex flips true once engines are wired
  alreadyExists: boolean; // idempotency lookup result (caller supplies)
};

export type FortunePipelineOutcome = {
  stoppedAt: FortunePipelineStage;
  status: FortuneMailStatus;
  reason: string; // machine reason (e.g. ENGINE_NOT_CONNECTED / DUPLICATE / OK_READY)
  idempotencyKey: string;
};

// Deterministic pipeline evaluation. It does NOT call engines/LLM/DB — it decides
// how far the request can legitimately proceed given the injected deps, and where
// it must stop. With no engine, it stops at 'engine' / ENGINE_NOT_CONNECTED and
// never fabricates a fortune.
export function evaluateFortunePipeline(
  req: FortuneGenerationRequest,
  deps: FortunePipelineDeps,
): FortunePipelineOutcome {
  const key = fortuneIdempotencyKey(req.userId, req.subjectId, req.period);

  if (!req.hasBirthDate) {
    return { stoppedAt: 'eligibility', status: 'generation_failed', reason: 'BIRTH_INFO_REQUIRED', idempotencyKey: key };
  }
  if (deps.alreadyExists) {
    return { stoppedAt: 'idempotency', status: 'pending', reason: 'DUPLICATE_SKIPPED', idempotencyKey: key };
  }
  if (!deps.engineConnected) {
    return { stoppedAt: 'engine', status: 'pending', reason: 'ENGINE_NOT_CONNECTED', idempotencyKey: key };
  }
  // Engine connected → ready for AI generation (performed by the caller/Codex).
  return { stoppedAt: 'ai_generation', status: 'generating', reason: 'READY_FOR_GENERATION', idempotencyKey: key };
}

// ---- structural validation seam ---------------------------------------------
export type FortuneContentCandidate = {
  title?: unknown;
  summary?: unknown;
  content?: unknown;
  schemaVersion?: unknown;
};

export type FortuneValidationResult = { valid: boolean; errors: string[] };

// Structure-only validation (never judges interpretive correctness — §10).
export function validateFortuneContent(c: FortuneContentCandidate): FortuneValidationResult {
  const errors: string[] = [];
  if (typeof c.title !== 'string' || c.title.trim().length === 0) errors.push('title_missing');
  if (typeof c.summary !== 'string' || c.summary.trim().length === 0) errors.push('summary_missing');
  if (typeof c.content !== 'string' || c.content.trim().length === 0) errors.push('content_missing');
  if (typeof c.schemaVersion !== 'string' || c.schemaVersion.trim().length === 0) errors.push('schema_version_missing');
  return { valid: errors.length === 0, errors };
}

// Fortune-mail GENERATION + DELIVERY orchestration contracts (directive §3/§4).
// PURE, engine-external, provider-neutral. This layer decides WHETHER/HOW a
// fortune-mail job may proceed and tracks its lifecycle — it NEVER computes a
// fortune (that is the frozen engine) and NEVER fakes a delivery (제3조). With no
// engine it stops at ENGINE_NOT_CONNECTED; with no delivery provider it reports
// NOT_CONFIGURED / PROVIDER_NOT_CONNECTED — never a fake "sent".
import {
  evaluateFortunePipeline,
  type FortuneGenerationRequest,
  type FortuneMailStatus,
  type FortunePeriodRef,
  type FortunePipelineDeps,
  type FortunePipelineStage,
} from './fortuneDomain';

// ---- Generation job ----------------------------------------------------------
// An orchestration record. The engine/LLM later fills model/promptVersion/tokens
// (never invented here). `status` reuses the domain status machine.
export type FortuneTokenUsage = { input: number; cached?: number; output: number };

export type FortuneGenerationJob = {
  idempotencyKey: string;
  userId: string;
  subjectId: string;
  period: FortunePeriodRef;
  status: FortuneMailStatus;
  requestId: string;
  stoppedAt: FortunePipelineStage;
  reason: string; // ENGINE_NOT_CONNECTED / DUPLICATE_SKIPPED / READY_FOR_GENERATION …
  model: string | null;
  promptVersion: string | null;
  schemaVersion: string | null;
  tokenUsage: FortuneTokenUsage | null;
};

// Plan a generation job from a request + injected deps. Idempotent by design:
// the idempotency key + `alreadyExists` dep prevent duplicate generation.
export function planFortuneGeneration(
  req: FortuneGenerationRequest,
  deps: FortunePipelineDeps,
  requestId: string,
): FortuneGenerationJob {
  const outcome = evaluateFortunePipeline(req, deps);
  return {
    idempotencyKey: outcome.idempotencyKey,
    userId: req.userId,
    subjectId: req.subjectId,
    period: req.period,
    status: outcome.status,
    requestId,
    stoppedAt: outcome.stoppedAt,
    reason: outcome.reason,
    model: null,
    promptVersion: null,
    schemaVersion: null,
    tokenUsage: null,
  };
}

// ---- Delivery provider readiness (provider-neutral) --------------------------
export type DeliveryChannel = 'push' | 'email' | 'in_app';
export type DeliveryReadiness = 'ready' | 'not_configured' | 'provider_not_connected';

// null / no providerId ⇒ not_configured. providerId set but not connected ⇒
// provider_not_connected. No provider is chosen for V1 — this stays truthful.
export type DeliveryProviderConfig = {
  channel: DeliveryChannel;
  providerId: string | null;
  connected: boolean;
} | null;

export function resolveDeliveryReadiness(config: DeliveryProviderConfig): DeliveryReadiness {
  if (!config || !config.providerId) return 'not_configured';
  if (!config.connected) return 'provider_not_connected';
  return 'ready';
}

// ---- Delivery job ------------------------------------------------------------
export type FortuneDeliveryStatus =
  | 'pending'
  | 'scheduled'
  | 'sent'
  | 'delivery_failed'
  | 'cancelled'
  | 'blocked_not_configured';

export type FortuneDeliveryJob = {
  generationIdempotencyKey: string;
  channel: DeliveryChannel;
  status: FortuneDeliveryStatus;
  requestId: string;
  readiness: DeliveryReadiness;
  reason: string;
  providerMessageId: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  retryCount: number;
};

// Plan delivery for a generated fortune. NEVER fakes success:
//  - no/unconnected provider          → blocked_not_configured
//  - generation not generated/scheduled → pending (nothing to send yet)
//  - otherwise                        → scheduled (ready to send)
export function planFortuneDelivery(
  gen: FortuneGenerationJob,
  config: DeliveryProviderConfig,
  requestId: string,
): FortuneDeliveryJob {
  const readiness = resolveDeliveryReadiness(config);
  const base = {
    generationIdempotencyKey: gen.idempotencyKey,
    channel: config?.channel ?? 'in_app',
    requestId,
    readiness,
    retryCount: 0,
    providerMessageId: null,
    scheduledAt: null,
    sentAt: null,
  };
  if (readiness !== 'ready') {
    return { ...base, status: 'blocked_not_configured', reason: readiness.toUpperCase() };
  }
  if (gen.status !== 'generated' && gen.status !== 'scheduled') {
    return { ...base, status: 'pending', reason: 'GENERATION_NOT_READY' };
  }
  return { ...base, status: 'scheduled', reason: 'READY_TO_SEND' };
}

// Delivery status transition machine (retry-safe). sent/cancelled terminal.
const DELIVERY_TRANSITIONS: Record<FortuneDeliveryStatus, FortuneDeliveryStatus[]> = {
  pending: ['scheduled', 'cancelled', 'blocked_not_configured'],
  scheduled: ['sent', 'delivery_failed', 'cancelled'],
  delivery_failed: ['scheduled', 'cancelled'], // retryable
  sent: [],
  cancelled: [],
  blocked_not_configured: ['pending', 'cancelled'],
};

export function canTransitionDelivery(from: FortuneDeliveryStatus, to: FortuneDeliveryStatus): boolean {
  return DELIVERY_TRANSITIONS[from].includes(to);
}

// Duplicate-send guard: only a 'scheduled', ready, not-already-sent job may send.
export function canSendDelivery(job: FortuneDeliveryJob, alreadySent: boolean): boolean {
  return job.status === 'scheduled' && job.readiness === 'ready' && !alreadySent;
}

// Admin operational Backend contracts (directive §11–§14, §17–§20) — TYPES +
// PURE cost calculator + seam interfaces. No real prices, no fake audit records,
// no PII. Token usage and cost are kept SEPARATE: cost is computed only when a
// verified pricing config exists; otherwise it is null (never a fake ₩0).

// ---- A. Model pricing config (values supplied later from an official price table)
export type PricingUnit = 'per_1k_tokens' | 'per_1m_tokens';

export type ModelPricingConfig = {
  provider: string;
  model: string;
  effectiveFrom: string; // ISO date
  currency: string; // e.g. 'KRW' | 'USD'
  unit: PricingUnit;
  inputUnitPrice: number;
  cachedInputUnitPrice: number | null;
  outputUnitPrice: number;
};

export type TokenUsage = {
  model: string;
  inputTokens: number;
  cachedInputTokens?: number;
  outputTokens: number;
};

export type CostBreakdown = {
  currency: string;
  input: number;
  cachedInput: number;
  output: number;
  total: number;
};

function unitDivisor(unit: PricingUnit): number {
  return unit === 'per_1k_tokens' ? 1_000 : 1_000_000;
}

// Pure, deterministic. Returns null when there is no pricing for the model (cost
// UNKNOWN — do NOT invent 0). cachedInputTokens are billed at the cached rate when
// provided AND a cached price exists; otherwise folded into normal input.
export function computeCost(
  usage: TokenUsage,
  pricing: ModelPricingConfig | null | undefined,
): CostBreakdown | null {
  if (!pricing || pricing.model !== usage.model) return null;
  const div = unitDivisor(pricing.unit);
  const cached = usage.cachedInputTokens ?? 0;
  const normalInput = Math.max(0, usage.inputTokens - cached);

  const inputCost = (normalInput / div) * pricing.inputUnitPrice;
  const cachedCost =
    pricing.cachedInputUnitPrice != null
      ? (cached / div) * pricing.cachedInputUnitPrice
      : (cached / div) * pricing.inputUnitPrice;
  const outputCost = (usage.outputTokens / div) * pricing.outputUnitPrice;

  return {
    currency: pricing.currency,
    input: inputCost,
    cachedInput: cachedCost,
    output: outputCost,
    total: inputCost + cachedCost + outputCost,
  };
}

// ---- B. Engine telemetry (metadata only; never birth info / full results) -----
export type EngineTelemetryEvent = {
  engine: 'saju' | 'ziwei' | 'qimen';
  requestId: string;
  version: string | null;
  status: 'started' | 'success' | 'failure';
  startedAt: string; // ISO
  completedAt: string | null;
  latencyMs: number | null;
  errorCode: string | null;
};

// Seam the engine caller will use. Codex wires the real recorder later; the frozen
// engine itself is never modified.
export interface EngineTelemetryRepository {
  recordStart(e: Pick<EngineTelemetryEvent, 'engine' | 'requestId' | 'version' | 'startedAt'>): Promise<void> | void;
  recordSuccess(e: EngineTelemetryEvent): Promise<void> | void;
  recordFailure(e: EngineTelemetryEvent): Promise<void> | void;
}

// ---- C. Admin audit (for future admin Actions — none are live yet) ------------
export type AdminAuditAction =
  | 'user_restrict'
  | 'fortune_regenerate'
  | 'fortune_send_now'
  | 'fortune_cancel'
  | 'settings_change';

export type AdminAuditEvent = {
  actorAdminId: string;
  action: AdminAuditAction;
  targetType: string;
  targetId: string;
  requestId: string;
  createdAt: string; // ISO
  // Small, non-sensitive summary only — NEVER full payloads / PII / birth info.
  safeMetadata?: Record<string, string | number | boolean>;
};

export interface AdminAuditService {
  record(event: AdminAuditEvent): Promise<void> | void;
}

// Explicit no-op so unconnected admin Actions never write FAKE audit rows (§14).
export const noopAdminAuditService: AdminAuditService = {
  record() {
    /* intentionally does nothing until a real audit store is connected */
  },
};

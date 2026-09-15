// Server-owned MODEL ROUTER (Sprint G §D–§H). The consultation engine and the client MUST NOT choose a model:
// routing is a SERVER decision, keyed by WORKLOAD / PRODUCT, never by membership tier and never by a
// client-supplied model id (which is ignored entirely). A routing change is OUTPUT/verbalization-layer metadata
// only — it never alters a stored deterministic decision (polarity / targets / plan are frozen).
//
// V1 policy (§E/§F/§AY/§AZ):
//   general consultation + general follow-up + today + monthly + summary → Mini
//   compatibility (FULL_TERRA default)                                    → Terra
//   deep consultation / specific-period deep / premium report            → Terra (product seams)
// PLUS never changes the model. A PLUS user's general question is still Mini; a non-PLUS user's compatibility
// is still Terra.

export const MODEL_ROUTING_POLICY_VERSION = 'model-routing@1.0.0';

// Official Sprint G model contract (§D). Env can pin the real deployed ids without a code change; the client
// can never set these.
export const DEFAULT_MINI_MODEL = 'gpt-5-mini';
export const DEFAULT_TERRA_MODEL = 'gpt-5.6-terra';

export type ModelWorkload =
  | 'general_consultation'
  | 'general_followup'
  | 'compatibility'
  | 'deep_consultation'
  | 'specific_period_deep'
  | 'premium_report'
  | 'today_fortune'
  | 'monthly_fortune'
  | 'summary';

// §F — compatibility model mode. FULL_TERRA (default) keeps the whole compatibility session on Terra.
// SMART_HYBRID is a reserved seam (may stay disabled); it must never be chosen unless a benchmark proves it
// materially necessary. Even under SMART_HYBRID V1 resolves to Terra (the downgrade path is not implemented).
export type CompatibilityModelMode = 'FULL_TERRA' | 'SMART_HYBRID';

export type ResolvedModelRoute = {
  workload: ModelWorkload;
  productType: string; // 'general' | 'compatibility' | 'deep' | 'premium_report' | 'today' | 'monthly' | 'summary'
  modelId: string;
  routingPolicyVersion: string;
  reasonCode: string; // audit: WHY this model (e.g. GENERAL_MINI, COMPAT_TERRA_FULL, DEEP_TERRA)
};

export type ModelRouterConfig = {
  // Optional env-pinned ids (server-only). Absent → the official contract defaults.
  miniModel?: string | null;
  terraModel?: string | null;
  compatibilityModelMode?: CompatibilityModelMode | null;
};

const PRODUCT_OF: Record<ModelWorkload, string> = {
  general_consultation: 'general',
  general_followup: 'general',
  compatibility: 'compatibility',
  deep_consultation: 'deep',
  specific_period_deep: 'deep',
  premium_report: 'premium_report',
  today_fortune: 'today',
  monthly_fortune: 'monthly',
  summary: 'summary',
};

const MINI_WORKLOADS = new Set<ModelWorkload>([
  'general_consultation', 'general_followup', 'today_fortune', 'monthly_fortune', 'summary',
]);

/**
 * Resolve the model for a workload. PURE + deterministic. Never reads a client model id. The compatibility mode
 * is honored but V1 resolves compatibility to Terra under both modes (SMART_HYBRID's downgrade is unimplemented).
 */
export function resolveModelRoute(workload: ModelWorkload, config?: ModelRouterConfig): ResolvedModelRoute {
  const mini = (config?.miniModel && config.miniModel.trim()) || DEFAULT_MINI_MODEL;
  const terra = (config?.terraModel && config.terraModel.trim()) || DEFAULT_TERRA_MODEL;
  const productType = PRODUCT_OF[workload];

  if (MINI_WORKLOADS.has(workload)) {
    return { workload, productType, modelId: mini, routingPolicyVersion: MODEL_ROUTING_POLICY_VERSION, reasonCode: 'GENERAL_MINI' };
  }
  if (workload === 'compatibility') {
    const mode: CompatibilityModelMode = config?.compatibilityModelMode ?? 'FULL_TERRA';
    // Both modes → Terra in V1. SMART_HYBRID is a reserved seam; it must not downgrade without benchmark proof.
    return { workload, productType, modelId: terra, routingPolicyVersion: MODEL_ROUTING_POLICY_VERSION, reasonCode: mode === 'SMART_HYBRID' ? 'COMPAT_TERRA_HYBRID_SEAM' : 'COMPAT_TERRA_FULL' };
  }
  // deep / specific-period / premium report → Terra (product seams).
  const reason = workload === 'premium_report' ? 'PREMIUM_TERRA' : 'DEEP_TERRA';
  return { workload, productType, modelId: terra, routingPolicyVersion: MODEL_ROUTING_POLICY_VERSION, reasonCode: reason };
}

/** Map the Edge's consultationMode → the solo/compatibility consultation workload. */
export function consultationWorkload(consultationMode: 'solo' | 'compatibility' | undefined): ModelWorkload {
  return consultationMode === 'compatibility' ? 'compatibility' : 'general_consultation';
}

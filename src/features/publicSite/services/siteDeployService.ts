// Client boundary for the static-site rebuild (S8). Never holds the Deploy Hook URL — that is an
// Edge secret. This only asks the admin-gated `site-deploy` Edge function to trigger one.
//
// WHY THE APP CALLS THIS AT ALL. The public site is pre-rendered HTML (`web.output: "static"`), so
// publishing a 유명인 updates the database but not the file a crawler downloads. The owner's
// requirement is "press publish and nothing else", so the publish path asks for the rebuild.
//
// FAIL-OPEN, NEVER SILENT: a rebuild failure must not fail the publish (the content is already
// saved), but the outcome is always returned so the screen can say what happened.
import { getSupabaseClient } from '@/services/supabase';

export type DeployOutcome = 'requested' | 'skipped' | 'failed';

export type DeployResult = {
  outcome: DeployOutcome;
  /** Consumer-safe Korean, authored server-side. Show it verbatim. */
  message: string;
  /** false only when the hook is not configured — distinguishes "not set up" from "tried and failed". */
  configured: boolean;
};

const FAILED_LOCALLY: DeployResult = {
  outcome: 'failed',
  message: '사이트 재생성을 요청하지 못했습니다. 발행 자체는 저장됐습니다.',
  configured: true,
};

/**
 * Ask for a static-site rebuild. `reason` is a short label for the audit log (e.g. `famous:publish`).
 * Resolves for every outcome — it never throws, because a publish must not fail on this.
 */
export async function requestSiteDeploy(reason: string): Promise<DeployResult> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.functions.invoke('site-deploy', { body: { reason } });
    if (error) return FAILED_LOCALLY;
    const row = data as { outcome?: unknown; message?: unknown; configured?: unknown } | null;
    const outcome: DeployOutcome =
      row?.outcome === 'requested' || row?.outcome === 'skipped' ? row.outcome : 'failed';
    return {
      outcome,
      message: typeof row?.message === 'string' && row.message.length > 0 ? row.message : FAILED_LOCALLY.message,
      configured: row?.configured !== false,
    };
  } catch {
    return FAILED_LOCALLY;
  }
}

export type LatestDeploy = {
  status: DeployOutcome;
  reason: string | null;
  createdAt: string | null;
  detail: string | null;
};

/** Newest rebuild request, for the admin status line. Returns null when nothing was ever requested. */
export async function latestDeployRequest(): Promise<LatestDeploy | null> {
  try {
    const { data, error } = await getSupabaseClient().rpc('admin_latest_deploy_request');
    if (error || data === null || typeof data !== 'object') return null;
    const row = data as Record<string, unknown>;
    const status = row.status;
    if (status !== 'requested' && status !== 'skipped' && status !== 'failed') return null;
    return {
      status,
      reason: typeof row.reason === 'string' ? row.reason : null,
      createdAt: typeof row.createdAt === 'string' ? row.createdAt : null,
      detail: typeof row.detail === 'string' ? row.detail : null,
    };
  } catch {
    return null;
  }
}

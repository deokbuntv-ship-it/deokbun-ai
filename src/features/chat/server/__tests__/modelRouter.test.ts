// Sprint G §D–§H, §E/§F/§AY — server-owned model routing. Product/workload-based, never membership-based,
// never client-driven. Solo general → Mini; compatibility → Terra; deep/premium → Terra.
import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
  resolveModelRoute,
  consultationWorkload,
  MODEL_ROUTING_POLICY_VERSION,
  DEFAULT_MINI_MODEL,
  DEFAULT_TERRA_MODEL,
} from '@/features/chat/server/modelRouter';

describe('§E resolveModelRoute — workload → model (official contract defaults)', () => {
  it('general consultation + follow-up + today + monthly + summary → Mini', () => {
    for (const w of ['general_consultation', 'general_followup', 'today_fortune', 'monthly_fortune', 'summary'] as const) {
      expect(resolveModelRoute(w).modelId).toBe(DEFAULT_MINI_MODEL);
    }
    expect(DEFAULT_MINI_MODEL).toBe('gpt-5-mini');
  });

  it('compatibility → Terra (FULL_TERRA default)', () => {
    const r = resolveModelRoute('compatibility');
    expect(r.modelId).toBe(DEFAULT_TERRA_MODEL);
    expect(DEFAULT_TERRA_MODEL).toBe('gpt-5.6-terra');
    expect(r.reasonCode).toBe('COMPAT_TERRA_FULL');
  });

  it('deep / specific-period / premium report → Terra (product seams)', () => {
    for (const w of ['deep_consultation', 'specific_period_deep', 'premium_report'] as const) {
      expect(resolveModelRoute(w).modelId).toBe(DEFAULT_TERRA_MODEL);
    }
  });

  it('every route carries the routing policy version', () => {
    expect(resolveModelRoute('general_consultation').routingPolicyVersion).toBe(MODEL_ROUTING_POLICY_VERSION);
  });
});

describe('§F compatibility model mode', () => {
  it('FULL_TERRA and SMART_HYBRID both resolve to Terra in V1 (no unproven downgrade)', () => {
    expect(resolveModelRoute('compatibility', { compatibilityModelMode: 'FULL_TERRA' }).modelId).toBe('gpt-5.6-terra');
    const hybrid = resolveModelRoute('compatibility', { compatibilityModelMode: 'SMART_HYBRID' });
    expect(hybrid.modelId).toBe('gpt-5.6-terra'); // hybrid downgrade is an unimplemented seam
    expect(hybrid.reasonCode).toBe('COMPAT_TERRA_HYBRID_SEAM');
  });
});

describe('§D env-pinned ids override the defaults (server-only)', () => {
  it('honors miniModel / terraModel config', () => {
    expect(resolveModelRoute('general_consultation', { miniModel: 'mini-pinned' }).modelId).toBe('mini-pinned');
    expect(resolveModelRoute('compatibility', { terraModel: 'terra-pinned' }).modelId).toBe('terra-pinned');
  });
});

describe('§AY consultationWorkload maps consultationMode', () => {
  it('solo/undefined → general_consultation (Mini); compatibility → compatibility (Terra)', () => {
    expect(resolveModelRoute(consultationWorkload('solo')).modelId).toBe('gpt-5-mini');
    expect(resolveModelRoute(consultationWorkload(undefined)).modelId).toBe('gpt-5-mini');
    expect(resolveModelRoute(consultationWorkload('compatibility')).modelId).toBe('gpt-5.6-terra');
  });
});

describe('§G the Edge routes through the server router (client cannot choose the model)', () => {
  const edge = readFileSync(resolve(__dirname, '../../../../../supabase/functions/chat/index.ts'), 'utf8');
  it('the consultation model comes from resolveModelRoute, stamped into audit + cost logs', () => {
    expect(edge).toContain('resolveModelRoute(');
    expect(edge).toContain('const routedModel = modelRoute.modelId');
    expect(edge).toContain('model: routedModel'); // consultationCfg + logs use the routed model
    expect(edge).toContain('modelId: routedModel'); // stamped into decisionMeta audit
    // the Edge never reads a client-supplied model id.
    expect(edge).not.toMatch(/body\.model\b/);
  });
});

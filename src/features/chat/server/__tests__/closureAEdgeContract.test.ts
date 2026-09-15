import { readFileSync } from 'fs';
import { resolve } from 'path';

const EDGE = readFileSync(resolve(process.cwd(), 'supabase/functions/chat/index.ts'), 'utf8');
const TODAY = readFileSync(resolve(process.cwd(), 'src/features/today/services/todayFortuneService.ts'), 'utf8');
const MONTHLY = readFileSync(resolve(process.cwd(), 'src/features/monthly/services/monthlyFortuneService.ts'), 'utf8');

describe('Closure A Edge/client authority contract', () => {
  it('resolves server consent + canonical SELF before every paid branch', () => {
    const authority = EDGE.indexOf('const authority = await resolveConsumerAuthority');
    expect(authority).toBeGreaterThan(0);
    for (const branch of [
      "if (body.kind === 'today_fortune')",
      "if (body.kind === 'monthly_fortune')",
      "if (body.mode === 'summary')",
      'const paid = await acquirePaidRequest',
    ]) expect(EDGE.indexOf(branch)).toBeGreaterThan(authority);
  });

  it('never accepts client SELF birth/profile authority in the paid builders', () => {
    expect(EDGE).not.toContain('birthInput: body.birthInput');
    expect(EDGE).not.toContain('subjectProfileId: body.subjectProfileId');
    expect(EDGE).toContain('birthInput: authority.birthInfo');
  });

  it('uses canonical generation and atomic paid-request gates', () => {
    expect(EDGE.match(/runCanonicalGeneration\(\{/g)).toHaveLength(2);
    expect(EDGE).toContain("admin.rpc('reserve_paid_work'");
    expect(EDGE).toContain("admin.rpc('acquire_paid_request'");
    expect(EDGE).toContain("admin.rpc('complete_paid_request'");
    expect(EDGE).toContain('reserveGlobalPaidGeneration');
  });

  it('official Today/Monthly clients neither claim nor persist nor send SELF birth', () => {
    for (const source of [TODAY, MONTHLY]) {
      expect(source).not.toContain('fortune_generation_claims');
      expect(source).not.toContain('.upsert(');
      expect(source).not.toMatch(/body:\s*\{[^}]*birthInput/);
    }
  });

  // G6 FINAL — a Supabase query FAILURE returns `{data: null, error}`; it does not throw. Discarding `error`
  // made a real backend error indistinguishable from "no prior decision exists" (both fell into the `!row` /
  // NONE branch), so a dependent follow-up over a genuine query error silently started a fresh, unrelated
  // reading instead of failing closed. `error` must be destructured and checked BEFORE the `!row` fallback.
  it('the prior-decision loader treats a Supabase query error as LOAD_FAILED, not NONE', () => {
    const loader = EDGE.slice(
      EDGE.indexOf('const loadPreviousDecision ='),
      EDGE.indexOf('// solo path is unchanged'),
    );
    expect(loader).toContain('const { data: dec, error }');
    const errorCheck = loader.indexOf('if (error) return');
    const noneCheck = loader.indexOf("if (!row) return { status: 'NONE' }");
    expect(errorCheck).toBeGreaterThan(0);
    expect(noneCheck).toBeGreaterThan(0);
    // The error check must run BEFORE the NONE fallback, or a real error still falls through to NONE first.
    expect(errorCheck).toBeLessThan(noneCheck);
    expect(loader.slice(errorCheck, errorCheck + 50)).toContain("status: 'LOAD_FAILED'");
  });
});

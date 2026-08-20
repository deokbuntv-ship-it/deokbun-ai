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
  });

  it('official Today/Monthly clients neither claim nor persist nor send SELF birth', () => {
    for (const source of [TODAY, MONTHLY]) {
      expect(source).not.toContain('fortune_generation_claims');
      expect(source).not.toContain('.upsert(');
      expect(source).not.toMatch(/body:\s*\{[^}]*birthInput/);
    }
  });
});

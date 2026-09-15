// Sprint J4 §4.13 — structural guards: email operations never send from the client, and the default provider is
// the noop (a real send requires an OWNER-injected provider). Source-scans the real tree so a regression fails CI.
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '../../../..'); // .../src
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');

describe('email ops never send from the client (§4.13)', () => {
  it('the admin console goes through the service, never a raw send / functions.invoke', () => {
    const screen = read('app/admin/fortune-mail/index.tsx');
    expect(screen).toMatch(/adminEmailCampaignService/);
    expect(screen).not.toMatch(/functions\.invoke/);
    expect(screen).not.toMatch(/getSupabaseClient/); // no direct DB from the screen
  });
  it('default email provider is the noop until an owner injects a real one', () => {
    const prov = read('features/fortune/email/emailProvider.ts');
    expect(prov).toMatch(/return noopEmailProvider/);
    expect(prov).toMatch(/isConfigured\(\)\s*\{\s*return false/);
  });
  it('the admin service only calls email-campaign RPCs (no direct table mutation)', () => {
    const svc = read('features/admin/services/adminEmailCampaignService.ts');
    expect(svc).not.toMatch(/\.from\(/);       // no direct table access
    expect(svc).toMatch(/\.rpc\(/);            // uses RPCs
  });
});

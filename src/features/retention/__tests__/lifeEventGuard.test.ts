// The single most important retention safety contract (§8.1): a life event is NEVER persisted without explicit
// confirmation. Both refusal paths short-circuit BEFORE any DB call, so this runs without a Supabase mock.
import { lifeEventService } from '@/features/retention/services/lifeEventService';

describe('lifeEventService.create — confirmation required (§8.1)', () => {
  it('refuses to persist an UNCONFIRMED event (returns null, no DB call)', async () => {
    const r = await lifeEventService.create({
      title: '이사', eventType: 'MOVE', eventDate: '2026-09-20', confirmed: false,
    });
    expect(r).toBeNull();
  });

  it('refuses an empty title even when confirmed', async () => {
    const r = await lifeEventService.create({
      title: '   ', eventType: 'OTHER', eventDate: '2026-09-20', confirmed: true,
    });
    expect(r).toBeNull();
  });
});

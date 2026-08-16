// SAJU → EngineEvidence → Grounding production-path E2E (sprint §15/§16). Runs the REAL frozen
// engine + Myungri facts + adapter through buildConsultationGrounding (no LLM). A node digest
// provider is injected (no expo-crypto); the timezone resolver + solar-term runtime are the real
// production ones. Golden: solar 2024-01-03 = lunar 2023-11-22 → 癸卯/甲子/丙寅, identical evidence.
import { createHash } from 'crypto';

import type { ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { renderGroundingContext } from '@/features/chat/prompts/grounding';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 5, 1) / 1000); // fixed → deterministic 세운/월운

type BirthOver = Record<string, unknown>;
const draft = (over: BirthOver = {}): ConsultationDraft =>
  ({
    subject: { id: 's1', displayName: '테스트', relationship: null },
    birthInfo: {
      displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
      birthYear: '2024', birthMonth: '1', birthDay: '3',
      birthTimeAccuracy: 'exact', birthHour: '12', birthMinute: '0',
      approximateTimePeriod: null, birthPlace: '서울',
      ...over,
    },
  }) as unknown as ConsultationDraft;

const build = (d: ConsultationDraft) => buildConsultationGrounding(d, { digestProvider, nowEpochSeconds: NOW });

describe('SAJU grounding — golden E2E (2024-01-03)', () => {
  it('produces AVAILABLE grounding with 癸卯/甲子/丙寅 facts; ziwei/qimen not connected', async () => {
    const g = await build(draft());
    expect(g.status).toBe('available');
    if (g.status !== 'available') return;
    const m = g.evidence.myungri;
    expect(m.availability).toBe('available');
    expect(m.summary).toContain('癸卯'); // 년주 (立春-based → prev year)
    expect(m.summary).toContain('甲子'); // 월주 (子월)
    expect(m.summary).toContain('丙寅'); // 일주
    expect(m.detail).toContain('근거·한계'); // provenance section survives (§5)
    expect(m.detail).toContain('START_OF_SPRING_IPCHUN');
    expect(m.detail).toContain('통근');
    expect(m.detail).toContain('투간'); // FIX #2 — transparency no longer discarded
    expect(m.sections?.some((s) => s.label === '투간')).toBe(true);
    expect(m.hasTimingEvidence).toBe(true); // Daewoon/Sewoon/Wolwoon present
    expect(g.evidence.ziwei.availability).toBe('engine_not_connected');
    expect(g.evidence.qimen.availability).toBe('engine_not_connected');
    expect(g.engineVersion).toBeTruthy();
  });

  it('solar 2024-01-03 and lunar 2023-11-22 yield IDENTICAL deterministic evidence', async () => {
    const solar = await build(draft());
    const lunar = await build(
      draft({ calendarType: 'lunar', birthYear: '2023', birthMonth: '11', birthDay: '22' }),
    );
    expect(solar.status).toBe('available');
    expect(lunar.status).toBe('available');
    if (solar.status !== 'available' || lunar.status !== 'available') return;
    expect(lunar.evidence.myungri.summary).toBe(solar.evidence.myungri.summary);
    expect(lunar.evidence.myungri.detail).toBe(solar.evidence.myungri.detail);
  });

  it('grounding renders into the prompt context with the 명리 facts (PromptBuilder consumes it)', async () => {
    const g = await build(draft());
    const ctx = renderGroundingContext(g);
    expect(ctx).toContain('【계산 근거】');
    expect(ctx).toContain('명리');
    expect(ctx).toContain('癸卯');
    expect(ctx).not.toContain('아직 연결되지'); // NOT the unavailable fail-closed text
  });

  it('time-unknown (non-boundary date) stays AVAILABLE with 시 미상 (year/month/day verified)', async () => {
    const g = await build(draft({ birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null }));
    expect(g.status).toBe('available');
    if (g.status !== 'available') return;
    expect(g.evidence.myungri.summary).toContain('미상'); // 시주 미상
    expect(g.evidence.myungri.detail).toContain('시주 미상');
    expect(g.evidence.myungri.summary).toContain('癸卯');
  });
});

describe('SAJU grounding — fail-closed (§16): no fabricated evidence', () => {
  it('unsupported date (2051) → grounding UNAVAILABLE', async () => {
    const g = await build(draft({ birthYear: '2051' }));
    expect(g.status).toBe('unavailable');
  });

  // (Same-UTC-minute boundary ties are proven at the resolver level in sajuBoundaryFix.test.ts
  //  FIX 1 with the exact term epoch; here we cover the path-level ambiguity via a boundary DATE.)
  it('unknown time on a boundary date (立春 2024-02-04) → UNAVAILABLE (no fabricated pillar)', async () => {
    const g = await build(
      draft({ birthMonth: '2', birthDay: '4', birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null }),
    );
    expect(g.status).toBe('unavailable');
  });

  it('missing subject/birth → UNAVAILABLE (never fabricates)', async () => {
    const g = await buildConsultationGrounding(
      { subject: null, birthInfo: null } as unknown as ConsultationDraft,
      { digestProvider, nowEpochSeconds: NOW },
    );
    expect(g.status).toBe('unavailable');
  });
});

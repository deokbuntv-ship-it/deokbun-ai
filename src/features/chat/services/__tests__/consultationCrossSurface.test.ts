// CROSS-SURFACE FACT PARITY (Consultation V1 Finalization — Phase A §4/§22, Phase C §22). For the SAME
// subject + SAME evaluation instant, 상담·오늘·월별 must agree on the shared DETERMINISTIC facts (four
// pillars, five-element composition, active 대운, current 세운) — the products may INTERPRET them
// differently, but the FACTS must not differ. This runs the REAL frozen engine (node digest) and compares
// each product path against the canonical shared calculators directly, so a future surface that forks its
// own resolver (birthday/year-only/legacy) would break this test.
import { createHash } from 'crypto';

import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import {
  ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  LUNAR_JS_SOLAR_TERM_ADAPTER,
  calculateSajuDaewoon,
  executeSajuFromBirthInput,
  type DigestProvider,
} from '@/features/interpretation';
import {
  calculateSewoonForInstant,
  natalContextFromFourPillars,
  resolveActiveDaewoonAtInstant,
} from '@/features/myungri';
import { toSajuEngineInput } from '@/features/manse/services/birthInputMapper';
import { buildTodayFortuneEvidence } from '@/features/today/engine/todayEvidence';
import { buildMonthlyFortuneEvidence } from '@/features/monthly/engine/monthlyEvidence';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';

const digestProvider: DigestProvider = {
  async sha256Utf8(input: string): Promise<string> {
    return createHash('sha256').update(input, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 5, 15) / 1000); // mid-June 2026 (current month → monthly temporal present)
const birthInfo = {
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1988', birthMonth: '9', birthDay: '20',
  birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0',
  approximateTimePeriod: null, birthPlace: '서울',
} as unknown as BirthInfoDraft;

// Canonical shared facts computed directly from the frozen calculators the three surfaces all consume.
async function canonicalFacts() {
  const execution = await executeSajuFromBirthInput(toSajuEngineInput(birthInfo), {
    digestProvider,
    historicalTimezoneResolver: ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  });
  if (!execution.success || execution.engineResult.status === 'UNAVAILABLE') throw new Error('engine unavailable');
  const out = execution.engineResult.output;
  const natal = natalContextFromFourPillars(out.fourPillars);
  const daewoon = calculateSajuDaewoon(
    { normalizedBirth: execution.normalizedBirth, yearPillar: out.fourPillars.year, monthPillar: out.fourPillars.month },
    LUNAR_JS_SOLAR_TERM_ADAPTER,
  );
  const active = await resolveActiveDaewoonAtInstant(daewoon, NOW, ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER);
  const sewoon = calculateSewoonForInstant({ natal, instantEpochSeconds: NOW });
  return {
    elementCounts: out.fiveElementDistribution.direct.counts,
    activeOrdinal: active?.ordinal ?? null,
    sewoonYear: sewoon.capability === 'AVAILABLE' ? sewoon.targetYear : null,
  };
}

describe('cross-surface deterministic fact parity (상담·오늘·월별, same subject + instant)', () => {
  it('오늘 and 월별 expose the SAME active 대운 + 세운 + 오행 as the canonical shared calculators', async () => {
    const c = await canonicalFacts();
    const today = await buildTodayFortuneEvidence({ birthInfo, nowEpochSeconds: NOW }, { digestProvider });
    const monthly = await buildMonthlyFortuneEvidence({ birthInfo }, { digestProvider, nowEpochSeconds: NOW });
    if (!today.available || !monthly.available) throw new Error('expected available');

    expect(c.activeOrdinal).not.toBeNull();
    expect(today.temporal!.activeDaewoon!.ordinal).toBe(c.activeOrdinal); // unified symbolic resolver
    expect(monthly.temporal!.activeDaewoon!.ordinal).toBe(c.activeOrdinal);

    expect(today.temporal!.sewoon!.targetYear).toBe(c.sewoonYear);
    expect(monthly.temporal!.sewoon!.targetYear).toBe(c.sewoonYear);

    expect(today.temporal!.elementCounts).toEqual(c.elementCounts);
    expect(monthly.temporal!.elementCounts).toEqual(c.elementCounts);
  });

  it('상담 grounding exposes the SAME 세운 year anchor as the canonical calculators (no forked resolver)', async () => {
    const c = await canonicalFacts();
    const draft: ConsultationDraft = {
      subject: { id: 'self', displayName: '테스트', relationship: null },
      birthInfo,
    };
    const grounding = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '올해 흐름 어때?');
    expect(grounding.status).toBe('available');
    if (grounding.status !== 'available') return;
    // The consultation myungri evidence renders facts as prompt text; its timingAnchors.referenceYear IS the
    // saju 세운 target year — the one structured shared fact directly comparable across surfaces.
    expect(grounding.evidence.myungri.timingAnchors?.referenceYear).toBe(c.sewoonYear);
    // Active 대운 is selected by the SHARED resolver (asserted at the function level above + audited in
    // consultationGrounding); the daewoon age span must at least be present when a chart with a birth time exists.
    expect(grounding.evidence.myungri.hasTimingEvidence).toBe(true);
  });
});

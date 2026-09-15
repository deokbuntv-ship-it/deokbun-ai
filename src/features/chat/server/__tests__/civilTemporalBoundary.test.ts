// Sprint E.1 §8/§9 — relative periods (올해/내년/이번 달/다음 달) resolve from the KST CIVIL calendar, NOT the
// 立春-based 세운 year. Boundary cases around New Year + 立春 prove the civil target AND that the grounding
// grounds the corresponding engine evidence (targetPolarities keyed to the resolved period).
import { createHash } from 'crypto';

import { deriveAnswerPlan } from '@/features/chat/server/answerPlan';
import { buildResolvedTemporalContext } from '@/features/chat/server/resolvedTemporalContext';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

const digestProvider: DigestProvider = { async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
const birth: BirthInfoDraft = { displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null, birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울' };
const draft = { subject: { id: 'self', displayName: '본인', relationship: null }, birthInfo: birth };
// KST instant (UTC+9) → epoch seconds.
const kst = (y: number, m: number, d: number, h = 12) => Math.floor(Date.UTC(y, m - 1, d, h - 9, 0, 0) / 1000);
const build = (now: number, q: string) => buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: now }, q);
const targetsFor = (g: ConsultationGrounding, now: number, q: string) => buildResolvedTemporalContext(q, now, g).resolvedTargets;
const yearPolarityKeys = (g: ConsultationGrounding) => (g.status === 'available' ? (g.targetPolarities ?? []).filter((t) => t.granularity === 'YEAR').map((t) => t.targetKey) : []);
const monthPolarityKeys = (g: ConsultationGrounding) => (g.status === 'available' ? (g.targetPolarities ?? []).filter((t) => t.granularity === 'MONTH').map((t) => t.targetKey) : []);

beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

describe('§9 civil year — before 立春 (Jan) the civil year drives 올해/내년', () => {
  const NOW = kst(2027, 1, 1); // 2027-01-01 KST — BEFORE 立春 (~Feb 4). Saju 세운 is still 2026.

  it('grounding carries the CIVIL reference year/month', async () => {
    const g = await build(NOW, '올해 사업운 어때?');
    if (g.status !== 'available') throw new Error('grounded');
    expect(g.referenceYear).toBe(2027); // civil, NOT 2026 (saju)
    expect(g.referenceMonth).toBe(1);
  });

  it('gate C: "내년" → 2028 (grounded), not 2027', async () => {
    const g = await build(NOW, '내년 사업운 어때?');
    expect(targetsFor(g, NOW, '내년 사업운 어때?')).toContain(2028);
    expect(yearPolarityKeys(g)).toContain(2028); // engine evidence grounded for the resolved civil target
    expect(deriveAnswerPlan('내년 사업운 어때?', g).polarity).toBeDefined();
  });

  it('"올해" → 2027 (grounded)', async () => {
    const g = await build(NOW, '올해 사업운 어때?');
    expect(targetsFor(g, NOW, '올해 사업운 어때?')).toContain(2027);
    expect(yearPolarityKeys(g)).toContain(2027);
  });

  it('gate D: "이번 달" → 2027-01 (grounded)', async () => {
    const g = await build(NOW, '이번 달 직업운 어때?');
    expect(targetsFor(g, NOW, '이번 달 직업운 어때?')).toContain(202701);
    expect(monthPolarityKeys(g)).toContain(202701);
    expect(deriveAnswerPlan('이번 달 직업운 어때?', g).polarity).toBeDefined();
  });

  it('"다음 달" → 2027-02 (grounded, rollover from Jan)', async () => {
    const g = await build(NOW, '다음 달은 어때?');
    expect(targetsFor(g, NOW, '다음 달은 어때?')).toContain(202702);
    expect(monthPolarityKeys(g)).toContain(202702);
  });
});

describe('§9 December → January rollover for 다음 달', () => {
  const DEC = kst(2026, 12, 20); // 2026-12-20 KST
  it('"다음 달" in December → 2027-01', async () => {
    const g = await build(DEC, '다음 달은 어때?');
    expect(g.status === 'available' && g.referenceMonth).toBe(12);
    expect(targetsFor(g, DEC, '다음 달은 어때?')).toContain(202701);
    expect(monthPolarityKeys(g)).toContain(202701);
  });
});

describe('§9 around 立春 the CIVIL year is stable (Jan 31 vs Feb 1)', () => {
  it('Jan 31 (pre-立春) "올해" → 2027; Feb 1 also → 2027 — civil year unchanged across 立春', async () => {
    const jan = kst(2027, 1, 31);
    const feb = kst(2027, 2, 1);
    const gJan = await build(jan, '올해 재물운 어때?');
    const gFeb = await build(feb, '올해 재물운 어때?');
    expect(gJan.status === 'available' && gJan.referenceYear).toBe(2027);
    expect(gFeb.status === 'available' && gFeb.referenceYear).toBe(2027);
    expect(targetsFor(gJan, jan, '올해 재물운 어때?')).toContain(2027);
    expect(targetsFor(gFeb, feb, '올해 재물운 어때?')).toContain(2027);
  });
});

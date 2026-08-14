// Sprint 3B — funnel aggregation + metrics (CAC/CPA/conversion/retention). Pure.
import { computeAdPerformance, costPer, formatKrw, formatRate, rate } from '../adMetrics';
import {
  computeAdFunnelCounts,
  computeOverviewTotals,
  type AdClick,
  type AttributedUser,
} from '../funnel';
import { DAY_MS, isRetainedAtDay } from '../retention';
import type { AdListItem } from '../types';

const ad = (over: Partial<AdListItem> = {}): AdListItem => ({
  id: 'ad1',
  publicTrackingCode: 'ad_2345678a',
  adType: 'youtube_shorts',
  publisherNickname: '덕분TV',
  startDate: '2026-08-14',
  contractType: 'experience_group',
  costKrw: 100000,
  status: 'active',
  ...over,
});

const SIGNUP = '2026-08-01T00:00:00Z';
const signupMs = Date.parse(SIGNUP);

describe('retention window (§27/§29)', () => {
  it('retained at DN iff activity is >= signup + N days; monotonic', () => {
    const act = [new Date(signupMs + 8 * DAY_MS).toISOString()]; // day-8 activity
    expect(isRetainedAtDay(SIGNUP, act, 1)).toBe(true);
    expect(isRetainedAtDay(SIGNUP, act, 7)).toBe(true);
    expect(isRetainedAtDay(SIGNUP, act, 30)).toBe(false);
  });
  it('no signup anchor → not retained (never fabricated true)', () => {
    expect(isRetainedAtDay(null, [SIGNUP], 1)).toBe(false);
  });
});

describe('funnel aggregation (§16/§18/§22)', () => {
  const users: AttributedUser[] = [
    {
      adId: 'ad1', userId: 'u1', signupAt: SIGNUP, birthInfoAt: SIGNUP,
      firstConsultationAt: SIGNUP,
      activityTimestamps: [new Date(signupMs + 2 * DAY_MS).toISOString()],
    },
    {
      adId: 'ad1', userId: 'u2', signupAt: SIGNUP, birthInfoAt: SIGNUP,
      firstConsultationAt: null, activityTimestamps: [],
    },
    { adId: 'ad2', userId: 'u3', signupAt: SIGNUP, birthInfoAt: null, firstConsultationAt: null, activityTimestamps: [] },
  ];
  const clicks: AdClick[] = [
    { adId: 'ad1', visitorId: 'v1' },
    { adId: 'ad1', visitorId: 'v1' }, // repeat visitor
    { adId: 'ad1', visitorId: 'v2' },
  ];

  it('counts clicks, unique visitors, and milestone completions per ad', () => {
    const c = computeAdFunnelCounts('ad1', clicks, users);
    expect(c.clicks).toBe(3);
    expect(c.uniqueVisitors).toBe(2);
    expect(c.birthInfoCompleted).toBe(2);
    expect(c.signups).toBe(2);
    expect(c.firstConsultations).toBe(1);
    expect(c.d1).toBe(1); // u1 active day-2
    expect(c.d7).toBe(0);
  });
  it('uniqueVisitors is NULL when no reliable visitor id exists (§18 — never fabricated)', () => {
    const c = computeAdFunnelCounts('ad1', [{ adId: 'ad1', visitorId: null }], users);
    expect(c.uniqueVisitors).toBeNull();
    expect(c.clicks).toBe(1);
  });
});

describe('metrics — CAC/CPA/conversion, truthful nulls (§32/§33/§34/§35)', () => {
  const counts = computeAdFunnelCounts(
    'ad1',
    [{ adId: 'ad1', visitorId: 'v1' }, { adId: 'ad1', visitorId: 'v2' }, { adId: 'ad1', visitorId: 'v3' }, { adId: 'ad1', visitorId: 'v4' }],
    [
      { adId: 'ad1', userId: 'u1', signupAt: SIGNUP, birthInfoAt: SIGNUP, firstConsultationAt: SIGNUP, activityTimestamps: [] },
      { adId: 'ad1', userId: 'u2', signupAt: SIGNUP, birthInfoAt: SIGNUP, firstConsultationAt: null, activityTimestamps: [] },
    ],
  );

  it('conversion rate is null (→ —) when the denominator is 0, never 0%', () => {
    expect(rate(0, 0)).toBeNull();
    expect(formatRate(rate(0, 0))).toBe('—');
    expect(rate(2, 4)).toBeCloseTo(0.5);
  });
  it('CAC = 광고비 / 가입자, CPA = 광고비 / 첫상담자 — distinct (§34)', () => {
    const perf = computeAdPerformance(ad({ costKrw: 100000 }), counts); // 2 signups, 1 first-consult
    expect(perf.signupCac).toBe(50000);
    expect(perf.firstConsultCpa).toBe(100000);
    expect(perf.signupCac).not.toBe(perf.firstConsultCpa);
  });
  it('missing cost → CAC/CPA null (→ —), NEVER 0원 (§35)', () => {
    const perf = computeAdPerformance(ad({ costKrw: null }), counts);
    expect(perf.signupCac).toBeNull();
    expect(perf.firstConsultCpa).toBeNull();
    expect(formatKrw(perf.signupCac)).toBe('—');
    expect(costPer(null, 5)).toBeNull();
    expect(costPer(100000, 0)).toBeNull();
  });
  it('formatKrw formats known costs in ko-KR won', () => {
    expect(formatKrw(100000)).toBe('100,000원');
  });
});

describe('overview totals (§36) — cost null when no ad has a cost', () => {
  it('sums counts; avg CAC/CPA null when total cost unknown', () => {
    const rows = [
      { counts: computeAdFunnelCounts('a', [{ adId: 'a', visitorId: 'v' }], [{ adId: 'a', userId: 'u', signupAt: SIGNUP, birthInfoAt: SIGNUP, firstConsultationAt: SIGNUP, activityTimestamps: [] }]), costKrw: null },
    ];
    const t = computeOverviewTotals(rows);
    expect(t.totalClicks).toBe(1);
    expect(t.totalSignups).toBe(1);
    expect(t.totalCostKrw).toBeNull();
    expect(t.avgSignupCac).toBeNull();
  });
  it('avg CAC computed when at least one cost is known', () => {
    const rows = [
      { counts: computeAdFunnelCounts('a', [], [{ adId: 'a', userId: 'u', signupAt: SIGNUP, birthInfoAt: SIGNUP, firstConsultationAt: SIGNUP, activityTimestamps: [] }]), costKrw: 100000 },
    ];
    const t = computeOverviewTotals(rows);
    expect(t.totalCostKrw).toBe(100000);
    expect(t.avgSignupCac).toBe(100000);
  });
});

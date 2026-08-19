// MONTHLY QUALITY SET (§77-§86). Deterministic, schema-level quality contract — NOT a prose snapshot. It
// (a) locks the representative month-type → (tier, mode) matrix, and (b) runs a quality evaluator with a
// failure taxonomy over good/bad outputs so genericness / repetition / event guarantees / unsupported exact
// dates can never silently regress. No LLM, no network.
import { containsRawGanji } from '@/features/chat/presentation/commercialText';
import { containsEventGuarantee, containsUnsupportedDatePrecision, parseMonthlyFortune } from '@/features/monthly/server/buildMonthlyFortune';
import { deriveMonthlyPlan, type MonthlyPrimaryMode } from '@/features/monthly/engine/monthlyPlan';
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';
import type { MonthlyFortuneEvidence } from '@/features/monthly/engine/monthlyEvidence';
import type { MonthlyFortuneResult } from '@/features/monthly/types';

function ev(opts: { harmonies?: number; frictions?: number; stemTenGod?: TenGod; branchTenGod?: TenGod }): MonthlyFortuneEvidence {
  const branch = [
    ...Array.from({ length: opts.harmonies ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_SIX_COMBINATION' } })),
    ...Array.from({ length: opts.frictions ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_CLASH' } })),
  ];
  return {
    available: true, year: 2026, month: 8, timezone: 'Asia/Seoul',
    monthStemTenGod: opts.stemTenGod ?? 'DIRECT_WEALTH',
    monthBranchTenGod: opts.branchTenGod ?? 'DIRECT_OFFICER',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    monthRelationsToNatal: { stem: [], branch: branch as any },
    sewoonAvailable: true,
    supportedDomains: ['overall', 'work', 'wealth', 'relationship', 'action'],
    evidenceVersion: 'monthly-evidence@1.0.0',
  } as MonthlyFortuneEvidence;
}

const GENERIC = /긍정적인?\s*마음|좋은\s*기운을?\s*활용|균형을?\s*유지|신중한?\s*판단이?\s*필요/;
const ACTION = /정리|점검|조율|교섭|협의|실행|추진|미루|확인|우선|먼저|자제|살피|마무리|속도|관리|준비|비교/;
const CAT: { key: string; re: RegExp }[] = [
  { key: 'ORGANIZE', re: /정리|점검|마무리|재점검|정돈/ },
  { key: 'RELATION', re: /관계|사람|소통|대화|경청/ },
  { key: 'MONEY', re: /지출|비용|예산|투자|자금|씀씀이/ },
];
function categoryOf(text: string): string | null {
  for (const c of CAT) if (c.re.test(text)) return c.key;
  return null;
}

function evaluateMonthlyQuality(r: MonthlyFortuneResult): string[] {
  const flags: string[] = [];
  const verdict = r.verdict ?? '';
  const surfaced = [r.headline, verdict, r.overallSummary, ...r.opportunities.flatMap((o) => [o.title, o.body]), ...r.cautions.flatMap((c) => [c.title, c.body]), ...r.actions].join(' ');
  if (verdict.trim().length === 0) flags.push('NO_VERDICT');
  if (GENERIC.test(verdict) && !ACTION.test(verdict)) flags.push('GENERIC_VERDICT');
  if (r.actions.length === 0) flags.push('NO_ACTION');
  const seen = new Set<string>();
  for (const o of r.opportunities) {
    const c = categoryOf(`${o.title} ${o.body}`);
    if (c && seen.has(c)) flags.push('DUPLICATE_SIGNAL');
    if (c) seen.add(c);
  }
  if ((r.followUps ?? []).some((f) => f.displayLabel.length > 20)) flags.push('FOLLOWUP_TOO_LONG');
  if (containsRawGanji(surfaced)) flags.push('RAW_TERMINOLOGY');
  if (containsEventGuarantee(surfaced)) flags.push('EVENT_GUARANTEE');
  if (containsUnsupportedDatePrecision(surfaced)) flags.push('UNSUPPORTED_DATE_PRECISION');
  return flags;
}

const PLAN = {
  year: 2026, month: 8, available: true, overallTier: '변화가 많은 달',
  primaryMode: 'ADJUST', primaryModeLabel: '조정·조율', strongestDomain: 'work', cautionDomain: 'relationship',
  domainSignals: [{ domain: 'work', status: '무난' }], supportedDomains: ['overall', 'work', 'wealth', 'relationship', 'action'],
  harmonyCount: 2, frictionCount: 1, maxOpportunities: 3, maxCautions: 2, maxActions: 3,
  forbidEventCertainty: true, forbidExactDates: true, evidenceVersion: 'monthly-evidence@1.0.0', planVersion: 'monthly-plan@1.0.0',
} as never;

describe('Monthly quality — representative month types map to a clear (tier, mode) (§85/§86)', () => {
  const cases: { name: string; ev: Parameters<typeof ev>[0]; tier: string; mode: MonthlyPrimaryMode }[] = [
    { name: 'strong supportive (work)', ev: { harmonies: 2, frictions: 0, stemTenGod: 'DIRECT_OFFICER' }, tier: '기회를 살리기 좋은 달', mode: 'EXPAND' },
    { name: 'strong friction', ev: { harmonies: 0, frictions: 2, stemTenGod: 'DIRECT_WEALTH', branchTenGod: 'SEVEN_KILLINGS' }, tier: '속도를 조절할 달', mode: 'STABILIZE' },
    { name: 'mixed', ev: { harmonies: 2, frictions: 1, stemTenGod: 'DIRECT_WEALTH' }, tier: '변화가 많은 달', mode: 'ADJUST' },
    { name: 'neutral', ev: { harmonies: 0, frictions: 0, stemTenGod: 'DIRECT_WEALTH' }, tier: '안정적으로 운영할 달', mode: 'MANAGE' },
    { name: 'wealth emphasis', ev: { harmonies: 1, frictions: 0, stemTenGod: 'INDIRECT_WEALTH' }, tier: '기회를 살리기 좋은 달', mode: 'MANAGE' },
    { name: 'relationship emphasis', ev: { harmonies: 1, frictions: 0, stemTenGod: 'PEER' }, tier: '기회를 살리기 좋은 달', mode: 'CONNECT' },
  ];
  it.each(cases)('$name → $tier / $mode', ({ ev: opts, tier, mode }) => {
    const p = deriveMonthlyPlan(ev(opts));
    expect(p.overallTier).toBe(tier);
    expect(p.primaryMode).toBe(mode);
  });
});

describe('Monthly quality — parsed output passes the quality contract', () => {
  it('a grounded, specific monthly response has ZERO quality flags', () => {
    const r = parseMonthlyFortune(JSON.stringify({
      headline: '벌이기보다 조건을 정리하고 준비를 마치는 달',
      verdict: '이번 달은 새 일을 크게 벌이기보다 조건을 정리하고 준비를 마치는 편이 유리합니다.',
      overallSummary: '움직임이 많지만 방향은 분명합니다.',
      opportunities: [
        { domain: '일·사업', title: '실행 준비', body: '진행 중인 일의 조건을 맞추면 성과로 이어집니다.' },
        { domain: '관계', title: '대화 준비', body: '중요한 대화는 자료를 준비해 진행하세요.' },
      ],
      cautions: [{ title: '지출 점검', body: '큰 지출은 비교 후 결정하세요.' }],
      actions: ['진행 중인 일의 조건을 다시 확인하기', '중요한 대화는 준비해서 진행하기', '큰 지출은 비교 후 결정하기'],
      followUps: [
        { displayLabel: '이번 달 일 흐름은?', question: '이번 달 일 흐름을 알려줘.' },
        { displayLabel: '이번 달 관계 주의점은?', question: '이번 달 관계에서 조심할 점을 알려줘.' },
        { displayLabel: '중요한 결정 시기는?', question: '이번 달 중요한 결정을 언제 내리면 좋을지 알려줘.' },
      ],
    }), PLAN);
    expect(r).not.toBeNull();
    expect(evaluateMonthlyQuality(r!)).toEqual([]);
  });

  it('flags a purely generic verdict with no concrete action', () => {
    const generic: MonthlyFortuneResult = {
      headline: '좋은 달', verdict: '긍정적인 마음을 가지세요. 좋은 기운을 활용하세요.', overallSummary: '균형을 유지하세요.',
      overallTier: '안정적으로 운영할 달', opportunities: [], cautions: [], actions: [], followUps: [],
    };
    const flags = evaluateMonthlyQuality(generic);
    expect(flags).toContain('GENERIC_VERDICT');
    expect(flags).toContain('NO_ACTION');
  });

  it('the parser rejects an event guarantee AND an unsupported exact-date before evaluation (§24/§37)', () => {
    expect(parseMonthlyFortune(JSON.stringify({ headline: '좋은 달', verdict: '좋습니다.', overallSummary: '점검하기 좋아요.', opportunities: [{ domain: '재물', title: '수입', body: '이번 달 계약이 성사됩니다.' }], cautions: [], actions: ['확인하기'], followUps: [] }), PLAN)).toBeNull();
    expect(parseMonthlyFortune(JSON.stringify({ headline: '좋은 달', verdict: '좋습니다.', overallSummary: '점검하기 좋아요.', opportunities: [], cautions: [], actions: ['셋째 주가 가장 좋으니 그때 계약하기'], followUps: [] }), PLAN)).toBeNull();
  });
});

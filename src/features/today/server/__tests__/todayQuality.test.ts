// TODAY QUALITY SET (§50-§56). A deterministic, schema-level quality contract — NOT a prose snapshot. It
// (a) locks the representative day-type → (tier, mode) matrix, and (b) runs a small quality evaluator with a
// failure taxonomy (§51) over good/bad model outputs so genericness / repetition / over-long chips / event
// guarantees can never silently regress. No LLM, no network.
import { containsRawGanji } from '@/features/chat/presentation/commercialText';
import { containsEventGuarantee, parseDailyFortune } from '@/features/today/server/buildTodayFortune';
import { deriveDailyPlan, type PrimaryMode } from '@/features/today/engine/todayPlan';
import type { TenGod } from '@/features/interpretation/saju/derived/contracts';
import type { TodayFortuneEvidence } from '@/features/today/engine/todayEvidence';
import type { DailyFortuneResult } from '@/features/today/types';

function ev(opts: { harmonies?: number; frictions?: number; stemTenGod?: TenGod; branchTenGod?: TenGod }): TodayFortuneEvidence {
  const branch = [
    ...Array.from({ length: opts.harmonies ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_SIX_COMBINATION' } })),
    ...Array.from({ length: opts.frictions ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_CLASH' } })),
  ];
  return {
    available: true, fortuneDate: '2026-08-19', timezone: 'Asia/Seoul',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dayLuck: { available: true, pillar: {} as any, tenGods: {} as any, relationsToNatal: { stem: [], branch: branch as any }, dayPillarRuleVersion: 'x' },
    dayStemTenGod: opts.stemTenGod ?? 'DIRECT_WEALTH',
    dayBranchTenGod: opts.branchTenGod ?? 'DIRECT_OFFICER',
    sewoonAvailable: true, wolwoonAvailable: true,
    supportedDomains: ['overall', 'work', 'wealth', 'relationship', 'action'],
    evidenceVersion: 'today-evidence@1.0.0',
  } as TodayFortuneEvidence;
}

// ── the quality evaluator (§51 taxonomy) ─────────────────────────────────────────────
const GENERIC = /긍정적으로 생각|좋은 하루 보내|균형이 필요|마음을 편(하게|히)|신중하게 판단하세요/;
const ACTION = /정리|점검|조율|교섭|협의|실행|추진|미루|확인|우선|먼저|자제|살피|마무리|속도|관리/;
const CAT: { key: string; re: RegExp }[] = [
  { key: 'RUSH', re: /서두르|성급|(?<!마)무리|급하게|급한|밀어붙이/ },
  { key: 'ORGANIZE', re: /정리|점검|마무리|재점검|정돈/ },
  { key: 'PACE', re: /속도|천천히|여유|리듬|쉬어|휴식/ },
];
function categoryOf(text: string): string | null {
  for (const c of CAT) if (c.re.test(text)) return c.key;
  return null;
}

function evaluateTodayQuality(r: DailyFortuneResult): string[] {
  const flags: string[] = [];
  const verdict = r.verdict ?? '';
  const surfaced = [r.headline, verdict, r.overallSummary, r.actionTip, ...r.highlights.flatMap((h) => [h.title, h.body]), ...r.cautions.flatMap((c) => [c.title, c.body])].join(' ');
  if (verdict.trim().length === 0) flags.push('NO_VERDICT');
  if (GENERIC.test(verdict) && !ACTION.test(verdict)) flags.push('GENERIC_VERDICT');
  if (!ACTION.test(`${verdict} ${r.actionTip}`)) flags.push('NO_ACTION');
  const seen = new Set<string>();
  for (const h of r.highlights) {
    const c = categoryOf(`${h.title} ${h.body}`);
    if (c && seen.has(c)) flags.push('DUPLICATE_SIGNAL');
    if (c) seen.add(c);
  }
  const followUps = r.followUps ?? [];
  if (followUps.length > 3) flags.push('TOO_MANY_FOLLOWUPS');
  if (followUps.some((f) => f.displayLabel.length > 20)) flags.push('FOLLOWUP_TOO_LONG');
  if (containsRawGanji(surfaced)) flags.push('RAW_TERMINOLOGY');
  if (containsEventGuarantee(surfaced)) flags.push('EVENT_GUARANTEE');
  return flags;
}

const PLAN = {
  fortuneDate: '2026-08-19', available: true, overallTone: '무난한 흐름',
  primaryMode: 'MANAGE', primaryModeLabel: '점검·관리', strongestDomain: 'wealth', cautionDomain: null,
  domainSignals: [{ domain: 'wealth', status: '무난' }], supportedDomains: ['overall', 'work', 'wealth', 'relationship', 'action'],
  harmonyCount: 0, frictionCount: 0, maxHighlights: 3, maxCautions: 2, forbidEventCertainty: true,
  evidenceVersion: 'today-evidence@1.0.0', planVersion: 'today-plan@1.1.0',
} as never;

describe('Today quality — representative day types map to a clear (tier, mode) (§55/§56)', () => {
  const cases: { name: string; ev: Parameters<typeof ev>[0]; tone: string; mode: PrimaryMode }[] = [
    { name: 'strong harmony (work)', ev: { harmonies: 2, frictions: 0, stemTenGod: 'DIRECT_OFFICER' }, tone: '좋은 흐름', mode: 'EXECUTE' },
    { name: 'strong friction', ev: { harmonies: 0, frictions: 2, stemTenGod: 'DIRECT_WEALTH', branchTenGod: 'SEVEN_KILLINGS' }, tone: '조심해서 움직일 날', mode: 'STABILIZE' },
    { name: 'mixed', ev: { harmonies: 2, frictions: 1, stemTenGod: 'DIRECT_WEALTH' }, tone: '변화가 많은 날', mode: 'ADJUST' },
    { name: 'neutral', ev: { harmonies: 0, frictions: 0, stemTenGod: 'DIRECT_WEALTH' }, tone: '무난한 흐름', mode: 'MANAGE' },
    { name: 'wealth-emphasized', ev: { harmonies: 1, frictions: 0, stemTenGod: 'INDIRECT_WEALTH' }, tone: '좋은 흐름', mode: 'MANAGE' },
    { name: 'relationship-emphasized', ev: { harmonies: 1, frictions: 0, stemTenGod: 'PEER' }, tone: '좋은 흐름', mode: 'CONNECT' },
  ];
  it.each(cases)('$name → $tone / $mode', ({ ev: opts, tone, mode }) => {
    const p = deriveDailyPlan(ev(opts));
    expect(p.overallTone).toBe(tone);
    expect(p.primaryMode).toBe(mode);
  });
});

describe('Today quality — parsed output passes the quality contract', () => {
  it('a grounded, specific model response has ZERO quality flags', () => {
    const r = parseDailyFortune(JSON.stringify({
      headline: '벌이기보다 정리에 힘이 실리는 날',
      verdict: '오늘은 새 일을 벌이기보다 진행 중인 일을 점검하고 조건을 맞추는 편이 더 유리합니다.',
      overallSummary: '큰 결정을 서두르기보다 이미 벌여둔 일을 살피기 좋은 하루입니다.',
      highlights: [
        { domain: '재물', title: '지출 비교', body: '씀씀이를 비교하는 데 유리합니다.' },
        { domain: '관계', title: '한 발 물러서기', body: '말을 아끼고 듣는 시간이 도움이 됩니다.' },
      ],
      cautions: [{ title: '성급한 확답 미루기', body: '한 번 더 확인하고 움직이세요.' }],
      actionTip: '오늘은 결정을 하루 미루고 조건을 확인해 보세요.',
      followUps: [
        { displayLabel: '오늘 재물 흐름은?', question: '오늘 재물 흐름을 사주 기준으로 알려줘.' },
        { displayLabel: '오늘 관계에서 조심할 점은?', question: '오늘 사람을 대할 때 조심할 점을 알려줘.' },
        { displayLabel: '오늘 먼저 할 일은?', question: '오늘 가장 먼저 처리할 일을 알려줘.' },
      ],
    }), PLAN);
    expect(r).not.toBeNull();
    expect(evaluateTodayQuality(r!)).toEqual([]);
  });

  it('flags a purely generic verdict with no concrete action', () => {
    const generic: DailyFortuneResult = {
      headline: '좋은 날', verdict: '긍정적으로 생각하세요. 좋은 하루 보내세요.', overallSummary: '균형이 필요합니다.',
      overallTone: '무난한 흐름', highlights: [], cautions: [], actionTip: '좋은 하루 보내세요.', followUps: [],
    };
    const flags = evaluateTodayQuality(generic);
    expect(flags).toContain('GENERIC_VERDICT');
    expect(flags).toContain('NO_ACTION');
  });

  it('the parser itself rejects an event guarantee before it can ever be evaluated (§54)', () => {
    const r = parseDailyFortune(JSON.stringify({
      headline: '좋은 날', verdict: '오늘은 좋은 흐름입니다.', overallSummary: '점검하기 좋아요 오늘은.', actionTip: '점검하세요.',
      highlights: [{ domain: '재물', title: '수입', body: '오늘 목돈이 들어옵니다.' }], cautions: [], followUps: [],
    }), PLAN);
    expect(r).toBeNull();
  });
});

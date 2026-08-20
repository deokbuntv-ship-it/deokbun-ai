// Sprint C.1 — TARGET-SCOPED polarity authority. Polarity is bound to the question's RESOLVED target
// (this year / that year / this month / …), never a global current-세운 guess. Gates A-G, J.
import { createHash } from 'crypto';

import { buildServerConsultation } from '@/features/chat/server';
import { deriveAnswerPlan } from '@/features/chat/server/answerPlan';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import { toSafeGrounding, type ConsultationGrounding, type TargetPolarity } from '@/features/chat/prompts/grounding';
import {
  serializeStructuredForPersistence,
  parsePersistedStructured,
} from '@/features/chat/presentation/persistStructured';
import { derivePolarity, type PolarityTier } from '@/features/polarity/polarityKernel';
import { deriveDailyPlan } from '@/features/today/engine/todayPlan';
import type { TodayFortuneEvidence } from '@/features/today/engine/todayEvidence';
import { deriveMonthlyPlan } from '@/features/monthly/engine/monthlyPlan';
import type { MonthlyFortuneEvidence } from '@/features/monthly/engine/monthlyEvidence';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';
import type { ServerConsultationDeps, ServerConsultationRequest } from '@/features/chat/server';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

const REF_YEAR = 2026;
// Build an AVAILABLE grounding with controlled per-target polarities. The plan needs each target grounded
// (present in timingAnchors), so year/month keys are mirrored into the anchors.
function gTargets(opts: {
  years?: Record<number, PolarityTier>;
  months?: Record<number, PolarityTier>;
  referenceMonth?: number;
}): ConsultationGrounding {
  const years = Object.keys(opts.years ?? {}).map(Number);
  const months = Object.keys(opts.months ?? {}).map(Number);
  const targetPolarities: TargetPolarity[] = [
    ...Object.entries(opts.years ?? {}).map(([y, p]) => ({ granularity: 'YEAR' as const, targetKey: Number(y), polarity: p })),
    ...Object.entries(opts.months ?? {}).map(([k, p]) => ({ granularity: 'MONTH' as const, targetKey: Number(k), polarity: p })),
  ];
  return {
    status: 'available',
    referenceMonth: opts.referenceMonth ?? 8,
    targetPolarities,
    evidence: {
      myungri: {
        availability: 'available', summary: '사주 명식 요약',
        sections: [{ label: '명식', lines: ['년 癸卯 · 일 丙寅'] }],
        hasTimingEvidence: true,
        timingAnchors: { years: years.length ? years : [REF_YEAR], referenceYear: REF_YEAR, ...(months.length ? { months } : {}) },
      },
      ziwei: { availability: 'engine_not_connected' as never },
      qimen: { availability: 'engine_not_connected' as never },
    },
  };
}

describe('deriveAnswerPlan — polarity bound to the RESOLVED target (gates A-G)', () => {
  // current=FAVORABLE, next=CAUTION, 2028=DYNAMIC — deliberately DIFFERENT so wrong-target selection fails.
  const g = gTargets({ years: { 2026: 'FAVORABLE', 2027: 'CAUTION', 2028: 'DYNAMIC' }, months: { 202608: 'STEADY', 202609: 'CAUTION' }, referenceMonth: 8 });

  it('A. 올해 → CURRENT-year polarity', () => {
    expect(deriveAnswerPlan('올해 재물운 어때?', g).polarity).toBe('FAVORABLE');
  });
  it('B. 내년 → NEXT-year polarity (NOT the current year)', () => {
    const p = deriveAnswerPlan('내년 재물운 어때?', g);
    expect(p.polarity).toBe('CAUTION'); // 2027, not 2026's FAVORABLE
  });
  it('C. explicit future year → THAT year', () => {
    expect(deriveAnswerPlan('2028년 재물운 어때?', g).polarity).toBe('DYNAMIC');
  });
  it('D. 이번 달 / 다음 달 → the SELECTED month evidence', () => {
    expect(deriveAnswerPlan('이번 달 직업운 어때?', g).polarity).toBe('STEADY'); // 202608
    expect(deriveAnswerPlan('다음 달은 어때?', g).polarity).toBe('CAUTION'); // 202609
  });
  it('E. natal / non-temporal → NO temporal polarity', () => {
    expect(deriveAnswerPlan('내 사주의 특징은?', g).polarity).toBeUndefined();
    expect(deriveAnswerPlan('나는 어떤 성향이야?', g).polarity).toBeUndefined();
  });
  it('F. 오늘 / day → NO falsely-attached year polarity', () => {
    expect(deriveAnswerPlan('오늘 재물운 어때?', g).polarity).toBeUndefined();
  });
  it('G. multi-candidate comparison/ranking → NO single global polarity', () => {
    expect(deriveAnswerPlan('올해와 내년 중 어디가 좋아?', g).polarity).toBeUndefined();
    expect(deriveAnswerPlan('앞으로 3년 중 언제가 제일 좋아?', g).polarity).toBeUndefined();
  });
});

describe('paraphrase stability — equivalent wording → SAME resolved target + polarity (§18)', () => {
  const g = gTargets({ years: { 2026: 'FAVORABLE', 2027: 'CAUTION' } });
  it('내년 사업운 어때? / 사업은 내년에 어떨까? / 내년 사업 괜찮아? → all resolve to next year (CAUTION)', () => {
    for (const q of ['내년 사업운 어때?', '사업은 내년에 어떨까?', '내년 사업 괜찮아?']) {
      const p = deriveAnswerPlan(q, g);
      expect(p.requestedGranularity).toBe('YEAR');
      expect(p.polarity).toBe('CAUTION'); // 2027, the same target for every phrasing
    }
  });
});

describe('mitigation activates ONLY from the correct target polarity (gate J / §15)', () => {
  it('current FAVORABLE + next CAUTION, asked about NEXT year → requireMitigation TRUE', () => {
    const g = gTargets({ years: { 2026: 'FAVORABLE', 2027: 'CAUTION' } });
    expect(deriveAnswerPlan('내년 재물운 어때?', g).requireMitigation).toBe(true);
  });
  it('current CAUTION + next FAVORABLE, asked about NEXT year → requireMitigation FALSE', () => {
    const g = gTargets({ years: { 2026: 'CAUTION', 2027: 'FAVORABLE' } });
    expect(deriveAnswerPlan('내년 재물운 어때?', g).requireMitigation).toBe(false);
  });
  it('natal question → no temporal mitigation even when a current-year CAUTION exists', () => {
    const g = gTargets({ years: { 2026: 'CAUTION' } });
    expect(deriveAnswerPlan('내 사주 특징은?', g).requireMitigation).toBe(false);
  });
  it('오늘 (day, unsupported) → no temporal mitigation', () => {
    const g = gTargets({ years: { 2026: 'CAUTION' } });
    expect(deriveAnswerPlan('오늘 재물운 어때?', g).requireMitigation).toBe(false);
  });
  it('DYNAMIC target → NOT mitigation', () => {
    const g = gTargets({ years: { 2026: 'DYNAMIC' } });
    expect(deriveAnswerPlan('올해 재물운 어때?', g).requireMitigation).toBe(false);
  });
});

describe('toSafeGrounding preserves the target-scoped fields, rejects bogus', () => {
  it('keeps valid referenceMonth + targetPolarities', () => {
    const safe = toSafeGrounding(gTargets({ years: { 2026: 'FAVORABLE' }, referenceMonth: 8 })) as {
      referenceMonth?: number; targetPolarities?: TargetPolarity[];
    };
    expect(safe.referenceMonth).toBe(8);
    expect(safe.targetPolarities?.[0]).toEqual({ granularity: 'YEAR', targetKey: 2026, polarity: 'FAVORABLE' });
  });
  it('rejects a bogus tier / bad month → fail-closed', () => {
    const badTier = { ...gTargets({}), targetPolarities: [{ granularity: 'YEAR', targetKey: 2026, polarity: 'GREAT' }] } as unknown as ConsultationGrounding;
    expect(toSafeGrounding(badTier).status).toBe('unavailable');
    const badMonth = { ...gTargets({}), referenceMonth: 13 } as unknown as ConsultationGrounding;
    expect(toSafeGrounding(badMonth).status).toBe('unavailable');
  });
});

// ── cross-surface (kernel): same relations → same tier across Today / Monthly / Consultation (§17) ──
type Rel = { stemH?: number; stemF?: number; branchH?: number; branchF?: number };
const rel = (o: Rel) => ({
  stem: [
    ...Array.from({ length: o.stemH ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'STEM_COMBINATION' } })),
    ...Array.from({ length: o.stemF ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'STEM_CLASH' } })),
  ],
  branch: [
    ...Array.from({ length: o.branchH ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_SIX_COMBINATION' } })),
    ...Array.from({ length: o.branchF ?? 0 }, () => ({ position: 'DAY', relation: { kind: 'BRANCH_CLASH' } })),
  ],
});
const TODAY_TIER: Record<string, PolarityTier> = { '좋은 흐름': 'FAVORABLE', '무난한 흐름': 'STEADY', '변화가 많은 날': 'DYNAMIC', '조심해서 움직일 날': 'CAUTION' };
const MONTHLY_TIER: Record<string, PolarityTier> = { '기회를 살리기 좋은 달': 'FAVORABLE', '안정적으로 운영할 달': 'STEADY', '변화가 많은 달': 'DYNAMIC', '속도를 조절할 달': 'CAUTION' };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tEv = (o: Rel): TodayFortuneEvidence => ({ available: true, fortuneDate: '2026-08-19', timezone: 'Asia/Seoul', dayLuck: { available: true, pillar: {} as any, tenGods: {} as any, relationsToNatal: rel(o) as any, dayPillarRuleVersion: 'x' }, dayStemTenGod: 'DIRECT_WEALTH', dayBranchTenGod: 'DIRECT_OFFICER', sewoonAvailable: true, wolwoonAvailable: true, supportedDomains: ['overall'], evidenceVersion: 'today-evidence@1.0.0' }) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mEv = (o: Rel): MonthlyFortuneEvidence => ({ available: true, year: 2026, month: 8, timezone: 'Asia/Seoul', segments: [{ sajuMonthOrdinal: 7, durationSeconds: 1000, weight: 1, startCivilDate: '2026-08-01', stemTenGod: 'DIRECT_WEALTH', branchTenGod: 'DIRECT_OFFICER', relationsToNatal: rel(o) as any }], transitionCivilDate: null, sewoonAvailable: true, supportedDomains: ['overall'], evidenceVersion: 'monthly-evidence@1.1.0' }) as any;

describe('cross-surface kernel consistency (§17)', () => {
  const RELS: Rel[] = [{ stemH: 1, branchH: 1 }, {}, { stemF: 1 }, { branchH: 1, stemF: 1 }, { branchF: 3, stemH: 1 }];
  it.each(RELS)('Today tier === Monthly tier === kernel tier for %o', (r) => {
    const kernel = derivePolarity(rel(r) as never).tier;
    expect(TODAY_TIER[deriveDailyPlan(tEv(r)).overallTone]).toBe(kernel);
    expect(MONTHLY_TIER[deriveMonthlyPlan(mEv(r)).overallTier]).toBe(kernel);
  });
});

// ── real-path: live grounding produces per-target polarities; server owns conclusionPolarity (§16/§8) ──
const digestProvider: DigestProvider = { async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
const SERVER_NOW = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);
const birth: BirthInfoDraft = { displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null, birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울' };
const draft = { subject: { id: 'self', displayName: '본인', relationship: null }, birthInfo: birth };
const LLM_ANSWER = JSON.stringify({
  coreSummary: '차분한 흐름입니다.', conclusionPolarity: 'FAVORABLE',
  coreInterpretation: '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. 꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.',
  strengths: ['끈기'], cautions: ['조급하게 서두르기보다 속도를 조절하는 편이 좋습니다.'],
});
const deps = (): ServerConsultationDeps => ({ digestProvider, nowEpochSeconds: SERVER_NOW, async callLLM() { return LLM_ANSWER; } });
const req = (question = '올해 재물운 어때?'): ServerConsultationRequest => ({ birthInput: birth, question });

beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

describe('real-path: server-owned conclusionPolarity matches the target-scoped plan (§16/§8)', () => {
  it('the live grounding computes a per-target YEAR polarity, and the server injects the plan value', async () => {
    const grounding = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: SERVER_NOW }, req().question);
    if (grounding.status !== 'available') throw new Error('expected grounded');
    // Live grounding is target-scoped, not a single global polarity.
    expect(Array.isArray(grounding.targetPolarities)).toBe(true);
    const expected = deriveAnswerPlan(req().question, grounding).polarity;
    expect(expected).toBeDefined();

    const r = await buildServerConsultation(req(), deps());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // Server value — NOT the 'FAVORABLE' the LLM smuggled (unless they coincide).
    expect(r.structuredResult?.conclusionPolarity).toBe(expected);
  });
});

// ── persistence round-trip (§19) ──
describe('conclusionPolarity persistence round-trip (§19)', () => {
  const vm = (p?: PolarityTier): StructuredConsultationViewModel => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    coreSummary: '요약', coreInterpretation: '핵심 해석 본문입니다.', assessment: {} as any, grounding: { status: 'unavailable', reason: 'engine_not_connected' },
    ...(p ? { conclusionPolarity: p } : {}),
  });
  it('serialize → parse preserves conclusionPolarity', () => {
    const restored = parsePersistedStructured(serializeStructuredForPersistence(vm('CAUTION')));
    expect(restored?.conclusionPolarity).toBe('CAUTION');
  });
  it('legacy record without the field stays valid (no migration)', () => {
    const restored = parsePersistedStructured({ coreSummary: '요약', coreInterpretation: '핵심 해석 본문입니다.' });
    expect(restored).toBeDefined();
    expect(restored?.conclusionPolarity).toBeUndefined();
  });
});

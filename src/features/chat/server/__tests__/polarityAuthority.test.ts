// Sprint C §5-§8, §12-§13 — SERVER owns the solo polarity; the LLM cannot change it; cross-surface +
// paraphrase stability.
import { createHash } from 'crypto';

import { buildServerConsultation } from '@/features/chat/server';
import { deriveAnswerPlan } from '@/features/chat/server/answerPlan';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import { toSafeGrounding, type ConsultationGrounding } from '@/features/chat/prompts/grounding';
import { parseStructuredConsultation } from '@/features/chat/prompts/structuredConsultation';
import { derivePolarity, type PolarityTier } from '@/features/polarity/polarityKernel';
import { deriveDailyPlan } from '@/features/today/engine/todayPlan';
import type { TodayFortuneEvidence } from '@/features/today/engine/todayEvidence';
import { deriveMonthlyPlan } from '@/features/monthly/engine/monthlyPlan';
import type { MonthlyFortuneEvidence } from '@/features/monthly/engine/monthlyEvidence';
import type { ServerConsultationDeps, ServerConsultationRequest } from '@/features/chat/server';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

// A minimal AVAILABLE grounding carrying a server polarity (deriveAnswerPlan reads it directly).
const gWith = (polarity?: PolarityTier): ConsultationGrounding => ({
  status: 'available',
  ...(polarity ? { polarity } : {}),
  evidence: {
    myungri: {
      availability: 'available', summary: '사주 명식 요약',
      sections: [{ label: '명식', lines: ['년 癸卯 · 일 丙寅'] }],
      hasTimingEvidence: true, timingAnchors: { years: [2026], referenceYear: 2026 },
    },
    ziwei: { availability: 'engine_not_connected' as never },
    qimen: { availability: 'engine_not_connected' as never },
  },
});

describe('deriveAnswerPlan — server-owned polarity + mitigation activation (§5/§7)', () => {
  it('reads the grounding polarity into plan.polarity', () => {
    expect(deriveAnswerPlan('내 사업운 어때?', gWith('FAVORABLE')).polarity).toBe('FAVORABLE');
    expect(deriveAnswerPlan('내 사업운 어때?', gWith('DYNAMIC')).polarity).toBe('DYNAMIC');
  });

  it('CAUTION → requireMitigation = true; every other tier → false', () => {
    expect(deriveAnswerPlan('내 사업운 어때?', gWith('CAUTION')).requireMitigation).toBe(true);
    for (const t of ['FAVORABLE', 'STEADY', 'DYNAMIC'] as PolarityTier[]) {
      expect(deriveAnswerPlan('내 사업운 어때?', gWith(t)).requireMitigation).toBe(false);
    }
    // DYNAMIC is explicitly NOT treated as caution (§7).
    expect(deriveAnswerPlan('내 사업운 어때?', gWith('DYNAMIC')).requireMitigation).toBe(false);
  });

  it('no polarity on the grounding → plan.polarity undefined, requireMitigation false (explicit absence, no guess)', () => {
    const p = deriveAnswerPlan('내 사업운 어때?', gWith(undefined));
    expect(p.polarity).toBeUndefined();
    expect(p.requireMitigation).toBe(false);
  });

  it('toSafeGrounding preserves a valid polarity and rejects a bogus one', () => {
    expect((toSafeGrounding(gWith('CAUTION')) as { polarity?: string }).polarity).toBe('CAUTION');
    const bogus = { ...gWith(), polarity: 'GREAT' } as unknown as ConsultationGrounding;
    expect(toSafeGrounding(bogus).status).toBe('unavailable'); // invalid tier → fail-closed
  });
});

// ── cross-surface consistency (§12): the SAME relations produce the SAME kernel tier on every surface ──
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

describe('cross-surface consistency — one kernel, no contradictory polarity (§12)', () => {
  const RELS: Rel[] = [{ stemH: 1, branchH: 1 }, {}, { stemF: 1 }, { branchH: 1, stemF: 1 }, { branchF: 3, stemH: 1 }];
  it.each(RELS)('Today tier === Monthly tier === kernel tier for %o', (r) => {
    const kernel = derivePolarity(rel(r) as never).tier;
    expect(TODAY_TIER[deriveDailyPlan(tEv(r)).overallTone]).toBe(kernel);
    expect(MONTHLY_TIER[deriveMonthlyPlan(mEv(r)).overallTier]).toBe(kernel);
  });
});

// ── integration: server ownership end-to-end + the LLM cannot change machine polarity (§8) ──
const digestProvider: DigestProvider = { async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
const SERVER_NOW = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);
const birth: BirthInfoDraft = { displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null, birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14', birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울' };
// The LLM even tries to smuggle its OWN conclusionPolarity — it must be ignored (server owns the field).
// It carries a caution so it passes the mitigation guard regardless of the (birth-derived) polarity tier.
const LLM_ANSWER = JSON.stringify({
  coreSummary: '차분한 흐름입니다.', conclusionPolarity: 'FAVORABLE',
  coreInterpretation: '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. 꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.',
  strengths: ['끈기'],
  cautions: ['조급하게 서두르기보다 속도를 조절하는 편이 좋습니다.'],
});
const deps = (): ServerConsultationDeps => ({ digestProvider, nowEpochSeconds: SERVER_NOW, async callLLM() { return LLM_ANSWER; } });
const req = (question = '내 전반적인 흐름은 어떤가요?'): ServerConsultationRequest => ({ birthInput: birth, question });

beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

describe('buildServerConsultation — conclusionPolarity is server-injected, not LLM-chosen (§8)', () => {
  it("the LLM's own conclusionPolarity in its JSON is DROPPED by the parser (schema does not read it)", () => {
    const parsed = parseStructuredConsultation(LLM_ANSWER);
    expect(parsed).not.toBeNull();
    expect((parsed as Record<string, unknown>).conclusionPolarity).toBeUndefined();
  });

  it('the structured result carries the PLAN polarity (server), which matches the grounding-derived plan', async () => {
    // Independently derive what the server plan should decide from the SAME grounding.
    const grounding = await buildConsultationGrounding({ subject: { id: 'self', displayName: '본인', relationship: null }, birthInfo: birth }, { digestProvider, nowEpochSeconds: SERVER_NOW }, req().question);
    const expectedPolarity = deriveAnswerPlan(req().question, grounding).polarity;
    expect(expectedPolarity).toBeDefined(); // the test birth grounds the current 세운

    const r = await buildServerConsultation(req(), deps());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // Server-owned: equals the plan value, NOT the 'FAVORABLE' the LLM tried to smuggle (unless they coincide).
    expect(r.structuredResult?.conclusionPolarity).toBe(expectedPolarity);
  });
});

// ── paraphrase stability (§13): equivalent wording → stable intent / granularity / server polarity ──
describe('paraphrase stability — equivalent questions resolve equivalently (§13)', () => {
  it('올해 사업운 어때? / 올해 사업은 어떨까? / 사업운 올해 괜찮아? → same intent set, granularity, polarity', () => {
    const g = gWith('DYNAMIC');
    const plans = ['올해 사업운 어때?', '올해 사업은 어떨까?', '사업운 올해 괜찮아?'].map((q) => deriveAnswerPlan(q, g));
    const [a, b, c] = plans;
    for (const p of [b, c]) {
      expect(new Set(p.intents)).toEqual(new Set(a.intents));
      expect(p.requestedGranularity).toBe(a.requestedGranularity);
      expect(p.resolvedGranularity).toBe(a.resolvedGranularity);
      expect(p.polarity).toBe(a.polarity); // same grounding → stable server polarity
    }
  });
});

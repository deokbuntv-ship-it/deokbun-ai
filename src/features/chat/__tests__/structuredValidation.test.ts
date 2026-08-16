// Codex targeted-fix coverage: substance gate (#6), grounding-aware validation (#8/#9/#10),
// runtime-safe grounding (#6-runtime), Solar/Lunar prompt equivalence (#5), provenance/timing in
// the actual prompt (#16/#17), fail-closed matrix (§15).
import { createHash } from 'crypto';

import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import { renderGroundingContext, toSafeGrounding, GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import {
  isSubstantiveLongForm,
  parseStructuredConsultation,
  validateStructuredAgainstGrounding,
} from '@/features/chat/prompts/structuredConsultation';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import type { ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';

const LONG = '가'.repeat(150);
const base = { coreSummary: '핵심', coreInterpretation: LONG, strengths: ['끈기'] };

const groundingWith = (o: {
  hasTiming?: boolean;
  ziwei?: 'available' | 'engine_not_connected';
  qimen?: 'available' | 'engine_not_connected';
}): ConsultationGrounding => ({
  status: 'available',
  evidence: {
    myungri: { availability: 'available', summary: '사주 …', hasTimingEvidence: o.hasTiming ?? true },
    ziwei: { availability: o.ziwei ?? 'engine_not_connected' },
    qimen: { availability: o.qimen ?? 'engine_not_connected' },
  },
});

describe('substance gate (FIX #6 / §8)', () => {
  it('summary-only → null; short interpretation → null; long-form → parsed', () => {
    expect(parseStructuredConsultation(JSON.stringify({ coreSummary: '한 줄' }))).toBeNull();
    expect(parseStructuredConsultation(JSON.stringify({ coreSummary: '핵심', coreInterpretation: '짧음' }))).toBeNull();
    expect(parseStructuredConsultation(JSON.stringify(base))).not.toBeNull();
    expect(isSubstantiveLongForm({ coreSummary: '핵심', coreInterpretation: LONG, strengths: ['a'] })).toBe(true);
    expect(isSubstantiveLongForm({ coreSummary: '핵심', coreInterpretation: LONG })).toBe(false); // no supporting section
  });
});

describe('grounding-aware validation (FIX #8/#9/#10)', () => {
  it('futureFlow kept with timing evidence, stripped without (FIX #8)', () => {
    const withTiming = validateStructuredAgainstGrounding({ ...base, futureFlow: '향후 상승' }, groundingWith({ hasTiming: true }));
    expect(withTiming?.futureFlow).toBe('향후 상승');
    const noTiming = validateStructuredAgainstGrounding({ ...base, futureFlow: '향후 상승' }, groundingWith({ hasTiming: false }));
    expect(noTiming?.futureFlow).toBeUndefined();
  });
  it('false Ziwei / Qimen / multi-engine claims → rejected when unconnected (FIX #9)', () => {
    expect(validateStructuredAgainstGrounding({ ...base, coreInterpretation: `${LONG} 자미두수로 보면 명궁이…` }, groundingWith({}))).toBeNull();
    expect(validateStructuredAgainstGrounding({ ...base, coreInterpretation: `${LONG} 기문 국을 보면…` }, groundingWith({}))).toBeNull();
    expect(validateStructuredAgainstGrounding({ ...base, coreInterpretation: `${LONG} 세 학문이 모두 일치합니다.` }, groundingWith({}))).toBeNull();
  });
  it('forbidden-theory assertions → rejected (FIX #10)', () => {
    expect(validateStructuredAgainstGrounding({ ...base, coreInterpretation: `${LONG} 당신은 신강 사주입니다.` }, groundingWith({}))).toBeNull();
    expect(validateStructuredAgainstGrounding({ ...base, coreInterpretation: `${LONG} 용신은 편재입니다.` }, groundingWith({}))).toBeNull();
    expect(validateStructuredAgainstGrounding({ ...base, coreInterpretation: `${LONG} 격국은 정관격입니다.` }, groundingWith({}))).toBeNull();
  });
  it('clean grounded answer passes unchanged', () => {
    const r = validateStructuredAgainstGrounding({ ...base }, groundingWith({}));
    expect(r).not.toBeNull();
  });
  it('legit limitation phrasing is NOT falsely rejected', () => {
    const r = validateStructuredAgainstGrounding(
      { ...base, coreInterpretation: `${LONG} 신강/신약 판정은 아직 계산 근거가 없어 단정하기 어렵습니다.` },
      groundingWith({}),
    );
    expect(r).not.toBeNull();
  });
});

describe('runtime-safe grounding (FIX #6)', () => {
  it('malformed grounding → GROUNDING_UNAVAILABLE (never trusted facts)', () => {
    expect(toSafeGrounding(null).status).toBe('unavailable');
    expect(toSafeGrounding({ status: 'available' } as unknown as ConsultationGrounding).status).toBe('unavailable');
    expect(toSafeGrounding(GROUNDING_UNAVAILABLE).status).toBe('unavailable');
    expect(toSafeGrounding(groundingWith({})).status).toBe('available');
  });
});

// ── real-path prompt checks (Solar/Lunar equivalence + provenance + timing in the prompt) ──
const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) {
    return createHash('sha256').update(s, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 5, 1) / 1000);
const build = (over: Record<string, unknown>) =>
  buildConsultationGrounding(
    {
      subject: { id: 's', displayName: 'T', relationship: null },
      birthInfo: {
        displayName: 'T', gender: 'male', calendarType: 'solar', lunarMonthType: null,
        birthYear: '2024', birthMonth: '1', birthDay: '3', birthTimeAccuracy: 'exact',
        birthHour: '12', birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울', ...over,
      },
    } as unknown as ConsultationDraft,
    { digestProvider, nowEpochSeconds: NOW },
  );

describe('prompt-level equivalence + provenance/timing (FIX #5/#16/#17)', () => {
  it('Solar and Lunar equivalent births render IDENTICAL grounding context', async () => {
    const solar = renderGroundingContext(await build({}));
    const lunar = renderGroundingContext(
      await build({ calendarType: 'lunar', birthYear: '2023', birthMonth: '11', birthDay: '22' }),
    );
    expect(solar).toBe(lunar); // deterministic grounding payload is calendar-agnostic
  });
  it('the rendered grounding carries provenance (立春/12-Jie) + timing (대운/세운) + relations + 투간', async () => {
    const ctx = renderGroundingContext(await build({}));
    expect(ctx).toContain('START_OF_SPRING_IPCHUN'); // §16 provenance
    expect(ctx).toContain('TWELVE_JIE_JIEQI');
    expect(ctx).toContain('대운'); // §17 timing actually in the prompt
    expect(ctx).toContain('세운');
    expect(ctx).toContain('투간'); // FIX #2
    expect(ctx).toContain('관계'); // FIX #1 relations
  });
});

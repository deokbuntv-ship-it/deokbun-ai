// DUAL-ENGINE (SAJU + ZIWEI) consultation E2E (directive §37–§42, §30). Runs the REAL grounding
// path — frozen Saju engine + Myungri facts + iztro Ziwei engine → EngineEvidence → grounding →
// prompt → structured parse/validate → ChatMessage.structuredResult. Only the LLM network call is
// mocked; grounding/prompt/parse/validate are the production path. Golden birth: solar 2024-01-03
// 12:00 남 (both engines available). No PII beyond the synthetic fixture.
import { createHash } from 'crypto';

import type { LLMAdapter } from '@/features/chat/adapters/llmAdapter';
import { renderGroundingContext } from '@/features/chat/prompts/grounding';
import { createChatService } from '@/features/chat/services/chatService';
import {
  buildConsultationGrounding,
  buildZiweiEvidence,
  createSajuGroundingBuilder,
} from '@/features/chat/services/consultationGrounding';
import type { ChatServiceInput } from '@/features/chat/types/chatArchitecture';
import type { ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearZiweiCache } from '@/features/ziwei';

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) {
    return createHash('sha256').update(s, 'utf8').digest('hex');
  },
};
const NOW = Math.floor(Date.UTC(2026, 5, 1) / 1000);
const deps = { digestProvider, nowEpochSeconds: NOW };
const groundingBuilder = createSajuGroundingBuilder(deps);
const allow = () => true;

const draft = (over: Record<string, unknown> = {}): ConsultationDraft =>
  ({
    subject: { id: 's1', displayName: '테스트', relationship: null },
    birthInfo: {
      displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
      birthYear: '2024', birthMonth: '1', birthDay: '3',
      birthTimeAccuracy: 'exact', birthHour: '12', birthMinute: '0',
      approximateTimePeriod: null, birthPlace: '서울', ...over,
    },
  }) as unknown as ConsultationDraft;

// A per-engine-SEPARATED long-form answer: references 사주 AND 자미두수 명반 distinctly, and only a
// SOFT "두 관점을 나란히 참고" observation (never a "완전히 일치" consensus). Passes the validator.
const LONG_CORE =
  '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이고, 월지의 기운이 이를 안정적으로 받쳐 줍니다. ' +
  '자미두수 명반에서는 명궁의 주성과 오행국이 이런 성향을 다른 각도에서 보여 줍니다. ' +
  '두 관점을 나란히 참고하면 자신을 이해하는 데 도움이 됩니다.';
const structuredJson = (over: Record<string, unknown> = {}): string =>
  JSON.stringify({
    coreSummary: '차분하지만 추진력 있는 흐름입니다.',
    disposition: '내면은 신중하고 계획적입니다.',
    coreInterpretation: LONG_CORE,
    strengths: ['끈기', '분석력'],
    cautions: ['과로에 주의'],
    domainInterpretation: [{ title: '일·직업·사업', body: '전문성을 축적하는 흐름이 강합니다.' }],
    followUps: ['직업적으로 잘 맞는 방향은?', '자미두수 명궁은 어떤 의미인가요?'],
    ...over,
  });

// A substantive (>120-char) SAJU-only paragraph — no 자미두수/기문/이론/합의 wording — reused where a
// mock must pass the long-form substance gate without mentioning Ziwei.
const LONG_SAJU =
  '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며, 월지의 기운과 십신 배치가 이를 안정적으로 ' +
  '뒷받침합니다. 꾸준히 쌓아 올리는 방식이 잘 맞고, 조급하게 서두르면 오히려 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.';

const adapterReturning = (text: string): LLMAdapter => ({
  async generateResponse() {
    return { text };
  },
});
const input = (userMessage: string, d: ConsultationDraft): ChatServiceInput => ({
  userMessage, draft: d, messages: [], conversationMemory: { summary: null, lastSummarizedMessageId: null },
});

beforeEach(() => clearZiweiCache());

// ── §37 PROMPT E2E: both engines' facts reach the final prompt boundary ──────────────
describe('dual-engine grounding → prompt (§36/§37)', () => {
  it('rendered grounding carries BOTH 명리 and 자미두수 facts + provenance + convention + qimen 미연결', async () => {
    const ctx = renderGroundingContext(await buildConsultationGrounding(draft(), deps));
    expect(ctx).toContain('명리');
    expect(ctx).toContain('癸卯'); // SAJU 년주 fact
    expect(ctx).toContain('자미두수');
    expect(ctx).toContain('命宮'); // ZIWEI fact
    expect(ctx).toContain('五行局');
    expect(ctx).toContain('관례'); // Saju↔Ziwei month-干支 convention difference note (§8/§41)
    expect(ctx).toContain('fixLeap'); // Ziwei deterministic assumptions reach the prompt (가정)
    expect(ctx).toContain('엔진 구분'); // per-engine attribution discipline (§21)
    expect(ctx).toContain('기문둔갑'); // present as a labeled row…
    expect(ctx).toContain('미연결'); // …explicitly NOT connected (§28)
  });

  it('solar 2024-01-03 and lunar 2023-11-22 yield IDENTICAL Ziwei evidence (calendar-agnostic §16/§41)', async () => {
    const s = await buildConsultationGrounding(draft(), deps);
    const l = await buildConsultationGrounding(
      draft({ calendarType: 'lunar', birthYear: '2023', birthMonth: '11', birthDay: '22' }),
      deps,
    );
    if (s.status !== 'available' || l.status !== 'available') throw new Error('expected available');
    expect(l.evidence.ziwei.summary).toBe(s.evidence.ziwei.summary);
    expect(l.evidence.ziwei.detail).toBe(s.evidence.ziwei.detail);
  });
});

// ── §38 five dual-engine consultation scenarios ──────────────────────────────────────
describe('five dual-engine consultation scenarios (§38)', () => {
  const scenarios: { q: string; json: string; expect: string }[] = [
    { q: '제 성격과 타고난 강점을 자세히 봐주세요.', json: structuredJson({ strengths: ['공감력', '통찰력'] }), expect: '공감력' },
    { q: '직업과 사업 쪽으로 어떤 특징이 있나요?', json: structuredJson({ domainInterpretation: [{ title: '일·직업·사업', body: '리더십이 발휘되는 직군이 유리합니다.' }] }), expect: '리더십' },
    { q: '재물과 돈을 다루는 성향을 봐주세요.', json: structuredJson({ domainInterpretation: [{ title: '재물', body: '중년 이후 축적이 강해지는 흐름입니다.' }] }), expect: '축적' },
    { q: '인간관계와 배우자 관계에서 어떤 특징이 있나요?', json: structuredJson({ domainInterpretation: [{ title: '관계·배우자', body: '신뢰를 바탕으로 오래가는 인연을 만듭니다.' }] }), expect: '인연' },
    { q: '사주와 자미두수를 같이 보면 어떤 부분이 가장 눈에 띄나요?', json: structuredJson({ coreSummary: '두 관점이 서로를 보완합니다.' }), expect: '자미두수' },
  ];
  it.each(scenarios)('answers "$q" with a grounded dual-engine structuredResult', async (s) => {
    const svc = createChatService(adapterReturning(s.json), allow, groundingBuilder);
    const r = await svc.sendMessage(input(s.q, draft()));
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.structuredResult).toBeDefined();
    expect(r.meta?.grounded).toBe(true);
    expect(r.responseText).toContain(s.expect);
    const g = r.structuredResult?.grounding;
    if (g?.status === 'available') {
      expect(g.evidence.myungri.availability).toBe('available');
      expect(g.evidence.ziwei.availability).toBe('available');
      expect(g.evidence.qimen.availability).toBe('not_applicable'); // these 5 are natal questions → Qimen not applicable
    } else {
      throw new Error('expected available dual grounding');
    }
  });
});

// ── §39 degraded modes ───────────────────────────────────────────────────────────────
describe('degraded modes (§39)', () => {
  it('SAJU available + time unknown → Ziwei missing_birth_time → SAJU-only consultation still works', async () => {
    const svc = createChatService(adapterReturning(structuredJson({
      coreInterpretation: `${LONG_SAJU} 시가 미상이라 시주는 제외하고 해석했습니다.` })), allow, groundingBuilder);
    const r = await svc.sendMessage(input('제 성격은요?', draft({ birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null })));
    if (!r.success) throw new Error('unexpected');
    expect(r.structuredResult).toBeDefined();
    const g = r.structuredResult?.grounding;
    if (g?.status !== 'available') throw new Error('expected available (SAJU-only)');
    expect(g.evidence.myungri.availability).toBe('available');
    expect(g.evidence.ziwei.availability).toBe('missing_birth_time'); // no fabricated 시진
  });

  it('Ziwei-only mode: pre-1970 birth (Saju out of range) → myungri failed, ziwei available', async () => {
    const g = await buildConsultationGrounding(draft({ birthYear: '1965', birthMonth: '6', birthDay: '15' }), deps);
    expect(g.status).toBe('available');
    if (g.status !== 'available') return;
    expect(g.evidence.myungri.availability).toBe('calculation_failed'); // frozen Saju 1970–2050 range
    expect(g.evidence.ziwei.availability).toBe('available'); // iztro supports 1965
    expect(g.evidence.ziwei.summary).toContain('命宮');
  });

  it('malformed/failed Ziwei renders as 계산 실패 in the prompt (no crash, SAJU facts intact) (§39B/§39C)', () => {
    // A grounding whose ziwei evidence failed still renders — the LLM sees "계산 실패", not fabricated facts.
    const ctx = renderGroundingContext({
      status: 'available',
      evidence: {
        myungri: { availability: 'available', summary: '년 癸卯 · 월 甲子 · 일 丙寅', hasTimingEvidence: true },
        ziwei: { availability: 'calculation_failed' },
        qimen: { availability: 'engine_not_connected' },
      },
    });
    expect(ctx).toContain('癸卯');
    expect(ctx).toContain('자미두수: 계산 실패');
    expect(ctx).not.toContain('命宮'); // no fabricated ziwei facts
  });
});

// ── §40 false-claim protection (adversarial LLM outputs) ─────────────────────────────
describe('false-claim protection (§40)', () => {
  const reject = async (coreInterpretation: string, d = draft()) => {
    const svc = createChatService(adapterReturning(structuredJson({ coreInterpretation })), allow, groundingBuilder);
    const r = await svc.sendMessage(input('풀이', d));
    if (!r.success) throw new Error('unexpected');
    return r;
  };
  const LONG = `${LONG_SAJU} `;

  it('claims Qimen was used → rejected (plain-text fallback)', async () => {
    const r = await reject(`${LONG}기문둔갑까지 함께 분석했습니다.`);
    expect(r.structuredResult).toBeUndefined();
  });
  it('claims all three disciplines agree → rejected', async () => {
    const r = await reject(`${LONG}세 학문이 모두 일치합니다.`);
    expect(r.structuredResult).toBeUndefined();
  });
  it('claims the two disciplines COMPLETELY agree (no cross-mapping in V1) → rejected', async () => {
    const r = await reject(`${LONG}사주와 자미두수가 모두 재물운이 강하다고 봅니다.`);
    expect(r.structuredResult).toBeUndefined();
  });
  it('a legitimate Ziwei claim IS allowed when Ziwei is available', async () => {
    const r = await reject(`${LONG}자미두수 명반을 함께 보면 명궁의 주성이 이런 성향을 뒷받침합니다.`);
    expect(r.structuredResult).toBeDefined(); // ziwei available → grounded claim blessed
  });
  it('the SAME Ziwei claim is rejected when Ziwei is UNAVAILABLE (time unknown)', async () => {
    const r = await reject(
      `${LONG}자미두수 명반을 보면 명궁의 주성이 이런 성향을 뒷받침합니다.`,
      draft({ birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null }),
    );
    expect(r.structuredResult).toBeUndefined(); // ziwei missing_birth_time → claim not grounded
  });
});

// ── §41 convention difference is handled honestly (not a failure) ────────────────────
describe('Saju/Ziwei month-convention difference (§41)', () => {
  it('1990-08-15 14:00: both engines available; mismatch is preserved as provenance, not an error', async () => {
    const g = await buildConsultationGrounding(
      draft({ birthYear: '1990', birthMonth: '8', birthDay: '15', birthHour: '14' }),
      deps,
    );
    expect(g.status).toBe('available');
    if (g.status !== 'available') return;
    // Neither engine is failed by the other's differing month 干支 (documented C/D convention).
    expect(g.evidence.myungri.availability).toBe('available');
    expect(g.evidence.ziwei.availability).toBe('available');
    const ctx = renderGroundingContext(g);
    expect(ctx).toContain('관례'); // the convention-difference note survives into the prompt
  });
});

// ── §30 follow-up loop keeps fresh dual-engine grounding ─────────────────────────────
describe('follow-up loop (§30)', () => {
  it('a follow-up question re-grounds with a fresh dual-engine grounding in the same subject', async () => {
    const svc = createChatService(adapterReturning(structuredJson()), allow, groundingBuilder);
    const first = await svc.sendMessage(input('제 성격은?', draft()));
    if (!first.success) throw new Error('unexpected');
    expect(first.structuredResult?.followUps?.length).toBeGreaterThan(0);
    // Simulate selecting a follow-up → a new question in the same conversation.
    const follow = await svc.sendMessage(input('직업운도 봐주세요.', draft()));
    if (!follow.success) throw new Error('unexpected');
    const g = follow.structuredResult?.grounding;
    if (g?.status !== 'available') throw new Error('expected available');
    expect(g.evidence.ziwei.availability).toBe('available'); // re-grounded, not reused conversation text
  });
});

// ── PART B — Ziwei-only survives the raised strict-grounding bar (patch #3/#4) ─────────
describe('Ziwei-only degraded mode through the STRICT chatService pipeline (§17)', () => {
  it('pre-1970 birth: Saju out of range → Ziwei-only structuredResult (strict toSafeGrounding accepts it)', async () => {
    const ziweiMock = JSON.stringify({
      coreSummary: '자미두수 명반 중심으로 본 성향입니다.',
      coreInterpretation:
        '자미두수 명반에서는 명궁의 주성과 오행국이 전반적인 기질을 보여 줍니다. 차분하면서도 필요한 순간에는 ' +
        '추진력을 내는 균형형으로, 꾸준히 축적하는 방식이 잘 맞습니다. 관계에서는 신뢰를 바탕으로 오래가는 인연을 만드는 편입니다.',
      strengths: ['끈기', '통찰력'],
      followUps: ['자미두수 명궁을 더 자세히 볼까요?'],
    });
    const svc = createChatService(adapterReturning(ziweiMock), allow, groundingBuilder);
    const r = await svc.sendMessage(input('제 성격을 봐주세요.', draft({ birthYear: '1965', birthMonth: '6', birthDay: '15' })));
    if (!r.success) throw new Error('unexpected');
    expect(r.structuredResult).toBeDefined(); // strict grounding did NOT wrongly degrade Ziwei-only
    expect(r.meta?.grounded).toBe(true);
    const g = r.structuredResult?.grounding;
    if (g?.status !== 'available') throw new Error('expected available (Ziwei-only)');
    expect(g.evidence.myungri.availability).toBe('calculation_failed'); // Saju spine out of 1970–2050 range
    expect(g.evidence.ziwei.availability).toBe('available'); // Ziwei-only survived the strict AVAILABLE-shape check
  });
});

// ── Codex PART A4 — impossible civil date fails closed in the production grounding path ─
describe('impossible civil date → Ziwei fails closed in grounding (PART A4)', () => {
  it('Solar 2024-02-30 → Ziwei evidence is NOT available (never a trusted chart)', () => {
    const birthInfo = (draft({ birthMonth: '2', birthDay: '30' }) as unknown as { birthInfo: never }).birthInfo;
    const ev = buildZiweiEvidence(birthInfo);
    expect(ev.availability).not.toBe('available');
    expect(ev.summary).toBeUndefined(); // no fabricated facts from the impossible date
  });
  it('Solar 2024-02-30 → full grounding does not crash; the impossible date is never trusted Ziwei facts', async () => {
    const g = await buildConsultationGrounding(draft({ birthMonth: '2', birthDay: '30' }), deps);
    // Saju also rejects the impossible date, so grounding is unavailable — but the key invariant is that
    // Ziwei never surfaces the impossible date as available/trusted facts, and nothing throws.
    if (g.status === 'available') {
      expect(g.evidence.ziwei.availability).not.toBe('available');
    } else {
      expect(g.status).toBe('unavailable');
    }
  });
});

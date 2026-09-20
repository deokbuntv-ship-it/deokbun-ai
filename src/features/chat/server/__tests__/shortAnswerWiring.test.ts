// 짧은 답 — 오케스트레이터 연결 (2026-09-19, 지시서 PART 1·2). 실제 엔진 · 가짜 모델.
//
// 못 박는 것
//   · 근거 판단이 선 답에는 짧은 답이 붙고, 모델이 다듬은 문장이 **화면(structuredResult)까지 간다**
//   · 다듬기 호출은 긴 답 호출과 **동시에** 시작한다 — 차례로 부르면 기다림이 두 호출의 합이 된다
//   · 긴 답(결론·근거·행동)은 그대로 있고, 판단 저장·과금 분류(outputClassification)는 바뀌지 않는다
//   · 다듬기가 실패해도 답은 나간다(조립기 원문)
import { createHash } from 'crypto';

import { buildUserVisibleAnswer } from '@/features/chat/presentation/userVisibleAnswer';
import { buildServerConsultation } from '@/features/chat/server';
import type { ServerConsultationDeps } from '@/features/chat/server';
import { checkAnswer } from '@/features/chat/server/consultationAnswerGuard';
import { verifyRewrite } from '@/features/chat/server/rewriteGuard';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
};
const SERVER_NOW = Math.floor(Date.UTC(2026, 8, 18, 1, 0, 0) / 1000);
// 오너 명식(표준시 00:45) — 지시서 PART 5-1 이 쓰는 명식이다.
const OWNER: BirthInfoDraft = {
  displayName: '오너', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1991', birthMonth: '7', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '0',
  birthMinute: '45', approximateTimePeriod: null, birthPlace: '서울',
};
const QUESTION = '요즘 사람 관계가 힘든데 어떨까요?';
const LONG_ANSWER = JSON.stringify({
  coreSummary: '자리 표시용입니다.', coreInterpretation: '통과용 문장입니다. 내용은 없습니다.',
  strengths: ['자리 표시용'], followUps: ['자리 표시용 질문인가요?'],
});

/** 받은 문장을 합쇼체 → 해요체로만 바꾸는 가짜 재작성기. 사실은 건드리지 않는다. */
function toneOnly(content: string): string {
  const { sentences } = JSON.parse(content) as { sentences: string[] };
  return JSON.stringify({
    sentences: sentences.map((s) => s
      .replace(/아닙니다\./, '아니에요.').replace(/있습니다\./, '있어요.').replace(/봅니다\./, '봐요.')
      .replace(/입니다\./, '이에요.').replace(/됩니다\./, '돼요.').replace(/합니다\./, '해요.')
      .replace(/나옵니다\./, '나와요.').replace(/달라집니다\./, '달라져요.')),
  });
}

beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

describe('짧은 답 — 화면까지 간다', () => {
  it('⚠ 모델이 다듬은 문장이 structuredResult.shortAnswer 로 나가고, 긴 답은 그대로 접혀 있다', async () => {
    let rewriteCalls = 0;
    const deps: ServerConsultationDeps = {
      digestProvider, nowEpochSeconds: SERVER_NOW,
      async callLLM() { return LONG_ANSWER; },
      async rewriteLLM(messages) { rewriteCalls += 1; return toneOnly(messages.at(-1)!.content); },
    };
    const r = await buildServerConsultation({ birthInput: OWNER, question: QUESTION }, deps);
    if (!r.ok || !r.structuredResult) throw new Error('no result');
    const short = r.structuredResult.shortAnswer!;
    expect(r.diagnostics?.shortAnswer).toMatchObject({ delivered: 'REWRITE', attempts: 1 });
    expect(rewriteCalls).toBe(1);
    expect(short).toMatch(/에요\./);
    expect(short).not.toMatch(/습니다\./);
    expect(checkAnswer(short).ok).toBe(true);
    // 긴 답 — 결론·근거는 그대로(접힌 칸). 짧은 답이 첫 칸이다.
    const visible = buildUserVisibleAnswer(r.structuredResult);
    expect(visible.sections[0]).toEqual({ title: '짧은 답', body: short });
    expect(visible.sections.map((s) => s.title)).toContain('결론');
    expect(visible.sections.some((s) => s.title.startsWith('전문근거'))).toBe(true);
    // 텍스트 거울도 짧은 답으로 시작한다(다음 대화의 맥락 · 되묻기 연속 방지).
    expect(r.text.startsWith(short)).toBe(true);
  });

  it('⚠ 다듬기는 긴 답 호출과 동시에 시작한다 (차례로 부르지 않는다)', async () => {
    const events: string[] = [];
    let releaseLong!: () => void;
    const longGate = new Promise<void>((res) => { releaseLong = res; });
    const deps: ServerConsultationDeps = {
      digestProvider, nowEpochSeconds: SERVER_NOW,
      async callLLM() { events.push('long:start'); await longGate; events.push('long:end'); return LONG_ANSWER; },
      async rewriteLLM(messages) { events.push('rewrite:start'); return toneOnly(messages.at(-1)!.content); },
    };
    const pending = buildServerConsultation({ birthInput: OWNER, question: QUESTION }, deps);
    // 긴 답이 아직 끝나지 않았는데 다듬기가 이미 시작돼 있어야 한다.
    for (let i = 0; i < 50 && !events.includes('rewrite:start'); i += 1) await new Promise((res) => setTimeout(res, 5));
    expect(events).toContain('long:start');
    expect(events).toContain('rewrite:start');
    expect(events).not.toContain('long:end');
    releaseLong();
    const r = await pending;
    expect(r.ok).toBe(true);
  });

  it('⚠ 다듬기가 사실을 바꾸면 조립기 원문이 나간다 — 모델 문장은 화면에 가지 않는다', async () => {
    const deps: ServerConsultationDeps = {
      digestProvider, nowEpochSeconds: SERVER_NOW,
      async callLLM() { return LONG_ANSWER; },
      async rewriteLLM(messages) {
        const { sentences } = JSON.parse(messages.at(-1)!.content) as { sentences: string[] };
        return JSON.stringify({ sentences: sentences.map((s, i) => (i === 1 ? `${s.replace(/\.$/, '')} 사업이 곧 크게 성장해요.` : s)) });
      },
    };
    const r = await buildServerConsultation({ birthInput: OWNER, question: QUESTION }, deps);
    if (!r.ok || !r.structuredResult) throw new Error('no result');
    expect(r.diagnostics?.shortAnswer).toMatchObject({ delivered: 'SOURCE', reason: 'CHECK_FAILED', attempts: 2 });
    expect(r.structuredResult.shortAnswer).not.toContain('성장');
  });

  it('⚠ 다듬기가 죽어도 답은 나가고, 긴 답의 분류(판단 저장·과금)는 그대로다', async () => {
    const base: ServerConsultationDeps = { digestProvider, nowEpochSeconds: SERVER_NOW, async callLLM() { return LONG_ANSWER; } };
    const without = await buildServerConsultation({ birthInput: OWNER, question: QUESTION }, base);
    const broken = await buildServerConsultation(
      { birthInput: OWNER, question: QUESTION },
      { ...base, async rewriteLLM() { throw new Error('provider down'); } },
    );
    if (!without.ok || !broken.ok) throw new Error('no result');
    expect(broken.structuredResult?.shortAnswer).toBe(without.structuredResult?.shortAnswer);
    expect(broken.diagnostics?.shortAnswer).toMatchObject({ delivered: 'SOURCE', reason: 'LLM_UNAVAILABLE' });
    expect(broken.diagnostics?.outputClassification).toBe(without.diagnostics?.outputClassification);
    // decisionMeta 전체는 비교하지 않는다 — 판단 그래프의 명제 번호(mp_1 …)가 한 프로세스 안에서 실행마다 올라간다.
    const stable = (m: typeof without.structuredResult) => ({
      domain: m?.decisionMeta?.domain,
      direction: m?.decisionMeta?.divinationVerdict?.direction,
      resolution: m?.decisionMeta?.divinationVerdict?.decisionCrossSynthesis?.resolutionKind,
    });
    expect(stable(broken.structuredResult)).toEqual(stable(without.structuredResult));
    // 짧은 답을 빼면 긴 답은 바이트 단위로 같다.
    expect(broken.structuredResult?.coreSummary).toBe(without.structuredResult?.coreSummary);
    expect(broken.structuredResult?.verifiedEvidence).toEqual(without.structuredResult?.verifiedEvidence);
  });

  it('⚠ 원문 문장은 모두 긴 답에 이미 있는 내용이다 — 시기 틀과 되묻기만 서버가 붙인다', async () => {
    const r = await buildServerConsultation(
      { birthInput: OWNER, question: QUESTION },
      { digestProvider, nowEpochSeconds: SERVER_NOW, async callLLM() { return LONG_ANSWER; } },
    );
    if (!r.ok || !r.structuredResult) throw new Error('no result');
    const short = r.structuredResult.shortAnswer!;
    // 원문(모델 없음)은 4중 검사로 자기 자신과 같다 — 검사기의 자기 일관성
    expect(verifyRewrite(short, short).ok).toBe(true);
    expect(short).toMatch(/^버티면서 중심을 잡는 편이에요\. 이번 달 흐름으로 보면, /);
  });
});

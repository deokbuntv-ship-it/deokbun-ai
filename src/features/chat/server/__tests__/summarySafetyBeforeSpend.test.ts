// Sprint F.1 §G/§H/§I — safety-before-spend for the summary workload. A crisis-bearing summary source must
// never reserve paid/global work or reach the LLM; the deterministic safety router classifies the CURRENT
// content first. The Edge ORDER (safety check before acquirePaidRequest) is asserted from source, since the
// Deno Edge is not executed locally.
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { buildServerSummary, summaryContainsHardStop } from '@/features/chat/server';
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';

const turn = (role: 'user' | 'assistant', content: string) => ({ role, content });
const ORDINARY = { turns: [turn('user', '요즘 사업 얘기를 나눴어요.'), turn('assistant', '차분히 준비하면 좋겠습니다.')] };

describe('§G/§H summaryContainsHardStop — deterministic crisis classification of the summary source', () => {
  it('false for an ordinary conversation', () => {
    expect(summaryContainsHardStop(ORDINARY)).toBe(false);
  });
  it('true for self-harm content in the turns', () => {
    expect(summaryContainsHardStop({ turns: [turn('user', '요즘 너무 힘들어서 그냥 죽고 싶어요.')] })).toBe(true);
  });
  it('true for a medical hard-stop', () => {
    expect(summaryContainsHardStop({ turns: [turn('user', '이 병이 사주로 보면 완치되나요?')] })).toBe(true);
  });
  it('true for a death/lifespan hard-stop', () => {
    expect(summaryContainsHardStop({ turns: [turn('assistant', '내 수명이 언제까지인지 궁금해요.')] })).toBe(true);
  });
  it('true when the crisis is in the prior summary, not the turns', () => {
    expect(summaryContainsHardStop({ existingSummary: '사용자가 자살을 생각한다고 말함', turns: [turn('user', '안녕하세요')] })).toBe(true);
  });
});

describe('§I buildServerSummary — crisis summary never calls the LLM', () => {
  it('an ordinary summary calls the LLM and returns ok', async () => {
    const sent: LLMMessage[][] = [];
    const r = await buildServerSummary(ORDINARY, { async callLLM(m) { sent.push(m); return '요약본입니다.'; } });
    expect(r.ok).toBe(true);
    expect(sent.length).toBe(1);
  });

  it.each([
    ['self-harm', '그냥 다 끝내고 죽고 싶어요.'],
    ['medical', '이 암이 완치될 수 있을지 사주로 봐주세요.'],
    ['death', '제가 몇 살에 죽는지 알려주세요.'],
  ])('a %s summary is SAFETY_SKIPPED with NO LLM call', async (_label, content) => {
    const sent: LLMMessage[][] = [];
    const r = await buildServerSummary({ turns: [turn('user', content)] }, { async callLLM(m) { sent.push(m); return 'should not run'; } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('SAFETY_SKIPPED');
    expect(sent.length).toBe(0); // provider never called
  });
});

describe('§G/§H Edge orders the summary safety check BEFORE any paid/global reserve', () => {
  const edge = readFileSync(resolve(__dirname, '../../../../../supabase/functions/chat/index.ts'), 'utf8');
  it('summaryContainsHardStop precedes acquirePaidRequest(summary) and returns before the LLM', () => {
    const summaryBranch = edge.indexOf("if (body.mode === 'summary')");
    const safetyAt = edge.indexOf('summaryContainsHardStop(', summaryBranch);
    const reserveAt = edge.indexOf("acquirePaidRequest(admin, userId, 'summary'", summaryBranch);
    expect(safetyAt).toBeGreaterThan(-1);
    expect(reserveAt).toBeGreaterThan(safetyAt); // safety check first, reserve second
    // On a hard stop the Edge returns immediately (no reserve, no LLM), keeping the prior summary.
    expect(edge).toContain("logDiag(requestId, 'RESPONSE_VALIDATION', 'SUMMARY_SAFETY_SKIPPED'");
  });
});

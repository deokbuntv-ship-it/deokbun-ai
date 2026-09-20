// 응답 속도 조사 ②⑤⑥ — 모델 호출 시간을 실제로 잰다 (2026-09-19).
// 긴 답(지금)과 짧은 답(E안)을 같은 프롬프트·같은 조건에서 각각 3회 불러 시간과 출력 토큰을 잰다.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { TONE_E2 } from '../tone4way/toneE2.mjs';

const b = await import(pathToFileURL(resolve('supabase/functions/chat/_server/serverBundle.mjs')).href);
const API_KEY = (() => {
  for (const line of readFileSync(resolve('.env.qa.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.*)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error('OPENAI_API_KEY 없음');
})();
const route = b.resolveModelRoute(b.consultationWorkload('solo'), {});
const responseFormat = b.consultationResponseFormat();

let calls = 0;
async function timedCall(messages, profile) {
  calls += 1;
  const t0 = Date.now();
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: route.modelId, input: messages, max_output_tokens: profile.maxOutputTokens,
      reasoning: { effort: profile.reasoningEffort }, text: { format: responseFormat },
    }),
  });
  const payload = await res.json();
  const ms = Date.now() - t0;
  const u = payload.usage ?? {};
  return {
    ms,
    inputTokens: u.input_tokens ?? 0,
    outputTokens: u.output_tokens ?? 0,
    reasoningTokens: u.output_tokens_details?.reasoning_tokens ?? 0,
    chars: (b.extractResponsesText(payload) ?? '').length,
  };
}

const frozen = JSON.parse(readFileSync(resolve('output/tone4way/frozen/Q1.json'), 'utf8'));
const profile = b.resolveConsultationProfile(b.classifyQuestionComplexity(frozen.question), {});
const sys = frozen.messages.filter((m) => m.role === 'system');
const rest = frozen.messages.filter((m) => m.role !== 'system');

const CASES = [
  { id: '지금 (긴 답)', messages: frozen.messages },
  { id: 'E안 (짧은 답)', messages: [...sys, { role: 'system', content: TONE_E2.overlay }, ...rest] },
];

const out = [];
console.log('| 조건 | 회차 | 시간 | 입력 토큰 | 출력 토큰 | (추론) | 답 글자 |');
console.log('|---|---:|---:|---:|---:|---:|---:|');
for (const c of CASES) {
  for (let i = 1; i <= 3; i += 1) {
    const r = await timedCall(c.messages, profile);
    out.push({ ...r, id: c.id });
    console.log(`| ${c.id} | ${i} | **${(r.ms / 1000).toFixed(1)}초** | ${r.inputTokens.toLocaleString()} | ${r.outputTokens.toLocaleString()} | ${r.reasoningTokens} | ${r.chars.toLocaleString()} |`);
  }
}

const by = (id) => out.filter((r) => r.id === id);
const avg = (a, k) => a.reduce((s, r) => s + r[k], 0) / a.length;
console.log('\n| 조건 | 평균 시간 | 평균 출력 토큰 | 초당 출력 토큰 |');
console.log('|---|---:|---:|---:|');
const stat = {};
for (const c of CASES) {
  const a = by(c.id);
  const ms = avg(a, 'ms'); const ot = avg(a, 'outputTokens');
  stat[c.id] = { ms, ot, chars: avg(a, 'chars'), input: avg(a, 'inputTokens') };
  console.log(`| ${c.id} | **${(ms / 1000).toFixed(1)}초** | ${ot.toFixed(0)} | ${(ot / (ms / 1000)).toFixed(1)} |`);
}

// 고정 비용(연결·입력 처리)과 출력 1토큰당 시간을 두 점에서 푼다.
const A = stat['지금 (긴 답)']; const B = stat['E안 (짧은 답)'];
const perToken = (A.ms - B.ms) / Math.max(1, A.ot - B.ot);
const fixed = A.ms - perToken * A.ot;
console.log(`\n두 점에서 푼 값: 고정 비용 **${(fixed / 1000).toFixed(1)}초** + 출력 1토큰당 **${perToken.toFixed(0)} ms**`);
console.log(`→ 출력이 ${A.ot.toFixed(0)}토큰에서 ${B.ot.toFixed(0)}토큰으로 줄면 **${((A.ms - B.ms) / 1000).toFixed(1)}초** 빨라진다 (실측 차이).`);

writeFileSync(resolve('output/tone4way/speed.json'), JSON.stringify({ calls, out, stat, fixed, perToken }, null, 2), 'utf8');
console.log(`\nLLM 호출: ${calls}회`);

// 속도 조사 이어서 — 출력 토큰을 **실제로 줄인** 점을 만들어 초당 속도를 푼다 (2026-09-19).
//
// 1차 측정에서 "짧은 답"이 빨라지지 않았다. 원인이 드러났다: E안은 글자는 줄었지만 **추론 토큰이 늘어**
// 총 출력 토큰이 거의 같았다(1,468 → 1,548). 그래서 시간이 같았다.
// 시간이 무엇에 매여 있는지 알려면 **총 출력 토큰이 진짜로 적은 점**이 필요하다.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

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
const frozen = JSON.parse(readFileSync(resolve('output/tone4way/frozen/Q1.json'), 'utf8'));

let calls = 0;
async function timed(effort, maxTokens) {
  calls += 1;
  const t0 = Date.now();
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: route.modelId, input: frozen.messages, max_output_tokens: maxTokens,
      reasoning: { effort }, text: { format: responseFormat },
    }),
  });
  const p = await res.json();
  const ms = Date.now() - t0;
  const u = p.usage ?? {};
  return {
    effort, maxTokens, ms,
    outputTokens: u.output_tokens ?? 0,
    reasoningTokens: u.output_tokens_details?.reasoning_tokens ?? 0,
    status: p.status ?? null,
    incomplete: p.incomplete_details?.reason ?? null,
    error: p.error?.message ?? null,
  };
}

const CASES = [
  { effort: 'minimal', max: 4500, label: "추론 'minimal' (지금은 'low')" },
  { effort: 'low', max: 900, label: "출력 상한 900 (지금은 4500)" },
];

const rows = [];
console.log('| 조건 | 회차 | 시간 | 출력 토큰 | (추론) | 상태 |');
console.log('|---|---:|---:|---:|---:|---|');
for (const c of CASES) {
  for (let i = 1; i <= 2; i += 1) {
    const r = await timed(c.effort, c.max);
    rows.push({ ...r, label: c.label });
    console.log(`| ${c.label} | ${i} | **${(r.ms / 1000).toFixed(1)}초** | ${r.outputTokens} | ${r.reasoningTokens} | ${r.error ? '❌ ' + r.error.slice(0, 40) : (r.incomplete ?? r.status)} |`);
  }
}

// 기준점(1차 측정): 평균 19.9초 / 1,468 출력 토큰
const BASE = { ms: 19900, ot: 1468 };
const ok = rows.filter((r) => !r.error && r.outputTokens > 0);
if (ok.length) {
  const lo = ok.reduce((m, r) => (r.outputTokens < m.outputTokens ? r : m), ok[0]);
  const perToken = (BASE.ms - lo.ms) / Math.max(1, BASE.ot - lo.outputTokens);
  const fixed = BASE.ms - perToken * BASE.ot;
  console.log(`\n가장 적은 출력 점: ${lo.outputTokens} 토큰 · ${(lo.ms / 1000).toFixed(1)}초 (${lo.label})`);
  console.log(`두 점(기준 1,468/19.9초)에서 푼 값 → 고정 **${(fixed / 1000).toFixed(1)}초** + 출력 1토큰당 **${perToken.toFixed(1)} ms**`);
  console.log(`즉 초당 약 **${(1000 / perToken).toFixed(0)} 토큰** 생성.`);
}
writeFileSync(resolve('output/tone4way/speed2.json'), JSON.stringify({ calls, rows }, null, 2), 'utf8');
console.log(`\nLLM 호출: ${calls}회`);

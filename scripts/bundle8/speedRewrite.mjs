// 속도 조사 ⑥ — **재작성 호출**을 실제로 잰다 (2026-09-19).
// 중간안에서는 모델이 빈 종이에서 쓰지 않고 조립기 문장만 다듬는다. 그러면 입력이 짧아지고(근거 블록
// 전체가 필요 없다) 출력도 원문 길이만큼이다. 추정하지 말고 진짜로 불러 본다.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { verifyRewriteLocal } from './verifyLocal.mjs';

const b = await import(pathToFileURL(resolve('supabase/functions/chat/_server/serverBundle.mjs')).href);
const API_KEY = (() => {
  for (const line of readFileSync(resolve('.env.qa.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.*)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error('OPENAI_API_KEY 없음');
})();
const route = b.resolveModelRoute(b.consultationWorkload('solo'), {});

// 조립기가 실제로 낸 문장 (2026-09-18 Q1 실측). 다듬을 대상은 서술 문장뿐이다.
const audit = JSON.parse(readFileSync(resolve('output/tone4way/audit.json'), 'utf8'));
const serverText = audit.rows.find((r) => r.qid === 'Q1' && r.tid === 'A').serverText;
const SENTENCES = serverText
  .replace(/\[[^\]]+\]\n/g, '')
  .split(/(?<=[.!?。])\s*|\n+/)
  .map((s) => s.trim())
  .filter((s) => s.length > 10 && !/(때문에|므로|해서|니까|십시오|하세요)/.test(s))
  .slice(0, 8);

const INSTRUCTION = [
  '아래 문장들의 **말투만** 바꿔 주십시오.',
  '· "~해요 / ~거든요 / ~이에요" 로 끝내십시오. "~습니다" 를 쓰지 마십시오.',
  '· **내용을 더하거나 빼지 마십시오.** 새 낱말·숫자·시기를 넣지 마십시오.',
  '· 부정("않다·마십시오")과 추측("~수 있다·~편")은 **그대로 두십시오.**',
  '· 문장 수를 그대로 유지하고, 한 줄에 한 문장씩 같은 순서로 돌려주십시오.',
  '· 다른 말은 붙이지 마십시오.',
].join('\n');

let calls = 0;
async function timedRewrite(sentences) {
  calls += 1;
  const t0 = Date.now();
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: route.modelId,
      input: [{ role: 'system', content: INSTRUCTION }, { role: 'user', content: sentences.join('\n') }],
      max_output_tokens: 1200,
      reasoning: { effort: process.env.REWRITE_EFFORT ?? 'minimal' },
    }),
  });
  const p = await res.json();
  const ms = Date.now() - t0;
  const u = p.usage ?? {};
  return {
    ms, inputTokens: u.input_tokens ?? 0, outputTokens: u.output_tokens ?? 0,
    reasoningTokens: u.output_tokens_details?.reasoning_tokens ?? 0,
    text: b.extractResponsesText(p) ?? '',
  };
}

console.log(`다듬을 문장 ${SENTENCES.length}개 · 원문 ${SENTENCES.join('\n').length}자\n`);
console.log('| 회차 | 시간 | 입력 토큰 | 출력 토큰 | 4중 검사 |');
console.log('|---|---:|---:|---:|---|');
const rows = [];
for (let i = 1; i <= Number(process.env.REWRITE_N ?? 3); i += 1) {
  const r = await timedRewrite(SENTENCES);
  const src = SENTENCES.join(' ');
  const rew = r.text.split('\n').map((s) => s.trim()).filter(Boolean).join(' ');
  const v = verifyRewriteLocal(src, rew);
  rows.push({ ...r, ok: v.ok, fails: v.failures.map((f) => f.kind) });
  console.log(`| ${i} | **${(r.ms / 1000).toFixed(1)}초** | ${r.inputTokens.toLocaleString()} | ${r.outputTokens} | ${v.ok ? '✅ 통과' : '⚠ ' + v.failures.map((f) => f.kind).join(', ')} |`);
}
const avg = rows.reduce((s, r) => s + r.ms, 0) / rows.length / 1000;
console.log(`\n재작성 호출 평균 **${avg.toFixed(1)}초** (입력 ${Math.round(rows[0].inputTokens).toLocaleString()} 토큰 — 지금 상담 호출의 11,070 대비 약 ${(rows[0].inputTokens / 11070 * 100).toFixed(0)}%)`);
console.log(`4중 검사 통과: ${rows.filter((r) => r.ok).length} / ${rows.length}`);
console.log('\n--- 다듬어진 문장 (1회차) ---');
console.log(rows[0] ? rows[0].text ?? '' : '');
writeFileSync(resolve('output/tone4way/speed-rewrite.json'), JSON.stringify({ calls, rows }, null, 2), 'utf8');
console.log(`\nLLM 호출: ${calls}회`);

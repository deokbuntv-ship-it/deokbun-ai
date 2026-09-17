// 속도 조사 ⑤ — 실사이트 46초의 정체. 가설: **두 번째 모델 호출(확신 가드 재생성)**.
//
// 근거. 로컬 단일 호출이 19.9초다. 두 번 부르면 약 40초이고, 여기에 Edge·DB·네트워크를 더하면 46초에
// 닿는다. 2026-09-15 의 "서버 약 46초" 는 **한 번의 관측**이었고, 그때 재생성이 일어났다면 설명이 된다.
//
// 그래서 **재생성이 실제로 얼마나 자주 일어나는지**를 잰다. 진짜 모델을 쓰되 오케스트레이터 안에서
// 호출 횟수와 각 호출의 시간을 센다. 로그인 없이 잴 수 있는 유일한 방법이다.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const b = await import(pathToFileURL(resolve('supabase/functions/chat/_server/serverBundle.mjs')).href);
const digestProvider = { async sha256Utf8(s) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
const API_KEY = (() => {
  for (const line of readFileSync(resolve('.env.qa.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.*)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error('OPENAI_API_KEY 없음');
})();
const route = b.resolveModelRoute(b.consultationWorkload('solo'), {});
const responseFormat = b.consultationResponseFormat();

const birth = {
  displayName: '오너', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1991', birthMonth: '7', birthDay: '15', birthTimeAccuracy: 'exact',
  birthHour: '0', birthMinute: '45', approximateTimePeriod: null, birthPlace: '서울',
};
const NOW = Math.floor(Date.UTC(2026, 8, 18, 1, 0, 0) / 1000);
const QUESTIONS = [
  '이번 달 일 운이 어떤가요?',
  '요즘 사람 관계가 힘든데 어떨까요?',
  '올해 어떻게 흘러갈까요?',
  '지금 이직해도 될까요?',
  '올해 안에 돈이 들어올 자리가 있을까요?',
];

let totalCalls = 0;
console.log('| 질문 | 모델 호출 | 호출별 시간 | 상담 전체 | 재생성 |');
console.log('|---|---:|---|---:|---|');
const rows = [];
for (const q of QUESTIONS) {
  const times = [];
  const t0 = Date.now();
  const r = await b.buildServerConsultation({ birthInput: birth, question: q }, {
    digestProvider, nowEpochSeconds: NOW,
    async callLLM(messages) {
      totalCalls += 1;
      const s = Date.now();
      const res = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: route.modelId, input: messages, max_output_tokens: 4500,
          reasoning: { effort: 'low' }, text: { format: responseFormat },
        }),
      });
      const p = await res.json();
      times.push(Date.now() - s);
      return b.extractResponsesText(p) ?? '';
    },
  });
  const total = Date.now() - t0;
  const regen = times.length > 1;
  rows.push({ q, calls: times.length, times, total, regen, ok: r.ok });
  console.log(`| ${q} | ${times.length} | ${times.map((t) => (t / 1000).toFixed(1) + '초').join(' + ')} | **${(total / 1000).toFixed(1)}초** | ${regen ? '⚠ 있음' : '없음'} |`);
}

const regens = rows.filter((r) => r.regen).length;
const avg = rows.reduce((s, r) => s + r.total, 0) / rows.length / 1000;
const avgSingle = rows.filter((r) => !r.regen).reduce((s, r) => s + r.total, 0) / Math.max(1, rows.filter((r) => !r.regen).length) / 1000;
const avgDouble = rows.filter((r) => r.regen).reduce((s, r) => s + r.total, 0) / Math.max(1, regens) / 1000;

console.log(`\n재생성이 일어난 상담: **${regens} / ${rows.length}**`);
console.log(`1회 호출로 끝난 상담 평균: **${avgSingle.toFixed(1)}초**`);
if (regens) console.log(`재생성이 일어난 상담 평균: **${avgDouble.toFixed(1)}초**`);
console.log(`전체 평균: ${avg.toFixed(1)}초`);
console.log(`\n⚠ 이 시간에는 Edge·DB·네트워크가 **빠져 있다**(로컬 Node · 미국행 API 직접 호출).`);
writeFileSync(resolve('output/tone4way/regen-rate.json'), JSON.stringify({ totalCalls, rows }, null, 2), 'utf8');
console.log(`LLM 호출: ${totalCalls}회`);

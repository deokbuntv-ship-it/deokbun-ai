// 응답 속도 조사 ②③ — 모델 호출을 뺀 단계별 실측 + 입력 토큰의 구성 (2026-09-19). LLM 호출 0.
//
// 방법: 실제 오케스트레이터를 그대로 돌리되 바깥으로 나가는 모델 호출만 가로챈다. 그러면
//   · 모델을 부르기 **전까지**(출생 해석 · 세 엔진 계산 · 판단 · 프롬프트 조립) 걸린 시간
//   · 모델 답을 받은 **뒤**(검증 · 가드 · 조립 · 전달 계약) 걸린 시간
// 을 따로 잴 수 있다. 모델 자체의 시간은 `speedLlm.mjs` 가 실제 호출로 잰다.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const b = await import(pathToFileURL(resolve('supabase/functions/chat/_server/serverBundle.mjs')).href);
const digestProvider = { async sha256Utf8(s) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };

const birth = {
  displayName: '오너', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1991', birthMonth: '7', birthDay: '15', birthTimeAccuracy: 'exact',
  birthHour: '0', birthMinute: '45', approximateTimePeriod: null, birthPlace: '서울',
};
const NOW = Math.floor(Date.UTC(2026, 8, 18, 1, 0, 0) / 1000);
const QUESTIONS = ['이번 달 일 운이 어떤가요?', '요즘 사람 관계가 힘든데 어떨까요?', '올해 어떻게 흘러갈까요?'];
const CANNED = JSON.stringify({
  coreSummary: '지금은 크게 벌이기보다 하던 것을 다듬는 쪽이 편합니다.',
  disposition: '', coreInterpretation: '지금의 큰 흐름과 올해 흐름이 맞물려 있어 새로 벌이기보다 '
    + '이미 하고 있는 일의 경계를 다시 확인하는 편이 유리합니다. 서두를수록 결이 흐트러지기 쉽습니다.',
  strengths: ['꾸준히 밀고 가는 힘이 있습니다.'], cautions: ['몫을 두고 겨루는 자리가 생깁니다.'],
  domainInterpretation: [{ title: '일', body: '영역 본문입니다. 충분한 길이를 둡니다.' }],
  futureFlow: '', followUps: ['올해 재물은 어떤가요?'],
});

console.log('## ② 단계별 실측 (모델 호출 제외) — 로컬 Node · 명식 고정 · 각 질문 3회 중 중앙값\n');
console.log('| 질문 | 모델 부르기 전 | 모델 답 받은 뒤 | 모델 호출 횟수 |');
console.log('|---|---:|---:|---:|');

const rows = [];
for (const q of QUESTIONS) {
  const before = [];
  const after = [];
  let calls = 0;
  for (let i = 0; i < 3; i += 1) {
    const t0 = process.hrtime.bigint();
    let tCall = 0n;
    calls = 0;
    const r = await b.buildServerConsultation({ birthInput: birth, question: q }, {
      digestProvider, nowEpochSeconds: NOW,
      async callLLM() { calls += 1; if (calls === 1) tCall = process.hrtime.bigint(); return CANNED; },
    });
    const t1 = process.hrtime.bigint();
    if (!r.ok || tCall === 0n) continue;
    before.push(Number(tCall - t0) / 1e6);
    after.push(Number(t1 - tCall) / 1e6);
  }
  const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)] ?? 0;
  rows.push({ q, before: med(before), after: med(after), calls });
  console.log(`| ${q} | **${med(before).toFixed(0)} ms** | **${med(after).toFixed(0)} ms** | ${calls} |`);
}
const avgBefore = rows.reduce((a, r) => a + r.before, 0) / rows.length;
const avgAfter = rows.reduce((a, r) => a + r.after, 0) / rows.length;
console.log(`\n평균: 모델 전 **${avgBefore.toFixed(0)} ms** · 모델 후 **${avgAfter.toFixed(0)} ms** → 서버 자체 합계 약 **${((avgBefore + avgAfter) / 1000).toFixed(1)}초**`);
console.log('⚠ 로컬 Node 기준이다. Edge(Deno, 콜드 스타트 포함)는 다를 수 있다. DB 조회·과금 RPC 는 여기에 없다.');

// ── ③ 입력 토큰의 구성 ────────────────────────────────────────────────────────
console.log('\n## ③ 입력 11,267 토큰에 무엇이 들어 있나\n');
const frozen = JSON.parse(readFileSync(resolve('output/tone4way/frozen/Q1.json'), 'utf8'));
const MEASURED_INPUT_TOKENS = 11070; // 2026-09-18 Q1-A 실측 usage.input_tokens
const total = frozen.messages.reduce((n, m) => n + m.content.length, 0);

// 두 번째 system 메시지를 표제([xxx])로 쪼갠다 — 프롬프트가 그 단위로 조립되기 때문.
const sys = frozen.messages.filter((m) => m.role === 'system');
const parts = [];
parts.push({ name: '시스템 헌법 (역할·근거 규율·안전·언어)', chars: sys[0].content.length });
const body = sys[1].content;
const marks = [...body.matchAll(/^(【[^】]+】|\[[^\]]+\])/gm)].map((m) => ({ i: m.index, name: m[1] }));
for (let i = 0; i < marks.length; i += 1) {
  const end = i + 1 < marks.length ? marks[i + 1].i : body.length;
  parts.push({ name: marks[i].name, chars: end - marks[i].i });
}
const user = frozen.messages.filter((m) => m.role !== 'system');
parts.push({ name: '사용자 질문', chars: user.reduce((n, m) => n + m.content.length, 0) });

parts.sort((a, b2) => b2.chars - a.chars);
console.log('| 구성 | 글자 | 비중 | 추정 토큰 | 줄일 수 있나 |');
console.log('|---|---:|---:|---:|---|');
const REDUCIBLE = {
  '【계산 근거】': '△ 일부 — 질문과 무관한 학문·항목을 빼면 줄지만, 빼는 순간 판단 근거가 바뀐다',
  '시스템 헌법 (역할·근거 규율·안전·언어)': '✗ 안전·근거 규율. 줄이면 그만큼 가드가 약해진다',
  '[출력 형식 — 구조화 JSON]': '△ 말투 지시가 길다. 검사기가 서버로 오면 지시를 줄일 수 있다',
  '[상담 대상]': '✗ 짧다',
  '사용자 질문': '✗ 짧다',
};
for (const p of parts) {
  const share = p.chars / total;
  const tok = Math.round(MEASURED_INPUT_TOKENS * share);
  const note = REDUCIBLE[p.name] ?? (p.chars > 800 ? '△ 검토 대상' : '✗ 짧다');
  console.log(`| ${p.name} | ${p.chars.toLocaleString()} | ${(share * 100).toFixed(1)}% | ~${tok.toLocaleString()} | ${note} |`);
}
console.log(`\n합계 ${total.toLocaleString()}자 · 실측 입력 **${MEASURED_INPUT_TOKENS.toLocaleString()} 토큰** (2026-09-18 Q1-A).`);
console.log('추정 토큰은 **글자 비중으로 나눈 값**이다 — 한국어·한자·기호가 섞여 있어 구간별 토큰 밀도가 다르므로 어림수다.');

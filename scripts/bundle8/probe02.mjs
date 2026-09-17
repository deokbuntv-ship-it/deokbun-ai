// PART 0-2 / 0-3 선행 확인 — 조립기가 **성향**과 **시기** 재료를 갖고 있는가. LLM 호출 0.
//
// 왜 이것이 먼저인가. PART 1(중간안)은 모델이 **새 내용을 못 넣게** 한다(내용어 부분집합).
// 그런데 PART 2 는 답변에 **성향 한 조각**과 **시기 한 조각**을 요구한다.
// 조립기가 그 재료를 안 만들면 두 요구는 **동시에 만족할 수 없다.** 그래서 먼저 센다.
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const b = await import(pathToFileURL(resolve('supabase/functions/chat/_server/serverBundle.mjs')).href);
const R = await import(pathToFileURL(resolve(process.env.RENDER_BUNDLE)).href);
const digestProvider = { async sha256Utf8(s) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };

const birth = {
  displayName: '오너', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1991', birthMonth: '7', birthDay: '15', birthTimeAccuracy: 'exact',
  birthHour: '0', birthMinute: '45', approximateTimePeriod: null, birthPlace: '서울',
};
const NOW = Math.floor(Date.UTC(2026, 8, 18, 1, 0, 0) / 1000);
const QUESTIONS = ['이번 달 일 운이 어떤가요?', '요즘 사람 관계가 힘든데 어떨까요?', '올해 어떻게 흘러갈까요?', '제 타고난 성격은 어떤가요?'];

// 성향 서술로 읽히는 말 — 사람을 묘사한다
const DISPOSITION_RE = /(성향|편이|스타일|기질|타고난|원래|성격|결이|나서는|밀고|꼼꼼|신중한|적극)/;
// 시기를 가리키는 말 — 언제인지 말한다
const TIMING_RE = /(이번\s*달|올해|내년|상반기|하반기|초순|중순|하순|월\b|\d+월|분기|당분간|지금은|앞으로)/;
// 월 안의 구간 — "중순 넘어가면서" 같은 말을 하려면 이게 있어야 한다
const INTRA_MONTH_RE = /(초순|중순|하순|상순|월초|월말|중반|말경|초반|후반|\d+일)/;

console.log('| 질문 | 성향 칸(disposition) | 본문에 성향 서술 | 본문에 시기 표현 | 월 안 구간 |');
console.log('|---|---|---|---|---|');
const rows = [];
for (const q of QUESTIONS) {
  const r = await b.buildServerConsultation({ birthInput: birth, question: q },
    { digestProvider, nowEpochSeconds: NOW, async callLLM() { return JSON.stringify({ coreSummary: 'x', coreInterpretation: 'y'.repeat(200), strengths: ['a'], followUps: ['b'] }); } });
  if (!r.ok) { console.log(`| ${q} | (실패 ${r.reason}) | | | |`); continue; }
  const vm = r.structuredResult;
  const visible = R.buildUserVisibleAnswer(vm).text;
  const row = {
    q,
    disposition: vm?.disposition ?? null,
    dispHits: [...new Set((visible.match(new RegExp(DISPOSITION_RE, 'g')) ?? []))],
    timeHits: [...new Set((visible.match(new RegExp(TIMING_RE, 'g')) ?? []))],
    intraHits: [...new Set((visible.match(new RegExp(INTRA_MONTH_RE, 'g')) ?? []))],
    visible,
  };
  rows.push(row);
  console.log(`| ${q} | ${row.disposition ? '"' + row.disposition.slice(0, 26) + '"' : '**없음**'} | ${row.dispHits.join(',') || '**없음**'} | ${row.timeHits.join(',') || '**없음**'} | ${row.intraHits.join(',') || '**없음**'} |`);
}

// 근거 블록에 월 안의 구간 정보가 있는가 (프롬프트로 나가는 것 기준)
console.log('\n=== 근거 블록에 시기 정보가 어디까지 있나 ===');
const cap = [];
await b.buildServerConsultation({ birthInput: birth, question: QUESTIONS[0] },
  { digestProvider, nowEpochSeconds: NOW, async callLLM(m) { cap.push(m); return JSON.stringify({ coreSummary: 'x', coreInterpretation: 'y'.repeat(200), strengths: ['a'], followUps: ['b'] }); } });
const sys = (cap[0] ?? []).filter((m) => m.role === 'system').map((m) => m.content).join('\n');
for (const key of ['세운', '월운', '일진', '절기', '대운', '초순', '중순', '하순', '일별', '주간']) {
  const hit = sys.includes(key);
  console.log(`  ${key.padEnd(4)} ${hit ? '⭕ 있음' : '❌ 없음'}`);
}
const monthLines = sys.split('\n').filter((l) => l.includes('월운'));
console.log('\n월운 줄 (있으면):');
for (const l of monthLines.slice(0, 2)) console.log('  ' + l.trim().slice(0, 230));

console.log('\n=== 결론 재료 ===');
console.log(`성향 칸을 채운 답: ${rows.filter((r) => r.disposition).length} / ${rows.length}`);
console.log(`본문에 성향 서술이 보인 답: ${rows.filter((r) => r.dispHits.length).length} / ${rows.length}`);
console.log(`본문에 시기 표현이 보인 답: ${rows.filter((r) => r.timeHits.length).length} / ${rows.length}`);
console.log(`월 안의 구간(중순 등)이 보인 답: ${rows.filter((r) => r.intraHits.length).length} / ${rows.length}`);

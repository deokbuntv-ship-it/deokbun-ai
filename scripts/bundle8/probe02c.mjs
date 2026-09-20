// 0-2 결론 내기 — 성향 질문이 "거절(DECLINED)" 로 가는 것이 이 명식만의 일인지, 구조적인지. LLM 0.
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const b = await import(pathToFileURL(resolve('supabase/functions/chat/_server/serverBundle.mjs')).href);
const R = await import(pathToFileURL(resolve(process.env.RENDER_BUNDLE)).href);
const digestProvider = { async sha256Utf8(s) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
const NOW = Math.floor(Date.UTC(2026, 8, 18, 1, 0, 0) / 1000);
const canned = JSON.stringify({ coreSummary: 'x', coreInterpretation: 'y'.repeat(200), strengths: ['a'], followUps: ['b'] });

const base = { displayName: 'T', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthTimeAccuracy: 'exact', approximateTimePeriod: null, birthPlace: '서울' };
const CHARTS = [
  { id: '오너 1991-07-15 00:45', v: { ...base, displayName: '오너', birthYear: '1991', birthMonth: '7', birthDay: '15', birthHour: '0', birthMinute: '45' } },
  { id: '1988-03-03 09:20 남', v: { ...base, birthYear: '1988', birthMonth: '3', birthDay: '3', birthHour: '9', birthMinute: '20' } },
  { id: '1995-11-21 16:10 여', v: { ...base, gender: 'female', birthYear: '1995', birthMonth: '11', birthDay: '21', birthHour: '16', birthMinute: '10' } },
  { id: '2000-06-08 22:40 여', v: { ...base, gender: 'female', birthYear: '2000', birthMonth: '6', birthDay: '8', birthHour: '22', birthMinute: '40' } },
];
const TRAIT_Q = ['제 타고난 성격은 어떤가요?', '저는 어떤 사람인가요?', '제 강점은 무엇인가요?', '제 성격을 한마디로 말하면요?'];

const DECLINED_MARK = /(확정하기 어렵|규정하기보다|한쪽 방향을 확정)/;
let declined = 0, total = 0;
console.log('| 명식 | 질문 | 첫 문장 | 판정 |');
console.log('|---|---|---|---|');
for (const c of CHARTS) {
  for (const q of TRAIT_Q) {
    const r = await b.buildServerConsultation({ birthInput: c.v, question: q },
      { digestProvider, nowEpochSeconds: NOW, async callLLM() { return canned; } });
    total += 1;
    if (!r.ok) { console.log(`| ${c.id} | ${q} | (실패 ${r.reason}) | — |`); continue; }
    const t = R.buildUserVisibleAnswer(r.structuredResult).text;
    const first = (t.split('\n')[1] ?? '').trim();
    const isDeclined = DECLINED_MARK.test(t);
    if (isDeclined) declined += 1;
    console.log(`| ${c.id} | ${q} | ${first.slice(0, 54)}… | ${isDeclined ? '❌ 성향 규정 거절' : '⭕ 서술함'} |`);
  }
}
console.log(`\n성향 질문 ${total}건 중 **${declined}건이 "한 가지 성향으로 규정하기보다…" 로 거절**되었습니다 (${Math.round(declined / total * 100)}%).`);

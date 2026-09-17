// 0-2 이어서 — 조립기가 낸 "성향으로 읽히는 문장"을 그대로 꺼내 본다. 그것이 진짜 사람 서술인지 눈으로 본다.
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
const DISP = /(성향|편이|스타일|기질|타고난|원래|성격|결이|나서는|밀고|꼼꼼|신중한|적극)/;

for (const q of ['이번 달 일 운이 어떤가요?', '제 타고난 성격은 어떤가요?']) {
  const r = await b.buildServerConsultation({ birthInput: birth, question: q },
    { digestProvider, nowEpochSeconds: NOW, async callLLM() { return JSON.stringify({ coreSummary: 'x', coreInterpretation: 'y'.repeat(200), strengths: ['a'], followUps: ['b'] }); } });
  const visible = R.buildUserVisibleAnswer(r.structuredResult).text;
  console.log(`\n===== "${q}"`);
  for (const block of visible.split(/\n\n+/)) {
    const m = block.match(/^\[([^\]]+)\]\n([\s\S]*)$/);
    const title = m ? m[1] : '';
    const body = m ? m[2] : block;
    for (const s of body.split(/\n|(?<=[.!?。])\s+/)) {
      if (DISP.test(s)) console.log(`  [${title}] ${s.trim()}`);
    }
  }
}

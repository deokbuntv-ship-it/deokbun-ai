// 짧은 답 원문(S) 말뭉치 — LLM 0콜. 재작성기는 빈 문자열을 돌려주는 가짜(사전 검사 결과만 본다).
import { createHash } from 'node:crypto';
import fs from 'node:fs';
const ROOT = 'C:/Development/DeokbunAI-app';
const B = 'C:/Development/DeokbunAI-blind84-final/';
const { buildServerConsultation } = await import('file:///' + ROOT + '/supabase/functions/chat/_server/serverBundle.mjs');
const { SUBJECTS, toBirthInfo } = await import('file:///' + B + '.runtime/roster.mjs');
const digestProvider = { async sha256Utf8(s) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
const NOW = Math.floor(Date.UTC(2026, 8, 18, 1, 0, 0) / 1000);
const cases = fs.readFileSync(B + 'blind84.jsonl', 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const assign = Object.fromEntries(fs.readFileSync(B + 'blind84_assignment.jsonl', 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)).map((a) => [a.case_id, a.subject_id]));
const subj = Object.fromEntries(SUBJECTS.map((s) => [s.subject_id, s]));
const owner = { displayName: '오너', gender: 'male', calendarType: 'solar', lunarMonthType: null, birthYear: '1991', birthMonth: '7', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '0', birthMinute: '45', approximateTimePeriod: null, birthPlace: '서울' };
const all = [
  ...['이번 달 일 운이 어떤가요?', '요즘 사람 관계가 힘든데 어떨까요?', '올해 어떻게 흘러갈까요?'].map((q, i) => ({ id: `OWN-${i + 1}`, q, birth: owner })),
  ...cases.map((c) => ({ id: c.case_id, q: c.question, birth: toBirthInfo(subj[assign[c.case_id]]) })),
];
const DUMMY = JSON.stringify({ coreSummary: '자리 표시용입니다.', coreInterpretation: '통과용 문장입니다. 내용은 없습니다.', strengths: ['자리 표시용'], followUps: ['자리 표시용 질문인가요?'] });
const rows = [];
for (const c of all) {
  const r = await buildServerConsultation({ birthInput: c.birth, question: c.q }, {
    digestProvider, nowEpochSeconds: NOW, async callLLM() { return DUMMY; }, async rewriteLLM() { return ''; },
  });
  const d = r.diagnostics?.shortAnswer ?? null;
  rows.push({ id: c.id, q: c.q, ok: r.ok, reason: r.ok ? d?.reason ?? 'NONE' : r.reason, src: d?.sourceFailures ?? [], chars: d?.chars ?? 0, text: r.structuredResult?.shortAnswer ?? null });
}
const by = (k) => rows.reduce((m, r) => { const v = k(r); m[v] = (m[v] ?? 0) + 1; return m; }, {});
console.log('n', rows.length, 'reasons', by((r) => r.reason));
const keys = {}; for (const r of rows) for (const k of r.src) keys[k] = (keys[k] ?? 0) + 1;
console.log('sourceFailures', keys);
const lens = rows.filter((r) => r.text).map((r) => r.chars).sort((a, b) => a - b);
console.log('chars p10/p50/p90', lens[Math.floor(lens.length * 0.1)], lens[Math.floor(lens.length * 0.5)], lens[Math.floor(lens.length * 0.9)], 'min', lens[0], 'max', lens.at(-1));
fs.writeFileSync('C:/Development/DeokbunAI-app/output/bundle8/corpus-short.json', JSON.stringify(rows, null, 1));
for (const r of rows.slice(0, 12)) console.log(`\n[${r.id}] ${r.reason} ${r.chars}자 ${r.src.join(',')}\n  Q: ${r.q}\n  S: ${r.text}`);

// 골든 채점기가 짧은 답을 어떻게 보는가 (PART 5-5 두 번째 요구) — 같은 실행에서 "보이는 답" 만 바꿔 두 벌을 만든다.
//   shadow-complete : 지금 앱의 buildUserVisibleAnswer — 짧은 답 + 접힌 긴 답 전부 (화면을 끝까지 펼친 것)
//   shadow-short    : 짧은 답 한 칸만 (펼치기 전에 보이는 것)
// 채점기·질문·명식·시각·판단은 그대로다. 공식 점수가 아니다 — 채점 기준의 치우침을 재는 그림자 측정이다.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const D = 'C:/Development/DeokbunAI-blind84-final/';
const SRC = process.argv[2] ?? 'local-bundle8-at-del';
const { buildUserVisibleAnswer } = await import(pathToFileURL('C:/Development/DeokbunAI-app/output/bundle8/render.mjs').href);
const rows = fs.readFileSync(`${D}minipack_run_${SRC}.jsonl`, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const write = (label, map) => fs.writeFileSync(`${D}minipack_run_${label}.jsonl`, rows.map((r) => JSON.stringify(map(r))).join('\n') + '\n');
write('shadow-complete-bundle8', (r) => {
  const sr = r.structured_consultation_response?.structuredResult;
  if (!sr) return r;
  const v = buildUserVisibleAnswer(sr);
  return { ...r, USER_VISIBLE_ANSWER: { ...r.USER_VISIBLE_ANSWER, sections: v.sections, text: v.text } };
});
let n = 0; let chars = 0;
write('shadow-short-bundle8', (r) => {
  const s = r.structured_consultation_response?.structuredResult?.shortAnswer;
  if (!s) return r;
  n += 1; chars += s.length;
  return { ...r, USER_VISIBLE_ANSWER: { ...r.USER_VISIBLE_ANSWER, sections: [{ title: '짧은 답', body: s }], text: `[짧은 답]\n${s}`, verified_evidence: [] } };
});
console.log(`shadow runs written · short answers ${n} · mean ${n ? Math.round(chars / n) : 0}자`);

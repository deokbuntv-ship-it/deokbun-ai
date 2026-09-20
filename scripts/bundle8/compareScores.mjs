// 읽기 전용 — 두 채점 결과 파일을 사건별로 견준다. 아무 파일도 쓰지 않는다.
import fs from 'node:fs';
const R = 'C:/Development/DeokbunAI-blind84-final/.runtime/';
const [A, B] = process.argv.slice(2);
const load = (l) => Object.fromEntries(fs.readFileSync(`${R}minipack_scores_${l}.jsonl`, 'utf8').trim().split('\n').map((x) => JSON.parse(x)).map((r) => [r.case_id, r]));
const a = load(A); const b = load(B);
const key = (r) => JSON.stringify([r.consultation_score, r.paying_user_value, r.dimensions, r.headline_class, r.action_lines, r.evidence_lines, r.systems]);
let same = 0; const diff = [];
for (const id of Object.keys(a)) {
  if (key(a[id]) === key(b[id])) same += 1;
  else diff.push({ id, [A]: [a[id].consultation_score, a[id].headline_class, a[id].action_lines, a[id].evidence_lines, a[id].systems, a[id].jargon_tokens], [B]: [b[id].consultation_score, b[id].headline_class, b[id].action_lines, b[id].evidence_lines, b[id].systems, b[id].jargon_tokens] });
}
const mean = (o) => { const d = Object.values(o).filter((r) => r.consultation_score != null); return (d.reduce((s, r) => s + r.consultation_score, 0) / d.length).toFixed(2); };
console.log(`identical ${same}/${Object.keys(a).length} · mean ${A}=${mean(a)} ${B}=${mean(b)}`);
for (const d of diff) console.log(JSON.stringify(d));

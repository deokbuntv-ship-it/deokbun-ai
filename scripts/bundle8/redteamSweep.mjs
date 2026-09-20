// PART 6-2 — 재작성 검사기 레드팀: **조립기 문장을 바꾸거나 빼는 변형을 전수로** 만들어 검사기에 넣는다 (LLM 0콜).
//
// 원문: 말뭉치(87문항)에서 실제 조립기가 만든 짧은 답 원문 중 **모델에 보내지는 문장**(isRewritable)만.
// 변형 11종 — 사실이 바뀌는 것만 만든다. 말투만 바뀐 정상 재작성은 따로 "통과해야 할 것" 으로 센다.
// 통과해 버린 변형은 전부 사람이 읽도록 출력한다(구멍 후보).
//
// 실행: npx esbuild src/features/chat/server/rewriteGuard.ts --bundle --platform=node --format=esm --outfile=output/bundle8/rewriteGuard.mjs
//       node scripts/bundle8/redteamSweep.mjs <말뭉치 json>
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const g = await import(pathToFileURL('output/bundle8/rewriteGuard.mjs').href);
const corpus = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const sentences = [...new Set(corpus.filter((r) => r.text).flatMap((r) => g.splitSentences(r.text))
  .filter((s) => !/\?$/.test(s) && g.isRewritable(s)))];

// ── 변형 ─────────────────────────────────────────────────────────────────────
const ANTONYM = [
  ['열려', '막혀'], ['열리', '막히'], ['좋', '나쁘'], ['늘', '줄'], ['크게', '작게'], ['벌일', '접을'], ['벌이', '접으'],
  ['움직이', '머무르'], ['들어오', '나가'], ['쉽', '어렵'], ['어렵', '쉽'], ['빠르', '느리'], ['유지', '변경'],
  ['미루', '서두르'], ['좁히', '넓히'], ['같은', '다른'], ['함께', '따로'], ['먼저', '나중에'], ['지금', '나중에'],
  ['받', '잃'], ['풀리', '꼬이'], ['맞물려', '어긋나'], ['힘을', '짐을'], ['여지', '위험'], ['가셔도', '멈추셔도'],
  ['중심을', '방향을'], ['버티', '흔들리'], ['사실', '거짓'], ['달라', '같아'], ['나눠서', '합쳐서'],
];
const CLAIMS = ['사업이 곧 크게 성장해요', '돈이 들어와요', '반드시 잘 돼요', '승진해요', '올해 안에 결혼해요', '건강이 나빠져요'];
const INTENSIFIERS = ['반드시', '꼭', '확실히', '분명히', '아주', '무조건', '틀림없이'];
const CAUSALS = ['그래서', '그러니', '따라서'];
const PERIODS = [['이번 달', '다음 달'], ['이번 달', '올해'], ['올해', '내년'], ['지금', '다음 달에']];
const words = (s) => s.split(' ');

function* mutations(s) {
  const w = words(s);
  // 1 낱말 하나 지우기 (조사·어미가 아닌 어절 단위)
  for (let i = 0; i < w.length; i += 1) if (w.length > 2) yield ['DELETE_WORD', [...w.slice(0, i), ...w.slice(i + 1)].join(' ')];
  // 2 반대말로 바꾸기
  for (const [a, b] of ANTONYM) if (s.includes(a)) yield ['ANTONYM', s.replace(a, b)];
  // 3 평범한 사실 주장 끼워 넣기 (문장 끝 앞 · 문장 앞)
  for (const c of CLAIMS) {
    yield ['CLAIM_APPEND', s.replace(/[.!]?$/, `, ${c}.`)];
    yield ['CLAIM_PREPEND', `${c.replace(/요$/, '는')} ${s}`];
  }
  // 4 세기 올리기
  for (const x of INTENSIFIERS) { const k = Math.min(1, w.length - 1); yield ['INTENSIFY', [...w.slice(0, k), x, ...w.slice(k)].join(' ')]; }
  // 5 부정 넣기/빼기
  if (/않|아니|없|마세요|마십시오|못/.test(s)) {
    yield ['NEGATION_DROP', s.replace(/지 않(습니다|아요)/, '$1').replace(/지 마(세요|십시오)/, '세요').replace(/아닙니다/, '맞습니다').replace(/아니에요/, '맞아요').replace(/없/, '있')];
  } else {
    yield ['NEGATION_ADD', s.replace(/(습니다|입니다|합니다|됩니다|봅니다)\.$/, '지 않습니다.')];
  }
  // 6 추측 지우기
  if (/수 있|편이|정도|듯|쯤/.test(s)) yield ['HEDGE_DROP', s.replace(/ㄹ?\s*수 있(습니다|어요)/, '$1').replace(/편이/, '')];
  // 7 시기 바꾸기
  for (const [a, b] of PERIODS) if (s.includes(a)) yield ['PERIOD_SWAP', s.replace(a, b)];
  // 8 숫자 바꾸기
  if (/\d/.test(s)) yield ['NUMBER_SWAP', s.replace(/\d+/, (m) => String(Number(m) + 1))];
  // 9 인과 접속 넣기
  for (const c of CAUSALS) yield ['CAUSAL_INSERT', `${c} ${s}`];
  // 10 이웃 어절 순서 바꾸기
  for (let i = 0; i + 1 < w.length; i += 1) {
    const x = [...w]; [x[i], x[i + 1]] = [x[i + 1], x[i]];
    yield ['SWAP_ADJACENT', x.join(' ')];
  }
  // 11 두 문장으로 쪼개기
  if (w.length > 4) yield ['SPLIT', `${w.slice(0, 3).join(' ')}. ${w.slice(3).join(' ')}`];
}

const stats = {};
const passed = [];
for (const s of sentences) {
  for (const [kind, m] of mutations(s)) {
    if (m === s) continue;
    const v = g.verifyRewrite(s, m);
    stats[kind] ??= { tried: 0, caught: 0 };
    stats[kind].tried += 1;
    if (!v.ok) stats[kind].caught += 1;
    else passed.push({ kind, source: s, mutated: m });
  }
}
console.log(`원문 문장 ${sentences.length}개 (모델에 보내지는 것만)`);
console.log('| 변형 | 시도 | 잡음 | 통과 |\n|---|---:|---:|---:|');
let T = 0; let C = 0;
for (const [k, v] of Object.entries(stats)) { T += v.tried; C += v.caught; console.log(`| ${k} | ${v.tried} | ${v.caught} | ${v.tried - v.caught} |`); }
console.log(`| **합계** | **${T}** | **${C}** | **${T - C}** |`);
fs.writeFileSync('output/bundle8/redteam-sweep.json', JSON.stringify({ sentences: sentences.length, stats, passed }, null, 2), 'utf8');
console.log(`\n통과한 변형 ${passed.length}건 — output/bundle8/redteam-sweep.json`);
for (const p of passed.slice(0, 60)) console.log(`· [${p.kind}] ${p.source}\n    → ${p.mutated}`);

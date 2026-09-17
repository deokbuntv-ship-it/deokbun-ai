// REWRITE GUARD — 조립기가 정한 사실을 모델이 **다듬기만** 했는지 검사한다 (2026-09-19).
//
// 왜 이것이 가능한가. `buildServerConsultation` 의 RED-TEAM BLOCKER 1 주석이 기록한 대로, "이 문장이 새
// 사실을 담고 있나?" 는 어휘로 판정할 수 없다 — "사업이 곧 크게 성장합니다" 에는 기술 용어가 하나도 없다.
// 그래서 권한을 옮겨 모델 산문을 통째로 버리는 설계가 되었다.
//
// 이 모듈은 질문을 바꾼다. 모델이 **빈 종이에서 쓰지 않고** 조립기 문장 S 를 받아 S′ 로 다듬으면,
// 판정은 "새 사실인가?"(불가능) 에서 **"S 에 없는 낱말이 들어왔나 · S 의 낱말이 빠졌나?"(가능)** 가 된다.
//
// 문장마다(같은 순서, 같은 개수) 본다. 하나라도 걸리면 호출자는 S 를 그대로 내보낸다(§1-3).
//   ① 낱말 대응 — S′ 의 낱말은 모두 S 의 낱말에서 활용으로 나올 수 있어야 하고, S 의 낱말은 모두 S′ 에 남아야 하며,
//      순서도 같아야 한다
//   ② 극성·양태 보존 — 부정 개수가 같고 추측이 줄지 않는다 · 인과 접속이 새로 생기지 않는다
//   ③ 숫자·시기 일치 — 다중집합으로 같다
//   ④ 문장 수 — 사라지거나 합쳐지지 않는다
//
// ⚠ 2026-09-19 레드팀 전에 강화했다. 첫 판(첫 음절 받침만 떼어 문장 전체 집합으로 비교)은 이것을 못 잡았다:
//   · 문장 일부 삭제 — "돈이 들어오지만 나가는 곳도 많아요" → "돈이 들어와요" (겹침 50% 로 통과)
//   · 문장 사이 낱말 옮기기 (전체 집합이라 위치를 안 봄)
//   · 인과 접속 추가 — 실측 재작성이 실제로 "그래서" 를 붙였다(output/tone4way/speed-rewrite.json)
//   · 첫 글자가 같은 다른 낱말 — 좋은→조심할 · 법니다→버려요 · 사업→사람 · 성장→성과
//
// 인과 뒤집기("A 때문에 B" → "B 때문에 A")는 낱말이 전부 같아서 처음 판에서는 못 잡았다. 지금은 ① 의
// 순서 검사가 잡는다. 그래도 인과 접속이 있는 문장은 **애초에 재작성 대상에서 제외한다**(`isRewritable`) —
// 지시서 §1-2 이고, 검사 하나가 뚫려도 뒤집기가 들어오지 못하게 두 겹으로 둔다.

export type RewriteFailureKind =
  | 'NEW_CONTENT_WORD' // ① S 에서 활용으로 나올 수 없는 낱말
  | 'CONTENT_DROPPED' // ① S 의 낱말이 빠짐
  | 'ORDER_CHANGED' // ① 낱말 순서가 바뀜 (A 해서 B → B 해서 A 같은 관계 뒤집기)
  | 'NEGATION_CHANGED' // ② 부정 개수가 달라짐
  | 'HEDGE_DROPPED' // ② 추측 표현이 줄어듦 (= 더 단정적으로 변함)
  | 'CAUSAL_ADDED' // ② 인과 접속이 새로 생김 (없던 "그래서" 로 두 사실을 잇는다)
  | 'RELATION_CHANGED' // ② 잇는 어미의 관계가 바뀜 (좁히면 → 좁히니: 조건 → 이유)
  | 'NUMBER_CHANGED' // ③ 숫자·시기 불일치
  | 'SENTENCE_COUNT'; // ④ 문장 수가 달라짐

export type RewriteFailure = { kind: RewriteFailureKind; detail: string };
export type RewriteVerdict = { ok: boolean; failures: RewriteFailure[] };

/**
 * 재작성해도 되는 문장인가.
 * · 인과를 담은 문장은 **다듬지 않는다** — 네 검사 중 어느 것도 인과 뒤집기를 잡지 못한다.
 * · 행동 지시 문장도 제외한다(골든 Actionability 축이 액션 섹션의 줄 수를 센다 — `docs/RUBRIC_KNOWN_LIMITATIONS.md` L-5).
 * · 따옴표가 있는 문장도 제외한다 — 조립기가 **사용자 질문을 인용**하는 자리다(`buildDeclinedSummary`).
 *   사용자 글이 재작성 모델에 들어가면 그 낱말이 "원문에 있는 낱말" 이 되어 ① 을 무력화한다.
 */
// "대해서는·위해서" 의 해서는 인과가 아니다 — 말뭉치에서 판단 보류 결론 8건이 이것 때문에 통째로 제외됐다.
const CAUSAL = /(때문에|므로|따라서|그래서|(?<![대위])해서|니까|덕분에|탓에|결과로|이유로)/;
// 해요체 명령(-세요)도 행동 지시다 — 레드팀 전수에서 '들어가세요' 가 목록에 없어 재작성 대상으로 읽혔다.
const ACTION = /(십시오|하세요|보세요|주세요|두세요|마세요|지키시|정하시|확인하시|세요[.!]?$)/;
const QUOTE = /["“”'‘’「」『』]/;
export function isRewritable(sentence: string): boolean {
  const s = sentence.trim();
  if (s.length === 0) return false;
  return !CAUSAL.test(s) && !ACTION.test(s) && !QUOTE.test(s);
}

// ── 토큰화 ────────────────────────────────────────────────────────────────────

/** 문장 나누기. 조립기 문장은 마침표로 끝나므로 마침표 기준이면 충분하다. */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?。])\s*|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ── 음절 열쇠 ─────────────────────────────────────────────────────────────────
//
// 형태소 분석기는 쓰지 않는다(의존성을 늘리지 않는다). 대신 **합쇼체 ↔ 해요체 활용이 실제로 바꾸는 것만**
// 같게 본다. 나머지는 전부 다르게 본다.
//   · 받침 ∅·ㅂ·ㄴ·ㄹ·ㅅ·ㄷ — 합니다/한/할 · 듭니다/들어요 · 낫/나아 · 듣/들어 가 바꾸는 받침
//     (ㅎ·ㅁ·ㅇ 같은 다른 받침은 그대로 — 좋습니다 ↔ 조심 이 여기서 갈린다)
//   · 줄어든 모음 — 해/하 · 돼/되 · 와/오 · 워·줘/주 · 져·려/지·리 · 커·써/크·쓰 · 예/이
const HANGUL_BASE = 0xac00;
const isHangul = (ch: string): boolean => {
  const c = ch.charCodeAt(0);
  return c >= HANGUL_BASE && c <= 0xd7a3;
};
const SOFT_JONG = new Set([0, 4, 7, 8, 17, 19]); // ∅ ㄴ ㄷ ㄹ ㅂ ㅅ
const CHO_H = 18; const CHO_NG = 11;
const O_CONTRACT_CHO = new Set([15, 10, 1, 4, 16]); // ㅋ ㅆ ㄲ ㄸ ㅌ — 커·써·꺼·떠·터
function syllableKey(ch: string): string {
  if (!isHangul(ch)) return ch;
  const code = ch.charCodeAt(0) - HANGUL_BASE;
  const cho = Math.floor(code / 588);
  let jung = Math.floor((code % 588) / 28);
  const jong = code % 28;
  if (jung === 9) jung = 8; // ㅘ → ㅗ
  else if (jung === 14) jung = 13; // ㅝ → ㅜ
  else if (jung === 10) jung = 11; // ㅙ → ㅚ
  else if (jung === 6) jung = 20; // ㅕ → ㅣ
  else if (jung === 1 && cho === CHO_H) jung = 0; // 해 → 하
  else if (jung === 4 && O_CONTRACT_CHO.has(cho)) jung = 18; // 커 → 크
  else if (jung === 7 && cho === CHO_NG) jung = 20; // 예 → 이
  return `${cho}.${jung}.${SOFT_JONG.has(jong) ? 0 : jong}`;
}

/** 어미·조사 자리에 오는 음절. 낱말의 **첫 음절이 아닐 때만** 새로 나타나도 된다. */
const ENDING = new Set(
  ('요 어 아 여 워 와 에 예 이 으 죠 네 거 든 게 고 까 나 는 은 을 를 가 과 로 서 며 면 지 도 만 의 라 러 래 '
    + '세 셔 시 십 오 해 돼 봐 줘 었 았 였 했 됐 겠 던 데 한 할 합 함 됨 입 인 니 다 습 랍 께 야 란 랑').split(' '),
);

/**
 * 낱말로 세지 않는 말 — 잇는 말 · 가리키는 말 · 누그러뜨리는 말. 더하거나 빼도 사실이 바뀌지 않는 것만 둔다.
 * ⚠ 일부러 **넣지 않은 것**: 지금·이번·요즘(시기) · 아주·매우·가장·꼭·반드시(세기) · 그래서·그러니(인과).
 *   그것들은 더하거나 빼면 뜻이 달라진다.
 */
const CONNECTIVES = new Set([
  '그리고', '그래도', '다만', '그런데', '하지만', '또', '또한', '한편', '그러면',
  '이', '그', '저', '이런', '그런', '저런', '이렇게', '그렇게', '여기', '거기', '좀', '조금', '살짝',
]);
/**
 * 의존명사 — "편이에요" · "수 있어요" · "거예요". 뒤에 붙는 말을 **좁게** 정해 둔다.
 * 끝 음절만 떼는 식으로 넓히면 수입(→수) · 거래(→거) 같은 낱말이 기능어로 빠져나간다(첫 구현에서 확인).
 */
const DEPENDENT = ['정도', '것', '거', '게', '수', '편', '듯', '쯤'];
const DEPENDENT_TAIL = new Set([
  '', '은', '는', '이', '가', '을', '를', '도', '만', '에', '으로', '이에요', '예요', '이죠', '죠', '입니다', '이고', '이며',
]);

const words = (sentence: string): string[] =>
  (sentence.match(/[가-힣]+/g) ?? []);

const isFunctionWord = (w: string): boolean =>
  CONNECTIVES.has(w) || DEPENDENT.some((d) => w.startsWith(d) && DEPENDENT_TAIL.has(w.slice(d.length)));

/**
 * b 가 a 의 **활용**일 수 있는가.
 *   · 첫 음절 열쇠가 같다
 *   · b 의 나머지 음절은 어미 음절이거나, a 의 나머지 음절 중 하나와 열쇠가 같다 (립→려 · 옵→와 · 듭→들)
 *   · a 의 나머지 음절 중 어미가 아닌 것은 b 에 모두 남아 있다 (성장→성과 · 나옵→나아 를 막는다)
 */
export function derivable(a: string, b: string): boolean {
  if (a.length === 0 || b.length === 0) return false;
  if (syllableKey(a[0]) !== syllableKey(b[0])) return false;
  const aRest = [...a.slice(1)];
  const bRest = [...b.slice(1)];
  const aKeys = new Set(aRest.map(syllableKey));
  for (const ch of bRest) {
    if (!ENDING.has(ch) && !aKeys.has(syllableKey(ch))) return false;
  }
  const bKeys = new Set(bRest.map(syllableKey));
  for (const ch of aRest) {
    if (!ENDING.has(ch) && !bKeys.has(syllableKey(ch))) return false;
  }
  return true;
}

// ── ① 낱말 대응 (문장마다, 양방향) ────────────────────────────────────────────

function checkWords(source: string, rewrite: string, index: number): RewriteFailure[] {
  const src = words(source).filter((w) => !isFunctionWord(w));
  const rew = words(rewrite).filter((w) => !isFunctionWord(w));
  const fails: RewriteFailure[] = [];
  const at = `${index + 1}번째 문장 — `;
  // 낱말을 **하나씩 짝짓는다**(원문 낱말 하나는 재작성 낱말 하나만 받친다). 레드팀 전수에서 찾은 구멍이다:
  // 같은 뿌리가 한 문장에 두 번 있으면("보면 … 봅니다" · "끊어낼 … 끊어내는") 하나를 지워도 다른 하나가 덮어
  // 주었고, 원문에 이미 있는 말을 한 번 더 붙이는 주장("…정하는 일입니다, 돈이 들어와요")도 통과했다.
  // 순서도 함께 본다 — 말투를 바꾸는 일은 낱말 순서를 바꾸지 않는다. 바뀌었다면 관계가 바뀐 것이다:
  // "마찰이 있어서 범위가 좁아요" → "범위가 좁아서 마찰이 있어요" 는 낱말이 전부 같은데 인과가 뒤집혔다.
  const used = new Array<boolean>(src.length).fill(false);
  const added: string[] = [];
  const relation: string[] = [];
  let reordered: string | null = null;
  let last = -1;
  for (const b of rew) {
    let j = src.findIndex((a, k) => k > last && !used[k] && derivable(a, b));
    if (j < 0) {
      j = src.findIndex((a, k) => !used[k] && derivable(a, b));
      if (j < 0) { added.push(b); continue; }
      reordered ??= b;
    }
    used[j] = true;
    last = Math.max(last, j);
    if (relationOf(src[j]) !== relationOf(b)) relation.push(`${src[j]}→${b}`);
  }
  const dropped = src.filter((_, k) => !used[k]);
  if (added.length) fails.push({ kind: 'NEW_CONTENT_WORD', detail: `${at}원문에 없는 말: ${added.join(', ')}` });
  if (dropped.length) fails.push({ kind: 'CONTENT_DROPPED', detail: `${at}빠진 말: ${dropped.join(', ')}` });
  if (reordered) fails.push({ kind: 'ORDER_CHANGED', detail: `${at}낱말 순서가 바뀜: ${reordered}` });
  if (relation.length) fails.push({ kind: 'RELATION_CHANGED', detail: `${at}잇는 어미가 바뀜: ${relation.join(', ')}` });
  return fails;
}

/**
 * 두 말을 잇는 **어미가 뜻하는 관계**. 낱말이 같아도 어미 하나로 관계가 바뀐다 — 레드팀 중 찾은 구멍:
 *   "범위를 좁히면 여지는 있어요"(조건) → "범위를 좁히니 여지는 있어요"(이유 — 이미 좁혔다는 말이 된다)
 * 조건·이유·양보만 본다. "~며 → ~고" 같은 나열·말투 변화는 관계가 같으므로 건드리지 않는다.
 */
function relationOf(word: string): 'COND' | 'CAUSE' | 'CONCESSIVE' | null {
  if (/(으면|면)$/.test(word)) return 'COND';
  if (/(니까|으니|[^아]니|아서|어서|여서|해서|라서|므로)$/.test(word)) return 'CAUSE';
  if (/(지만|어도|아도|여도|해도|라도)$/.test(word)) return 'CONCESSIVE';
  return null;
}

// ── ② 극성·양태 보존 ─────────────────────────────────────────────────────────
//
// ⚠ 이 검사가 **삭제 공격**을 막는 자리다. "크게 벌이지 마십시오" → "크게 벌이십시오" 는 ① 의 "빠진 말"
//   로도 잡히지만(말다·않다는 낱말이 아니라 부정이라 ① 에서 세지 않는다), 부정은 개수로 따로 지킨다.

const NEGATION = /(않|못|말고|마십시오|마세요|아니|아닙|없|안\s)/g; // 아닙니다 ↔ 아니에요 는 같은 부정 1개
/** 추측·완곡 — 줄어들면 답이 더 단정해진다. 늘어나는 것은 안전하므로 허용한다. */
const HEDGE = /(수\s*있|편이|편\s|정도|가능|듯|쯤|보입니다|보여요|같습니다|같아요|수도)/g;
/** 인과 접속 — 없던 것이 생기면 두 사실 사이에 조립기가 정하지 않은 관계가 생긴다. */
const CAUSAL_LINK = /(때문|므로|따라서|그래서|그러니|그러므로|왜냐하면|덕분|탓에|니까|라서|해서)/g;

const count = (text: string, re: RegExp): number => (text.match(re) ?? []).length;

function checkPolarity(source: string, rewrite: string, index: number): RewriteFailure[] {
  const fails: RewriteFailure[] = [];
  const at = `${index + 1}번째 문장 — `;
  const ns = count(source, NEGATION);
  const nr = count(rewrite, NEGATION);
  if (ns !== nr) fails.push({ kind: 'NEGATION_CHANGED', detail: `${at}부정 표현 ${ns}개 → ${nr}개` });
  const hs = count(source, HEDGE);
  const hr = count(rewrite, HEDGE);
  // 줄어드는 쪽만 막는다 — 늘어나는 것은 더 조심스러워지는 방향이라 안전하다.
  if (hr < hs) fails.push({ kind: 'HEDGE_DROPPED', detail: `${at}추측 표현 ${hs}개 → ${hr}개 (줄면 더 단정해진다)` });
  const cs = count(source, CAUSAL_LINK);
  const cr = count(rewrite, CAUSAL_LINK);
  if (cr > cs) fails.push({ kind: 'CAUSAL_ADDED', detail: `${at}인과 접속 ${cs}개 → ${cr}개` });
  return fails;
}

// ── ③ 숫자·시기 일치 ─────────────────────────────────────────────────────────

const NUMBER = /\d+/g;
const PERIOD = /(올해|내년|작년|이번\s*달|다음\s*달|지난달|상반기|하반기|초순|중순|하순|분기)/g;

const multiset = (text: string, re: RegExp): Map<string, number> => {
  const m = new Map<string, number>();
  for (const x of text.match(re) ?? []) {
    const k = x.replace(/\s+/g, '');
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
};
const sameMultiset = (a: Map<string, number>, b: Map<string, number>): boolean => {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v) return false;
  return true;
};

function checkNumbers(source: string, rewrite: string, index: number): RewriteFailure[] {
  const fails: RewriteFailure[] = [];
  const at = `${index + 1}번째 문장 — `;
  const ns = multiset(source, NUMBER);
  const nr = multiset(rewrite, NUMBER);
  if (!sameMultiset(ns, nr)) {
    fails.push({ kind: 'NUMBER_CHANGED', detail: `${at}숫자 ${[...ns.keys()].join(',') || '없음'} → ${[...nr.keys()].join(',') || '없음'}` });
  }
  const ps = multiset(source, PERIOD);
  const pr = multiset(rewrite, PERIOD);
  if (!sameMultiset(ps, pr)) {
    fails.push({ kind: 'NUMBER_CHANGED', detail: `${at}시기 ${[...ps.keys()].join(',') || '없음'} → ${[...pr.keys()].join(',') || '없음'}` });
  }
  return fails;
}

// ── 공개 API ─────────────────────────────────────────────────────────────────

/**
 * 조립기 문장 S 와 모델이 다듬은 S′ 를 견준다. `ok === false` 면 호출자는 **S 를 그대로** 내보낸다.
 * 절대 예외를 던지지 않는다 — 검사기가 죽어서 답이 안 나가는 일은 없어야 한다.
 */
export function verifyRewrite(source: string, rewrite: string): RewriteVerdict {
  const s = (source ?? '').trim();
  const r = (rewrite ?? '').trim();
  if (s.length === 0) return { ok: false, failures: [{ kind: 'SENTENCE_COUNT', detail: '원문이 비어 있음' }] };
  if (r.length === 0) return { ok: false, failures: [{ kind: 'SENTENCE_COUNT', detail: '재작성이 비어 있음' }] };
  const src = splitSentences(s);
  const rew = splitSentences(r);
  if (src.length !== rew.length) {
    return { ok: false, failures: [{ kind: 'SENTENCE_COUNT', detail: `문장 ${src.length}개 → ${rew.length}개` }] };
  }
  const failures = src.flatMap((sentence, i) => [
    ...checkWords(sentence, rew[i], i),
    ...checkPolarity(sentence, rew[i], i),
    ...checkNumbers(sentence, rew[i], i),
  ]);
  return { ok: failures.length === 0, failures };
}

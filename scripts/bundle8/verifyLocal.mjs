// src/features/chat/server/rewriteGuard.ts
function splitSentences(text) {
  return text.split(/(?<=[.!?。])\s*|\n+/).map((s) => s.trim()).filter((s) => s.length > 0);
}
var HANGUL_BASE = 44032;
var JONG_COUNT = 28;
function stripJong(ch) {
  const c = ch.charCodeAt(0);
  if (c < HANGUL_BASE || c > 55203) return ch;
  return String.fromCharCode(c - (c - HANGUL_BASE) % JONG_COUNT);
}
var FUNCTION_STEMS = /* @__PURE__ */ new Set([
  ...[
    "\uADF8\uB9AC\uACE0",
    "\uADF8\uB798\uB3C4",
    "\uB2E4\uB9CC",
    "\uC9C0\uAE08",
    "\uC774\uBC88",
    "\uADF8\uB7F0",
    "\uADF8\uB7F4",
    "\uC774\uB7F0",
    "\uC800\uB7F0",
    "\uC5EC\uAE30",
    "\uAC70\uAE30",
    "\uBB34\uC5C7",
    "\uC5B4\uB5A4",
    "\uC544\uC8FC",
    "\uB9E4\uC6B0",
    "\uC870\uAE08",
    "\uAC00\uC7A5",
    "\uB354\uC6B1",
    "\uC5ED\uC2DC",
    "\uADF8\uB0E5",
    "\uBC14\uB85C",
    "\uBA3C\uC800",
    "\uB2E4\uC2DC",
    "\uD568\uAED8",
    "\uC11C\uB85C",
    "\uBAA8\uB450",
    "\uD558\uC9C0",
    "\uD558\uB294",
    "\uB418\uB294",
    "\uC788\uB294",
    "\uC5C6\uB294",
    "\uAC19\uC740",
    "\uC774\uB77C",
    "\uB77C\uACE0",
    "\uD55C\uB2E4",
    "\uD569\uB2C8\uB2E4",
    "\uB429\uB2C8\uB2E4",
    "\uC785\uB2C8\uB2E4",
    "\uD574\uC694",
    "\uC5D0\uC694",
    "\uC608\uC694",
    "\uC774\uC5D0\uC694",
    "\uAC70\uB4E0\uC694",
    "\uB124\uC694",
    "\uC5B4\uC694",
    "\uC544\uC694",
    "\uC774\uACE0",
    "\uC774\uBA70",
    "\uC73C\uB85C",
    "\uC5D0\uC11C",
    "\uC5D0\uAC8C",
    "\uAE4C\uC9C0",
    "\uBD80\uD130",
    "\uBCF4\uB2E4",
    "\uCC98\uB7FC",
    "\uB9CC\uD07C",
    "\uB300\uB85C",
    "\uB3D9\uC548",
    "\uACBD\uC6B0",
    "\uB54C\uBB38",
    "\uC218\uAC00",
    "\uAC83\uC774",
    "\uAC83\uC740",
    "\uD3B8\uC774",
    "\uD3B8\uC774\uC5D0\uC694",
    "\uC815\uB3C4",
    "\uAC00\uB2A5",
    "\uC218\uB3C4",
    "\uBCF4\uC785\uB2C8\uB2E4",
    "\uBCF4\uC5EC\uC694",
    "\uAC19\uC2B5\uB2C8\uB2E4",
    "\uAC19\uC544\uC694",
    "\uB9C8\uC2ED\uC2DC\uC624",
    "\uB9C8\uC138\uC694",
    "\uB9D0\uACE0",
    "\uC544\uB2C8",
    "\uC5C6\uC774",
    "\uC54A\uC2B5\uB2C8\uB2E4",
    "\uC54A\uC544\uC694"
  ].map((w) => stripJong(w[0]))
]);
function contentStems(text) {
  const out = /* @__PURE__ */ new Set();
  for (const tok of text.match(/[가-힣]{2,}/g) ?? []) {
    const stem = stripJong(tok[0]);
    if (FUNCTION_STEMS.has(stem)) continue;
    out.add(stem);
  }
  return out;
}
function checkSubset(source, rewrite) {
  const src = contentStems(source);
  const added = [];
  for (const stem of contentStems(rewrite)) if (!src.has(stem)) added.push(stem);
  return added.length ? [{ kind: "NEW_CONTENT_WORD", detail: `\uC6D0\uBB38\uC5D0 \uC5C6\uB294 \uB9D0: ${added.join(", ")}` }] : [];
}
var NEGATION = /(않|못|말고|마십시오|마세요|아니|없|없이|안\s)/g;
var HEDGE = /(수\s*있|편이|편\s|정도|가능|듯|쯤|보입니다|보여요|같습니다|같아요|수도)/g;
var count = (text, re) => (text.match(re) ?? []).length;
function checkPolarity(source, rewrite) {
  const fails = [];
  const ns = count(source, NEGATION);
  const nr = count(rewrite, NEGATION);
  if (ns !== nr) fails.push({ kind: "NEGATION_CHANGED", detail: `\uBD80\uC815 \uD45C\uD604 ${ns}\uAC1C \u2192 ${nr}\uAC1C` });
  const hs = count(source, HEDGE);
  const hr = count(rewrite, HEDGE);
  if (hr < hs) fails.push({ kind: "HEDGE_DROPPED", detail: `\uCD94\uCE21 \uD45C\uD604 ${hs}\uAC1C \u2192 ${hr}\uAC1C (\uC904\uBA74 \uB354 \uB2E8\uC815\uD574\uC9C4\uB2E4)` });
  return fails;
}
var NUMBER = /\d+/g;
var PERIOD = /(올해|내년|작년|이번\s*달|다음\s*달|지난달|상반기|하반기|초순|중순|하순|분기)/g;
var multiset = (text, re) => {
  const m = /* @__PURE__ */ new Map();
  for (const x of text.match(re) ?? []) {
    const k = x.replace(/\s+/g, "");
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
};
var sameMultiset = (a, b) => {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v) return false;
  return true;
};
function checkNumbers(source, rewrite) {
  const fails = [];
  const ns = multiset(source, NUMBER);
  const nr = multiset(rewrite, NUMBER);
  if (!sameMultiset(ns, nr)) {
    fails.push({ kind: "NUMBER_CHANGED", detail: `\uC22B\uC790 ${[...ns.keys()].join(",") || "\uC5C6\uC74C"} \u2192 ${[...nr.keys()].join(",") || "\uC5C6\uC74C"}` });
  }
  const ps = multiset(source, PERIOD);
  const pr = multiset(rewrite, PERIOD);
  if (!sameMultiset(ps, pr)) {
    fails.push({ kind: "NUMBER_CHANGED", detail: `\uC2DC\uAE30 ${[...ps.keys()].join(",") || "\uC5C6\uC74C"} \u2192 ${[...pr.keys()].join(",") || "\uC5C6\uC74C"}` });
  }
  return fails;
}
var MIN_ALIGN = 0.5;
function overlap(a, b) {
  const A = contentStems(a);
  const B = contentStems(b);
  if (A.size === 0) return 0;
  let hit = 0;
  for (const x of A) if (B.has(x)) hit += 1;
  return hit / A.size;
}
function checkAlignment(source, rewrite) {
  const src = splitSentences(source);
  const rew = splitSentences(rewrite);
  if (src.length !== rew.length) {
    return [{ kind: "SENTENCE_COUNT", detail: `\uBB38\uC7A5 ${src.length}\uAC1C \u2192 ${rew.length}\uAC1C` }];
  }
  const fails = [];
  src.forEach((s, i) => {
    if (overlap(s, rew[i]) < MIN_ALIGN) {
      fails.push({ kind: "SENTENCE_UNALIGNED", detail: `${i + 1}\uBC88\uC9F8 \uBB38\uC7A5\uC774 \uB300\uC751\uB418\uC9C0 \uC54A\uC74C: "${s.slice(0, 24)}\u2026" \u2192 "${rew[i].slice(0, 24)}\u2026"` });
    }
  });
  return fails;
}
function verifyRewrite(source, rewrite) {
  const s = (source ?? "").trim();
  const r = (rewrite ?? "").trim();
  if (s.length === 0) return { ok: false, failures: [{ kind: "SENTENCE_COUNT", detail: "\uC6D0\uBB38\uC774 \uBE44\uC5B4 \uC788\uC74C" }] };
  if (r.length === 0) return { ok: false, failures: [{ kind: "SENTENCE_COUNT", detail: "\uC7AC\uC791\uC131\uC774 \uBE44\uC5B4 \uC788\uC74C" }] };
  const failures = [
    ...checkSubset(s, r),
    ...checkPolarity(s, r),
    ...checkNumbers(s, r),
    ...checkAlignment(s, r)
  ];
  return { ok: failures.length === 0, failures };
}
export {
  verifyRewrite as verifyRewriteLocal
};

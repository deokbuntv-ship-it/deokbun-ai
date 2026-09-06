// 공유 카드 문구 — pure data, no React, so the rules about it can be tested without a harness.
//
// ── 2026-09-06: WHY THE CONCLUSION IS STILL NOT IN THE CARD, AND WHY THAT IS NOW FINE ────────
//
// The owner asked for the conclusion in the card. It cannot be done in this build, and the
// reason is structural rather than a judgment call:
//   · `app.json` sets `web.output: "static"`. The web app is a static export.
//   · A messenger's link-preview crawler does NOT run JavaScript. It reads the HTML as served.
//   · A share URL is `/shared-report/<token>` — the token exists only at runtime, so there is no
//     way to pre-render per-token HTML at build time, and a query parameter cannot change a
//     static <meta> either (same no-JS reason).
//   · There is no Vercel function, no middleware, and no Expo API route in this repo to render
//     one on request (verified 2026-09-06).
// Getting the conclusion into the card therefore requires a NEW server endpoint. Options and
// sizing are written up in PROJECT_STATE §7.19; it is an owner-approvable next step, not
// something to slip in untested — the endpoint would return report conclusions by token to any
// caller, and this session cannot deploy or test a Vercel function.
//
// WHAT CHANGED INSTEAD, AND WHY IT ADDRESSES THE ACTUAL PROBLEM:
// the card's job was never to deliver the conclusion — it was to earn the tap. The reason the
// old card failed was not that it lacked a teaser; it was that TAPPING IT HIT A LOGIN WALL. That
// is now fixed: an anonymous visitor lands on the conclusion. So the card can promise something
// true and immediate — "결론을 바로 볼 수 있다" — which is a much stronger hook than a blank card,
// and honest in a way a static teaser about someone else's result could not be.
//
// PRODUCT_TRUTH_GUARD: no 적중률, no ranking, no "최고의 시기", no "3학문 종합". The copy claims
// only that a result exists and can be read.
export const SHARE_CARD = {
  title: '궁합 결과가 도착했어요',
  description: '친구가 보낸 결과예요. 결론은 가입 없이 바로 확인하실 수 있어요.',
} as const;

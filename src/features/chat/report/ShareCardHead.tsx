import { SeoHead } from '@/features/publicSite';

import { SHARE_CARD } from './shareCardCopy';

// 공유 카드 — what KakaoTalk (or any messenger / OG crawler) renders BEFORE anyone clicks.
//
// Until now `/shared-report/[token]` emitted no head at all, so a shared link previewed with
// whatever the root document happened to say. That is the "card" the compatibility-share track
// was missing; the link itself already worked end to end.
//
// ── THREE DECISIONS, AND WHY ────────────────────────────────────────────────────────────────
//
// 1. NOTHING FROM THE REPORT IS IN THE CARD. Not the conclusion, not a teaser line, not the
//    score. Three reasons, any one of which is sufficient:
//      · A KakaoTalk card is rendered to the WHOLE ROOM, not to the person you sent it to. A
//        궁합 conclusion is a fact about two named people and their relationship; putting it in
//        a preview publishes it to everyone in the chat, including whoever is added later.
//      · The web build is a STATIC export. There is no server to render per-token OG meta, and
//        a crawler does not run JS, so a personalized card would need a new server — which this
//        track explicitly must not add.
//      · The report costs 덕. A preview that carries the conclusion is the product, free.
//    The card therefore says only that a report is waiting. Anyone curious has to open the app,
//    which is the point of sharing.
//
// 2. NO NAMES, NO BIRTH DATA — the card carries no personal information at all, so there is
//    nothing to leak even if the link is forwarded to strangers. Behind the card the existing
//    §22 rule still holds: `get_shared_report` returns null unless `auth.uid()` is set, so a
//    logged-out visitor never reaches the content either.
//
// 3. `noindex`. A share token is a capability URL. It must never enter a search index, and a
//    preview crawler is not a search crawler — we want the former and refuse the latter.
//
// EXPIRY is unchanged: `report_shares.expires_at` already defaults to 30 days and the owner can
// revoke. Nothing here extends that.
//
// VIRAL MEASUREMENT is already possible without a new parameter: `report_shares.channel`
// (link/email/kakao) records HOW it was shared and `opened_count` / `last_opened_at` record that
// it was opened. Appending `?ad=` would pollute the advertising code space with organic traffic
// and make CAC wrong — the two are different questions and already have different columns.
//
// The copy itself lives in ./shareCardCopy.ts so its rules are testable without a render harness.
export function ShareCardHead() {
  return (
    <SeoHead
      title={SHARE_CARD.title}
      description={SHARE_CARD.description}
      noindex
    />
  );
}

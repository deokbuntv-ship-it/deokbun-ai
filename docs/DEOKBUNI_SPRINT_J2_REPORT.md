# DEOKBUNI SPRINT J2 — CONSUMER COMPLETION & TRUST REPORT

**Date:** 2026-08-22 · **Branch:** `admin/master-operations-content` · **Scope:** consumer client/UI only.
No store provisioning · no production · no Codex · frozen engines untouched.

---

## 1. J1 Freeze Commit
J1 preserved as a clean local commit (plus the 04E–05A backend it depends on, so the J1 commit is self-contained):

```
J1_LOCAL_FREEZE_COMMIT = c88d0268760c69fa20d6ed61eb37a84264131f50
```
- `8ac95aa` — feat(duk): activation 04E–05A backend (analytics outbox, INSUFFICIENT_DUK contract, IAP seam, migrations, edge config, reports)
- `c88d026` — **feat: add consumer duk economy surface** ← the J1 freeze
- Excluded (owner WIP, marked "구현 아님 / no commit"): `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md` — left untracked, reported, not folded in.
- Nothing pushed.

## 2. AI Disclosure
One canonical wording, one component, rendered on every AI-output surface.
- `src/features/legal/aiDisclosure.ts` — `AI_DISCLOSURE_TEXT` (matches spec §2 verbatim), `AI_DISCLOSURE_SHORT`, versioned `AI_DISCLOSURE_DOC`. (Note: the older `docs/AI_DISCLAIMER_CONTRACT.md` draft said "해당 분야의 전문 정보"; I used the **spec §2** wording "전문적인 정보".)
- `src/components/AiDisclosure.tsx` — shared presentational component (`inline`/`card`, theme-aware).
- Rendered on: general consultation (`chat.tsx`), compatibility (`compatibility-chat.tsx`), today (`today.tsx`), monthly (`monthly.tsx`), and the premium report (`PremiumReportView.tsx` — covers both `/report/[id]` and `/shared-report/[token]`).
- Standalone surface `/ai-notice` (factual notice, no false DRAFT banner) linked from MY.
- Prompts/engine semantics untouched.

## 3. Consultation UX
Audited end-to-end. States confirmed present: initial loading (`ConsultationLoading`), sending (re-entrancy locked), success, follow-up, **session remaining turns** (J1 `sessionTurnCopy`, shown only for a live session), **insufficient Duk** (actionable → /wallet, /duk-topup), auth failure (login CTA + question preserved), request failure (retry), safety (server-handled). No raw codes/stack/IDs shown. Added the AI disclosure footer (once, not per message).

## 4. Compatibility UX
12-Duk price shown before start; dedicated actionable insufficient-Duk paywall; error copy now uses the shared consumer taxonomy (no generic collapse); AI disclosure frames the result as **분석/해석, not certainty**. No winner/guarantee language introduced; frozen comparison semantics untouched (engine diff 0).

## 5. Today / Monthly UX
AI disclosure added under each result. States verified: loading (spinner), no-self empty, success, unavailable, error + "다시 시도". No new astrology logic; evaluation semantics untouched.

## 6. Onboarding → Welcome → First Consultation
Traced: login → resolver → terms (server grants 10 Duk via consent trigger) → birth (creates canonical SELF) → Home. Added a **one-shot, dismissible welcome card** on Home (fires only on genuine first SELF creation, via an in-memory `welcomeSignal`) that states "+10덕 받음" and the economy (일반 5덕 / 궁합 12덕 / 촛불 +1덕). No tutorial, no client grant. Path has no dead ends.

## 7. Duk Education
Covered without modal spam: the one-shot Home welcome card + the permanent "덕은 이렇게 쓰여요" section in `/wallet` + the 12덕 price on the compatibility entry. All copy sourced from `pricing.ts` (single display source).

## 8. Mailbox / mail-detail
`mail-detail` was a **true orphan** (zero callers; backing `getMailDetail`→null). **Removed** (Option B): deleted `mail-detail.tsx`, its `_layout` registration, the stale test-exclusion, the dead detail types + `getMailDetail` from `fortuneMail.ts`, the `fortune/index.ts` re-exports, and a stale comment. Kept `listMail`/`FortuneMailItem` (Home uses them). Admin fortune-mail feature untouched. The inbox opens canonical Today/Monthly/Report records directly — no dead route remains.

## 9. MY / Settings
No dead links; no admin/internal leakage. Reachable: profile/birth (account card now taps → 분석 대상자 관리 where SELF is edited — was 3 taps deep), Duk wallet, notification settings, terms, privacy, **AI notice (new)**, logout. Consent re-management post-onboarding remains view-only (MEDIUM, below).

## 10. Error Taxonomy
New single source `src/features/errors/consumerErrorCopy.ts` — `ConsumerErrorCode` (all 8 required codes + INVALID_INPUT/SAFETY_HANDLED/SERVICE_UNAVAILABLE) → `{kind, message, canRetry}`. Fills prior gaps (SESSION_EXPIRED, NETWORK, PROFILE_REQUIRED, CONSENT_REQUIRED had no consumer copy). Compatibility-chat now consumes it (no more generic collapse); compatibility tab error state uses it. Unknown codes degrade to a safe retryable message. No auto-retry of financial/LLM requests bypasses idempotency (retry re-sends the same request id; server idempotency is authority).

## 11. Empty / Loading / Error States
Fixed: compatibility **tab** now has a real error+retry branch (was misrendering load errors as "register self"); wallet balance error now offers 다시 시도; inbox 운세/보고서 error states now have retry buttons (reload nonce). Home still swallows section-fetch errors silently but never renders blank (falls back to empty copy) — noted MEDIUM.

## 12. Navigation
5 tabs unchanged (홈/상담/궁합/운세우편함/MY). **Fixed a real J1 dead-end:** `wallet` and `duk-topup` passed `onBack` but omitted `showBack`, so no back arrow rendered (web dead-end) — both now pass `showBack`. No navigation loops; onboarding gate is idempotent; deep links use a closed allowlist.

## 13. Brand Consistency
Consumer brand is **덕분이** everywhere — audit found **zero** consumer-facing `덕분AI`/`DeokbunAI` leaks (a brand-lock test already guards this). Legacy `덕분AI` appears only on operator-only admin screens and server content-generation prompts (INTERNAL, out of consumer scope). No changes required.

## 14. Accessibility
New interactive elements carry `accessibilityRole="button"` + labels (Home chip, welcome card dismiss, MY rows, back arrows). Disclosure carries an `accessibilityLabel`. Touch targets ≥44px (dismiss/rows). Existing safe-area/keyboard behavior unchanged. No visual redesign.

## 15. Duplicate Submission Safety
Already robust (verified, no change): chat uses a synchronous `isSendingRef` re-entrancy lock; compatibility uses `sendingRef`; the candle button disables unless `eligible` and flips to `claiming` on press. Server idempotency remains the authority; client state is UX-only. Locked by a new guard test.

## 16. Policy Surfaces
| Surface | Route | Classification |
|---|---|---|
| 서비스 이용약관 | `/terms-of-service` | IMPLEMENTED_UI · DRAFT_CONTENT · **LEGAL_REVIEW_REQUIRED** |
| 개인정보 처리방침 | `/privacy-policy` | IMPLEMENTED_UI · DRAFT_CONTENT · **LEGAL_REVIEW_REQUIRED** |
| AI 생성 콘텐츠 안내 | `/ai-notice` (new) | **IMPLEMENTED_UI** (factual notice) |
| 결제/환불/미성년자 정책 | — | NOT_PRESENT · DEFERRED (no payment in V1 / 05B store deferred) · LEGAL_REVIEW_REQUIRED when store lands |

No lawyer-final text invented; drafts show a visible 검토 중 banner.

## 17. Client Analytics
Architecture preserved; no new PII; analytics never blocks consumer flow (existing `void track(...).catch()` pattern). The deferred gate `CLIENT_ANALYTICS_PRODUCTION_LIKE_LIVE_CHECK` remains open (not rebuilt this sprint).

## 18. User Flow Audit
| Flow | Result |
|---|---|
| A login→onboarding→Home→consultation | ✅ welcome card fires; no dead end |
| B Home→wallet→candle→Home refreshed | ✅ shared wallet store; back now works |
| C compat→12덕→insufficient→wallet/candle/top-up | ✅ actionable; top-up back now works |
| D consultation→first turn→follow-up→remaining turns | ✅ session hint when live |
| E Home→Today→Monthly/mailbox | ✅ inbox→today/monthly/report; mail-detail gone |
| F MY→birth/profile→terms/privacy→wallet→logout | ✅ all reachable, incl. new AI notice |

No remaining dead-ends.

## 19. Tests
Full suite: **179 suites / 1787 tests PASS** (+34 vs J1). New: `aiDisclosure.test.ts` (wording), `consumerErrorCopy.test.ts` (8 codes, no raw terms, safe fallback), `welcomeSignal.test.ts` (one-shot), `consumerTrustJ2.test.ts` (disclosure on all 5 surfaces, mail-detail gone + no callers, AI notice reachable, double-submit locks, wallet/top-up back). Edited `globalBell.test.ts` (dropped mail-detail exclusion).

## 20. Frozen Core
`git diff HEAD` of `myungri`/`qimen`/`ziwei` = **0 lines**; `chat/server` + `chat/prompts` + `polarity` = **0 lines**. Duk prices, session billing, welcome/candle amounts, debt policy, IAP server authority — all untouched.

## 21. Production Mutation Count
**PRODUCTION_MUTATIONS = 0.** J2 issued one DB command total — a read-only SELECT against **staging** `aephpsiurgkvqcswyeie`. Production `olvkpaldrwvtexxpoaag` was never contacted. No migration, no deploy, no flag change, no store provisioning.

## 22. BLOCKER
None.

## 23. HIGH
None open. (The J1 wallet/duk-topup back-arrow dead-end — the one HIGH found — is fixed.)

## 24. MEDIUM
1. Home silently swallows section fetch errors (never blank, but no error affordance) — add a subtle retry later.
2. Consent/marketing opt-in is only set during onboarding; no post-onboarding re-management screen.
3. Operator/admin screens still show raw terms (errorCode, "Edge Function", "LLM", conversation UUIDs) — acceptable for operators, out of consumer scope; tidy in an admin sprint.

## 25. Owner Action Required
- None to ship J2 (client-only, staging-safe, nothing pushed). Review commits `8ac95aa`/`c88d026` + J2 working tree; push when ready.
- Before public launch: finalize legal copy (terms/privacy → LEGAL_REVIEW_REQUIRED) and resolve `CLIENT_ANALYTICS_PRODUCTION_LIKE_LIVE_CHECK`.

## 26. Recommended Next Sprint
**J3 — Pre-launch polish & monitoring:** Home error affordance + consent re-management, admin operator-copy tidy, the client-analytics production-like live check (needs a runnable build), and a11y pass on real devices. (Store/05B stays deferred.)

---

### Exact verdicts
```
J1_LOCAL_FREEZE            = PASS   (c88d026)
AI_DISCLOSURE              = PASS
GENERAL_CONSULTATION_UX    = PASS
COMPATIBILITY_UX           = PASS
TODAY_MONTHLY_TRUST_UX     = PASS
ONBOARDING_FIRST_USE_LOOP  = PASS
MAILBOX_ROUTE_CLEAN        = PASS
ERROR_COPY_STANDARDIZED    = PASS
NO_RAW_BACKEND_ERRORS      = PASS   (consumer surfaces; admin operator-only noted)
BRAND_USER_FACING          = PASS
PRIMARY_NAVIGATION         = PASS
POLICY_SURFACES            = PASS
FROZEN_CONSULTATION_CORE   = YES
CLIENT_CAN_GRANT_DUK_DIRECTLY = NO
ECONOMY_DIAGNOSTICS        = PASS   (0 anomalies, staging read-only)
PRODUCTION_MUTATIONS       = 0
```

**SPRINT_J2_COMPLETE**

DEOKBUNI_SPRINT_J2_COMPLETE

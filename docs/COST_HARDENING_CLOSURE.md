# 덕분이 V1.0 — Cost / Server-Authority Hardening (Closure A/B)

Companion to the final-closure sprint. Records what shipped, and the precise design for the higher-risk /
owner-gated items intentionally NOT shipped (they need either a live-testable edge-persistence rewrite, a
product decision, or remote DB state that cannot be inferred from the repo). Nothing here is implemented
beyond what the commits below state.

## Shipped (this sprint)

| Commit | What |
| --- | --- |
| `52cb8c1` feat(edge) | Burst limiter counts **all** paid-LLM request types (`chat` + `today_fortune` + `monthly_fortune`), closing the unbounded-fortune-generation gap. Server-authoritative **input bounds** (`validateConsultationInputBounds`) reject oversized untrusted payloads (413) before any LLM work. serverBundle regenerated + audited. **EDGE_DEPLOY_REQUIRED.** |
| `ce32085` feat(fortune) | **Atomic generation claim** (`fortune_generation_claims`, migration `20260827000000`): only ONE concurrent first-load generates; losers wait for the winner's persisted result (0 LLM). Fail-open. Client-only + migration. |
| `46c3052` fix(notifications) | Shared unread badge scoped to `user.id` + stale-response token (privacy). Client-only. |

Cost invariants are unit-tested (`generationClaim.test.ts`, `inputBounds.test.ts`); **live Postgres claim
atomicity + live edge behavior remain OWNER E2E** — jest/Node cannot prove them (no Deno/Supabase locally).

## Remaining — design, not shipped

### A4 · Request idempotency (consultation)
Today a lost-response network retry re-sends and re-spends. The edge already sanitizes `requestMetadata.requestId`
but only logs it. Design: persist consultation answers keyed by `(user_id, requestId)`; on a repeat requestId,
return the stored answer without a new LLM call. Client must generate the requestId **before** the first send
(so a retry reuses it). Scope the key to the authenticated user (never let a requestId read another user's
result). Why deferred: needs an edge write-path + a small table + a client contract change, and the dedup is
only provable against a live edge.

### A5+/A6 · Edge-enforced claim + server-authoritative persistence
The shipped claim is **client-side** (honest-client-safe; a modified client that skips the claim and hits the
edge directly is still bounded by the `52cb8c1` rate limit, but not claim-deduped). Full modified-client
safety = move the claim + persistence into the edge: before generating, the edge (service-role) does
`insert daily_fortunes(user_id, fortune_date, status='generating') on conflict do nothing`; only the winner
generates + `update`s the row to complete; conflict → return the existing row (complete) or `GENERATION_IN_PROGRESS`
(409). This is backward-compatible with the current client (its `persist` upsert `ignoreDuplicates` no-ops).
Why deferred: it moves persistence server-side + adds a `status` column + is untestable-live — high regression
risk to a working pipeline while the owner is away.

### A7 · Canonical SELF / birth authority (server)
The consumer consultation path accepts a raw client `birthInput`. Design: for an authenticated stored
consultation, the edge should derive the canonical SELF subject + its stored birth profile from the JWT user
(service-role read), rather than trusting arbitrary client birth input; if `subjectProfileId` is sent, verify
its owner server-side. Keep compatibility TARGET semantics separate (a partner is legitimately not the SELF).
Why deferred: edge identity refactor, untestable-live, and must not break the compatibility target path.

### A8 · Onboarding / consent server enforcement
Authenticated ≠ product-authorized. Design: one server-side authorization resolver the edge calls before any
paid consultation/fortune — required consent version accepted + onboarding complete + SELF birth profile
exists — returning typed `CONSENT_REQUIRED` / `ONBOARDING_REQUIRED` / `PROFILE_REQUIRED`. Today these are
enforced only by client navigation (`OnboardingGate`). Why deferred: edge change; pairs with A7.

### A11 · Rate-limit failure policy
`checkBurstRateLimit` currently **fails open** (a DB read error → allow). For expensive generation the sprint
prefers fail-closed with a temporary-unavailable error — but flipping it risks blocking all generation on a
transient `ai_usage_logs` read blip, and cannot be validated locally. **Owner decision required**; cached
reads must stay available regardless.

### Phase B (client-scoped)
- **B1 notification user-scope — SHIPPED** (`46c3052`).
- **B2 auth continuation allowlist — REVIEW, not changed.** The consultation `ALLOWED_RETURN_TO` (question
  preservation) is narrow; the **notification** deep-link path uses `resolveDeepLinkPath` (retention/deepLinks),
  which already allowlists TODAY/MONTHLY/MAILBOX/CONSULT/COMPATIBILITY/REPORT/LIFE_EVENT. Adding `/monthly`,
  `/notifications`, etc. to the consultation returnTo has no flow that sets them; changing a security allowlist
  speculatively was avoided per "do not blindly add paths." Recommend a typed continuation review before adding.
- **B3 compatibility conversation identity — DEFERRED.** Verify the conversation lookup is keyed on
  owner+SELF+TARGET (+version), and that a stored `subject_snapshot` mismatch does not silently attach a prior
  history to a different current SELF. Reuse A4 idempotency to avoid duplicate re-send spend.
- **B4 shared-report response headers — DEFERRED.** `Referrer-Policy: no-referrer` + sensitive `Cache-Control`
  for `/shared-report/[token]` belong at the web-serving layer (Expo static export has no per-route header
  config); apply at the CDN/host. Share tokens themselves are already hash-only + expiring + revocable.
- **B5 admin migration reproducibility — PREPARE, not converted.** `public.is_admin()` + most admin RPCs live
  in `docs/admin/*.sql` (owner-applied), and `docs/ADVERTISEMENTS_SETUP.sql` is HOLD — so a clean rebuild from
  `supabase/migrations/` alone fails at `20260824` (`create policy … using(public.is_admin())`). **The owner
  has already applied these remotely; remote state is NOT inferable from the repo.** Do NOT re-emit these as
  migrations blindly (duplicate-object risk). Reconciliation plan: add ONE additive, idempotent migration that
  `create or replace`s `is_admin()` + the admin RPCs guarded by `if exists`/`create ... if not exists`, ordered
  BEFORE `20260824`, only after the owner confirms remote definitions match — otherwise keep them as
  owner-applied artifacts and document the apply order.

## Monetization seam (FREE / PLUS) — architecture only, nothing built

Current: all users FREE; model selection is already **server-authoritative** (edge `readServerConfig`,
`DEFAULT_MODEL`/`LLM_MODEL`); the client cannot choose the model (the `gpt-mini-placeholder` client value is
ignored). Recommended seam:

- **Subscription record:** a server table (e.g. `user_subscriptions`) written only by verified store/webhook
  callbacks (never the client).
- **Entitlement resolver:** one server function `resolveEntitlement(user_id) → 'FREE' | 'PLUS'` (default FREE),
  called by the edge. Client never asserts tier.
- **Model router:** in the edge, map tier → model (`FREE_MODEL` / `PLUS_MODEL`) at the single existing
  selection point — a small additive change, no client spoof surface.
- **Quota policy:** reuse the burst window + the claim; add per-tier ceilings server-side if desired.
- **Canonical key + provenance:** result rows already store `model` + `policy_version` + `evidence_version`;
  add a `tier` column (small additive migration) so a record's provenance includes which entitlement produced
  it. Do NOT add `tier` to the canonical uniqueness key unless a tier change should force regeneration.

Insertion difficulty: **SMALL–MODERATE additive.** No destructive refactor is required later.
**MONETIZATION_REVIEW_REQUIRED_BEFORE_V1_FREEZE = YES.**

## Legal — owner must supply (report only; nothing invented)
Business/operator legal name; contact + privacy-contact channel; retention/deletion policy decisions; AI-provider
disclosure decisions; marketing/Kakao-channel consent wording. Policy docs are real but **DRAFT** (versioned,
consent-tracked, DRAFT-bannered) — final wording is an owner/lawyer action. **Account deletion/withdrawal:** a
dedicated technical deletion mechanism was not located; minimal plan = a server RPC that deletes/anonymizes the
user's owned rows (owner-only, cascade) invoked from a MY → 회원 탈퇴 flow — NOT implemented here (destructive;
needs explicit owner approval).

## Owner actions

**Apply (in order) + deploy:**
```bash
# 1) Apply the new claim table migration (after the earlier OWNER_APPLY migrations + docs/admin/*.sql)
supabase db push        # includes supabase/migrations/20260827000000_fortune_generation_claims.sql

# 2) Deploy the chat edge — the regenerated serverBundle carries the rate-limit fix + input bounds
supabase functions deploy chat
```
- **MIGRATION_REQUIRED = YES** — `20260827000000_fortune_generation_claims.sql`.
- **EDGE_DEPLOY_REQUIRED = YES** — serverBundle changed (`52cb8c1`); also still carries the earlier 덕분이 prompt
  self-name (`cf8113b`).
- No client-only reload needed beyond a normal build; the claim + badge fixes ship with the client bundle.

## Owner E2E (runtime — what code/tests cannot prove)
A. **Today normal:** login → Today → generate (1 LLM) → reopen (0 LLM).
B. **Today concurrency:** two tabs/devices open Today simultaneously → exactly one generation; the other waits
   and shows the SAME canonical result (0 extra LLM).
C. **Monthly** — same as A + B.
D. **Consultation retry:** double-click / network retry → one logical answer (A4 not yet shipped — expect a
   possible duplicate today; verify after A4).
E. **Consultation normal:** a new question → a new valid answer.
F. **Rate limit:** exceed the window via a controlled local method → blocked (429) before any LLM.
G. **Onboarding bypass:** authenticated-but-incomplete account hitting the edge directly (A8 not yet shipped —
   expect client-gate only; verify after A8).
H. **Canonical SELF:** modified client birthInput (A7 not yet shipped — verify after A7).
I. **Compatibility:** normal SELF+TARGET works; wrong-owner target rejected.
J. **Notification account switch:** A logged in (has unread) → logout → B login → B never sees A's count/list.

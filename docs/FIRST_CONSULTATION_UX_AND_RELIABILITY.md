# First Consultation UX & Client Reliability (Sprint 2A)

> How a first-time user gets from "궁금한 게 있어요" to a first answer without losing work
> across the login interruption, and how the chat client handles failures. Claude Code
> owns this flow; engine semantics are Codex (Sprint 1B). No engine files touched.

## First-time journey (as-built, after Sprint 2A)
```
Home(홈) type question ─▶ (no subject) PersonSelectorSheet ─▶ 새 대상자 → birth-info
        │                         │ pick existing subject ─────────────┐
        └─(subject exists)────────┴──────────────────────────────────▶ /chat
birth-info 상담 시작하기 ───────────────────────────────────────────▶ /chat
/chat: question prefilled (never auto-sent) → 전송 → chatService.sendMessage
        → authGuard ✓? ── no ──▶ AUTH_REQUIRED → 로그인하기 → /login
                                     login success → resume to /chat (returnTo)
                                     → question restored in composer → 전송 → answer
        └─ yes ──▶ context → prompt → Edge → OpenAI → answer → persist → history
```

## Auth interruption = interruption, not reset (§9)
The typed question and the resume route are held in a small **pending consultation
intent** (`src/features/consultation/pendingConsultationIntent.ts`) — NOT the draft
(subject/birth are already persisted by `ConsultationDraftContext`, which adopts an
in-memory draft on fresh login and saves it). The intent is set when a consultation
needs auth and **consumed on resume**.

## Resume contract
- **login.tsx** on success → `router.replace(consumePendingReturnTo() ?? '/')` — resume
  the consultation, else Home.
- **login-callback.tsx** (direct/full-page fallback) → `resolveOAuthReturn(status, peek…returnTo)`.
  It **peeks** so the opener window (login.tsx) stays the single consumer in the popup flow.
- **chat.tsx** on mount → prefers `?q=`, else `consumePendingQuestion()`; **never auto-sends**
  (§29 — the user reviews and taps 전송, so resume can't double-send).

## Draft lifecycle (unchanged, relied upon)
`ConsultationDraftContext`: in-memory reducer + DB persistence keyed by `user_id`
(authenticated only). Fresh login with in-progress work → adopts + persists the draft, so
**subject + birth-time status (정확/대략/모름) survive login** without re-entry.

## Subject lifecycle & the temp-subject note (§21/§22 — finding, not fixed here)
`birth-info` 상담 시작하기 creates a **temporary** subject (`temp:` id, not a UUID). Chat
keys conversation persistence on `isSavedSubjectId`, so a temp-subject consultation is not
subject-scoped and won't appear under 최근 상담. This is a **findability** issue, distinct
from auth continuity, and is left as a follow-up (promote the temp subject to a saved
`consultation_subjects` row on the first authenticated send) rather than fixed in this
reliability sprint. Recorded as `S2A-FINDING-1`.

## Error mapping (§32–§35) — `src/features/chat/consultationErrors.ts`
| code | kind | user sees | action |
|---|---|---|---|
| `AUTH_REQUIRED` | auth | 로그인이 필요해요… 이어서 물어볼 수 있어요 | 로그인하기 (then resume) |
| `REQUEST_FAILED` | recoverable | 답변을 가져오지 못했어요… 다시 시도 | **다시 시도** (retry) |
| `NOT_CONFIGURED` | blocked | 상담 기능을 준비 중이에요 | (no endless retry) |
| `INVALID_INPUT` | input | 메시지를 다시 확인해 주세요 | — |

Errors render as an **inline card** above the composer (not a fake assistant bubble). No
internal code is ever shown to the user.

## Retry safety (§30/§36/§37)
"다시 시도" re-sends the **same** question with its original context via `runSend` — it does
**not** add a second user bubble, does **not** re-persist the user message, and cannot
double-charge tokens. The `isSending` guard + disabled composer prevent double-tap.
Login-before-LLM is unchanged: `chatService` still returns `AUTH_REQUIRED` before any
adapter call, so resume can never call the LLM before auth (§57).

## Security & privacy
- **No open redirect (§15/§52):** `returnTo` is restricted to an internal-route allowlist
  (`isSafeReturnTo`) and re-checked in `resolveOAuthReturn` (defense-in-depth). External /
  `//` / `javascript:` / `data:` / off-list values fall back to Home. Locked by tests.
- **No sensitive data in the URL (§20):** the question travels in the ephemeral store, not
  a query string, on the sheet/birth path. (The pre-existing subject-path `?q=` is
  unchanged; see `S2A-FINDING-2` if URL-question privacy is tightened later.)
- **Ephemeral storage (§17/§19):** sessionStorage on web (tab-scoped, cleared on tab
  close, consumed on use), in-memory on native. Never localStorage, never DB, never logs.
- **OAuth core untouched:** state/CSRF/takeover guard and the verified Naver bridge are
  unchanged; the resume only picks the post-login destination.

## Production smoke procedure (§73/§74) — run once Codex 1B + Owner config land
Golden E2E: new user → 상담 → birth info → "내 사주풀이 좀 해줘" → (engine-grounded) answer →
follow-up → history. Sprint 2A does NOT implement the engine-grounded answer.

Smoke matrix — mark `NOT_VERIFIED` until actually run:
| case | Desktop Web | Mobile Web |
|---|---|---|
| Naver login → resume to chat + question restored | NOT_VERIFIED | NOT_VERIFIED |
| Google login → resume | NOT_VERIFIED | NOT_VERIFIED |
| Kakao login → resume | NOT_VERIFIED | NOT_VERIFIED |
| new user first consultation (no re-entry of birth/question) | NOT_VERIFIED | NOT_VERIFIED |
| returning user (draft restored from DB) | NOT_VERIFIED | NOT_VERIFIED |
| recoverable failure → 다시 시도 (no duplicate) | NOT_VERIFIED | NOT_VERIFIED |
| login cancel → draft/question intact | NOT_VERIFIED | NOT_VERIFIED |

Owner config still required (`OWNER_ACTION_REQUIRED`): `OPENAI_API_KEY` + edge deploy, DB
apply, OAuth console (Kakao KOE205/Google). See `docs/OWNER_ACTIONS_AND_DECISIONS.md`.

## Known limitations (recorded by the second-pass red-team; not fixed here)
- `S2A-FINDING-1`: temp-subject consultations are not findable in 최근 상담 (promote on
  first authenticated send — follow-up).
- `S2A-FINDING-3` (session expiry mid-send): a truly-dead session (expired refresh token)
  returns a generic edge error → `REQUEST_FAILED` (recoverable) rather than `AUTH_REQUIRED`.
  It self-corrects: `authGuard` reads LIVE auth state, so once Supabase's auth listener
  flips to signed-out, the next 다시 시도 returns `AUTH_REQUIRED` → login → resume (the
  question is staged then). A crisper fix maps the edge 401 to `AUTH_REQUIRED` directly
  (needs the adapter to surface HTTP status) — deferred to avoid touching the verified
  error contract.
- `S2A-FINDING-4` (retry idempotency): 다시 시도 does not duplicate the bubble or re-persist,
  but each attempt uses a fresh requestId, so a response that succeeded server-side yet
  failed client-side (rare) could re-charge tokens on retry. A client→edge idempotency key
  is the proper fix (edge change) — follow-up.
- `S2A-FINDING-5` (orphan screen): after resume, `router.replace('/chat')` leaves the
  pre-login chat instance below in the stack; the active resumed screen is correct, but a
  back-nav could surface the stale instance. Low; navigation-stack cleanup is a follow-up.
- Engine-grounded answers are Codex Sprint 1B; this sprint is UX/reliability only.

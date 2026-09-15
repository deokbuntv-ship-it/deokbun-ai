# Beta Production Readiness (Sprint 2B)

> ⚠ **HISTORICAL — Sprint 2B 기준.** 현재 상태는 `PROJECT_STATE.md`, 기능 판정은 `FEATURE_MASTER_CHECKLIST.md`, 오너 액션은 `OWNER_TODO.md`.
> 이 문서의 테스트 수치·게이트 상태는 낡았다 (실제: **298 suites / 4,841 tests**, 2026-09-04).


> Code-verified inventory of what production needs, what exists, and what only the Owner
> can do — the operational baseline for a Nov-2026 beta. No secret values here. "Applied
> in the live Supabase project" is **not derivable from the repo** → `OWNER_VERIFY` on all
> DB/edge state. Companion to `docs/OWNER_ACTIONS_AND_DECISIONS.md` (the action queue) and
> `docs/DEOKBUNAI_V1_SINGLE_SOURCE_OF_TRUTH.md`.

## 1. Environment variables (33 total — names + roles only)
| Var | Side | Class | Set by | Req | Status |
|---|---|---|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` / `…PUBLISHABLE_KEY` | CLIENT | PUBLIC | Owner (Vercel) | ✔ | `PUBLIC_OK` (RLS-guarded) |
| `EXPO_PUBLIC_NAVER_CLIENT_ID` | CLIENT | PUBLIC | Owner | ○ | `PUBLIC_OK` (feature-gates Naver) |
| `EXPO_PUBLIC_PUBLIC_BASE_URL` | CLIENT | PUBLIC | Owner | ○ | `OPTIONAL` (share/sitemap) |
| **`OPENAI_API_KEY`** | SERVER | **SECRET** | Owner (edge secret) | ✔ | `SERVER_SECRET` — **required for all LLM/image** |
| **`NAVER_CLIENT_SECRET`** | SERVER | **SECRET** | Owner (edge secret) | ✔(naver) | `SERVER_SECRET` (never `EXPO_PUBLIC_`) |
| `NAVER_CLIENT_ID` | SERVER | id | Owner | ✔(naver) | `OWNER_REQUIRED` |
| **`GEMINI_API_KEY`** / `GOOGLE_API_KEY` | SERVER | **SECRET** | Owner | ○(video) | `SERVER_SECRET` (Veo only) |
| `SUPABASE_URL` / **`SUPABASE_SERVICE_ROLE_KEY`** | SERVER | auto | Supabase runtime | ✔ | `SUPABASE_AUTO` — **never client** |
| `LLM_MODEL`, `LLM_MAX_OUTPUT_TOKENS`, `CHAT_RATE_*`, `CONTENT/PREMIUM_*`, `IMAGE_*`, `VIDEO_*` | SERVER | non-secret | Owner | ○ | `OPTIONAL` (in-code fallbacks) |

**Client-bundle safety:** no secret ever carries `EXPO_PUBLIC_`; `service_role` is
edge-only. Verified by scan + `naverAuth.test.ts`. See `docs/ENV_CONTRACT.md`.

## 2. Edge functions (supabase/functions/*)
| Function | verify_jwt | Secrets | Status |
|---|---|---|---|
| **chat** (consultation LLM boundary) | true | `OPENAI_API_KEY` | `CODE_READY` — needs secret + deploy + E2E |
| naver-auth (Naver→Supabase bridge) | false (by design) | `NAVER_CLIENT_ID/SECRET` | **`PROD_VERIFIED`** (2026-08-12) |
| content-generate / famous-suggest / media-generate | true (admin-gated) | `OPENAI_API_KEY` | `CODE_READY` — owner deploy |
| video-generate / video-status | true (admin-gated) | `GEMINI_API_KEY` | `OWNER_DEPLOY_REQUIRED` |

All read the user id by decoding the (platform-verified) JWT `sub`; privileged writes use
the service-role client. All 7 config.toml entries have matching code (no orphans).

## 3. Database + RLS readiness (artifacts complete; apply state UNKNOWN)
Every core table has a correct RLS artifact — **no RLS gap found**:
- **Owner-scoped** (`auth.uid()`): `profiles`, `consultation_subjects`,
  `consultation_drafts` (M1 closed via WITH CHECK), `conversations` (INSERT also verifies
  subject ownership), `conversation_messages` (append-only via parent join), `fortune_mail`.
- **Lockdown**: `ai_usage_logs` — RLS on, zero client policies (service-role writes only).
- **Admin-scoped** (`is_admin()`): `content_*`, `famous_*`.
- **HOLD** (pipeline not wired, do not apply yet): `consultation_intelligence_runs`,
  `assessment_items`, `consultation_quality_reviews`, `user_feedback`,
  `consultation_outcomes` (server-write-only + §30 WITH CHECK).
- **No `memory` table** — conversation memory lives in `conversations.summary`.

⚠️ **All are `OWNER_APPLY_UNKNOWN`**: whether these artifacts are applied in the live DB is
not derivable from code. Owner must confirm + apply per `docs/DATABASE_RUNBOOK.md`. **No
auto-apply. No destructive SQL in any artifact.**

## 4. Observability + cost telemetry
**Strong on the paid path** (all in `supabase/functions/chat/index.ts` → `ai_usage_logs`):
`EXISTS` — latency_ms, per-user token usage, distinct error codes (`OPENAI_FETCH_FAILED`,
`OPENAI_<status>` incl. 401/429, `EMPTY_RESPONSE`, `RATE_LIMITED`), server-decided model,
requestId correlation (client→result→logs). Sensitive-data-in-logs risk = **LOW**
(structural fields only; no PII/tokens/secrets).

`MISSING` (safe follow-ups, mostly edge/deploy → not done here):
- **prompt-version telemetry**: `CONSULTATION_PROMPT_VERSION` is returned to the client
  (`meta`) but not sent to the edge / persisted. Seam: adapter body could carry it →
  edge persists to `ai_usage_logs`. `OBS-SEAM-1`.
- **conversation_id on usage logs**: column exists, edge never populates it. `OBS-SEAM-2`.
- **remote client error sink**: client errors are console-only; `AppErrorLogger` seam
  exists (add a Sentry-style adapter). `OBS-SEAM-3`.
- **consumer funnel** (signup→birth→first-consult): none — product analytics deferred.
- **cost calc**: by explicit design "raw usage only, no price table" — a pricing table is
  an Owner decision (`operationalContracts.computeCost` is ready to wire).
- **alerting/thresholds**: none (pull-only via admin RPCs).

## 5. Beta failure matrix
| Component | Failure | User impact | Detection | Recovery | Owner action | Sev |
|---|---|---|---|---|---|---|
| OAuth (Naver✓/K/G) | provider/console error | can't log in | login error text | retry / other provider | K/G console config | P1 |
| Session | expired mid-consult | send fails | edge 401 → **AUTH_REQUIRED** (2B) | login → resume, question kept | — | P2 |
| Subject | temp subject | consult not in 최근 상담 | — | use "대상으로 저장하고 시작" | — (S2A-F1) | P2 |
| chat edge | not deployed / no key | no answer | `NOT_CONFIGURED`/`REQUEST_FAILED` | inline retry | **`OPENAI_API_KEY` + deploy** | P0 |
| OpenAI | 5xx / timeout | no answer | `OPENAI_*` in logs | 다시 시도 (safe retry) | — | P1 |
| Supabase DB | RLS not applied | data not saved / IDOR | admin/list error states | — | **apply schema** | P0 |
| Message persist | write fails | turn not saved | client_message_id upsert dedup | — | — | P2 |
| Admin write | DB/RLS/permission fail | — | **now throws → error UI (2B)** | retry | apply admin SQL | P1→fixed |
| Engine/grounding | (not wired) | generic answer | grounded:false in `meta` | — | Codex 1B | P0(product) |

## 6. Production smoke runbook (run after Codex 1B + Owner config) — all `NOT_VERIFIED`
1. **New-user golden**: 상담 시작 → 로그인 → 출생정보 → "내 사주풀이 좀 해줘" → verify: auth ✓,
   subject, birth data, engine evidence present, assessment, prompt version in logs,
   answer, persistence.
2. **Follow-up**: "나는 사업이 잘 맞아?" → same subject/conversation, prior context, no fabricated calc.
3. **Timing**: "2027년 재물운은?" → only if timing evidence; no hallucinated month/year.
4. **Follow-up resolution**: "그중 가장 좋은 달은?" → timing grounding honored.
5. **Advice**: "그때 사업 확장해도 돼?" → non-deterministic, evidence-based, safety framing.
6. **Unknown birth time** → no invented 시주; uncertainty communicated.
7. **Session expiry mid-consult** → AUTH_REQUIRED → login → question restored → resume.
8. **Recoverable LLM failure** → 다시 시도 works, no duplicate.
Platform matrix (Desktop Web / Mobile Web) × (Naver/Google/Kakao) — mark each `NOT_VERIFIED`
until actually run in a browser.

## 7. Codex 1B entry contract
```
Prompt Foundation (1A):        READY
First Consultation UX (2A):    READY
Auth Resume / Client Retry:    READY
Auth-expiry → AUTH_REQUIRED:   READY (2B)
Admin Write Integrity:         READY (2B — services throw; screens show errors)
Production Config Inventory:   READY (this doc)
DB/RLS Artifacts:              READY (apply = OWNER_VERIFY)
Observability (paid path):     READY;  funnel/remote-sink = follow-up
Codex Protected Zone:          CLEAN (no engine/semantics/grounding-seam diff)

Engine Grounding:              WAITING FOR CODEX  ← the only thing left for a real answer
```
**Codex 1B path (unblocked):** SAJU deterministic output → `EngineEvidence` → Assessment →
`ConsultationGrounding` → inject at `chatService` (replace `GROUNDING_UNAVAILABLE`, see
`CODEX_HANDOFF §23`) → 1A prompt renders it → LLM → Consultation Intelligence. **Shared
files** Codex will touch: `chatService.ts` (grounding-build step + a small 2B auth-error
catch — coordinate), `contextSelector.ts`, `promptBuilder.ts`, `engineOrchestration.ts`.

## 8. Owner actions (see `OWNER_ACTIONS_AND_DECISIONS.md` for the full queue)
`OWNER_ACTION_REQUIRED`: set `OPENAI_API_KEY` (+ `GEMINI_API_KEY` if video) as edge
secrets; deploy `chat` (+ content/media/video) functions; apply consumer + admin SQL and
confirm the profiles-table question; finish Kakao (KOE205)/Google OAuth console + Supabase
Redirect-URL allowlist. `OWNER_VERIFY_REQUIRED`: which SQL artifacts are already live.

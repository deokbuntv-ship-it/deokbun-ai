# Chat Edge — Production Failure Contract (2026-08-13)

> Status: **OWNER_PREVIEW_VALIDATE_REQUIRED** — the improvement below is a real,
> known UX gap, but the safe fix depends on the live `supabase-js`
> `FunctionsHttpError` shape and cannot be validated without a preview deploy. It is
> intentionally NOT implemented as a blind static change.

## Pipeline
`chat.tsx` → `chatService.sendMessage` → `supabaseEdgeLLMAdapter.generateResponse`
→ `supabase.functions.invoke('chat')` → edge `supabase/functions/chat/index.ts` → OpenAI.

The edge **differentiates** every failure (distinct HTTP status + `{ "error": CODE }`),
but that distinction is **erased** at three collapse points:
1. **Adapter** (`supabaseEdgeLLMAdapter.ts:29-31`) — any invoke error becomes one generic
   `Error('LLM request failed.')`; `FunctionsHttpError.context` (status + `{error}` body) is never read.
2. **chatService** (`chatService.ts:96-99`) — that throw maps to `REQUEST_FAILED` unconditionally.
3. **UI** (`chat.tsx`) — only `AUTH_REQUIRED` is special-cased; everything else shows one message:
   "현재 AI 상담 기능을 준비하고 있습니다. 잠시 후 다시 시도해 주세요." (misleading: a rate-limited or
   momentarily-failing service is reported as an *unbuilt feature*).

## Failure-contract table
| Failure | Edge status | Edge body | Current client | Desired |
|---|---|---|---|---|
| Missing `OPENAI_API_KEY` | 500 | `SERVER_NOT_CONFIGURED` | "준비 중" | temporary-unavailable (not in RAW_MAP yet → UNKNOWN) |
| Expired/invalid auth (mid-session) | 401 (platform) | platform | "준비 중" | `AUTH_REQUIRED` → "로그인이 필요합니다…" |
| Rate-limited (burst guard) | 429 + Retry-After | `RATE_LIMITED` | "준비 중" | `LLM_RATE_LIMIT` → "요청이 많아 잠시 후…" (msg exists, unused) |
| Invalid payload | 400 | `INVALID_INPUT` | "준비 중" | `INVALID_INPUT` (client gateway usually prevents) |
| Provider network fail | 502 | `REQUEST_FAILED` (logs OPENAI_FETCH_FAILED) | "준비 중" | `NETWORK_ERROR` (edge flattens code to body) |
| Model/provider error | 502 | `REQUEST_FAILED` | "준비 중" | `LLM_FAILURE` |
| Empty assistant text | 502 | `EMPTY_RESPONSE` | "준비 중" | `LLM_FAILURE` (msg exists, unused) |
| Malformed output | 502 | `REQUEST_FAILED` | "준비 중" | `LLM_FAILURE` |
| Unhandled exception | non-2xx | platform | "준비 중" | `UNKNOWN` |

## Dead / mismatched mappings this reveals (for the eventual fix)
- `errors.ts` `RAW_MAP` already maps `RATE_LIMITED`→`LLM_RATE_LIMIT`, `OPENAI_FETCH_FAILED`→`NETWORK_ERROR`, `EMPTY_RESPONSE`→`LLM_FAILURE` with distinct Korean messages — **all inert on the chat path** (nothing feeds the edge code into `toAppErrorCode`).
- `PROVIDER_ERROR`, `TIMEOUT` are in `RAW_MAP` but **never emitted** by the current edge.
- `SERVER_NOT_CONFIGURED`, `METHOD_NOT_ALLOWED` are **absent** from `RAW_MAP` (→ UNKNOWN).
- `ChatServiceResult.errorCode` is a closed union `NOT_CONFIGURED | INVALID_INPUT | REQUEST_FAILED | AUTH_REQUIRED` — cannot represent rate-limit/network/timeout distinctly, so the UI couldn't surface them even if recovered.

## The fix (deferred — do on a preview deploy)
1. Adapter reads `FunctionsHttpError.context` (the `Response`), `await`s its JSON body, extracts the `error` token + status.
2. `chatService` passes that raw code through `toAppErrorCode`; widen `ChatServiceResult.errorCode`.
3. `chat.tsx` renders `userMessage(code)` instead of the single hardcoded string.
4. Add `SERVER_NOT_CONFIGURED`→`LLM_FAILURE` (and remove/settle dead `PROVIDER_ERROR`/`TIMEOUT`) in `RAW_MAP`.

**Why deferred:** the exact `FunctionsHttpError` shape (is `.context` the `Response`? is the body already consumed? status availability) is `supabase-js` version-dependent and must be confirmed against the real Edge Function on a preview URL before shipping. Do steps 1–4 together (partial changes are inert) and validate against the live edge.

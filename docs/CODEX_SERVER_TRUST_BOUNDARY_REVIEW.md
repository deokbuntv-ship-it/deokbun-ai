# Codex Review — Server Trust Boundary (deterministic grounding: client → server)

> Closes the security-critical issue: the client used to BUILD the deterministic grounding / system
> messages and the Edge forwarded them to OpenAI, so a modified client could fabricate SAJU/Ziwei/Qimen
> facts, availability, provenance, and "세 학문 일치" consensus. Now the **server** rebuilds everything from
> untrusted input.
>
> **Status: `READY_FOR_CODEX_SERVER_TRUST_BOUNDARY_REVIEW` + `EDGE_RUNTIME_NOT_EXECUTED` +
> `OWNER_ACTION_REQUIRED`.** Not "fully verified" / "deploy-ready": the Deno/Supabase runtime is
> unavailable in the build workspace, so engine execution *inside the Edge* is unverified (see §Runtime
> gate). The trust-boundary LOGIC is verified under Node/Jest. Local commits only — no push / deploy / DB apply.

## Baseline / ancestry

- Starting HEAD: `88a2aed` (Qimen closure). Frozen Saju `interpretation/**` = byte-identical to `7c7ed82`
  (verified before + after: `git diff 7c7ed82 HEAD -- src/features/interpretation` → empty).
- Commits: `c969c7a` (server orchestrator + adversarial proof) → `4343d8a` (Edge + deno.json + migration)
  → `ccee29f` (client migration) → docs/tests (this).

## Target architecture (implemented)

```
CLIENT  (createServerConsultationService)
  → gateway / auth / memory (UX only) → POST inputs-only:
    { subjectProfileId?, birthInput, subjectLabel?, question, conversationContext[], requestMetadata }
EDGE `chat` (Deno)  — the trust boundary
  → withSupabase({auth:'user'}) authenticates; burst rate limit
  → resolveTrustedBirth (profile id → RLS row + explicit owner check) OR recompute from birthInput
  → buildServerConsultation (runtime-neutral):
       selectConsultationContext → buildConsultationGrounding (FROZEN Saju + Ziwei + question-time Qimen,
       serverNow = receipt time) → buildPrompt → callOpenAI → classifyConsultationOutput
  → bounded { text, structuredResult?, groundingMeta }
```

The client is authoritative for **nothing deterministic**. It provides its own birth INPUT + question +
untrusted prior turns; the server recomputes every fact.

## What the server now OWNS (was client-authored)

| Concern | Before | After |
|---|---|---|
| Engine facts (SAJU/Ziwei/Qimen) | client-built, edge-forwarded | **server** recomputes from input |
| Engine availability | client-declared in prompt | **server**-computed |
| Provenance / honesty labels | client text | **server**-built evidence |
| Qimen activation | client question | **server** classifier on the question |
| Qimen question time | (client instant) | **server** receipt time (`SERVER_RECEIPT_TIME`) |
| System prompt / constitution | client `buildPrompt` | **server** `buildPrompt` |
| Output validation (false engine/consensus/theory/timing) | client | **server** `classifyConsultationOutput` |
| Summary prompt | client `buildSummaryPrompt` | **server** (summary mode) |

## Files

- `src/features/chat/server/buildServerConsultation.ts` — runtime-neutral orchestrator (the security core).
- `src/features/chat/server/serverConsultationTypes.ts` — inputs-only request + bounded response contract.
- `supabase/functions/chat/index.ts` — Edge: inputs-only + summary mode; Deno Web Crypto digest; profile
  resolver (service_role + explicit owner check); server-built grounding; bounded response.
- `supabase/functions/chat/deno.json` — import map (`@/` → src; iztro/lunar-javascript/qimen-dunjia via npm:).
- `supabase/migrations/20260817000000_consumer_birth_profiles.sql` — RLS-owned trusted birth (OWNER_APPLY).
- Client: `services/createServerConsultationService.ts`, `services/consultationTransport.ts`,
  `adapters/supabaseEdgeConsultationAdapter.ts`, `adapters/supabaseEdgeSummaryAdapter.ts`;
  `app/chat.tsx` + `hooks/useConversationPersistence.ts` switched to the server path.

## Verification (Node/Jest — only the outbound LLM call is mocked)

- **Adversarial (`serverTrustBoundary.test.ts`, §22):** forged system-grounding turns DROPPED (exactly 2
  server system layers reach the LLM); fake assistant history cannot flip availability; forged
  availability flags in label/history ignored; malicious label bracket-stripped; cross-user profile →
  SUBJECT_FORBIDDEN; nonexistent → SUBJECT_NOT_FOUND; resolved profile IGNORES client birthInput;
  malformed profile fails closed; server grounding reaches the LLM.
- **Orchestrator (`buildServerConsultation.test.ts`):** server recomputes grounding from input; forged
  client questionTime cannot move the Qimen instant; natal → qimen not_applicable; timing → qimen
  available; unsupported 節氣 → qimen degraded, SAJU+Ziwei survive; invalid birth → INVALID_INPUT (no LLM).
- **Client (`createServerConsultationService.test.ts`):** sends inputs only (no messages/grounding/evidence
  keys); auth + gateway + missing-birth fail closed; result mapping.
- Full suite: **57 suites / 649 tests PASS** (zero regression). tsc: no new errors (pre-existing
  route-union only). Frozen `interpretation/**` identical to `7c7ed82`.

## Runtime gate — `EDGE_RUNTIME_NOT_EXECUTED` (§27)

`deno` and `supabase` CLIs are **not installed** in this workspace, so the Edge could not be executed or
bundled here. UNVERIFIED, owner must confirm on deploy:
1. Deno resolves the `deno.json` import map (`@/` prefix across the graph) and the bundler follows `src/`.
2. `npm:iztro@2.5.8`, `npm:lunar-javascript@1.7.7`, `npm:qimen-dunjia@2.1.0` load + run under Deno npm compat.
3. The frozen Saju graph executes under Deno (static analysis is clean: no react-native/expo/node-builtin
   imports in the engine cores, no `.json` imports, DigestProvider is dependency-injected → Web Crypto).

What IS verified here: the Edge file passes a TS type-stripping syntax parse; the orchestrator + engines it
calls run green under Node/Jest.

## OWNER_ACTION_REQUIRED (§29)

1. Review + apply `supabase/migrations/20260817000000_consumer_birth_profiles.sql` (RLS). Do NOT weaken RLS.
2. Ensure the CLI picks up `supabase/functions/chat/deno.json` (add `import_map` under `[functions.chat]`
   in `config.toml` if your CLI version needs it — owner edits config.toml).
3. Configure/verify `OPENAI_API_KEY` (server secret).
4. `supabase functions deploy chat`, then run the Edge runtime checks in §Runtime gate + an authenticated
   E2E (natal → SAJU+Ziwei, qimen not_applicable; timing → tri-engine; forged grounding → ignored).

## Residual / notes

- V1 client sends `birthInput` (no persisted-profile UI yet) → the server recomputes facts from it; the
  profile path (`subjectProfileId` + RLS) is implemented + adversarially tested and activates once the
  migration is applied and a profile-management UI is added.
- Legacy `createChatService` (client grounding→prompt→classify) is retained ONLY as an offline/preview
  pipeline + the harness that unit-tests the shared logic; it never reaches the real Edge in production.
- `supabaseEdgeLLMAdapter` (legacy messages transport) is now unused by production; kept for its unit test.

## STATUS

`READY_FOR_CODEX_SERVER_TRUST_BOUNDARY_REVIEW` — code complete + Node-verified; `EDGE_RUNTIME_NOT_EXECUTED`
(no deno/supabase CLI here); `OWNER_ACTION_REQUIRED` (apply migration + deploy + runtime-verify). Not
self-approved / not deploy-verified. No push / deploy / DB apply.

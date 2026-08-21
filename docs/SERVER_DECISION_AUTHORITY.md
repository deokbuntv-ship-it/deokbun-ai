# Server decision authority vs client history (Sprint E.1 §21)

**Status:** code-complete in this repo. Migration `20260829000000_consultation_decisions.sql` is
`OWNER_APPLY` (not applied). Edge is `EDGE_RUNTIME_NOT_EXECUTED` (no local Deno/DB) — code-review-verified.

## The invariant

The client is authoritative for **nothing deterministic**, including the *previous* decision a follow-up
reasons about. Two stores exist and they are **not** interchangeable:

| Store | Written by | Purpose | Trusted for decisions? |
|---|---|---|---|
| `conversation_messages` (`structured_result`) | **the client** (RLS lets an owner insert their own assistant rows) | render/replay the chat transcript | **NO** — a modified client can put any JSON here |
| `consultation_decisions` (`decision_meta`) | **only the service-role Edge** (RLS defines *no* client insert/update/delete) | the authoritative decision/audit record a follow-up reads | **YES** |

## Why the split exists (the BLOCKER it closes)

Sprint E loaded the "previous decision" for a live follow-up (`왜?` / `그럼 내년은?` / `둘 중에는?`) from
`conversation_messages.structured_result.decisionMeta`. That row is **client-written**, so a modified client
could forge the polarity, domain, resolved targets, or decision versions and steer the *next* server turn
(e.g. flip a `CAUTION` into a `FAVORABLE`, or fabricate a comparison set to elicit a "winner"). That is a trust
boundary violation: history the client owns must never feed a server decision.

## The rule

1. **Server writes the decision.** After safety + output validation + acceptance, the Edge inserts the
   server-produced `ConsultationDecisionMeta` into `consultation_decisions` (service role). It is written for
   an accepted answer only — never for a safety-routed, fallback, or rejected turn.
2. **Server reads the decision.** The follow-up loader reads the **latest** row for
   `(conversation_id, user_id)` from `consultation_decisions`, ordered by `created_at desc`. Ownership is the
   `user_id` filter; a cross-user conversation returns no row, so a decision never leaks.
3. **Client history is context, never authority.** `conversationContext` / `conversationSummary` remain
   untrusted USER-role context (bounded + sanitized). They can inform *phrasing*, never a decision value.
4. **Fail-closed.** A missing / legacy / malformed decision row → `parseDecisionMeta` returns `undefined` →
   no follow-up is applied (the normal, safe path). A client persistence race on the transcript cannot affect
   the authoritative follow-up, because the follow-up never reads the transcript.
5. **No client write path.** `consultation_decisions` has RLS enabled and **no** insert/update/delete policy,
   so every anon/authenticated write is denied. Do **not** add a client write policy — that reopens the
   BLOCKER. The `ServerConsultationRequest` contract exposes only a `conversationId` string; there is no field
   through which a client can pass a polarity/target/version.

## What is stored (and what is not)

`decision_meta` holds **only** server-produced decision/audit values: version bundle, resolved
granularity/targets, polarity, domain, explicit comparison context, a minimal deterministic evidence snapshot
(support level / assertiveness / intents), and the resolved temporal context. It stores **no** prompt text,
question, answer prose, birth data, keys, or JWT.

## Owner actions

- Apply `supabase/migrations/20260829000000_consultation_decisions.sql` via the migration flow.
- Redeploy the `chat` Edge function (it reads/writes the new store and enforces the crisis-before-spend order).

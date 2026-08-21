# CONSULTATION CORE — AUTHORITY FREEZE (§I)

> **Status:** ARCHITECTURE FREEZE DOCUMENT (Sprint F). Describes the authority structure of the consultation
> core at the freeze-candidate commit. Frozen engines are **not** changed by this or any app-track sprint.

## 1. The authority pipeline

```
  ENGINE            (frozen: Myungri / Ziwei / Qimen — deterministic calculation)
     │  facts (charts, relations, availability)
     ▼
  EVIDENCE          (server rebuilds evidence from INPUT it recomputes — never client-supplied)
     │
     ▼
  SERVER DECISION / ANSWER PLAN
     │  server-owned: polarity (target-scoped), granularity, targets, support level,
     │  assertiveness, comparison context, mitigation flags, domain
     ▼
  GROUNDING         (server-owned; civil-time resolution for 올해/내년/이번 달/다음 달, then engine-grounded)
     │
     ▼
  LLM VERBALIZATION (the model VERBALIZES the server's decision; it decides nothing deterministic)
     │
     ▼
  VALIDATOR         (certainty / mitigation / compatibility-harm guards + one constrained regeneration)
     │
     ▼
  PERSIST           (server-owned consultation_decisions; atomic with paid completion; ownership-checked)
     │
     ▼
  WHY (stored evidence)  ("왜?" explains the STORED decision + STORED evidence snapshot — never re-grounds)
```

## 2. Invariants (the freeze protects these)

1. **The LLM is not a calculator.** It never computes or invents polarity, a winner/ranking, a target period, or
   an availability flag. Those are server-decided and injected; the model only phrases them.
2. **No winner / no ranking (Option B).** V1 authorizes no server-decided temporal winner. A "둘 중에는?" describes
   candidates without ranking; a fabricated winner is rejected by the guard.
3. **Stored WHY explains only the past authoritative decision.** A follow-up "왜?" reads the server-stored
   decision + its deterministic evidence snapshot; it does **not** recompute against the current turn, and it
   flags a version mismatch instead of silently re-deciding.
4. **Client is authoritative for nothing deterministic.** Previous decisions come only from the server-owned
   store (`consultation_decisions`), never from client-written history. Conversation id is an identifier, not
   data.
5. **Crisis precedes spend.** The self-harm / death / medical hard-stop runs before ownership check, paid
   reserve, global-spend guard, previous-decision load, grounding, and any LLM call.
6. **Auth precedes conversation creation (Sprint F §B).** An unauthenticated first turn fails closed as
   AUTH_REQUIRED and creates no row / reserves nothing / calls no LLM / persists no decision.
7. **Frozen engines are untouched.** `src/features/myungri`, `src/features/interpretation/saju`,
   `src/features/ziwei`, `src/features/qimen` have ZERO diff on this track.

## 3. What "freeze" means

- The **authority structure** and the **invariants above** are stable for V1. Changes to them require an
  explicit decision (they are the security + product-truth boundary).
- Bug fixes and additive, invariant-preserving hardening are still allowed (as Sprint F §B did for the auth
  boundary).
- Frozen **engine semantics** (the astrology math + rulesets) are owned by the engine track and are not modified
  here at all.

## 4. Verification anchors (tests that lock the invariants)

- WHY stored-evidence A/B isolation, comparison context, crisis ordering, atomic persistence, cross-owner
  rejection, deterministic loader tie-break: `server/__tests__/e2RuntimeClosure.test.ts`,
  `server/__tests__/releaseBlockerClosure.test.ts`, `server/__tests__/sprintFBoundaries.test.ts`.
- Auth-precedes-conversation: `services/__tests__/conversationBoundSend.test.ts`.
- Full suite green at the freeze candidate (see [SPRINT_F_A_TO_Z_REPORT.md](SPRINT_F_A_TO_Z_REPORT.md)).

# Sprint E.1 — Final Release Blocker Closure

Closes the independent Codex Final Red-Team verdict **"C. NOT APPROVED"**. Base = `b0e3e57`. Five commits,
no push, no deploy, no remote DB mutation.

| Commit | Scope |
|---|---|
| `11dcd7c` | HIGH 3 — civil temporal resolver + boundary tests |
| `99461b0` | HIGH 4 — euphemistic breakup guard |
| `1bea5ac` | §7 — engineVersion is decision-affecting |
| `36d8782` | BLOCKER 1 + HIGH 2 + HIGH 5 + §16-18 — server decision store, crisis-before-spend, evidence/comparison authority |
| `3ab5e4b` | §21 — server-authority doc |

## 1. Verdict addressed
Codex "NOT APPROVED": 1 BLOCKER + 4 HIGH + MEDIUMs. All verified against `file:line` before fixing; each has a
regression test and a smallest-correct patch. No new product features; no frozen-engine redesign.

## 2. BLOCKER 1 — previous-decision authority was client-forgeable
**Was:** the follow-up loader read `conversation_messages.structured_result.decisionMeta`, a client-written row
(`index.ts` Sprint E loader). A modified client could forge polarity/domain/target/versions.
**Now:** server-owned `consultation_decisions` store. Service-role Edge is the only writer; RLS grants owners
READ only and defines **no** client insert/update/delete. Loader reads the latest `(conversation_id, user_id)`
row from that store (`index.ts:1055`), writer inserts after acceptance (`index.ts:1194`), migration
`20260829000000_consultation_decisions.sql`.

## 3. HIGH 2 — WHY lacked the previous evidence snapshot
`ConsultationDecisionMeta.evidence = { supportLevel, assertiveness, intents }` (`decisionMeta.ts:33`); the
`왜?` directive cites the **stored** target + polarity + support level and explicitly forbids re-grounding
(`followUpContext.ts:149`).

## 4. HIGH 3 — civil year/month wrong between Jan 1 and Ipchun
`올해/내년/이번 달/다음 달` resolve from the **KST civil calendar**, then grounded via the frozen engine at a
mid-period epoch (`consultationGrounding.ts`, committed `11dcd7c`). 7 boundary tests
(`civilTemporalBoundary.test.ts`).

## 5. HIGH 4 — euphemistic breakup bypassed the guard
`COMPAT_BREAKUP_EUPHEMISM` catches `관계를/관계는 정리/끝내는 게 좋…`, `이 관계는 정리할 필요…`,
`헤어지는/이혼하는 편이 좋/낫` (`certaintyGuard.ts`); the 정리 must attach to 관계 so
`관계를 유지하려면 갈등을 정리할 필요가 있습니다` stays safe. Summary-alone euphemism still rejected.

## 6. HIGH 5 — spend/global acquisition executed before the crisis hard-stop
`evaluateConsultationSafetyStop` (`buildServerConsultation.ts:142`) is a pure pre-check the Edge runs right
after question validation (`index.ts:940`) — **before** partner resolution, `acquirePaidRequest` (paid reserve +
global-spend guard), the previous-decision loader, grounding, and any LLM call. The same evaluator backs the
orchestrator (`buildServerConsultation.ts:128`), so they cannot drift.

## 7. §16-17 — single year+month misread as a comparison
Explicit `comparisonContext { isComparison, candidates }` from the plan (`answerPlan.ts:241`). `isComparison`
is a real grounded ≥2-candidate comparison only; a single year+month keeps it `false`, so `둘 중에는?` yields no
candidates and no invented winner (`followUpContext.ts:31`). Option B preserved.

## 8. §18 — NEXT_YEAR dropped the inherited domain
`그럼 내년은?` classifies as `전반` alone; the new decision now persists the carried prior domain
(`buildServerConsultation.ts:251`, `decisionMeta.ts:21`).

## 9. Server decision store — schema + RLS
`consultation_decisions(id, conversation_id→conversations, user_id→auth.users, decision_meta jsonb, audit
scalars, created_at)`. Indexes: `(conversation_id, created_at desc)`, `(user_id)`. RLS: `select using
(user_id = auth.uid())`; **no** write policy → clients cannot write; service role bypasses RLS. Stores no
prompt/question/answer/birth/keys.

## 10. Write gating
The Edge writes **only** when `admin && userId && conversationId` and `outputClassification === 'ACCEPTED'` and
a `decisionMeta` exists — never for safety-routed / fallback / rejected turns. Best-effort: a write failure
logs `DECISION_PERSIST_FAILED` and never fails the produced answer.

## 11. Loader ownership + fail-closed
Latest row for `(conversation_id, user_id)`, `created_at desc limit 1`; a cross-user conversation returns no
row. `parseDecisionMeta` fail-closes legacy/malformed to `undefined` → no follow-up.

## 12. Version policy (no bump)
Decision **values** (polarity/targets/granularity/support/assertiveness) are unchanged; `comparisonContext` and
`evidence` are additive/derived. Versions stay `answer-plan@1.2.0` / `decision-policy@1.2.0` /
`consultation@1.4.3` so in-flight decisions do not spuriously mismatch. `engineVersion` is now compared in
`isDecisionVersionMismatch` when a current value is supplied (`decisionMeta.ts`).

## 13. Backward compatibility
`parseDecisionMeta` accepts records without `comparisonContext`/`evidence`; a malformed comparison context is
dropped (never a silent `isComparison:true`). Verified by `releaseBlockerClosure.test.ts`.

## 14. Trust boundary
The only decision source is `deps.loadPreviousDecision` (server-injected). `ServerConsultationRequest` exposes
only a `conversationId` string — no field carries a polarity/target/version. With no loader, a `왜?` turn
applies no directive.

## 15. Frozen-engine invariant (gate M)
`git diff b0e3e57..HEAD` touches **no** Myungri/Ziwei/Qimen/PolarityKernel/engine path. Only the chat
server/prompt/services layer, the Edge, the bundle, the migration, docs, and tests.

## 16. Bundle
Regenerated deterministically (`build1==build2`); externals are exactly `iztro`, `lunar-javascript`,
`qimen-dunjia`; no secret; brand `덕분이` (0 × `덕분AI`); `evaluateConsultationSafetyStop` exported.

## 17. Edge validation
`supabase` is excluded from app `tsc`; `index.ts` parsed clean via esbuild TS transform. Deno execution
remains ungated (`EDGE_RUNTIME_NOT_EXECUTED`).

## 18. Tests
Full suite **152 suites / 1527 tests** pass. New: `releaseBlockerClosure.test.ts` (crisis-precedes-spend,
comparison context, WHY-evidence, trust boundary, carried domain, parse round-trip). Updated fixtures that
encoded the old "length≥2 ⇒ comparison" contract to carry an explicit comparison flag.

## 19. Preflight
`npm run preflight`: bundle present + syntax OK + no secret + version constants + externals + spend-guard
migration + tsc 0 + jest pass → **PREFLIGHT PASS**. Expo web export exit 0.

## 20. Non-goals honored
No new product feature, no engine redesign, no pricing/UI change, no V2, no Option-B ranking, no Global Spend
Guard economic-policy change (only integration ordering relative to the crisis stop).

## 21. Owner actions (required before launch)
1. Apply `supabase/migrations/20260829000000_consultation_decisions.sql`.
2. Redeploy the `chat` Edge (crisis-before-spend order + server decision store read/write).
3. `config.toml` (owner-dirty) and `MYUNGRI_100_ADOPTION_ANALYSIS.md` (owner-untracked) were left untouched.

## 22. Acceptance gates A–N

| Gate | Requirement | Result | Evidence |
|---|---|---|---|
| A | authed client CANNOT forge prior decision | **NO** | server store + RLS no-write; `index.ts:1055`; trust-boundary tests |
| B | WHY explains stored evidence | **YES** | `decisionMeta.ts:33`, `followUpContext.ts:149`; WHY-evidence test |
| C | 2027-01-01 "내년" → 2028 | **YES** | civil resolver; `civilTemporalBoundary.test.ts` |
| D | 2027-01-01 "이번 달" → 2027-01 | **YES** | civil resolver; boundary test |
| E | "관계를 정리하는 게 좋겠습니다" blocked | **YES** | `certaintyGuard.ts`; `compatibilitySafety.test.ts §10/§11` |
| F | kill switch CANNOT block crisis | **NO** | pre-check before `acquirePaidRequest`; `index.ts:940`; evaluator test |
| G | crisis reserves paid/global work | **NO** | returns before reserve/global; orchestrator test (no LLM/loader) |
| H | loader selects latest server-accepted decision | **YES** | `created_at desc limit 1` from server store |
| I | single year+month NOT a comparison | **NO** | `comparisonContext`; `releaseBlockerClosure.test.ts` |
| J | engineVersion in mismatch | **YES** | `decisionMeta.ts`; `decisionContextFollowUp.test.ts §7` |
| K | NEXT_YEAR persists inherited domain | **YES** | `buildServerConsultation.ts:251`; `liveFollowUp.test.ts §5` |
| L | client persistence race CANNOT affect follow-up | **NO** | follow-up reads only the server store; §14 |
| M | frozen-engine semantic diff ZERO | **ZERO** | §15 diff check |
| N | no remote deploy | **NO** | 5 local commits, branch ahead, no push/db push/deploy |

SPRINT_E1_RELEASE_BLOCKER_CLOSURE_COMPLETE

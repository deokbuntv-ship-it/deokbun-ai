# 덕분이 V1 — OWNER ROLLBACK / INCIDENT RUNBOOK

Audience: the **owner (non-developer)**. Keep this to one page of actions. Use only operations this
repository/stack actually supports. When in doubt, **stop and preserve state** rather than guessing.

The two moving parts you can control at release time:
1. **Database migrations** (Supabase) — schema/RPC changes.
2. **Edge Function deploy** (the `chat` function) — the consultation/fortune server code + its bundled
   `serverBundle.mjs`.

---

## 0. BEFORE every release — write down the safe point

- Record the **current commit** you are about to deploy from: `git rev-parse HEAD` → save it.
- Record the **currently-deployed** Edge version (Supabase dashboard → Edge Functions → chat → version).
- Record which **migrations** are already applied.

If anything goes wrong, "the safe point" is what you roll back to.

---

## 1. Migration failed (schema/RPC apply error)
- **Do NOT** hand-edit tables or invent SQL to "fix" it.
- Stop. The app keeps running on the previous schema. Consultation reads/writes that don't need the new
  column keep working.
- Recovery: re-run the migration only after the developer confirms the fix; otherwise remain on the safe
  point. A partially-applied migration is a developer task, not an owner task.

## 2. Edge deploy failed
- The previous Edge version stays live automatically until a new one succeeds — users are unaffected.
- Recovery: redeploy from the recorded safe-point commit (rebuild the bundle first if instructed).

## 3. Recover the previous working Edge version
- Supabase dashboard → Edge Functions → chat → **Versions** → select the last known-good version →
  promote/redeploy it. This is the fastest rollback for a bad consultation deploy.

## 4. Generation cost spike / emergency stop (kill switch)
- Global generation is bounded by the spend guard (default technical limits ~100/hour, ~1000/day —
  pending your approval, not a product promise). To hard-stop new paid generation:
  use the **admin generation toggle** (Admin → 시스템 설정 → 생성 제어) if connected; otherwise ask the
  developer to disable generation at the Edge. Cached Today/Monthly and completed consultations keep serving.

## 5. Database / RPC outage
- Symptoms: consultations fail to save or load. The app fails **closed** (shows a safe message), never a
  fabricated answer. No owner action can fix an outage — wait for Supabase recovery; do not delete rows.

## 6. LLM provider (OpenAI) outage
- New consultations return a safe "try again shortly" message. Cached 오늘의/이번 달 운세 and previously
  completed answers still display. No data is lost. Wait for provider recovery.

## 7. Degraded / cache-only operation
- The system is designed to keep serving deterministic + cached content when generation is blocked:
  (1) cached Today/Monthly, (2) previously completed consultations, (3) deterministic calculations. This
  is the expected safe degradation order — leave it as-is during an incident.

## 8. Where to look
- Edge logs: Supabase dashboard → Edge Functions → chat → Logs. Safe diagnostic lines are prefixed
  `[chat.diag]` (content-free — classification/reason codes only, no user data).
- Economic-guard incidents show up as reservation/limit rejections in the same logs.

---

## DO NOT (owner)
- ❌ Run random production SQL.
- ❌ Guess at "migration repair" commands.
- ❌ Delete reservation / idempotency rows to "regain quota".
- ❌ Hot-edit prompts in production.
- ❌ Paste or expose any secret (API keys, service-role key, tokens) anywhere.
- ❌ Force-deploy over a failed migration.

When any of these is tempting: **stop, preserve the safe point, and hand it to the developer.**

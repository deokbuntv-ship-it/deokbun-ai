// One-shot "just onboarded" signal (Sprint J2 §6). In-memory (survives the onboarding→Home navigation within the
// same app session, NOT an app restart) so a brand-new user sees ONE welcome/economy card on their first Home
// view. This is a pure UI nudge — it does NOT grant 덕 (the server trigger on consent owns the actual 10-Duk
// grant). Mirrors the existing pendingConsultationIntent one-shot pattern.
let pending = false;

/** Mark that the user just finished first-time onboarding (call once, on genuine SELF creation). */
export function markWelcomePending(): void {
  pending = true;
}

/** Read-and-clear the signal. Returns true at most once per mark. */
export function consumeWelcomePending(): boolean {
  const was = pending;
  pending = false;
  return was;
}

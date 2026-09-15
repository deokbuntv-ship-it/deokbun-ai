// Ephemeral hand-off for "just created a 대상자 from the 궁합 flow" (Compatibility Flow P0 §2/§3/§11).
// In-memory + one-shot: when birth-info (origin=compatibility) saves a new subject, it stashes the new
// subject id here and returns to /compatibility, which CONSUMES it to auto-select that target.
//
// SAFE BY CONSTRUCTION: this only ever fills the compatibility screen's LOCAL `targetId` selection state
// (never a route, redirect, or DB write), and the screen only highlights a card whose id actually exists
// in the owner-scoped subject list — so a stale/foreign id simply selects nothing. It is intentionally
// NOT persisted: after a refresh the ephemeral selection is gone (owner §11) but the saved subject remains.
let pendingSubjectId: string | null = null;

export function setPendingCompatibilitySubjectId(id: string): void {
  pendingSubjectId = typeof id === 'string' && id.length > 0 ? id : null;
}

// One-shot read: returns the pending id and clears it (so a later focus does not re-select it).
export function consumePendingCompatibilitySubjectId(): string | null {
  const v = pendingSubjectId;
  pendingSubjectId = null;
  return v;
}

export function clearPendingCompatibilitySubjectId(): void {
  pendingSubjectId = null;
}

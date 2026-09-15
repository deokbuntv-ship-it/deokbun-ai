// Ephemeral 궁합 subject-create hand-off (Compatibility Flow P0 §3/§11). One-shot: set on subject
// create, consumed once on the compatibility screen to auto-select, then gone (so a later focus / a
// refresh does not re-select). No persistence, no route/redirect — just a local selection hint.
import {
  clearPendingCompatibilitySubjectId,
  consumePendingCompatibilitySubjectId,
  setPendingCompatibilitySubjectId,
} from '../pendingCompatibilitySubject';

describe('pendingCompatibilitySubject', () => {
  beforeEach(() => clearPendingCompatibilitySubjectId());

  it('set → consume returns the id and clears it (auto-select the just-created target)', () => {
    setPendingCompatibilitySubjectId('11111111-1111-1111-1111-111111111111');
    expect(consumePendingCompatibilitySubjectId()).toBe('11111111-1111-1111-1111-111111111111');
    expect(consumePendingCompatibilitySubjectId()).toBeNull(); // one-shot — no re-select on next focus
  });

  it('returns null when nothing pending', () => {
    expect(consumePendingCompatibilitySubjectId()).toBeNull();
  });

  it('ignores an empty id (no accidental selection)', () => {
    setPendingCompatibilitySubjectId('');
    expect(consumePendingCompatibilitySubjectId()).toBeNull();
  });

  it('clear() drops a pending id', () => {
    setPendingCompatibilitySubjectId('abc');
    clearPendingCompatibilitySubjectId();
    expect(consumePendingCompatibilitySubjectId()).toBeNull();
  });
});

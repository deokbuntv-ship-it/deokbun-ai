// Consultation Intelligence presentation adapter — fail-closed + contract-fidelity
// invariants (Sprint 3A §8/§21/§23/§25/§44). Pure; the UI renders these ViewModels, so
// locking them here locks the on-screen behaviour without a render harness.
import { assembleFailClosed } from '../assessment';
import type { AssessmentItem } from '../assessment';
import {
  AXIS_LABELS,
  LEVEL_LABELS,
  toAdminAssessmentRow,
  toConsumerAssessmentView,
} from '../index';

// A CONNECTED item (a real reading) — evaluative level requires a connected ruleset.
const connected = (over: Partial<AssessmentItem> = {}): AssessmentItem => ({
  axisKey: 'business',
  level: 'strong',
  direction: 'rising',
  confidence: 'high',
  agreement: 'aligned',
  applicability: 'applicable',
  timing: { label: '2027년 하반기', periodRef: '2027-H2' },
  warnings: [],
  supportingEvidenceRefs: ['ev1', 'ev2'],
  counterEvidenceRefs: ['ev3'],
  engineContributions: [],
  schemaVersion: 'assessment@1.0.0',
  rulesetVersion: 'saju-business@1.0',
  ...over,
});

describe('consumer view — FAIL-CLOSED (§8/§44)', () => {
  it('the not-connected default renders NO tiles (never a fabricated 강함)', () => {
    const view = toConsumerAssessmentView([assembleFailClosed('wealth', [])]);
    expect(view.status).toBe('unavailable');
    if (view.status === 'unavailable') expect(view.reason).toBe('not_connected');
  });
  it('an empty assessment set is unavailable / not_connected', () => {
    expect(toConsumerAssessmentView([])).toEqual({ status: 'unavailable', reason: 'not_connected' });
  });
  it('a wired ruleset that returned only `insufficient` is unavailable / insufficient (NOT not_connected)', () => {
    const item = connected({ level: 'insufficient', confidence: 'insufficient' });
    const view = toConsumerAssessmentView([item]);
    expect(view.status).toBe('unavailable');
    if (view.status === 'unavailable') expect(view.reason).toBe('insufficient');
  });
});

describe('consumer view — renders only committal levels, labelled', () => {
  const view = toConsumerAssessmentView([connected(), assembleFailClosed('overall', [])]);
  it('shows a tile for the evaluative item and drops the not_connected one', () => {
    expect(view.status).toBe('available');
    if (view.status !== 'available') return;
    expect(view.tiles).toHaveLength(1);
    const t = view.tiles[0];
    expect(t.axisLabel).toBe('사업');
    expect(t.levelLabel).toBe('강함');
    expect(t.directionLabel).toBe('상승');
    expect(t.directionArrow).toBe('↑');
    expect(t.timingLabel).toBe('2027년 하반기');
  });
  it('never emits a numeric/percent level (categorical only, §21)', () => {
    if (view.status !== 'available') return;
    for (const t of view.tiles) expect(t.levelLabel).not.toMatch(/[0-9]|%|점|★/);
  });
});

describe('confidence: insufficient is HIDDEN, never "낮음" (§25)', () => {
  it('hides confidence when insufficient', () => {
    const v = toConsumerAssessmentView([connected({ confidence: 'insufficient' })]);
    if (v.status === 'available') expect(v.tiles[0].confidenceLabel).toBe('');
  });
  it('shows confidence when present', () => {
    const v = toConsumerAssessmentView([connected({ confidence: 'medium' })]);
    if (v.status === 'available') expect(v.tiles[0].confidenceLabel).toBe('보통');
  });
});

describe('missing birth time is grouped, not shown as empty tiles (§216)', () => {
  it('collects missing_birth_time axes separately', () => {
    const v = toConsumerAssessmentView([
      connected(),
      connected({ axisKey: 'future_timing', level: 'moderate', applicability: 'missing_birth_time' }),
    ]);
    if (v.status !== 'available') return;
    expect(v.missingBirthTimeAxes.map((a) => a.axisKey)).toContain('future_timing');
  });
});

describe('admin row — supporting ≠ counter, never summed (§23); truthful insufficient', () => {
  it('keeps supporting/counter counts separate', () => {
    const r = toAdminAssessmentRow(connected());
    expect(r.supportingCount).toBe(2);
    expect(r.counterCount).toBe(1);
    expect((r as { total?: number }).total).toBeUndefined(); // no summed field exists
  });
  it('admin shows insufficient truthfully as 근거 부족 (not hidden like consumer)', () => {
    const r = toAdminAssessmentRow(connected({ confidence: 'insufficient' }));
    expect(r.confidenceLabel).toBe('근거 부족');
  });
  it('flags whether the ruleset is connected', () => {
    expect(toAdminAssessmentRow(connected()).rulesetConnected).toBe(true);
    expect(toAdminAssessmentRow(assembleFailClosed('wealth', [])).rulesetConnected).toBe(false);
  });
});

describe('label maps cover the full taxonomy', () => {
  it('has a Korean label for every axis and every level', () => {
    (Object.keys(AXIS_LABELS) as (keyof typeof AXIS_LABELS)[]).forEach((k) =>
      expect(AXIS_LABELS[k].length).toBeGreaterThan(0),
    );
    (['very_strong', 'strong', 'moderate', 'weak', 'very_weak', 'mixed'] as const).forEach((l) =>
      expect(LEVEL_LABELS[l].length).toBeGreaterThan(0),
    );
  });
});

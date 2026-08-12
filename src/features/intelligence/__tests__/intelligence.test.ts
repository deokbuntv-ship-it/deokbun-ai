// Consultation Intelligence — domain invariant coverage (directive §46/§47). Pure,
// no mocks. Locks the safety properties: fail-closed (no fabricated assessment),
// provenance preserved, layers separated, user report ≠ verified truth.
import {
  ASSESSMENT_AXES,
  ASSESSMENT_RULESET_NOT_CONNECTED,
  AXIS_TO_LIFE_DOMAIN,
  assembleFailClosed,
  axesForScope,
  buildConsultationCase,
  buildUserFeedback,
  emptyQualityReview,
  fromUserReport,
  isValidAssessmentItem,
  isValidConsultationCase,
  isValidEvidenceRecord,
  isValidOutcome,
  isValidQualityReview,
  isValidUserFeedback,
  toEvidenceRecord,
  type AssessmentItem,
  type EngineContribution,
} from '../index';

const NOW = '2026-08-13T00:00:00.000Z';

describe('taxonomy (§10)', () => {
  it('assessment axes are unique and non-empty', () => {
    expect(ASSESSMENT_AXES.length).toBeGreaterThan(0);
    expect(new Set(ASSESSMENT_AXES).size).toBe(ASSESSMENT_AXES.length);
  });
  it('every axis maps to a LifeDomain or explicit null (cross-analysis bridge)', () => {
    ASSESSMENT_AXES.forEach((a) => expect(a in AXIS_TO_LIFE_DOMAIN).toBe(true));
  });
  it('scope→axes are all valid axes; unscoped is empty', () => {
    expect(axesForScope('unscoped')).toEqual([]);
    axesForScope('business_timing').forEach((a) => expect(ASSESSMENT_AXES).toContain(a));
  });
});

describe('evidence ledger — provenance + immutability (§8/§9)', () => {
  const rec = toEvidenceRecord({
    evidenceId: 'ev1',
    provenance: { engine: 'ziwei', engineVersion: 'iztro@2.5.8', engineRulesetVersion: 'iztro-default@2.5.8' },
    evidence: { availability: 'available', summary: '자미 요약' },
    createdAt: NOW,
  });
  it('mirrors availability and preserves provenance', () => {
    expect(rec.availability).toBe('available');
    expect(rec.provenance.engine).toBe('ziwei');
    expect(rec.provenance.engineRulesetVersion).toBe('iztro-default@2.5.8');
    expect(isValidEvidenceRecord(rec)).toBe(true);
  });
  it('rejects a record missing provenance version', () => {
    expect(isValidEvidenceRecord({ ...rec, provenance: { ...rec.provenance, engineVersion: '' } })).toBe(false);
  });
});

describe('assessment — FAIL-CLOSED, no fabrication (§44/§45)', () => {
  const contribs: EngineContribution[] = [
    { engine: 'saju', applicability: 'applicable', evidenceRefs: ['ev1'] },
    { engine: 'ziwei', applicability: 'missing_birth_time', evidenceRefs: [] },
    { engine: 'qimen', applicability: 'not_applicable', evidenceRefs: [] },
  ];
  const item = assembleFailClosed('wealth', contribs);

  it('returns rules_not_connected (never a strong/weak level) when no ruleset', () => {
    expect(item.level).toBe('rules_not_connected');
    expect(item.rulesetVersion).toBe(ASSESSMENT_RULESET_NOT_CONNECTED);
    expect(item.confidence).toBe('insufficient');
    expect(item.supportingEvidenceRefs).toEqual([]);
    expect(item.counterEvidenceRefs).toEqual([]);
    expect(item.warnings.length).toBeGreaterThan(0);
  });
  it('preserves each engine contribution independently, incl. qimen not_applicable (§17)', () => {
    expect(item.engineContributions).toHaveLength(3);
    expect(item.engineContributions.find((c) => c.engine === 'qimen')?.applicability).toBe('not_applicable');
    expect(item.applicability).toBe('applicable'); // saju had data
  });
  it('validator REJECTS a fabricated real level without a connected ruleset', () => {
    const fabricated: AssessmentItem = { ...item, level: 'strong' };
    expect(isValidAssessmentItem(fabricated)).toBe(false);
  });
  it('validator ACCEPTS a real level only with a connected ruleset', () => {
    expect(isValidAssessmentItem({ ...item, level: 'strong', rulesetVersion: 'saju-wealth@1.0' })).toBe(true);
  });
  it('validator rejects support/counter refs that overlap', () => {
    expect(isValidAssessmentItem({ ...item, supportingEvidenceRefs: ['x'], counterEvidenceRefs: ['x'] })).toBe(false);
  });
  it('the fail-closed item is itself valid', () => {
    expect(isValidAssessmentItem(item)).toBe(true);
  });
});

describe('consultation case — references only, reproducible (§22/§23)', () => {
  const c = buildConsultationCase({
    consultationCaseId: 'case1', conversationId: 'conv1', messageId: 'm1', requestId: 'req1',
    subjectId: 'subj1', questionScope: 'broad_natal',
    usedEvidenceRefs: ['ev1'], usedAssessmentRefs: ['as1'],
    engineUsage: [{ engine: 'qimen', used: false, reason: 'not_applicable' }],
    crossAnalysisRef: null, responseRef: 'm2',
    versions: {
      intelligenceSchemaVersion: 'ci@1.0.0', assessmentSchemaVersion: 'assessment@1.0.0',
      assessmentRulesetVersion: ASSESSMENT_RULESET_NOT_CONNECTED,
      crossAnalysisVersion: null, promptVersion: null, model: null,
    },
    createdAt: NOW,
  });
  it('is valid and records unused engines + reasons + versions', () => {
    expect(isValidConsultationCase(c)).toBe(true);
    expect(c.engineUsage[0]).toEqual({ engine: 'qimen', used: false, reason: 'not_applicable' });
    expect(c.versions.assessmentRulesetVersion).toBe(ASSESSMENT_RULESET_NOT_CONNECTED);
    expect(c.schemaVersion).toBe('case@1.0.0');
  });
});

describe('quality — separate layer, fail-closed (§25/§26)', () => {
  const q = emptyQualityReview({ qualityReviewId: 'qr1', consultationCaseId: 'case1', source: 'auto_evaluator', createdAt: NOW });
  it('auto review starts not_evaluated + pending (no fake score)', () => {
    expect(q.overall).toBe('not_evaluated');
    expect(q.reviewStatus).toBe('pending');
    expect(isValidQualityReview(q)).toBe(true);
  });
  it("a 'reviewed' status must name reviewer + reviewedAt", () => {
    expect(isValidQualityReview({ ...q, reviewStatus: 'reviewed', reviewer: null, reviewedAt: null })).toBe(false);
    expect(isValidQualityReview({ ...q, reviewStatus: 'reviewed', reviewer: 'admin1', reviewedAt: NOW })).toBe(true);
  });
});

describe('user feedback — signal, not ground truth (§27)', () => {
  const f = buildUserFeedback({ feedbackId: 'fb1', consultationCaseId: 'case1', verdict: 'not_helpful', reason: 'too_vague', createdAt: NOW });
  it('captures verdict + optional reason', () => {
    expect(f.verdict).toBe('not_helpful');
    expect(f.reason).toBe('too_vague');
    expect(isValidUserFeedback(f)).toBe(true);
  });
});

describe('outcome — provenance safeguards (§30/§31)', () => {
  const o = fromUserReport({ outcomeId: 'oc1', relatedConsultationCaseId: 'case1', outcomeType: 'confirmed_positive', createdAt: NOW });
  it('a user report defaults to unverified (never verified)', () => {
    expect(o.source).toBe('user_report');
    expect(o.verificationStatus).toBe('unverified');
    expect(o.confidence).toBe('insufficient');
    expect(isValidOutcome(o)).toBe(true);
  });
  it('a user_report can NEVER be verified (invariant)', () => {
    expect(isValidOutcome({ ...o, verificationStatus: 'verified' })).toBe(false);
  });
  it('a higher-provenance source MAY be verified', () => {
    expect(isValidOutcome({ ...o, source: 'external_verified', verificationStatus: 'verified' })).toBe(true);
  });
});

describe('serialization round-trip (§46)', () => {
  it('an assessment item survives JSON round-trip unchanged', () => {
    const item = assembleFailClosed('overall', []);
    expect(JSON.parse(JSON.stringify(item))).toEqual(item);
  });
});

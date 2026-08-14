// Consultation Intelligence presentation adapters — Sprint 3A-B (evidence / grounding /
// explainability / cross-analysis / evaluation / feedback / outcome / assessment-detail).
// Pure fail-closed + contract-fidelity invariants; the UI renders these ViewModels, so
// locking them here locks on-screen behaviour without a render harness.
import type { DomainCross, EngineEvidence } from '@/features/analysis';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';

import type { AssessmentItem } from '../assessment';
import { buildUserFeedback } from '../feedback';
import { fromUserReport } from '../outcome';
import { emptyQualityReview, type QualityReview } from '../quality';
import { QUALITY_EVALUATOR_NOT_CONNECTED } from '../versions';
import {
  feedbackControlState,
  toAdminAssessmentDetail,
  toConsumerAssessmentDetail,
  toCrossAnalysisView,
  toEngineEvidenceView,
  toEvaluationView,
  toExplainabilityView,
  toFeedbackView,
  toGroundingView,
  toHumanReviewView,
  toOutcomeListView,
  toOutcomeView,
} from '../index';

const ev = (over: Partial<EngineEvidence> = {}): EngineEvidence => ({
  availability: 'available',
  summary: '재성이 강한 구조',
  ...over,
});

// ── Engine evidence: the five availability states stay DISTINCT (§11/§24) ─────────────
describe('engine evidence view — states never collapse (§11/§24)', () => {
  it('only "available" counts as used; summary surfaces only then', () => {
    const v = toEngineEvidenceView('saju', ev());
    expect(v.isAvailable).toBe(true);
    expect(v.summary).toBe('재성이 강한 구조');
    expect(v.availabilityLabel).toBe('활용됨');
  });
  it('not_applicable ≠ calculation_failed ≠ engine_not_connected (distinct labels)', () => {
    expect(toEngineEvidenceView('qimen', ev({ availability: 'not_applicable' })).availabilityLabel).toBe('미사용');
    expect(toEngineEvidenceView('qimen', ev({ availability: 'calculation_failed' })).availabilityLabel).toBe('계산 실패');
    expect(toEngineEvidenceView('qimen', ev({ availability: 'engine_not_connected' })).availabilityLabel).toBe('미연결');
    expect(toEngineEvidenceView('saju', ev({ availability: 'missing_birth_time' })).availabilityLabel).toBe('출생시간 필요');
  });
  it('never fabricates a summary for a non-available engine', () => {
    const v = toEngineEvidenceView('qimen', ev({ availability: 'not_applicable', summary: 'leaked' }));
    expect(v.isAvailable).toBe(false);
    expect(v.summary).toBe('');
  });
});

// ── Grounding + explainability: fail-closed + only-used engines (§10/§27/§28) ──────────
describe('grounding view — fail-closed default', () => {
  it('unavailable grounding shows the REASON, not an empty engine table', () => {
    const g: ConsultationGrounding = { status: 'unavailable', reason: 'engine_not_connected' };
    const v = toGroundingView(g);
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reasonLabel).toBe('엔진 미연결');
  });
  it('available grounding counts only the engines actually available (Qimen off ⇒ not counted, §11)', () => {
    const g: ConsultationGrounding = {
      status: 'available',
      evidence: {
        myungri: ev(),
        ziwei: ev({ availability: 'available', summary: '천동 배치' }),
        qimen: ev({ availability: 'not_applicable', summary: undefined }),
      },
    };
    const v = toGroundingView(g);
    if (v.status !== 'available') throw new Error('expected available');
    expect(v.usedCount).toBe(2);
    expect(v.engines.map((e) => e.engineLabel)).toEqual(['명리', '자미두수', '기문둔갑']);
  });
});

describe('explainability — 활용된 관점 lists ONLY used engines, never all three (§10)', () => {
  const g: ConsultationGrounding = {
    status: 'available',
    evidence: {
      myungri: ev(),
      ziwei: ev({ availability: 'engine_not_connected', summary: undefined }),
      qimen: ev({ availability: 'not_applicable', summary: undefined }),
    },
  };
  it('shows only 명리 as a used perspective; scope still lists all three honestly', () => {
    const v = toExplainabilityView(g);
    if (v.status !== 'available') throw new Error('expected available');
    expect(v.usedPerspectives.map((p) => p.engineLabel)).toEqual(['명리']);
    expect(v.scope).toHaveLength(3);
    expect(v.scope.find((s) => s.engineLabel === '기문둔갑')?.stateLabel).toBe('미사용');
  });
  it('unavailable grounding → explainability is unavailable', () => {
    const v = toExplainabilityView({ status: 'unavailable', reason: 'birth_time_unknown' });
    expect(v.status).toBe('unavailable');
    if (v.status === 'unavailable') expect(v.reasonLabel).toBe('출생시간 미상');
  });
});

// ── Cross analysis: signals never merged (§25/§27) ────────────────────────────────────
describe('cross analysis view — engines kept separate, empty is honest', () => {
  it('empty input renders an honest empty state (no fabricated "aligned")', () => {
    expect(toCrossAnalysisView([])).toEqual({ status: 'empty' });
  });
  it('preserves each engine signal independently; no summed score field', () => {
    const domains: DomainCross[] = [
      {
        domain: 'wealth',
        availableCount: 2,
        agreement: 'conflicting',
        signals: [
          { engine: 'saju', available: true, polarity: 'positive' },
          { engine: 'ziwei', available: true, polarity: 'caution' },
          { engine: 'qimen', available: false },
        ],
      },
    ];
    const v = toCrossAnalysisView(domains);
    if (v.status !== 'available') throw new Error('expected available');
    const d = v.domains[0];
    expect(d.domainLabel).toBe('재물');
    expect(d.agreementLabel).toBe('상충');
    expect(d.signals).toHaveLength(3);
    expect(d.signals[0].polarityLabel).toBe('긍정');
    expect(d.signals[1].polarityLabel).toBe('주의');
    expect(d.signals[2].polarityLabel).toBe(''); // unavailable → no fabricated polarity
    expect((d as { score?: number }).score).toBeUndefined();
  });
});

// ── Evaluation (§30/§31) — Assessment ≠ Evaluation, fail-closed ───────────────────────
describe('evaluation view — fail-closed, never invents scores', () => {
  it('an un-connected evaluator with nothing evaluated → not_evaluated / evaluator_not_connected', () => {
    const r = emptyQualityReview({
      qualityReviewId: 'q1',
      consultationCaseId: 'c1',
      source: 'auto_evaluator',
      createdAt: '2026-08-14T00:00:00Z',
    });
    const v = toEvaluationView(r);
    expect(v.status).toBe('not_evaluated');
    if (v.status === 'not_evaluated') expect(v.reason).toBe('evaluator_not_connected');
  });
  it('a real admin review surfaces overall + dimensions + reviewer', () => {
    const r: QualityReview = {
      qualityReviewId: 'q2',
      consultationCaseId: 'c2',
      source: 'admin_review',
      dimensions: { clarity: 'good', exaggeration: 'excellent' },
      overall: 'good',
      reviewStatus: 'reviewed',
      reviewer: 'admin-42',
      notesRef: null,
      evaluatorVersion: 'quality@1.0',
      schemaVersion: 'quality@1.0.0',
      reviewedAt: '2026-08-14T01:00:00Z',
      createdAt: '2026-08-14T00:00:00Z',
    };
    const v = toEvaluationView(r);
    if (v.status !== 'evaluated') throw new Error('expected evaluated');
    expect(v.overallLabel).toBe('양호');
    expect(v.isAdminReview).toBe(true);
    expect(v.reviewer).toBe('admin-42');
    expect(v.dimensions.map((d) => d.dimensionLabel)).toContain('명료성');
  });
});

// ── Human review (§33) — projection of QualityReview, write path NOT connected ────────
describe('human review view — never fabricates a write path (§33)', () => {
  it('reports writePathConnected:false and the honest review status', () => {
    const r = emptyQualityReview({
      qualityReviewId: 'q3',
      consultationCaseId: 'c3',
      source: 'admin_review',
      createdAt: '2026-08-14T00:00:00Z',
    });
    const v = toHumanReviewView(r);
    expect(v.writePathConnected).toBe(false);
    expect(v.reviewed).toBe(false);
    expect(v.reviewStatusLabel).toBe('대기');
  });
});

// ── Feedback (§20/§32) — no fake persistence ──────────────────────────────────────────
describe('feedback view + control — honest seam (§32)', () => {
  it('control cannot persist in V1.0 (no fake 저장됨)', () => {
    expect(feedbackControlState().canPersist).toBe(false);
  });
  it('none when no feedback; present with label when given', () => {
    expect(toFeedbackView(null)).toEqual({ status: 'none' });
    const f = buildUserFeedback({
      feedbackId: 'f1',
      consultationCaseId: 'c1',
      verdict: 'not_helpful',
      reason: 'too_vague',
      createdAt: '2026-08-14T00:00:00Z',
    });
    const v = toFeedbackView(f);
    if (v.status !== 'present') throw new Error('expected present');
    expect(v.helpful).toBe(false);
    expect(v.verdictLabel).toBe('도움이 안 됨');
    expect(v.reasonLabel).toBe('너무 모호함');
  });
});

// ── Outcome (§34) — user_report stays unverified, never inferred ──────────────────────
describe('outcome view — user report is always unverified (§34)', () => {
  it('a user-reported outcome is source=user_report / unverified', () => {
    const o = fromUserReport({
      outcomeId: 'o1',
      relatedConsultationCaseId: 'c1',
      outcomeType: 'confirmed_positive',
      createdAt: '2026-08-14T00:00:00Z',
    });
    const v = toOutcomeView(o);
    expect(v.sourceLabel).toBe('사용자 보고');
    expect(v.verificationLabel).toBe('미검증');
    expect(v.isVerified).toBe(false);
  });
  it('empty outcome list is honest empty, not fabricated', () => {
    expect(toOutcomeListView([])).toEqual({ status: 'empty', rows: [] });
  });
});

// ── Assessment detail (§9/§26) — consumer hides raw ids + insufficient; admin shows them
const item = (over: Partial<AssessmentItem> = {}): AssessmentItem => ({
  axisKey: 'business',
  level: 'strong',
  direction: 'rising',
  confidence: 'insufficient',
  agreement: 'aligned',
  applicability: 'applicable',
  timing: { label: '2027년 하반기', periodRef: '2027-H2' },
  warnings: ['과신 주의'],
  supportingEvidenceRefs: ['ev1', 'ev2'],
  counterEvidenceRefs: ['ev3'],
  engineContributions: [{ engine: 'saju', applicability: 'applicable', evidenceRefs: ['ev1'] }],
  schemaVersion: 'assessment@1.0.0',
  rulesetVersion: 'saju-business@1.0',
  ...over,
});

describe('assessment detail — consumer vs admin (§9/§12/§26)', () => {
  it('consumer HIDES insufficient confidence (never "낮음") and hides raw ids', () => {
    const d = toConsumerAssessmentDetail(item());
    expect(d.confidenceLabel).toBe('');
    expect(d.supportingCount).toBe(2);
    expect(d.counterCount).toBe(1);
    expect((d as { supportingRefs?: string[] }).supportingRefs).toBeUndefined();
  });
  it('admin shows insufficient truthfully + keeps supporting/counter refs separate', () => {
    const d = toAdminAssessmentDetail(item());
    expect(d.confidenceLabel).toBe('근거 부족');
    expect(d.supportingRefs).toEqual(['ev1', 'ev2']);
    expect(d.counterRefs).toEqual(['ev3']);
    expect((d as { evidenceRefs?: string[] }).evidenceRefs).toBeUndefined(); // never merged
    expect(d.engineContributions[0].engineLabel).toBe('명리');
    expect(d.engineContributions[0].applicabilityLabel).toBe('적용');
  });
});

// Consumer answer hygiene (Commercial UX V4 §22/§23/§24). Source-level lock: the consultation answer
// component must NOT render internal/debug surfaces — the raw-evidence sheet (활용된 관점 / 미사용 /
// engine names / 천간지지) or the assessment limitation copy ("아직 평가를 보여드리지 않아요"). The user
// sees only normalized, natural-language interpretation, conclusion-first, with a collapsed detail.
import fs from 'fs';
import path from 'path';

const src = fs.readFileSync(
  path.join(__dirname, '../StructuredConsultationResult.tsx'),
  'utf8',
);

describe('StructuredConsultationResult — no internal/debug leakage in the consumer answer', () => {
  it('does NOT render the raw InterpretationEvidenceSheet (활용됨/미사용/engine facts)', () => {
    expect(src).not.toMatch(/<InterpretationEvidenceSheet/);
  });
  it('does NOT render the AssessmentSummary (fail-closed limitation copy)', () => {
    expect(src).not.toMatch(/<AssessmentSummary/);
  });
  it('binds to the commercial presentation VM (conclusion-first) with a collapsed, user-language detail', () => {
    expect(src).toContain('toConsultationPresentation');
    // detail-on-demand: the 전문 근거 is collapsed under the consumer-first "왜 이렇게 보나요?" evidence
    // (DEOKBUNI_READING_EXPERIENCE — replaces the old "상세 해석 보기" toggle), never raw 근거 up front.
    expect(src).toContain('ReadingEvidence');
    expect(src).not.toContain('상세 해석 보기');
  });
});

// THE CONSUMED 40-CASE REGRESSION SET — one definition, shared by every runner that measures it.
//
// Extracted verbatim from runGroundedNarrativeRegression.test.ts (which now re-exports it) so a later batch
// re-measures the SAME 40 cases instead of a set that happens to be selected the same way. Deterministic:
// the 12 previously-reported hard fails, the 6 established controls, then a fixed-stride domain spread.
import { QA_CASES, type QaCase } from './consultationQaFixtures';

export const CASE_TARGET = 40;

export const PRIOR_HARD_FAIL_IDS = [
  'BUSINESS-06', 'BUSINESS-10', 'BUSINESS-17', 'MONEY-04', 'CAREER-02', 'CAREER-04',
  'LOVE-02', 'LOVE-09', 'LOVE-13', 'REUNION-05', 'CHANGE-07', 'TIMING-05',
];
export const CONTROL_IDS = ['BUSINESS-13', 'MONEY-02', 'CAREER-11', 'LOVE-04', 'CHANGE-02', 'TIMING-03'];

export function selectRegressionCases(): QaCase[] {
  const seeded = [...PRIOR_HARD_FAIL_IDS, ...CONTROL_IDS];
  const picked = new Map<string, QaCase>();
  for (const id of seeded) {
    const c = QA_CASES.find((x) => x.caseId === id);
    if (!c) throw new Error(`regression case id not found in QA_CASES: ${id}`);
    picked.set(id, c);
  }
  const rest = QA_CASES.filter((c) => !picked.has(c.caseId));
  const need = CASE_TARGET - picked.size;
  const stride = rest.length / need;
  for (let i = 0; i < need; i += 1) picked.set(rest[Math.floor(i * stride)].caseId, rest[Math.floor(i * stride)]);
  // Fixture order, so the report reads by domain.
  return QA_CASES.filter((c) => picked.has(c.caseId));
}

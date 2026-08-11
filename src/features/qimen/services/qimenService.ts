// Qimen orchestration (directive §22/§23): QuestionContext → QimenResult with an
// explicit eligibility/availability + truthful failure reason. PURE + DETERMINISTIC
// (no network/LLM/DB). Never returns a fabricated board: non-timing → not_applicable;
// no time → missing_question_time; Core failure → calculation_failed.
import { castBoard } from '../adapters/qimenCoreAdapter';
import { resolveQimenEligibility } from '../adapters/qimenInputAdapter';
import { adaptBoard } from '../adapters/qimenResultAdapter';
import type { QimenQuery, QimenResult } from '../domain/qimenTypes';
import { validateQimenBoard } from '../validation/qimenValidation';

export function computeQimenBoard(query: QimenQuery): QimenResult {
  const eligibility = resolveQimenEligibility(query);
  if (!eligibility.ok) {
    return { availability: eligibility.availability, board: null, reason: eligibility.reason };
  }

  try {
    const raw = castBoard(eligibility.queryTime);
    const board = adaptBoard(raw, eligibility.queryTime);
    const validation = validateQimenBoard(board);
    if (!validation.valid) {
      return {
        availability: 'calculation_failed',
        board: null,
        reason: `INVALID_BOARD:${validation.errors.join(',')}`,
      };
    }
    return { availability: 'available', board };
  } catch {
    return { availability: 'calculation_failed', board: null, reason: 'QIMEN_CORE_FAILED' };
  }
}

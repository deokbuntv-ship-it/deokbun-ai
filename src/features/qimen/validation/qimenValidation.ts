// Structural validation of a normalized QimenBoard (directive §24). SHAPE only —
// never judges divination correctness. A malformed Core result surfaces as
// `calculation_failed`, not a silently-wrong board.
import type { QimenBoard } from '../domain/qimenTypes';

export type QimenValidationResult = { valid: boolean; errors: string[] };

export function validateQimenBoard(board: QimenBoard): QimenValidationResult {
  const errors: string[] = [];

  if (board.palaces.length !== 9) errors.push('palace_count_not_9');
  if (!(Number.isInteger(board.ju) && board.ju >= 1 && board.ju <= 9)) errors.push('ju_out_of_range');
  if (board.dunType !== 'yang' && board.dunType !== 'yin') errors.push('dun_type_invalid');
  if (!board.solarTerm) errors.push('solar_term_missing');
  if (!board.zhifu) errors.push('zhifu_missing');
  if (!board.zhishi) errors.push('zhishi_missing');
  if (!board.ganzhi.hour) errors.push('hour_pillar_missing');

  return { valid: errors.length === 0, errors };
}

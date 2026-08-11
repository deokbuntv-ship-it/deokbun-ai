// Ziwei orchestration (directive §5/§20/§23): BirthInfo → ZiweiResult with an
// explicit availability + a truthful failure reason. PURE + DETERMINISTIC — no
// network / LLM / DB (§19). Never returns a fabricated chart: input problems →
// missing_birth_time / unsupported_case; Core failure → calculation_failed.
//
// Error contract (§23): the ZiweiResult carries engine/library/ruleSet versions
// and a machine `reason` (App-Error-style code) — enough for a caller to log via
// the standard App Error Contract WITHOUT this pure function performing I/O, and
// WITHOUT any PII (no birth date / time in the reason or result metadata beyond
// the normalized input the caller already holds).
import { castAstrolabe } from '../adapters/iztroAdapter';
import { resolveZiweiInput, type ZiweiBirthInput } from '../adapters/ziweiInputAdapter';
import { adaptAstrolabe } from '../adapters/ziweiResultAdapter';
import type { ZiweiResult } from '../domain/ziweiTypes';
import { validateZiweiChart } from '../validation/ziweiValidation';

export function computeZiweiChart(birth: ZiweiBirthInput): ZiweiResult {
  const resolved = resolveZiweiInput(birth);
  if (!resolved.ok) {
    return { availability: resolved.availability, chart: null, reason: resolved.reason };
  }

  try {
    const raw = castAstrolabe(resolved.input);
    const chart = adaptAstrolabe(raw, resolved.input);
    const validation = validateZiweiChart(chart);
    if (!validation.valid) {
      return {
        availability: 'calculation_failed',
        chart: null,
        reason: `INVALID_CHART:${validation.errors.join(',')}`,
      };
    }
    return { availability: 'available', chart };
  } catch {
    // Core threw — never guess a chart.
    return { availability: 'calculation_failed', chart: null, reason: 'ZIWEI_CORE_FAILED' };
  }
}

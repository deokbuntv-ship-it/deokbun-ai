import type {
  SolarTermDataset,
  SolarTermId,
  SolarTermResolutionResult,
} from './contracts';

export function resolveSolarTerm(
  dataset: SolarTermDataset,
  year: number,
  termId: SolarTermId,
): SolarTermResolutionResult {
  if (dataset.manifest.approvalStatus !== 'APPROVED') {
    return {
      success: false,
      errors: [{ code: 'DATASET_NOT_APPROVED', path: 'manifest.approvalStatus' }],
    };
  }
  const startYear = dataset.manifest.artifactCoverageRange.start.year;
  const endYear = dataset.manifest.artifactCoverageRange.end.year;
  if (!Number.isInteger(year) || year < startYear || year > endYear) {
    return {
      success: false,
      errors: [{ code: 'UNSUPPORTED_YEAR', path: 'year', details: { year } }],
    };
  }
  const matches = dataset.records.filter(
    (record) => record.year === year && record.termId === termId,
  );
  if (matches.length === 0) {
    return {
      success: false,
      errors: [{ code: 'TERM_NOT_FOUND', path: 'records', details: { year, termId } }],
    };
  }
  if (matches.length > 1) {
    return {
      success: false,
      errors: [{ code: 'DUPLICATE_TERM', path: 'records', details: { year, termId } }],
    };
  }
  return { success: true, value: matches[0] };
}

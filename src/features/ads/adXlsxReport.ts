// Advertisement performance → .xlsx sheet mapper (§42/§43/§44). Pure: the CALLER passes
// the already-filtered rows (so "화면에서 보는 결과 → XLSX" holds, §44) plus the resolved
// tracking origin. Aggregate ad-performance only — NO user PII (§45). Numeric metrics are
// written as real numbers (usable in Excel) or '—' when null (§35/§64).
import { formatRate } from './adMetrics';
import { AD_STATUS_LABELS, AD_TYPE_LABELS, CONTRACT_TYPE_LABELS } from './labels';
import { buildTrackingUrl } from './trackingUrl';
import { numberCell, textCell, type XlsxCell, type XlsxSheet } from './xlsx/xlsxWriter';
import type { AdPerformanceRow } from './types';

// §43 column order (Korean headers).
export const XLSX_HEADERS = [
  '광고ID', '광고상태', '광고형태', '닉네임', '광고확인링크', '광고시작일', '계약형태', '발급URL',
  '광고비', '유입수', '출생정보완료', '가입수', '첫상담수', 'D1', 'D7', 'D30',
  '출생완료전환율', '가입전환율', '첫상담전환율', 'D1리텐션', 'D7리텐션', 'D30리텐션',
  '가입CAC', '첫상담CPA', '메모',
];

function ratePct(r: number | null): XlsxCell {
  // Percent as a human string ('—' when null) — keeps the sheet readable; the raw counts
  // columns remain numeric for Excel math.
  return textCell(formatRate(r));
}

/** Build the performance workbook. `origin` resolves the 발급URL column; `notesByAd` and
 * `costByAd` come from the ad records the caller already loaded. */
export function buildAdPerformanceSheet(
  rows: readonly AdPerformanceRow[],
  opts: {
    origin: string | null;
    sheetName?: string;
    trackingCodeByAd?: Record<string, string | null>;
    adCheckUrlByAd?: Record<string, string | null>;
    notesByAd?: Record<string, string | null>;
  },
): XlsxSheet {
  const dash = '—';
  const dataRows: XlsxCell[][] = rows.map((row) => {
    const ad = row.ad;
    const code = opts.trackingCodeByAd?.[ad.id] ?? ad.publicTrackingCode ?? null;
    const trackingUrl = buildTrackingUrl(code, opts.origin) ?? dash;
    return [
      textCell(ad.id),
      textCell(AD_STATUS_LABELS[ad.status]),
      textCell(AD_TYPE_LABELS[ad.adType]),
      textCell(ad.publisherNickname),
      textCell(opts.adCheckUrlByAd?.[ad.id] ?? dash),
      textCell(ad.startDate ?? dash),
      textCell(CONTRACT_TYPE_LABELS[ad.contractType]),
      textCell(trackingUrl),
      numberCell(ad.costKrw), // '—' when null, never 0 (§35)
      numberCell(row.counts.clicks),
      numberCell(row.counts.birthInfoCompleted),
      numberCell(row.counts.signups),
      numberCell(row.counts.firstConsultations),
      numberCell(row.counts.d1),
      numberCell(row.counts.d7),
      numberCell(row.counts.d30),
      ratePct(row.birthConversion),
      ratePct(row.signupConversion),
      ratePct(row.firstConsultConversion),
      ratePct(row.d1Retention),
      ratePct(row.d7Retention),
      ratePct(row.d30Retention),
      numberCell(row.signupCac), // '—' when cost missing / 0 signups
      numberCell(row.firstConsultCpa),
      textCell(opts.notesByAd?.[ad.id] ?? ''),
    ];
  });

  return { name: opts.sheetName ?? '광고성과', headers: XLSX_HEADERS, rows: dataRows };
}

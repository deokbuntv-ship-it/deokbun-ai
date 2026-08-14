// Sprint 3B — pure .xlsx writer (§42/§64). Verifies a valid OOXML/ZIP is produced with
// Korean text preserved, numbers numeric, and the §43 columns present.
import { computeAdPerformance } from '../adMetrics';
import { buildAdPerformanceSheet, XLSX_HEADERS } from '../adXlsxReport';
import { emptyFunnelCounts } from '../funnel';
import type { AdListItem } from '../types';
import { utf8Bytes } from '../xlsx/bytes';
import { crc32 } from '../xlsx/crc32';
import { buildXlsx, numberCell, textCell } from '../xlsx/xlsxWriter';

function ascii(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return s;
}

describe('crc32 (IEEE test vector)', () => {
  it('crc32("123456789") === 0xCBF43926', () => {
    expect(crc32(utf8Bytes('123456789'))).toBe(0xcbf43926);
  });
});

describe('buildXlsx produces a valid OOXML zip', () => {
  const xlsx = buildXlsx({
    name: '광고성과',
    headers: ['이름', '유입수'],
    rows: [[textCell('덕분TV'), numberCell(1234)], [textCell('무삭제신점'), numberCell(null)]],
  });

  it('starts with the ZIP local-file signature PK\\x03\\x04', () => {
    expect(xlsx[0]).toBe(0x50);
    expect(xlsx[1]).toBe(0x4b);
    expect(xlsx[2]).toBe(0x03);
    expect(xlsx[3]).toBe(0x04);
  });
  it('contains the End-Of-Central-Directory signature', () => {
    const s = ascii(xlsx);
    expect(s.includes('PK\x05\x06')).toBe(true);
  });
  it('writes numbers as numeric cells (usable in Excel), null numbers as — text', () => {
    const s = ascii(xlsx);
    expect(s.includes('<v>1234</v>')).toBe(true); // numeric
    expect(s.includes('t="inlineStr"')).toBe(true); // text cells present
    expect(s.includes('<v>0</v>')).toBe(false); // null NEVER written as 0 (§35)
  });
  it('preserves Korean header/text as UTF-8 bytes', () => {
    const needle = utf8Bytes('덕분TV');
    const hay = Array.from(xlsx);
    // find the UTF-8 subsequence
    let found = false;
    for (let i = 0; i + needle.length <= hay.length; i++) {
      if (needle.every((b, j) => hay[i + j] === b)) { found = true; break; }
    }
    expect(found).toBe(true);
  });
});

describe('performance sheet mapping (§43/§44/§45)', () => {
  const ad: AdListItem = {
    id: 'ad1', publicTrackingCode: 'ad_2345678a', adType: 'instagram_reels',
    publisherNickname: '사계절운세', startDate: '2026-08-14', contractType: 'review_agency',
    costKrw: null, status: 'active',
  };
  const sheet = buildAdPerformanceSheet(
    [computeAdPerformance(ad, emptyFunnelCounts('ad1'))],
    { origin: 'https://deokbun.example', adCheckUrlByAd: { ad1: 'https://youtube.com/x' }, notesByAd: { ad1: '테스트' } },
  );

  it('has exactly the §43 columns', () => {
    expect(sheet.headers).toEqual(XLSX_HEADERS);
    expect(sheet.headers).toContain('발급URL');
    expect(sheet.headers).toContain('가입CAC');
  });
  it('derives 발급URL from the origin (not the same as 광고확인링크, §39)', () => {
    const s = ascii(buildXlsx(sheet));
    expect(s.includes('https://deokbun.example/?ad=ad_2345678a')).toBe(true); // 발급URL
    expect(s.includes('https://youtube.com/x')).toBe(true); // 광고확인링크 (distinct)
  });
  it('missing cost renders — (no 0원) in the sheet', () => {
    const row = sheet.rows[0];
    const costCell = row[XLSX_HEADERS.indexOf('광고비')];
    expect(costCell).toEqual(textCell('—'));
  });
});

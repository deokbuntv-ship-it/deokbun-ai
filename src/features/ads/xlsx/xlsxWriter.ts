// Minimal, dependency-free .xlsx (OOXML) writer (§42/§64). Produces a genuine Excel-
// openable workbook as a Uint8Array — a STORED (uncompressed) ZIP of the required XML
// parts, with inline strings so numbers stay numeric (usable in Excel formulas) and
// Korean text is preserved via UTF-8. Pure → fully unit-testable. NO npm dependency (keeps
// `npm ls` clean, works in RN/web/node alike).
import { u16, u32, utf8Bytes, xmlEscape } from './bytes';
import { crc32 } from './crc32';

export type XlsxCell = { type: 'text'; value: string } | { type: 'number'; value: number };
export type XlsxSheet = {
  name: string;
  headers: string[];
  rows: XlsxCell[][];
};

export function textCell(value: string): XlsxCell {
  return { type: 'text', value };
}
export function numberCell(value: number | null): XlsxCell {
  // A null numeric (missing cost / undefined metric) is written as EMPTY text ('—'),
  // never 0 — mirrors the on-screen '—' so the sheet never fabricates a value (§35/§64).
  return value === null || Number.isNaN(value)
    ? { type: 'text', value: '—' }
    : { type: 'number', value };
}

function colLetter(index: number): string {
  let n = index;
  let s = '';
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

function cellXml(cell: XlsxCell, ref: string): string {
  if (cell.type === 'number') {
    return `<c r="${ref}"><v>${cell.value}</v></c>`;
  }
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(cell.value)}</t></is></c>`;
}

function sheetXml(sheet: XlsxSheet): string {
  const allRows: XlsxCell[][] = [sheet.headers.map(textCell), ...sheet.rows];
  const rowsXml = allRows
    .map((row, r) => {
      const cells = row.map((cell, c) => cellXml(cell, `${colLetter(c)}${r + 1}`)).join('');
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join('');
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<sheetData>${rowsXml}</sheetData></worksheet>`
  );
}

// Fixed workbook scaffolding (single sheet).
function contentTypesXml(): string {
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
    `</Types>`
  );
}
function rootRelsXml(): string {
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
    `</Relationships>`
  );
}
function workbookXml(sheetName: string): string {
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ` +
    `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<sheets><sheet name="${xmlEscape(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`
  );
}
function workbookRelsXml(): string {
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
    `</Relationships>`
  );
}

type ZipEntry = { name: string; data: number[] };

// Assemble a STORED (method 0, no compression) ZIP. Compression is unnecessary for a
// small report and avoids a deflate dependency; Excel opens STORED .xlsx fine.
function buildZip(entries: ZipEntry[]): Uint8Array {
  const chunks: number[] = [];
  const central: number[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = utf8Bytes(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    // Local file header
    const local = [
      ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(size), ...u32(size), ...u16(nameBytes.length), ...u16(0),
      ...nameBytes, ...entry.data,
    ];
    chunks.push(...local);

    // Central directory header
    central.push(
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(size), ...u32(size), ...u16(nameBytes.length),
      ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset), ...nameBytes,
    );
    offset += local.length;
  }

  const centralOffset = offset;
  const eocd = [
    ...u32(0x06054b50), ...u16(0), ...u16(0),
    ...u16(entries.length), ...u16(entries.length),
    ...u32(central.length), ...u32(centralOffset), ...u16(0),
  ];

  return Uint8Array.from([...chunks, ...central, ...eocd]);
}

/** Build a one-sheet .xlsx workbook as bytes. */
export function buildXlsx(sheet: XlsxSheet): Uint8Array {
  const entries: ZipEntry[] = [
    { name: '[Content_Types].xml', data: utf8Bytes(contentTypesXml()) },
    { name: '_rels/.rels', data: utf8Bytes(rootRelsXml()) },
    { name: 'xl/workbook.xml', data: utf8Bytes(workbookXml(sheet.name)) },
    { name: 'xl/_rels/workbook.xml.rels', data: utf8Bytes(workbookRelsXml()) },
    { name: 'xl/worksheets/sheet1.xml', data: utf8Bytes(sheetXml(sheet)) },
  ];
  return buildZip(entries);
}

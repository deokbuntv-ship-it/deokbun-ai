// LEVEL 3 — INDEPENDENT GOLDEN VALIDATION for 기문둔갑 (qimen-dunjia-chaibu@2.1.0, 時家 + 拆補法).
//
// INDEPENDENT ORACLE: `lunar-javascript@1.7.7` (MIT) for the governing 節氣 + its solar date +
// the query 干支, THEN the UNIVERSAL, non-school-dependent 時家 rules applied here:
//   • 陰陽遁: 冬至→芒種 = 陽遁; 夏至→大雪 = 陰遁 (division at the 二至 — universal).
//   • 三元 (拆補): 節後 0–4일=上元, 5–9=中元, 10–14=下元 (5일 1원 — the 拆補 method DeokbunAI selected).
// These are computed here from the oracle's term + day-count, so they are INDEPENDENT of
// qimen-dunjia's own 局-selection logic (a mismatch would be a real finding, not circular).
//
// WHAT THIS INDEPENDENTLY VERIFIES: dunType (陰/陽遁), sanyuan (上/中/下元), the governing 節氣
// (charset-normalised), and the query 四柱 干支.
// WHAT THIS DOES NOT independently re-derive (REFERENCE UNCERTAINTY / class E, see
// docs/ENGINE_GOLDEN_VALIDATION.md): the 局數 (ju 1–9) requires the 節氣→局 lookup table, which
// only the library (and its README) provides here — kept under the existing CHARACTERIZATION
// lock, and the per-palace 八門/九星/八神 board placement (SCHOOL-DEPENDENT). NOT fabricated.
import { Solar } from 'lunar-javascript';

import { computeQimenBoard } from '../services/qimenService';
import type { QimenQuery } from '../domain/qimenTypes';
import { QIMEN_RULESET_VERSION } from '../adapters/qimenCoreAdapter';

// 陽遁 terms (lunar-javascript simplified charset). 冬至 → 芒種.
const YANG = new Set(['冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种']);
// canonical folding for simplified↔traditional term variants (compare board vs oracle safely)
const CANON: Record<string, string> = { 驚蟄: '惊蛰', 穀雨: '谷雨', 小滿: '小满', 芒種: '芒种', 處暑: '处暑' };
const canon = (t: string): string => CANON[t] ?? t;

function oracle(y: number, mo: number, d: number, h: number) {
  const solar = Solar.fromYmdHms(y, mo, d, h, 0, 0);
  const lunar = solar.getLunar();
  const jie = lunar.getPrevJieQi(true);
  const term = jie.getName(); // simplified
  const termYmd = jie.getSolar().toYmd(); // 'YYYY-MM-DD'
  const [ty, tm, td] = termYmd.split('-').map(Number);
  const daysAfter = Math.round((Date.UTC(y, mo - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000);
  const sanyuan = ['上元', '中元', '下元'][Math.min(2, Math.floor(daysAfter / 5))];
  const dun = YANG.has(term) ? 'yang' : 'yin';
  const ec = lunar.getEightChar();
  return { term, daysAfter, sanyuan, dun, gz: { year: ec.getYear(), month: ec.getMonth(), day: ec.getDay(), hour: ec.getTime() } };
}

const timing = (y: number, mo: number, d: number, h: number): QimenQuery => ({
  isTimingQuestion: true,
  questionTime: { year: y, month: mo, day: d, hour: h },
});

// Representative boards: 陽遁/陰遁, 上/中/下元, 二至 boundaries, 節 boundaries, simp/trad charset.
const FIXTURES: { id: string; y: number; mo: number; d: number; h: number; note: string }[] = [
  { id: 'xiaohan-mid', y: 2024, mo: 1, d: 15, h: 10, note: '小寒 中元 陽 (library worked example)' },
  { id: 'xiaohan-shang', y: 2024, mo: 1, d: 6, h: 12, note: '小寒 당일 → 上元 陽 (三元 boundary)' },
  { id: 'xiaohan-xia', y: 2024, mo: 1, d: 19, h: 12, note: '小寒 +13 → 下元 陽' },
  { id: 'xiazhi-start', y: 2024, mo: 6, d: 25, h: 12, note: '夏至 직후 → 陰遁 시작 (二至 경계)' },
  { id: 'xiazhi-xia', y: 2024, mo: 7, d: 4, h: 12, note: '夏至 +13 → 下元 陰' },
  { id: 'dongzhi-start', y: 2023, mo: 12, d: 25, h: 12, note: '冬至 직후 → 陽遁 시작 (二至 경계)' },
  { id: 'liqiu', y: 2024, mo: 8, d: 10, h: 12, note: '立秋 → 陰' },
  { id: 'jingzhe', y: 2024, mo: 3, d: 8, h: 12, note: '惊蛰/驚蟄 → 陽 (simp/trad charset)' },
  { id: 'qiufen', y: 2024, mo: 9, d: 25, h: 12, note: '秋分 → 陰' },
  { id: 'guyu', y: 2024, mo: 4, d: 28, h: 12, note: '谷雨/穀雨 中元 → 陽 (charset)' },
];

describe('LEVEL 3 · qimen independent golden — 陰陽遁 / 三元 / 節氣 / 干支 (§8/§9)', () => {
  it.each(FIXTURES)('$id ($note)', (fx) => {
    const r = computeQimenBoard(timing(fx.y, fx.mo, fx.d, fx.h));
    expect(r.availability).toBe('available');
    if (r.availability !== 'available') return;
    const b = r.board;
    const o = oracle(fx.y, fx.mo, fx.d, fx.h);

    // provenance + rule lock + structure
    expect(b.library).toBe('qimen-dunjia');
    expect(b.ruleSetVersion).toBe(QIMEN_RULESET_VERSION); // qimen-dunjia-chaibu@2.1.0
    expect(b.palaces).toHaveLength(9);
    expect(b.ju).toBeGreaterThanOrEqual(1);
    expect(b.ju).toBeLessThanOrEqual(9);

    // INDEPENDENT: 陰陽遁 + 三元 from the universal 二至/拆補 rules (not the library's table)
    expect(b.dunType).toBe(o.dun);
    expect(b.sanyuan).toBe(o.sanyuan);
    // INDEPENDENT: governing 節氣 (charset-folded)
    expect(canon(b.solarTerm)).toBe(canon(o.term));
    // INDEPENDENT: query 四柱 干支
    expect(b.ganzhi.year).toBe(o.gz.year);
    expect(b.ganzhi.month).toBe(o.gz.month);
    expect(b.ganzhi.day).toBe(o.gz.day);
    expect(b.ganzhi.hour).toBe(o.gz.hour);
  });
});

describe('LEVEL 3 · qimen capability≠usage + fail-closed (§10/§14) — must stay intact', () => {
  it('a NON-timing question → not_applicable (Qimen is never always-on)', () => {
    const r = computeQimenBoard({ isTimingQuestion: false, questionTime: { year: 2024, month: 1, day: 15, hour: 10 } });
    expect(r.availability).toBe('not_applicable');
    expect(r.board).toBeNull();
  });
  it('a timing question with NO question time → missing_question_time (no clock fallback)', () => {
    const r = computeQimenBoard({ isTimingQuestion: true, questionTime: null });
    expect(r.availability).toBe('missing_question_time');
  });
  it('invalid hour → unsupported_case', () => {
    const r = computeQimenBoard(timing(2024, 1, 15, 24));
    expect(r.availability).toBe('unsupported_case');
  });
});

describe('LEVEL 3 · qimen adapter integrity (§20) — no raw library leak, provenance survives', () => {
  it('board carries only DeokbunAI-owned fields + provenance; ruleSetVersion survives', () => {
    const b = computeQimenBoard(timing(2024, 1, 15, 10)).board!;
    expect(new Set(Object.keys(b))).toEqual(
      new Set([
        'engine', 'engineVersion', 'library', 'libraryVersion', 'ruleSetVersion', 'queryTime',
        'dunType', 'ju', 'sanyuan', 'solarTerm', 'daysAfterTerm', 'ganzhi', 'hourStem',
        'xunHead', 'fuHead', 'zhifu', 'zhishi', 'zhifuPalace', 'zhishiPalace', 'palaces', 'warnings',
      ]),
    );
    expect(b.engine).toBe('qimen');
    b.palaces.forEach((p) =>
      expect(new Set(Object.keys(p))).toEqual(
        new Set(['index', 'palaceLabel', 'earthPlate', 'heavenPlate', 'earthDoor', 'heavenDoor', 'star', 'god']),
      ),
    );
  });
});

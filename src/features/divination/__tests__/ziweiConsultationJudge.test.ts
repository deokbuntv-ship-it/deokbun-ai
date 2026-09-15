// ZIWEI CORE CONSULTATION JUDGES V1 — BUSINESS/MONEY/CAREER/LOVE/REUNION/CHANGE/TIMING.
//
// Every fixture is a REAL chart computed by `computeZiweiChart` (never hand-faked palace/사화 data),
// each independently probed via a throwaway jest run before being hardcoded here — the exact discipline
// established for Myungri's own fixtures in this session. The base chart (1990-08-15 11:00 male) is the
// SAME chart already independently locked in `ziwei/__tests__/v1Conformance.test.ts`
// (명궁:[자미,파군], 관록:[염정,탐랑], 재백:[무곡,칠살]); other hours of the same birth date, and two
// additional real dates, were probed to find real MIXED/UNRESOLVED cases for REUNION/CHANGE specifically
// (their triads happen to carry no 사화 signal at 11:00 on the base date).
import { computeZiweiChart } from '@/features/ziwei';
import { activeDecadalPalace } from '@/features/ziwei';
import type { ZiweiChart } from '@/features/ziwei/domain/ziweiTypes';
import {
  judgeAllZiweiConsultationDomains, type ConsultationJudgeDomain, type ZiweiConsultationJudgeInput,
} from '../ziweiConsultationJudge';

function chartFor(year: string, month: string, day: string, hour: number, gender: 'male' | 'female' = 'male'): ZiweiChart {
  const r = computeZiweiChart({ gender, birthYear: year, birthMonth: month, birthDay: day, birthHour: String(hour), birthMinute: '0', birthTimeAccuracy: 'exact' });
  if (r.availability !== 'available') throw new Error(`fixture chart unavailable: ${year}-${month}-${day} ${hour}시`);
  return r.chart;
}
const BASE = (hour: number) => chartFor('1990', '8', '15', hour);

function judge(domain: ConsultationJudgeDomain, chart: ZiweiChart, activeDecadal: ZiweiConsultationJudgeInput['activeDecadal'] = null) {
  return judgeAllZiweiConsultationDomains({ chart, activeDecadal })[domain];
}

// ══ BUSINESS ═══════════════════════════════════════════════════════════════════════════════════
describe('BUSINESS', () => {
  it('FAVORABLE: real chart where 명궁/재백 삼방사정 carries only opening 사화', () => {
    const r = judge('BUSINESS', BASE(1));
    expect(r.status).toBe('FAVORABLE');
    expect(r.opportunities.length).toBeGreaterThan(0);
    expect(r.syntheticInferences.length).toBeGreaterThan(0);
  });
  it('CAUTION: real chart where 명궁/재백 삼방사정 carries only obstructive 사화', () => {
    expect(judge('BUSINESS', BASE(5)).status).toBe('CAUTION');
  });
  it('MIXED: real chart where 명궁 and 재백 disagree', () => {
    const r = judge('BUSINESS', BASE(15));
    expect(r.status).toBe('MIXED');
    expect(r.opportunities.length).toBeGreaterThan(0);
    expect(r.risks.length).toBeGreaterThan(0);
  });
});

// ══ MONEY ══════════════════════════════════════════════════════════════════════════════════════
describe('MONEY', () => {
  it('FAVORABLE: real chart, 재백/전택 both open', () => {
    expect(judge('MONEY', BASE(7)).status).toBe('FAVORABLE');
  });
  it('CAUTION: real chart, 재백/전택 obstructed', () => {
    expect(judge('MONEY', BASE(0)).status).toBe('CAUTION');
  });
  it('MIXED: real chart, inflow and retention disagree', () => {
    const r = judge('MONEY', BASE(3));
    expect(r.status).toBe('MIXED');
    expect(r.supportingEvidence.length).toBeGreaterThan(0);
    expect(r.counterEvidence.length).toBeGreaterThan(0);
  });
});

// ══ CAREER ═════════════════════════════════════════════════════════════════════════════════════
describe('CAREER', () => {
  it('FAVORABLE: real chart, 관록/천이 open', () => {
    expect(judge('CAREER', BASE(1)).status).toBe('FAVORABLE');
  });
  it('CAUTION: real chart, 관록/천이 obstructed (변동 압력)', () => {
    const r = judge('CAREER', BASE(7));
    expect(r.status).toBe('CAUTION');
  });
  it('MIXED: real chart, 관록 and 천이 disagree', () => {
    expect(judge('CAREER', BASE(5)).status).toBe('MIXED');
  });
});

// ══ LOVE ═══════════════════════════════════════════════════════════════════════════════════════
describe('LOVE', () => {
  it('FAVORABLE: real chart, 화록 lands on 부처 본궁', () => {
    const r = judge('LOVE', BASE(5));
    expect(r.status).toBe('FAVORABLE');
  });
  it('CAUTION: real chart, 화기 lands on 부처 본궁', () => {
    const r = judge('LOVE', BASE(3));
    expect(r.status).toBe('CAUTION');
  });
  it('MIXED: real chart, 부처 and 형제 disagree', () => {
    expect(judge('LOVE', BASE(7)).status).toBe('MIXED');
  });
  it('UNRESOLVED: real chart, neither 부처 nor 형제 삼방사정 carries any 사화', () => {
    const r = judge('LOVE', chartFor('1985', '3', '22', 9, 'male'));
    expect(r.status).toBe('UNRESOLVED');
    expect(r.uncertaintyReasons.length).toBeGreaterThan(0);
  });
});

// ══ REUNION — never aliased to LOVE ════════════════════════════════════════════════════════════
describe('REUNION', () => {
  it('FAVORABLE: real chart, 화록 opens 부처 본궁, no 화기 concern', () => {
    const r = judge('REUNION', BASE(5));
    expect(r.status).toBe('FAVORABLE');
  });
  it('CAUTION: real chart, 화기 on 부처 본궁, no opening', () => {
    const r = judge('REUNION', BASE(7));
    expect(r.status).toBe('CAUTION');
  });
  it('UNRESOLVED: real chart, no 화록/화기 signal anywhere in 부처 삼방사정 (11시)', () => {
    expect(judge('REUNION', BASE(11)).status).toBe('UNRESOLVED');
  });
  it('MIXED (§18 compound truth): real chart where opening AND stability concern both hold', () => {
    const r = judge('REUNION', chartFor('1985', '3', '22', 17, 'female'));
    expect(r.status).toBe('MIXED');
    expect(r.opportunities.length).toBeGreaterThan(0);
    expect(r.risks.length).toBeGreaterThan(0);
    expect(r.conclusion).toMatch(/열려 있지만|별개/); // compound phrasing, never a bare yes/no
  });
  it('REUNION and LOVE differ on the identical chart — not aliased', () => {
    const chart = BASE(7);
    expect(judge('LOVE', chart).status).toBe('MIXED');
    expect(judge('REUNION', chart).status).toBe('CAUTION');
    expect(judge('LOVE', chart).conclusion).not.toBe(judge('REUNION', chart).conclusion);
  });
});

// ══ CHANGE — pressure, never a guaranteed event (§21) ═════════════════════════════════════════════
describe('CHANGE', () => {
  it('FAVORABLE: real chart, 천이/관록 open', () => {
    expect(judge('CHANGE', BASE(1)).status).toBe('FAVORABLE');
  });
  it('CAUTION: real chart, 천이/관록 obstructed — phrased as pressure, never a guaranteed move', () => {
    const r = judge('CHANGE', BASE(7));
    expect(r.status).toBe('CAUTION');
    expect(JSON.stringify(r)).not.toMatch(/반드시 이동|guaranteed/i);
  });
  it('MIXED: real chart, 천이 and 관록 disagree', () => {
    expect(judge('CHANGE', BASE(5)).status).toBe('MIXED');
  });
  it('UNRESOLVED: real chart, neither 천이 nor 관록 삼방사정 carries any 사화', () => {
    const r = judge('CHANGE', chartFor('1988', '1', '30', 5, 'female'));
    expect(r.status).toBe('UNRESOLVED');
  });
});

// ══ TIMING — reads the CURRENTLY ACTIVE 大限 palace only, never natal-only, never a date ═══════════
describe('TIMING', () => {
  const chart = BASE(11);
  it('FAVORABLE: the active 大限 palace itself carries an opening 사화', () => {
    const p = activeDecadalPalace(chart, 40);
    expect(p?.name).toBe('전택');
    const r = judge('TIMING', chart, p);
    expect(r.status).toBe('FAVORABLE');
    expect(r.temporalDrivers.length).toBeGreaterThan(0);
  });
  it('CAUTION: the active 大限 palace itself carries 화기', () => {
    const p = activeDecadalPalace(chart, 80);
    expect(p?.name).toBe('질액');
    expect(judge('TIMING', chart, p).status).toBe('CAUTION');
  });
  it('UNRESOLVED: a real active 大限 palace exists but carries no 사화 of its own', () => {
    const p = activeDecadalPalace(chart, 10);
    expect(p?.name).toBe('명궁');
    const r = judge('TIMING', chart, p);
    expect(r.status).toBe('UNRESOLVED');
  });
  it('UNRESOLVED: no active 大限 at all (e.g. missing birth-time precision upstream) — never a fabricated period', () => {
    const r = judge('TIMING', chart, null);
    expect(r.status).toBe('UNRESOLVED');
    expect(r.uncertaintyReasons.some((u) => u.includes('大限'))).toBe(true);
  });
  it('NATAL vs 大限 stay distinct: TIMING never reads natal-only palaces the other 6 domains use', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../ziweiConsultationJudge.ts'), 'utf8');
    const timingFn = source.slice(source.indexOf('function judgeTiming'), source.indexOf('const JUDGES'));
    expect(timingFn).not.toMatch(/palaceForDomain|ruleFromAxis/);
  });
});

// ══ CROSS-DOMAIN DIFFERENTIATION — no global good/bad chart state ═══════════════════════════════
describe('cross-domain differentiation — no global good/bad chart state', () => {
  it('the SAME chart legitimately produces different statuses across domains', () => {
    const chart = BASE(7);
    const all = judgeAllZiweiConsultationDomains({ chart, activeDecadal: null });
    const statuses = new Set(Object.values(all).map((r) => r.status));
    expect(statuses.size).toBeGreaterThan(1);
    expect(all.BUSINESS.status).toBe('FAVORABLE');
    expect(all.LOVE.status).toBe('MIXED');
  });

  it('no GLOBAL_FAVORABLE_SCORE / GLOBAL_BAD_CHART / GLOBAL_LUCK_LEVEL field anywhere in the module', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../ziweiConsultationJudge.ts'), 'utf8');
    expect(source).not.toMatch(/GLOBAL_FAVORABLE_SCORE|GLOBAL_BAD_CHART|GLOBAL_LUCK_LEVEL/);
  });
});

// ══ PRODUCT QUALITY & SAFETY ═══════════════════════════════════════════════════════════════════
describe('product quality and logic safety', () => {
  it('every non-UNRESOLVED result carries at least one real multi-premise synthetic inference', () => {
    const r = judge('BUSINESS', BASE(1));
    expect(r.status).not.toBe('UNRESOLVED');
    expect(r.syntheticInferences.length).toBeGreaterThan(0);
    expect(r.syntheticInferences[0].premises.length).toBeGreaterThanOrEqual(2);
  });

  it('two DIFFERENT real charts (different major stars) with no 사화 near the relevant palace both resolve UNRESOLVED — star identity alone never drives a verdict', () => {
    expect(judge('LOVE', chartFor('1985', '3', '22', 9, 'male')).status).toBe('UNRESOLVED');
    expect(judge('REUNION', BASE(11)).status).toBe('UNRESOLVED');
  });

  it('no numeric score/weight/percentage/vote vocabulary anywhere in the module', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../ziweiConsultationJudge.ts'), 'utf8');
    const code = source.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code).not.toMatch(/weight|score|percentage|majority/i);
  });

  it('no LLM/network client import anywhere in the module', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../ziweiConsultationJudge.ts'), 'utf8');
    expect(source).not.toMatch(/openai|anthropic|claude|fetch\(|XMLHttpRequest|axios/i);
  });

  it('INDEPENDENT from Myungri: never imports Structural V2/Yongshin/natal-baseline facts', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../ziweiConsultationJudge.ts'), 'utf8');
    const code = source.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code).not.toMatch(/myungriStructuralV2|myungriYongshin|myungriNatal|MyungriStructuralV2Result|MyungriYongshinResult/);
  });
});

// ══ DETERMINISM ════════════════════════════════════════════════════════════════════════════════
describe('determinism', () => {
  it('the same chart + same domain always produces a deep-equal result', () => {
    const chart = BASE(1);
    expect(judge('BUSINESS', chart)).toEqual(judge('BUSINESS', chart));
  });
  it('judgeAllZiweiConsultationDomains returns synchronously, never a Promise', () => {
    expect(judgeAllZiweiConsultationDomains({ chart: BASE(1), activeDecadal: null })).not.toBeInstanceOf(Promise);
  });
});

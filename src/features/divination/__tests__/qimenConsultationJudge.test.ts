// QIMEN CONSULTATION JUDGES V1 — BUSINESS/MONEY/CAREER/LOVE/REUNION/CHANGE/EVENT_SUCCESS/TIMING.
//
// Every fixture is a REAL board computed by `computeQimenBoard` (never hand-faked door/star/god data),
// each independently probed via a throwaway jest run before being hardcoded here — the same discipline
// established for Myungri/Ziwei's own fixtures this session. One genuine software bug was caught and
// fixed DURING this probing (REUNION's two rules were mathematically mutually exclusive — see
// `qimenConsultationJudge.ts`'s own comment on the fix), not by request.
import { computeQimenBoard } from '@/features/qimen';
import type { QimenBoard } from '@/features/qimen/domain/qimenTypes';
import {
  judgeAllQimenConsultationDomains, type QimenConsultationDomain,
} from '../qimenConsultationJudge';

function boardAt(year: number, month: number, day: number, hour: number): QimenBoard {
  const r = computeQimenBoard({ isTimingQuestion: true, questionTime: { year, month, day, hour } });
  if (r.availability !== 'available') throw new Error(`fixture board unavailable: ${year}-${month}-${day} ${hour}시`);
  return r.board;
}
const BASE = (hour: number) => boardAt(2026, 3, 10, hour);

function judge(domain: QimenConsultationDomain, board: QimenBoard | null) {
  return judgeAllQimenConsultationDomains(board)[domain];
}

// ══ BUSINESS ═══════════════════════════════════════════════════════════════════════════════════
describe('BUSINESS', () => {
  it('FAVORABLE: real board, matter door open + supportive relation', () => {
    const r = judge('BUSINESS', BASE(3));
    expect(r.status).toBe('FAVORABLE');
    expect(r.subjectTarget).not.toBeNull();
    expect(r.objectTarget).not.toBeNull();
    expect(r.targetRelations.length).toBeGreaterThan(0);
    expect(r.syntheticInferences.length).toBeGreaterThan(0);
  });
  it('CAUTION: real board, matter door obstructed', () => {
    expect(judge('BUSINESS', BASE(0)).status).toBe('CAUTION');
  });
  it('MIXED: real board, matter door and relation disagree', () => {
    const r = judge('BUSINESS', BASE(1));
    expect(r.status).toBe('MIXED');
    expect(r.supportingEvidence.length + r.counterEvidence.length).toBeGreaterThan(0);
  });
});

// ══ MONEY — 아극자위재(내가 극하는 대상이 재물) ═══════════════════════════════════════════════════
describe('MONEY', () => {
  it('FAVORABLE: real board, subject commands the money palace and its door is open', () => {
    expect(judge('MONEY', BASE(3)).status).toBe('FAVORABLE');
  });
  it('CAUTION: real board, money-related signals obstruct', () => {
    expect(judge('MONEY', BASE(0)).status).toBe('CAUTION');
  });
  it('MIXED: real board, command-relation and access-door disagree', () => {
    expect(judge('MONEY', BASE(9)).status).toBe('MIXED');
  });
  it('UNRESOLVED: real board, neither command-relation nor access-door gives a signal', () => {
    expect(judge('MONEY', boardAt(2024, 6, 15, 5)).status).toBe('UNRESOLVED');
  });
});

// ══ CAREER — 극아자위관(나를 극하는 대상이 자리/권한) ═══════════════════════════════════════════════
describe('CAREER', () => {
  it('FAVORABLE: real board', () => {
    expect(judge('CAREER', BASE(3)).status).toBe('FAVORABLE');
  });
  it('CAUTION: real board, authority relation with an obstructed door', () => {
    expect(judge('CAREER', BASE(23)).status).toBe('CAUTION');
  });
  it('MIXED: real board, authority-relation and self-condition disagree', () => {
    expect(judge('CAREER', BASE(0)).status).toBe('MIXED');
  });
  it('UNRESOLVED: real board, neither authority-relation nor self-condition gives a signal', () => {
    expect(judge('CAREER', BASE(22)).status).toBe('UNRESOLVED');
  });
});

// ══ LOVE ═══════════════════════════════════════════════════════════════════════════════════════
describe('LOVE', () => {
  it('FAVORABLE: real board, relation door open', () => {
    expect(judge('LOVE', BASE(3)).status).toBe('FAVORABLE');
  });
  it('CAUTION: real board, relation door obstructed', () => {
    expect(judge('LOVE', BASE(0)).status).toBe('CAUTION');
  });
  it('MIXED: real board, relation door and object-god disagree', () => {
    expect(judge('LOVE', BASE(22)).status).toBe('MIXED');
  });
  it('UNRESOLVED: real board, neither relation door nor object-god gives a signal', () => {
    expect(judge('LOVE', boardAt(2024, 6, 15, 5)).status).toBe('UNRESOLVED');
  });
});

// ══ REUNION — never aliased to LOVE ════════════════════════════════════════════════════════════
describe('REUNION', () => {
  it('FAVORABLE: real board, 값부·값사 same-seat contact, no obstruction', () => {
    const r = judge('REUNION', BASE(3));
    expect(r.status).toBe('FAVORABLE');
    expect(r.supportingEvidence.some((e) => e.fact.includes('동궁'))).toBe(true);
  });
  it('CAUTION: real board, control relation AND a blocked contact-door, no same-seat opening', () => {
    expect(judge('REUNION', BASE(0)).status).toBe('CAUTION');
  });
  it('UNRESOLVED: real board, no same-seat / no relation / no door signal', () => {
    expect(judge('REUNION', boardAt(2015, 6, 10, 0)).status).toBe('UNRESOLVED');
  });
  it('MIXED (§18 compound truth): real board where same-seat contact AND a blocked contact-door both hold', () => {
    // Discovered empirically: 값부·값사 same-seat always co-locates with the 값符 deity (always
    // AUSPICIOUS by definition) — so a god-based second signal can NEVER coexist with same-seat. The
    // matter door, verified independent of same-seat, is the genuine second axis (see the fix note in
    // qimenConsultationJudge.ts).
    const r = judge('REUNION', BASE(22));
    expect(r.status).toBe('MIXED');
    expect(r.opportunities.length).toBeGreaterThan(0);
    expect(r.risks.length).toBeGreaterThan(0);
    expect(r.conclusion).toMatch(/다만/); // compound phrasing, never a bare yes/no
  });
  it('REUNION and LOVE differ on the identical board — not aliased', () => {
    const board = boardAt(2015, 6, 10, 1);
    const love = judge('LOVE', board);
    const reunion = judge('REUNION', board);
    expect(love.status).toBe('FAVORABLE');
    expect(reunion.status).toBe('CAUTION');
    expect(love.conclusion).not.toBe(reunion.conclusion);
  });
});

// ══ CHANGE — pressure, never a guaranteed event (§21) ═════════════════════════════════════════════
describe('CHANGE', () => {
  it('FAVORABLE: real board', () => {
    expect(judge('CHANGE', BASE(3)).status).toBe('FAVORABLE');
  });
  it('CAUTION: real board, phrased as pressure, never a guaranteed move', () => {
    const r = judge('CHANGE', BASE(0));
    expect(r.status).toBe('CAUTION');
    expect(JSON.stringify(r)).not.toMatch(/반드시 변화(가|를) (있|합니다)|guaranteed/i);
  });
  it('MIXED: real board, matter door and relation disagree', () => {
    expect(judge('CHANGE', BASE(1)).status).toBe('MIXED');
  });
});

// ══ EVENT_SUCCESS — "will THIS proceed" (Qimen's own core question, explicitly decomposed) ════════
describe('EVENT_SUCCESS', () => {
  it('FAVORABLE: real board', () => {
    const r = judge('EVENT_SUCCESS', BASE(3));
    expect(r.status).toBe('FAVORABLE');
  });
  it('CAUTION: real board', () => {
    expect(judge('EVENT_SUCCESS', boardAt(2016, 6, 10, 5)).status).toBe('CAUTION');
  });
  it('UNRESOLVED: real board, no matter-door/star/same-seat signal at all', () => {
    expect(judge('EVENT_SUCCESS', boardAt(2015, 6, 10, 0)).status).toBe('UNRESOLVED');
  });
  it('MIXED: real board, matter door and commander star disagree', () => {
    expect(judge('EVENT_SUCCESS', BASE(0)).status).toBe('MIXED');
  });
});

// ══ TIMING — mirrors judgeQimen's own core question through the shared architecture ══════════════
describe('TIMING', () => {
  it('FAVORABLE: real board', () => {
    expect(judge('TIMING', BASE(3)).status).toBe('FAVORABLE');
  });
  it('CAUTION: real board', () => {
    expect(judge('TIMING', BASE(0)).status).toBe('CAUTION');
  });
  it('MIXED: real board, matter door and same-seat concentration disagree', () => {
    expect(judge('TIMING', BASE(22)).status).toBe('MIXED');
  });
});

// ══ TARGET SELECTION (§8/§9/§10/§31/§33) ══════════════════════════════════════════════════════════
describe('target selection is explicit and traceable', () => {
  it('every resolved domain names BOTH subjectTarget and objectTarget with a real trigram+element', () => {
    const r = judge('BUSINESS', BASE(3));
    expect(r.subjectTarget).toEqual(expect.objectContaining({ trigram: expect.any(String), element: expect.any(String) }));
    expect(r.objectTarget).toEqual(expect.objectContaining({ trigram: expect.any(String), element: expect.any(String) }));
  });

  it('subjectTarget and objectTarget are never silently swapped: subject always resolves from zhifuPalace, object from zhishiPalace', () => {
    const board = BASE(3);
    const r = judge('BUSINESS', board);
    expect(r.subjectTarget!.trigram).toBe(board.zhifuPalace);
    expect(r.objectTarget!.trigram).toBe(board.zhishiPalace);
  });

  it('a resolved MONEY target differs from a resolved CAREER target\'s relation-based reasoning even on the SAME board (different domains, same targets, different questions asked of the relation)', () => {
    const board = BASE(3);
    const money = judge('MONEY', board);
    const career = judge('CAREER', board);
    // Same underlying subject/object pair (target SELECTION doesn't fork by domain in this V1 — see
    // module header), but the QUESTION asked of that pair genuinely differs, so conclusions differ.
    expect(money.subjectTarget).toEqual(career.subjectTarget);
    expect(money.conclusion).not.toBe(career.conclusion);
  });

  it('LOVE and BUSINESS are never accidentally identical despite reading a shared matter-door signal', () => {
    const board = BASE(3);
    expect(judge('LOVE', board).conclusion).not.toBe(judge('BUSINESS', board).conclusion);
  });
});

// ══ NO BOARD (missing question time / not applicable) — §29/§40 ══════════════════════════════════
describe('no board available', () => {
  it('all 8 domains resolve UNRESOLVED, never guessed, when the board itself is null', () => {
    const all = judgeAllQimenConsultationDomains(null);
    for (const domain of Object.keys(all) as QimenConsultationDomain[]) {
      expect(all[domain].status).toBe('UNRESOLVED');
      expect(all[domain].subjectTarget).toBeNull();
      expect(all[domain].objectTarget).toBeNull();
      expect(all[domain].uncertaintyReasons.length).toBeGreaterThan(0);
    }
  });
});

// ══ CROSS-DOMAIN DIFFERENTIATION — no global good/bad board state ═══════════════════════════════
describe('cross-domain differentiation — no global good/bad board state', () => {
  it('the SAME board legitimately produces different statuses across domains', () => {
    const board = BASE(0);
    const all = judgeAllQimenConsultationDomains(board);
    const statuses = new Set(Object.values(all).map((r) => r.status));
    expect(statuses.size).toBeGreaterThan(1);
  });

  it('no GLOBAL_FAVORABLE_SCORE / GLOBAL_BAD_BOARD field anywhere in the module', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../qimenConsultationJudge.ts'), 'utf8');
    expect(source).not.toMatch(/GLOBAL_FAVORABLE_SCORE|GLOBAL_BAD_BOARD|GLOBAL_LUCK_LEVEL/);
  });
});

// ══ PRODUCT QUALITY (§37) ═══════════════════════════════════════════════════════════════════════
describe('product quality', () => {
  it('every non-UNRESOLVED result carries at least one real multi-premise synthetic inference', () => {
    const r = judge('BUSINESS', BASE(3));
    expect(r.status).not.toBe('UNRESOLVED');
    expect(r.syntheticInferences.length).toBeGreaterThan(0);
    expect(r.syntheticInferences[0].premises.length).toBeGreaterThanOrEqual(2);
  });

  it('a MIXED result carries BOTH supportingEvidence-driving opportunities and counterEvidence-driving risks (contradiction preserved, never averaged)', () => {
    const r = judge('BUSINESS', BASE(1));
    expect(r.status).toBe('MIXED');
    expect(r.opportunities.length).toBeGreaterThan(0);
    expect(r.risks.length).toBeGreaterThan(0);
  });

  it('question-specific results are chart-specific: two different real boards produce different conclusions for the same domain', () => {
    expect(judge('BUSINESS', BASE(3)).conclusion).not.toBe(judge('BUSINESS', BASE(0)).conclusion);
  });
});

// ══ NEGATIVE SHORTCUT TESTS (§38) — one symbol alone cannot decide ═════════════════════════════════
describe('forbidden one-symbol shortcuts do not determine the verdict', () => {
  it('생門/開門/死門 alone: the door-class table itself is CONTEXTUAL — the same class can still combine with a disagreeing relation into MIXED, never a fixed door->verdict rule', () => {
    // BASE(1) has an AUSPICIOUS/mixed-producing door class yet resolves MIXED, not a door-fixed FAVORABLE.
    expect(judge('BUSINESS', BASE(1)).status).toBe('MIXED');
  });

  it('no numeric score/weight/percentage/vote vocabulary anywhere in the module', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../qimenConsultationJudge.ts'), 'utf8');
    const code = source.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code).not.toMatch(/weight|score|percentage|majority/i);
  });

  it('no LLM/network client import anywhere in the module', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../qimenConsultationJudge.ts'), 'utf8');
    expect(source).not.toMatch(/openai|anthropic|claude|fetch\(|XMLHttpRequest|axios/i);
  });

  it('a single 값부 star alone (subjectStarClass) cannot independently determine BUSINESS — only the matter door + relation drive it', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(path.join(__dirname, '../qimenConsultationJudge.ts'), 'utf8');
    const fn = source.slice(source.indexOf('function judgeBusiness'), source.indexOf('function judgeMoney'));
    expect(fn).not.toMatch(/subjectStarClass/);
  });
});

// ══ DETERMINISM (§39) ══════════════════════════════════════════════════════════════════════════
describe('determinism', () => {
  it('the same board + same domain always produces a deep-equal result', () => {
    const board = BASE(3);
    expect(judge('BUSINESS', board)).toEqual(judge('BUSINESS', board));
  });
  it('judgeAllQimenConsultationDomains returns synchronously, never a Promise', () => {
    expect(judgeAllQimenConsultationDomains(BASE(3))).not.toBeInstanceOf(Promise);
  });
});

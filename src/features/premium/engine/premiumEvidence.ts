// Premium evidence — deterministic, no LLM, and NO NEW CALCULATION.
//
// Every fact here comes from a service the 상담/오늘/월별 paths already call:
//   원국 사주      executeSajuFromBirthInput → natalContextFromFourPillars      (frozen engine)
//   십신          calculateTenGodFacts                                          (상담이 쓰는 그 호출)
//   원국 관계      calculateNatalRelations                                       (합충형파해 · 삼합/방합)
//   월령          calculateMonthCommand                                         (득령/실령 · 계절 · 왕상휴수사)
//   통근·투출      calculateRootingTransparency
//   강약 입력      calculateDayMasterStrengthInputs                              (구성비 FACTS only)
//   대운·세운      buildMyungriTemporalContext + calculateSajuDaewoon
//   12개월        calculateWolwoonForInstant × 12
//
// WHY THIS FILE GREW (2026-09-02). The first version passed **827 input tokens**: one element name, a
// 대운 age span, and twelve ten-god pairs. The engine had already computed the four pillars, every
// positioned 합충형파해, 득령, 통근, the 십신 spread, and each month's actual pillar and its relation to
// the natal chart AND to the year — and none of it reached the prompt. The model then had to fill twelve
// months of prose from almost nothing, which is exactly why the four sample reports read interchangeably
// and no month could be told from another. The fix is not a new engine: it is handing over what the
// engine already knows.
//
// STRENGTH VERDICT IS STILL WITHHELD. `calculateDayMasterStrengthInputs` returns
// `strengthVerdict: 'OWNER_REVIEW_REQUIRED'` on purpose (§10/§32). This file passes the COMPOSITION
// facts (아군/타군 counts, 득령, 통근) and never a 신강/신약 conclusion, and never 용신/희신/기신 — that
// doctrine sits in the divination layer pending owner review and is out of scope for this product.
import type { BirthInfoDraft } from '@/features/consultation';
import {
  ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  executeSajuFromBirthInput,
  FIVE_ELEMENT_LABELS,
  TEN_GOD_LABELS,
  type DigestProvider,
  type HistoricalTimezoneResolver,
} from '@/features/interpretation';
import {
  buildMyungriTemporalContext,
  calculateDayMasterStrengthInputs,
  calculateMyungriTimeAxis,
  calculateMonthCommand,
  calculateNatalRelations,
  calculateRootingTransparency,
  calculateTenGodFacts,
  tenGodSide,
  calculateWolwoonForInstant,
  natalContextFromFourPillars,
  type MyungriTemporalContext,
} from '@/features/myungri';
import { toSajuEngineInput } from '@/features/manse/services/birthInputMapper';
import {
  currentTargetMonth,
  monthMidpointEpochSeconds,
  nextCivilMonth,
  type TargetMonth,
} from '@/features/monthly/engine/monthDate';
import { PREMIUM_EVIDENCE_VERSION, PREMIUM_FORWARD_MONTHS, type PremiumMonthOutlook } from '@/features/premium/types';

// ── Korean labels. Element/ten-god tables are the shared engine ones.
//
// TWO REGISTERS, ON PURPOSE (2026-09-02, V3).
//   `POS`/`STEM_REL`/… are the REAL terms (년주, 충, 육합, 정기). They go into the reader-facing evidence
//   lines, inside "(근거: …)", exactly the way the consultation renders `anchored()` in groundedNarrative.ts:
//   plain conclusion first, technical anchor in parentheses. V2 tried to translate them away and produced
//   "첫째 기둥(둘째 기둥 안(주된 것))" — unreadable AND unsearchable. 년주 at least can be looked up.
//   `PLAIN`/`REL_PLAIN` are the glossed forms, and ONLY the prompt sees those. A term never handed to the
//   model cannot be echoed by it: V2 shipped 0 identifier leaks in 115 body lines with this split, and the
//   body scrubber stays as the second line of defence.
export const EL = (e: string): string => (FIVE_ELEMENT_LABELS as Record<string, { hangul: string }>)[e]?.hangul ?? e;
export const TG = (g: string): string => (TEN_GOD_LABELS as Record<string, { hangul: string }>)[g]?.hangul ?? g;

const STEM_REL: Record<string, string> = { STEM_COMBINATION: '천간합', STEM_CLASH: '천간충' };
const BRANCH_REL: Record<string, string> = {
  BRANCH_SIX_COMBINATION: '육합', BRANCH_CLASH: '충', BRANCH_HALF_THREE_HARMONY: '반합',
  BRANCH_PUNISHMENT: '형', BRANCH_SELF_PUNISHMENT: '자형', BRANCH_DESTRUCTION: '파', BRANCH_HARM: '해',
};
const SET_REL: Record<string, string> = {
  BRANCH_THREE_HARMONY: '삼합', BRANCH_DIRECTIONAL_UNION: '방합', BRANCH_THREE_PUNISHMENT: '삼형',
};
const POS: Record<string, string> = { YEAR: '년주', MONTH: '월주', DAY: '일주', HOUR: '시주' };
const HIDDEN_ROLE: Record<string, string> = { MAIN: '정기', MIDDLE: '중기', RESIDUAL: '여기' };

/**
 * 프롬프트 전용 글로스. 값은 글자 그대로의 뜻이며 새 해석을 얹지 않는다.
 * 십신 이름은 일부러 빠져 있다 — 모델이 실제로 의미를 붙잡는 유일한 항목이라 원어로 넘기고, 출력에서만 막는다.
 */
const GLOSS: Record<string, string> = {
  년주: '첫째 자리', 월주: '둘째 자리', 일주: '셋째 자리', 시주: '넷째 자리', 원국: '타고난 자리',
  천간합: '위에서 묶임', 천간충: '위에서 부딪힘',
  삼합: '셋이 한 덩어리로 묶임', 방합: '한 방향으로 묶임', 삼형: '셋이 서로 어긋남',
  반합: '반쯤 묶임', 육합: '묶임', 자형: '스스로 어긋남',
  충: '부딪힘', 형: '어긋남', 파: '깨짐', 해: '해침',
  정기: '주된 것', 중기: '중간 것', 여기: '남은 것',
};
// 긴 항목 먼저. 한글에는 \b 가 없으므로 앞뒤가 한글이 아닐 때만 바꾼다 — "자형"의 "형", "해침"의 "해"가
// 따로 잡히는 것을 막는다. 여기서 다루는 문자열은 전부 이 파일이 만든 라벨이라 토큰 경계가 보장된다.
const GLOSS_RE = new RegExp(
  `(?<![가-힣])(?:${Object.keys(GLOSS).sort((a, b) => b.length - a.length).join('|')})(?![가-힣])`,
  'g',
);
/** "년주–월주 충" → "첫째 자리–둘째 자리 부딪힘". 사전에 없는 조각은 그대로 둔다. */
export const plainify = (s: string): string => s.replace(GLOSS_RE, (m) => GLOSS[m] ?? m);

/** 합 계열인가. 충·형·파·해와 갈라 놓는 유일한 기준이며, 고전 분류 그대로다. */
const HARMONIOUS = new Set(['천간합', '육합', '반합', '삼합', '방합']);
const SEASON: Record<string, string> = { SPRING: '봄', SUMMER: '여름', AUTUMN: '가을', WINTER: '겨울' };
const PHASE: Record<string, string> = { WANG: '왕', XIANG: '상', XIU: '휴', QIU: '수', SI: '사' };
const ROLE: Record<string, string> = { PARALLEL: '같은 편', RESOURCE: '돕는 힘', OUTPUT: '내보내는 힘', WEALTH: '다루는 대상', OFFICER: '누르는 힘' };

/** Positioned relations → "년주 충 · 월주 육합". Position is what makes a month distinguishable. */
export function describeRelations(rel: { stem?: readonly unknown[]; branch?: readonly unknown[] } | null | undefined): string[] {
  const out: string[] = [];
  for (const r of (rel?.stem ?? []) as { position: string; relation: { kind: string } }[]) {
    out.push(`${POS[r.position] ?? r.position} ${STEM_REL[r.relation.kind] ?? r.relation.kind}`);
  }
  for (const r of (rel?.branch ?? []) as { position: string; relation: { kind: string } }[]) {
    out.push(`${POS[r.position] ?? r.position} ${BRANCH_REL[r.relation.kind] ?? r.relation.kind}`);
  }
  return out;
}

/** 합이면 harmony, 아니면 friction. 라벨의 마지막 낱말이 관계 이름이다. */
function split(lines: string[]): { harmony: string[]; friction: string[] } {
  const harmony: string[] = []; const friction: string[] = [];
  for (const l of lines) (HARMONIOUS.has(l.split(' ').pop() ?? '') ? harmony : friction).push(l);
  return { harmony, friction };
}

export type PremiumEvidenceDeps = {
  digestProvider: DigestProvider;
  historicalTimezoneResolver?: HistoricalTimezoneResolver;
  /** SERVER receipt epoch (seconds). The report window starts at the month containing this instant. */
  nowEpochSeconds: number;
};

/** Everything the prompt is allowed to see. Plain strings — the renderer never sees this. */
export type PremiumNatalFacts = {
  /** 년주/월주/일주/시주 → 십신 라벨 (일간은 자신이므로 제외). 시주 미상이면 없음. */
  pillars: { position: string; tenGod: string | null }[];
  dayMasterElement: string;
  /** 오행 개수 전체 — 하나만 고르지 않는다. */
  elementCounts: { element: string; count: number }[];
  /** 월령: 득령/실령 · 계절 · 왕상휴수사. */
  monthCommand: { season: string; phase: string; status: string } | null;
  /** 원국 안의 합충형파해 + 삼합/방합. 위치까지. */
  natalRelations: string[];
  /** 천간 십신 구성비 (아군/타군). 강약 결론은 내지 않는다. */
  roleCounts: { role: string; count: number }[];
  /** 지장간 쪽 구성비. 겉으로 드러난 것과 속에 깔린 것이 다른 사람이 실제로 많다. */
  hiddenRoleCounts: { role: string; count: number }[];
  /** 통근: 어느 기둥의 천간이 어느 기둥의 지지에 뿌리를 두는가. 위치까지 — "쓸 수 있는 힘"의 소재. */
  rootedStems: { position: string; roots: string[] }[];
  /** 투간: 지지 속에 있던 것이 겉으로 올라온 자리. 통근의 반대 방향. */
  revealedStems: string[];
  /** 자리별 지장간 십신 — 겉으로 보이지 않는 층. 네 기둥이 각각 무엇을 품고 있는지. */
  hiddenByPillar: { position: string; tenGods: string[] }[];
  /** 지장간에만 있고 천간에 드러나지 않은 십신 — "속에 있으나 겉으로 안 나온 것". */
  hiddenOnlyTenGods: string[];
};

export type PremiumEvidence =
  | {
      available: true;
      natal: PremiumNatalFacts;
      temporal: MyungriTemporalContext;
      /** 현재 대운: 십신 · 원국과의 관계 · 나이 구간. */
      daewoon: { ordinal: number; startAge: number; endAge: number; tenGods: string[]; relations: string[] } | null;
      /** 올해 세운: 십신 · 원국과의 관계. */
      sewoon: { year: number; tenGods: string[]; relations: string[] } | null;
      months: PremiumMonthOutlook[];
      /** 조화 신호가 가장 두터운 달 / 마찰 신호가 가장 두터운 달. 집계일 뿐 새 교리가 아니다. */
      brightMonths: { year: number; month: number; why: string }[];
      heavyMonths: { year: number; month: number; why: string }[];
      ageAtReport: number;
      evidenceVersion: string;
    }
  | { available: false; reason: string; evidenceVersion: string };

const unavailable = (reason: string): PremiumEvidence => ({ available: false, reason, evidenceVersion: PREMIUM_EVIDENCE_VERSION });

export async function buildPremiumEvidence(
  input: { birthInfo: BirthInfoDraft },
  deps: PremiumEvidenceDeps,
): Promise<PremiumEvidence> {
  let execution;
  try {
    execution = await executeSajuFromBirthInput(toSajuEngineInput(input.birthInfo), {
      digestProvider: deps.digestProvider,
      historicalTimezoneResolver: deps.historicalTimezoneResolver ?? ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
    });
  } catch {
    return unavailable('CHART_EXECUTION_THREW');
  }
  if (!execution.success) return unavailable('CHART_INPUT_INVALID');
  const engineResult = execution.engineResult;
  // A 절기 boundary birth with no exact time lands here as UNAVAILABLE — the same fail-closed the
  // consultation takes. Premium must not invent a chart the other products refuse to build.
  if (engineResult.status === 'UNAVAILABLE') return unavailable('CHART_UNAVAILABLE');

  const natal = natalContextFromFourPillars(engineResult.output.fourPillars);

  let temporal: MyungriTemporalContext;
  try {
    temporal = await buildMyungriTemporalContext({
      engineResult,
      natal,
      normalizedBirth: execution.normalizedBirth,
      instantEpochSeconds: deps.nowEpochSeconds,
      timezoneResolver: deps.historicalTimezoneResolver ?? ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
    });
  } catch {
    return unavailable('TEMPORAL_CONTEXT_THREW');
  }

  // ── 원국 facts (all from frozen services; every one of these was previously computed and discarded)
  const tenGodFacts = calculateTenGodFacts(natal);
  const relations = calculateNatalRelations(natal);
  const command = calculateMonthCommand(natal);
  const rooting = calculateRootingTransparency(natal);
  const strength = calculateDayMasterStrengthInputs(natal);

  const pillars: PremiumNatalFacts['pillars'] = [];
  if (tenGodFacts.capability === 'AVAILABLE') {
    for (const v of tenGodFacts.visibleStems) pillars.push({ position: POS[v.position] ?? v.position, tenGod: TG(v.tenGod) });
  }
  const natalRelationLines: string[] = [];
  for (const r of relations?.stem ?? []) {
    natalRelationLines.push(`${POS[r.positions[0]]}–${POS[r.positions[1]]} ${STEM_REL[r.relation.kind] ?? r.relation.kind}`);
  }
  for (const r of relations?.branch ?? []) {
    natalRelationLines.push(`${POS[r.positions[0]]}–${POS[r.positions[1]]} ${BRANCH_REL[r.relation.kind] ?? r.relation.kind}`);
  }
  for (const s of relations?.sets ?? []) natalRelationLines.push(SET_REL[s.kind] ?? s.kind);

  const countsOf = (rec: Record<string, number> | undefined): { role: string; count: number }[] =>
    Object.entries(rec ?? {}).filter(([, n]) => n > 0).map(([role, count]) => ({ role: ROLE[role] ?? role, count }));
  const roleCounts = strength.capability === 'AVAILABLE' ? countsOf(strength.visibleRoleCounts) : [];
  const hiddenRoleCounts = strength.capability === 'AVAILABLE' ? countsOf(strength.hiddenRoleCounts) : [];

  // 통근/투간 — both directions. Previously only "which stems are rooted" survived; WHERE the root sits is
  // what tells a chart with borrowed support from one standing on its own ground.
  const rootedStems = rooting.capability === 'AVAILABLE'
    ? rooting.rooting.filter((r) => r.isRooted).map((r) => ({
      position: POS[String(r.stemPosition)] ?? String(r.stemPosition),
      roots: r.roots.map((m) => `${POS[String(m.branchPosition)] ?? String(m.branchPosition)} 안(${HIDDEN_ROLE[String(m.hiddenStemRole)] ?? String(m.hiddenStemRole)})`),
    }))
    : [];
  const revealedStems = rooting.capability === 'AVAILABLE'
    ? rooting.transparency.filter((t) => t.isRevealed).map((t) =>
      `${POS[String(t.branchPosition)] ?? String(t.branchPosition)} 속의 ${HIDDEN_ROLE[String(t.hiddenStemRole)] ?? String(t.hiddenStemRole)} → 겉으로 나온 자리 ${t.revealedAt.map((p) => POS[String(p)] ?? String(p)).join('·')}`)
    : [];

  const visibleSet = new Set(
    tenGodFacts.capability === 'AVAILABLE' ? tenGodFacts.visibleStems.map((v) => String(v.tenGod)) : [],
  );
  // 자리별 지장간 — the layer under the visible stems. Four pillars each carrying up to three, in
  // 주된/중간/남은 order: the single richest per-person differentiator the engine had already computed.
  const hiddenByPillar: PremiumNatalFacts['hiddenByPillar'] = [];
  if (tenGodFacts.capability === 'AVAILABLE') {
    for (const key of ['YEAR', 'MONTH', 'DAY', 'HOUR']) {
      const here = tenGodFacts.hiddenStems.filter((h) => String(h.position) === key);
      if (here.length === 0) continue;
      hiddenByPillar.push({
        position: POS[key],
        tenGods: here.map((h) => `${TG(String(h.tenGod))}(${HIDDEN_ROLE[String(h.hiddenRole)] ?? String(h.hiddenRole)})`),
      });
    }
  }
  const hiddenOnlyTenGods = tenGodFacts.capability === 'AVAILABLE'
    ? [...new Set(tenGodFacts.hiddenStems.map((h) => String(h.tenGod)).filter((g) => !visibleSet.has(g)))].map(TG)
    : [];

  const natalFacts: PremiumNatalFacts = {
    pillars,
    dayMasterElement: command.capability === 'AVAILABLE' ? EL(command.dayMasterElement) : '',
    elementCounts: Object.entries(temporal.elementCounts ?? {}).map(([element, count]) => ({ element: EL(element), count: Number(count) })),
    monthCommand: command.capability === 'AVAILABLE'
      ? {
        season: SEASON[command.season] ?? String(command.season),
        phase: PHASE[command.dayMasterSeasonalPhase] ?? String(command.dayMasterSeasonalPhase),
        status: command.commandStatus === 'IN_COMMAND' ? '계절이 받쳐 줍니다' : '계절이 받쳐 주지 않습니다',
      }
      : null,
    natalRelations: natalRelationLines,
    roleCounts,
    hiddenRoleCounts,
    rootedStems,
    revealedStems,
    hiddenByPillar,
    hiddenOnlyTenGods,
  };

  // ── 대운 / 세운
  const dw = temporal.activeDaewoon;
  const daewoon = dw
    ? {
      ordinal: dw.ordinal,
      startAge: dw.startAgeInclusive,
      endAge: dw.endAgeInclusive,
      tenGods: [dw.tenGods.stemTenGod, dw.tenGods.branchMainTenGod].filter(Boolean).map((g) => TG(String(g))),
      relations: describeRelations(dw.relationsToNatal),
    }
    : null;
  const sw = temporal.sewoon;
  const sewoon = sw
    ? {
      year: sw.targetYear,
      tenGods: [sw.tenGods.stemTenGod, sw.tenGods.branchMainTenGod].filter(Boolean).map((g) => TG(String(g))),
      relations: describeRelations(sw.relationsToNatal),
    }
    : null;

  // ── 향후 12개월. 각 달의 원국 관계 + 세운 관계까지 — 이것이 달을 구별하는 재료다.
  const months: PremiumMonthOutlook[] = [];
  let m: TargetMonth = currentTargetMonth(deps.nowEpochSeconds);
  for (let i = 0; i < PREMIUM_FORWARD_MONTHS; i++) {
    const w = calculateWolwoonForInstant({ natal, instantEpochSeconds: monthMidpointEpochSeconds(m) });
    if (w.capability !== 'AVAILABLE') break;
    const raw = describeRelations(w.relationsToNatal);
    if (w.relationToSewoon?.stem) raw.push(`올해와 ${STEM_REL[w.relationToSewoon.stem.kind] ?? String(w.relationToSewoon.stem.kind)}`);
    for (const b of w.relationToSewoon?.branch ?? []) raw.push(`올해와 ${BRANCH_REL[b.kind] ?? String(b.kind)}`);
    // 삼합/방합/삼형 completed ACROSS layers in this month. `calculateWolwoonForInstant` only reports
    // pairwise relations, so a month that closes a three-branch set looked identical to a quiet one.
    // The time-axis service already computes it; a set counts only when the month's own branch is in it.
    const axis = calculateMyungriTimeAxis({ natal, targetYear: w.targetYear, lunarMonth: w.lunarMonth });
    if (axis.capability === 'AVAILABLE') {
      for (const s of axis.branchSetRelations) {
        if (s.branches.includes(w.pillar.branch)) raw.push(SET_REL[s.kind] ?? String(s.kind));
      }
    }
    const { harmony, friction } = split(raw);
    months.push({
      year: m.year,
      month: m.month,
      stemTenGod: TG(String(w.tenGods.stemTenGod)),
      branchTenGod: TG(String(w.tenGods.branchMainTenGod)),
      harmony,
      friction,
      side: tenGodSide(w.tenGods.stemTenGod),
    });
    m = nextCivilMonth(m);
  }
  if (months.length < PREMIUM_FORWARD_MONTHS / 2) return unavailable(`WOLWOON_WINDOW_TOO_SHORT_${months.length}`);

  // 특이한 달 = 관계가 가장 많이 걸리는 달. 집계일 뿐 새 판단이 아니다.
  // 두 방향으로 뽑는다. V2 는 "가장 많이 걸리는 달" 하나만 강조했고, 그것이 월별 서술을 통째로 경고 쪽으로
  // 끌어당겼다 — 실제 근거는 절반이 합인데도. 조화가 두터운 달을 같은 무게로 지목해야 균형이 잡힌다.
  const pick = (key: 'harmony' | 'friction') => {
    const scored = months.map((x) => ({ x, n: x[key].length }));
    const maxN = Math.max(0, ...scored.map((s) => s.n));
    return maxN === 0 ? [] : scored.filter((s) => s.n === maxN).slice(0, 3)
      .map((s) => ({ year: s.x.year, month: s.x.month, why: s.x[key].join(' · ') }));
  };
  const brightMonths = pick('harmony');
  const heavyMonths = pick('friction');

  const birthYear = Number(input.birthInfo.birthYear);
  const nowYear = new Date((deps.nowEpochSeconds + 9 * 3600) * 1000).getUTCFullYear();
  const ageAtReport = Number.isFinite(birthYear) ? nowYear - birthYear : 0;

  return {
    available: true,
    natal: natalFacts,
    temporal,
    daewoon,
    sewoon,
    months,
    brightMonths,
    heavyMonths,
    ageAtReport,
    evidenceVersion: PREMIUM_EVIDENCE_VERSION,
  };
}

/** 받침 있으면 '은', 없으면 '는'. 오행 이름이 한 글자라 조사 하나로 문장이 어색해진다. */
const eun = (w: string): string => (((w.charCodeAt(w.length - 1) - 0xac00) % 28) > 0 ? '은' : '는');

/** 근거줄 상한. 이보다 길어지면 사람이 안 읽는다 — 상담의 `CAP = 3` 과 같은 성격의 상한이다. */
export const PREMIUM_EVIDENCE_MAX_LINES = 8;

/** `결론 (근거: 전문용어)`. 상담 `groundedNarrative.anchored()` 와 같은 모양. 괄호는 딱 한 겹. */
const anchored = (conclusion: string, anchor: string): string => `${conclusion} (근거: ${anchor})`;

/**
 * "왜 이렇게 보나요" — SERVER-owned receipts. The model never authors these.
 *
 * REWRITTEN 2026-09-02 (V3) after the owner read V2. V2 emitted 14 lines that dumped every computed value
 * in translated-away vocabulary, producing things like
 *   "첫째 기둥(둘째 기둥 안(주된 것)) · 셋째 기둥(첫째 기둥 안(주된 것)) — 뿌리가 확인된 자리로…"
 * — three levels of parentheses, no conclusion, and terms a reader cannot even look up. It was worse than
 * the four generic lines it replaced. The fix is the shape the consultation already ships: state the
 * conclusion in plain Korean, then put the technical anchor in ONE trailing parenthesis.
 *
 * Three rules hold here and are enforced by tests:
 *   1. every line is `결론 (근거: …)` — conclusion first, one paren group, never nested;
 *   2. at most `PREMIUM_EVIDENCE_MAX_LINES` lines, and only facts the report actually rests on;
 *   3. at most 5 enumerated values in one line — beyond that a reader sees a log, not a reason.
 * Warnings are appended after the cap: an honesty disclosure must never be truncated away.
 */
export function premiumEvidenceLines(ev: Extract<PremiumEvidence, { available: true }>): string[] {
  const n = ev.natal;
  const lines: string[] = [];

  // 1) 오행 편중 — 어느 쪽으로 몰렸고 무엇이 비었는가. 5칸이라 나열 상한에 정확히 맞는다.
  if (n.elementCounts.length > 0) {
    const sorted = [...n.elementCounts].sort((a, b) => b.count - a.count);
    const missing = sorted.filter((e) => e.count === 0).map((e) => e.element);
    const top = sorted[0];
    const conclusion = missing.length > 0
      ? `타고난 기운이 ${top.element} 쪽으로 몰려 있고 ${missing.join('·')}${eun(missing[missing.length - 1])} 비어 있어, 그쪽은 환경에서 채워야 합니다.`
      : `타고난 기운이 ${top.element} 쪽으로 기울어 있습니다.`;
    lines.push(anchored(conclusion, `오행 ${sorted.map((e) => `${e.element}${e.count}`).join('·')}`));
  }

  // 2) 계절이 중심 기운을 받쳐 주는가 — 득령/실령. 한 사람의 힘을 좌우하는 가장 큰 단일 조건이다.
  if (n.monthCommand) {
    lines.push(anchored(
      `태어난 계절이 이 사람의 중심 기운을 ${n.monthCommand.status.replace('계절이 ', '')}`,
      `${n.monthCommand.season}생 · ${n.dayMasterElement || '일간'} 일간 · ${n.monthCommand.status.includes('않') ? '실령' : '득령'} · ${n.monthCommand.phase}`,
    ));
  }

  // 3) 겉과 속의 격차. V2 는 두 분포를 통째로 나열했다 — 열 개 수치를 읽고도 남는 게 없다.
  //    비교 결과 한 문장이 결론이고, 개수는 괄호로 충분하다.
  const vis = n.roleCounts.reduce((a, r) => a + r.count, 0);
  const hid = n.hiddenRoleCounts.reduce((a, r) => a + r.count, 0);
  if (vis + hid > 0) {
    const conclusion = hid > vis
      ? '겉으로 드러난 것보다 속에 쌓아 둔 힘이 더 두텁습니다. 남들이 보는 모습이 전부가 아닙니다.'
      : '겉으로 드러난 힘이 속에 깔린 것과 비슷하거나 더 큽니다. 보이는 대로 쓰는 편입니다.';
    lines.push(anchored(conclusion, `천간 십신 ${vis} · 지장간 십신 ${hid}`));
  }

  // 4) 통근 — "실제로 쓸 수 있는 힘". 뿌리의 소재까지 적으면 괄호가 겹치므로 자리만 적는다.
  if (n.rootedStems.length > 0) {
    lines.push(anchored(
      '겉으로 드러난 힘이 아래에 뿌리를 두고 있어, 말뿐이 아니라 실제로 쓸 수 있습니다.',
      `통근 — ${n.rootedStems.slice(0, 5).map((r) => r.position).join('·')}`,
    ));
  } else {
    lines.push(anchored('겉으로 드러난 힘을 받쳐 줄 뿌리가 확인되지 않아, 기세는 있어도 오래 끌기는 어렵습니다.', '통근 없음'));
  }

  // 5) 원국 관계 — 이 사람이 평생 안고 가는 구조. 5개까지만.
  if (n.natalRelations.length > 0) {
    const har = n.natalRelations.filter((r) => HARMONIOUS.has(r.split(' ').pop() ?? ''));
    const fri = n.natalRelations.filter((r) => !HARMONIOUS.has(r.split(' ').pop() ?? ''));
    const conclusion = fri.length === 0
      ? '네 기둥이 서로 맞물려 있어, 한쪽이 움직이면 다른 쪽도 같이 따라옵니다.'
      : har.length === 0
        ? '네 기둥 사이에 정면으로 부딪히는 자리가 있어, 같은 문제가 반복해서 올라옵니다.'
        : '네 기둥에 맞물리는 자리와 부딪히는 자리가 함께 있어, 도움과 마찰이 같은 곳에서 나옵니다.';
    lines.push(anchored(conclusion, `원국 ${n.natalRelations.slice(0, 5).join(' · ')}`));
  }

  // 6) 대운 — 지금 어느 구간인가.
  if (ev.daewoon) {
    const touch = ev.daewoon.relations.length > 0
      ? '지금 흐름이 타고난 자리를 직접 건드리고 있습니다.'
      : '지금 흐름은 타고난 자리와 직접 부딪히지 않고 배경으로 깔립니다.';
    lines.push(anchored(
      `${ev.daewoon.startAge}~${ev.daewoon.endAge}세 구간을 지나는 중이고, ${touch}`,
      `${ev.daewoon.ordinal}번째 대운 ${ev.daewoon.tenGods.join('·')}${ev.daewoon.relations.length > 0 ? ` — ${ev.daewoon.relations.slice(0, 3).join(' · ')}` : ''}`,
    ));
  }

  // 7) 열두 달의 무게 배분 — 좋은 달과 무거운 달을 같은 문장에서 지목한다.
  // 열두 달 창은 두 해에 걸친다(예: 2026-09 ~ 2027-08). "1월"만 쓰면 어느 해인지 알 수 없다.
  // 창의 첫 해는 연도를 생략해도 통하지만, 해가 넘어가면 반드시 붙인다.
  const startYear = ev.months[0]?.year;
  const label = (x: { year: number; month: number }) => (x.year === startYear ? `${x.month}월` : `${x.year}년 ${x.month}월`);
  const bright = ev.brightMonths.map(label);
  const heavy = ev.heavyMonths.map(label);
  if (bright.length > 0 || heavy.length > 0) {
    const parts: string[] = [];
    if (bright.length > 0) parts.push(`${bright.join('·')}은 맞물려 풀리는 쪽이 두텁고`);
    if (heavy.length > 0) parts.push(`${heavy.join('·')}은 조정이 몰립니다`);
    lines.push(anchored(
      `앞으로 열두 달 중 ${parts.join(', ')}.`,
      `월운 — 합 ${ev.months.reduce((a, m) => a + m.harmony.length, 0)}건 · 충형파해 ${ev.months.reduce((a, m) => a + m.friction.length, 0)}건`,
    ));
  }

  const capped = lines.slice(0, PREMIUM_EVIDENCE_MAX_LINES);
  for (const w of ev.temporal.warnings) if (w) capped.push(anchored('일부 항목은 계산되지 않아 이 글에서 제외했습니다.', w));
  return capped;
}

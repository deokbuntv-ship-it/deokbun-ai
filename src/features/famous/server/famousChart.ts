// 유명인 명식 스냅샷 — 엔진 호출부와 표시 가능한 형태로의 매핑.
//
// ENGINE FIREWALL 는 그대로다: **이 모듈은 아무것도 계산하지 않는다.** 프로즌 엔진
// (`executeSajuFromBirthInput`)을 부르고, 그 결과를 라벨과 함께 **불변 스냅샷**으로 옮겨 담을 뿐이다.
// 한글 라벨도 새로 만들지 않는다 — `saju/presentationLabels.ts` 의 것을 그대로 쓴다. 십성 이름 하나를
// 여기서 지어내면 그것이 곧 교리 변경이다.
//
// 무엇을 담고 무엇을 안 담는가 (오너 결정 F3 = C 수준):
//   담는다 — 원국 4주(천간·지지) · 십성(천간·지지 지장간) · 지장간 · 오행 개수
//   안 담는다 — **대운·세운.** 담으면 언젠가 노출되고, 노출되는 순간 명식 해설이 아니라
//               특정 인물의 시기 예측이 된다. 그것이 (b) 프레이밍을 고른 이유다.
//   못 담는다 — 12운성·12신살. **엔진에 없다**(2026-09-08 확인). 만들면 교리 창작이다.
import {
  ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
  EARTHLY_BRANCH_LABELS,
  FIVE_ELEMENT_LABELS,
  HEAVENLY_STEM_LABELS,
  HIDDEN_STEM_ROLE_LABELS,
  TEN_GOD_LABELS,
  YIN_YANG_LABELS,
  executeSajuFromBirthInput,
  type DigestProvider,
  type HistoricalTimezoneResolver,
} from '@/features/interpretation';
import { toSajuEngineInput } from '@/features/manse/services/birthInputMapper';
import {
  calculateMonthCommand,
  calculateNatalRelations,
  calculateRootingTransparency,
  natalContextFromFourPillars,
} from '@/features/myungri';
import type { BirthInfoDraft } from '@/features/consultation';

export const FAMOUS_CHART_VERSION = 3 as const;

// v3 (2026-09-04) — 글자 사이의 **관계**를 담는다. 이것도 새 계산이 아니다.
//
// ⚠ 앞선 지시서들이 "엔진이 판정하지 않는 관계(삼합·상충·형살)" 라고 적었는데 **사실이 아니었다.**
// `src/features/myungri/services/natalRelations.ts` 의 `calculateNatalRelations` 가 합·충·형·파·해·
// 삼합·방합을 실제로 판정한다(`deokbunai.myungri-pillar-relations.v1`). 그 잘못된 전제 위에
// `INVENTED_RELATION` 정규식이 세워져 **실재하는 엔진 판정을 막고 있었다.** 오너 확인 후 연다.
//
// 관계를 빼면 각 자리를 따로따로만 말하는 반쪽 설명이 된다 — 명식 해설에서 글자 사이의 관계는
// 핵심 소재다.
//
// ⚠ 여전히 담지 않는 것: 대운·세운(F3) · 신강신약(판정) · 귀인/신살/12운성/공망 —
// **엔진이 판정하지 않는다.** 특히 `원진` 은 엔진에 없으므로 계속 금지 대상이다.

// v2 (2026-09-04) — 근거를 늘렸다. **새 계산은 하나도 만들지 않았다.**
// 오너 진단: 본문이 "정보·유통의 기운" 같은 출처 불명 표현을 쓰고 표를 되뇌기만 한다. Premium 이
// 같은 문제를 겪었고 원인은 근거 전달량이었다(827 → 2,828 토큰에서 글이 달라졌다). 유명인 본문의
// input 은 1,253 이었다.
//
// 늘린 것은 전부 **이미 엔진이 계산하고 있는데 이 경로만 안 받아 가던 것**이다:
//   통근·투간   `calculateRootingTransparency`  (myungri, frozen)
//   월령·득령   `calculateMonthCommand`         (myungri, frozen)
//   오행 자리   `fiveElementDistribution.slots` (이미 결과에 있었다)
//   십성 분포   위 십성들의 **집계**            (계산이 아니라 세기)
//
// ⚠ 넣지 않은 것과 이유:
//   대운·세운   — F3 결정. 시간 축이 들어가면 명식 해설이 아니라 인물 예측이다.
//   신강·신약   — `natalStrength` 는 배럴에서 일부러 막혀 있다(P0-07 감사). 그리고 판정이다.
//   합·충·형    — 엔진에 `calculateNatalRelations` 가 **있다**(지시서의 "엔진이 판정하지 않는" 은
//                 사실과 다르다). 그런데 이것을 넘기면 `INVENTED_RELATION` 검사를 풀어야 하고,
//                 지시서가 그 검사를 약화시키지 말라고 명시했다. **약화시키지 않는 쪽**을 골랐다 —
//                 근거 확대의 가장 큰 다음 지렛대이므로 오너 판단 항목으로 올린다.

export type FamousChartStem = {
  hanja: string;
  hangul: string;
  yinYang: string;
  element: string;
  /** 일간 자신에게는 십성이 없다 — 기준이기 때문이다. */
  tenGod: string | null;
};

export type FamousChartHiddenStem = {
  hanja: string;
  hangul: string;
  /** 정기 · 중기 · 여기 */
  role: string;
  element: string;
  tenGod: string;
};

export type FamousChartBranch = {
  hanja: string;
  hangul: string;
  yinYang: string;
  element: string;
  hiddenStems: FamousChartHiddenStem[];
};

export type FamousChartPillar = {
  /** 년 · 월 · 일 · 시 */
  position: string;
  stem: FamousChartStem;
  branch: FamousChartBranch;
};

/**
 * 글자 사이의 관계 — `calculateNatalRelations` 판정 그대로.
 *
 * ⚠ `meaning` 은 **가치 중립**이어야 한다. Premium V3 에서 합을 "얽힘"·"복잡" 으로 자동 번역해
 * 12개월이 전부 경고가 된 실패가 있었다. 형·파·해를 자동으로 "나쁨" 으로 옮기면 같은 실패다.
 * 그래서 모든 뜻 라벨을 **양면으로** 적는다 — 충은 변화의 계기이자 불안정이고, 합은 결속이자 정체다.
 */
export type FamousChartRelation = {
  /** 한글 이름 + 한자. 본문이 이 형태로 써야 검사기가 대조할 수 있다. */
  name: string;
  /** 참여 글자의 한글. 검사기가 본문과 대조하는 기준이다. */
  members: string[];
  /** 어느 자리 사이인지 (세트 관계는 비어 있을 수 있다). */
  positions: string[];
  /** 가치 중립 뜻 라벨. */
  meaning: string;
  /** 삼합·방합·반합의 국 오행, 천간합의 명목 화 오행. 없으면 null. */
  element: string | null;
};

/** 통근 — 천간이 지지 안에 같은 오행의 뿌리를 두고 있는가. 엔진 판정 그대로. */
export type FamousChartRooting = {
  position: string;
  stem: string;
  rooted: boolean;
  /** 뿌리를 둔 지지 자리들. 비어 있으면 뜬 글자다. */
  roots: string[];
};

/** 투간 — 지지 속에 숨은 글자가 천간으로 드러났는가. 엔진 판정 그대로. */
export type FamousChartRevealed = {
  branchPosition: string;
  hiddenStem: string;
  role: string;
  revealedAt: string[];
};

/** 월령 — 계절이 일간에게 하는 일. 왕상휴수사는 **엔진이 십성으로 도출**한 값이다. */
export type FamousChartMonthCommand = {
  season: string;
  /** 왕·상·휴·수·사 중 하나의 한글 이름. */
  phase: string;
  /** 그 단계가 무슨 뜻인지 — 엔진의 도출 근거(TEN_GOD_TO_PHASE)를 말로 옮긴 것. */
  phaseMeaning: string;
  /**
   * ⚠ 생극의 **방향**. 실측에서 이름은 맞게 쓰고 방향을 뒤집은 본문이 나왔다
   * (휴를 옳게 풀어 놓고 바로 다음 절에서 "월령이 일간을 생해" 라고 썼다).
   * 명리 교육에서 방향이 틀리면 배우는 사람이 반대로 익힌다 — 가장 무거운 오류다.
   * 기계가 대조할 수 있도록 방향을 별도 값으로 둔다.
   */
  direction: 'SAME' | 'SEASON_GENERATES_DAY' | 'DAY_GENERATES_SEASON' | 'DAY_CONTROLS_SEASON' | 'SEASON_CONTROLS_DAY';
  /** 득령 / 실령. */
  inCommand: boolean;
};

export type FamousChartSnapshot = {
  v: typeof FAMOUS_CHART_VERSION;
  /** 시각을 모르면 시주가 없다. 화면과 프롬프트가 둘 다 이 값을 봐야 한다. */
  hourKnown: boolean;
  pillars: {
    year: FamousChartPillar;
    month: FamousChartPillar;
    day: FamousChartPillar;
    hour: FamousChartPillar | null;
  };
  /** 일간 — 명식 해설의 기준점. */
  dayMaster: { hanja: string; hangul: string; element: string; yinYang: string };
  /** 월지 — 계절(득령) 판단의 기준점. */
  monthBranch: { hanja: string; hangul: string; element: string };
  elementCounts: { element: string; count: number }[];
  /** 십성을 다섯 무리로 묶은 개수. 천간과 지장간의 십성을 모두 센다. */
  tenGodGroups: { group: string; count: number; members: string[] }[];
  /** 어느 자리가 어느 오행인지 — 개수만으로는 "어디에" 가 안 보인다. */
  elementSlots: { slot: string; element: string }[];
  rooting: FamousChartRooting[];
  revealed: FamousChartRevealed[];
  monthCommand: FamousChartMonthCommand | null;
  /** 원국 안의 글자 관계. 하나도 없으면 빈 배열 — 그것도 정보다("조용한 명식"). */
  relations: FamousChartRelation[];
  /** 시주가 없으면 6칸, 있으면 8칸. */
  observedSlots: number;
  engineVersion: string | null;
  ruleSetVersion: string | null;
};

export type FamousChartResult =
  | { ok: true; snapshot: FamousChartSnapshot; fingerprint: string | null }
  // 엔진이 명식을 세우지 못했다. 절기 경계일 + 시각 미상이 가장 흔한 원인이다.
  | { ok: false; reason: 'CHART_UNAVAILABLE'; detail: string | null };

export type FamousChartDeps = {
  digestProvider: DigestProvider;
  historicalTimezoneResolver?: HistoricalTimezoneResolver;
};

const label = <T extends Record<string, { hangul: string; hanja?: string }>>(
  map: T,
  key: string,
): { hanja: string; hangul: string } => {
  const entry = (map as Record<string, { hangul: string; hanja?: string }>)[key];
  return { hanja: entry?.hanja ?? '', hangul: entry?.hangul ?? key };
};

const POSITION_HANGUL: Record<string, string> = { YEAR: '년', MONTH: '월', DAY: '일', HOUR: '시' };

// 슬롯 이름(YEAR_STEM …) → 사람이 읽는 자리 이름.
const slotHangul = (slot: string): string => {
  const [pos, kind] = slot.split('_');
  return `${POSITION_HANGUL[pos] ?? pos}${kind === 'STEM' ? '간' : '지'}`;
};

const SEASON_HANGUL: Record<string, string> = {
  SPRING: '봄', SUMMER: '여름', AUTUMN: '가을', WINTER: '겨울',
};

// ⚠ 왕상휴수사의 한글 이름과 뜻. **새 판정이 아니다** — 엔진(`monthCommand.ts`)이 이미 십성으로
// 각 단계를 도출해 두었고(TEN_GOD_TO_PHASE), 여기서는 그 도출 근거를 한국어로 옮겨 적을 뿐이다.
// 뜻을 함께 넘기는 이유는 Premium V2 의 교훈이다 — 근거만 늘리면 톤이 안 잡히고, 각 근거가
// "무엇을 뜻하는지" 라벨을 붙여야 글이 달라진다.
const PHASE: Record<string, { name: string; meaning: string; direction: FamousChartMonthCommand['direction'] }> = {
  WANG: { name: '왕(旺)', meaning: '계절과 일간이 같은 오행 — 계절이 일간을 그대로 밀어 줍니다', direction: 'SAME' },
  XIANG: { name: '상(相)', meaning: '계절이 일간을 생해 줌 — 뒤에서 받쳐 주는 자리입니다', direction: 'SEASON_GENERATES_DAY' },
  XIU: { name: '휴(休)', meaning: '일간이 계절을 생함 — 내보내는 쪽이라 힘을 씁니다', direction: 'DAY_GENERATES_SEASON' },
  QIU: { name: '수(囚)', meaning: '일간이 계절을 극함 — 밀어내느라 힘을 씁니다', direction: 'DAY_CONTROLS_SEASON' },
  SI: { name: '사(死)', meaning: '계절이 일간을 극함 — 계절이 일간을 눌러 옵니다', direction: 'SEASON_CONTROLS_DAY' },
};

// 십성 다섯 무리. 이름은 레포에서 이미 쓰는 것(`structuredConsultation.ts`·`TECHNICAL_LEXICON`).
const TEN_GOD_GROUP: Record<string, string> = {
  비견: '비겁', 겁재: '비겁',
  식신: '식상', 상관: '식상',
  편재: '재성', 정재: '재성',
  편관: '관성', 정관: '관성',
  편인: '인성', 정인: '인성',
};
const GROUP_ORDER = ['비겁', '식상', '재성', '관성', '인성'];

// ⚠ 관계 이름과 **가치 중립** 뜻 라벨. 새 판정이 아니라 엔진 enum 을 한국어로 옮긴 것이다.
// 각 뜻은 **양면**으로 적는다 — 한쪽으로 기울면 그 자체가 판정이 되고, 그것이 Premium V3 의 실패였다.
// 괄호 안 한자가 **검사기의 앵커**다: 본문의 "해석"·"파악"·"충분" 은 한자를 달지 않으므로 걸리지 않는다.
const RELATION_LABEL: Record<string, { name: string; meaning: string }> = {
  STEM_COMBINATION: {
    name: '천간합(合)',
    meaning: '두 천간이 짝을 이루는 관계. 묶여서 안정되기도 하고, 묶여서 제 일을 못 하기도 합니다',
  },
  STEM_CLASH: {
    name: '천간충(沖)',
    meaning: '두 천간이 정면으로 맞서는 관계. 결정을 재촉하기도 하고 흔들림이 되기도 합니다',
  },
  BRANCH_SIX_COMBINATION: {
    name: '육합(六合)',
    meaning: '두 지지가 하나로 묶이는 관계. 결속이기도 하고 정체이기도 합니다',
  },
  BRANCH_CLASH: {
    name: '충(沖)',
    meaning: '두 지지가 정면으로 부딪히는 관계. 변화·이동의 계기가 되기도 하고 불안정의 원인이 되기도 합니다',
  },
  BRANCH_HALF_THREE_HARMONY: {
    name: '반합(半合)',
    meaning: '삼합 세 글자 중 둘만 모인 관계. 방향이 잡히기도 하고, 아직 완성되지 않은 상태이기도 합니다',
  },
  BRANCH_PUNISHMENT: {
    name: '형(刑)',
    meaning: '두 지지가 서로를 다듬는 관계. 마찰이기도 하고 조정이기도 합니다',
  },
  BRANCH_SELF_PUNISHMENT: {
    name: '자형(自刑)',
    meaning: '같은 지지가 겹친 관계. 같은 기운이 두터워지기도 하고, 같은 성질끼리 안에서 맞물리기도 합니다',
  },
  BRANCH_DESTRUCTION: {
    name: '파(破)',
    meaning: '두 지지가 서로의 짜임을 흩는 관계. 굳은 틀이 풀리기도 하고, 자리가 헐거워지기도 합니다',
  },
  BRANCH_HARM: {
    name: '해(害)',
    meaning: '두 지지가 서로의 합을 방해하는 관계. 끼어듦이기도 하고 견제이기도 합니다',
  },
  BRANCH_THREE_HARMONY: {
    name: '삼합(三合)',
    meaning: '세 지지가 하나의 오행 국을 이루는 관계. 힘이 한곳에 모이기도 하고, 그쪽으로만 쏠리기도 합니다',
  },
  BRANCH_DIRECTIONAL_UNION: {
    name: '방합(方合)',
    meaning: '한 계절의 세 지지가 모인 관계. 그 계절 기운이 두터워지기도 하고, 한 계절에 치우치기도 합니다',
  },
  BRANCH_THREE_PUNISHMENT: {
    name: '삼형(三刑)',
    meaning: '세 지지가 함께 형을 이루는 관계. 세 힘이 서로 맞물리기도 하고, 서로를 다듬기도 합니다',
  },
};

/**
 * 프로즌 엔진을 돌려 명식 스냅샷을 만든다. 실패는 예외가 아니라 typed 결과다 —
 * 유명인은 출생시각을 모르는 경우가 흔하고, 그것은 오류가 아니라 **정상적인 입력**이다.
 */
export async function buildFamousChart(
  birth: BirthInfoDraft,
  deps: FamousChartDeps,
): Promise<FamousChartResult> {
  let execution;
  try {
    execution = await executeSajuFromBirthInput(toSajuEngineInput(birth), {
      digestProvider: deps.digestProvider,
      historicalTimezoneResolver: deps.historicalTimezoneResolver ?? ASIA_SEOUL_HISTORICAL_TIMEZONE_RESOLVER,
    });
  } catch (err) {
    return { ok: false, reason: 'CHART_UNAVAILABLE', detail: String(err).slice(0, 160) };
  }
  if (!execution.success) {
    return { ok: false, reason: 'CHART_UNAVAILABLE', detail: execution.failedStage ?? null };
  }

  const result = execution.engineResult;
  if (result.status === 'UNAVAILABLE' || !result.output) {
    return {
      ok: false,
      reason: 'CHART_UNAVAILABLE',
      detail: result.status === 'UNAVAILABLE' ? JSON.stringify(result.failure.aggregateReason).slice(0, 160) : null,
    };
  }

  const { derivedFacts, fiveElementDistribution, identity, provenance } = result.output;
  const dayStemKey = result.output.fourPillars.day?.stem ?? null;

  const toPillar = (
    annotation: (typeof derivedFacts.pillars)['year'],
    pillar: { stem: string; branch: string } | undefined,
    isDayPillar: boolean,
  ): FamousChartPillar => {
    const stemL = label(HEAVENLY_STEM_LABELS, pillar?.stem ?? '');
    const branchL = label(EARTHLY_BRANCH_LABELS, pillar?.branch ?? '');
    return {
      position: POSITION_HANGUL[annotation.position] ?? annotation.position,
      stem: {
        ...stemL,
        yinYang: label(YIN_YANG_LABELS, annotation.stem.yinYang).hangul,
        element: label(FIVE_ELEMENT_LABELS, annotation.stem.element).hangul,
        // 일간은 십성의 기준이므로 자기 자신에 대한 십성이 없다.
        tenGod: isDayPillar ? null : label(TEN_GOD_LABELS, annotation.stem.tenGod).hangul,
      },
      branch: {
        ...branchL,
        yinYang: label(YIN_YANG_LABELS, annotation.branch.yinYang).hangul,
        element: label(FIVE_ELEMENT_LABELS, annotation.branch.element).hangul,
        hiddenStems: annotation.branch.hiddenStems.map((h) => ({
          ...label(HEAVENLY_STEM_LABELS, h.stem),
          role: label(HIDDEN_STEM_ROLE_LABELS, h.role).hangul,
          element: label(FIVE_ELEMENT_LABELS, h.element).hangul,
          tenGod: label(TEN_GOD_LABELS, h.tenGod).hangul,
        })),
      },
    };
  };

  const fp = result.output.fourPillars;
  const hourAnnotation = derivedFacts.pillars.hour;

  // ── 통근·투간·월령 — 프로즌 myungri 서비스를 그대로 부른다. 여기서 계산하지 않는다.
  //    natal 컨텍스트는 엔진의 4주를 옮겨 담는 공식 seam(`natalContextFromFourPillars`)이다.
  const natal = natalContextFromFourPillars(fp);
  const rt = calculateRootingTransparency(natal);
  const mc = calculateMonthCommand(natal);

  const rooting: FamousChartRooting[] =
    rt.capability === 'AVAILABLE'
      ? rt.rooting.map((r) => ({
          position: POSITION_HANGUL[r.stemPosition] ?? r.stemPosition,
          stem: label(HEAVENLY_STEM_LABELS, r.stem).hangul,
          rooted: r.isRooted,
          roots: r.roots.map(
            (x) => `${POSITION_HANGUL[x.branchPosition] ?? x.branchPosition}지 ${label(EARTHLY_BRANCH_LABELS, x.branch).hangul}`,
          ),
        }))
      : [];

  // 드러난 것만 담는다. "숨은 채 남아 있는 글자" 는 지장간 목록이 이미 보여 준다.
  const revealed: FamousChartRevealed[] =
    rt.capability === 'AVAILABLE'
      ? rt.transparency
          .filter((t) => t.isRevealed)
          .map((t) => ({
            branchPosition: POSITION_HANGUL[t.branchPosition] ?? t.branchPosition,
            hiddenStem: label(HEAVENLY_STEM_LABELS, t.hiddenStem).hangul,
            role: label(HIDDEN_STEM_ROLE_LABELS, t.hiddenStemRole).hangul,
            revealedAt: t.revealedAt.map((p) => `${POSITION_HANGUL[p] ?? p}간`),
          }))
      : [];

  const phase = mc.capability === 'AVAILABLE' ? PHASE[mc.dayMasterSeasonalPhase] : undefined;
  const monthCommand: FamousChartMonthCommand | null =
    mc.capability === 'AVAILABLE' && phase
      ? {
          season: SEASON_HANGUL[mc.season] ?? mc.season,
          phase: phase.name,
          phaseMeaning: phase.meaning,
          direction: phase.direction,
          inCommand: mc.commandStatus === 'IN_COMMAND',
        }
      : null;

  // ── 십성 집계. 계산이 아니라 **세기**다 — 이미 각 자리에 붙어 있는 십성을 무리로 묶을 뿐이다.
  const collectTenGods = (): string[] => {
    const out: string[] = [];
    for (const key of ['year', 'month', 'day', 'hour'] as const) {
      const ann = derivedFacts.pillars[key];
      if (!ann) continue;
      // 일간 자신은 십성의 기준이라 세지 않는다.
      if (key !== 'day') out.push(label(TEN_GOD_LABELS, ann.stem.tenGod).hangul);
      for (const h of ann.branch.hiddenStems) out.push(label(TEN_GOD_LABELS, h.tenGod).hangul);
    }
    return out;
  };
  const allTenGods = collectTenGods();
  const tenGodGroups = GROUP_ORDER.map((group) => {
    const members = allTenGods.filter((g) => TEN_GOD_GROUP[g] === group);
    return { group, count: members.length, members: [...new Set(members)].sort() };
  });

  const elementSlots = fiveElementDistribution.direct.slots.map((s: { slot: string; element: string }) => ({
    slot: slotHangul(s.slot),
    element: label(FIVE_ELEMENT_LABELS, s.element).hangul,
  }));

  // ── 글자 관계 — `calculateNatalRelations` 판정 그대로. 여기서 판정하지 않는다.
  const rel = calculateNatalRelations(natal);
  const relations: FamousChartRelation[] = [];
  if (rel) {
    const push = (
      kind: string,
      membersRaw: readonly string[],
      map: typeof HEAVENLY_STEM_LABELS | typeof EARTHLY_BRANCH_LABELS,
      positions: readonly string[],
      element: string | undefined,
    ) => {
      const meta = RELATION_LABEL[kind];
      if (!meta) return; // 라벨 없는 새 kind 가 생기면 조용히 빠진다 — 지어내는 것보다 낫다.
      relations.push({
        name: meta.name,
        members: membersRaw.map((m) => label(map, m).hangul),
        positions: positions.map((p) => POSITION_HANGUL[p] ?? p),
        meaning: meta.meaning,
        element: element ? label(FIVE_ELEMENT_LABELS, element).hangul : null,
      });
    };
    for (const r of rel.stem) {
      push(r.relation.kind, r.relation.stems, HEAVENLY_STEM_LABELS, r.positions, r.relation.nominalTransformElement);
    }
    for (const r of rel.branch) {
      push(r.relation.kind, r.relation.branches, EARTHLY_BRANCH_LABELS, r.positions, r.relation.harmonyElement);
    }
    for (const r of rel.sets) {
      push(r.kind, r.branches, EARTHLY_BRANCH_LABELS, [], r.element);
    }
  }
  // 시주는 { status, pillar } 래퍼다 — AVAILABLE 일 때만 실제 간지가 있다.
  const hourPillar = fp.hour?.status === 'AVAILABLE' ? fp.hour.pillar : undefined;
  const snapshot: FamousChartSnapshot = {
    v: FAMOUS_CHART_VERSION,
    hourKnown: Boolean(hourAnnotation),
    pillars: {
      year: toPillar(derivedFacts.pillars.year, fp.year, false),
      month: toPillar(derivedFacts.pillars.month, fp.month, false),
      day: toPillar(derivedFacts.pillars.day, fp.day, true),
      hour: hourAnnotation ? toPillar(hourAnnotation, hourPillar, false) : null,
    },
    dayMaster: {
      ...label(HEAVENLY_STEM_LABELS, dayStemKey ?? ''),
      element: label(FIVE_ELEMENT_LABELS, derivedFacts.pillars.day.stem.element).hangul,
      yinYang: label(YIN_YANG_LABELS, derivedFacts.pillars.day.stem.yinYang).hangul,
    },
    monthBranch: {
      ...label(EARTHLY_BRANCH_LABELS, fp.month?.branch ?? ''),
      element: label(FIVE_ELEMENT_LABELS, derivedFacts.pillars.month.branch.element).hangul,
    },
    elementCounts: Object.entries(fiveElementDistribution.direct.counts).map(([k, n]) => ({
      element: label(FIVE_ELEMENT_LABELS, k).hangul,
      count: Number(n) || 0,
    })),
    tenGodGroups,
    elementSlots,
    rooting,
    revealed,
    monthCommand,
    relations,
    observedSlots: fiveElementDistribution.direct.observedSlots,
    engineVersion: (identity as { engineVersion?: string } | null)?.engineVersion ?? null,
    ruleSetVersion: derivedFacts.ruleVersions.derivedFacts ?? null,
  };

  const fingerprint =
    (provenance as { normalizedBirthFingerprint?: string } | null)?.normalizedBirthFingerprint ?? null;

  return { ok: true, snapshot, fingerprint };
}

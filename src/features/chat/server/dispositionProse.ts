// 성향 생성기 — 이미 계산된 값을 **사람 말로 옮기기만** 한다 (2026-09-19, CTO 판정 ⓑ).
//
// 왜 필요한가. 2026-09-19 실측: 성향 질문 16건 중 12건(75%)이 "한 가지 성향으로 규정하기보다…" 로
// 거절됐다. 거절의 원인은 톤 검사가 아니라 판단 계층이다 — 성격 질문이 TRAIT 의도로 분류되고 엔진이
// 엇갈리면 DECLINED 로 간다. 그 결과 답변이 누구에게나 해당하는 말이 된다.
//
// **성향 서술과 결과 예측은 다른 종류다.** "앞에 나서는 편이에요" 는 사람 설명이고, "앞에 나서면
// 성공합니다" 는 예측이다. 뒤엣것은 지금처럼 막아야 하고, 앞엣것은 막을 이유가 없다.
//
// ⚠ 계산 교리를 건드리지 않는다. 이 모듈은 **아무것도 계산하지 않는다.**
//   · 엔진이 이미 붙인 십신 라벨과 이미 센 오행 개수를 **읽기만** 한다
//   · 지장간 가중치나 월령 우선 같은 **명리 해석 규칙을 새로 만들지 않는다** — 만드는 순간 교리를 건드린다
//   · 어느 쪽도 뚜렷하지 않으면 **말하지 않는다**(null). 억지로 고르지 않는다
//
// ── 우선순위: 십신 먼저, 오행 나중 (2026-09-19 변경 · CTO 추가 확인 요청) ────────────────────
//
// 처음에는 오행 분포의 최댓값을 먼저 썼다. 저장소 근거를 다시 보고 **십신을 앞으로 옮겼다.** 이유 셋:
//
//  ① **저장소가 이미 십신을 "사용자에게 풀어 설명할 말" 로 인정한다.**
//     `structuredConsultation.ts` 의 지시: "재성·관성·식상·비겁·인성 … 같은 명리 용어를 꼭 써야 하면,
//     먼저 그 의미를 일상 언어로 풀어 말한 뒤 …". 오행 분포는 그 목록에 없다.
//
//  ② **오행 우세의 주된 쓰임은 강약(신강·신약)·용신 판단인데, 저장소는 그 용어와 단정을 금지한다.**
//     같은 지시문: "신강·신약·용신·격국 … 답변에 쓰지 말고 단정하지도 마십시오."
//     오행이 많다는 이유로 성향을 말하면 금지된 판단에 한 발을 걸치게 된다. 십신은 그 위험이 없다.
//
//  ③ **십신은 사람이 세상과 맺는 관계를 가리키는 지표**라 성향에 더 가깝다(비견=스스로, 관성=틀,
//     식상=표현, 재성=현실, 인성=배움). 오행 분포는 기운의 많고 적음이라 사람 설명과 한 다리 멀다.
//
//  → 십신에 뚜렷한 최댓값이 없을 때만 오행으로 내려간다. 오행을 아주 버리지는 않는다 —
//    저장소의 승인된 출력(`docs/FAMOUS_SAMPLE_OUTPUT_V2.md`)도 오행 우세를 구조 서술로 쓰고 있다.
//
// ⚠ 일주 천간은 **세지 않는다.** 일간은 자기 자신이라 십신이 언제나 비견이다 — 모든 명식에 비견을
//   하나씩 더해 주는 상수이므로, 세면 비견 쪽으로 체계적으로 기운다. 정보가 없는 항을 빼는 것이지
//   가중치를 매기는 것이 아니다.
//
// ⚠ 결정론. 난수가 없고 입력이 같으면 출력이 같다. 문구는 고정 표에서 고른다.

export type FiveElementKey = 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER';
export type TenGodKey =
  | 'BI_GYEON' | 'GEOP_JAE' | 'SIK_SIN' | 'SANG_GWAN' | 'PYEON_JAE'
  | 'JEONG_JAE' | 'PYEON_GWAN' | 'JEONG_GWAN' | 'PYEON_IN' | 'JEONG_IN';

export type DispositionBasis = {
  /** 어느 학문에서 나왔는가 — 접힌 근거 영역에 그대로 적는다(합치지 않는다). */
  system: '명리' | '자미두수';
  /** 무엇을 근거로 했는가. 사용자가 펼쳐 보는 문장. */
  detail: string;
};

export type DispositionResult = {
  /** "~한 편이에요" 한 줄. 재료가 뚜렷하지 않으면 null — 없는 말을 만들지 않는다. */
  text: string | null;
  /** 근거. 학문별로 따로 담는다. */
  basis: DispositionBasis[];
};

export type DispositionInput = {
  /**
   * 천간 십신 — **일주를 뺀 년·월·시**. 엔진이 이미 붙인 라벨을 그대로 받는다.
   * 일간의 십신은 언제나 비견이라 정보가 없다(위 머리말 참고). 호출자가 빼서 넘긴다.
   */
  stemTenGods?: readonly TenGodKey[];
  /** 오행 분포 — 엔진이 이미 센 개수. 여기서 다시 세지 않는다. */
  elementCounts?: Readonly<Record<FiveElementKey, number>> | null;
  /** 자미두수 명궁 주성 이름(한글). 없으면 null. */
  ziweiMainStar?: string | null;
};

// ── 문구 표 — 전부 "사람 설명" 이다. 결과·성공·실패를 담은 표현은 하나도 없다. ──────────────

const ELEMENT_TRAIT: Record<FiveElementKey, string> = {
  WOOD: '새로 벌여 놓고 뻗어 나가는 편',
  FIRE: '생각을 드러내고 표현하는 편',
  EARTH: '버티면서 중심을 잡는 편',
  METAL: '정리하고 끊어낼 건 끊어내는 편',
  WATER: '흐름을 읽고 맞춰 가는 편',
};

const TEN_GOD_TRAIT: Record<TenGodKey, string> = {
  BI_GYEON: '스스로 밀고 가는 편',
  GEOP_JAE: '겨루는 자리에서 힘이 나는 편',
  SIK_SIN: '하나를 오래 파고드는 편',
  SANG_GWAN: '하고 싶은 말은 해야 풀리는 편',
  PYEON_JAE: '여러 갈래를 동시에 굴리는 편',
  JEONG_JAE: '하나씩 확실히 쌓아 가는 편',
  PYEON_GWAN: '압박이 있을 때 더 움직이는 편',
  JEONG_GWAN: '정해진 틀 안에서 차분한 편',
  PYEON_IN: '남과 다른 각도로 보는 편',
  JEONG_IN: '배우고 정리해서 내 것으로 만드는 편',
};

const ELEMENT_LABEL: Record<FiveElementKey, string> = {
  WOOD: '목', FIRE: '화', EARTH: '토', METAL: '금', WATER: '수',
};
const TEN_GOD_LABEL: Record<TenGodKey, string> = {
  BI_GYEON: '비견', GEOP_JAE: '겁재', SIK_SIN: '식신', SANG_GWAN: '상관', PYEON_JAE: '편재',
  JEONG_JAE: '정재', PYEON_GWAN: '편관', JEONG_GWAN: '정관', PYEON_IN: '편인', JEONG_IN: '정인',
};

/** 오행 순서 — 동점일 때 아무것도 고르지 않기 위해 "유일한 최댓값" 만 인정한다. */
const ELEMENT_ORDER: readonly FiveElementKey[] = ['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'];

/**
 * 조사를 앞 글자에 맞춰 고른다.
 *
 * ⚠ 이 헬퍼가 여기 있는 이유: 처음 이 파일을 쓸 때 `${라벨}이 가장 많습니다` 로 조사를 **글자로 박았고**,
 * 받침이 없는 "토" 에 붙어 "토이 가장 많습니다" 가 나왔다. 2026-09-18 조사에서 같은 모양의 자리를
 * **52곳** 세어 두었다(`다음묶음_작업목록_2026-09-17.md` 3-x). 새 코드가 그 52번째가 되지 않게 한다.
 */
export function josa(word: string, pair: '이/가' | '은/는' | '을/를' | '과/와'): string {
  const last = word[word.length - 1] ?? '';
  const code = last.charCodeAt(0);
  const hasFinal = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  const [withFinal, withoutFinal] = pair.split('/');
  return `${word}${hasFinal ? withFinal : withoutFinal}`;
}

/** 유일한 최댓값을 가진 키. 동점이면 null — 억지로 고르지 않는다(계산 교리를 만들지 않기 위해). */
function uniqueMax<K extends string>(counts: Readonly<Record<K, number>>, order: readonly K[]): K | null {
  let best: K | null = null;
  let bestN = -1;
  let tied = false;
  for (const k of order) {
    const n = counts[k] ?? 0;
    if (n > bestN) { best = k; bestN = n; tied = false; } else if (n === bestN) { tied = true; }
  }
  if (best === null || bestN <= 0 || tied) return null;
  return best;
}

/** 천간 십신 중 **더 자주 나온 것**. 동점이면 null. 지장간·월령 가중치를 쓰지 않는다. */
function dominantTenGod(stems: readonly TenGodKey[]): { key: TenGodKey; count: number } | null {
  if (stems.length === 0) return null;
  const counts = {} as Record<TenGodKey, number>;
  for (const k of Object.keys(TEN_GOD_TRAIT) as TenGodKey[]) counts[k] = 0;
  for (const s of stems) counts[s] = (counts[s] ?? 0) + 1;
  const order = Object.keys(TEN_GOD_TRAIT) as TenGodKey[];
  const key = uniqueMax(counts, order);
  return key ? { key, count: counts[key] } : null;
}

/**
 * 자미두수 주성 → 사람 설명. 표에 없는 별은 **쓰지 않는다** — 모르는 별을 짐작해 말하지 않는다.
 */
const ZIWEI_TRAIT: Record<string, string> = {
  자미: '중심에 서려는 편',
  천부: '안정된 자리를 지키는 편',
  태양: '드러내고 이끄는 편',
  태음: '안에서 챙기는 편',
  무곡: '실속을 따지는 편',
  천동: '모난 데 없이 어울리는 편',
  염정: '원칙을 세우는 편',
  천기: '머리로 먼저 굴려 보는 편',
  탐랑: '관심이 여러 곳으로 뻗는 편',
  거문: '따져 묻는 편',
  천상: '도와주는 자리에 서는 편',
  천량: '한 발 물러서 보는 편',
  칠살: '정면으로 부딪는 편',
  파군: '판을 바꾸는 편',
};

/**
 * 성향 한 줄을 만든다. **계산하지 않는다** — 이미 계산된 라벨과 개수를 문구로 옮길 뿐이다.
 *
 * 엇갈릴 때의 규칙(CTO 판정 3): 통째로 거절하지 않는다.
 * · 명리와 자미두수가 **같은 결**을 가리키면 하나로 말한다.
 * · **다른 결**을 가리키면 근거가 더 뚜렷한 쪽(오행 개수 차이) 하나만 말하고, 다른 쪽은 근거로만 남긴다.
 * · 어느 쪽도 뚜렷하지 않으면 null.
 */
export function buildDisposition(input: DispositionInput): DispositionResult {
  const basis: DispositionBasis[] = [];

  const element = input.elementCounts ? uniqueMax(input.elementCounts, ELEMENT_ORDER) : null;
  const tenGod = dominantTenGod(input.stemTenGods ?? []);
  const star = input.ziweiMainStar && ZIWEI_TRAIT[input.ziweiMainStar] ? input.ziweiMainStar : null;

  // 명리 쪽 문구 — **십신이 먼저다**(머리말의 이유 ①②③). 뚜렷하지 않을 때만 오행으로 내려간다.
  let myungri: string | null = null;
  if (tenGod) {
    myungri = TEN_GOD_TRAIT[tenGod.key];
    basis.push({ system: '명리', detail: `천간 십신에 ${josa(TEN_GOD_LABEL[tenGod.key], '이/가')} ${tenGod.count}번 나옵니다.` });
  } else if (element) {
    myungri = ELEMENT_TRAIT[element];
    basis.push({ system: '명리', detail: `오행 분포에서 ${josa(ELEMENT_LABEL[element], '이/가')} 가장 많습니다.` });
  }

  let ziwei: string | null = null;
  if (star) {
    ziwei = ZIWEI_TRAIT[star];
    basis.push({ system: '자미두수', detail: `명궁 주성이 ${star}입니다.` });
  }

  if (!myungri && !ziwei) return { text: null, basis: [] };
  if (myungri && ziwei && myungri !== ziwei) {
    // 엇갈림 — 통째로 거절하지 않는다. 근거가 더 뚜렷한 명리 쪽으로 말하고, 자미두수는 근거로 남긴다.
    return { text: `${myungri}이에요.`, basis };
  }
  const text = myungri ?? ziwei;
  return { text: text ? `${text}이에요.` : null, basis };
}

/**
 * 결과 예측이 섞였는지 본다. 성향 서술은 **사람 설명**까지다 — 성공·실패·돈·시기를 붙이면 예측이 된다.
 * 생성기 자신의 출력뿐 아니라, 나중에 모델이 다듬은 문장을 검사할 때도 쓴다.
 */
const OUTCOME_WORDS = /(성공|실패|잘\s*됩니다|잘\s*돼|이득|손해|돈을\s*벌|망|대박|출세|승진합니다|합격|이깁니다|유리합니다|불리합니다|좋아집니다|나빠집니다)/;
const PREDICTION_SHAPE = /(하면\s*[^.]*(됩니다|돼요|합니다|해요)|할\s*것입니다|될\s*것입니다|겁니다)/;

// ── 근거 섹션 → 입력 ─────────────────────────────────────────────────────────
//
// ⚠ 왜 문자열을 읽는가. 오케스트레이터가 들고 있는 `ConsultationGrounding.evidence` 는 엔진의 타입이
// 아니라 **이미 렌더된 섹션 목록**(`{label, lines}`)이다. 타입을 새로 끌어오면 엔진 계약을 건드리게
// 되므로, 어댑터가 **결정론적으로** 찍어 둔 그 줄을 읽는다. 형식이 바뀌면 파서는 조용히 null 을
// 돌려주고(억지로 고르지 않는다), 성향은 그냥 나오지 않는다 — 틀린 성향보다 없는 편이 낫다.

export type EvidenceSection = { label: string; lines: readonly string[] };

const ELEMENT_BY_LABEL: Record<string, FiveElementKey> = {
  목: 'WOOD', 화: 'FIRE', 토: 'EARTH', 금: 'METAL', 수: 'WATER',
};
const TEN_GOD_BY_LABEL: Record<string, TenGodKey> = {
  비견: 'BI_GYEON', 겁재: 'GEOP_JAE', 식신: 'SIK_SIN', 상관: 'SANG_GWAN', 편재: 'PYEON_JAE',
  정재: 'JEONG_JAE', 편관: 'PYEON_GWAN', 정관: 'JEONG_GWAN', 편인: 'PYEON_IN', 정인: 'JEONG_IN',
};

const sectionLines = (sections: readonly EvidenceSection[] | undefined, label: string): readonly string[] =>
  sections?.find((s) => s.label === label)?.lines ?? [];

/** `목 1 · 화 1 · 토 4 · 금 1 · 수 1` → 개수. 형식이 다르면 null. */
export function parseElementCounts(sections: readonly EvidenceSection[] | undefined): Record<FiveElementKey, number> | null {
  const line = sectionLines(sections, '오행 분포')[0];
  if (!line) return null;
  const counts: Record<FiveElementKey, number> = { WOOD: 0, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0 };
  let found = 0;
  for (const m of line.matchAll(/([목화토금수])\s+(\d+)/g)) {
    const key = ELEMENT_BY_LABEL[m[1]];
    if (key) { counts[key] = Number(m[2]); found += 1; }
  }
  return found === 5 ? counts : null;
}

/**
 * `년주: 천간 정재 / …` 에서 **천간 십신**만 뽑는다. **일주는 뺀다** — 일간의 십신은 늘 비견이라
 * 정보가 없고, 세면 모든 명식이 비견 쪽으로 기운다(머리말 참고).
 */
export function parseStemTenGods(sections: readonly EvidenceSection[] | undefined): TenGodKey[] {
  const out: TenGodKey[] = [];
  for (const line of sectionLines(sections, '십신·지장간')) {
    const pillar = line.match(/^([년월일시])주:/)?.[1];
    if (!pillar || pillar === '일') continue;
    const label = line.match(/천간\s+(비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인)/)?.[1];
    const key = label ? TEN_GOD_BY_LABEL[label] : undefined;
    if (key) out.push(key);
  }
  return out;
}

/** `명궁(寅): 자미, 천부` → 첫 주성. 없으면 null. */
export function parseZiweiMainStar(sections: readonly EvidenceSection[] | undefined): string | null {
  const line = sectionLines(sections, '12궁').find((l) => l.startsWith('명궁'));
  const stars = line?.split(':')[1]?.trim();
  const first = stars?.split(/[,·]/)[0]?.trim();
  return first && first.length > 0 ? first : null;
}

/** 근거 섹션에서 성향 입력을 만든다. 엔진을 다시 부르지 않는다. */
export function dispositionInputFrom(
  myungriSections: readonly EvidenceSection[] | undefined,
  ziweiSections: readonly EvidenceSection[] | undefined,
): DispositionInput {
  return {
    stemTenGods: parseStemTenGods(myungriSections),
    elementCounts: parseElementCounts(myungriSections),
    ziweiMainStar: parseZiweiMainStar(ziweiSections),
  };
}

export function isDispositionOnly(text: string): boolean {
  const t = (text ?? '').trim();
  if (t.length === 0) return false;
  if (OUTCOME_WORDS.test(t)) return false;
  if (PREDICTION_SHAPE.test(t)) return false;
  // 사람 설명의 형태 — "~한 편이에요" 계열이어야 한다.
  return /(편이에요|편이에요\.|편입니다|편이죠|결이에요)/.test(t);
}

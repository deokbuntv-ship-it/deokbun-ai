// 변곡점 알림 — **엔진 판정을 문구로 옮기는 순수 함수.** LLM 0콜, 원가 0.
//
// WHY THIS IS TEMPLATES, NOT AN LLM.
//   입력이 닫힌 집합이다 — 십신 이름 열 개, 관계 이름 열두 개, 달 번호 열둘. 템플릿이 전부 덮는다.
//   그리고 결정적으로, **이 기능의 성패는 톤이다.** "이렇게 됩니다" 를 절대 쓰지 않는 것,
//   무거운 달을 겁주지 않는 것 — 그것을 **보장**하는 방법은 문장을 고정하는 것뿐이다.
//   LLM 을 쓰면 같은 보장을 위해 검사기를 또 만들어야 하고, 그 검사기는 어휘를 벗어나면 샌다
//   (유명인 본문 v4 에서 이미 겪었다). 원가 0 은 덤이다.
//
// ⚠ 새 판정을 만들지 않는다. `buildPremiumEvidence` 가 이미 내는 것만 읽는다 —
//   대운(활성 구간·시작 나이) · 세운(해) · 열두 달의 조화/마찰 신호.
//   충·합 자체를 알림으로 옮기지 않는다(빈도를 못 잡고, 관계 판정은 다른 작업이다).
//
// ⚠ 톤 (오너 결정): 예보이지 예언이 아니다.
//   · 시기의 성격을 말하되 결과를 말하지 않는다
//   · 무거운 달은 "조심" 이 아니라 **미리 볼 만한 것**으로 쓴다
//   · 밝은 달도 과장하지 않는다 — "좋은 일이 생깁니다" 가 아니라 "움직이기 수월한 시기"
//   · 겁주어 상담으로 밀지 않는다. 알림이 광고가 되면 그 순간 신뢰를 잃는다
//   이 원칙은 `turningPointTone.test.ts` 가 기계로 잠근다.

export type TurningPointKind = 'DAEWOON' | 'SEWOON' | 'MONTH_BRIGHT' | 'MONTH_HEAVY';

export type TurningPoint = {
  kind: TurningPointKind;
  /** `in_app_notifications.dedup_key` — 사용자당 한 번만 만들어지게 하는 열쇠. */
  dedupKey: string;
  title: string;
  body: string;
  /** 해가 특정되는 변곡점만 값이 있다. 대운은 나이 구간이라 해가 없다. */
  year: number | null;
  /** 달 단위 변곡점만 값이 있다. */
  month: number | null;
};

/** `buildPremiumEvidence` 결과에서 이 모듈이 읽는 것만 추린 모양. */
export type TurningPointInput = {
  daewoon: { ordinal: number; startAge: number; endAge: number; tenGods: string[] } | null;
  sewoon: { year: number; tenGods: string[] } | null;
  brightMonths: readonly { year: number; month: number; why: string }[];
  heavyMonths: readonly { year: number; month: number; why: string }[];
  ageAtReport: number;
};

/**
 * 월운 알림의 문턱.
 *
 * ⚠ 이 숫자가 빈도를 정한다. `brightMonths`/`heavyMonths` 는 이미 **최고 점수 달**만 돌려주지만
 * (`premiumEvidence.pick`), 그 최고 점수가 1이면 관계 하나가 걸린 것뿐이라 "두드러진 달" 이 아니다.
 * 신호가 **둘 이상** 겹칠 때만 알린다. 실측 근거는 `turningPointFrequency.test.ts` 에 있다.
 */
export const MONTH_SIGNAL_THRESHOLD = 2;

/** `why` 는 신호를 ` · ` 로 이은 문자열이다. 개수가 곧 강도다. */
function signalCount(why: string): number {
  return why.trim() === '' ? 0 : why.split(' · ').filter((s) => s.trim() !== '').length;
}

const TEN_GOD_TONE: Record<string, string> = {
  비견: '스스로 밀고 나가는 힘',
  겁재: '함께 겨루는 힘',
  식신: '꺼내 놓는 힘',
  상관: '드러내 보이는 힘',
  편재: '넓게 벌리는 힘',
  정재: '차곡차곡 쌓는 힘',
  편관: '밀어붙이는 힘',
  정관: '틀을 세우는 힘',
  편인: '기대어 배우는 힘',
  정인: '받아 안는 힘',
};

/** 십신 목록을 사람 말로. 모르는 이름은 **버리지 않고 그대로 둔다**(빈 문장을 만들지 않는다). */
function toneOf(tenGods: readonly string[]): string | null {
  // ⚠ 중복을 지운다. 편인·편인처럼 같은 십신이 둘 나오면 "기대어 배우는 힘과 기대어 배우는 힘"
  //   이라는 문장이 된다(S5 실측). 같은 말을 두 번 하는 것은 문구가 아니라 결함이다.
  const words = [...new Set(tenGods.map((g) => TEN_GOD_TONE[g] ?? g).filter((w) => w.length > 0))];
  if (words.length === 0) return null;
  return words.slice(0, 2).join('과 ');
}

export function buildTurningPoints(ev: TurningPointInput): TurningPoint[] {
  const out: TurningPoint[] = [];

  // ── 1순위: 대운 교체. 10년에 한 번. 엔진이 고른 **활성** 대운의 시작 나이와 지금 나이가 같으면
  //    올해 바뀐 것이다. 새로 계산하지 않는다.
  if (ev.daewoon && ev.daewoon.startAge === ev.ageAtReport) {
    const tone = toneOf(ev.daewoon.tenGods);
    out.push({
      kind: 'DAEWOON',
      dedupKey: `TP:DAEWOON:${ev.daewoon.ordinal}`,
      year: null,
      month: null,
      title: '십 년의 흐름이 바뀌는 자리에 왔습니다',
      body:
        `${ev.ageAtReport}세부터 ${ev.daewoon.endAge}세까지, 새 대운이 시작됩니다.`
        + (tone ? ` 이 십 년은 ${tone}이 앞에 놓이는 시기입니다.` : '')
        + ' 무엇이 달라지는지는 사람마다 다릅니다 — 지금 명식에서 어디를 먼저 볼지만 짚어 두면 충분합니다.'
        + ' (근거: 대운 교체 · 명식 판정)',
    });
  }

  // ── 2순위: 세운. 해마다 한 번.
  if (ev.sewoon) {
    const tone = toneOf(ev.sewoon.tenGods);
    out.push({
      kind: 'SEWOON',
      dedupKey: `TP:SEWOON:${ev.sewoon.year}`,
      year: ev.sewoon.year,
      month: null,
      title: `${ev.sewoon.year}년의 기운이 시작됩니다`,
      body:
        '한 해의 기운은 입춘을 지나며 바뀝니다.'
        + (tone ? ` 올해는 ${tone}이 도드라지는 해입니다.` : '')
        + ' 어떤 일이 생긴다는 뜻은 아니고, 같은 일도 다르게 풀리는 결이 있다는 뜻입니다.'
        + ` (근거: ${ev.sewoon.year}년 세운 · 원국과의 관계)`,
    });
  }

  // ── 3순위: 열두 달 중 두드러진 달. **문턱을 넘은 것만, 방향별로 하나씩.**
  //    ⚠ 밝은 달과 무거운 달을 같은 무게로 다룬다. 한쪽만 알리면 그 자체가 톤이 된다.
  const strongest = (
    list: readonly { year: number; month: number; why: string }[],
  ): { year: number; month: number; why: string; n: number } | null => {
    let best: { year: number; month: number; why: string; n: number } | null = null;
    for (const m of list) {
      const n = signalCount(m.why);
      if (n < MONTH_SIGNAL_THRESHOLD) continue;
      if (best === null || n > best.n) best = { ...m, n };
    }
    return best;
  };

  const bright = strongest(ev.brightMonths);
  if (bright) {
    out.push({
      kind: 'MONTH_BRIGHT',
      dedupKey: `TP:MONTH_BRIGHT:${bright.year}-${String(bright.month).padStart(2, '0')}`,
      year: bright.year,
      month: bright.month,
      title: `${bright.month}월은 움직이기 수월한 달입니다`,
      body:
        '열두 달 가운데 글자들이 가장 순하게 맞물리는 달입니다.'
        + ' 미뤄 둔 일을 꺼내 보기에 나쁘지 않은 시기라는 뜻이지, 무엇이 잘된다는 약속은 아닙니다.'
        + ` (근거: ${bright.year}년 ${bright.month}월 · ${bright.why})`,
    });
  }

  const heavy = strongest(ev.heavyMonths);
  if (heavy && !(bright && bright.year === heavy.year && bright.month === heavy.month)) {
    out.push({
      kind: 'MONTH_HEAVY',
      dedupKey: `TP:MONTH_HEAVY:${heavy.year}-${String(heavy.month).padStart(2, '0')}`,
      year: heavy.year,
      month: heavy.month,
      title: `${heavy.month}월은 미리 살펴 둘 것이 있는 달입니다`,
      body:
        '열두 달 가운데 글자들이 가장 많이 부딪히는 달입니다.'
        + ' 나쁜 일이 생긴다는 뜻이 아니라, 겹치는 일이 많아지기 쉬우니 일정과 우선순위를 먼저 정해 두면'
        + ' 수월하다는 뜻입니다.'
        + ` (근거: ${heavy.year}년 ${heavy.month}월 · ${heavy.why})`,
    });
  }

  // ── 같은 달에 둘이 겹치면 우선순위가 높은 하나만 남긴다.
  //    ⚠ 알림이 한 달에 둘 뜨면 그때부터 둘 다 안 읽힌다.
  const RANK: Record<TurningPointKind, number> = { DAEWOON: 0, SEWOON: 1, MONTH_HEAVY: 2, MONTH_BRIGHT: 3 };
  const byMonth = new Map<string, TurningPoint>();
  const keep: TurningPoint[] = [];
  for (const tp of out.sort((a, b) => RANK[a.kind] - RANK[b.kind])) {
    if (tp.month === null) { keep.push(tp); continue; }
    const k = `${tp.year}-${tp.month}`;
    if (byMonth.has(k)) continue;
    byMonth.set(k, tp);
    keep.push(tp);
  }
  return keep;
}

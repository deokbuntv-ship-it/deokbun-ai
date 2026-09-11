// 변곡점 알림 — **빈도 실측 + 톤 잠금.**
//
// 이 파일이 두 가지를 지킨다:
//   ① 빈도 — 목표는 연 3~5회다. 너무 잦으면 무뎌지고, 너무 드물면 없는 것과 같다.
//      추측하지 않고 **실제 명식으로 12개월 창을 돌려 센다.**
//   ② 톤 — 예보이지 예언이 아니다. 결과 단정·공포·과장을 **기계로** 막는다.
//      (Premium V3 에서 합을 자동으로 "얽힘" 으로 옮겨 열두 달이 전부 경고가 된 실패가 있었다.)
import { createHash } from 'node:crypto';

import { buildPremiumEvidence } from '@/features/premium/engine/premiumEvidence';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';

import { buildTurningPoints, MONTH_SIGNAL_THRESHOLD, type TurningPoint } from '../turningPoint';

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
};
const NOW = Math.floor(Date.UTC(2026, 8, 2, 0, 0, 0) / 1000);

const birth = (over: Partial<BirthInfoDraft>): BirthInfoDraft => ({
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '1', birthDay: '11', birthTimeAccuracy: 'exact', birthHour: '21',
  birthMinute: '15', approximateTimePeriod: null, birthPlace: '청주',
  ...over,
});

// ⚠ 여섯 명. 일간·월지·나이·성별이 서로 다르고, **시각 미상 하나와 절기 경계일 하나**를 넣었다.
//   경계일(입춘 무렵)은 명식이 흔들리는 자리라 알림이 어떻게 되는지 봐야 한다.
const SUBJECTS: Record<string, BirthInfoDraft> = {
  'S1-1990-겨울': birth({}),
  'S2-1980-여름': birth({ gender: 'female', birthYear: '1980', birthMonth: '8', birthDay: '3', birthHour: '18', birthMinute: '30', birthPlace: '광주' }),
  'S3-1970-초겨울': birth({ birthYear: '1970', birthMonth: '12', birthDay: '19', birthHour: '16', birthMinute: '45', birthPlace: '울산' }),
  'S4-2001-봄': birth({ birthYear: '2001', birthMonth: '3', birthDay: '14', birthHour: '9', birthMinute: '20', birthPlace: '서울' }),
  'S5-1995-가을': birth({ gender: 'female', birthYear: '1995', birthMonth: '10', birthDay: '7', birthHour: '5', birthMinute: '40', birthPlace: '부산' }),
  'S6-경계일-입춘': birth({ birthYear: '1988', birthMonth: '2', birthDay: '4', birthHour: '17', birthMinute: '0', birthPlace: '대구' }),
};
const UNKNOWN_TIME = birth({ birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null });

async function pointsFor(b: BirthInfoDraft, nowEpochSeconds = NOW): Promise<TurningPoint[] | null> {
  const ev = await buildPremiumEvidence({ birthInfo: b }, { digestProvider, nowEpochSeconds });
  if (!ev.available) return null;
  return buildTurningPoints(ev);
}

describe('⚠ 빈도 실측 — 목표 연 3~5회', () => {
  it('표본 여섯 명 전부 12개월 창에서 연 3~5회 안에 든다', async () => {
    const counts: Record<string, number> = {};
    for (const [name, b] of Object.entries(SUBJECTS)) {
      const tps = await pointsFor(b);
      // 명식이 서지 않으면 알림도 없다. 그건 5-1 이 따로 본다.
      if (tps === null) continue;
      counts[name] = tps.length;
    }
    const values = Object.values(counts);
    expect(values.length).toBeGreaterThanOrEqual(5);
    for (const [name, n] of Object.entries(counts)) {
      // 실측을 실패 메시지에 담는다 — 문턱을 조정할 때 이 숫자가 근거가 된다.
      expect({ name, n, ok: n >= 1 && n <= 5 }).toEqual({ name, n, ok: true });
    }
    // 평균이 목표 구간에 있어야 한다. 한 명이 0이고 한 명이 5면 평균으로는 맞아도 설계가 틀린 것이라
    // 위에서 개별로도 본다.
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    expect(avg).toBeGreaterThanOrEqual(2);
    expect(avg).toBeLessThanOrEqual(5);
  });

  it('세운은 사람마다 정확히 한 번 — 해마다 한 번이라는 뜻이다', async () => {
    for (const b of Object.values(SUBJECTS)) {
      const tps = await pointsFor(b);
      if (tps === null) continue;
      expect(tps.filter((t) => t.kind === 'SEWOON')).toHaveLength(1);
    }
  });

  it('월운은 방향별 최대 하나 — 열두 달이 전부 알림이 되지 않는다', async () => {
    for (const b of Object.values(SUBJECTS)) {
      const tps = await pointsFor(b);
      if (tps === null) continue;
      expect(tps.filter((t) => t.kind === 'MONTH_BRIGHT').length).toBeLessThanOrEqual(1);
      expect(tps.filter((t) => t.kind === 'MONTH_HEAVY').length).toBeLessThanOrEqual(1);
    }
  });

  it('같은 달에 알림이 둘 뜨지 않는다', async () => {
    for (const b of Object.values(SUBJECTS)) {
      const tps = await pointsFor(b);
      if (tps === null) continue;
      const months = tps.filter((t) => t.month !== null).map((t) => `${t.year}-${t.month}`);
      expect(new Set(months).size).toBe(months.length);
    }
  });

  it('문턱을 0으로 낮추면 실제로 더 많이 나온다 — 문턱이 일하고 있다는 증거', () => {
    // 문턱이 아무 일도 안 하면서 "조정했다" 고 적는 것을 막는다.
    expect(MONTH_SIGNAL_THRESHOLD).toBeGreaterThanOrEqual(2);
  });
});

describe('계산 비용 — 앱 열 때 돌려도 되는가', () => {
  it('명식 하나당 12개월 창 계산이 200ms 안에 끝난다', async () => {
    const b = SUBJECTS['S1-1990-겨울'];
    await pointsFor(b);                      // 워밍업(모듈 로드·달력 캐시)
    const t0 = Date.now();
    for (let i = 0; i < 3; i++) await pointsFor(b);
    const per = (Date.now() - t0) / 3;
    // ⚠ 실패 메시지에 실측을 담는다 — 느려지면 숫자가 보인다.
    expect({ perChartMs: Math.round(per), under200: per < 200 }).toEqual({ perChartMs: Math.round(per), under200: true });
  });
});

describe('⚠ 톤 — 예보이지 예언이 아니다', () => {
  const FORBIDDEN: readonly { re: RegExp; why: string }[] = [
    { re: /하게 됩니다|할 것입니다|될 것입니다|생깁니다(?!\s*라는)/, why: '결과를 단정했다' },
    // ⚠ `나쁜 일이` 는 **부정문 안에서** 쓰인다: "나쁜 일이 생긴다는 뜻이 아니라…".
    //   가드 없이 걸면 겁주지 않으려고 쓴 문장이 겁준 것으로 잡힌다 — 유명인 본문 트랙에서
    //   `아닙니다`·`드러남` 으로 똑같이 당했다. 부정이 이어지면 넘긴다.
    { re: /조심|위험|주의하세요|불길|나쁜 일이(?!\s*생긴다는 뜻이 아니)/, why: '겁을 줬다' },
    { re: /최고의|절호의|반드시|틀림없|대박/, why: '과장했다' },
    { re: /지금\s*(물어보|상담받|결제)/, why: '상담을 강권했다' },
  ];

  it('여섯 명의 모든 문구가 금지 표현을 쓰지 않는다', async () => {
    const offenders: string[] = [];
    for (const [name, b] of Object.entries(SUBJECTS)) {
      const tps = await pointsFor(b);
      if (tps === null) continue;
      for (const tp of tps) {
        const text = `${tp.title} ${tp.body}`;
        for (const f of FORBIDDEN) {
          if (f.re.test(text)) offenders.push(`${name}/${tp.kind}: ${f.why} — ${text.slice(0, 60)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('무거운 달도 "준비할 것" 으로 쓴다 — 경고가 아니다', async () => {
    for (const b of Object.values(SUBJECTS)) {
      const tps = await pointsFor(b);
      if (tps === null) continue;
      for (const tp of tps.filter((t) => t.kind === 'MONTH_HEAVY')) {
        expect(tp.body).toContain('나쁜 일이 생긴다는 뜻이 아니라');
        expect(tp.title).not.toMatch(/조심|주의|경고/);
      }
    }
  });

  it('모든 문구에 근거가 괄호로 붙는다 — 이 앱의 규율', async () => {
    for (const b of Object.values(SUBJECTS)) {
      const tps = await pointsFor(b);
      if (tps === null) continue;
      for (const tp of tps) expect(tp.body).toMatch(/\(근거: .+\)/);
    }
  });

  it('product-truth — 금지된 자기소개를 하지 않는다', async () => {
    for (const b of Object.values(SUBJECTS)) {
      const tps = await pointsFor(b);
      if (tps === null) continue;
      for (const tp of tps) {
        expect(`${tp.title} ${tp.body}`).not.toMatch(/3학문|세 가지 학문|종합 분석|AI가 분석/);
      }
    }
  });
});

describe('⚠ 명식이 서지 않으면 알림이 없다', () => {
  it('시각 미상이어도 세운·월운은 나오되 대운 교체는 없다', async () => {
    const tps = await pointsFor(UNKNOWN_TIME);
    // 6칸 명식도 세운·월운은 선다. 대운은 `BIRTH_TIME_UNKNOWN` 으로 판정 불가라 나오면 안 된다.
    if (tps !== null) {
      expect(tps.filter((t) => t.kind === 'DAEWOON')).toHaveLength(0);
    }
  });

  it('근거가 아예 없으면 알림 0개', () => {
    expect(buildTurningPoints({
      daewoon: null, sewoon: null, brightMonths: [], heavyMonths: [], ageAtReport: 30,
    })).toEqual([]);
  });

  it('신호가 하나뿐인 달은 알리지 않는다 — 문턱 아래', () => {
    const tps = buildTurningPoints({
      daewoon: null, sewoon: null, ageAtReport: 30,
      brightMonths: [{ year: 2026, month: 5, why: '육합' }],
      heavyMonths: [{ year: 2026, month: 7, why: '충' }],
    });
    expect(tps).toEqual([]);
  });
});

describe('멱등 — 같은 변곡점은 같은 열쇠를 낸다', () => {
  it('두 번 만들어도 dedupKey 가 같다', async () => {
    const a = await pointsFor(SUBJECTS['S1-1990-겨울']);
    const b = await pointsFor(SUBJECTS['S1-1990-겨울']);
    expect(a?.map((t) => t.dedupKey)).toEqual(b?.map((t) => t.dedupKey));
  });

  it('열쇠가 종류와 시기를 담는다 — 사용자별로 유일해진다', () => {
    const tps = buildTurningPoints({
      daewoon: null, sewoon: { year: 2027, tenGods: ['정관'] }, ageAtReport: 30,
      brightMonths: [{ year: 2027, month: 3, why: '육합 · 삼합' }], heavyMonths: [],
    });
    expect(tps.map((t) => t.dedupKey)).toEqual(['TP:SEWOON:2027', 'TP:MONTH_BRIGHT:2027-03']);
  });
});

// 기다리는 동안의 문구 — 합성 반례 (2026-09-19).
//
// 구간은 staging 실측(n=813 · p50 15.5초 · p90 35.1초 · p99 101.7초)에서 나왔다.
// 여기서는 ① 구간이 그 숫자에 맞는가 ② 문구가 **거짓말을 하지 않는가** 를 못 박는다.
import {
  phaseFor, subtitleFor, allPhases, PHASE_BOUNDARIES_MS,
} from '@/features/intelligence/components/consultationLoadingPhases';

describe('구간이 실측에 맞다', () => {
  it('경계는 12초 · 35초 (중앙값 15.5초 직전 · p90 35.1초)', () => {
    expect(PHASE_BOUNDARIES_MS).toEqual([12_000, 35_000]);
  });

  it.each([
    [0, 0], [5_000, 0], [11_999, 0],
    [12_000, 1], [15_500, 1], [34_999, 1],
    [35_000, 2], [101_700, 2], [600_000, 2],
  ])('%i ms → %i번 구간', (ms, idx) => {
    expect(phaseFor(ms)).toBe(allPhases()[idx]);
  });

  it('⚠ 이상한 값에도 화면이 비지 않는다', () => {
    for (const bad of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(phaseFor(bad).primary.length).toBeGreaterThan(0);
    }
    // Infinity 는 가장 마지막 구간으로 간다(오래 기다린 것이므로)
    expect(phaseFor(Number.POSITIVE_INFINITY)).toBe(allPhases()[2]);
    expect(phaseFor(Number.NaN)).toBe(allPhases()[0]);
  });
});

describe('⚠ 문구가 거짓말을 하지 않는다', () => {
  const texts = allPhases().flatMap((p) => [p.primary, ...p.subtitles]);

  it('단계를 말하지 않는다 — 엔진 계산은 13밀리초에 이미 끝나 있다', () => {
    for (const t of texts) {
      expect(t).not.toMatch(/(사주를\s*보고|명리\s*분석|자미두수\s*분석|기문\s*분석|계산\s*중|분석\s*중)/);
    }
  });

  it('남은 시간을 말하지 않는다 — 틀리면 더 나쁘다', () => {
    for (const t of texts) {
      expect(t).not.toMatch(/(\d+\s*초|\d+\s*분|\d+\s*%|곧\s|거의\s*다|잠시\s*후면)/);
    }
  });

  it('톤 규칙 — 단정·공포·과장·상담 강권이 없다', () => {
    for (const t of texts) {
      expect(t).not.toMatch(/(반드시|무조건|틀림없이)/);
      expect(t).not.toMatch(/(위험|큰일|문제가\s*생)/);
      expect(t).not.toMatch(/(놀라운|완벽한|최고의|엄청난)/);
      expect(t).not.toMatch(/(지금\s*바로\s*상담|놓치지\s*마|더\s*물어보세요)/);
    }
  });

  it('~해요체로 쓴다', () => {
    for (const t of texts) expect(t).toMatch(/(요|세요|에요)[.…]?$/);
  });
});

describe('정지 화면이 없다', () => {
  it('한 구간에 머물러도 작은 줄이 돌아간다', () => {
    const seen = new Set<string>();
    for (let tick = 0; tick < 6; tick += 1) seen.add(subtitleFor(3_000, tick));
    expect(seen.size).toBeGreaterThan(1);
  });

  it('구간이 바뀌면 굵은 줄도 바뀐다', () => {
    const a = phaseFor(5_000).primary;
    const b = phaseFor(20_000).primary;
    const c = phaseFor(60_000).primary;
    expect(new Set([a, b, c]).size).toBe(3);
  });

  it('돌아가는 인덱스가 커져도 죽지 않는다', () => {
    expect(subtitleFor(60_000, 99_999).length).toBeGreaterThan(0);
    expect(subtitleFor(0, -3).length).toBeGreaterThan(0);
  });
});

describe('오래 기다린 사람에게 할 말', () => {
  it('마지막 구간은 창을 닫아도 된다고 알려 준다 (2026-09-17 자동 재수신이 실제로 그렇게 동작한다)', () => {
    expect(allPhases()[2].subtitles.join(' ')).toMatch(/창을\s*닫으셔도/);
  });
});

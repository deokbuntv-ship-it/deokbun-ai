// 유명인 명식 스냅샷 — 프로즌 엔진을 실제로 돌린다 (mock 없음).
//
// ⚠ 이 파일이 지키는 것: **F3 = C 수준을 넘지도 모자라지도 않는다.**
//   담아야 할 것 — 원국 4주 · 십성 · 지장간 · 오행 개수
//   담으면 안 되는 것 — **대운·세운.** 담기는 순간 언젠가 노출되고, 노출되면 명식 해설이 아니라
//   특정 인물의 시기 예측이 된다. (b) 프레이밍을 고른 이유가 그것이라 계약으로 박는다.
import { createHash } from 'crypto';

import { buildFamousChart } from '../famousChart';

const deps = {
  digestProvider: {
    async sha256Utf8(s: string) {
      return createHash('sha256').update(s, 'utf8').digest('hex');
    },
  },
};

const birth = (over: Record<string, unknown> = {}) =>
  ({
    displayName: '예시', gender: 'female', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '6', birthDay: '21',
    birthTimeAccuracy: 'exact', birthHour: '13', birthMinute: '20',
    approximateTimePeriod: null, birthPlace: '서울', ...over,
  }) as never;

describe('명식 스냅샷 — 시각을 아는 경우', () => {
  it('4주가 모두 서고 8칸이 관측된다', async () => {
    const r = await buildFamousChart(birth(), deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const s = r.snapshot;
    expect(s.hourKnown).toBe(true);
    expect(s.pillars.hour).not.toBeNull();
    expect(s.observedSlots).toBe(8);
    for (const p of [s.pillars.year, s.pillars.month, s.pillars.day]) {
      expect(p.stem.hangul).toMatch(/^[갑을병정무기경신임계]$/);
      expect(p.branch.hangul).toMatch(/^[자축인묘진사오미신유술해]$/);
      expect(p.branch.hiddenStems.length).toBeGreaterThan(0);
    }
  });

  it('일간에는 십성이 없다 — 자기 자신이 기준이기 때문', async () => {
    const r = await buildFamousChart(birth(), deps);
    if (!r.ok) throw new Error('chart failed');
    expect(r.snapshot.pillars.day.stem.tenGod).toBeNull();
    expect(r.snapshot.pillars.year.stem.tenGod).not.toBeNull();
  });

  it('오행 개수가 5종이고 합이 관측 칸 수와 같다', async () => {
    const r = await buildFamousChart(birth(), deps);
    if (!r.ok) throw new Error('chart failed');
    const counts = r.snapshot.elementCounts;
    expect(counts).toHaveLength(5);
    expect(counts.map((c) => c.element).sort()).toEqual(['금', '목', '수', '토', '화']);
    expect(counts.reduce((n, c) => n + c.count, 0)).toBe(r.snapshot.observedSlots);
  });

  it('한글 라벨은 엔진의 표시 라벨을 그대로 쓴다 — 여기서 짓지 않는다', async () => {
    const r = await buildFamousChart(birth(), deps);
    if (!r.ok) throw new Error('chart failed');
    const tenGods = [
      r.snapshot.pillars.year.stem.tenGod,
      ...r.snapshot.pillars.month.branch.hiddenStems.map((h) => h.tenGod),
    ].filter(Boolean);
    const KNOWN = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
    for (const g of tenGods) expect(KNOWN).toContain(g);
  });
});

describe('⚠ 시각을 모르는 경우 — 유명인에게 가장 흔한 입력', () => {
  const UNKNOWN = { birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null };

  it('경계일이 아니면 명식이 선다 — 시주만 없다', async () => {
    const r = await buildFamousChart(birth(UNKNOWN), deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.snapshot.hourKnown).toBe(false);
    expect(r.snapshot.pillars.hour).toBeNull();
    expect(r.snapshot.observedSlots).toBe(6);
    expect(r.snapshot.pillars.day.stem.hangul).toMatch(/^[갑을병정무기경신임계]$/);
  });

  it('⚠ 대략적인 시간대도 계산상 모름과 같다 — 엔진이 EXACT 만 시각으로 본다', async () => {
    const approx = await buildFamousChart(
      birth({ birthTimeAccuracy: 'approximate', birthHour: null, birthMinute: null, approximateTimePeriod: 'morning' }),
      deps,
    );
    if (!approx.ok) throw new Error('chart failed');
    expect(approx.snapshot.hourKnown).toBe(false);
    expect(approx.snapshot.observedSlots).toBe(6);
  });

  it('⚠⚠ 절기 경계일 + 시각 모름 → 명식이 서지 않는다 (typed 실패, 예외 아님)', async () => {
    // 1996-10-08 = 寒露 경계일. 시각이 없으면 월주가 두 후보라 엔진이 확정을 거부한다.
    const r = await buildFamousChart(
      birth({ birthYear: '1996', birthMonth: '10', birthDay: '8', ...UNKNOWN }),
      deps,
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.reason).toBe('CHART_UNAVAILABLE');
  });
});

describe('⚠⚠ 스냅샷에 대운·세운이 없다 — 이 단언이 이 파일의 존재 이유다', () => {
  it('직렬화한 스냅샷 어디에도 시기 관련 키가 없다', async () => {
    const r = await buildFamousChart(birth(), deps);
    if (!r.ok) throw new Error('chart failed');
    const json = JSON.stringify(r.snapshot);
    for (const forbidden of ['대운', '세운', 'daewoon', 'luckPillar', 'majorFortune', 'annual', 'timing']) {
      expect(json.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
    // 담아야 할 것은 확실히 있다 (비공허성).
    expect(json).toContain('hiddenStems');
    expect(json).toContain('elementCounts');
    expect(json).toContain('dayMaster');
  });

  it('12운성·12신살은 엔진에 없어서 담지 않는다 — 만들면 교리 창작이다', async () => {
    const r = await buildFamousChart(birth(), deps);
    if (!r.ok) throw new Error('chart failed');
    const json = JSON.stringify(r.snapshot);
    for (const absent of ['운성', '신살', '역마', '도화', '화개']) {
      expect(json).not.toContain(absent);
    }
  });
});

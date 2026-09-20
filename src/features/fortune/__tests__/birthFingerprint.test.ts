// GAP-04 — 출생정보를 고치면 저장된 운세가 다시 만들어지는가 (2026-09-21 합성 반례).
//
// 고치기 전: `daily_fortunes` · `monthly_fortunes` 가 (사용자 · 대상 · 날짜 · 등급 · 판)으로만 저장돼,
// 출생정보를 고쳐도 그 날짜의 저장본이 그대로 나왔다. 저장 열쇠에 출생정보 지문을 붙여 막는다.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  birthFingerprint,
  canonicalFortuneVersion,
  canonicalFortuneVersionLike,
} from '@/features/fortune/birthFingerprint';

const BASE = {
  displayName: '나',
  gender: 'male' as const,
  calendarType: 'solar' as const,
  lunarMonthType: null,
  birthYear: '1990',
  birthMonth: '7',
  birthDay: '15',
  birthTimeAccuracy: 'exact' as const,
  birthHour: '10',
  birthMinute: '30',
  approximateTimePeriod: null,
  birthPlace: '서울',
};

describe('출생정보 지문 — 합성 반례', () => {
  it('변경이 없으면 같은 열쇠다 → 캐시를 쓴다 (같은 날 두 번 요청해도 한 번만 만든다)', () => {
    expect(canonicalFortuneVersion('today.v1', BASE)).toBe(canonicalFortuneVersion('today.v1', { ...BASE }));
  });

  it.each([
    ['생년', { birthYear: '1991' }],
    ['생월', { birthMonth: '8' }],
    ['생일', { birthDay: '16' }],
    ['시', { birthHour: '11' }],
    ['분', { birthMinute: '31' }],
    ['시각 정확도', { birthTimeAccuracy: 'unknown' as const }],
    ['대략 시간대', { approximateTimePeriod: 'morning' as unknown as null }],
    ['달력 종류', { calendarType: 'lunar' as const }],
    ['윤달 여부', { lunarMonthType: 'leap' as unknown as null }],
    ['성별', { gender: 'female' as const }],
  ])('%s 을 바꾸면 열쇠가 달라진다 → 새로 만든다', (_label, patch) => {
    expect(canonicalFortuneVersion('today.v1', { ...BASE, ...patch }))
      .not.toBe(canonicalFortuneVersion('today.v1', BASE));
  });

  it('이름 · 출생지만 바꾸면 열쇠가 그대로다 — 계산에 쓰이지 않으므로 다시 만들지 않는다(비용)', () => {
    expect(canonicalFortuneVersion('today.v1', { ...BASE, displayName: '다른 이름', birthPlace: '부산' }))
      .toBe(canonicalFortuneVersion('today.v1', BASE));
  });

  it('오늘과 이달은 서로 다른 열쇠 공간을 쓴다', () => {
    expect(canonicalFortuneVersion('today.v1', BASE)).not.toBe(canonicalFortuneVersion('monthly.v1', BASE));
  });

  it('열쇠는 판 번호로 시작하고 128자를 넘지 않는다 (semantic_version 칸 제한)', () => {
    const v = canonicalFortuneVersion('today.v1', BASE);
    expect(v.startsWith('today.v1#')).toBe(true);
    expect(v.length).toBeLessThanOrEqual(128);
  });

  it('출생정보가 비어 있어도 값을 만든다 (빈 칸은 `_`)', () => {
    expect(birthFingerprint(null)).toBe('_-_-_-_-_-_-_-_-_-_');
  });

  it('우편함 검색 모양은 지문이 붙기 전 행도 잡는다 (지난 운세가 사라지면 안 된다)', () => {
    const like = canonicalFortuneVersionLike('today.v1');
    expect(like).toBe('today.v1%');
    // SQL LIKE 의미로 확인: 옛 행('today.v1')과 새 행('today.v1#…') 둘 다 접두사로 잡힌다.
    for (const stored of ['today.v1', canonicalFortuneVersion('today.v1', BASE)]) {
      expect(stored.startsWith(like.slice(0, -1))).toBe(true);
    }
  });
});

describe('앱과 서버가 같은 열쇠를 쓴다', () => {
  it('Edge 가 오늘 · 이달 저장 열쇠를 지문과 함께 만든다', () => {
    const edge = readFileSync(join(process.cwd(), 'supabase', 'functions', 'chat', 'index.ts'), 'utf8');
    expect(edge).toContain('canonicalFortuneVersion(TODAY_CANONICAL_VERSION, authority.birthInfo)');
    expect(edge).toContain('canonicalFortuneVersion(MONTHLY_CANONICAL_VERSION, authority.birthInfo)');
  });

  it('서버 번들이 그 함수를 내보낸다 (Edge 가 앱과 같은 코드를 쓴다)', () => {
    const bundle = readFileSync(
      join(process.cwd(), 'supabase', 'functions', 'chat', '_server', 'serverBundle.mjs'), 'utf8',
    );
    expect(bundle).toContain('canonicalFortuneVersion');
  });

  it('앱의 오늘 · 이달 조회가 지문 열쇠로 찾는다', () => {
    for (const rel of [
      join('src', 'features', 'today', 'services', 'todayFortuneService.ts'),
      join('src', 'features', 'monthly', 'services', 'monthlyFortuneService.ts'),
    ]) {
      const source = readFileSync(join(process.cwd(), rel), 'utf8');
      expect(source).toContain('canonicalFortuneVersion(');
      expect(source).toContain('canonicalFortuneVersionLike(');
      // 캐시 조회에 출생정보를 넘긴다 (넘기지 않으면 옛 저장본을 쓴다)
      expect(source).toMatch(/input\.birthInput\)/);
    }
  });
});

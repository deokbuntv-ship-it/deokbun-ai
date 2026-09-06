// 절기 경계일 게이트 — the judgment behind the registration warning and the Edge's
// AMBIGUOUS_BOUNDARY_DATE_TIME_REQUIRED reason code.
//
// The anchor case is REG4-SUBJ-10 from the V8 Blind-84 run: 1996-10-08 with an unknown birth time was
// 寒露 (08:18:42 KST), so the 월주 has two candidates and all 7 of that subject's consultations failed.
import fs from 'fs';
import path from 'path';

import {
  isSolarTermBoundaryTimeRequired,
  BOUNDARY_NOTICE_TITLE,
  BOUNDARY_NOTICE_BODY_FORM,
  BOUNDARY_NOTICE_BODY_FORM_COMPATIBILITY,
  boundaryNoticeCompatibilityBody,
  type BirthBoundaryInput,
} from '@/features/consultation/birthBoundaryGate';
import { isCompleteBirthInfo } from '@/features/consultation/birthProfileValidation';
import { resolveWithKasiCalendar } from '@/features/interpretation';
import type { BirthInfoDraft } from '@/features/consultation/types/consultation';

const base: BirthBoundaryInput = {
  calendarType: 'solar',
  lunarMonthType: null,
  birthYear: '1996',
  birthMonth: '10',
  birthDay: '8',
  birthTimeAccuracy: 'unknown',
};

describe('isSolarTermBoundaryTimeRequired', () => {
  it('warns for 1996-10-08 with an unknown time (寒露 boundary date)', () => {
    expect(isSolarTermBoundaryTimeRequired(base)).toBe(true);
  });

  it('warns for the same date with an approximate time — approximate is not weaker than unknown', () => {
    expect(isSolarTermBoundaryTimeRequired({ ...base, birthTimeAccuracy: 'approximate' })).toBe(true);
  });

  it('does not warn for 1996-10-09 with an unknown time (no 節 on that date)', () => {
    expect(isSolarTermBoundaryTimeRequired({ ...base, birthDay: '9' })).toBe(false);
  });

  it('does not warn for the boundary date when the time is exact', () => {
    expect(isSolarTermBoundaryTimeRequired({ ...base, birthTimeAccuracy: 'exact' })).toBe(false);
  });

  it('warns on the LUNAR input that converts to the same solar boundary date', () => {
    // Derive the lunar date from the engine itself rather than hard-coding it.
    const resolved = resolveWithKasiCalendar({ year: 1996, month: 10, day: 8, calendar: 'GREGORIAN' });
    if (resolved.status !== 'RESOLVED') throw new Error('fixture date must resolve');
    const lunar = resolved.lunarDate;
    expect(
      isSolarTermBoundaryTimeRequired({
        calendarType: 'lunar',
        lunarMonthType: lunar.lunarMonthKind === 'LEAP' ? 'leap' : 'regular',
        birthYear: String(lunar.year),
        birthMonth: String(lunar.month),
        birthDay: String(lunar.day),
        birthTimeAccuracy: 'unknown',
      }),
    ).toBe(true);
  });

  it('does not warn on the lunar input one solar day later', () => {
    const resolved = resolveWithKasiCalendar({ year: 1996, month: 10, day: 9, calendar: 'GREGORIAN' });
    if (resolved.status !== 'RESOLVED') throw new Error('fixture date must resolve');
    const lunar = resolved.lunarDate;
    expect(
      isSolarTermBoundaryTimeRequired({
        calendarType: 'lunar',
        lunarMonthType: lunar.lunarMonthKind === 'LEAP' ? 'leap' : 'regular',
        birthYear: String(lunar.year),
        birthMonth: String(lunar.month),
        birthDay: String(lunar.day),
        birthTimeAccuracy: 'unknown',
      }),
    ).toBe(false);
  });

  it('fails open on incomplete or impossible input instead of warning', () => {
    expect(isSolarTermBoundaryTimeRequired(null)).toBe(false);
    expect(isSolarTermBoundaryTimeRequired({ ...base, birthYear: '' })).toBe(false);
    expect(isSolarTermBoundaryTimeRequired({ ...base, birthMonth: '13' })).toBe(false);
    expect(isSolarTermBoundaryTimeRequired({ ...base, birthYear: '1800' })).toBe(false); // outside 1970-2050
  });

  it('every 節 date in a year warns, and the day before/after does not', () => {
    // 1996's twelve 節 dates, from the engine's own attribution behaviour.
    const jieDays: readonly [number, number][] = [
      [1, 6], [2, 4], [3, 5], [4, 4], [5, 5], [6, 5],
      [7, 7], [8, 7], [9, 7], [10, 8], [11, 7], [12, 7],
    ];
    for (const [month, day] of jieDays) {
      const on = { ...base, birthMonth: String(month), birthDay: String(day) };
      expect(isSolarTermBoundaryTimeRequired(on)).toBe(true);
      // The day AFTER a 節 is never ambiguous (the next 節 is ~a month away).
      expect(isSolarTermBoundaryTimeRequired({ ...on, birthDay: String(day + 1) })).toBe(false);
    }
  });
});

// The two registration validators must agree: the gate is ADVISORY, so a boundary birth stays a COMPLETE
// profile — the warning must never turn into a silent save block.
describe('gate and completeness validator agree', () => {
  const draft = (over: Partial<BirthInfoDraft>): BirthInfoDraft => ({
    displayName: '테스트',
    gender: 'female',
    calendarType: 'solar',
    lunarMonthType: null,
    birthYear: '1996',
    birthMonth: '10',
    birthDay: '8',
    birthTimeAccuracy: 'unknown',
    birthHour: '',
    birthMinute: '',
    approximateTimePeriod: null,
    birthPlace: '서울',
    ...over,
  });

  it('a boundary-date profile is still COMPLETE (warning, not a block)', () => {
    const b = draft({});
    expect(isSolarTermBoundaryTimeRequired(b)).toBe(true);
    expect(isCompleteBirthInfo(b)).toBe(true);
  });

  it('an approximate boundary-date profile is still COMPLETE', () => {
    const b = draft({ birthTimeAccuracy: 'approximate', approximateTimePeriod: 'morning' });
    expect(isSolarTermBoundaryTimeRequired(b)).toBe(true);
    expect(isCompleteBirthInfo(b)).toBe(true);
  });

  it('an INCOMPLETE profile never produces a boundary warning', () => {
    const b = draft({ birthTimeAccuracy: null });
    expect(isCompleteBirthInfo(b)).toBe(false);
    expect(isSolarTermBoundaryTimeRequired(b)).toBe(false);
  });
});

// This project has no component-render harness, so the surfaces are held by a source contract — the same
// idiom the brand/UX suites use. It fails if a surface drops the notice or the approved copy is edited.
describe('the notice copy and its four surfaces', () => {
  const root = path.resolve(__dirname, '../../../..');
  const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

  it('the registration copy is the approved wording, unchanged', () => {
    expect(BOUNDARY_NOTICE_TITLE).toBe('이 날짜는 태어난 시각이 꼭 필요해요');
    expect(BOUNDARY_NOTICE_BODY_FORM).toBe(
      '선택하신 날은 사주의 달이 바뀌는 절기 경계일이라, 시각을 모르면 사주가 두 가지로 갈려 풀이를 드릴 수 없어요. '
      + '상담·오늘의 운세·월별 운세가 모두 이용되지 않습니다. '
      + '가족에게 태어난 시각을 확인해 보시고, 지금은 이대로 저장하셨다가 나중에 수정하셔도 됩니다.',
    );
  });

  it.each([
    ['src/app/birth-info.tsx', 'form'],
    ['src/features/consultation/components/BirthProfileForm.tsx', 'form'],
    ['src/app/today.tsx', 'surface'],
    ['src/app/monthly.tsx', 'surface'],
    ['src/app/(tabs)/index.tsx', 'surface'],
  ])('%s renders the shared notice in %s context from the shared gate', (file, context) => {
    const source = read(file);
    expect(source).toContain('isSolarTermBoundaryTimeRequired');
    expect(source).toContain('<BoundaryTimeNotice');
    expect(source).toContain(`context="${context}"`);
    // The judgment is never re-implemented at a call site.
    expect(source).not.toContain('AMBIGUOUS_UNKNOWN_TIME_ON_BOUNDARY_DATE');
  });

  it('the two registration forms keep the save action enabled — the gate never blocks', () => {
    // `showBoundaryWarning` must not appear inside either completeness expression.
    for (const file of ['src/app/birth-info.tsx', 'src/features/consultation/components/BirthProfileForm.tsx']) {
      const source = read(file);
      const validExpr = source.slice(
        source.indexOf('const isFormValid =') >= 0 ? source.indexOf('const isFormValid =') : source.indexOf('const valid ='),
      ).split(';')[0];
      expect(validExpr).not.toContain('showBoundaryWarning');
    }
  });
});

// ── 궁합 (2026-09-06) — 같은 판정, 다른 결과 ─────────────────────────────────────────────────────
//
// ⚠ 솔로 상담은 경계일에 DEGRADE 한다(명리가 안 서도 기문이 답한다). 궁합은 아니다 — pairwise 근거가
// 두 차트를 모두 요구한다. 그런데 서버는 실패하지 않는다: 실측(2026-09-06) 결과 두 차트가 다 없어도
// `ok:true` 로 답이 만들어지고 **12덕이 청구된다**. 그래서 궁합 표면은 경고가 아니라 **차단**한다.
describe('궁합 문안 — 결과가 다르므로 문장도 다르다', () => {
  it('궁합 문안은 궁합을 볼 수 없다고 분명히 말한다', () => {
    const body = boundaryNoticeCompatibilityBody(['박상대']);
    expect(body).toContain('박상대 님의');
    expect(body).toContain('궁합');
    expect(body).toMatch(/결과를 드릴 수 없어요/);
    // 재시도를 권하지 않는다 — 같은 정보로는 몇 번을 눌러도 같다.
    expect(body).not.toMatch(/다시 시도|잠시 후/);
  });

  it('이름이 하나든 둘이든 문장이 성립한다', () => {
    expect(boundaryNoticeCompatibilityBody(['조세영', '박상대'])).toContain('조세영 님과 박상대 님의');
    expect(boundaryNoticeCompatibilityBody([])).toContain('두 분 중 한 분의');
  });

  it('⚠ 본인 등록 문안(승인본)은 한 글자도 바뀌지 않았다', () => {
    expect(BOUNDARY_NOTICE_BODY_FORM).toContain('상담·오늘의 운세·월별 운세가 모두 이용되지 않습니다');
    expect(BOUNDARY_NOTICE_BODY_FORM).toContain('지금은 이대로 저장하셨다가 나중에 수정하셔도 됩니다');
  });

  it('궁합 상대 등록 문안은 상담/오늘/월별 대신 궁합을 말한다', () => {
    expect(BOUNDARY_NOTICE_BODY_FORM_COMPATIBILITY).toContain('이 분과의 궁합은 볼 수 없어요');
    expect(BOUNDARY_NOTICE_BODY_FORM_COMPATIBILITY).not.toContain('오늘의 운세');
    // 저장 자체는 여전히 권한다 — 사람은 남고 궁합만 못 본다.
    expect(BOUNDARY_NOTICE_BODY_FORM_COMPATIBILITY).toContain('저장');
  });
});

describe('궁합 표면 배선 — 판정은 공유 게이트에서만 온다', () => {
  const readSrc = (rel: string) => fs.readFileSync(path.resolve(process.cwd(), rel), 'utf8');

  it.each(['src/app/(tabs)/compatibility.tsx', 'src/app/compatibility-chat.tsx'])(
    '%s 는 공유 게이트로 판정하고 compatibility 문맥으로 안내한다',
    (rel) => {
      const src = readSrc(rel);
      expect(src).toContain('isSolarTermBoundaryTimeRequired');
      expect(src).toContain('context="compatibility"');
      expect(src).not.toContain('AMBIGUOUS_UNKNOWN_TIME_ON_BOUNDARY_DATE');
    },
  );

  it('⚠ 궁합은 경고가 아니라 차단이다 — 두 표면 모두 결제 경로를 실제로 잠근다', () => {
    expect(readSrc('src/app/(tabs)/compatibility.tsx')).toMatch(/disabled=\{[^}]*blockedByBoundary/);
    // 채팅 화면은 자동 전송·컴포저·후속칩이 모두 지나가는 send() 한 자리에서 막는다.
    const chat = readSrc('src/app/compatibility-chat.tsx');
    const body = chat.slice(chat.indexOf('const send = async'));
    const guardAt = body.indexOf('if (boundaryBlocked) return;');
    expect(guardAt).toBeGreaterThan(-1);
    expect(guardAt).toBeLessThan(body.indexOf('await '));
  });

  it('본인 등록 화면은 궁합 상대일 때만 문안을 바꾼다 — 본인 경로는 그대로', () => {
    expect(readSrc('src/app/birth-info.tsx')).toContain('forCompatibilityTarget={fromCompatibility && !isSelf}');
  });
});

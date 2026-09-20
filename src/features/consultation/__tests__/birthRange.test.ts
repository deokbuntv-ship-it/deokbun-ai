// 해외 출생지 · 1970년 이전 출생 — 사실만 말하는 안내 (2026-09-21 합성 반례).
//
// 2026-09-18 실측: 1970년 이전 출생은 상담을 빼고 **네 기능이 각각 다르게 막히고**, 그중 셋은 **틀린 까닭**
// ("태어난 시각을 확인해 주세요")을 보여 줬다. 시각을 고쳐도 안 되는 사람에게 시각을 고치라고 말하고 있었다.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  BIRTH_RANGE_NOTICE,
  OVERSEAS_BIRTH_NOTICE,
  SUPPORTED_BIRTH_YEAR_MAX,
  SUPPORTED_BIRTH_YEAR_MIN,
  birthRangeBlockedMessage,
  isBirthYearOutOfRange,
} from '@/features/consultation/birthRange';

describe('지원 범위 판정 — 양방향', () => {
  it.each([['1969'], ['1900'], ['2051'], [1969], [2051]])('범위 밖(%s)은 밖이라고 한다', (year) => {
    expect(isBirthYearOutOfRange(year as string | number)).toBe(true);
  });

  it.each([[String(SUPPORTED_BIRTH_YEAR_MIN)], ['1994'], [String(SUPPORTED_BIRTH_YEAR_MAX)], [1994]])(
    '범위 안(%s)은 안이라고 한다', (year) => {
      expect(isBirthYearOutOfRange(year as string | number)).toBe(false);
    },
  );

  it('빈 값 · 이상한 값은 범위 밖으로 보지 않는다 (그건 다른 문제다)', () => {
    for (const bad of ['', '   ', 'abcd', null, undefined]) {
      expect(isBirthYearOutOfRange(bad as string | null)).toBe(false);
    }
  });
});

describe('문구 — 사실만 적는다 (톤 규칙)', () => {
  it('범위 안내는 계산하는 기간을 말한다', () => {
    expect(BIRTH_RANGE_NOTICE).toBe('덕분이는 1970년부터 2050년 사이에 태어난 분의 사주를 계산해요.');
  });

  it('해외 안내는 한국 시간으로 계산한다는 사실만 말한다', () => {
    expect(OVERSEAS_BIRTH_NOTICE).toBe('입력하신 날짜와 시각은 한국 시간 기준으로 계산해요.');
  });

  it.each([BIRTH_RANGE_NOTICE, OVERSEAS_BIRTH_NOTICE, birthRangeBlockedMessage('리포트')])(
    '"정확도" · 겁주는 말 · 권유를 쓰지 않는다: %s', (text) => {
      for (const forbidden of ['정확도', '주의하', '위험', '조심하세요', '지금 바로', '놓치지']) {
        expect(text).not.toContain(forbidden);
      }
    },
  );

  it('막혔을 때 문구는 까닭과 덕 미차감을 함께 말한다', () => {
    const msg = birthRangeBlockedMessage('리포트');
    expect(msg).toContain('1970년부터 2050년');
    expect(msg).toContain('덕은 차감되지 않았어요');
  });
});

describe('화면 배선 — 네 곳이 사실 문구를 쓴다', () => {
  const read = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

  it.each([
    ['오늘의 운세', join('src', 'app', 'today.tsx')],
    ['이번 달 운세', join('src', 'app', 'monthly.tsx')],
    ['프리미엄 리포트', join('src', 'app', 'premium.tsx')],
    ['궁합', join('src', 'app', 'compatibility-chat.tsx')],
  ])('%s 화면이 지원 범위를 따로 알아본다', (_label, rel) => {
    const source = read(rel);
    expect(source).toContain('isBirthYearOutOfRange');
    expect(source).toContain('BIRTH_RANGE_NOTICE');
  });

  it.each([
    ['정보 수정 화면', join('src', 'app', 'birth-info.tsx')],
    ['온보딩 입력 화면', join('src', 'features', 'consultation', 'components', 'BirthProfileForm.tsx')],
  ])('%s 이 [대한민국 / 해외] 를 고르게 하고 범위 안내를 보여 준다', (_label, rel) => {
    const source = read(rel);
    expect(source).toContain('OVERSEAS_BIRTH_NOTICE');
    expect(source).toContain('BIRTH_RANGE_NOTICE');
    expect(source).toContain('birthCountry');
    // 장소가 계산에 쓰이는 것처럼 읽히던 도움말은 화면에서 뺐다(주석에는 왜 뺐는지 남아 있다).
    expect(source).not.toContain('helperText="도시 수준으로');
    expect(source).not.toContain('helperText="도시 수준으로 입력해도 괜찮아요."');
  });

  it('고른 값은 저장되지만 **계산에는 들어가지 않는다** (지문에 없다)', () => {
    const fingerprint = read(join('src', 'features', 'fortune', 'birthFingerprint.ts'));
    expect(fingerprint).not.toContain('birthCountry');
    const mapper = read(join('src', 'features', 'manse', 'services', 'birthInputMapper.ts'));
    expect(mapper).not.toContain('birthCountry');
  });
});

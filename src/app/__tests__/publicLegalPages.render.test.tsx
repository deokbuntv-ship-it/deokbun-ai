// 공개 문서 6개 — 로그인 없이 열리는 화면 (2026-09-17).
//
// 왜 화면에서 보는가. 2026-09-15 실사이트에서 이 문서들이 전부 `/login` 으로 튕겼다. 원인은 화면이 아니라
// 게이트 목록(`entryRouting.ts` PUBLIC_PREFIXES)이었고, 그쪽 반례는 `entryRouting.test.ts` 에 있다. 여기서는
// **화면 자체가 인증 없이 렌더되고, 스토어 제출과 온보딩 동의에 필요한 문장이 실제로 보이는지**를 잰다.
// 소스 상수만 읽으면 "렌더 도중 죽는 화면"과 "문구가 빠진 화면"을 못 본다.
//
// 계정 삭제 안내(/account-deletion)는 `accountDeletionGuide.render.test.tsx` 가 이미 같은 방식으로 본다.
import { render, act } from '@testing-library/react';

import AiNoticeScreen from '../ai-notice';
import DukPolicyScreen from '../duk-policy';
import MinorPolicyScreen from '../minor-policy';
import PrivacyPolicyScreen from '../privacy-policy';
import RefundPolicyScreen from '../refund-policy';
import TermsOfServiceScreen from '../terms-of-service';

const renderScreen = async (Screen: () => React.JSX.Element) => {
  const r = render(<Screen />);
  await act(async () => {});
  return document.body.textContent ?? '';
};

// [화면, 제목, 그 화면에서 반드시 보여야 하는 문장]
const PAGES: [string, () => React.JSX.Element, RegExp, RegExp][] = [
  ['서비스 이용약관', TermsOfServiceScreen, /서비스 이용약관/, /6\. 회원 탈퇴\(계정 삭제\)/],
  ['개인정보 처리방침', PrivacyPolicyScreen, /개인정보 처리방침/, /6\. 이용자의 권리/],
  ['미성년자 이용 및 결제 안내', MinorPolicyScreen, /미성년자 이용 및 결제 안내/, /연령 기준/],
  ['AI 생성 콘텐츠 안내', AiNoticeScreen, /AI 생성 콘텐츠 안내/, /AI를 어떻게 활용하나요\?/],
  ['덕 유료 이용 정책', DukPolicyScreen, /덕\(Duk\) 유료 이용 정책/, /덕의 종류/],
  ['환불·청약철회 정책', RefundPolicyScreen, /환불·청약철회 정책/, /적용 범위/],
];

describe('공개 문서 6개 — 인증 목 없이 렌더된다', () => {
  it.each(PAGES)('%s — 제목과 핵심 절이 보인다', async (_name, Screen, title, section) => {
    const text = await renderScreen(Screen);
    expect(text).toMatch(title);
    expect(text).toMatch(section);
  });

  it.each(PAGES)('%s — 로그인을 요구하지 않는다', async (_name, Screen) => {
    const text = await renderScreen(Screen);
    expect(text).not.toMatch(/로그인이 필요|로그인해 주세요|다시 로그인|카카오로 계속하기/);
  });
});

describe('⚠ 온보딩 동의에 필요한 문장 — 탈퇴 경로가 처리방침에 있다', () => {
  it('처리방침이 탈퇴 경로(MY → 계정 탈퇴)와 계정 삭제 안내 주소를 함께 적는다', async () => {
    const text = await renderScreen(PrivacyPolicyScreen);
    expect(text).toMatch(/\[MY\] → \[계정 탈퇴\]/);
    expect(text).toMatch(/account-deletion/);
  });
});

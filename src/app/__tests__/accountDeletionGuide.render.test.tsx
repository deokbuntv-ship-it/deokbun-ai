// 계정 삭제 안내 (/account-deletion) — **구글 플레이에 제출하는 공개 URL.**
//
// 여기서 잘못되면 스토어 제출이 막히거나(요건 미충족), 이용자가 삭제 방법을 못 찾는다.
// 소스만 읽어서는 못 보는 것 셋을 화면에서 본다:
//   ① 로그인 없이 열리는가 — 인증 목이 하나도 없는 상태로 렌더된다
//   ② 요구된 네 가지가 실제로 화면에 있는가 (앱 내 경로 · 앱 없을 때 · 삭제 범위 · 보존 · 기간)
//   ③ ⚠ **입력 폼이 없는가** — 익명 쓰기 경로에 레이트 리밋이 없다(M10). 폼이 생기면 그 순간
//      스팸 창구가 된다. 이 단언이 그것을 막는다.
import { render, screen, act } from '@testing-library/react';

import { setViewport, fixedWidthsOver } from '@/test-support/renderAudit';

import AccountDeletionGuideScreen from '../account-deletion';
import { ACCOUNT_DELETION_CONTACT } from '@/features/legal/accountDeletionGuide';

const renderPage = async () => {
  const r = render(<AccountDeletionGuideScreen />);
  await act(async () => {});
  return r;
};

describe('계정 삭제 안내 — 로그인 없이 열린다', () => {
  it('인증 목 없이 렌더된다 — 리다이렉트도 로그인 요구도 없다', async () => {
    await renderPage();
    const text = document.body.textContent ?? '';
    expect(text).toContain('계정 삭제 안내');
    expect(text).not.toMatch(/로그인이 필요|로그인해 주세요|다시 로그인/);
  });
});

describe('⚠ 구글 플레이가 요구하는 네 가지가 화면에 있다', () => {
  it.each([
    ['앱 내 삭제 경로', /MY/],
    ['앱 내 삭제 경로 — 버튼 이름', /계정 탈퇴/],
    ['앱이 없을 때 요청처', new RegExp(ACCOUNT_DELETION_CONTACT.replace('.', '\\.'))],
    ['가입 수단을 함께 적으라는 안내', /카카오|네이버|구글|애플/],
    ['삭제 범위', /상담 기록|보유 덕/],
    ['보존 항목', /전자상거래/],
    ['처리 기간', /즉시 처리/],
  ])('%s', async (_label, re) => {
    await renderPage();
    expect(document.body.textContent ?? '').toMatch(re);
  });
});

describe('⚠ 만들지 않기로 한 것 — 이 단언이 곧 규칙이다', () => {
  it('입력 폼이 없다 (익명 쓰기 경로 + 레이트 리밋 없음, M10)', async () => {
    const { container } = await renderPage();
    expect(container.querySelectorAll('input')).toHaveLength(0);
    expect(container.querySelectorAll('textarea')).toHaveLength(0);
    expect(container.querySelectorAll('form')).toHaveLength(0);
  });

  it('메일 발송에 기대지 않는다 — 우리가 보내는 것이 아니라 받는 것이다', async () => {
    await renderPage();
    const text = document.body.textContent ?? '';
    expect(text).toMatch(/요청해 주세요|요청합니다/);
    expect(text).not.toMatch(/메일을 보내 드립니다|확인 메일이 발송/);
  });
});

describe('360dp 에서 읽힌다', () => {
  it('뷰포트보다 넓은 고정 폭이 없다', async () => {
    setViewport(360, 800);
    const { container } = await renderPage();
    expect(fixedWidthsOver(container, 360)).toEqual([]);
  });
});

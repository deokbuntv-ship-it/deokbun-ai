// AI 처리 동의 화면 (애플 5.1.2(i)) — **동의 전에 무엇을 보는가**를 잰다.
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';

import {
  AI_CONSENT_CHECKBOX_LABEL,
  AI_CONSENT_PROCESSORS,
  AI_CONSENT_SENT_ITEMS,
} from '@/features/legal/aiProcessingConsent';
import { AiConsentSheet } from '@/features/legal/components/AiConsentSheet';

afterEach(cleanup);
const byLabel = (l: string) => document.querySelector(`[aria-label="${l}"]`) as HTMLElement | null;

const open = (onAgree: () => Promise<boolean> | boolean = () => true) =>
  render(<AiConsentSheet visible onClose={() => {}} onAgree={onAgree} />);

describe('동의 시트 — 세 가지를 다 보인다', () => {
  it('무엇을 보내는지', () => {
    open();
    for (const item of AI_CONSENT_SENT_ITEMS) expect(document.body.textContent).toContain(item);
  });

  it('⚠ 누구에게 — 업체명이 화면에 보인다', () => {
    open();
    for (const p of AI_CONSENT_PROCESSORS) {
      expect(document.body.textContent).toContain(p.name);
      expect(document.body.textContent).toContain(p.region);
    }
  });

  it('왜 보내는지, 그리고 동의하지 않아도 되는 것', () => {
    open();
    const t = document.body.textContent ?? '';
    expect(t).toMatch(/해석문/);
    expect(t).toMatch(/동의하지 않으셔도/);
    expect(t).toMatch(/철회/);
  });
});

describe('명시적 동의', () => {
  it('⚠ 체크박스 기본값은 미체크다', () => {
    open();
    // ⚠ 사람이 **보는 것**으로 잰다. react-native-web 은 Pressable 의 accessibilityState 를
    //   aria-checked 로 내보내지 않으므로, 속성을 보면 이 검사는 조용히 통과만 한다.
    expect(document.body.textContent).toContain('☐');
    expect(document.body.textContent).not.toContain('☑');
    fireEvent.click(byLabel(AI_CONSENT_CHECKBOX_LABEL) as HTMLElement);
    expect(document.body.textContent).toContain('☑');
  });

  it('⚠ 체크하기 전에는 동의가 저장되지 않는다', async () => {
    const onAgree = jest.fn(() => true);
    open(onAgree);
    fireEvent.click(byLabel('동의하고 계속') as HTMLElement);
    await act(async () => {});
    expect(onAgree).not.toHaveBeenCalled();
  });

  it('체크하고 누르면 저장된다', async () => {
    const onAgree = jest.fn(() => true);
    open(onAgree);
    fireEvent.click(byLabel(AI_CONSENT_CHECKBOX_LABEL) as HTMLElement);
    await act(async () => {
      fireEvent.click(byLabel('동의하고 계속') as HTMLElement);
    });
    expect(onAgree).toHaveBeenCalledTimes(1);
  });

  it('⚠ 저장이 실패하면 닫지 않고 그렇게 말한다', async () => {
    open(() => false);
    fireEvent.click(byLabel(AI_CONSENT_CHECKBOX_LABEL) as HTMLElement);
    await act(async () => {
      fireEvent.click(byLabel('동의하고 계속') as HTMLElement);
    });
    expect(document.body.textContent).toMatch(/저장하지 못했습니다/);
    expect(document.body.textContent).toMatch(/동의는 기록되지 않았습니다/);
  });

  it('"나중에" 가 있다 — 동의는 강제가 아니다', () => {
    open();
    expect(byLabel('나중에')).not.toBeNull();
  });

  it('접근성 — 체크박스 role 과 버튼 이름', () => {
    open();
    expect(byLabel(AI_CONSENT_CHECKBOX_LABEL)?.getAttribute('role')).toBe('checkbox');
    expect(byLabel('동의하고 계속')).not.toBeNull();
  });
});

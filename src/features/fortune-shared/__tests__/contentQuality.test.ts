// Content-quality guards — service-checklist tone + micro-task fabrication + advice-family collapse.
import { containsServiceChecklistTone, distinctAdviceFamilies, isSingleAdviceFamilyCollapse } from '../contentQuality';

describe('containsServiceChecklistTone', () => {
  it('flags finance/admin service-checklist phrasing (the Device-QA family)', () => {
    for (const bad of [
      '최근 30일간 지출 목록을 정리하세요',
      '영수증과 청구서를 확인하세요',
      '계좌 이체 시 수신자를 확인하세요',
      '카드 내역을 점검하세요',
      '자동이체를 조정하세요',
      '환불 절차를 진행하세요',
      '대출 신청을 검토하세요',
      '투자 비중을 축소하세요',
      '10분 동안 분류해보세요',
    ]) {
      expect(containsServiceChecklistTone(bad)).toBe(true);
    }
  });
  it('passes life-direction fortune phrasing', () => {
    for (const good of [
      '큰 금전 결정은 서두르기보다 조건을 한 번 더 살펴보세요',
      '오늘은 중요한 한 가지를 차분하게 마무리해보세요',
      '관계에서는 먼저 마음을 표현해볼 만합니다',
      '이미 정한 계획을 정돈하는 쪽이 편합니다',
    ]) {
      expect(containsServiceChecklistTone(good)).toBe(false);
    }
  });
});

describe('advice-family collapse', () => {
  it('detects when all sections reduce to one family (repetition failure)', () => {
    expect(
      isSingleAdviceFamilyCollapse([
        '지출을 정리하세요',
        '목록을 정리하는 게 좋습니다',
        '차분히 정리해보세요',
      ]),
    ).toBe(true);
  });
  it('passes when sections play distinct roles', () => {
    expect(
      isSingleAdviceFamilyCollapse([
        '이미 진행 중인 일을 정돈하기 좋습니다', // ORGANIZE
        '새로운 지출은 조금 신중하게 보세요', // (no single family covers all)
        '중요한 하나를 마무리해보세요',
      ]),
    ).toBe(false);
    expect(distinctAdviceFamilies(['정리', '확인', '천천히'])).toBe(3);
  });
});

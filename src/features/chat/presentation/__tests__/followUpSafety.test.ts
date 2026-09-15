import { isInScopeFollowUp, filterFollowUpsToScope } from '../followUpSafety';

// §16 — follow-ups must stay inside Deokbuni's 역학/상담 scope and never imply it performs legal/medical/
// investment professional services.
describe('follow-up scope guard', () => {
  it('keeps ordinary 사업/재물/연애/직장 운세 follow-ups', () => {
    for (const q of [
      '올해 사업 확장에 좋은 시기가 궁금해요',
      '동업이나 파트너 운도 봐주세요',
      '올해 돈이 가장 잘 들어오는 시기는 언제예요?',
      '올해 특히 조심해야 할 달이 있나요?',
      '새로운 인연을 만날 수 있을까요?',
      '이직에 좋은 시기가 언제예요?',
    ]) {
      expect(isInScopeFollowUp(q)).toBe(true);
    }
  });

  it('drops out-of-scope professional-service offers', () => {
    for (const q of [
      '지금 진행 중인 계약서·합의서 초안을 검토해 드릴까요?',
      '작성하신 약관을 검토해 드릴까요?',
      '소송을 진행하는 게 좋을까요?',
      '이 증상에 대한 진단을 받아볼까요?',
      '어떤 약을 복용하면 좋을지 알려드릴까요?',
      '어떤 종목을 매수하면 좋을까요?',
      '지금 주식 추천을 받아볼까요?',
    ]) {
      expect(isInScopeFollowUp(q)).toBe(false);
    }
  });

  it('filters a list, dropping only the out-of-scope items', () => {
    const out = filterFollowUpsToScope([
      '올해 재물운 흐름이 궁금해요',
      '계약서 초안을 검토해 드릴까요?',
      '연애운은 어떤가요?',
    ]);
    expect(out).toEqual(['올해 재물운 흐름이 궁금해요', '연애운은 어떤가요?']);
  });

  it('drops blanks and never throws on undefined', () => {
    expect(filterFollowUpsToScope(undefined)).toEqual([]);
    expect(filterFollowUpsToScope(['', '  '])).toEqual([]);
  });
});

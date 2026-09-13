// AI 답변 신고 UI — **앱을 벗어나지 않고** 신고할 수 있는가 (구글 AI 생성 콘텐츠 정책).
//
// ⚠ 정책이 요구하는 것은 "저장이 된다" 가 아니라 **사용자가 찾아서 누를 수 있다** 이다.
//   그래서 여기서 재는 것은 저장 경로가 아니라 **화면에 입구가 보이는가**다.
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';

import { AiReportSheet } from '@/features/intelligence/components/AiReportSheet';
import { UserFeedbackControl } from '@/features/intelligence/components/UserFeedbackControl';
import { REPORT_ACK_TEXT, REPORT_ENTRY_LABEL, REPORT_REASON_LABEL } from '@/features/intelligence/aiContentReport';

afterEach(cleanup);

const byLabel = (label: string) =>
  document.querySelector(`[aria-label="${label}"]`) as HTMLElement | null;

describe('신고 입구 — 답변마다 보인다', () => {
  it('⚠ 투표 전에도 보인다', () => {
    render(<UserFeedbackControl onReport={() => {}} />);
    expect(document.body.textContent).toContain(REPORT_ENTRY_LABEL);
  });

  it('⚠ 투표한 뒤에도 보인다 — 👍 를 누른 뒤 문제를 발견하는 일이 있다', () => {
    render(<UserFeedbackControl onSubmit={async () => {}} initialVerdict="helpful" onReport={() => {}} />);
    expect(document.body.textContent).toContain('피드백 고맙습니다');
    expect(document.body.textContent).toContain(REPORT_ENTRY_LABEL);
  });

  it('onReport 를 주지 않으면 입구를 그리지 않는다 (기존 화면 영향 없음)', () => {
    render(<UserFeedbackControl onSubmit={async () => {}} />);
    expect(document.body.textContent).not.toContain(REPORT_ENTRY_LABEL);
  });

  it('이미 신고한 답변은 "신고 접수됨" 으로 보이고 다시 눌리지 않는다', () => {
    const onReport = jest.fn();
    render(<UserFeedbackControl onReport={onReport} reported />);
    expect(document.body.textContent).toContain('신고 접수됨');
    const el = byLabel('신고 접수됨');
    expect(el).not.toBeNull();
    fireEvent.click(el as HTMLElement);
    expect(onReport).not.toHaveBeenCalled();
  });

  it('입구를 누르면 콜백이 불린다', () => {
    const onReport = jest.fn();
    render(<UserFeedbackControl onReport={onReport} />);
    fireEvent.click(byLabel(REPORT_ENTRY_LABEL) as HTMLElement);
    expect(onReport).toHaveBeenCalledTimes(1);
  });
});

describe('신고 시트', () => {
  const open = (onSubmit: (r: never, d: string) => Promise<'ok' | 'already' | 'auth' | 'failed'>) =>
    render(<AiReportSheet visible onClose={() => {}} onSubmit={onSubmit as never} />);

  it('사유 네 가지가 전부 보인다', () => {
    open(async () => 'ok');
    for (const label of Object.values(REPORT_REASON_LABEL)) {
      expect(document.body.textContent).toContain(label);
    }
  });

  it('선택 입력 칸과 개인정보 주의가 있다', () => {
    open(async () => 'ok');
    expect(byLabel('신고 상세 설명')).not.toBeNull();
    expect(document.body.textContent).toMatch(/개인정보는 적지 말아/);
  });

  it('⚠ 사유를 고르기 전에는 보내지 못한다', async () => {
    const onSubmit = jest.fn(async () => 'ok' as const);
    open(onSubmit as never);
    fireEvent.click(byLabel('신고 보내기') as HTMLElement);
    await act(async () => {});
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('사유를 고르고 보내면 접수 안내가 보인다', async () => {
    const onSubmit = jest.fn(async () => 'ok' as const);
    open(onSubmit as never);
    fireEvent.click(byLabel(REPORT_REASON_LABEL.harmful) as HTMLElement);
    await act(async () => {
      fireEvent.click(byLabel('신고 보내기') as HTMLElement);
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect((onSubmit.mock.calls as unknown as unknown[][])[0][0]).toBe('harmful');
    expect(document.body.textContent).toContain(REPORT_ACK_TEXT);
  });

  it('⚠ 저장이 실패하면 "받았습니다" 를 보이지 않는다', async () => {
    open((async () => 'failed') as never);
    fireEvent.click(byLabel(REPORT_REASON_LABEL.other) as HTMLElement);
    await act(async () => {
      fireEvent.click(byLabel('신고 보내기') as HTMLElement);
    });
    const text = document.body.textContent ?? '';
    expect(text).toContain('보내지 못했습니다');
    expect(text).toContain('신고는 저장되지 않았습니다');
    expect(text).not.toContain(REPORT_ACK_TEXT);
  });

  it('이미 신고한 답변이면 그렇게 말한다 — 실패가 아니다', async () => {
    open((async () => 'already') as never);
    fireEvent.click(byLabel(REPORT_REASON_LABEL.inaccurate) as HTMLElement);
    await act(async () => {
      fireEvent.click(byLabel('신고 보내기') as HTMLElement);
    });
    const text = document.body.textContent ?? '';
    expect(text).toContain('이미 접수된 신고입니다');
    expect(text).not.toContain('보내지 못했습니다');
  });

  it('설명은 1000자를 넘겨 입력되지 않는다', () => {
    open(async () => 'ok');
    const input = byLabel('신고 상세 설명') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'x'.repeat(1500) } });
    expect(document.body.textContent).toContain('1000/1000');
  });

  it('접근성 — 사유는 라디오, 버튼에는 이름이 있다', () => {
    open(async () => 'ok');
    for (const label of Object.values(REPORT_REASON_LABEL)) {
      const el = byLabel(label);
      expect(el?.getAttribute('role')).toBe('radio');
    }
    expect(byLabel('신고 보내기')).not.toBeNull();
    expect(byLabel('취소')).not.toBeNull();
  });
});

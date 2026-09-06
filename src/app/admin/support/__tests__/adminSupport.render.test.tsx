// ADMIN 고객문의 (/admin/support) — 운영자 큐.
//
// 이 화면의 실패 모드는 조용한 빈 목록이다. RPC 가 이 환경에 없으면 "문의 없음"처럼 보여
// 운영자가 큐를 비어 있다고 믿는다. fail-closed 가 실제로 화면에서 작동하는지 렌더해서 본다.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

const adminListInquiries = jest.fn();
const adminAnswerInquiry = jest.fn();
jest.mock('@/features/support/supportService', () => ({
  __esModule: true,
  adminListInquiries: (s: unknown) => adminListInquiries(s),
  adminAnswerInquiry: (...a: unknown[]) => adminAnswerInquiry(...a),
}));

import AdminSupportScreen from '../index';

const ROW = {
  id: 'q1',
  category: 'payment' as const,
  status: 'RECEIVED' as const,
  message: '결제했는데 덕이 안 들어옵니다. 어제 저녁에 대용량 패키지를 결제했고 승인 문자는 받았습니다.',
  answer: null as string | null,
  answeredAt: null as string | null,
  userDisplayName: '김덕분',
  userEmail: 'user@ex.com',
  contactEmail: null as string | null,
  platform: 'ios',
  appVersion: '1.0.0',
  createdAt: '2026-09-01T10:00:00Z',
};

beforeEach(() => {
  adminListInquiries.mockReset().mockResolvedValue({ kind: 'ok', rows: [ROW] });
  adminAnswerInquiry.mockReset().mockResolvedValue({ ok: true });
});

it('원문·연락처·플랫폼이 한 카드에 모여 보인다', async () => {
  render(<AdminSupportScreen />);
  await waitFor(() => expect(screen.getByText(ROW.message)).toBeInTheDocument());
  expect(screen.getByText('결제·덕')).toBeInTheDocument();
  // '접수됨' 은 상태 필터 칩에도 있으므로 두 군데다 — 카드 쪽이 존재하는지만 본다.
  expect(screen.getAllByText('접수됨').length).toBeGreaterThanOrEqual(2);
  expect(screen.getByText(/김덕분 · user@ex\.com/)).toBeInTheDocument();
  expect(screen.getByText(/ios 1\.0\.0/)).toBeInTheDocument();
});

it('문의자가 따로 적은 이메일이 계정 이메일을 덮고, 그렇다고 표시된다', async () => {
  adminListInquiries.mockResolvedValue({ kind: 'ok', rows: [{ ...ROW, contactEmail: 'other@ex.com' }] });
  render(<AdminSupportScreen />);
  await waitFor(() => expect(screen.getByText(/other@ex\.com \(문의 시 입력\)/)).toBeInTheDocument());
  expect(document.body.textContent).not.toContain('user@ex.com');
});

it('⚠ RPC 가 없으면 빈 목록이 아니라 오류를 말한다', async () => {
  adminListInquiries.mockResolvedValue({ kind: 'unavailable', reason: 'admin_list_inquiries 함수가 없습니다.' });
  render(<AdminSupportScreen />);
  await waitFor(() => expect(screen.getByText(/admin_list_inquiries 함수가 없습니다/)).toBeInTheDocument());
  expect(screen.queryByText('해당 상태의 문의가 없습니다.')).toBeNull();
});

it('진짜로 0건일 때만 "문의가 없습니다"', async () => {
  adminListInquiries.mockResolvedValue({ kind: 'ok', rows: [] });
  render(<AdminSupportScreen />);
  await waitFor(() => expect(screen.getByText('해당 상태의 문의가 없습니다.')).toBeInTheDocument());
});

it('빈 답변으로는 등록 버튼이 열리지 않는다', async () => {
  render(<AdminSupportScreen />);
  await waitFor(() => expect(screen.getByLabelText('답변 입력')).toBeInTheDocument());
  await act(async () => { fireEvent.click(screen.getByText('답변 등록')); });
  expect(adminAnswerInquiry).not.toHaveBeenCalled();
});

it('답변을 쓰면 ANSWERED 로 등록되고 목록을 다시 읽는다', async () => {
  render(<AdminSupportScreen />);
  await waitFor(() => expect(screen.getByLabelText('답변 입력')).toBeInTheDocument());
  fireEvent.change(screen.getByLabelText('답변 입력'), { target: { value: '확인했습니다. 반영해 두었어요.' } });
  await act(async () => { fireEvent.click(screen.getByText('답변 등록')); });
  expect(adminAnswerInquiry).toHaveBeenCalledWith('q1', '확인했습니다. 반영해 두었어요.', 'ANSWERED');
  expect(adminListInquiries).toHaveBeenCalledTimes(2);
});

it('원문은 어디에서도 편집할 수 없다 — 입력칸은 답변용 하나뿐', async () => {
  render(<AdminSupportScreen />);
  await waitFor(() => expect(screen.getByText(ROW.message)).toBeInTheDocument());
  const editable = Array.from(document.querySelectorAll('textarea, input'));
  expect(editable).toHaveLength(1);
  expect(editable[0]).toHaveAttribute('aria-label', '답변 입력');
  expect((editable[0] as HTMLTextAreaElement).value).not.toContain('결제했는데');
});

it('상태 필터가 실제로 서버 인자를 바꾼다', async () => {
  render(<AdminSupportScreen />);
  await waitFor(() => expect(adminListInquiries).toHaveBeenCalledWith(null));
  // AdminSelect 는 <select> 가 아니라 칩이다. 기본 픽스처의 행 상태는 '접수됨' 이라 '답변 완료' 는 필터에만 있다.
  fireEvent.click(screen.getByText('답변 완료'));
  await waitFor(() => expect(adminListInquiries).toHaveBeenCalledWith('ANSWERED'));
});

it('이미 답변된 건에는 "확인 중으로" 를 주지 않는다', async () => {
  adminListInquiries.mockResolvedValue({ kind: 'ok', rows: [{ ...ROW, status: 'ANSWERED', answer: '처리했습니다', answeredAt: '2026-09-02T00:00:00Z' }] });
  render(<AdminSupportScreen />);
  await waitFor(() => expect(screen.getByText('답변 완료')).toBeInTheDocument());
  expect(screen.queryByText('확인 중으로')).toBeNull();
  expect(screen.getByText('처리했습니다')).toBeInTheDocument();
});

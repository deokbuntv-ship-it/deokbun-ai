// 문의하기 (/support) — 사용자가 보는 CS 화면.
//
// ⚠ 이 화면의 가장 큰 위험은 없는 약속을 하는 것이다. "24시간 내 답변" 같은 문구 하나가
// 지킬 수 없는 SLA 가 된다. 소스에 문자열이 있는지가 아니라 화면에 무엇이 있는지를 본다.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

const listMyInquiries = jest.fn();
const submitInquiry = jest.fn();
jest.mock('@/features/support/supportService', () => ({
  __esModule: true,
  listMyInquiries: () => listMyInquiries(),
  submitInquiry: (d: unknown) => submitInquiry(d),
}));

let authStatus: 'authenticated' | 'unauthenticated' = 'authenticated';
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: authStatus === 'authenticated', authState: { status: authStatus, user: { id: 'u1', email: 'me@ex.com' } } }),
}));

import { MESSAGE_MAX, RESPONSE_TIME_NOTICE } from '@/features/support/supportContract';

import SupportScreen from '../support';

// 실제 길이의 긴 본문 — 360dp 에서 넘치는지 보려면 짧은 더미로는 안 된다.
const LONG_MESSAGE = (
  '결제하고 덕이 들어오지 않았습니다. 어제 저녁 여덟시쯤 대용량 패키지를 결제했고 카드 승인 문자는 왔는데 '
  + '앱에서는 잔액이 그대로입니다. 앱을 껐다 켜 보고 로그아웃 후 다시 로그인도 해봤는데 똑같습니다. '
  + '상담을 하나 진행하려고 결제한 거라서 빨리 확인해 주시면 좋겠습니다. 결제 화면 캡처는 가지고 있습니다.'
).repeat(2);

beforeEach(() => {
  authStatus = 'authenticated';
  listMyInquiries.mockReset().mockResolvedValue([]);
  submitInquiry.mockReset();
});

it('⚠ 응답 시간을 약속하지 않는다', async () => {
  render(<SupportScreen />);
  await waitFor(() => expect(screen.getByText(new RegExp(RESPONSE_TIME_NOTICE.slice(0, 12)))).toBeInTheDocument());
  const body = document.body.textContent ?? '';
  // 시간·영업일 단위의 약속이 화면 어디에도 없어야 한다.
  expect(body).not.toMatch(/\d+\s*(시간|영업일|일)\s*(안|내|이내)/);
  expect(body).not.toMatch(/(빠른 시일|신속|즉시)\s*(내|답변|처리)/);
  expect(body).toContain('순서대로 답변드려요');
});

it('다섯 유형이 전부 보이고 선택이 바뀐다', async () => {
  render(<SupportScreen />);
  await waitFor(() => expect(screen.getByText('결제·덕')).toBeInTheDocument());
  for (const label of ['결제·덕', '상담 내용', '계정', '오류 신고', '기타']) {
    expect(screen.getByText(label)).toBeInTheDocument();
  }
  const chip = screen.getByLabelText('문의 유형 오류 신고');
  fireEvent.click(chip);
  fireEvent.change(screen.getByLabelText('문의 내용'), { target: { value: '버튼이 안 눌려요' } });
  submitInquiry.mockResolvedValue('SUBMITTED');
  await act(async () => { fireEvent.click(screen.getByText('문의 보내기')); });
  expect(submitInquiry).toHaveBeenCalledWith(expect.objectContaining({ category: 'bug' }));
});

it('빈 내용으로 보내면 이유를 말하고 서버를 부르지 않는다', async () => {
  render(<SupportScreen />);
  await waitFor(() => expect(screen.getByText('문의 보내기')).toBeInTheDocument());
  await act(async () => { fireEvent.click(screen.getByText('문의 보내기')); });
  expect(submitInquiry).not.toHaveBeenCalled();
  expect(screen.getByText('문의 내용을 입력해 주세요.')).toBeInTheDocument();
});

it('글자수 카운터가 실제로 따라 움직인다', async () => {
  render(<SupportScreen />);
  await waitFor(() => expect(screen.getByLabelText('문의 내용')).toBeInTheDocument());
  expect(screen.getByText(`0 / ${MESSAGE_MAX}`)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('문의 내용'), { target: { value: LONG_MESSAGE } });
  expect(screen.getByText(`${LONG_MESSAGE.trim().length} / ${MESSAGE_MAX}`)).toBeInTheDocument();
});

it('보내면 접수 확인이 뜨고 입력이 비워진다', async () => {
  submitInquiry.mockResolvedValue('SUBMITTED');
  render(<SupportScreen />);
  await waitFor(() => expect(screen.getByLabelText('문의 내용')).toBeInTheDocument());
  fireEvent.change(screen.getByLabelText('문의 내용'), { target: { value: LONG_MESSAGE } });
  await act(async () => { fireEvent.click(screen.getByText('문의 보내기')); });
  expect(screen.getByText(/문의가 접수되었어요/)).toBeInTheDocument();
  expect(screen.getByLabelText('문의 내용')).toHaveValue('');
});

it('이메일이 이상하면 보내지 않는다', async () => {
  render(<SupportScreen />);
  await waitFor(() => expect(screen.getByLabelText('문의 내용')).toBeInTheDocument());
  fireEvent.change(screen.getByLabelText('문의 내용'), { target: { value: '문의합니다' } });
  fireEvent.change(screen.getByLabelText('답변 받을 이메일'), { target: { value: 'not-an-email' } });
  await act(async () => { fireEvent.click(screen.getByText('문의 보내기')); });
  expect(submitInquiry).not.toHaveBeenCalled();
  expect(screen.getByText('답변 받을 이메일 주소를 다시 확인해 주세요.')).toBeInTheDocument();
});

it('무엇이 함께 전송되는지 미리 말한다', async () => {
  render(<SupportScreen />);
  await waitFor(() => expect(screen.getByText(/앱 버전과 기기 종류가 함께 전달돼요/)).toBeInTheDocument());
});

it('내 문의 내역과 답변이 긴 본문 그대로 보인다', async () => {
  listMyInquiries.mockResolvedValue([
    { id: 'i1', category: 'payment', status: 'ANSWERED', message: LONG_MESSAGE, answer: '확인 결과 반영되었습니다. 다시 확인해 주세요.', createdAt: '2026-09-01T00:00:00Z' },
    { id: 'i2', category: 'bug', status: 'RECEIVED', message: '오류가 납니다', answer: null, createdAt: '2026-09-02T00:00:00Z' },
  ]);
  render(<SupportScreen />);
  await waitFor(() => expect(screen.getByText('내 문의 내역')).toBeInTheDocument());
  expect(screen.getByText(LONG_MESSAGE)).toBeInTheDocument();
  expect(screen.getByText('답변 완료')).toBeInTheDocument();
  expect(screen.getByText('접수됨')).toBeInTheDocument();
  expect(screen.getByText('확인 결과 반영되었습니다. 다시 확인해 주세요.')).toBeInTheDocument();
});

it('내역이 없으면 빈 섹션 자체를 그리지 않는다', async () => {
  render(<SupportScreen />);
  await waitFor(() => expect(screen.getByText('문의 보내기')).toBeInTheDocument());
  expect(screen.queryByText('내 문의 내역')).toBeNull();
});

it('비로그인은 로그인으로 간다', () => {
  authStatus = 'unauthenticated';
  render(<SupportScreen />);
  expect(screen.getByTestId('redirect')).toHaveAttribute('data-href', '/login');
});

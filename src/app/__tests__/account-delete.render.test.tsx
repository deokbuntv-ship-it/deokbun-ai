// 계정 탈퇴 — 되돌릴 수 없는 화면이 실제로 어떻게 생겼는가.
//
// 소스 계약 테스트는 `isDeleteConfirmed('탈퇴')` 가 true 라는 것까지만 본다. 화면이 그 판정을 실제로
// 버튼에 연결했는지, 0건 항목이 정말 안 나오는지, 리텐션 훅이 슬쩍 들어가 있지는 않은지는 렌더해야 보인다.
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

const fetchDeletionPreview = jest.fn();
const deleteAccount = jest.fn();
const unregisterOnLogout = jest.fn().mockResolvedValue(undefined);
jest.mock('@/features/account/accountDeletionService', () => ({
  __esModule: true,
  fetchDeletionPreview: () => fetchDeletionPreview(),
  deleteAccount: () => deleteAccount(),
}));
jest.mock('@/features/retention', () => ({
  __esModule: true,
  unregisterOnLogout: () => unregisterOnLogout(),
}));

let authStatus: 'authenticated' | 'unauthenticated' = 'authenticated';
jest.mock('@/features/auth', () => ({
  __esModule: true,
  useAuth: () => ({ isAuthenticated: authStatus === 'authenticated', authState: { status: authStatus, user: { id: 'u1', email: 'a@b.com' } } }),
}));

import { routerMock } from '../../../jest.render.setup';
import AccountDeleteScreen from '../account-delete';

const PREVIEW = { dukBalance: 37, subjectCount: 3, consultationCount: 12, reportCount: 4 };

beforeEach(() => {
  authStatus = 'authenticated';
  fetchDeletionPreview.mockReset().mockResolvedValue(PREVIEW);
  deleteAccount.mockReset();
  routerMock.replace.mockReset();
  routerMock.back.mockReset();
});

const renderAndSettle = async () => {
  render(<AccountDeleteScreen />);
  await waitFor(() => expect(screen.getByText(/분석 대상자 3명/)).toBeInTheDocument());
};

it('무엇이 사라지는지 이 계정의 실제 숫자로 말한다', async () => {
  await renderAndSettle();
  expect(screen.getByText('그동안 함께해 주셔서 고마웠어요.')).toBeInTheDocument();
  expect(screen.getByText(/상담 기록 12건/)).toBeInTheDocument();
  expect(screen.getByText(/저장한 리포트 4건/)).toBeInTheDocument();
  expect(screen.getByText('남은 37덕은 함께 사라지며 환불되지 않아요.')).toBeInTheDocument();
  expect(screen.getByText(/a@b\.com/)).toBeInTheDocument();
});

it('0건인 항목은 아예 나오지 않는다 — 잃을 것이 없다는 안내는 정보가 아니다', async () => {
  fetchDeletionPreview.mockResolvedValue({ dukBalance: 0, subjectCount: 1, consultationCount: 0, reportCount: 0 });
  render(<AccountDeleteScreen />);
  await waitFor(() => expect(screen.getByText(/분석 대상자 1명/)).toBeInTheDocument());
  expect(screen.queryByText(/상담 기록/)).toBeNull();
  expect(screen.queryByText(/저장한 리포트/)).toBeNull();
  expect(screen.queryByText(/환불되지 않아요/)).toBeNull();
});

it('만류하지 않는다 — 리텐션 오퍼도, 되묻는 루프도, 설문도 없다', async () => {
  await renderAndSettle();
  const body = document.body.textContent ?? '';
  for (const darkPattern of ['정말', '한 번 더', '아쉬', '혜택', '설문', '이유를', '잠시만']) {
    expect(body).not.toContain(darkPattern);
  }
});

describe('타이핑 확인 — 오탭 방지이지 관문이 아니다', () => {
  it('입력 전에는 탈퇴 버튼이 잠겨 있다', async () => {
    await renderAndSettle();
    expect(screen.getByText(/"탈퇴" 를 입력해 주세요/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('탈퇴하기'));
    expect(deleteAccount).not.toHaveBeenCalled();
  });

  it('틀린 말은 통과하지 않는다', async () => {
    await renderAndSettle();
    fireEvent.change(screen.getByLabelText('탈퇴 확인 입력'), { target: { value: '탈퇴합니다' } });
    fireEvent.click(screen.getByText('탈퇴하기'));
    expect(deleteAccount).not.toHaveBeenCalled();
  });

  it('맞는 말이면 열리고, 실제로 삭제가 불린다', async () => {
    deleteAccount.mockResolvedValue('DELETED');
    await renderAndSettle();
    fireEvent.change(screen.getByLabelText('탈퇴 확인 입력'), { target: { value: '탈퇴' } });
    await act(async () => { fireEvent.click(screen.getByText('탈퇴하기')); });
    expect(deleteAccount).toHaveBeenCalledTimes(1);
    // 푸시 해제는 아직 로그인 상태일 때 일어나야 한다 (RLS).
    expect(unregisterOnLogout).toHaveBeenCalled();
    expect(routerMock.replace).toHaveBeenCalledWith('/login');
  });

  it('IME 가 남긴 뒤 공백은 사용자를 실패시키지 않는다', async () => {
    deleteAccount.mockResolvedValue('DELETED');
    await renderAndSettle();
    fireEvent.change(screen.getByLabelText('탈퇴 확인 입력'), { target: { value: '탈퇴 ' } });
    await act(async () => { fireEvent.click(screen.getByText('탈퇴하기')); });
    expect(deleteAccount).toHaveBeenCalledTimes(1);
  });
});

it('사용자가 애플 시트에서 물러나면 아무 말도 하지 않는다', async () => {
  deleteAccount.mockResolvedValue('CANCELLED');
  await renderAndSettle();
  fireEvent.change(screen.getByLabelText('탈퇴 확인 입력'), { target: { value: '탈퇴' } });
  await act(async () => { fireEvent.click(screen.getByText('탈퇴하기')); });
  expect(routerMock.replace).not.toHaveBeenCalled();
  // 화면은 그대로 남고 에러 문구는 뜨지 않는다.
  expect(screen.getByText('탈퇴하기')).toBeInTheDocument();
});

it('실패하면 이유를 말하고 화면에 남는다', async () => {
  deleteAccount.mockResolvedValue('NETWORK');
  await renderAndSettle();
  fireEvent.change(screen.getByLabelText('탈퇴 확인 입력'), { target: { value: '탈퇴' } });
  await act(async () => { fireEvent.click(screen.getByText('탈퇴하기')); });
  expect(routerMock.replace).not.toHaveBeenCalled();
  const { deletionOutcomeMessage } = require('@/features/account/accountDeletionContract');
  expect(screen.getByText(deletionOutcomeMessage('NETWORK'))).toBeInTheDocument();
});

it('비로그인은 화면을 못 본다', () => {
  authStatus = 'unauthenticated';
  render(<AccountDeleteScreen />);
  expect(screen.getByTestId('redirect')).toHaveAttribute('data-href', '/login');
  expect(fetchDeletionPreview).not.toHaveBeenCalled();
});

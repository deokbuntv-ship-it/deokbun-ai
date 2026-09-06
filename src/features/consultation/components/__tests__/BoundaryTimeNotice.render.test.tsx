// 절기 경계일 경고 — the first screen ever rendered in this repo's test suite.
//
// The source-contract tests already assert the approved copy exists in `birthBoundaryGate.ts`.
// What they cannot see is whether it reaches the screen: this file renders the component and reads
// the resulting DOM.
import { render, screen, fireEvent } from '@testing-library/react';

import {
  BOUNDARY_NOTICE_TITLE,
  BOUNDARY_NOTICE_TITLE_COMPATIBILITY,
  BOUNDARY_NOTICE_BODY_FORM,
  BOUNDARY_NOTICE_BODY_FORM_COMPATIBILITY,
  BOUNDARY_NOTICE_BODY_SURFACE,
  boundaryNoticeCompatibilityBody,
} from '@/features/consultation/birthBoundaryGate';

import { BoundaryTimeNotice } from '../BoundaryTimeNotice';

describe('BoundaryTimeNotice — 렌더', () => {
  it('form: 승인된 문안이 화면에 그대로 나온다', () => {
    render(<BoundaryTimeNotice context="form" />);
    expect(screen.getByText(BOUNDARY_NOTICE_TITLE)).toBeInTheDocument();
    expect(screen.getByText(BOUNDARY_NOTICE_BODY_FORM)).toBeInTheDocument();
  });

  it('surface: 문안이 form 판과 다르다', () => {
    render(<BoundaryTimeNotice context="surface" />);
    expect(screen.getByText(BOUNDARY_NOTICE_BODY_SURFACE)).toBeInTheDocument();
    expect(screen.queryByText(BOUNDARY_NOTICE_BODY_FORM)).toBeNull();
  });

  it('버튼은 핸들러가 있을 때만 그려진다', () => {
    const { rerender } = render(<BoundaryTimeNotice context="form" />);
    expect(screen.queryByText('시각 입력하기')).toBeNull();
    rerender(<BoundaryTimeNotice context="form" onEnterTime={jest.fn()} onSaveAnyway={jest.fn()} />);
    expect(screen.getByText('시각 입력하기')).toBeInTheDocument();
    expect(screen.getByText('이대로 저장')).toBeInTheDocument();
  });

  it('버튼을 누르면 핸들러가 불린다', () => {
    const onEnterTime = jest.fn();
    const onSaveAnyway = jest.fn();
    render(<BoundaryTimeNotice context="form" onEnterTime={onEnterTime} onSaveAnyway={onSaveAnyway} />);
    fireEvent.click(screen.getByText('시각 입력하기'));
    expect(onEnterTime).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('이대로 저장'));
    expect(onSaveAnyway).toHaveBeenCalledTimes(1);
    expect(onEnterTime).toHaveBeenCalledTimes(1);
  });

  it('경고일 뿐 차단이 아니다 — surface 에는 form 의 저장 버튼이 없다', () => {
    render(<BoundaryTimeNotice context="surface" onEditBirthInfo={jest.fn()} onDismiss={jest.fn()} />);
    expect(screen.getByText('출생정보 수정')).toBeInTheDocument();
    expect(screen.getByText('나중에')).toBeInTheDocument();
    expect(screen.queryByText('이대로 저장')).toBeNull();
  });
});

// ── 궁합 변형 (2026-09-06) — 같은 판정, 다른 결과 ────────────────────────────────────────────────
describe('BoundaryTimeNotice — 궁합', () => {
  it('compatibility: 이름을 말하고 궁합을 볼 수 없다고 말한다', () => {
    render(<BoundaryTimeNotice context="compatibility" names={['박상대']} onEnterTime={jest.fn()} />);
    expect(screen.getByText(BOUNDARY_NOTICE_TITLE_COMPATIBILITY)).toBeInTheDocument();
    expect(screen.getByText(boundaryNoticeCompatibilityBody(['박상대']))).toBeInTheDocument();
    expect(screen.getByText('태어난 시각 입력하기')).toBeInTheDocument();
  });

  it('두 사람이면 둘 다 이름이 나온다', () => {
    render(<BoundaryTimeNotice context="compatibility" names={['조세영', '박상대']} />);
    expect(screen.getByText(/조세영 님과 박상대 님의/)).toBeInTheDocument();
  });

  it('이름을 못 받아도 문장이 깨지지 않는다', () => {
    render(<BoundaryTimeNotice context="compatibility" />);
    expect(screen.getByText(/두 분 중 한 분의 생일이/)).toBeInTheDocument();
  });

  it('⚠ 궁합 변형에는 진행 선택지가 없다 — form 의 [이대로 저장] 이 여기 있으면 안 된다', () => {
    render(<BoundaryTimeNotice context="compatibility" names={['박상대']} onEnterTime={jest.fn()} onSaveAnyway={jest.fn()} />);
    expect(screen.queryByText('이대로 저장')).toBeNull();
    expect(screen.queryByText('나중에')).toBeNull();
  });

  it('form + 궁합 상대: 상담/오늘/월별이 아니라 "이 분과의 궁합" 을 말한다', () => {
    render(<BoundaryTimeNotice context="form" forCompatibilityTarget onEnterTime={jest.fn()} onSaveAnyway={jest.fn()} />);
    expect(screen.getByText(BOUNDARY_NOTICE_BODY_FORM_COMPATIBILITY)).toBeInTheDocument();
    expect(screen.queryByText(BOUNDARY_NOTICE_BODY_FORM)).toBeNull();
    // 저장은 여전히 의미가 있다 — 사람은 남고 궁합만 못 본다.
    expect(screen.getByText('이대로 저장')).toBeInTheDocument();
  });

  it('⚠ 본인 등록 문안은 손대지 않았다', () => {
    render(<BoundaryTimeNotice context="form" onEnterTime={jest.fn()} />);
    expect(screen.getByText(BOUNDARY_NOTICE_BODY_FORM)).toBeInTheDocument();
  });
});

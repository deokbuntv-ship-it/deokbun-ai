// 상담 답변 화면 — 제목을 없앤 뒤 실제로 무엇이 보이는가 (2026-09-19, PART 3-4).
//
// 소스 문자열만 보는 테스트(`deviceQaReadingAndNewConsult.test.ts`)는 "제목 prop 을 지웠다" 까지만 안다.
// 여기서는 **렌더해서** 화면에 그 글자가 없는지, 그리고 짧은 답이 제대로 서는지를 잰다.
import { render, act, screen } from '@testing-library/react';

import { StructuredConsultationResult } from '@/features/intelligence/components/StructuredConsultationResult';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';

// PART 2-2 의 구조대로 만든 짧은 답. 성향 한 줄이 `disposition` 에 온다.
const VM: StructuredConsultationViewModel = {
  coreSummary: '이번 달은 맡은 자리에서 누가 어디까지 하는지가 흐릿해지는 때예요.',
  disposition: '버티면서 중심을 잡는 편이에요.',
  coreInterpretation:
    '평소보다 부딪히는 일이 늘어요. 그럴 땐 참지 마시고 그 자리에서 한 번 짚고 넘어가는 게 나아요. '
    + '혹시 요즘 누가 자꾸 걸리세요?',
  domainInterpretation: [{ title: '전문근거 · 명리', body: '오행 분포에서 토가 가장 많습니다.' }],
} as StructuredConsultationViewModel;

const renderVm = async (vm: StructuredConsultationViewModel) => {
  const r = render(<StructuredConsultationResult vm={vm} />);
  await act(async () => {});
  return r;
};

describe('제목 두 개가 화면에서 사라졌다', () => {
  it('⚠ "덕분이의 한마디" · "자세히 보면" 이 화면에 없다', async () => {
    await renderVm(VM);
    expect(screen.queryByText(/덕분이의 한마디/)).toBeNull();
    expect(screen.queryByText(/자세히 보면/)).toBeNull();
  });

  it('⚠ 반례 — 없앤 것은 제목뿐이고 내용은 다 보인다', async () => {
    await renderVm(VM);
    expect(screen.getByText(/누가 어디까지 하는지가 흐릿해지는 때예요/)).toBeTruthy();
    expect(screen.getByText(/한 번 짚고 넘어가는 게 나아요/)).toBeTruthy();
  });

  it('성향 한 줄이 화면에 보인다 (2026-09-19 전에는 이 칸이 늘 비어 있었다)', async () => {
    await renderVm(VM);
    expect(screen.getByText('버티면서 중심을 잡는 편이에요.')).toBeTruthy();
  });

  it('근거는 접혀 있다 — 본문에 바로 펼쳐지지 않는다', async () => {
    await renderVm(VM);
    expect(screen.getByText(/왜 이렇게 보나요/)).toBeTruthy();
  });
});

describe('짧은 답도 허전하지 않게 선다 (PART 3-3)', () => {
  it('성향·강점·주의가 없어도 죽지 않고 결론만으로 렌더된다', async () => {
    const bare = { coreSummary: '이번 달은 조용히 가는 흐름이에요.' } as StructuredConsultationViewModel;
    await renderVm(bare);
    expect(screen.getByText('이번 달은 조용히 가는 흐름이에요.')).toBeTruthy();
  });

  it('⚠ 결론이 없고 이야기만 있어도 렌더된다 (빈 화면이 되지 않는다)', async () => {
    const onlyBody = { coreInterpretation: '지금은 하던 것을 다듬는 쪽이 편해요.' } as StructuredConsultationViewModel;
    await renderVm(onlyBody);
    expect(screen.getByText('지금은 하던 것을 다듬는 쪽이 편해요.')).toBeTruthy();
  });
});

// 2026-09-19 PART 1·3 — 서버가 짧은 답을 보내면 **그것 하나가 답**이고 나머지는 접힌다.
describe('짧은 답이 오면 — 첫 칸 하나, 나머지는 "왜 이렇게 보나요?" 안', () => {
  const SHORT = '버티면서 중심을 잡는 편이에요. 이번 달 흐름으로 보면, 부딪힘은 지금 크게 벌일 자리는 아니에요. '
    + '부딪힘은 미루시는 쪽이되, 범위를 좁혀서 보세요. 그 사람과는 주로 어디서 부딪히세요?';
  const WITH_SHORT = {
    ...VM,
    shortAnswer: SHORT,
    strengths: ['지금의 큰 흐름이 원국 일주 천간합과 맞물려 풀립니다.'],
    cautions: ['올해 흐름이 원국 시주 충을 정면으로 흔듭니다.'],
  } as StructuredConsultationViewModel;

  it('⚠ 짧은 답이 보이고, 결론·좋은 흐름·조심할 점·근거는 접혀서 안 보인다', async () => {
    await renderVm(WITH_SHORT);
    expect(screen.getByText(SHORT)).toBeTruthy();
    expect(screen.getByText(/왜 이렇게 보나요/)).toBeTruthy();
    expect(screen.queryByText(/누가 어디까지 하는지가 흐릿해지는 때예요/)).toBeNull(); // 결론 — 접힘
    expect(screen.queryByText(/천간합/)).toBeNull(); // 좋은 흐름 — 접힘
    expect(screen.queryByText(/시주 충/)).toBeNull(); // 조심할 점 — 접힘
  });

  it('⚠ 반례 — 펼치면 긴 답이 그대로 있다 (버리지 않았다)', async () => {
    await renderVm(WITH_SHORT);
    await act(async () => { screen.getByText(/왜 이렇게 보나요/).click(); });
    expect(screen.getByText(/누가 어디까지 하는지가 흐릿해지는 때예요/)).toBeTruthy();
    expect(screen.getByText(/천간합/)).toBeTruthy();
    expect(screen.getByText(/시주 충/)).toBeTruthy();
    expect(screen.getByText(/오행 분포에서 토가 가장 많습니다/)).toBeTruthy();
  });

  it('⚠ 반례 — 짧은 답이 없는 예전 답은 예전 화면 그대로다', async () => {
    await renderVm(VM);
    expect(screen.getByText(/누가 어디까지 하는지가 흐릿해지는 때예요/)).toBeTruthy();
  });
});

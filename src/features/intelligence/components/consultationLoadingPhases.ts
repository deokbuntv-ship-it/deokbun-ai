// 기다리는 동안 보여 줄 문구 — 경과 시간대별 (2026-09-19).
//
// 왜 이렇게 나눴나. staging 실측 813건: **절반이 15.5초 · 열에 하나가 35.1초를 넘고 · 백에 하나는 101.7초**.
// 꼬리가 긴 이유는 제공자의 처리 속도가 그 순간 4배까지 떨어지기 때문이고, **우리가 없앨 수 없다**.
// 그래서 대응이 "빠르게"가 아니라 "기다리는 동안 안심시키기"다.
//
// 구간을 실측에 맞췄다:
//   · 0~12초   — 대부분이 아직 여기 있다(중앙값 15.5초 직전)
//   · 12~35초  — 중앙값을 넘긴 사람. 절반 조금 넘게가 여기서 끝난다
//   · 35초~    — **열에 하나**. 여기까지 온 사람에게만 더 기다려 달라고 말한다
//
// ⚠ 단계를 말하지 않는다. 엔진 계산은 **13밀리초**에 이미 끝나 있으므로 "사주를 보고 있어요" 는
//   10초 동안 **사실이 아니다**. 실제로 그 시간에 하고 있는 일은 **글을 쓰는 것** 하나뿐이다.
//   없는 단계를 지어내지 않는 것이 이 파일의 규칙이다(`ConsultationLoading` 머리말과 같은 교리).
//
// ⚠ 남은 시간을 말하지 않는다. 숫자 카운트다운도, "곧" 도 쓰지 않는다 — 틀리면 더 나쁘다.

export type LoadingPhase = {
  /** 굵게 보이는 한 줄. */
  primary: string;
  /** 그 아래 작은 줄들. 한 구간 안에서 돌아가며 보인다(정지 화면 금지). */
  subtitles: readonly string[];
};

export const PHASE_BOUNDARIES_MS = [12_000, 35_000] as const;

const PHASES: readonly LoadingPhase[] = [
  {
    // 0~12초 — 실측 중앙값(15.5초) 직전. 대부분이 아직 여기 있다.
    primary: '덕분이가 답을 쓰고 있어요.',
    subtitles: [
      '질문을 어떻게 풀어 드릴지 고르는 중이에요…',
      '중요한 것부터 정리하고 있어요…',
    ],
  },
  {
    // 12~35초 — 중앙값을 넘겼다. 아직 정상 범위라는 결을 준다.
    primary: '조금 더 살펴보고 있어요.',
    subtitles: [
      '천천히 보고 있으니 잠시만 기다려 주세요…',
      '놓친 데가 없는지 다시 보고 있어요…',
    ],
  },
  {
    // 35초~ — 열에 하나. 여기까지 온 사람에게만.
    primary: '조금만 더 기다려 주세요.',
    subtitles: [
      '오늘은 답이 늦게 나오고 있어요…',
      '창을 닫으셔도 괜찮아요. 다시 오시면 그대로 이어져요…',
    ],
  },
];

/**
 * 경과 시간에 맞는 구간. 화면이 비는 일이 없어야 하므로 이상한 값도 받는다 —
 * 음수·NaN 은 첫 구간, 무한대는 **마지막 구간**(오래 기다렸다는 뜻이므로).
 */
export function phaseFor(elapsedMs: number): LoadingPhase {
  if (elapsedMs === Number.POSITIVE_INFINITY) return PHASES[PHASES.length - 1];
  const ms = Number.isFinite(elapsedMs) && elapsedMs > 0 ? elapsedMs : 0;
  if (ms >= PHASE_BOUNDARIES_MS[1]) return PHASES[2];
  if (ms >= PHASE_BOUNDARIES_MS[0]) return PHASES[1];
  return PHASES[0];
}

/** 구간 안에서 돌아가는 작은 줄. 한 구간에 머물러도 화면이 멈추지 않는다. */
export function subtitleFor(elapsedMs: number, tick: number): string {
  const p = phaseFor(elapsedMs);
  return p.subtitles[Math.abs(tick) % p.subtitles.length];
}

/** 테스트가 문구 전체를 훑을 때 쓴다. */
export function allPhases(): readonly LoadingPhase[] {
  return PHASES;
}

# 렌더 하네스 — 화면을 실제로 그려 보는 법

> 2026-09-06 신설. 이 레포에는 오랫동안 컴포넌트 렌더 테스트가 **0건**이었고, 화면은 전부
> "소스에 이 문자열이 있는가" 형태의 계약 테스트로만 검증됐습니다(`KNOWN_RISKS.md` M5).
> 이 문서는 그 하네스의 사용법입니다. **다음 세션이 읽고 바로 쓸 수 있는 것**이 목적입니다.

---

## 1. 30초 요약

```bash
npx jest --selectProjects render     # 렌더 테스트만
npx jest --selectProjects node       # 기존 302개 스위트만
npx jest                             # 둘 다 (기본)
```

- 렌더 테스트 파일 이름은 **`*.test.tsx`** 입니다. `*.test.ts` 는 기존 node 러너가 가져갑니다.
  **확장자가 곧 러너 선택**이고, 이것이 두 세계가 서로를 건드리지 않는 이유입니다.
- 쿼리·상호작용은 **`@testing-library/react`** 를 씁니다 (react-native 판이 아닙니다 — 아래 §3).
- 화면은 **react-native-web** 을 거쳐 jsdom 에 그려집니다.

---

## 2. 최소 예시

```tsx
import { render, screen, fireEvent } from '@testing-library/react';

import { BoundaryTimeNotice } from '../BoundaryTimeNotice';

it('버튼을 누르면 핸들러가 불린다', () => {
  const onEnterTime = jest.fn();
  render(<BoundaryTimeNotice context="form" onEnterTime={onEnterTime} />);
  expect(screen.getByText('이 날짜는 태어난 시각이 꼭 필요해요')).toBeInTheDocument();
  fireEvent.click(screen.getByText('시각 입력하기'));   // ⚠ onPress 가 아니라 click
  expect(onEnterTime).toHaveBeenCalledTimes(1);
});
```

화면(스크린) 하나를 통째로 그릴 때는 서비스와 `useAuth` 를 파일 상단에서 mock 합니다.
`src/app/__tests__/support.render.test.tsx` 가 가장 전형적인 형태입니다.

---

## 3. 왜 react-native-web 인가 (RNTL 이 아니라)

| | react-native-web + @testing-library/react | @testing-library/react-native |
|---|---|---|
| 새 런타임 의존성 | **0** — RNW·react-dom 은 이미 프로덕션 의존성이다 (웹 빌드를 배포하므로) | react-native 소스 트랜스폼 필요 |
| babel | **불필요** — RNW 는 트랜스파일된 CJS 를 배포한다. 기존 ts-jest 가 그대로 처리한다 | `babel-preset-expo` + babel-jest 필요 → 러너가 둘로 갈린다 |
| 무엇을 렌더하는가 | **실제 웹 빌드** — 이 앱이 Vercel 에 내보내는 바로 그 코드 경로 | 네이티브 트리(JSON) |

결정적인 이유는 첫 줄입니다. 이 앱은 `web.output: "static"` 으로 **웹을 실제 제품으로 배포**하므로
RNW 경로는 시뮬레이션이 아니라 제품의 절반입니다. 그리고 babel 을 들이지 않으므로
기존 302개 스위트의 설정을 **한 글자도 바꾸지 않고** 붙일 수 있었습니다.

⚠ 대가: **네이티브 전용 동작은 여기서 보이지 않습니다.** 제스처, 네이티브 모듈, iOS/Android 차이는
여전히 실기기 QA 의 몫입니다(`docs/DEVICE_QA_MATRIX.md`).

---

## 4. 하네스가 이미 해 주는 것 — 다시 mock 하지 마세요

`jest.render.setup.tsx` 가 전역으로 처리합니다.

| 모듈 | 처리 | 쓰는 법 |
|---|---|---|
| `expo-router` | `useRouter` 는 `routerMock`, `<Redirect>` 는 마커 엘리먼트 | `import { routerMock } from '<rootDir>/jest.render.setup'` 후 `expect(routerMock.push).toHaveBeenCalledWith('/login')` |
| | `useLocalSearchParams` | `globalThis.__routeParams = { token: '…' }` 로 주입 |
| | `<Redirect href="x" />` | `expect(screen.getByTestId('redirect')).toHaveAttribute('data-href', 'x')` |
| `expo-router/head` | children 통과 | — |
| `react-native-safe-area-context` | inset 0 | — |
| `expo-image` | `<img>` | — |
| `__DEV__` | `false` (`jest.render.globals.js`) | — |
| CSS import | 빈 객체 | — |

`react-native-svg` 는 **mock 이 필요 없습니다** — `moduleFileExtensions` 가 `.web.tsx` 를 먼저
찾으므로 `LineIcon.web.tsx`(인라인 SVG)가 잡힙니다. 웹 빌드와 같은 파일입니다.

---

## 5. 뷰포트 · 다크모드 — `@/test-support/renderAudit`

```ts
import { setViewport, setColorScheme, fixedWidthsOver, nowrapLongText } from '@/test-support/renderAudit';

setViewport(360);                                  // Galaxy S8 기준 밴드
expect(fixedWidthsOver(container, 360)).toEqual([]); // 뷰포트보다 넓게 선언된 고정 px 폭
```

**두 개의 함정이 있고, 둘 다 조용히 거짓 통과를 만듭니다.**

1. **뷰포트** — RNW 의 `Dimensions` 는 `window.innerWidth` 가 아니라
   `document.documentElement.clientWidth` 를 읽습니다. jsdom 은 그 값이 **항상 0**이므로,
   `setViewport` 없이 렌더하면 모든 화면이 "0dp" 로 그려집니다. 360dp 검증이 전부 무의미해집니다.
   (이 트랙에서 실제로 한 번 걸렸습니다 — 처음 통과한 360dp 테스트는 사실 0dp 를 보고 있었습니다.)
2. **다크모드** — RNW 의 `Appearance` 는 `window.matchMedia` 를 읽는데 jsdom 에는 없습니다.
   `setColorScheme('dark')` 를 **화면 import 보다 먼저**(파일 최상단에서) 부르세요. Appearance 가
   모듈 로드 시점에 쿼리를 캐시하기 때문입니다. 안 부르면 다크 분기가 한 줄도 실행되지 않은 채
   초록불이 뜹니다.

`darkMode.render.test.tsx` 의 첫 테스트가 "스텁이 실제로 먹었다"를 확인하는 이유가 이것입니다.
**하네스 스텁이 동작했는지를 먼저 검증하지 않으면, 그 아래 전부가 거짓 통과입니다.**

---

## 6. 새 화면을 만들 때의 규칙

> **새 화면(`src/app/**/*.tsx`) 또는 새 공용 컴포넌트를 추가하면 렌더 테스트를 함께 낸다.**

최소한 이 넷:

1. **크래시 없이 마운트되는가** — 필수 props 없이, 그리고 로딩·에러·빈 상태 각각
2. **승인된 문안이 실제로 렌더 트리에 나오는가** — 소스에 문자열이 있는 것과 다른 문제다
3. **버튼이 실제로 핸들러를 부르는가** — `fireEvent.click`
4. **조건 분기가 조건대로 갈리는가** — 인증/비인증, 있음/없음, 성공/실패

그리고 화면이 **돈·개인정보·되돌릴 수 없는 행동**을 다루면 다음도 넣으세요.

5. **없어야 할 것이 없는가** — `expect(document.body.textContent).not.toContain(...)`.
   계정 탈퇴의 "만류 문구 없음", CS 의 "응답 시간 약속 없음", 공유 미리보기의 "이름 없음" 이
   전부 이 형태입니다. **소스 계약으로는 절대 확인할 수 없는 종류**이고, 실제로 가장 값이 큽니다.

6. **접근 가능한 이름이 있는가** — `getByLabelText` / `getByRole` 로 찾히지 않으면 **스크린리더도 못
   찾습니다.** ⚠ `accessibilityState` 는 쓰지 마세요 — react-native-web 0.21 이 aria-* 로 매핑하지
   않아 **웹에서 통째로 무시됩니다**(2026-09-06 실측, 16곳이 무음 no-op 이었습니다). `aria-checked` ·
   `aria-selected` · `aria-disabled` · `aria-expanded` 를 쓰면 RN 0.71+ 와 웹 양쪽에서 동작합니다.
   `components/__tests__/accessibilityContract.test.ts` 가 소스 수준에서 막습니다.

⚠ 렌더 테스트는 **소스 계약 테스트를 대체하지 않습니다.** 문안의 정본은 여전히 `.ts` 상수 파일에
있고 그것을 잠그는 것은 node 러너의 일입니다. 렌더 테스트는 "그 정본이 화면까지 도달했는가"를 봅니다.

---

## 7. CI 에 넣을 수 있는가 — 넣을 수 있습니다 (설정은 아직 없음)

측정값 (2026-09-06, 이 머신):

| | 스위트 | 테스트 | 시간 |
|---|---|---|---|
| node | 306 | 5,003 | ~26s |
| render | **27** | **346** | ~19s |
| 합계 | **333** | **5,349** | **~36s** (병렬) |

- **LLM 0콜, 네트워크 0, DB 0.** 비용은 러너 시간뿐입니다.
- 렌더 프로젝트가 **직렬로 10초**이므로 PR 단위로 돌리기에 충분히 쌉니다.
- 이 레포에는 **아직 `.github/workflows/` 가 없습니다.** 지시서에 따라 만들지 않았습니다.
  붙일 때 필요한 것은 이것이 전부입니다:
  - `npm ci`
  - `npx tsc --noEmit`
  - `npx jest --ci`
  - (선택) `node scripts/design-token-scan.mjs` — 실패시키지 말고 **로그로만**. 지금 432건이라
    게이트로 걸면 CI 가 항상 빨갛습니다(§8).

---

## 8. 곁다리 도구 — `scripts/design-token-scan.mjs`

```bash
node scripts/design-token-scan.mjs            # 요약
node scripts/design-token-scan.mjs --files    # 파일별
node scripts/design-token-scan.mjs --only=app/premium.tsx
```

하드코딩된 hex/rgb, 숫자 `fontSize`/`fontWeight`/`lineHeight`, 고정 `width`/`height` 를 셉니다.
**테스트가 아니라 보고 도구**입니다 — 정당한 예외(제3자 브랜드 색, 이모지 글리프 크기)가 섞여 있어
지금 게이트로 만들면 화이트리스트가 신호를 죽입니다. 결과 해석은 `PROJECT_STATE.md` §7.20.

```bash
node scripts/design-token-scan.mjs --baseline        # 기준선 대비 증감 (늘어난 파일·규칙을 이름으로)
node scripts/design-token-scan.mjs --baseline --seal # 현재 상태를 새 기준선으로 봉인
```

`--baseline` 은 `.token-baseline.json`(현재 **430건** 봉인) 과 비교해 **늘어난 것만** 보여 줍니다.
freeze 가드(`release-preflight.mjs` §3b)와 같은 방식입니다. ⚠ **어떤 경우에도 non-zero exit 하지
않습니다** — 430건에 게이트를 걸면 CI 가 항상 빨갛고, 빨간 CI 는 아무도 안 봅니다. 줄었을 때는
재봉인을 권합니다(되돌아가는 것을 막습니다).

---

## 8-b. 덮인 화면 (2026-09-06 현재)

| 화면 | 파일 | 건수 |
|---|---|---|
| Premium 결과 + 로딩 | `app/__tests__/premium.render.test.tsx` | 11 |
| 계정 탈퇴 | `app/__tests__/account-delete.render.test.tsx` | 10 |
| CS 문의 | `app/__tests__/support.render.test.tsx` | 10 |
| CS 관리자 | `app/admin/support/__tests__/adminSupport.render.test.tsx` | 9 |
| 공유 미리보기 | `app/shared-report/__tests__/sharedReportPreview.render.test.tsx` | 11 |
| **홈** | `app/__tests__/home.render.test.tsx` | 12 |
| **오늘의 운세** | `app/__tests__/today.render.test.tsx` | 13 |
| **상담 탭** (진입점) | `app/__tests__/consultTab.render.test.tsx` | 17 |
| **상담 대화** (5턴·세션경계·에러) | `app/__tests__/chat.render.test.tsx` | 15 |
| **로그인 (소셜 4종·실패 매핑)** | `app/__tests__/login.render.test.tsx` | 14 |
| **약관 동의** | `app/__tests__/terms.render.test.tsx` | 13 |
| **잔여 9화면 스모크** | `app/__tests__/remainingScreens.render.test.tsx` | 30 |
| **접근성 소스 계약** (node 러너) | `components/__tests__/accessibilityContract.test.ts` | 5 |
| ⚠ **안전 라우팅(위기 응답)** | `app/__tests__/safetyRoute.render.test.tsx` | 10 |
| **온보딩 — 출생정보/절기 게이트** | `app/__tests__/onboardingFunnel.render.test.tsx` | 14 |
| **유료 동의 표면(무음 경로 전수)** | `app/__tests__/paidConsent.render.test.tsx` | 6 |
| **우편함 · 월별 · 리포트 상세** | `app/__tests__/inboxReportMonthly.render.test.tsx` | 11 |
| **궁합 진입점 · MY** | `app/__tests__/compatibilityMy.render.test.tsx` | 13 |
| **지갑 · 충전(IAP 부재)** | `app/__tests__/wallet.render.test.tsx` | 11 |
| **궁합 대화 본문** (5턴·동의 게이트·근거 부재·경계일 백스톱) | `app/__tests__/compatibilityChat.render.test.tsx` | 18 |
| 궁합 대화 다크 | `app/__tests__/compatibilityChatDark.render.test.tsx` | 4 |
| ⚠ **궁합 절기 경계일 게이트** (결제 차단) | `app/__tests__/compatibilityBoundaryGate.render.test.tsx` | 13 |
| 절기 경계일 안내 컴포넌트 | `features/consultation/components/__tests__/BoundaryTimeNotice.render.test.tsx` | 11 |
| **관리자 핵심 3화면** (대시보드·사용자·상담) | `app/__tests__/adminCore.render.test.tsx` | 20 |
| 관리자 다크 분기 부재 (node 러너) | `app/__tests__/adminThemeFixed.test.ts` | 3 |
| ⚠ **관리자 값-쓰기 4화면** (덕 조정·전역 스위치·메일·인기질문) | `app/__tests__/adminWriteScreens.render.test.tsx` | 31 |
| 360dp 횡단 | `app/__tests__/layout360.render.test.tsx` | 10 |
| 다크모드 횡단 | `app/__tests__/darkMode.render.test.tsx` · `darkModeCore.render.test.tsx` | 10 |

**아직 안 덮인 화면 ~26개** — 남은 것은 대부분 **관리자 콘솔의 나머지 14화면**과 정적 정책 문서다.
다음 후보: 발행 에디터 3종(`AdEditor`·`FamousEditor`·`ContentEditor`) — 화면이 아니라 **컴포넌트**가 맞는 자리다.

> ⚠ **소스 스캔 테스트는 `.tsx` 로 만들지 말 것.** `tsconfig.json` 의 exclude 는 `**/*.test.ts` 뿐이라
> `.tsx` 테스트는 앱 tsconfig(node 타입 없음)로도 타입 검사된다 → `import ... from 'fs'` 가 TS2591 이
> 된다. jest 는 통과하는데 `tsc --noEmit` 만 깨지므로 늦게 발견된다. `adminThemeFixed.test.ts` 가
> 렌더 파일에서 분리돼 있는 이유이고, `designFreezeFinal.test.ts` 가 `.ts` 인 이유도 같다.

### 화면 하나를 통째로 렌더할 때 자주 막히는 자리

이 트랙에서 실제로 부딪힌 순서대로 — 다음 세션은 이걸 보고 바로 넘어가면 된다.

| 증상 | 원인 | 처방 |
|---|---|---|
| `useRootNavigationState is not a function` | expo-router 의 네비게이션 훅 | 이미 하네스가 mock 한다 |
| `Cannot read properties of undefined (reading remove)` | RNW `addEventListener` 가 undefined 반환 | **제품 버그였다** — `sub?.remove()` 로 수정됨(§7.22) |
| 화면이 `상담 정보를 불러오는 중` 에서 멈춤 | 배럴 mock 이 `hydrationStatus` 를 빠뜨림 | mock 에 `hydrationStatus: ready` 추가 |
| `someBarrel.someFn is not a function` | 배럴을 통째로 mock 해서 순수 함수까지 지움 | `jest.requireActual` 로 펼치고 **필요한 것만** 덮기 |
| 서비스 mock 을 넣었는데 아무 일도 안 일어남 | 메서드 이름 추측(`getLatest` vs `loadLatest`, `list` vs `listMail`) | **호출부를 grep 해서 확인할 것** |
| 다크 테스트가 라이트를 봄 | Appearance 가 모듈 로드 시 캐시 | `setColorScheme` 을 **파일 최상단**, import 보다 먼저 |
| 화면이 로딩 중인데 오류 카드가 보임 | 로딩과 실패를 구분한 파생 상태 대신 원본 상태로 분기 | **제품 버그였다** — `wallet.tsx` (§7.24). 새 화면에서 로딩/실패를 꼭 따로 단언할 것 |
| ⚠⚠ **화면 결함을 찾았다고 생각했는데 mock 결함이었다** | mock 이 **서비스를 우회**해 서비스가 정규화하는 값을 빠뜨렸다 | **두 번 당했다.** 지갑의 `+NaN덕`(`rewardAmount` 누락) · 관리자 대시보드 "부분 응답 미방어"(`toOverview` 가 이미 `num()` 으로 접는다). **화면이 크래시하면 먼저 "실제 경로가 이 값을 만들 수 있는가" 를 물을 것.** 못 만들면 결함은 mock 에 있다(§7.30) |
| ⚠ 오류 상태를 예외로 주입했더니 로딩에 영원히 머문다 | 이 레포의 서비스들은 오류를 **내부에서 잡아 `null`/`false`/`[]` 로 접는다** — 예외는 도달 불가 상태다 | 실패 모드를 **서비스 계약대로** 주입할 것(`mockResolvedValue(null)`). 예외를 주입하면 없는 세계를 검사한다 |
| **테스트가 실패가 아니라 멈춘다(수십 초~무한)** | mock 이 **매 호출마다 새 객체·배열**을 돌려줌 → 의존성 배열 참조가 계속 바뀌어 무한 리렌더 | mock 반환값을 **모듈 상수**로 올릴 것. `restoredMessages: []` 와 세션 객체에서 각각 걸렸다 |
| `getByLabelText('연도')` 가 못 찾음 | 보이는 라벨이 입력칸과 연결돼 있지 않음 | **제품 버그였다** — `Input` 이 `accessibilityLabel` 을 채우지 않았다(§7.26). 이제 채운다 |

> **하네스가 공짜로 잡아 주는 것**: RTL 의 `cleanup` 이 매 테스트마다 언마운트하므로 **구독 해제
> 버그가 자동으로 드러난다.** `Candle`·`NotificationUnreadContext` 두 건이 그렇게 발견됐다 —
> 별도 전수 스크립트를 만들지 않은 이유다.

## 9. 알려진 한계 — 이 하네스가 **못 하는 것**

렌더 테스트가 붙었다고 화면이 검증된 것은 아닙니다. 남는 것:

- **실기기에서 실제로 어떻게 보이는가.** jsdom 에는 레이아웃 엔진이 없어 `offsetWidth` 가 항상 0
  입니다. 줄바꿈 위치, 글꼴 실측 폭, 스크롤 발생, 터치 타깃 크기는 여기서 확인되지 않습니다.
- **네이티브 전용 경로** — 제스처, 네이티브 모듈, iOS/Android 차이.
- **애니메이션과 전환** — reanimated 는 이 경로를 타지 않습니다.
- **대비비(WCAG)** — 토큰 쌍 검증은 `src/theme/__tests__/brandTokens.test.ts` 의 일입니다.
- **시각적 인상** — "따뜻하고 아기자기하지만 저렴하지 않게" 는 사람이 봐야 합니다.

이 다섯은 여전히 `docs/DEVICE_QA_MATRIX.md` 의 실기기 QA 로만 닫힙니다.

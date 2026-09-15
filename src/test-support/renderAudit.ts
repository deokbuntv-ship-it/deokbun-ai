// 렌더된 DOM 을 훑어 레이아웃·토큰 위반을 찾는 보조 도구. 테스트가 아니라 테스트가 쓰는 모듈이다.
//
// ⚠ 이 도구가 증명할 수 있는 것과 없는 것
//   할 수 있다 : 선언된 고정 px 폭이 뷰포트보다 큰가 (그러면 실기기에서도 반드시 넘친다)
//   할 수 없다 : 실제로 넘쳤는가. jsdom 에는 레이아웃 엔진이 없어 offsetWidth 가 항상 0이다.
// 즉 여기서 나오는 FAIL 은 진짜 결함이고, PASS 는 "이 종류의 결함은 없다" 까지만 뜻한다.

/**
 * 뷰포트를 이 폭으로 고정한다.
 *
 * ⚠ react-native-web 의 Dimensions 는 `window.innerWidth` 가 아니라
 * `document.documentElement.clientWidth` 를 읽는다(visual viewport 를 쓰려는 설계). jsdom 은 그 값이
 * 항상 0이므로, 이걸 덮지 않으면 모든 화면이 "0dp" 로 렌더돼 가장 좁은 밴드만 검사하게 된다 —
 * 조용히 통과하는 종류의 거짓 PASS 다.
 */
export function setViewport(width: number, height = 780): void {
  for (const [prop, value] of [['clientWidth', width], ['clientHeight', height]] as const) {
    Object.defineProperty(document.documentElement, prop, { value, configurable: true });
  }
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true, writable: true });
  window.dispatchEvent(new Event('resize'));
}

const px = (v: string | null | undefined): number | null => {
  if (!v) return null;
  const m = /^(-?\d+(?:\.\d+)?)px$/.exec(v.trim());
  return m ? Number(m[1]) : null;
};

export type WidthOffender = { tag: string; prop: 'width' | 'min-width'; value: number; text: string };

/**
 * 뷰포트보다 넓게 **선언된** 고정 폭을 찾는다. `maxWidth` 는 상한이므로 위반이 아니다 —
 * 좁은 화면에서는 그냥 화면 폭을 따른다.
 */
export function fixedWidthsOver(root: HTMLElement, viewport: number): WidthOffender[] {
  const out: WidthOffender[] = [];
  for (const el of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
    const s = el.style;
    for (const prop of ['width', 'min-width'] as const) {
      const n = px(s.getPropertyValue(prop));
      if (n !== null && n > viewport) {
        out.push({ tag: el.tagName.toLowerCase(), prop, value: n, text: (el.textContent ?? '').slice(0, 40) });
      }
    }
  }
  return out;
}

/**
 * 줄바꿈이 막힌 채 잘릴 수 있는 텍스트. 한국어는 `keep-all` 로 단어 단위 줄바꿈을 하므로
 * `nowrap` 이 걸린 긴 문장은 실기기에서 잘린다.
 */
export function nowrapLongText(root: HTMLElement, minChars = 20): string[] {
  const out: string[] = [];
  for (const el of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
    const ws = el.style.getPropertyValue('white-space');
    if (ws !== 'nowrap' && ws !== 'pre') continue;
    const text = (el.textContent ?? '').trim();
    if (text.length >= minChars) out.push(text.slice(0, 60));
  }
  return out;
}

/** 화면 전체 텍스트 — "이 문구가 실제로 보이는가" 를 한 번에 볼 때. */
export const visibleText = (root: HTMLElement = document.body): string => root.textContent ?? '';

/**
 * 다크모드로 바꾼다. react-native-web 의 Appearance 는
 * `window.matchMedia('(prefers-color-scheme: dark)')` 를 읽는데 jsdom 에는 matchMedia 가 없어
 * 기본값이 항상 light 다 — 스텁을 넣지 않으면 다크 분기는 한 번도 실행되지 않는다.
 *
 * ⚠ Appearance 는 모듈 로드 시점에 쿼리를 캐시하므로, 이 함수는 **화면을 import 하기 전에**
 * (즉 파일 최상단에서) 불려야 한다.
 */
export function setColorScheme(scheme: 'light' | 'dark'): void {
  const dark = scheme === 'dark';
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: /prefers-color-scheme:\s*dark/.test(query) ? dark : !dark,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

/** 대비 계산용 — `rgb(r, g, b)` 문자열의 상대 휘도. */
export function luminance(rgb: string): number | null {
  const m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(rgb);
  if (!m) return null;
  const [r, g, b] = m.slice(1, 4).map((v) => {
    const c = Number(v) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

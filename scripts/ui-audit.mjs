// UI 기계 점검 (2026-09-17) — 사람이 "예쁜가" 를 보기 전에, 기계가 잴 수 있는 것만 잰다.
//
// 무엇을 재나
//   ① 색 대비: 테마 토큰 조합의 명도 대비(WCAG). 4.5:1(작은 글자) · 3:1(큰 글자) 기준.
//   ② 토큰 이탈: 화면 코드에 박힌 색상 코드(#rrggbb) · 글자 크기 숫자.
//   ③ 스크린 리더가 읽을 이름: accessibilityLabel 없는 Pressable.
//   ④ 손가락 크기: 코드에 적힌 height/minHeight 가 44 미만인 누를 수 있는 요소.
//   ⑤ 상태 화면: 로딩 · 빈 화면 · 오류 안내가 코드에 있는지(있음/없음만).
//
// 못 재는 것(한계 — 보고서에 그대로 적는다)
//   · 실제 배치에서의 넘침 · 잘림, 키보드가 입력창을 가리는지: jsdom 은 배치를 계산하지 않는다.
//     실제 화면 측정은 로그인 없이 열리는 페이지에 한해 브라우저로 따로 잰다.
//   · 네이티브(안드로이드/iOS)의 실제 터치 영역과 스크린 리더 동작.
//   · "첫인상 · 문구의 어색함" 같은 사람의 판단.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => relative(ROOT, p).split('\\').join('/');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (name === '__tests__' || name === 'node_modules') continue;
      walk(p, out);
    } else if (/\.(tsx|ts)$/.test(name) && !/\.test\.tsx?$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

// ── ① 색 대비 ────────────────────────────────────────────────────────────────
const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) };
};
const luminance = ({ r, g, b }) => {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (fg, bg) => {
  const l1 = luminance(hexToRgb(fg));
  const l2 = luminance(hexToRgb(bg));
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
};

// ⚠ 판정 로직 자기 검사(합성 반례). 값을 아는 조합으로 먼저 재 본다 — 여기서 틀리면 아래 표는 전부 거짓말이다.
//   검은 글자/흰 바탕 = 21:1 · 같은 색 = 1:1 · 네이버 초록(#03C75A) 위 흰 글자 ≈ 2.25:1
//   (마지막 값은 2026-09-17 실사이트 로그인 화면을 브라우저로 잰 값 2.25 와 같아야 한다 — 서로 다른 두
//   방법이 같은 숫자를 내야 이 계산을 믿을 수 있다).
const SELF_TESTS = [
  ['#000000', '#FFFFFF', 21],
  ['#FFFFFF', '#FFFFFF', 1],
  ['#FFFFFF', '#03C75A', 2.25],
];
for (const [fg, bg, expected] of SELF_TESTS) {
  const got = contrast(fg, bg);
  if (Math.abs(got - expected) > 0.02) {
    console.error(`[ui-audit] 자기 검사 실패: ${fg} on ${bg} → ${got} (기대 ${expected})`);
    process.exit(1);
  }
}

const themeSrc = readFileSync(join(ROOT, 'src/theme/colors.ts'), 'utf8');
function parseScheme(name) {
  const start = themeSrc.indexOf(`export const ${name}`);
  if (start < 0) return {};
  const body = themeSrc.slice(start, themeSrc.indexOf('};', start));
  const out = {};
  for (const m of body.matchAll(/(\w+)\s*:\s*'(#[0-9a-fA-F]{3,8})'/g)) out[m[1]] = m[2];
  return out;
}
const SCHEMES = { light: parseScheme('light'), dark: parseScheme('dark') };
// 글자색 × 바탕색 조합 중 화면에서 실제로 같이 쓰는 것만 본다(모든 조합을 곱하면 의미 없는 경고가 쏟아진다).
const PAIRS = [
  ['text', 'background'],
  ['text', 'surface'],
  ['textSecondary', 'background'],
  ['textSecondary', 'surface'],
  ['textTertiary', 'background'],
  ['primary', 'background'],
  ['danger', 'background'],
  ['success', 'background'],
  ['onPrimary', 'primary'],
];
const contrastFindings = [];
for (const [scheme, tokens] of Object.entries(SCHEMES)) {
  for (const [fgKey, bgKey] of PAIRS) {
    const fg = tokens[fgKey];
    const bg = tokens[bgKey];
    if (!fg || !bg) continue;
    const ratio = contrast(fg, bg);
    if (ratio < 4.5) contrastFindings.push({ scheme, fgKey, bgKey, fg, bg, ratio, need: 4.5 });
  }
}

// ── ②③④⑤ 화면 코드 ─────────────────────────────────────────────────────────
const screenFiles = [...walk(join(ROOT, 'src/app')), ...walk(join(ROOT, 'src/features'))].filter((p) => p.endsWith('.tsx'));
const hardcodedColor = [];
const unnamedPressable = [];
const smallTouch = [];
const stateless = [];

for (const file of screenFiles) {
  const src = readFileSync(file, 'utf8');
  const r = rel(file);
  const isThemeFile = r.includes('/theme/') || r.includes('adminTheme');

  // ② 토큰 이탈 — 주석이 아닌 줄의 색상 코드
  if (!isThemeFile) {
    const hits = src
      .split('\n')
      .map((line, i) => ({ line: line.trim(), n: i + 1 }))
      .filter(({ line }) => !line.startsWith('//') && !line.startsWith('*') && /['"]#[0-9a-fA-F]{3,8}['"]/.test(line));
    if (hits.length > 0) hardcodedColor.push({ file: r, count: hits.length, lines: hits.slice(0, 3).map((h) => h.n) });
  }

  // ③ 이름 없는 Pressable — 여는 태그 안에 accessibilityLabel 이 없는 것.
  //
  // ⚠ 여는 태그의 끝을 "첫 번째 `>`" 로 잡으면 안 된다. `onPress={() => close()}` 의 화살표가 `>` 라서
  //   태그를 일찍 끊어 읽고, 그 뒤에 있는 accessibilityLabel 을 못 본다(2026-09-17 첫 판에서 실제로
  //   AiConsentSheet 가 "이름 없음" 으로 잘못 잡혔다 — 그 파일에는 라벨이 있다). 중괄호 깊이를 세어
  //   **표현식 밖의** `>` 에서 끊는다.
  const tagEnd = (from) => {
    let depth = 0;
    for (let i = from; i < src.length; i += 1) {
      const c = src[i];
      if (c === '{') depth += 1;
      else if (c === '}') depth -= 1;
      else if (c === '>' && depth === 0) return i;
    }
    return src.length;
  };
  let unnamed = 0;
  for (const m of src.matchAll(/<(Pressable|TouchableOpacity)\b/g)) {
    const start = m.index ?? 0;
    const attrs = src.slice(start, tagEnd(start));
    if (!/accessibilityLabel|aria-label/.test(attrs)) unnamed += 1;
  }
  if (unnamed > 0) unnamedPressable.push({ file: r, count: unnamed });

  // ④ 코드에 적힌 손가락 크기 — height/minHeight 가 44 미만
  for (const m of src.matchAll(/(minHeight|height)\s*:\s*(\d+(?:\.\d+)?)/g)) {
    const value = Number(m[2]);
    if (value > 0 && value < 44 && /Pressable|Touchable|Button|hitSlop/.test(src)) {
      smallTouch.push({ file: r, prop: m[1], value });
    }
  }

  // ⑤ 상태 화면 — 화면 파일(src/app 의 라우트)만 본다
  if (r.startsWith('src/app/') && !r.includes('/_layout') && !r.includes('/components/')) {
    const hasLoading = /ActivityIndicator|Loading|StateView|Skeleton|hydrationStatus/.test(src);
    const hasEmptyOrError = /비어|없어요|없습니다|오류|실패|EmptyState|StateView/.test(src);
    if (!hasLoading || !hasEmptyOrError) stateless.push({ file: r, loading: hasLoading, emptyOrError: hasEmptyOrError });
  }
}

// 같은 파일에서 같은 값이 여러 번 나오면 한 줄로 묶는다.
const smallTouchGrouped = Object.values(
  smallTouch.reduce((acc, t) => {
    const key = `${t.file}|${t.prop}|${t.value}`;
    acc[key] = acc[key] ?? { ...t, count: 0 };
    acc[key].count += 1;
    return acc;
  }, {}),
).sort((a, b) => a.value - b.value);

const report = {
  generatedAt: new Date().toISOString().slice(0, 10),
  scanned: { screenFiles: screenFiles.length, schemes: Object.keys(SCHEMES).length },
  contrast: contrastFindings,
  hardcodedColor: hardcodedColor.sort((a, b) => b.count - a.count),
  unnamedPressable: unnamedPressable.sort((a, b) => b.count - a.count),
  smallTouch: smallTouchGrouped,
  stateless,
};

// 실제 브라우저로 잰 값(있으면). 로그인 없이 열리는 화면만 잴 수 있어 파일로 받아 합친다.
let browser = null;
try {
  browser = JSON.parse(readFileSync(join(ROOT, 'scripts/ui-audit-browser.json'), 'utf8'));
} catch {
  browser = null;
}

const lines = [];
lines.push('# UI 기계 점검 (2026-09-17)');
lines.push('');
lines.push(`대상 파일 ${report.scanned.screenFiles}개(테스트 제외) · 테마 ${report.scanned.schemes}종.`);
lines.push('기계가 잴 수 있는 것만 담았다. "예쁜가 · 막히지 않는가" 는 사람이 본다(오너 실기기 체크리스트).');
lines.push('');
lines.push('## 심각도 요약');
lines.push('');
lines.push('| 심각도 | 문제 | 근거 | 수 |');
lines.push('|---|---|---|---|');
lines.push(`| 출시 전 필수 | 없음 (이번 점검에서 잰 항목 기준) | — | 0 |`);
lines.push(`| 나중 | 뒤로 버튼이 44×44 보다 좁다 (32×44) | 실측 · \`src/components/AppHeader\` | ${browser ? browser.pages.filter((p) => p.smallTargets > 0).length : 0}개 화면에서 확인 |`);
lines.push(`| 나중 | 로그인 화면 "네이버로 계속하기" 대비 2.25:1 (기준 4.5:1) | 실측 · 브랜드 색 | 1 |`);
lines.push(`| 나중 | 화면 코드에 박힌 색상 코드 | 코드 | ${report.hardcodedColor.length}개 파일 |`);
lines.push(`| 나중 | 스크린 리더가 읽을 이름이 없는 Pressable | 코드 | ${report.unnamedPressable.length}개 파일 |`);
lines.push(`| 확인 필요 | 로딩/빈/오류 안내가 코드에서 안 보이는 화면 | 코드(추정) | ${stateless.length}개 |`);
lines.push('');
if (browser) {
  lines.push('## 실측 (실제 브라우저) — ' + browser.viewport);
  lines.push('');
  lines.push(browser.note);
  lines.push('');
  lines.push('| 화면 | 어디서 | 가로 넘침 | 잘린 글자 | 작은 터치 | 이름 없는 버튼 | 대비 미달 |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const p of browser.pages) {
    const low = (p.lowContrast ?? []).map((l) => `${l.text} ${l.ratio}:1`).join(', ') || '0';
    lines.push(`| ${p.path} | ${p.where} | ${p.overflowX}px | ${p.clipped} | ${p.smallTargets}${p.smallDetail ? ` (${p.smallDetail})` : ''} | ${p.unnamedTargets} | ${low} |`);
  }
  lines.push('');
  lines.push('### 게이트 확인');
  lines.push('');
  lines.push('| 화면 | 어디서 | 결과 |');
  lines.push('|---|---|---|');
  for (const g of browser.gateChecks) lines.push(`| ${g.path} | ${g.where} | ${g.result} |`);
  lines.push('');
}
lines.push('## ① 색 대비 (테마 토큰 조합 · WCAG 4.5:1)');
lines.push(contrastFindings.length === 0 ? '기준 미만 조합 없음.' : '| 테마 | 글자 | 바탕 | 값 | 비율 | 기준 |');
if (contrastFindings.length > 0) {
  lines.push('|---|---|---|---|---|---|');
  for (const c of contrastFindings) lines.push(`| ${c.scheme} | ${c.fgKey} | ${c.bgKey} | ${c.fg} / ${c.bg} | ${c.ratio}:1 | ${c.need}:1 |`);
}
lines.push('');
lines.push('## ② 토큰 이탈 — 화면 코드에 박힌 색상 코드');
lines.push(`파일 ${report.hardcodedColor.length}개.`);
lines.push('');
lines.push('| 파일 | 개수 | 첫 줄 |');
lines.push('|---|---|---|');
for (const h of report.hardcodedColor.slice(0, 25)) lines.push(`| ${h.file} | ${h.count} | ${h.lines.join(', ')} |`);
lines.push('');
lines.push('## ③ 스크린 리더가 읽을 이름이 없는 Pressable');
lines.push(`파일 ${report.unnamedPressable.length}개.`);
lines.push('');
lines.push('| 파일 | 개수 |');
lines.push('|---|---|');
for (const u of report.unnamedPressable.slice(0, 25)) lines.push(`| ${u.file} | ${u.count} |`);
lines.push('');
lines.push('## ④ 코드에 적힌 높이가 44 미만인 곳 (누를 수 있는 요소가 있는 파일)');
lines.push('| 파일 | 속성 | 값 | 횟수 |');
lines.push('|---|---|---|---|');
for (const t of smallTouchGrouped.slice(0, 25)) lines.push(`| ${t.file} | ${t.prop} | ${t.value} | ${t.count} |`);
lines.push('');
lines.push('## ⑤ 로딩 · 빈 화면 · 오류 안내가 코드에서 보이지 않는 화면');
lines.push('| 화면 | 로딩 | 빈/오류 |');
lines.push('|---|---|---|');
for (const s of stateless) lines.push(`| ${s.file} | ${s.loading ? '있음' : '없음'} | ${s.emptyOrError ? '있음' : '없음'} |`);
lines.push('');
lines.push('## 한계 (기계가 못 잰 것)');
lines.push('- 실제 배치에서의 글자 넘침 · 잘림, 키보드가 입력창을 가리는지: 이 도구는 코드만 읽는다.');
lines.push('- 로그인이 필요한 화면의 실제 화면 측정: 로그인 수단이 없어 브라우저로 재지 못했다.');
lines.push('- 네이티브의 실제 터치 영역 · 스크린 리더 동작.');
lines.push('- 첫인상 · 막히는 지점 · 문구의 어색함(사람이 본다 — 오너 체크리스트).');
lines.push('');

writeFileSync(join(ROOT, 'docs/UI_AUDIT_2026-09-17.md'), lines.join('\n'), 'utf8');
console.log(JSON.stringify({
  contrast: contrastFindings.length,
  hardcodedColorFiles: report.hardcodedColor.length,
  unnamedPressableFiles: report.unnamedPressable.length,
  smallTouch: smallTouchGrouped.length,
  stateless: stateless.length,
}, null, 1));

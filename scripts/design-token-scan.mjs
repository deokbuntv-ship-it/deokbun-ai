// 디자인 토큰 이탈 스캔 — 보고 도구. 아무것도 고치지 않는다.
//
// Claude Design 이 Visual Source of Truth 이고 색·타이포·간격은 `@/theme` 토큰으로만 쓰기로 돼 있다.
// 기존 잠금 테스트(`designFreezeFinal.test.ts`)는 **은퇴한 주황 hex** 와 **덕 수치 리터럴** 두 가지만
// 잠근다. 이 스캔은 그 바깥, 즉 "토큰이 있는데 숫자를 직접 쓴 자리" 전체를 센다.
//
// 왜 테스트가 아니라 스크립트인가: 범위가 65개 화면이고 정당한 예외가 섞여 있다. 지금 실패하는
// 테스트로 만들면 CI 를 빨갛게 두거나 예외 목록을 통째로 화이트리스트에 넣게 되는데, 둘 다 신호를
// 죽인다. 먼저 목록을 보고 어디를 고칠지 정하는 것이 순서다.
//
//   node scripts/design-token-scan.mjs            # 전체 요약
//   node scripts/design-token-scan.mjs --files    # 파일별 상세
//   node scripts/design-token-scan.mjs --only src/app/premium.tsx,src/app/support.tsx
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(process.cwd(), 'src');
const argv = process.argv.slice(2);
const SHOW_FILES = argv.includes('--files');
const ONLY = (argv.find((a) => a.startsWith('--only='))?.slice(7) ?? '').split(',').filter(Boolean);

// 주석은 규칙을 설명하면서 그 값을 정당하게 인용한다 — 코드만 본다 (designFreezeFinal 과 같은 방식).
const stripComments = (s) =>
  s
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/([^:])\/\/.*$/gm, '$1');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '__tests__') continue;
      walk(p, out);
    } else if (/\.tsx?$/.test(e.name) && !/\.d\.ts$/.test(e.name)) {
      out.push(p);
    }
  }
  return out;
}

// 토큰 정의 자체는 숫자를 가질 수밖에 없다 — 권위의 자리이므로 제외한다.
const IS_TOKEN_SOURCE = (rel) =>
  rel.startsWith('theme/') || rel === 'constants/theme.ts' || rel.startsWith('features/admin/adminTheme');

const RULES = [
  {
    id: 'hex',
    what: '색을 hex 로 직접 씀',
    re: /#[0-9a-fA-F]{3,8}\b/g,
    // SVG stroke/fill 에 'none' 대신 hex 를 넣는 아이콘, 그리고 투명도 표기는 흔한 정당 사례라
    // 별도로 세지 않고 전부 목록에 남긴다 — 판단은 사람이 한다.
  },
  { id: 'rgb', what: '색을 rgb()/rgba() 로 직접 씀', re: /\brgba?\(\s*\d/g },
  { id: 'fontSize', what: 'fontSize 를 숫자로 직접 씀', re: /\bfontSize:\s*\d+/g },
  { id: 'fontWeight', what: "fontWeight 를 문자열/숫자로 직접 씀", re: /\bfontWeight:\s*['"]?\d{3}['"]?/g },
  { id: 'fixedWidth', what: '고정 width 를 px 숫자로 씀', re: /\bwidth:\s*\d+(?!\s*%)/g },
  { id: 'fixedHeight', what: '고정 height 를 px 숫자로 씀', re: /\bheight:\s*\d+(?!\s*%)/g },
  { id: 'lineHeight', what: 'lineHeight 를 숫자로 직접 씀', re: /\blineHeight:\s*\d+/g },
];

const files = walk(SRC)
  .map((abs) => ({ abs, rel: path.relative(SRC, abs).replace(/\\/g, '/') }))
  .filter(({ rel }) => !IS_TOKEN_SOURCE(rel))
  .filter(({ rel }) => ONLY.length === 0 || ONLY.some((o) => o.replace(/\\/g, '/').endsWith(rel)));

const rows = [];
for (const { abs, rel } of files) {
  const code = stripComments(fs.readFileSync(abs, 'utf8'));
  const hits = {};
  for (const rule of RULES) {
    const found = code.match(rule.re);
    if (found?.length) hits[rule.id] = found.length;
  }
  const total = Object.values(hits).reduce((a, b) => a + b, 0);
  if (total > 0) rows.push({ rel, hits, total });
}
rows.sort((a, b) => b.total - a.total);

const area = (rel) =>
  rel.startsWith('app/admin') || rel.startsWith('features/admin') ? 'admin'
    : rel.startsWith('app/') ? 'consumer 화면'
      : rel.startsWith('components/') ? '공용 컴포넌트'
        : 'features';

const byRule = {};
const byArea = {};
for (const r of rows) {
  byArea[area(r.rel)] = (byArea[area(r.rel)] ?? 0) + r.total;
  for (const [k, n] of Object.entries(r.hits)) byRule[k] = (byRule[k] ?? 0) + n;
}

console.log(`스캔 대상: ${files.length}개 파일 (토큰 정의 파일 제외)\n`);
console.log('=== 규칙별 ===');
for (const rule of RULES) {
  console.log(`  ${String(byRule[rule.id] ?? 0).padStart(5)}  ${rule.id.padEnd(12)} ${rule.what}`);
}
console.log('\n=== 영역별 ===');
for (const [k, v] of Object.entries(byArea).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(v).padStart(5)}  ${k}`);
}
console.log(`\n이탈이 있는 파일: ${rows.length} / ${files.length}`);

if (SHOW_FILES) {
  console.log('\n=== 파일별 (많은 순) ===');
  for (const r of rows) {
    const detail = Object.entries(r.hits).map(([k, n]) => `${k}:${n}`).join(' ');
    console.log(`  ${String(r.total).padStart(4)}  ${r.rel.padEnd(62)} ${detail}`);
  }
} else {
  console.log('\n상위 15개 (--files 로 전체):');
  for (const r of rows.slice(0, 15)) {
    const detail = Object.entries(r.hits).map(([k, n]) => `${k}:${n}`).join(' ');
    console.log(`  ${String(r.total).padStart(4)}  ${r.rel.padEnd(62)} ${detail}`);
  }
}

// ── baseline 모드 (2026-09-06 추가) ───────────────────────────────────────────────────────────
//
// 429건이 남아 있고 일괄 수정은 회귀 위험이 크다. 그렇다고 아무것도 안 하면 계속 는다.
// freeze 가드(`release-preflight.mjs` §3b)와 **같은 방식**을 쓴다: 기준선을 파일에 박아 두고
// **늘어난 것만 이름으로 보여 준다.** ⚠ BLOCK 하지 않는다 — 429건에 게이트를 걸면 CI 가 항상
// 빨갛고, 빨간 CI 는 아무도 안 본다.
//
//   node scripts/design-token-scan.mjs --baseline        # 기준선 대비 증감
//   node scripts/design-token-scan.mjs --baseline --seal # 현재 상태를 새 기준선으로 봉인
const BASELINE_PATH = path.resolve(process.cwd(), '.token-baseline.json');
const BASELINE = argv.includes('--baseline');
const SEAL = argv.includes('--seal');

if (BASELINE) {
  const current = { total: rows.reduce((a, r) => a + r.total, 0), byRule, byFile: Object.fromEntries(rows.map((r) => [r.rel, r.total])) };

  if (SEAL) {
    fs.writeFileSync(BASELINE_PATH, `${JSON.stringify({
      '//': '디자인 토큰 이탈 기준선. `--baseline` 이 이 값과 현재를 비교한다.',
      '//why': '429건 대부분은 값이 토큰과 일치하는 출처 이탈이라 일괄 수정은 회귀 위험만 크다. 늘어나는 것만 막는다.',
      sealedAt: new Date().toISOString().slice(0, 10),
      ...current,
    }, null, 1)}\n`);
    console.log(`\n✅ 기준선 봉인: ${current.total}건 → .token-baseline.json`);
    process.exit(0);
  }

  if (!fs.existsSync(BASELINE_PATH)) {
    console.log('\n⚠ 기준선 파일이 없습니다. `--baseline --seal` 로 현재 상태를 봉인하세요.');
    process.exit(0);
  }
  const base = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  const delta = current.total - base.total;

  console.log(`\n=== 기준선 대비 (${base.sealedAt} 봉인) ===`);
  console.log(`  전체 ${base.total} → ${current.total}  (${delta > 0 ? `+${delta}` : delta})`);

  if (delta > 0) {
    console.log('\n⚠ WARN — 토큰 이탈이 늘었습니다. 새로 늘어난 자리:');
    for (const [rel, n] of Object.entries(current.byFile)) {
      const was = base.byFile?.[rel] ?? 0;
      if (n > was) console.log(`    +${n - was}  ${rel}  (${was} → ${n})`);
    }
    for (const rule of RULES) {
      const was = base.byRule?.[rule.id] ?? 0;
      const now = byRule[rule.id] ?? 0;
      if (now > was) console.log(`    규칙 ${rule.id}: ${was} → ${now}`);
    }
    console.log('\n  새 코드는 `@/theme` 토큰을 쓰세요. 의도한 증가라면 `--baseline --seal` 로 기준선을 옮기십시오.');
  } else if (delta < 0) {
    console.log(`\n✅ ${-delta}건 줄었습니다. \`--baseline --seal\` 로 기준선을 낮춰 두면 되돌아가는 것을 막습니다.`);
  } else {
    console.log('\n  증가 없음.');
  }
  // ⚠ 어떤 경우에도 non-zero exit 하지 않는다 — CI 게이트가 아니다.
  process.exit(0);
}

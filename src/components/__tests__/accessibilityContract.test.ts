// 접근성 회귀 방지 — 소스 계약.
//
// 2026-09-06 에 같은 클래스의 결함을 네 번 잡았다. 전부 **네이티브에서는 동작하고 웹에서만 조용히
// 아무 일도 안 하거나, 시각적으로는 멀쩡한데 보조기술에는 없는** 종류였고, 이 앱은 웹을 정적 빌드로
// 실제 배포한다.
//
//   ① `Input` 의 보이는 `label` 이 입력칸과 연결돼 있지 않았다 → 이름 없는 입력칸 (출생정보 폼 전체)
//   ② `accessibilityState={{checked|selected|disabled|expanded|busy}}` 를 **react-native-web 0.21 이
//      aria-* 로 매핑하지 않는다** → 체크·선택·비활성 상태가 전혀 노출되지 않았다. 16곳 전부 무음 no-op
//   ③ 맨 `<TextInput>` 5곳에 이름이 없었다 (홈 질문 입력칸 포함)
//   ④ `<Switch>` 7곳 중 6곳에 이름이 없었다 → "스위치, 꺼짐" 으로만 읽혔다
//
// 넷 다 렌더 테스트가 `getByLabelText` 실패로 알려 줬지만, 렌더 테스트가 없는 화면에서는 아무도
// 모른다. 그래서 소스 수준에서 막는다.
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '../..');

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(path.join(SRC, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) {
      if (e.name === '__tests__') continue;
      walk(rel, out);
    } else if (e.name.endsWith('.tsx')) {
      out.push(rel);
    }
  }
  return out;
}

const TSX = [...walk('app'), ...walk('components'), ...walk('features')];
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');
// 주석은 규칙을 설명하며 그 이름을 정당하게 인용한다 — 코드만 본다.
const code = (rel: string) =>
  read(rel)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/([^:])\/\/.*$/gm, '$1');

const NAMED = /accessibilityLabel|aria-label|accessibilityLabelledBy/;

/** 자기 닫는 태그를 전부 모은다. 하나도 못 잡으면 계약이 조용히 통과하므로 개수도 함께 돌려준다. */
function selfClosingTags(tag: string): { offenders: string[]; total: number } {
  const re = new RegExp(`<${tag}\\b[\\s\\S]*?/>`, 'g');
  const offenders: string[] = [];
  let total = 0;
  for (const rel of TSX) {
    for (const m of code(rel).matchAll(re)) {
      total += 1;
      if (!NAMED.test(m[0])) offenders.push(rel);
    }
  }
  return { offenders: [...new Set(offenders)], total };
}

describe('⚠ accessibilityState 는 웹에서 무시된다 — aria-* 를 쓸 것', () => {
  it('어떤 화면·컴포넌트도 accessibilityState 를 쓰지 않는다', () => {
    const offenders = TSX.filter((rel) => /accessibilityState/.test(code(rel)));
    // react-native-web 0.21 실측: accessibilityState 를 주면 role 과 aria-label 만 나가고
    // aria-checked / aria-selected / aria-disabled / aria-expanded 는 **생성되지 않는다**.
    // RN 0.71+ 는 aria-* 를 1급 프로퍼티로 받으므로 aria-* 한 형태가 양 플랫폼을 덮는다.
    expect(offenders).toEqual([]);
  });
});

describe('⚠ 입력 컴포넌트는 접근 가능한 이름을 가져야 한다', () => {
  it('Input 은 보이는 label 을 accessibilityLabel 로 채운다', () => {
    expect(code('components/Input/Input.tsx')).toMatch(/accessibilityLabel=\{rest\.accessibilityLabel \?\? label\}/);
  });

  it('맨 TextInput 을 이름 없이 쓰는 화면이 없다', () => {
    const { offenders, total } = selfClosingTags('TextInput');
    expect(offenders).toEqual([]);
    // 정규식이 하나도 못 잡아 조용히 통과하는 것을 막는다.
    expect(total).toBeGreaterThanOrEqual(5);
  });
});

describe('⚠ Switch 는 무엇을 켜고 끄는지 이름으로 밝힌다', () => {
  it('이름 없는 Switch 가 없다', () => {
    // 옆에 보이는 <Text> 가 있어도 프로그램적으로 연결돼 있지 않으면 "스위치, 꺼짐" 으로만 읽힌다.
    const { offenders, total } = selfClosingTags('Switch');
    expect(offenders).toEqual([]);
    expect(total).toBeGreaterThanOrEqual(7);
  });
});

describe('상호작용 요소는 역할을 밝힌다', () => {
  it('Pressable 에 접근 이름이 있으면 역할도 함께 준다', () => {
    const offenders: string[] = [];
    let named = 0;
    for (const rel of TSX) {
      for (const m of code(rel).matchAll(/<Pressable\b[\s\S]*?(?:\/>|>)/g)) {
        const tag = m[0];
        if (!/accessibilityLabel|aria-label/.test(tag)) continue;
        named += 1;
        if (!/accessibilityRole|\brole=/.test(tag)) offenders.push(`${rel} :: ${tag.slice(0, 60).replace(/\s+/g, ' ')}`);
      }
    }
    expect(offenders).toEqual([]);
    expect(named).toBeGreaterThanOrEqual(10);
  });
});

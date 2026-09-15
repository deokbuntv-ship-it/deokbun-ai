// 관리자 콘솔은 다크 분기가 없다 — adminTheme 고정.
//
// 소비자 화면은 `useColorScheme` 으로 라이트/다크를 갈라 쓰지만 관리자 콘솔은 고정 팔레트다
// (`features/admin/adminTheme`). 이번 범위는 "확인만 한다" 였고, 확인한 사실을 여기 잠가 둔다.
//
// ⚠ 왜 렌더 테스트(`adminCore.render.test.tsx`)가 아니라 여기인가: `tsconfig.json` 의 exclude 는
// `**/*.test.ts` 뿐이라 `.tsx` 테스트는 앱 tsconfig(node 타입 없음)로도 타입 검사된다. 소스 스캔에
// 필요한 `fs` import 가 거기서는 TS2591 이 된다. `designFreezeFinal.test.ts` 가 `.ts` 인 것도 같은 이유다.
import * as fs from 'fs';
import * as path from 'path';

const SCREENS = ['admin/index.tsx', 'admin/users/index.tsx', 'admin/consultations/index.tsx'];

describe('관리자 핵심 3화면은 adminTheme 만 쓴다', () => {
  it.each(SCREENS)('%s — useColorScheme 분기가 없다', (rel) => {
    const src = fs.readFileSync(path.join(process.cwd(), 'src/app', rel), 'utf8');
    expect(src).toContain('adminTheme');
    expect(src).not.toContain('useColorScheme');
  });
});

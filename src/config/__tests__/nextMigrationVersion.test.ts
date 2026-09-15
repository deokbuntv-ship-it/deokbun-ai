// 새 마이그레이션 번호 — ⚠ **합성 반례만 쓴다.** 실제 폴더를 읽으면 파일이 늘 때마다 깨진다.
//
// ⚠ 번호는 **날짜가 아니라 순번**이다(CTO 2026-09-10). 이력에 8월 32~47일이 있다.
// 세 상황을 지정받았다: 더 큰 번호가 이미 있을 때 / 없을 때 / 같은 실행에서 두 번.
import { nextMigrationVersion, versionsOf } from '../nextMigrationVersion';

describe('번호 골라내기', () => {
  it.each([
    ['정상 파일명', '20260915000000_model_pricing.sql', true],
    ['⚠ 날짜가 아닌 번호도 번호다 (8월 32일)', '20260832000000_duk_economy_runtime.sql', true],
    ['⚠ 8월 47일', '20260847000000_x.sql', true],
    ['자릿수 부족', '2026091200000_x.sql', false],
    ['숫자가 아님', 'README.md', false],
  ])('%s', (_l, name, want) => {
    expect(versionsOf([name]).length === 1).toBe(want);
  });
});

describe('다음 번호', () => {
  it('⚠ 레포 최대보다 크다 — 앞 8자리를 하나 올린다', () => {
    const v = nextMigrationVersion(['20260909000000_a.sql', '20260915000000_model_pricing.sql']);
    expect(v).toBe('20260916000000');
    expect(v > '20260915000000').toBe(true);
  });

  it('⚠ 날짜가 아닌 번호가 최대여도 규칙이 같다', () => {
    // 8월 32~47일이 실제로 이 레포에 있다. 날짜로 파싱하려 들면 여기서 깨진다.
    expect(nextMigrationVersion(['20260847000000_x.sql'])).toBe('20260848000000');
  });

  it('⚠ 사전순 최댓값을 쓴다 — 목록 순서에 흔들리지 않는다', () => {
    const files = ['20260915000000_z.sql', '20260817000000_a.sql', '20260832000000_m.sql'];
    expect(nextMigrationVersion(files)).toBe('20260916000000');
    expect(nextMigrationVersion([...files].reverse())).toBe('20260916000000');
  });

  it('⚠ 연달아 두 번 — 두 번째가 첫 번째보다 뒤다', () => {
    const files = ['20260915000000_a.sql'];
    const first = nextMigrationVersion(files);
    const second = nextMigrationVersion([...files, `${first}_b.sql`]);
    expect(first).toBe('20260916000000');
    expect(second).toBe('20260917000000');
    expect(second > first).toBe(true);
  });

  it('세 번째도 이어진다', () => {
    expect(nextMigrationVersion(['20260916000000_a.sql', '20260917000000_b.sql'])).toBe('20260918000000');
  });

  it('⚠ 뒤 6자리가 0 이 아닌 번호가 최대여도 그보다 크다', () => {
    const v = nextMigrationVersion(['20260904000400_a.sql']);
    expect(v).toBe('20260905000000');
    expect(v > '20260904000400').toBe(true);
  });

  it('파일이 하나도 없으면 레포의 첫 번호에서 시작한다', () => {
    expect(nextMigrationVersion([])).toBe('20260818000000');
  });

  it('14자리가 아닌 이름은 무시한다', () => {
    expect(nextMigrationVersion(['README.md', 'notes.txt', '20260915000000_a.sql'])).toBe('20260916000000');
  });

  it('⚠ 현재 시각을 보지 않는다 — 시계를 옮겨도 답이 같다', () => {
    const files = ['20260915000000_a.sql'];
    const a = nextMigrationVersion(files);
    const b = nextMigrationVersion(files);
    expect(a).toBe(b);
    // 오늘(2026-09-10)로 만들었다면 기존 파일보다 앞에 끼어들었을 것이다.
    expect(a > '20260915000000').toBe(true);
  });
});

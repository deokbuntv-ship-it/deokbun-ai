// production 통합 적용 패키지 동결 (2026-09-13).
// CTO 판정: 대화·리포트 삭제 묶음이 패키지의 마지막 변경이고, 그 뒤로는 동결한다. 패키지
// (docs/PRODUCTION_APPLY_PACKAGE_2026-09-12.md)가 production 에 올리는 파일은 문서 끝 「동결 목록」의
// SHA-256 과 글자까지 같아야 한다. 이 테스트가 깨지면 동결된 파일을 고친 것이다 — 되돌리거나, CTO 판정을
// 받아 패키지를 다시 발행한다(목록도 그때 다시 만든다). 패키지를 production 에 적용한 뒤에는 이 파일을 지운다.
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../../../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
const DOC = read('docs/PRODUCTION_APPLY_PACKAGE_2026-09-12.md');
// 줄바꿈을 LF 로 맞춘 뒤 잰다 — Windows 체크아웃(core.autocrlf)의 CRLF 와 무관하게 같은 값
const sha256 = (rel: string) => createHash('sha256').update(read(rel)).digest('hex');

const MANIFEST = [...DOC.matchAll(/^([0-9a-f]{64}) {2}(\S+)$/gm)].map((m) => ({ sha: m[1], file: m[2] }));
const DRY_RUN = [...DOC.matchAll(/^ • (\d{14}_\w+\.sql)$/gm)].map((m) => m[1]);
const PROD_HISTORY_END = '20260913000000'; // production 이력의 끝 (②-2 의 기대)
const migrationsIn = (files: string[]) => files.filter((f) => f.startsWith('supabase/migrations/')).map((f) => path.basename(f));

describe('production 패키지 동결', () => {
  it('동결 목록 — 마이그레이션 9 · Edge 8', () => {
    expect(migrationsIn(MANIFEST.map((e) => e.file))).toHaveLength(9);
    expect(MANIFEST.filter((e) => e.file.startsWith('supabase/functions/'))).toHaveLength(8);
  });

  it.each(MANIFEST.map((e) => [e.file, e.sha]))('%s — 동결 때와 같다', (file, sha) => {
    expect(sha256(file)).toBe(sha);
  });

  it('②-3 dry-run 목록 = 레포의 새 마이그레이션 = 동결 목록의 마이그레이션', () => {
    const repo = fs.readdirSync(path.join(ROOT, 'supabase/migrations'))
      .filter((f) => f.endsWith('.sql') && f.slice(0, 14) > PROD_HISTORY_END)
      .sort();
    expect(DRY_RUN).toEqual(repo);
    expect(migrationsIn(MANIFEST.map((e) => e.file))).toEqual(repo);
  });

  it('⑤ · ⑦-2 가 배포하는 Edge 넷의 진입 파일이 동결 목록에 있다', () => {
    // 2026-09-14 #2: 오너 PC(PowerShell 5.1)에서 도는 모양 — `npx.cmd supabase@<판> functions deploy …`
    const deployed = [...DOC.matchAll(/^npx(?:\.cmd)? supabase(?:@[\d.]+)? functions deploy (\S+)/gm)].map((m) => m[1]);
    expect([...new Set(deployed)].sort()).toEqual(['chat', 'google-rtdn', 'iap-reconcile', 'verify-purchase']);
    for (const fn of deployed) expect(MANIFEST.map((e) => e.file)).toContain(`supabase/functions/${fn}/index.ts`);
  });

  it('⚠ 22 되돌리기 — 21 의 트리거 함수 본문을 글자 그대로 되살린 뒤에 연결 칸을 지운다', () => {
    const m21 = read('supabase/migrations/20260921000000_answer_retention_and_preview.sql');
    const start = m21.indexOf('create or replace function public.purge_conversation_answers()');
    const body21 = m21.slice(start, m21.indexOf('$$;', start) + 3);
    const revert = DOC.slice(DOC.indexOf('### 22 — 대화 삭제'), DOC.indexOf('### 21 — '));
    expect(body21.length).toBeGreaterThan(500);
    expect(revert).toContain(body21);
    expect(revert.indexOf(body21)).toBeLessThan(revert.indexOf('drop column if exists conversation_id'));
    expect(revert).toMatch(/^begin;$/m);
    expect(revert).toMatch(/^commit;$/m);
  });
});

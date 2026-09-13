// 대화 삭제 기능 (마이그레이션 20260922000000) — SQL · Edge · 클라이언트의 **소스 계약**.
//
// ⚠ 실제 동작은 staging 실측이 했다 (보고서 2026-09-13): 상담·궁합·요약 세 종류의 답이 모두 대화에
//   연결되고, 대화를 지우면 셋 다 즉시 원문이 지워진다(100%). 이 파일은 그 구조를 잠근다.
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../../../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const noSqlComments = (s: string) => s.split('\n').filter((l) => !/^\s*--/.test(l)).join('\n');

const SQL = noSqlComments(read('supabase/migrations/20260922000000_conversation_delete.sql'));
const EDGE = read('supabase/functions/chat/index.ts');
const fnBody = (src: string, head: string) => {
  const at = src.indexOf(head);
  expect(at).toBeGreaterThan(-1);
  return src.slice(at, src.indexOf('$$;', src.indexOf('$$', at) + 2));
};

describe('DB — 이용자가 자기 대화를 지운다', () => {
  it('삭제 정책은 authenticated 의 자기 행뿐이다', () => {
    expect(SQL).toMatch(/create policy conversations_delete_own on public\.conversations\s+for delete to authenticated\s+using \(user_id = auth\.uid\(\)\)/);
    expect(SQL).toMatch(/drop policy if exists conversations_delete_own on public\.conversations/);
  });

  it('⚠ 재전송 행의 대화 연결 칸에는 외래키가 없다 — 연결이 틀려도 요청이 실패하면 안 된다', () => {
    const line = SQL.match(/alter table public\.paid_request_idempotency add column if not exists conversation_id uuid[^;]*;/);
    expect(line).not.toBeNull();
    expect((line as RegExpMatchArray)[0]).not.toMatch(/references/i);
    expect(SQL).toMatch(/create index if not exists paid_request_idempotency_conversation_idx/);
  });

  it('대화를 지우면 그 대화의 답 원문을 연결 칸 **또는** 판단 기록으로 찾는다 — 남의 행은 못 건드린다', () => {
    const f = fnBody(SQL, 'create or replace function public.purge_conversation_answers');
    expect(f).toMatch(/where i\.user_id = old\.user_id\s+and i\.status = 'COMPLETED'\s+and \(i\.conversation_id = old\.id\s+or exists \(select 1 from public\.consultation_decisions d/);
    expect(f).toMatch(/set status = 'EXPIRED', response_json = null/);
  });

  it('⚠ 증인은 남긴다 — 리포트가 남으므로(CTO), 지우면 남은 리포트의 공유가 빈 페이지가 된다', () => {
    const f = fnBody(SQL, 'create or replace function public.purge_conversation_answers');
    expect(f).not.toMatch(/consultation_answer_witness/);
  });

  it('그 대화 리포트의 공유는 해지 + 스냅샷 비움 (리포트 자체는 남는다)', () => {
    const f = fnBody(SQL, 'create or replace function public.purge_conversation_answers');
    expect(f).toMatch(/set status = 'revoked', revoked_at = coalesce\(s\.revoked_at, now\(\)\), shared_payload = null/);
    expect(f).not.toMatch(/delete from public\.consultation_reports/);
  });

  it('BEFORE DELETE 그대로 — 연결 칸이 생기기 전의 답은 판단 기록으로만 찾는다', () => {
    expect(SQL).toMatch(/create trigger conversations_purge_answers\s+before delete on public\.conversations/);
    expect(SQL).toMatch(/drop trigger if exists conversations_purge_answers on public\.conversations/);
  });

  it('멱등성 — 시드 없음', () => {
    expect(SQL).not.toMatch(/insert into public\.\w+ \([^)]*\) values/);
  });

  it('⚠ 궁합 답 연결 RPC — 호출자 자신의 궁합 답을 호출자 자신의 대화에, 아직 연결 안 된 행만', () => {
    const f = fnBody(SQL, 'create or replace function public.link_compatibility_answer');
    expect(f).toMatch(/security definer/);
    expect(f).toMatch(/where i\.user_id = auth\.uid\(\)\s+and i\.workload = 'compatibility'\s+and i\.request_id = p_request_id\s+and i\.conversation_id is null\s+and exists \(select 1 from public\.conversations c\s+where c\.id = p_conversation_id and c\.user_id = auth\.uid\(\)\)/);
    expect(f).toMatch(/if auth\.uid\(\) is null or p_request_id is null or p_conversation_id is null then\s+return false;/);
    expect(SQL).toMatch(/revoke all on function public\.link_compatibility_answer\(text, uuid\) from public, anon/);
    expect(SQL).toMatch(/grant execute on function public\.link_compatibility_answer\(text, uuid\) to authenticated/);
  });
});

describe('Edge — 소유가 확인된 대화만 연결한다', () => {
  const acquire = EDGE.slice(EDGE.indexOf('async function acquirePaidRequest'), EDGE.indexOf('async function releasePaidRequest'));

  it('연결은 획득·예약이 모두 성공한 뒤, 실패해도 요청을 막지 않는다', () => {
    expect(acquire).toMatch(/conversationId: string \| null = null/);
    const link = acquire.indexOf(".update({ conversation_id: conversationId })");
    expect(link).toBeGreaterThan(acquire.indexOf("if (global.status !== 'allowed')"));
    expect(link).toBeLessThan(acquire.indexOf("return { status: 'acquired'"));
    expect(acquire.slice(acquire.indexOf('if (conversationId) {'), acquire.indexOf("return { status: 'acquired'"))).toMatch(/try \{[\s\S]*\} catch/);
  });

  it('상담·궁합 — verifyOwnedConversation 을 지난 id 를 넘긴다', () => {
    expect(EDGE).toMatch(/if \(suppliedConversationId && !await verifyOwnedConversation\(admin, userId, suppliedConversationId\)\)/);
    expect(EDGE).toMatch(/acquirePaidRequest\(admin, userId, requestWorkload, requestId, verifiedConversationId\)/);
  });

  it('⚠ 요약 — 앱이 보낸 id 는 소유를 확인한 뒤에만 연결한다 (요약 자체는 대화를 읽지 않는다)', () => {
    const summary = EDGE.slice(EDGE.indexOf("if (body.mode === 'summary')"), EDGE.indexOf("acquirePaidRequest(admin, userId, 'summary', requestId, summaryConversationId)"));
    expect(summary).toMatch(/await verifyOwnedConversation\(admin, userId, body\.conversationId\)/);
    expect(EDGE).toMatch(/acquirePaidRequest\(admin, userId, 'summary', requestId, summaryConversationId\)/);
  });

  it('프리미엄은 대화가 없다 — 연결하지 않는다', () => {
    expect(EDGE).toMatch(/acquirePaidRequest\(admin, userId, 'chat', requestId\);/);
  });
});

describe('클라이언트 — 요약은 대화 id 를 보내고, 삭제는 지워진 행으로 판정한다', () => {
  it('⚠ 궁합 — 대화를 확보하고 메시지를 저장한 **뒤에** 그 답을 연결한다 (첫 답 때는 대화가 없었다)', () => {
    const screen = read('src/app/compatibility-chat.tsx');
    const persist = screen.slice(screen.indexOf('const persistPair = async ('), screen.indexOf('const send = async'));
    const link = persist.indexOf('conversationService.linkCompatibilityAnswer(cid, requestId)');
    expect(link).toBeGreaterThan(persist.indexOf('await conversationService.saveMessage(cid'));
    expect(screen).toMatch(/void persistPair\(userMsg, assistantMsg, result\.compatibility \?\? tier, result\.requestId\)/);
    const svc = read('src/features/chat/services/conversationService.ts');
    expect(svc).toMatch(/supabase\.rpc\('link_compatibility_answer', \{\s+p_request_id: requestId,\s+p_conversation_id: conversationId,\s+\}\)/);
    expect(svc).toMatch(/return !error && data === true;/);
  });

  it('요약 요청이 요약하는 대화를 함께 보낸다', () => {
    expect(read('src/features/chat/adapters/supabaseEdgeSummaryAdapter.ts')).toMatch(/\.\.\.\(conversationId \? \{ conversationId \} : \{\}\)/);
    expect(read('src/features/chat/hooks/useConversationPersistence.ts')).toMatch(/result\.messagesToSummarize,\s+conversationId,\s+\)/);
  });

  it.each([
    ['conversationService.deleteConversation', 'src/features/chat/services/conversationService.ts', 'async function deleteConversation'],
    ['reportService.deleteReport', 'src/features/chat/report/reportService.ts', 'async function deleteReport'],
  ])('⚠ %s — HTTP 상태가 아니라 돌아온 행 1개로 판정한다 (0행 삭제도 성공 상태로 온다)', (_n, file, head) => {
    const src = read(file);
    const body = src.slice(src.indexOf(head), src.indexOf('\n}\n', src.indexOf(head)));
    expect(body).toMatch(/\.delete\(\)/);
    expect(body).toMatch(/\.select\('id'\)/);
    expect(body).toMatch(/Array\.isArray\(data\) && data\.length === 1/);
  });

  it('보고서 삭제에 새 마이그레이션이 필요 없는 근거 — 소유자 정책이 FOR ALL 이고 공유는 CASCADE', () => {
    const reports = noSqlComments(read('supabase/migrations/20260818000200_consultation_reports.sql'));
    expect(reports).toMatch(/create policy reports_all_own on public\.consultation_reports\s+for all using \(user_id = auth\.uid\(\)\) with check \(user_id = auth\.uid\(\)\)/);
    const shares = noSqlComments(read('supabase/migrations/20260818000300_report_shares.sql'));
    expect(shares).toMatch(/report_id\s+uuid not null references public\.consultation_reports \(id\) on delete cascade/);
  });
});

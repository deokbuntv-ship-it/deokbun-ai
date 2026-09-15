-- ════════════════════════════════════════════════════════════════════════════
-- global_reservation_requests 잠금 — 형제 테이블과 같은 방식
-- ════════════════════════════════════════════════════════════════════════════
--
-- 무엇을 고치는가
--   `20260836000000` 이 이 테이블을 만들 때 **RLS·revoke·grant 를 한 줄도 걸지 않았습니다.**
--   같은 파일이 래퍼 **함수에는** revoke 를 정확히 겁니다(63~64행). 함수만 잠그고 테이블을
--   빠뜨린 누락입니다. 마이그레이션이 만드는 테이블 57개 중 RLS 를 안 켜는 유일한 테이블이었고,
--   production 사전점검 `6_rls` 도 이 테이블 하나만 지목했습니다.
--
-- 왜 급한가 — 지출 상한이 아니라 **비상 정지**가 우회됩니다
--   `request_id` 는 클라이언트가 정합니다(`chat/index.ts` `body.requestMetadata.requestId`).
--   그 값으로 행을 미리 넣어 두면 래퍼가 `IDEMPOTENT_REPLAY` 로 **즉시 반환**하고 실제 예약
--   함수를 아예 부르지 않습니다. 시간·일 상한뿐 아니라 `GENERATION_DISABLED` 판정도
--   지나갑니다 — `set_global_generation_guard(false, …)`, 지출 폭주 시의 비상 정지가
--   이 경로에는 걸리지 않습니다. `user_id` 가 JWT 와 일치하는지 확인하지 않으므로
--   로그인도 필요 없습니다.
--
--   2026-09-04 staging 실측(앱에 실려 나가는 공개 anon 키): 읽기 200 · **718행 전부 노출**,
--   쓰기 권한 있음. 형제 테이블 `global_paid_generation_reservations` 는 둘 다 401 차단.
--
-- 무엇을 하지 않는가
--   **정책을 만들지 않습니다.** RLS 를 켜고 정책이 없으면 일반 롤은 0행이 됩니다 — 그것이 의도입니다.
--   이 테이블은 사용자가 직접 읽을 것이 없습니다(가드 내부 장부).
--
--   `force row level security` 도 걸지 않습니다. 이 레포에서 force 는 정책을 가진 사용자 데이터
--   테이블 3개에만 씁니다. 여기서 force 를 걸면 **소유자(postgres)로 도는 `security definer`
--   함수까지 막혀 상담이 멈춥니다.** 형제 테이블도 force 를 걸지 않습니다.
--
-- 접근 경로가 계속 살아 있어야 하는 곳 (둘 다 `security definer`)
--   `reserve_global_paid_generation_idem`  select(42행) · insert(54행)
--   `delete_user_account`                  delete(`20260903000000` 180행)
--   → grant 를 select, insert, delete 로 잡습니다. 형제 테이블과 같은 조합입니다.
--
-- 되돌리기: 아래 세 줄의 반대를 실행하면 됩니다. 데이터는 건드리지 않습니다.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.global_reservation_requests enable row level security;

revoke all on table public.global_reservation_requests from public, anon, authenticated;

grant select, insert, delete on table public.global_reservation_requests to service_role;


-- ── ai_usage_logs — 재현성 부채만 갚습니다. 살아 있는 환경에는 아무 일도 일어나지 않습니다 ──
--
-- 판단: **RLS 켜기만 넣고 revoke/grant 는 넣지 않습니다.**
--
-- 왜 켜기는 넣는가
--   staging·production 모두 이미 켜져 있습니다(사전점검 `6_rls` 가 이 테이블을 지목하지 않았고,
--   staging 익명 쓰기는 42501 "violates row-level security policy" 로 막힙니다).
--   그런데 **레포의 어떤 마이그레이션도 켜지 않습니다** — 실제 테이블은 `docs/admin/ADMIN_04_SETUP.sql`
--   이 만들었고 `20260902000000` 은 live 스키마를 읽어 컬럼만 기록한 것입니다([[KNOWN_RISKS]] M4).
--   즉 **마이그레이션만으로 새 환경을 만들면 이 테이블이 활짝 열립니다.** 이 한 줄이 그것을 막습니다.
--   살아 있는 두 환경에서는 이미 켜져 있으므로 **완전한 no-op** 입니다.
--
-- 왜 revoke/grant 는 넣지 않는가
--   `20260902000000` 머리말이 스스로 밝혔듯 **레포는 이 테이블의 진짜 grant 집합을 모릅니다.**
--   모르는 것을 근거로 살아 있는 production 의 권한을 회수하는 것은, 문서 부채를 장애로 바꾸는
--   가장 흔한 방법입니다. 정책도 만들지 않습니다 — 같은 이유입니다.
--
-- 안 깨지는 근거 (경로를 전부 확인했습니다)
--   쓰기  `chat` · `content-generate` · `famous-compose` · `famous-suggest` 전부 service_role → RLS 우회
--   읽기  `admin_daily_activity` · `admin_overview` 등 **security definer** 함수 경유 → RLS 우회
--   클라이언트가 이 테이블을 직접 읽는 곳은 없습니다(`src/` 전체에 주석 한 줄뿐).
--   트리거 `trg_ad_on_chat_success` 도 테이블에 붙은 것이라 RLS 와 무관합니다.

alter table public.ai_usage_logs enable row level security;

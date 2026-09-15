# 설계 ② — 채널 꼬리표 `?src=` 추적 (2026-09-14 · 구현 금지 · production 세션 뒤 다음 패키지)

> 목적: 숏폼 · 블로그 같은 **무료 채널**에서 온 방문을 **채널 · 영상별**로 세고, 그 방문이 **가입 · 첫 상담**까지 갔는지 잇는다.
> 광고(`?ad=`)와 **섞지 않는다** — 광고 비용 지표(CPA)가 오염되면 안 되기 때문이다. 대신 광고 추적의 **길을 그대로 쓴다.**

## 1. 지금 있는 광고 추적 — 그대로 재사용할 것

| 단계 | 광고 `?ad=` (있음) | 근거 |
|---|---|---|
| 코드 | `ad_` + 8자(헷갈리는 글자 뺀 30자 알파벳) · 관리자가 만든다 | `src/features/ads/trackingCode.ts` · 표 `advertisements.public_tracking_code` |
| 착지 | `?ad=` 또는 `utm_content=ad_…` 를 읽는다 | `src/features/ads/trackingUrl.ts` `parseTrackingCodeFromQuery` |
| 보관 | 첫 접촉만 · sessionStorage · 6시간 · OAuth 팝업을 넘어 산다 | `src/features/ads/acquisition/acquisitionContext.ts` |
| 클릭 기록 | 클라이언트는 `{kind, code, visitorId}` 만 보냄 → **서버가** 코드 확인 · 봇 거름 · 방문자당 횟수 제한 · 기록 | `supabase/functions/ad-track` (verify_jwt=false) · 표 `ad_tracking_events` |
| 사용자 연결 | 로그인 뒤 `kind='attribution'` — **JWT 로 확인한 사용자만**(보낸 userId 는 믿지 않는다) → 사용자당 한 줄 | 같은 Edge · 표 `user_acquisition_attribution` |
| 가입 · 첫 상담 | **DB 트리거**가 만든다(클라이언트는 주장할 수 없다) — 가입은 "계정이 클릭 뒤에 생겼을 때만"(기존 사용자는 오염 안 함), 첫 상담은 `ai_usage_logs` 의 첫 `request_type='chat'` 성공 | `20260904000400_advertisements_acquisition.sql` `ad_reconcile_attribution` · `ad_on_chat_success` · `ad_on_birth_info` |
| 성과 | 관리자 RPC `admin_ad_performance` → 클릭 · 순방문 · 생년 입력 · 가입 · 첫 상담 · D1/7/30 | 같은 파일 · `src/features/ads/funnel.ts` · `adMetrics.ts` |

(현재 `chat` Edge 는 상담 · 궁합 · 프리미엄 · 요약을 `request_type='chat'` 으로 남긴다 — 첫 상담 트리거가 그대로 동작한다.)

## 2. 설계

### 2-1 코드와 주소

- 채널 꼬리표 = **`src_` + 8자**(광고와 같은 알파벳 · `trackingCode.ts` 에 접두사 인자만 더한다). 예: `https://www.deokbunai.com/?src=src_7k3m9p2q`
- **등록제**(관리자가 만든다) — 자유 문자열(`?src=yt-abc`)은 누구나 지어내 지표를 오염시킬 수 있어 받지 않는다. 모르는 코드는 조용히 무시(목록 추측 방지 · 광고와 같다).
- 표 `channel_sources`: `id` · `code`(유일) · `channel`(`youtube` · `instagram` · `tiktok` · `threads` · `naver_blog` · `kakao` · `other`) ·
  `content_ref`(영상 id · 주소) · `title` · `active` · `created_by` · `created_at`. 관리자만(`is_admin()`).
- `?ad=` 와 `?src=` 가 **함께** 오면 둘 다 받는다 — 서로 다른 칸에 기록한다.

### 2-2 클라이언트 (광고 코드 옆에 한 칸 더)

| 파일 | 바뀌는 것 |
|---|---|
| `trackingUrl.ts` | `parseSourceCodeFromQuery(search)` — `?src=` 만, `src_` 형식 검사 |
| `acquisitionContext.ts` | 두 번째 칸 `deokbun.acquisition.src` — 광고와 **같은 규칙**(첫 접촉 · 6시간 · sessionStorage · 네이티브는 메모리) |
| `acquisitionService.ts` | `recordSourceClick(code, visitorId)` → `ad-track` `{kind:'src_click'}` · 로그인 뒤 `{kind:'src_attribution'}` |
| `AcquisitionBridge.tsx` | 착지 때 두 코드를 각각 잡는다 |

### 2-3 서버

- **Edge `ad-track`**: `kind` 둘 추가 — `src_click`(코드 → `channel_sources` 활성 확인 · 같은 봇 거름 · 같은 횟수 제한) ·
  `src_attribution`(JWT 로 확인한 사용자 · 첫 접촉 칸이 비었을 때만 채움 · 최근 접촉은 늘 갱신).
- **`ad_tracking_events`**: `source_id uuid references channel_sources(id) on delete set null` · `event_type` 에 `'src_click'` 추가.
  광고 클릭(`ad_click`)과 **다른 이름**이라 `admin_ad_performance` 숫자는 한 글자도 안 바뀐다.
- **`user_acquisition_attribution`**: `first_source_id` · `first_source_code` · `first_source_visitor_id` · `first_source_touch_at` ·
  `latest_source_id` · `latest_source_touch_at`.
- **가입 증거(`ad_reconcile_attribution`)**: "서버가 기록한 첫 클릭" 을 `ad_click` **또는 `src_click`** 으로 넓힌다 —
  광고 없이 채널로만 온 신규 가입도 가입으로 잡히게. 기존 사용자 오염 방지 규칙(계정 생성 ≥ 첫 클릭)은 그대로.
- **첫 상담 · 생년 입력**: 트리거는 **사용자 단위**라 바꿀 것이 없다 — 채널별 숫자는 `first_source_id` 로 묶어 센다.
- **관리자 RPC `admin_channel_performance(p_from, p_to)`**: `admin_ad_performance` 를 본떠 `first_source_id` 기준 —
  클릭 · 순방문 · 생년 입력 · 가입 · 첫 상담 · D1/7/30. **채널 합계 · 영상별** 두 층.

### 2-4 관리자 화면

- "채널 · 영상 꼬리표" — 등록 폼(채널 · 영상 주소 · 제목) → 주소 카드(`TrackingUrlCard` 재사용 · 복사 · QR) → 성과 표(채널 · 영상별, `funnel.ts` · `adMetrics.ts` 의 순수 함수 재사용).
- 숏폼 공장 연동(영상 올릴 때 꼬리표 자동 발급)은 **이번 설계 밖** — 대량 등록은 백로그 C4 와 같이 본다.

### 2-5 한계 (알고 남긴다)

- **웹 착지만 센다.** 스토어에서 받은 앱의 첫 실행에는 주소가 없다(설치 유입은 백로그 A2 — 유료 SDK 필요).
- 한 방문자가 여러 영상을 거쳐 오면 **첫 접촉**만 가입에 붙는다(광고와 같은 규칙). 최근 접촉은 따로 남는다.

### 2-6 문서

- 처리방침 §1 "유입 경로(캠페인) 정보" → "유입 경로(광고 · 채널 · 영상) 정보" — 새 개인정보는 없다(방문 id 는 익명 난수 · IP · 전체 UA 저장 안 함, 광고와 같다).

## 3. 합성 반례 계획 (staging)

| # | 반례 | 기대 |
|---|---|---|
| 1 | 등록 안 된 `src_zzzzzzzz` · 형식이 틀린 `src=abc` | 기록 0 · 응답은 같다(목록 추측 불가) |
| 2 | 봇 UA(kakaotalk 미리보기 등)로 `src_click` | 기록 0 |
| 3 | 같은 방문자가 짧은 시간에 여러 번 | 횟수 제한 — 광고와 같은 상한 |
| 4 | 로그인한 A 의 토큰으로 `src_attribution` 을 보내며 본문에 B 의 userId | **A 에만** 붙는다 |
| 5 | 광고 성과 | `src_click` 을 넣어도 `admin_ad_performance` 숫자 **불변**(전후 대조) |
| 6 | 광고 없이 채널로만 온 신규 가입 | `signup` 1 · 채널 성과의 가입 1 |
| 7 | 이미 있던 사용자가 채널 링크로 들어옴 | `signup` **0** (기존 사용자 오염 없음) |
| 8 | `?ad=` 와 `?src=` 가 함께 | 광고 · 채널 두 칸 모두 기록 · 가입은 한 번 |
| 9 | 첫 접촉 뒤 다른 영상 링크 | `first_source_id` 그대로 · `latest_source_id` 만 바뀜 |
| 10 | 꼬리표를 지움 | 이벤트는 남고 `source_id` 만 null (SET NULL) |
| 11 | 6시간 지난 뒤 가입 | 붙지 않는다(TTL) |
| 12 | 관리자가 아닌 계정으로 `admin_channel_performance` | `not authorized` |

## 4. 변경 목록

| 종류 | 무엇 |
|---|---|
| **마이그레이션** | **1건** — `channel_sources` 표 · `ad_tracking_events.source_id` + `event_type` 검사에 `src_click` · 귀속 칸 6개 · `ad_reconcile_attribution` 증거 넓힘 · `admin_channel_performance` · 권한 |
| **Edge** | **`ad-track` 1개** — `src_click` · `src_attribution` (상담 서버 경로 아님 → 골든 미니팩 불필요) |
| 앱 | `trackingCode.ts`(접두사 인자) · `trackingUrl.ts` · `acquisitionContext.ts` · `acquisitionService.ts` · `AcquisitionBridge.tsx` · 관리자 화면 1 |
| 문서 | 처리방침 §1 한 줄 |
| 비용 | LLM 0 |

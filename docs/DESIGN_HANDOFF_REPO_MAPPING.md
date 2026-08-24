# DESIGN_HANDOFF_REPO_MAPPING

DESIGN_FREEZE_FINAL (덕분이 핸드오프 / 디자인 시스템 / 프로토타입) → `C:\Development\DeokbunAI-app`

Source of Truth 순서: **기존 Product/Business Logic > Architecture/Constitution/Handover > Prototype > Screen Spec > Component Spec > Tokens > State Matrix > 예시 문구.**
이 문서는 Presentation/UI/IA 매핑만 다룹니다.

---

## 0. 현재 저장소 상태

| 항목 | 값 |
| --- | --- |
| branch | `admin/master-operations-content` |
| HEAD | `646caaa fix: real-device QA — native icons, nav consistency, card overflow, subject card` |
| owner WIP (건드리지 않음) | `app.json`(EAS projectId/owner), `docs/MYUNGRI_100_ADOPTION_ANALYSIS.md`, `docs/DEOKBUNI_AUTONOMOUS_BATCH_*_REPORT.md` |
| 현재 브랜드 | Stitch FINAL — Signature Orange `#F28C33` + Deep Navy `#1A2B3C` + Warm White `#F9F7F2` |
| 목표 브랜드 | Warm White `#FDFBF6` + Soft Pastel 5종 + Ink CTA `#33302A` |

---

## 1. 토큰 매핑 (semantic 키 유지, 값만 교체)

| Design token | Value | 저장소 키 (`src/theme/colors.ts`) | 비고 |
| --- | --- | --- | --- |
| surface.base | `#FDFBF6` | `background` | 값 교체 |
| surface.raised | `#FFFFFF` | `surface` | 유지 |
| surface.sunken | `#F6F1E7` | `backgroundElevated` | 값 교체 |
| surface.selected | `#F0EADD` | `backgroundSelected` | 값 교체 |
| surface.butter/sage/blush/lavender/sky | `#FDF3D7 / #E4EFE2 / #FCE7E4 / #ECE9F6 / #E5EEF3` | **신규** `surfaceButter…surfaceSky` | 추가 |
| text.primary/secondary/muted | `#2E2A24 / #6B6357 / #776E60` | `textPrimary/textSecondary/textMuted` | 값 교체 |
| text.onButter/onSage/onBlush/onLavender | `#7A5B12 / #3F6B4A / #8E4640 / #5A5187` | **신규** `onButter…onLavender` | 추가 |
| text.navInactive | `#776E60` | **신규** `textNavInactive` | 추가 |
| line.default / line.hairline | `#EBE4D6 / #F2EDE1` | `border` / **신규** `lineHairline` | |
| action.primary / Pressed / Text | `#33302A / #4A463D / #FDFBF6` | `brandPrimary / brandPrimaryPressed / brandPrimaryText` | **호출부 무수정** |
| action.secondaryBorder | `#DCD4C2` | **신규** `actionSecondaryBorder` | |
| action.disabledBg / Text | `#EFEAE0 / #A79E8E` | **신규** `actionDisabledBg / actionDisabledText` | |
| accent.duk | `#3F6B4A` | `success` (+ `accent`) | |
| state.warn / state.error | `#C8A94A / #B0524A` | `warning / danger` | |
| — | — | `fiveElementTiles` | **변경 없음** (엔진 아이덴티티) |

**`primary`(navy `#1A2B3C`) 처리** — 저장소에서 `primary`는 선택 테두리·입력 포커스·유저 말풍선·전송 버튼·칩 선택 등 컨슈머 전 화면에서 "잉크" 역할로 이미 쓰이고 있습니다. 디자인의 `action.primary`(#33302A)가 정확히 그 역할이므로 **`primary` = `#33302A`로 교체**합니다. 호출부 0곳 수정으로 컨슈머 전 화면이 프리즈 값에 정렬되고, 오렌지·네이비가 동시에 사라집니다. (기존 `brandTokens.test.ts`의 "primary stays navy / brandPrimary is #F28C33" 불변식은 프리즈로 폐기 → 새 불변식으로 재작성.)

| 그 외 | 처리 |
| --- | --- |
| `typography.ts` | 스케일 재조정(display 28/38 · title 22/30 · section 17/24 · body 15/24 · small 13/20 · caption 12/16) + **신규 `reading` 16/28**. `fontFamily` 키 구조 유지, web은 Pretendard-first 스택. **Pretendard 폰트 바이너리 미보유 → `PRETENDARD_FONT_ASSET_REQUIRED` (owner action)**; 임의 다운로드/번들 금지. |
| `radius.ts` | `sm 10 / md 14 / lg 14 / xl 18 / xxl 24 / pill`. 컨슈머 호출부(`Card radius="xl"`→18, `Button radius="lg"`→14, `Input radius.md`→14, sheet `radius.xxl`→24)가 **수정 없이** 디자인 값에 착지하도록 매핑. |
| `shadows.ts` | warm 그림자로 재조정 — `sm` = `elev.raised`(0 2px 8px rgba(80,66,42,.05)), **신규 `sheet`** = elev.sheet. |
| `spacing.ts` | 이미 4pt + `screenHorizontal 20` + `sectionGap 32` → **변경 없음**. |
| `constants/theme.ts` | `Colors` 팔레트 값 교체(네이티브 탭바), **`MaxContentWidth = 800` 그대로 두고 `ConsumerMaxContentWidth = 480` 추가**. |

---

## 2. 컴포넌트 매핑 (C01–C22)

| ID | 컴포넌트 | 저장소 | 처리 |
| --- | --- | --- | --- |
| C01 | AppHeader | `components/AppHeader/AppHeader.tsx` | **MODIFY** — props 시그니처 유지, PersonPill 스위처·벨 44·배지 토큰·immersive(chat) variant |
| C02 | BottomNav | `app-tabs(.web)` · `DetailBottomNav` · `consumerNav.ts` | **MODIFY(스타일만)** — 5탭 순서·라벨·라우트 불변, `text.navInactive`, 360dp 1줄 |
| C03 | Button | `components/Button/Button.tsx` | **MODIFY** — `tonal` variant 추가, H52/48/44, disabled 토큰(opacity 폐기) |
| C04 | DukBalance | — | **CREATE** `components/DukBalance` (chip·card·inline) — `useWallet`/`walletHeadline` 소비 |
| C05 | Candle | — | **CREATE** `components/Candle` (5 state + `strip` compact) — `candle*`/`dukWalletService` 소비 |
| C06 | PriceConfirm | — | **CREATE** `components/PriceConfirmSheet` |
| C07 | InsufficientDuk | — | **CREATE** `components/InsufficientDuk` — `insufficientView()` 문구·primaryAction 그대로 |
| C08 | PersonSelectorSheet | `components/PersonSelectorSheet` | **MODIFY** — BottomSheet 셸 사용, check 아이콘, 점선 추가 버튼, 0명 안내 |
| C09 | PersonPill | AppHeader 내부 | **MODIFY(신규 파일 없음)** — 기존 switcher 슬롯을 pill로 교체(단일 출처 유지) |
| C10 | MessageBubble | `features/chat/components/ChatBubble` | **MODIFY** — 질문 크림 말풍선, 짧은 답 흰 버블 |
| C11 | AnswerBlock | — | **CREATE** `components/AnswerBlock` — ChatBubble/궁합이 공유 |
| C12 | SessionMeter | — | **CREATE** `components/SessionMeter` — `sessionTurnCopy()` 소비 |
| C13 | CompatibilityHeader | `features/compatibility/components/CompatibilityTierCard` | **MODIFY** — blush 풀블리드 A×B 헤더로 재조판 |
| C14 | CompatSection | `intelligence/StructuredConsultationResult` | **MODIFY(스타일만)** — 엔진 VM 구조 불변 |
| C15 | RewardItem | `components/ListRow` | **REUSE** — wallet 화면 내 조합 |
| C16 | TopupPack | `app/duk-topup.tsx` | **화면 내 구현** (단일 사용처) — opacity 금지, 버튼만 비활성 |
| C17 | Card | `components/Card` | **MODIFY** — `tone`(파스텔 reward) · `status`(좌측 3px 바) 옵션 추가 |
| C18 | Input | `components/Input` | **MODIFY** — H52 R14, 라벨 별도 줄, focus/error 1.5px |
| C19 | Chip · Badge | `components/Chip` · `StatusBadge` | **MODIFY(스타일만)** |
| C20 | BottomSheet | — | **CREATE** `components/BottomSheet` (공통 셸) |
| C21 | StateView | — | **CREATE** `components/StateView` (loading/empty/error/preparing/disabled) |
| C22 | AiDisclosure | `components/AiDisclosure` | **MODIFY(스타일만)** — 본문 하단 한 줄 |
| — | LineIcon | `components/LineIcon(.web)` | **MODIFY** — `chevron-right·chevron-down·back·check` union/switch 추가 (Presentation 전용) |
| — | ProviderAssetSlot | `components/SocialButton` | **변경 없음** — 이미 `mark` 슬롯 예약 + 임의 로고 없음 = `OFFICIAL_PROVIDER_ASSET_REQUIRED` 준수 |

---

## 3. 화면 매핑

| Design ID | Route | Source file | 재사용 | 신규 | Product Logic risk | Responsive risk |
| --- | --- | --- | --- | --- | --- | --- |
| D05 홈 | `/` | `app/(tabs)/index.tsx` | AppHeader·QuestionComposer·ListRow·InsightCard·PersonSelectorSheet·useWallet·today/monthly/popular/mail/conversation service | DukBalance·Candle(strip)·PriceConfirmSheet | 인기질문 DB 단일출처·impression 중복제거·`isBirthdayTodayKst`·전역 벨 unread — **불변** | 히어로 keep-all, 2-up `flex:1;minWidth:0`, 톤 칩 nowrap |
| D18 지갑 | `/wallet` | `app/wallet.tsx` | `useWallet`·`walletHeadline`·`walletStateOf`·`candle*`·`DUK_PRICES`·`WELCOME_DUK`·`CANDLE_DUK`·ListRow | DukBalance(card)·Candle(5state)·BottomSheet(GrantSheet)·StateView | 24h 쿨다운·멱등 지급·리워드 금액 = **서버 권한**, 낙관적 증감 금지 | 잔액 28/700 tabular-nums, 3자리+충전 버튼 |
| D18-C 오늘의 초 | `/wallet` 내 | 위와 동일 | `candleAvailability`·`attemptLightCandle`·`lightCandle` | Candle | 가짜 카운트다운 금지 | — |
| D09 상담 | `/consult` | `app/(tabs)/consult.tsx` | conversationService·useConsultationDraft·PersonSelectorSheet | PriceConfirmSheet·InsufficientDuk·StateView | 세션 개설·첫 승인 턴 과금 = **서버** | 대상자명 말줄임 |
| D10 채팅 | `/chat` | `app/chat.tsx` | 전체 send 파이프라인·`sessionTurnCopy`·`insufficientView`·`getSessionStatus` | SessionMeter·AnswerBlock·InsufficientDuk | **성공 완료 턴만** 표시, 낙관적 감소 금지, 실패 턴 미차감 | 말풍선 82%, 키보드 시 메터 1줄 |
| D11 대상자 | `/subjects` | `app/subjects.tsx` | `useConsultationSubjects`·Avatar·ListRow | StateView·SubjectCard(화면 내) | 대상자 CRUD 불변 | Primary1/Secondary1/Tertiary3 |
| D16·D17 궁합 | `/compatibility`, `/compatibility-chat` | 동명 파일 | `insufficientView('compatibility')`·Timeline·Markdown·DetailBottomNav | CompatibilityHeader·InsufficientDuk·SessionMeter | `compatibility_insufficient_duk` payload 4필드 **불변** | 2열 비교 wrap |
| D23 MY | `/my` | `app/(tabs)/my.tsx` | ListRow·useWallet·useConsultationSubjects | DukBalance(card)·Candle(strip) | 로그아웃 시 `unregisterOnLogout` 순서 불변 | 3-up `flex:1;minWidth:0` |
| D19 충전 | `/duk-topup` | `app/duk-topup.tsx` | `TOPUP_PACKS`·iap catalog/purchaseFlow seam | TopupPack(화면 내) | IAP 권한·팩 구성·가격 **불변**, 가짜 성공 금지 | 팩 카드 wrap |
| D01 로그인 | `/login` | `app/login.tsx` | SocialButton | — | OAuth semantics **불변** | — |
| D02–D04 온보딩 | `/onboarding/{terms,channel,birth}` | 동명 파일 | `REQUIRED/OPTIONAL_CONSENTS`·`BirthProfileForm`·`useOnboarding` | — | 온보딩 게이팅·약관 구성·출생정보 검증 **불변** | 44dp 체크, 3필드 날짜 keyboard-aware |
| 범위 밖 | `/today` `/monthly` `/inbox` `/notifications` `/notification-settings` `/life-events` | — | — | — | — | AppHeader·BottomNav·StateView·토큰만 자동 반영 |

---

## 4. 구현 순서

1. 토큰 (`colors/typography/radius/shadows` + `constants/theme`) + `brandTokens.test` 재작성
2. LineIcon 4종 확장 → 공통 프리미티브(Button/Card/Chip/Input/ListRow/Text/AiDisclosure/StatusBadge)
3. 신규 공통 컴포넌트 (BottomSheet → StateView → DukBalance → Candle → InsufficientDuk → SessionMeter → AnswerBlock → PriceConfirmSheet)
4. AppHeader / PersonSelectorSheet / ChatBubble / ChatInput / QuestionComposer / DetailBottomNav
5. 화면: 홈 → 지갑 → 충전 → MY → 상담 → 채팅 → 대상자 → 궁합 → 궁합결과 → 로그인/온보딩
6. 테스트 추가 (토큰 대비 스윕 · 5탭 라벨 · Duk 하드코딩 금지 · SessionMeter 서버 파생)
7. 게이트: `tsc --noEmit` · `jest` · `release-preflight` · `expo export -p web` · frozen-core diff · secret audit · `git diff --check`

---

## 5. 절대 건드리지 않는 영역

`features/duk/{walletCore,sessionBilling,billingOrchestrator,dukWalletService,candle,pricing,iap/*}` ·
`features/consultation/services` · `features/chat/{server,prompts}` ·
`features/myungri` · `features/ziwei` · `features/qimen` · `features/polarity` ·
`features/analytics` 이벤트명/payload · `services/productEvents` 시맨틱 ·
`supabase/**` (migrations · functions · RLS) · `app.json` EAS linkage ·
`docs/MYUNGRI_100_ADOPTION_ANALYSIS.md` 및 owner WIP 문서.

---

## 6. 사전 확인된 리스크

| 항목 | 판단 |
| --- | --- |
| Pretendard 번들 | 폰트 바이너리 미보유 → 시스템 폰트 유지 + web Pretendard-first 스택. `PRETENDARD_FONT_ASSET_REQUIRED` (owner) |
| 일러스트 4종 (candle/duk-clover/mail-empty/birthday) | 도형 폴백으로 구현. `ILLUSTRATION_ASSET_REQUIRED` (owner) |
| Google/Kakao/Naver 공식 로고 | `SocialButton.mark` 슬롯 유지, 임의 제작 없음 |
| 궁합 `overallLabel` | 숫자 점수가 아닌 **엔진 산출 범주형 판정**. 디자인의 "점수·등급 금지"는 숫자/등급 표기 금지로 해석하고, 엔진 판정 문구는 Product Logic 우선으로 **유지**하되 1o 헤더 한 줄 요약으로 재조판 |
| `brandTokens.test.ts` | 오렌지·네이비 불변식은 프리즈로 폐기 → 새 프리즈 불변식으로 대체(프레젠테이션 테스트) |
| `MaxContentWidth` | 실측 800 유지, `ConsumerMaxContentWidth = 480` 신설 |

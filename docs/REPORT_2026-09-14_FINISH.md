「끝까지 읽음 — 2026-09-14 마무리 묶음」

# 보고서 — 2026-09-14 마무리 묶음

**한 줄 요약**: 잠긴 폴더 테스트 한 줄은 불변식을 깨는 변경 4/4 를 잡아 조건부 승인의 근거가 섰고, 새 내부 APK(staging)에
동의 · 신고 · 상담 삭제 · 보고서 삭제 · 결제 문구가 모두 들어 있음을 문자열로 확인했으며, 스토어 2 · 3안 · 데이터 보안 초안 ·
production 세션 준비물 · Play Console 한 장을 마쳤다 — 마이그레이션 · Edge 는 한 글자도 바뀌지 않았다(동결 지문 그대로).

## 🚨 긴급

| # | 무엇 | 누가 |
|---|---|---|
| 1 | **새 APK 설치 → 채팅에 "새 APK 설치함"** — 받아야 PART 7(staging 동의 게이트 켜고 확인)을 시작한다. 링크 · 설치 방법은 맨 아래 | 오너 |
| 2 | 실사이트 상담 상태는 **여전히 모른다**(KNOWN_RISKS M15) — production `chat` 이 이미 새 계약이면 지금도 실패 중. 세션 ① 의 1-9 가 가린다 | 오너(세션 때) |

---

## PART 별

| PART | 상태 | 수치 | 바뀐 파일 |
|---|---|---|---|
| 0 기준선 | ✅ | jest **363 / 6,272** · tsc 0 · preflight 20 ok · 3 warn · **BLOCK 1**(알려진 것) · 인덱스 `5412441…` · 보호 SHA 6 · 동결 21/21 | — |
| 1 잠긴 폴더 테스트 한 줄 | ✅ **조건 충족** | 합성 반례 **4/4** 잡음 · 원복 SHA 같음 | — (Edge 는 잠시 바꿨다 되돌림 — 아래) |
| 2 새 내부 APK | ✅ | EAS **1/1** · 15분 · 문자열 **18/18** 있음 · 음성 대조 2/2 없음 · 백엔드 staging 하나 | — |
| 3 스토어 2 · 3안 | ✅ | 세 안 × 같은 검사 · 테스트 68 → **187** · 실제 원본 반례 **5/5** 잡음 | `storeListingCopy.ts` · `storeListingCopy.test.ts` · 🆕 `docs/STORE_LISTING_VARIANTS_2026-09-14.md` |
| 4 데이터 보안 · 라벨 | ✅ | 🔄 5행 · 새 절 §4 · **[법률 검토] 2** | `docs/DATA_SAFETY_DRAFT_2026-09-12.md` |
| 5 세션 준비물 | ✅ | CTO 요약 1장 · 창 구간 4구간 · 오너 체크리스트 1장 · 동결 21/21 유지 | `docs/PRODUCTION_APPLY_PACKAGE_2026-09-12.md`(설명만) · 🆕 `docs/OWNER_CHECKLIST_PROD_SESSION_2026-09-14.md` |
| 6 Play Console 한 장 | ✅ | 상품 값은 원본과 테스트로 묶음(반례 1/1) | 🆕 `docs/PLAY_CONSOLE_FIRST_UPLOAD_2026-09-14.md` |
| 7 동의 게이트 | ⏸ **대기** | "새 APK 설치함" 을 받으면 시작 | — |
| 8 보고 | ✅ | 이 문서 | 🆕 `docs/REPORT_2026-09-14_FINISH.md` |

기록: 지시서 두 메시지를 합쳐 `C:\Development\owner_inputs\지시서_2026-09-14_앱_마무리.md` 로 저장.

### PART 1 — 잠긴 폴더 테스트 한 줄

**diff 원문** (`src/features/chat/server/__tests__/e2RuntimeClosure.test.ts`, 인덱스 대비):

```diff
@@ -196,7 +196,7 @@ describe('E.2 actual client/Edge/store source boundaries', () => {
 
   it('Edge rejects missing/cross-owner ids before paid acquisition and reuses the verified id', () => {
     const verifyAt = edge.indexOf('verifyOwnedConversation(admin, userId, suppliedConversationId)');
-    const acquireAt = edge.indexOf('const paid = await acquirePaidRequest(admin, userId, requestWorkload, requestId)');
+    const acquireAt = edge.indexOf('const paid = await acquirePaidRequest(admin, userId, requestWorkload, requestId, verifiedConversationId)');
     expect(verifyAt).toBeGreaterThan(-1);
     expect(acquireAt).toBeGreaterThan(verifyAt);
     expect(edge).toContain("error: 'CONVERSATION_FORBIDDEN'");
```

(같은 한 줄이 잠기지 않은 `src/features/duk/__tests__/edgeBillingWiring.test.ts:16` 에도 있다.)

**지키던 불변식**: 유료 상담은 요청에 담긴 대화 id 의 소유를 서버가 먼저 확인한 뒤에만(남의 대화 id 는 403
`CONVERSATION_FORBIDDEN`) 덕 예약 · 유료 획득으로 넘어가고, 획득에는 그 **확인된** id 만 쓴다.

**합성 반례** — 동결된 Edge 원본(`supabase/functions/chat/index.ts`)을 일부러 망가뜨려 두 테스트를 돌렸다:

| 반례 | 결과 | 실패한 테스트 |
|---|---|---|
| 기준(원본) | 실패 0 · 통과 19 | — |
| M1 유료 획득을 소유 확인보다 앞으로 옮김 | ✅ 잡음 (2) | e2RuntimeClosure · edgeBillingWiring |
| M2 획득에 확인 안 된 원래 id(`body.conversationId`)를 넘김 | ✅ 잡음 (2) | e2RuntimeClosure · edgeBillingWiring |
| M3 남의 대화 id 를 거절하지 않고 넘어감(403 제거) | ✅ 잡음 (1) | e2RuntimeClosure |
| M4 소유 확인 자체를 지움 | ✅ 잡음 (3) | e2RuntimeClosure(2건) · edgeBillingWiring |

**원복**: 원래 바이트로 되돌린 뒤 SHA-256 `062a96694d13cf92…` = 동결 목록의 값 · 동결 테스트 21/21 · 동결 지문 그대로.
⚠ 동결 파일을 **잠시** 바꾼 것은 이 PART 가 요구한 반례 때문이다(되돌림 · 해시 확인 · 그동안 배포 · 빌드 없음).
한계: 이 테스트는 소스 글자를 대조한다 — 같은 뜻을 다른 글자로 쓰면 못 잡는다(실제 동작은 staging p9 가 확인).

### PART 2 — 새 내부 APK

| | |
|---|---|
| 빌드 | `e2b01ebf-f00e-40d9-b0f3-5b18a4a53980` · 프로필 `internal`(APK · `EXPO_PUBLIC_APP_ENV=staging`) · 06:17 → 06:32 UTC · SDK 57 · versionCode 1 |
| 전제 | 빌드 직전 jest 363/6,272 · tsc 0 · expo-doctor **21/21** · `expo install --check` 이상 없음 |
| 커밋 | 기록은 `b31bb27`(HEAD) — 번들에는 커밋 안 된 묶음 5 · 6 이 **들어 있다**(아래 문자열로 확인) |
| 인덱스 | 빌드 전후 `git write-tree` 같음 · 스테이징 63 · `core.ignorecase` 되돌려짐 (eas-cli 24.0.0 을 고정해 git 동작을 소스로 먼저 읽었다 — `requireCommit` 이 없으면 `git add` · commit 을 하지 않는다) |
| APK | 116,083,009 바이트 · SHA-256 `f2f63c22a90736db…` |

**문자열 확인** (Hermes 번들 — 한글은 UTF-16 으로 찾음):

| 묶음 | 찾은 문구 |
|---|---|
| 동의 화면 | ✅ AI 처리 동의 · 동의하고 계속 · 무엇을 보내나요 · 누구에게 보내나요 · 왜 보내나요 · `AI_CONSENT_REQUIRED` |
| 신고 | ✅ 이 답변 신고하기 |
| 상담 삭제 | ✅ 상담 삭제 · 이 상담을 삭제할까요? · 삭제하지 못했어요. 잠시 후 다시 시도해 주세요. |
| 보고서 삭제 | ✅ 보고서 삭제 · 리포트 삭제 · 프리미엄 리포트는 지운 뒤 다시 보려면 새로 구매해야 해요. |
| 결제 문구 | ✅ 이 남아요.(가격 확인) · 덕 충전 · 구매 · 결제를 취소했어요. 아무것도 청구되지 않았습니다. · 결제가 진행 중이에요. … 다시 결제하지 마세요. |
| 음성 대조 | ✅ 없음 — "덕분이는 타로 앱입니다" · 지어낸 표식 |
| 백엔드 | 번들의 Supabase 주소 **staging 하나뿐** (`aephpsiurgkvqcswyeie`) |

### PART 3 — 스토어 문구 세 안

- 1안 = 정본(담백한 도구형) · **2안 따뜻한 상담형** · **3안 간결형** — 같은 사실만, 새 기능 · 새 숫자 없음.
- 한 페이지 비교표: `docs/STORE_LISTING_VARIANTS_2026-09-14.md` (원본에서 생성 · 칸마다 세 안 나란히 · 글자 수 표시 · 아래에 붙여 넣기용 전문).
- 칸 길이: 간단한 설명 44 · 51 · 34 /80 · 부제 22 · 21 · 16 /30 · 프로모션 94 · 104 · 67 /170 · 자세한 설명 932 · 965 · 559 /4000 · 키워드 100 · 90 · 100 **바이트**/100.
- **세 안에 같은 검사**(테스트 「세 안 공통」): ① 칸 길이 · 키워드 100바이트 · 낱말 두 글자 초과 · 앱 이름 없음 ② 금지 표현
  (PRODUCT_TRUTH_GUARD + 답변의 확신 · 순위 · 궁합 검사기, 줄마다) · 근거 표 약속 없음 · "AI는 명식을 계산하지 않아요" ③ 모든 "N덕" 이
  같은 줄의 상품 낱말과 짝이 맞는가(코드 값) · 세션 24시간 · 질문 5번 ④ **기능 낱말 23개마다 레포 근거 파일 대조** · 없는 기능
  언급 0(타로 · 전문가 · 무제한 · 구독 …) ⑤ 타사 이름 0(OpenAI · ChatGPT · 구글 · 애플 · 카카오 · 네이버 · 점신 · 포스텔러 …, 심사 노트는
  AI 제공자 공개 의무 때문에 제외) ⑥ 비교표 문서와 글자까지 같음.
- 판정 로직 검증: 합성 반례(타사 3 · 없는 기능 5 · 가격 짝 4 · 세션 2 · 근거 2)와 **실제 원본에 넣은 반례 5/5**(2안 궁합 15덕 · 3안
  ChatGPT · 2안 타로 · 3안 부제 "정확도" · 2안 키워드 103바이트) — 모두 해당 검사에서 실패, 원본 SHA 복원.
- 만들다 찾은 오탐 1: "부적절한" 의 "부적" 을 없는 기능으로 잡았다 → `부적(?!절)` 로 좁히고 오탐 방지 테스트 추가.
- 한계(ponytail): 기능 사전 · 금지 목록 **밖의** 새 낱말은 사람이 봐야 한다 — 새 기능 문구를 쓰면 사전에 근거와 함께 올린다.

### PART 4 — 데이터 보안 · 개인정보 라벨

`docs/DATA_SAFETY_DRAFT_2026-09-12.md` (2026-09-14 갱신): 상담 — 상담마다 즉시 삭제 · **답변 서버 사본 최대 25시간**(새 행) ·
보고서 — 하나씩 삭제(공유 링크도) · **오늘 · 이번 달 운세 — 탈퇴 시 삭제**(새 행) · 검증 해시 — 대화를 지워도 남음.
새 §4: 구글(삭제 요청 "예" · 상담/운세는 **임시 처리 아님** · 데이터 유형) · 애플(추가 항목 없음 · 분류 확인 2) · 처리방침 대조.

| 처리방침과 어긋나는 곳 | 표시 |
|---|---|
| 운세: §5 첫 문단은 "삭제를 요청하면 지체 없이 파기" 인데, 운세는 **탈퇴하지 않고 지울 방법이 없다**(항목별 삭제 · 관리자 도구 모두 없음 — `daily_fortunes` 정책은 select 뿐, 삭제는 탈퇴 CASCADE 뿐) | **[법률 검토]** |
| OpenAI: 처리방침 §3 은 수탁자, 초안 표는 "제3자 전송처" — 구글 양식의 "공유" 답을 맞춰야 한다 | **[법률 검토]** |

맞는 곳 3: 하나씩 삭제 · 답변 사본 24→최대 25시간 · 검증 해시. 처리방침 버전은 올리지 않음(CTO 판정).

### PART 5 — production 세션 준비물 (설명만)

- **① CTO 요약 한 장** — 패키지 맨 앞: 단계 9 · 1시간 40분~2시간 · 올리는 것 · **가장 위험한 단계 = ⑦ 병합 + ⑦-2 `chat`**(공유 화면이
  처음 올라가는 순간 · 계약 전환 창 · 병합 뒤엔 DB 되돌리기가 해법이 아님) · 두 번째 ② · 마이그레이션 9개 한 줄씩(되돌리면 무엇이
  열리는지 포함) · 멈춤 신호 전부.
- **② 창 구간** — A(② 뒤 ~ 병합 전) · B(병합 ~ 새 화면) · C(새 화면 ~ `chat` 배포, 1~2분) · D(`chat` 뒤)마다 "실패해도 정상" 과
  "멈추거나 되돌릴 신호" 를 나눔. **"실사이트 상담 실패를 이유로 20 · 21 을 되돌리지 마십시오"** 를 요약과 절 머리 두 곳에 ⚠⚠⚠ 로.
- **③ 오너 체크리스트 한 장** — `docs/OWNER_CHECKLIST_PROD_SESSION_2026-09-14.md`: 사전 확인 3가지(코드 동결 · DB 준비 · 콘솔) · 9단계
  한 줄씩 · 커밋 순서 3·4 → 5·6(명령 포함) · 끝난 뒤 확인 4.
- 마이그레이션 · Edge · 명령 · 기대값 **무변경** — 동결 테스트 21/21 · 파싱 기준(dry-run 9줄 · 배포 줄 4 · 22/21 제목 하나씩) 그대로.

### PART 6 — Play Console 첫 업로드 한 장

`docs/PLAY_CONSOLE_FIRST_UPLOAD_2026-09-14.md`: AAB(커밋 뒤 · `git status` 깨끗) → 내부 테스트 · Play 앱 서명(EAS 키 = 업로드 키 ·
키스토어 백업 · 첫 AAB 는 손으로 · 내부 APK 와 서명이 달라 덮어 설치 불가 · 앱 링크 켤 때 Play 서명 키 SHA-256) → 인앱 상품 3개
(상품 ID · 이름 · 설명 · 가격 · 서버 내부 키 — **원본과 테스트로 묶음**) → production `product_catalog` → 라이선스 테스터 → 서비스 계정 →
시크릿 → RTDN(audience 없으면 503) → 승인 재시도 크론(3일 자동 환불) → 실구매 테스트 6단계(테스터 · 중복 · 첫 충전 두 번 · 실결제
1건 · 환불 → REVERSAL/debt).

### PART 7 — 대기

"새 APK 설치함" 을 받으면: staging `AI_CONSENT_ENFORCED=true` → ① 동의 없는 계정의 상담 · 오늘의 운세 → `AI_CONSENT_REQUIRED`(LLM 0) ·
② 동의 → 상담 1회 정상(LLM 1) · ③ 철회 → 다시 막힘(LLM 0) · 오너 폰에서 동의 화면이 뜨는지. 상한 10 안에서.
되돌리기: `npx supabase secrets unset AI_CONSENT_ENFORCED --project-ref aephpsiurgkvqcswyeie`.

---

## staging 변경 · 되돌리기

**이번 묶음 0건.** (EAS 빌드는 staging 을 바꾸지 않는다. PART 7 을 하면 게이트 시크릿 1건이 생긴다 — 위 되돌리기.)
이어지는 상태: 마이그레이션 16~22 · pg_cron `answer-retention` · 계정 A · B · C · 동의 게이트 **꺼짐**(시크릿 13개에 없음 — 2026-09-13 확인).

## SHA · 인덱스 · 동결 지문

| | 시작(PART 0) | 끝 |
|---|---|---|
| 인덱스 `git write-tree` | `54124419421827d52b41494c0c8050773b76056f` | **같음** · 스테이징 63 · HEAD `b31bb27` |
| 보호 파일 6 | `app.json ee1e10a7b7f383ac` · 배치 보고서 `e7ae7dc3…` `95c26873…` `edc974b5…` · `23bfa4a4…` · `58f11e79…` | **전부 같음** |
| 동결 지문 (17 파일 목록의 SHA-256) | `2bd16d2a4214a0606ef79bd7206bb9dd4b20f318d6b12309d089890eb7ca882a` | **같음** · 동결 테스트 21/21 |
| `supabase/` 변경 | 묶음 5 · 6 의 3 파일 | **같음** — 이번 묶음 0 |

## 테스트 전후

| | 전 | 후 |
|---|---|---|
| 스위트 | 363 | 363 |
| 테스트 | 6,272 | **6,391** (+119 — 스토어 세 안 118 · Play 한 장 대조 1) |
| 실패 | 0 | 0 |
| tsc | 0 | 0 |
| preflight | FAIL — BLOCK 1 (잠긴 폴더 테스트 한 줄, 커밋하면 풀림) | 같음 |

시간 초과 0 — 공장 렌더 부하로 인한 재실행 없음(전체 36.8초 → 44.6초).

## 상한

**LLM 0 / 10** (PART 7 대기) · **EAS 1 / 1**

---

## CTO 판정 필요

| # | 무엇 | 근거 |
|---|---|---|
| C1 | 잠긴 폴더 테스트 한 줄 — **조건부 승인의 조건(불변식을 깨면 실패)이 충족됐다** — 최종 승인 | PART 1 · 반례 4/4 · 원복 해시 |
| C2 | 운세를 **탈퇴 없이** 지워 달라는 요청을 어떻게 받을지 — 항목별 삭제 기능을 만들지, 처리방침 문장을 운세에 맞게 고칠지(법률 검토와 함께) | PART 4 · `[법률 검토]` |
| C3 | 스토어 검사의 한계 — 기능 사전 · 금지 목록 밖의 새 낱말은 사람이 본다. 이 수준으로 충분한지 | PART 3 |

## 오너 결정 필요

| # | 무엇 |
|---|---|
| O1 | **스토어 문구 1 · 2 · 3안 중 무엇으로 갈지** — 비교표 `docs/STORE_LISTING_VARIANTS_2026-09-14.md`. 고르면 다음 묶음에서 정본으로 올린다 |
| O2 | 법률 검토에 넣을 것 추가 2: 운세 개별 삭제 요청 처리 · OpenAI 가 "공유" 인지 "수탁" 인지(구글 양식 답) — 처리방침 버전은 그때 한 번에 |

## 오너 할 일

| # | 무엇 | 언제 |
|---|---|---|
| 1 | **새 APK 설치**(예전 것 지우고) → 채팅에 **"새 APK 설치함"** | 지금 |
| 2 | production 세션 — `docs/OWNER_CHECKLIST_PROD_SESSION_2026-09-14.md` 한 장 · 1-9 결과를 CTO 에게 | CTO 최종 GO 뒤 |
| 3 | Play Console 첫 업로드 — `docs/PLAY_CONSOLE_FIRST_UPLOAD_2026-09-14.md` | 세션 · 판매자 계정 뒤 |

---

## 새 APK — 링크와 설치 방법

> **이 APK 는 staging(테스트 서버)을 봅니다.** 실사이트 데이터와 섞이지 않습니다.

- 설치 페이지 · QR: https://expo.dev/accounts/deokbuni/projects/DeokbunAI/builds/e2b01ebf-f00e-40d9-b0f3-5b18a4a53980
- 파일 직접 받기(116MB): https://expo.dev/artifacts/eas/YvZ8znNJaF74TQVgO93Lo4bIG2l9T0xSyZcoukgMcX8.apk

1. **예전 APK 를 지웁니다** — 덕분이 아이콘을 길게 누름 → **앱 정보** → **삭제**
   (또는 설정 → 애플리케이션 → 덕분이 → 삭제). ⚠ 로그인이 풀립니다 — 설치 뒤 다시 로그인하십시오.
2. 폰에서 위 **설치 페이지**를 엽니다(컴퓨터 화면의 QR 을 폰 카메라로 찍거나, 카카오톡 "나에게 보내기").
3. **[Install]** → `.apk` 가 내려받아집니다 → 엽니다.
4. "출처를 알 수 없는 앱" 이 막으면 **[설정] → 이 출처 허용** → 뒤로 → 다시 설치.
5. 로그인한 뒤 보이면 되는 것: MY → **AI 처리 동의** · MY → 분석 대상자 관리 → 상담 기록 → **[상담 삭제]** ·
   운세우편함 → 보고서 → **[보고서 삭제]** · MY → **덕 충전**. (지우는 버튼은 눌러도 됩니다 — 테스트 서버입니다.)
6. 끝나면 채팅에 **"새 APK 설치함"** — 그때 staging 동의 게이트를 켜고 확인합니다(PART 7).

---

## 커밋 메시지 제안

패키지 ⑥ 의 두 번째 커밋(묶음 5 · 6 에 이번 마무리를 더해 하나로) — `C:\Development\owner_inputs\BUNDLE5_6_COMMIT_MSG.txt`
(이번에 갱신) · 목록 `C:\Development\owner_inputs\BUNDLE5_6_FILES.txt`(갱신). 첫 줄:

```
feat: 대화·리포트 삭제 · C9 답 원문 정리 · 스토어 문구(세 안) · production 패키지 동결본 · 세션 준비물
```

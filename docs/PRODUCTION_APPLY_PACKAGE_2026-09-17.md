# production 적용 패키지 — 2026-09-17 묶음 (**웹만**) · ⚠ CTO 판정 후 실행

## 🧾 CTO 요약 — 한 장

| | |
|---|---|
| **단계** | **5** (①~⑤) · ⑥ 은 오너 확인만 |
| **예상 시간** | **20 ~ 30분** · 오너 혼자 · **LLM 1콜**(④-3 상담 1회) |
| **올리는 것** | 웹 병합 **1건**. **DB 마이그레이션 0 · Edge 0 · 시크릿 0 · `app.json` 0** |
| **되돌리기** | **Vercel Instant Rollback 한 번**(직전 배포로) 또는 PR revert. **DB 는 건드리지 않으므로 되돌릴 DB 가 없다** |
| **가장 위험한 단계** | ③ 병합 — 단, 이번 묶음은 **서버 계약을 바꾸지 않는다**(`supabase/**` · `src/features/chat/server/**` 변경 0줄). 2026-09-13 묶음의 「창 구간 C」 같은 실패 창이 **없다** |
| **왜 지금 해야 하나** | 스토어 제출에 필요한 **공개 URL 3개**(계정 삭제 · 처리방침 · 사이트맵)가 지금 실사이트에서 로그인 화면으로 넘어간다. 이 배포가 그것을 연다 |

### 무엇이 달라지나 (오너가 눈으로 볼 것)

| # | 지금 (실사이트) | 이 배포 뒤 |
|---|---|---|
| 1 | `/account-deletion` · `/privacy-policy` 등 **7개 주소가 로그인 화면으로 넘어감** | 로그인 없이 그대로 열림 |
| 2 | `sitemap.xml` 에 법률·안내 주소 **없음** | 7개 들어감 |
| 3 | 상담 중 새로고침·재시도 → **"덕이 빠졌는데 답이 없음"** | "답을 만들고 있어요" 로 뜨고 **다 되면 저절로 나타남**. 덕은 다시 빠지지 않음 |
| 4 | 동의 화면에서 동의 → **답이 안 옴**(다시 보내야 함) | 동의 누르면 **저절로 이어서 보냄** |
| 5 | 관리자 덕 화면에 이메일 넣으면 **"확인해 주세요" 한 줄** | 이메일로 **찾아 주고**, 안 되면 **서버가 준 진짜 이유**를 보여줌 |

### 멈춤 신호

- ① HEAD 가 `d3cf494` 가 아님 · 테스트 실패
- ② 파일 목록에 **모르는 파일**이 섞임 · `app.json` · `supabase/` · `src/generated/famousStatic.ts` 가 목록에 있음
- ③ Vercel 배포 **실패**
- ④ 새 화면이 안 보임(5분 넘게) · **상담이 실패**(④-3) · 공개 URL 이 여전히 로그인으로 넘어감

---

## ① 준비 확인 (개발자 · 이미 끝남)

| 확인 | 결과 |
|---|---|
| 전체 테스트 | ✅ **369 스위트 / 6481 테스트 통과** · 33.7초 (기준선 363 / 6391) |
| 타입 검사 | ✅ `tsc --noEmit` 0 오류 |
| preflight | ✅ PASS (HEAD `d3cf494`) |
| 골든 미니팩 | **필요 없음** — 상담 서버 경로(`supabase/**` · `src/features/chat/server/**`) 변경 **0줄** |
| 내부 APK | 빌드 1회 (아래 ⑥) |

## ② 커밋 · PR (오너 · 화면에서)

> 커밋 메시지는 `C:\Development\owner_inputs\BUNDLE7_COMMIT_MSG.txt` 에 있습니다. 그대로 붙여 넣으십시오.

⚠ **`git add -A` 를 쓰지 마십시오.** `src/generated/famousStatic.ts` 는 **내용 차이 0줄**(줄바꿈만)이라 목록에서 빼야 하고,
`.claude/settings.json` 도 올리면 안 됩니다. 개발자가 준 파일 목록만 담는 명령을 쓰십시오.

담기는 파일 — **고친 것 18 + 새 파일 13 = 31개**:

```
docs/PROJECT_STATE.md
docs/DATA_SAFETY_DRAFT_2026-09-12.md
docs/OWNER_RUNBOOK_DEVICE_QA_2026-09-10.md
docs/OWNER_RUNBOOK_WEB_MERGE_2026-09-10.md
docs/STORE_LISTING_VARIANTS_2026-09-14.md
docs/CONSULT_WELCOME_COPY_2026-09-17.md
docs/STORE_SUBMISSION_CHECKLIST_2026-09-17.md
docs/UI_AUDIT_2026-09-17.md
docs/PRODUCTION_APPLY_PACKAGE_2026-09-17.md
scripts/generate-sitemap.mjs
scripts/ui-audit.mjs
scripts/ui-audit-browser.json
src/app/chat.tsx
src/app/admin/economy/index.tsx
src/app/__tests__/chatPendingAnswer.render.test.tsx
src/app/__tests__/publicLegalPages.render.test.tsx
src/features/admin/services/adminEconomyService.ts
src/features/admin/services/__tests__/adminEconomyLookup.test.ts
src/features/chat/index.ts
src/features/chat/consultationErrors.ts
src/features/chat/adapters/llmError.ts
src/features/chat/adapters/supabaseEdgeConsultationAdapter.ts
src/features/chat/services/consultationTransport.ts
src/features/chat/services/createServerConsultationService.ts
src/features/chat/services/pendingAnswerStore.ts
src/features/chat/services/__tests__/pendingAnswerStore.test.ts
src/features/chat/__tests__/requestInProgress.test.ts
src/features/chat/types/chatArchitecture.ts
src/features/legal/__tests__/publicDocRoutes.test.ts
src/features/onboarding/entryRouting.ts
src/features/onboarding/__tests__/entryRouting.test.ts
```

## ③ 병합 (오너 · GitHub 버튼)

지난번과 같습니다 — PR 화면에서 **Merge pull request** → **Confirm merge**.
병합하면 Vercel 이 스스로 빌드합니다. **2 ~ 5분** 걸립니다.

## ④ 실사이트 확인 (오너 · 시크릿 창)

**④-1 공개 주소 3개** — 시크릿 창(로그인 안 한 상태)에서 하나씩 엽니다.

```
https://www.deokbunai.com/account-deletion
https://www.deokbunai.com/privacy-policy
https://www.deokbunai.com/sitemap.xml
```

기대 — 앞의 둘은 **로그인 화면으로 넘어가지 않고** 글이 보입니다. 세 번째는 글자 목록이 나오고
Ctrl+F 로 `account-deletion` 을 찾으면 **있습니다**.

**④-2 온보딩은 여전히 막혀 있어야 합니다** (반례):

```
https://www.deokbunai.com/onboarding/terms
```

기대 — **로그인 화면으로 넘어갑니다.** 넘어가지 않으면 **멈추고 CTO**.

**④-3 상담 1회** (LLM 1콜) — 로그인하고 상담을 한 번 합니다.

기대 — 답이 옵니다. 30초가 넘어도 **"답을 만들고 있어요"** 로 기다리다가 답이 나타납니다.
⚠ 도중에 새로고침해도 됩니다 — 다시 열면 **저절로 답을 받아 옵니다**(덕은 다시 빠지지 않습니다).

**④-4 관리자 덕 화면** — 관리자로 로그인 → 덕 화면 → 사용자 ID 칸에 **이메일**을 넣고 조회.

기대 — "이메일로 찾음" 이라는 줄과 함께 지갑이 보입니다. 안 되면 **그 이유가 화면에 그대로** 뜹니다.

## ⑤ 되돌리기 (필요할 때만)

| 무엇이 잘못됐나 | 되돌리는 법 |
|---|---|
| 배포 뒤 화면이 깨짐 | Vercel → 이 프로젝트 → Deployments → 직전 것 → **Instant Rollback** (1분) |
| 코드를 되돌려야 함 | GitHub PR 화면 → **Revert** → 새 PR 병합 |
| DB | **되돌릴 것이 없습니다** — 이 묶음은 DB 를 건드리지 않습니다 |

⚠ 이 묶음 때문에 **마이그레이션 14~22 를 되돌리지 마십시오.** 관련이 없습니다.

## ⑥ 내부 APK (오너 · 폰에서 확인만)

이번 수정은 웹과 앱이 **같은 코드**를 씁니다. 폰에서 보려면 내부 APK 를 깔면 됩니다
(링크는 세션 보고서에). 이 APK 는 **staging DB** 를 봅니다 — 실사용자 데이터가 아닙니다.

## ⑦ 다음 (이 배포가 끝난 뒤)

1. 스토어 제출 점검표 — `docs/STORE_SUBMISSION_CHECKLIST_2026-09-17.md`
2. 상담 첫 화면 문구 1·2·3안 결정 — `docs/CONSULT_WELCOME_COPY_2026-09-17.md`
3. UI 점검에서 나온 항목 — `docs/UI_AUDIT_2026-09-17.md` (이번에는 **고치지 않고 목록만** 만들었습니다)

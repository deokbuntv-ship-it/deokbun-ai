「리허설 지시서 끝까지 읽음」

# 보고서 — 2026-09-14 #2 production 세션 리허설 + 다음 기능 설계

**한 줄 요약**: 오너가 production 세션에서 칠 명령 36개를 전부 Windows PowerShell 5.1 용으로 고치고, 같은 명령을 이 PC 의
`powershell.exe`(실행 정책 기본값 · 새 창과 같은 PATH)에서 staging 에 한 번씩 돌려 **29/29 통과**했다(문서의 명령 36개가 통과한
명령과 글자까지 같음). 리허설이 **패키지의 결함 1건**(1-3 외래키 조회가 아무것도 못 봄)을 찾아 고쳤고, 다음 기능 설계 3건을 새 파일로 냈다.

## 🚨 긴급

| # | 무엇 |
|---|---|
| 1 | **세션은 고친 패키지로.** 옛 판의 명령(`npx …` · `… \| wc -l` · `curl -s -o /dev/null …`)은 오너 PC 에서 **실패한다**(아래 전후 표 — 실패를 이 PC 에서 재현) |
| 2 | 리허설이 찾은 결함 — **1-3 외래키 조회가 확인해야 할 줄을 하나도 못 봤다**(아래 §3). 옛 판대로면 세션 첫 단계에서 **거짓 멈춤**이 났다 |
| 3 | 직전 PART 7(staging 동의 게이트)은 **"새 APK 설치함" 을 아직 받지 못해 대기** |

---

## 1. PART 1 — 고친 명령 (전 → 후)

오너가 칠 명령을 패키지 · 체크리스트에서 **전부** 뽑았다: 패키지 PowerShell 칸 32 + 체크리스트 칸 6 + 문장 속 명령 = **서로 다른 명령 36개**.
bash 전용 문법 점검: `&&` 0 · `export` 0 · `$(…)` 0 · heredoc 0 · `\` 줄잇기 0 — 실제로 걸린 것은 `npx`(코드 칸 11 · 문장 속 2) · `wc -l`(코드 1 · 요약 카드 1) · 유닉스식 `curl`(1) · PATH 에 없는 `supabase`(되돌리기 1).

| 단계 | 전 (옛 판) | 후 (PowerShell 5.1) | 무엇이 문제였나 (이 PC 에서 재현) |
|---|---|---|---|
| ① 1-5 | `git diff --cached --name-only \| wc -l` | `(git diff --cached --name-only \| Measure-Object).Count` | `'wc' 용어가 cmdlet … 인식되지 않습니다` |
| ① 1-8 | `npx jest src/…/productionPackageFreeze.test.ts` | `npx.cmd jest src/…/productionPackageFreeze.test.ts` | `npx.ps1 파일을 로드할 수 없습니다`(실행 정책) |
| ① 1-10 🆕 | — | `npx.cmd supabase@2.117.0 --version` · (필요할 때) `npx.cmd supabase@2.117.0 login` | CLI 판 고정 · 첫 설치 확인 · 로그인 창을 세션 앞으로 |
| ② 2-1 | `robocopy "…\supabase" "C:\Development\_prodpush\supabase" /E /XD .temp` | **그대로** + 기대 출력(실패 칸 0 · 종료 코드 1 은 정상) | — |
| ② 2-3 | `npx supabase db push --dry-run --project-ref …` | `npx.cmd supabase@2.117.0 db push --dry-run --project-ref …` | 실행 정책 |
| ② 2-4 | `npx supabase db push --project-ref …` | `npx.cmd supabase@2.117.0 db push --project-ref …` + `[Y/n]` 안내 | 실행 정책 |
| ⑤ ×3 | `npx supabase functions deploy <함수>   --project-ref …` (줄 맞춤 공백) | `npx.cmd supabase@2.117.0 functions deploy <함수> --project-ref …` · 칸 하나씩 | 실행 정책 |
| ⑤ 확인 | `curl -s -o /dev/null -w "%{http_code}\n" -X POST https://…/verify-purchase` | `curl.exe -s -o NUL -w "%{http_code}\n" -X POST https://…/verify-purchase` | PowerShell 5.1 의 `curl` 은 `Invoke-WebRequest` 별칭 → 매개 변수 오류 · `/dev/null` 없음 |
| ⑤ 확인 | `npx supabase secrets list --project-ref …` (눈으로 찾기) | `npx.cmd supabase@2.117.0 secrets list --project-ref … \| Select-String AI_CONSENT_ENFORCED` → **빈 출력이 정상** | 실행 정책 · 눈으로 찾다 놓침 |
| ⑤ · ⑧ 멈춤 · 되돌리기 | `npx supabase secrets unset AI_CONSENT_ENFORCED …` | `npx.cmd supabase@2.117.0 secrets unset AI_CONSENT_ENFORCED …` + `[y/N]` · `Secret not found`(이미 없음)도 정상 | 실행 정책 |
| ⑥ | 한 칸에 `cd` · 주석 · 커밋 · add · diff · 커밋 · push **여러 줄** | 칸 하나에 한 줄 × 7 + 🆕 `Compare-Object (Get-Content …\BUNDLE5_6_FILES.txt) (git diff --cached --name-only)` → **빈 출력이 정상** | 여러 줄 붙이기 → `>>` 로 꼬임(오너 PC 실측) · 목록 대조를 눈으로 |
| ⑦-2 | `npx supabase functions deploy chat …` | `npx.cmd supabase@2.117.0 functions deploy chat …` | 실행 정책 |
| ⑧ | `npx supabase secrets set AI_CONSENT_ENFORCED=true …` | `npx.cmd supabase@2.117.0 secrets set AI_CONSENT_ENFORCED=true …` | 실행 정책 |
| ⑨ | `npx expo install --check` · `npx eas-cli@latest build …` (한 칸) | `npx.cmd expo install --check` · `npx.cmd eas-cli@latest build …` · 칸 하나씩 | 실행 정책 |
| 되돌리기 | `supabase functions deploy <이름>` | `npx.cmd supabase@2.117.0 functions deploy <이름> --project-ref …` | `supabase` 는 PATH 에 없다 |

**그 밖에 고친 것** (명령은 아니지만 "예상 출력을 맞춘다" 에 걸린 것):
- **SQL 칸을 문장 하나씩** 나눴다 — ① 1칸 → 4 · ②-2 1 → 3 · ②-5 1 → 10(ⓐ~ⓙ) · ④ 2 → 6. SQL Editor 는 칸에 문장이 여럿이면 마지막 결과만 보여 줄 수 있어 기대값을 대조할 수 없었다. **문장 내용은 그대로**.
- 칸마다 **▶ PowerShell / ▶ SQL Editor** 표시와 바로 아래 **기대** 한 줄. 새 절 「⌨ 명령 치는 법」: 한 칸 = 한 줄 · `>>` 가 뜨면 Ctrl+C ·
  처음 한 번 `Ok to proceed? (y)` · 로그인 창이 뜨는 곳(1-10 · `git push` · ⑨) · 확인 질문(`[Y/n]` · `[y/N]`) · **비밀번호를 묻지 않음**(리허설: `Initialising login role...`) ·
  정상인 경고(`WARNING: Docker is not running` · `LF will be replaced by CRLF`) · 한글이 깨져 보여도 해시 · 숫자로 확인.
- Supabase CLI 를 **`supabase@2.117.0` 으로 고정** — 레포에 CLI 가 설치돼 있지 않아(`npx` 캐시에서 받는다) 세션 날 최신판이 받아질 수 있다. 리허설한 판 그대로 돌게.

## 2. PART 2 — staging 리허설 결과

**환경**: 이 PC · Windows PowerShell **5.1.19041** · 실행 정책 전 범위 `Undefined`(= Restricted, 오너 PC 와 같은 이유로 `npx` 가 막힘 — 재현함) ·
명령마다 새 `powershell.exe`(새 창과 같은 PATH — 이 도구의 Git Bash PATH 를 물려받으면 `wc` 가 돌아 버려 오너 PC 와 달라진다, 그래서 끊었다) ·
production ref → staging ref(`aephpsiurgkvqcswyeie`) 만 바꿈 · **git 은 레포 밖 임시 복제본**(색인 트리 `54124419…` 까지 같게 재현 · 원격은 임시 bare 저장소) ·
supabase 복사는 스크래치 폴더로(`C:\Development\_prodpush` 는 만들지 않았다 — 세션 날 staging 흔적이 섞이지 않게).

| # | 단계 | 명령 (후) | 결과 | 실제 출력 (요지) | 옛 명령 |
|---|---|---|---|---|---|
| S00 | 1-10 | `npx.cmd supabase@2.117.0 --version` | ✅ | `2.117.0` (처음엔 설치 알림) | — |
| S01 | 1-5 | `cd C:\Development\DeokbunAI-app` | ✅ | (없음) | — |
| S02 | 1-5 | `git log --oneline -1` | ✅ | `b31bb27 feat: 운영 원가 …` | 같음 |
| S03 | 1-5 | `(git diff --cached --name-only \| Measure-Object).Count` | ✅ | `63` | ❌ `wc` 인식 안 됨 |
| S04 | 1-8 | `npx.cmd jest …productionPackageFreeze.test.ts` | ✅ | `Tests: 21 passed, 21 total` | ❌ `npx.ps1` |
| S05 | 2-1 | `robocopy … /E /XD .temp` | ✅ | 요약 표 실패 0 · 종료 코드 1 | 같음 |
| S06 | 2-3 | `cd C:\Development\_prodpush` | ✅ | (없음) | — |
| S07 | 2-3 | `npx.cmd supabase@2.117.0 db push --dry-run --project-ref …` | ✅ | `Initialising login role...` → `Remote database is up to date.` (staging 은 이미 22 까지 — production 에선 9줄) | ❌ `npx.ps1` |
| S08 | 2-4 | `npx.cmd supabase@2.117.0 db push --project-ref …` | ✅ | `Remote database is up to date.` (변경 0) | ❌ |
| S10 | ⑤ | `… functions deploy verify-purchase …` | ✅ | `WARNING: Docker is not running` → `Uploading asset …` → `Deployed Functions.` | ❌ |
| S11 | ⑤ | `… functions deploy google-rtdn …` | ✅ | 같음 | ❌ |
| S12 | ⑤ | `… functions deploy iap-reconcile …` | ✅ | 같음 | ❌ |
| S13 | ⑤ 확인 | `curl.exe -s -o NUL -w "%{http_code}\n" -X POST …/verify-purchase` | ✅ | `401` | ❌ `Invoke-WebRequest` 매개 변수 오류 |
| S14 | ⑤ 확인 | `… secrets list … \| Select-String AI_CONSENT_ENFORCED` | ✅ | **빈 출력**(staging 게이트 꺼짐) | ❌ |
| S15 | ⑤ 멈춤 | `… secrets unset AI_CONSENT_ENFORCED …` | ✅ | 이미 없어서 `Secret not found with given name` — 변경 없음(문서에 "괜찮다" 로 적음) | ❌ |
| S17 | ⑥ | `git commit -F C:\Development\owner_inputs\BUNDLE3_4_COMMIT_MSG.txt` | ✅ | `63 files changed` | 같음 |
| S18 | ⑥ | `git add -A` | ✅ | (없음) | 같음 |
| S19 | ⑥ | `(git diff --cached --name-only \| Measure-Object).Count` | ✅ | `38` = `BUNDLE5_6_FILES.txt` 줄 수 | — |
| S20 | ⑥ | `Compare-Object (Get-Content …\BUNDLE5_6_FILES.txt) (git diff --cached --name-only)` | ✅ | **빈 출력**(목록 같음) | — |
| S21 | ⑥ | `git commit -F …\BUNDLE5_6_COMMIT_MSG.txt` | ✅ | `38 files changed` | 같음 |
| S22 | ⑥ | `git push origin admin/master-operations-content` | ✅ | `b31bb27..ad83b1e  admin/master-operations-content -> admin/master-operations-content`(임시 원격) | 같음 |
| S23 | ⑦-2 | `… functions deploy chat …` | ✅ | Docker 경고 → 파일 4개 올림 → `Deployed Functions.` | ❌ |
| S24 | ⑧ | `… secrets set AI_CONSENT_ENFORCED=true …` | ✅ **문법만** | (실행하지 않음 — staging 게이트는 PART 7 몫) | — |
| S25 · S26 | ⑧ 형태 | 같은 모양으로 `REHEARSAL_0914=1` set → unset | ✅ | `Finished supabase secrets set.` · `… unset.` | — |
| S28 | ⑨ | `git status --short` | ✅ | **빈 출력**(커밋 두 개 뒤) | 같음 |
| S29 | ⑨ | `npx.cmd expo install --check` | ✅ | `Dependencies are up to date` | ❌ |
| S30 | ⑨ | `npx.cmd eas-cli@latest build --platform android --profile production` | ✅ **문법만** | (EAS 0) | — |
| S31 | 1-10 | `npx.cmd supabase@2.117.0 login` | ✅ **문법만** | (이미 로그인됨) | — |

- **모든 명령이 한 줄로 완결** — PowerShell 파서로 명령 · 옛 명령 전부 검사, `>>` 를 부를 미완결 입력 0.
- **문서 대조**: 패키지 · 체크리스트의 서로 다른 명령 36개 = 통과한 리허설 명령과 **글자까지 같음**(production ref 만 치환 · 틀 1개 `<이름>` 제외).
- **복사본 검증**: robocopy 결과 103 파일 = 레포 103 파일 · 빠짐 0 · 더 있음 0 · 바이트 다름 0 · 동결 17 파일 SHA **17/17**.
- **SQL 29칸 전부 staging 에서 실행 — 오류 0.** 되돌리기 3칸(22 · 21 · 20)은 `begin … rollback` 으로 감싸 실행(먼저 탐침으로 `db query` 가 명시
  트랜잭션을 지키는지 확인 — 만든 표가 롤백 뒤 없음). 쓰기가 있는 칸(3-1 백필 · 4-1 · 4-2 · 4-3)은 staging 에서 **변경 0**(백필 0건 · 정리 0건 · 같은 일정 재등록).
- **대화형 질문은 이 방식으로 재현되지 않는다**(비대화형 실행): `Ok to proceed? (y)` · `db push` 의 `[Y/n]` · `secrets unset` 의 `[y/N]` 은 CLI 실행 파일의
  문자열(`Do you want to push these migrations …` · `Do you want to unset these function secrets?`)과 npm 의 동작으로 확인해 문서에 적었다.
  오너 콘솔에서 한글 출력 모양(깨짐)도 여기서는 볼 수 없다 — 문서는 해시 · 숫자로 확인하게 적었다.

## 3. 리허설이 찾은 결함 — 1-3 외래키 조회 (고침)

- 옛 판(= `docs/M4_HANDMADE_TABLES_AUDIT_2026-09-12.md` §5-1)은 `information_schema` 를 읽었다. SQL Editor(와 CLI)의 역할은 `auth.users` 의 주인이 아니라서
  **`auth.users` 를 가리키는 외래키가 결과에서 통째로 빠진다.** staging 실측: 광고 칸 `SET NULL` 3줄만 나오고 확인 대상인 `user_id → auth.users` 줄은 0.
- 그대로였다면: 확인할 줄은 안 보이고, "CASCADE 가 아닌 줄이 있으면 멈춤" 에 광고 칸이 걸려 **세션 첫 단계에서 거짓 멈춤**.
- 고침: `pg_constraint` 를 직접 읽는 조회로 바꾸고 기대를 줄 단위로 적었다 — staging 실측 7줄: `user_id` 세 줄 `CASCADE | auth.users` ·
  광고 칸 셋 `SET NULL | advertisements` · `admin_users.created_by` `NO ACTION`(관리자 전용 — M4 문서 §4 에 이미 있음). 멈춤 신호 · 요약 카드 · 체크리스트 문구도 맞춤.
- ⚠ M4 문서 §5-1 에는 **옛 조회가 그대로** 있다 — 이번 규율상 고칠 수 있는 파일이 아니다(다음 묶음).

## 4. PART 3 — 설계 3건 (새 파일 · 구현 없음)

| # | 파일 | 요지 | 마이그레이션 | Edge |
|---|---|---|---|---|
| ① | `docs/DESIGN_FORTUNE_RECORDS_DELETE_2026-09-14.md` | MY → 나의 기록 → [운세 기록 전체 삭제]. 서버 함수 `delete_my_fortune_records()`(인자 없음 · `auth.uid()` 만 · 표 삭제 정책은 계속 닫음) · 24시간에 한 번 · 운세 알림 삭제 · **대기 메일 취소**(재시도 작업은 운세가 없으면 빈 메일을 보낸다 — 레포에서 확인) · 합성 반례 10 | **1** | **없음**(안 C) · 안 B 면 `chat` + 골든 |
| ② | `docs/DESIGN_CHANNEL_SRC_TRACKING_2026-09-14.md` | `?src=src_xxxxxxxx`(등록제) — 광고와 다른 이벤트 · 다른 귀속 칸이라 광고 지표 불변. 착지 · 첫 접촉 · 봇 거름 · 횟수 제한 · JWT 귀속 · 가입/첫 상담 트리거를 **그대로 재사용**, 가입 증거만 `src_click` 까지 넓힘 · 채널 · 영상별 성과 RPC · 합성 반례 12 | **1** | **`ad-track` 1** (상담 경로 아님) |
| ③ | `docs/DESIGN_VERCEL_WEB_ANALYTICS_2026-09-14.md` | 패키지 추가 없이(`package.json` 보호) 빌드 뒤 `dist/**/*.html` 에 Vercel 스크립트 태그 — `WEB_ANALYTICS=vercel` 일 때만. ⚠ `beforeSend` 로 **공유 링크 열쇠 · OAuth code · 관리자 주소를 지운다**(초안 조각을 문서에서 그대로 꺼내 합성 주소 8/8 확인) · 처리방침 한 줄 · 켜는 순서(오너) | **없음** | **없음** |

## 5. staging 변경과 되돌리기 (이번 묶음)

| 변경 | 되돌리기 |
|---|---|
| Edge 4개 재배포(`verify-purchase` · `google-rtdn` · `iap-reconcile` · `chat`) — 복사본에서, 동결 파일 그대로(SHA 17/17) | 필요 없음 — 같은 코드 |
| `db push` 2회 — 이미 최신이라 변경 0 | 없음 |
| SQL 3-1 백필(0건) · 4-2 정리(0건) · 4-3 같은 이름 · 같은 일정 재등록 · 4-1 확장(이미 있음) | 없음 |
| 되돌리기 SQL 3칸 — 트랜잭션 안에서 실행 후 ROLLBACK | 없음(흔적 없음) |
| 시크릿 `REHEARSAL_0914` set → unset · `AI_CONSENT_ENFORCED` unset 시도(없어서 오류 · 변경 없음) | 이미 되돌림 |
| 임시 복제본 · bare 원격 두 개 · 복사본 — 전부 세션 스크래치 폴더(레포 밖) | 지워도 됨 |

## 6. SHA · 인덱스 · 동결 지문

| | 시작 | 끝 |
|---|---|---|
| 인덱스 `git write-tree` | `54124419421827d52b41494c0c8050773b76056f` | **같음** · 스테이징 63 · HEAD `b31bb27` · `core.ignorecase` true 그대로 |
| 보호 파일 6 | `app.json ee1e10a7…` 외 5 | **전부 같음** |
| 동결 지문(17 파일 목록 SHA-256) | `2bd16d2a4214a0606ef79bd7206bb9dd4b20f318d6b12309d089890eb7ca882a` | **같음** · 동결 테스트 21/21 |
| 마이그레이션 · Edge · 앱 코드 | — | **이번 묶음 변경 0** (바뀐 레포 파일: 패키지 · 체크리스트 · 설계 3 · 이 보고서 · 동결 테스트 한 줄 — 아래) |

## 7. 테스트 · 상한

| | 전 | 후 |
|---|---|---|
| jest | 363 / 6,391 | **363 / 6,391** 통과 · 실패 0 (43.9초 — 시간 초과 없음) |
| tsc | 0 | 0 |
| preflight | BLOCK 1 (알려진 것 — 잠긴 폴더 테스트 한 줄) | 같음 |

LLM **0** · EAS **0**.

## 8. 규율에서 벗어난 것 1

- **동결 테스트(`src/features/chat/__tests__/productionPackageFreeze.test.ts`) 한 줄** — 이번 규율은 "고칠 수 있는 파일은 패키지 · 체크리스트뿐" 인데,
  이 테스트는 패키지의 배포 줄을 `^npx supabase functions deploy` 로 찾는다. PART 1 대로 `npx.cmd supabase@2.117.0 …` 로 바꾸면 **동결 테스트가 깨진다**
  ("동결 지문 테스트 통과 유지" 와 충돌). 둘 다 지키려면 명령을 옛 모양으로 두거나 테스트를 속이는 줄을 넣어야 해서, **정규식만** `npx(.cmd)? supabase(@판)?` 로
  넓혔다. 테스트가 지키는 것(배포 대상이 정확히 넷 · 진입 파일이 동결 목록에 있음)은 그대로 — 반례 3/3(배포 줄 삭제 · 없는 함수 · 넷째 함수) 여전히 실패.
  → **CTO 확인 필요 (C1).**

## 9. 목록 셋

### CTO 판정 필요

| # | 무엇 |
|---|---|
| C1 | 동결 테스트 정규식 한 줄 확장(§8) |
| C2 | 설계 ① 의 "지운 뒤 다시 생성" 안 — **C(24시간 1회 · Edge 변경 없음) 권함** / B(기간 끝까지 생성 안 함 · `chat` 변경 + 골든) |
| C3 | 설계 ② 의 등록제(`src_` 코드를 관리자가 발급) — 자유 문자열을 받지 않는 대신 영상마다 등록이 필요 |
| C4 | 다음 묶음에서 고칠 문서 둘 — M4 문서 §5-1 의 옛 외래키 조회 · Play Console 한 장(`npx eas-cli …` → `npx.cmd`) — 이번 규율상 손대지 않음 |

### 오너 결정 필요

| # | 무엇 |
|---|---|
| O1 | 설계 ③ — Vercel Web Analytics 를 켤지(켜면 대시보드 Enable · 환경변수 `WEB_ANALYTICS=vercel` 은 오너가) |
| O2 | 설계 ① ③ 의 처리방침 문장 — 법률 검토 때 한 번에(버전도 그때) |

### 오너 할 일

| # | 무엇 | 언제 |
|---|---|---|
| 1 | 새 APK 설치 → 채팅에 **"새 APK 설치함"** (직전 PART 7 — staging 동의 게이트) | 지금 |
| 2 | production 세션은 **고친** `docs/OWNER_CHECKLIST_PROD_SESSION_2026-09-14.md` · 패키지로 — PowerShell 에 **한 칸씩** | CTO 최종 GO 뒤 |
| 3 | 세션 전날 한 번: `npx.cmd supabase@2.117.0 --version` 을 쳐서 `2.117.0` 이 나오는지(처음이면 `y`) — 로그인이 풀려 있으면 그때 `login` | 세션 전 |

## 10. 바뀐 파일 · 커밋

바뀐 레포 파일(이번 묶음): `docs/PRODUCTION_APPLY_PACKAGE_2026-09-12.md` · `docs/OWNER_CHECKLIST_PROD_SESSION_2026-09-14.md` ·
🆕 `docs/DESIGN_FORTUNE_RECORDS_DELETE_2026-09-14.md` · 🆕 `docs/DESIGN_CHANNEL_SRC_TRACKING_2026-09-14.md` · 🆕 `docs/DESIGN_VERCEL_WEB_ANALYTICS_2026-09-14.md` ·
🆕 이 보고서 · `src/features/chat/__tests__/productionPackageFreeze.test.ts`(정규식 한 줄 — §8).

커밋은 패키지 ⑥ 의 두 번째 커밋에 합류 — `C:\Development\owner_inputs\BUNDLE5_6_COMMIT_MSG.txt`(갱신 · 첫 줄
`feat: 대화·리포트 삭제 · C9 답 원문 정리 · 스토어 문구(세 안) · production 패키지 동결본 · PowerShell 리허설`) ·
목록 `BUNDLE5_6_FILES.txt` **38 파일**(리허설 복제본에서 `Compare-Object` 빈 출력 · `38 files changed` 로 확인).

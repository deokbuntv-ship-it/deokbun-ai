# 오너 런북 — 2026-09-10 (계정 대기 기간 묶음)

이 문서는 **오너가 그대로 붙여 넣는 명령어**만 모은 것입니다. 배경과 판단은
최종 보고(대화)와 `PROJECT_STATE` 를 보십시오.

⚠ 아래 절차 중 **production 을 건드리는 것은 전부 오너가 직접** 합니다. 에이전트는
staging 까지만 했습니다.

---

## 1. 커밋 (가장 먼저)

이번 트랙의 변경은 커밋되지 않았습니다. EAS 빌드는 미커밋 상태에서 올라갔으므로,
**같은 APK 를 다시 만들려면 먼저 커밋해야 합니다.**

```bash
git add -A && git status --short
```

커밋 메시지 제안은 최종 보고 맨 아래에 있습니다.

---

## 2. 원가 마이그레이션 — production 적용

⚠ 이 폴더의 훅이 production ref 를 막습니다. 기존 방식대로 **`supabase/` 만 별도 폴더로
복사해서** 그 폴더에서 실행하십시오.

### 2-1. 복사 (PowerShell)

```powershell
robocopy "C:\Development\DeokbunAI-app\supabase" "C:\Development\_prodpush\supabase" /E /XD .temp
```

### 2-2. 적용

```bash
cd C:\Development\_prodpush
npx supabase db push --project-ref olvkpaldrwvtexxpoaag
```

⚠ `--include-all` 을 붙이면 **미적용 마이그레이션이 전부** 올라갑니다. 무엇이 올라갈지 먼저 보십시오:

```bash
npx supabase migration list --project-ref olvkpaldrwvtexxpoaag
```

### 2-3. 적용 후 확인 SQL (읽기 전용 — SQL Editor 에 붙여 넣기)

```sql
select tablename, rowsecurity from pg_tables
 where schemaname='public' and tablename in ('model_pricing','fx_rate');
select count(*) as 단가행수 from public.model_pricing;
select proname from pg_proc where proname = 'admin_ai_cost_window';
```

기대: 두 표 모두 `rowsecurity = true` · 단가행수 `0` · 함수 `admin_ai_cost_window` 1행.

### 2-4. 되돌리기 SQL

```sql
drop function if exists public.admin_ai_cost_window(int);
drop table if exists public.model_pricing;
drop table if exists public.fx_rate;
delete from supabase_migrations.schema_migrations where version = '20260915000000';
```

⚠ `fx_rate` 는 이 마이그레이션이 처음 만든 표입니다. 다른 것이 쓰고 있지 않습니다.

### 2-5. 단가·환율 입력 (Z14)

관리자 → **AI 사용량·비용** 화면 아래 **"모델 단가 · 환율"** 에서 넣습니다.
출처와 어느 칸을 보는지는 화면에 적혀 있습니다.

**입력 후 확인 기준** — 관리자 화면의 상품별 건당 원가가 아래 자릿수와 크게 다르면 계산이 틀린 것입니다:

| 상품 | 기대 자릿수 |
|---|---|
| 일반 상담 | ₩7 ~ ₩36 |
| 궁합 | ₩185 |
| Premium | ₩57 |

⚠ 단가를 넣기 전에는 금액 자리에 **"가격 미확인"** 이 뜹니다. **0원이 아닙니다.**

---

## 3. 안드로이드 내부 테스트 APK

### 3-1. 빌드 (이미 1회 실행함 — 다시 만들 때만)

```bash
npx eas-cli@latest build --platform android --profile internal --non-interactive
```

### 3-2. 폰에 설치하는 법 (비개발자용)

> **이번에 만든 APK (2026-09-10 20:00 완료, 프로필 `internal`)**
> 설치 페이지 · QR: https://expo.dev/accounts/deokbuni/projects/DeokbunAI/builds/59495a63-5e09-4174-8d5f-835b10660589
> 파일 직접 받기: https://expo.dev/artifacts/eas/A0Mc7_1JIBh35w_KwfPbQFoUUrLzERn2n2jQ-S-npFc.apk

1. 위 **설치 페이지**를 열면 **QR 코드**가 있습니다.
   앞으로 만드는 빌드는 여기서 볼 수 있습니다 →
   https://expo.dev/accounts/deokbuni/projects/DeokbunAI/builds
2. **안드로이드 폰의 카메라**로 QR 을 찍고, 뜨는 링크를 누릅니다.
   (컴퓨터에서 링크를 카카오톡 "나에게 보내기" 로 폰에 보내도 됩니다.)
3. 브라우저가 열리면 **[Install]** 을 누릅니다. `.apk` 파일이 내려받아집니다.
4. 폰이 **"출처를 알 수 없는 앱"** 을 막으면 이렇게 허용합니다:
   - 뜨는 안내에서 **[설정]** 을 누릅니다
   - **"이 출처 허용"** 을 켭니다
   - 뒤로 가서 다시 설치를 누릅니다
   - (직접 찾아가려면: 설정 → 앱 → 특별한 접근 권한 → 알 수 없는 앱 설치)
5. 설치가 끝나면 **덕분이** 아이콘이 생깁니다.

⚠ 이 APK 는 **테스트용**입니다. 스토어에 올라가는 것과 다릅니다.

### 3-3. 이 빌드가 어느 DB 를 보는지 확인하는 법

앱을 열고 **[MY] 탭 → 맨 아래로 스크롤**하면 회색 작은 글씨로 이렇게 보입니다:

```
내부 테스트 빌드 · internal · aephpsiurgkvqcswyeie.supabase.co
```

**`aephpsiurgkvqcswyeie`** 가 보이면 **staging(연습용 DB)** 입니다 — 여기서 무엇을 하셔도
실제 서비스 데이터에 영향이 없습니다.
⚠ 만약 `olvkpaldrwvtexxpoaag` 가 보이면 **실서비스 DB** 이니 즉시 알려 주십시오.
스토어 빌드에서는 이 줄이 **아예 보이지 않습니다.**

---

## 4. 실기기 체크리스트 (계정 없이 가능한 것만)

`DEVICE_QA_MATRIX` 28단계 중 **로그인 없이 확인 가능한 9항목**입니다.
이번 빌드의 목적은 **레이아웃**(줄바꿈·스크롤·터치 영역·글꼴 폭)입니다.

| # | 무엇을 | 무엇을 보면 되는지 |
|---|---|---|
| 1 | 앱을 처음 열기 | 흰 화면이 아니라 스플래시 → 온보딩 첫 화면이 뜨는가 |
| 3 | 온보딩 약관 화면 | 필수/선택이 눈으로 구분되는가. 글자가 화면 밖으로 나가지 않는가 |
| 17 | 로그인 전 MY 탭 | "로그인하면 …" 안내와 버튼이 잘리지 않고 다 보이는가 |
| 24 | 화면 돌리기 | 가로로 돌렸을 때 글자가 겹치거나 잘리지 않는가 |
| 25 | 키보드 | 생년월일 입력칸을 눌렀을 때 키보드가 입력칸을 가리지 않는가 |
| 26 | 노치·제스처 바 | 맨 위·맨 아래 글자가 시계나 홈바에 가려지지 않는가 |
| 27 | 글꼴 크게 | 설정에서 글꼴을 가장 크게 한 뒤, 글자가 잘리지 않고 줄바꿈되는가 |
| 20 | 비행기 모드 | 켠 채로 화면을 넘길 때 앱이 죽지 않고 안내가 뜨는가 |
| 28 | 오류 화면 | (일부러 만들기 어려우면 건너뛰십시오) 오류 시 딱딱한 영문 대신 안내가 뜨는가 |

**제외 19항목과 사유**
- 로그인이 필요해서 제외 (12): #2 OAuth · #4 생년 입력 · #5 웰컴 · #6 덕 칩 · #7 촛불 ·
  #8 일반 상담 · #9 후속 질문 · #10 세션 한도 · #11 덕 부족 · #14 오늘 운세 · #15 월간 운세 · #16 우편함
- 로그인 + 덕 잔액이 필요해서 제외 (2): #12 궁합 가격 · #13 궁합 부족
- 로그인 후 상태가 필요해서 제외 (5): #18 알림함 · #19 푸시 권한 · #21 백그라운드 복귀 ·
  #22 로그아웃/재로그인 · #23 딥링크

⚠ 이번 빌드는 IAP·애플 로그인·푸시를 확인 대상으로 삼지 않습니다.

---

## 5. 가상 인물 — production 등록 절차

staging 에서 파이프라인이 도는 것을 확인했습니다(아래 §5-2).
production 에 같은 인물을 올리려면:

### 5-1. 관리자 화면에서 (권장)

1. production 관리자 → **유명인 → 새로 만들기**
2. 아래 값을 그대로 넣습니다:

| 칸 | 값 |
|---|---|
| 이름 | `예시인 하나` |
| 슬러그 | `fictional-demo-1` |
| 분류 | `가상 예시` |
| 직업 | `가상 인물 (예시)` |
| 한 줄 소개 | `실존하지 않는 가상 인물입니다. 명식 해설 파이프라인 확인용으로 만들었습니다.` |
| 생년월일 | `1993-04-17` |
| 태어난 시각 | `10:25` (정확) |
| 성별 | 여 |
| 출생지 | `전주` |
| 출처 | `estimated` |
| 출처 메모 | `⚠ 가상 인물입니다. 실존 인물이 아니며, 생년월일시는 예시로 지어낸 값입니다.` |
| 상태 | **초안(draft)** ← ⚠ 발행하지 마십시오 |

3. **[명식 계산 + 본문 생성]** 을 누릅니다 (LLM 1콜)
4. 본문을 읽고 판단합니다

### 5-2. ⚠ 발행하면 사이트가 재배포됩니다

`status` 를 `published` 로 바꾸는 순간 `site-deploy` 가 호출되고 Vercel 배포 훅이 돕니다.
**발행은 본문을 읽고 만족한 뒤에** 하십시오.

### 5-3. 가상 표시 수단이 스키마에 없습니다

`famous_profiles` 에 "가상 인물" 전용 플래그가 **없습니다**. 위 절차는 `category` ·
`occupation` · `short_description` · `birth_source_note` 로 표시합니다.
⚠ **공개 페이지에 그 표시가 실제로 노출되는지는 확인하지 않았습니다** — 발행 전에
`/famous/<slug>` 를 열어 "가상 인물" 이라는 말이 독자 눈에 보이는지 확인하십시오.
안 보이면 **발행하지 마십시오** (실존 인물로 오해될 수 있습니다).

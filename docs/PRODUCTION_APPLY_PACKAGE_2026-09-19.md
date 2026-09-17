# production 적용 패키지 — 2026-09-19 묶음 (상담 답변 구조 개편) · ⚠ CTO 판정 후 실행

## 🧾 CTO 요약 — 한 장

| | |
|---|---|
| **단계** | **8** (①~⑧) — ①·②·⑧ 끝남. **③ 전에 오너가 폰(내부 APK)에서 짧은 답의 방향을 먼저 본다**(CTO 권고) |
| **예상 시간** | production 30~40분 · LLM: production 상담 1 |
| **올리는 것** | **Edge `chat` 1개** + **웹 병합 1건**. DB 마이그레이션 **0** · 새 시크릿 **0**(스위치는 기본 켜짐) · `app.json` **0** |
| **되돌리기** | **즉시(1분)**: 시크릿 `SHORT_ANSWER_REWRITE=off` 한 줄 → 짧은 답이 서버 원문으로 나간다(모델 호출 0). **완전**: 직전 `chat` 재배포 + Vercel Instant Rollback |
| **가장 위험한 단계** | ⑤ production `chat` 배포 — 상담 서버 경로가 바뀐다. 단 **긴 답·판단 저장·과금 분류는 바이트 단위로 같다**(테스트 `shortAnswerWiring` · 로컬 골든 28/28 동일) |
| **왜 지금** | 오너가 본 답이 "조회 결과 같다" — 짧은 대화(200~350자) · AI 문장이 화면에 도달 · 사실은 서버가 정함(중간안) |

### 무엇이 달라지나 (오너가 눈으로 볼 것)

| # | 지금 | 이 배포 뒤 |
|---|---|---|
| 1 | 결론·설명·좋은 흐름·조심할 점이 **한꺼번에 펼쳐진** 긴 답 | **짧은 답 한 칸**(성향 → 이번 달/올해 → 어떻게 → 되묻기). 나머지는 **「왜 이렇게 보나요?」를 누르면** 펼쳐진다 |
| 2 | 말투가 "~습니다" | 짧은 답은 "~해요" — 서버 문장을 AI가 **말투만** 다듬는다. 내용이 바뀌면 버리고 서버 문장을 그대로 낸다 |
| 3 | 답 끝이 닫혀 있음 | 답 끝에 **되묻기 한 줄**("그 사람과는 주로 어디서 부딪히세요?") — 서버가 고른다 |
| 4 | 기다리는 동안 한 문장 | 시간에 따라 바뀌는 안내 3단계(숫자 카운트다운 없음) |
| 5 | 리포트에 자세한 해석이 빠져 있음 | 상담에서 접혀 있던 자세한 해석이 리포트에 문단으로 들어간다 |

### 멈춤 신호

- ① 테스트 실패 · 파일 목록에 모르는 파일 · `app.json` · `src/generated/famousStatic.ts` · `.claude/settings.json` 이 목록에 있음
- ③ 전 — 오너가 폰에서 본 짧은 답이 "딱 짚어 주고, 편안하고, 다음이 궁금한" 방향이 **아님** → 올리지 말고 CTO 와 먼저 이야기
- ⑤ 배포 실패 · ⑥ 상담 실패 · 짧은 답 칸이 안 보임(5분 넘게)

---

## ① 준비 확인 (개발자 · 끝남 — 2026-09-19 세션)

| 확인 | 결과 |
|---|---|
| 전체 테스트 | ✅ **376 스위트 / 6602 통과** (기준선 369 / 6481) |
| 타입 검사 · preflight | ✅ `tsc` 0 오류 · ✅ PREFLIGHT PASS |
| 보호 파일 6개 | ✅ SHA 불변 · `economyContractV1.test.ts` 불변 |
| 골든 미니팩 — **로컬 결정론** | ✅ **PASS 58.32** (baseline 58.28) — 방법 검증: 지난 공식 staging 실행을 **28건 모두 같은 점수로 재현**(LLM 0) |
| 골든 미니팩 — **staging 공식** | ⚪ **로컬 결정론 결과로 갈음** (CTO 판정 2026-09-17 — 재현성이 먼저 확인됐으므로 다시 돌리지 않는다) |
| 레드팀 | ✅ 변형 3,743개 중 3,695개 적발 · 통과 48개는 **전부 기능어 변화(사실 불변)** · 악성 지시 받은 실제 모델 4회 → 4회 모두 차단 |

## ② staging 확인 — ✅ 끝남 (오너 허락 2026-09-17)

| 확인 | 결과 |
|---|---|
| staging `chat` 배포 | ✅ 버전 47 → **48** |
| 오너 명식 세 질문 · staging 실제 흐름(`scripts/bundle8/stagingOwnerRun.mjs`) | ✅ 셋 다 200 · 짧은 답 **REWRITE**(다듬기 첫 시도 통과) · 서버 21.7~26.4초 |
| 스위치 `SHORT_ANSWER_REWRITE=off` | ✅ **SOURCE · NO_REWRITER · 모델 호출 0** — 서버 원문이 나감(입력 토큰도 다듬기 몫 약 320 만큼 적음) |
| 스위치를 지운 뒤 | ✅ 다시 **REWRITE** — 이번엔 첫 시도가 걸려 **재생성 1회 후 통과**(서버 43.7초) |
| 골든 | ⚪ 로컬 결정론 결과로 갈음(CTO) |
| 스모크 계정 명식 | 잠시 오너 명식으로 바꿨다가 **원본과 같게 되돌림** |

**staging 되돌리기**(필요할 때만): `git show HEAD:supabase/functions/chat/index.ts` · `…/_server/serverBundle.mjs` 두 파일로 되돌려
`npx supabase@2.117.0 functions deploy chat --project-ref aephpsiurgkvqcswyeie` (배포 전 = 버전 47).

## ③ 커밋 · PR (오너 · 화면에서)

> 커밋 메시지는 `C:\Development\owner_inputs\BUNDLE8_COMMIT_MSG.txt` 에 있습니다.
> ⚠ **`git add -A` 를 쓰지 마십시오.** 개발자가 스테이징한 목록 그대로 커밋합니다(`git status` 의 "Changes to be committed").
> `src/generated/famousStatic.ts`(줄바꿈만 다름) · `.claude/settings.json` · `output/` · `reports/` 는 넣지 않습니다.

## ④ 병합 (오너 · GitHub 버튼)

지난번과 같습니다 — **Merge pull request** → **Confirm merge**. Vercel 이 2~5분 안에 빌드합니다.

> **순서는 ④ 병합과 ⑤ Edge 배포 중 어느 쪽이 먼저여도 안전합니다.**
> 서버가 먼저면 옛 화면은 새 칸(`shortAnswer`)을 모르고 예전처럼 긴 답을 보입니다. 화면이 먼저면 새 화면은 짧은 답이
> 없으니 예전 모양으로 보입니다. **권장: ⑤ 먼저 → ④** (병합되는 순간 새 화면이 바로 짧은 답을 보인다).

## ⑤ production `chat` 배포 (오너 · PowerShell)

```
npx.cmd supabase@2.117.0 functions deploy chat --project-ref olvkpaldrwvtexxpoaag
```

기대: `Deployed Functions on project olvkpaldrwvtexxpoaag: chat`. 새 시크릿은 **없습니다**(다듬기 스위치는 기본 켜짐).

## ⑥ 실사이트 확인 (오너)

**⑥-1 상담 1회** — 로그인 → 상담 한 번.
기대: 답 칸이 **짧은 글 하나**이고 마지막 줄이 되묻기다. **「왜 이렇게 보나요?」** 를 누르면 결론·좋은 흐름·조심할 점·근거가 나온다.

**⑥-2 기록 확인** (SQL Editor · production · 읽기) — `scripts/bundle8/shortAnswerTelemetry.sql` 내용을 그대로 붙여 넣는다.
기대: 한 줄 · `short_answers` 1 이상 · `delivered_rewrite` 또는 원문(`source_…`) 칸에 건수. 원문이 나간 것은 오류가 아니다.

**⑥-3 지켜보기 — 재생성 비율 (CTO 기준 2026-09-17)** — 같은 조회를 **상담이 30건 이상 쌓인 뒤** 다시 돌린다.

| 칸 | 기준 | 넘으면 |
|---|---|---|
| `regen_pct` (다듬기를 부른 답 중 재생성된 비율) | **10% 이하** | 검사 기준이 너무 빡빡하다 → `failure_counts` 에서 가장 많이 걸린 검사부터 조정(다음 묶음) |
| `p50_sec_regenerated` | 참고 — staging 첫 실측 43.7초(평소 21~26초) | 재생성이 드물어도 이 값이 크면 기다림이 길다는 뜻 |

staging 에서 이 조회를 검증했다(5건 · 재생성 1 · 25% — 표본 4건이라 판단 재료 아님).

**⑥-4 덕 경제 확인 — 모든 production 세션 공통** (2026-09-17 패키지 ④-5 를 그대로 가져왔다)
`scripts/bundle8/dukDiag.oneline.sql` · 기대값은 `docs/PRODUCTION_APPLY_PACKAGE_2026-09-17.md` ④-5 표.
이번 묶음은 차감·원장을 건드리지 않는다 — **`sessions_rows_approx` 가 늘어 있어야** 한다(⑥-1 상담이 차감됐는지).

## ⑦ 되돌리기

| 무엇이 잘못됐나 | 되돌리는 법 |
|---|---|
| 짧은 답 말투가 이상함 · 다듬기 모델 장애 · 원가 급등 | **즉시**: `npx.cmd supabase@2.117.0 secrets set SHORT_ANSWER_REWRITE=off --project-ref olvkpaldrwvtexxpoaag` → 모델을 부르지 않고 서버 원문이 나간다. 다시 켜기: `secrets unset SHORT_ANSWER_REWRITE` |
| 상담 자체가 깨짐 | 직전 `chat` 재배포(git 의 이전 커밋 `supabase/functions/chat/` 로) |
| 화면이 깨짐 | Vercel → Deployments → 직전 것 → **Instant Rollback** |
| DB | **되돌릴 것이 없습니다** — 이 묶음은 DB 를 건드리지 않습니다 |

## ⑧ 내부 APK — ✅ 빌드함 (2026-09-17)

화면 코드가 바뀌었다(짧은 답 칸 · 대기 안내 · 리포트). staging 을 보는 내부 APK 를 ② 뒤에 1회 빌드했다
(`EAS_NO_VCS=1` · 프로필 `internal` · 빌드 `1474ee7b-6c43-4373-8209-3295ed9cbd18`). 링크는 세션 보고서에 있다.
폰에서 상담 1회 → 짧은 답 한 칸 · 「왜 이렇게 보나요?」 를 누르면 긴 답 — 이것만 보시면 된다.

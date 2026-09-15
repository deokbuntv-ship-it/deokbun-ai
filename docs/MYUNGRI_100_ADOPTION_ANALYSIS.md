# 명리 데이터 "100종" (운세컨텐츠 DB) — V1 채택 판정 분석

> **성격: 분석/판정 전용 문서 (구현 아님).** `5feeb7b` 구현 보존, ENGINE-12 미수정, commit/push/deploy 없음.
> 원본: `운세컨텐츠 DB 100종 (php utf8) 비번12341234.zip` (74MB, 11,148 files, ~167MB 해제) — 스크래치패드에서만 해제·분석, repo 미포함.

## 0. 핵심 요지 (먼저 읽을 것)

이 ZIP은 **"명리 규칙 100개 표"가 아니라, 219개 상품코드를 가진 레거시 PHP 운세 콘텐츠 시스템**이다("100종"은 마케팅 라운드 넘버). 구성:
- **결정론적 명리 계산 코어** ~15개 모듈 (`solve/*.php`) — 여기에 실제 "명리 데이터"의 채택 가치가 집중됨.
- **레거시 만세력** (MySQL `mansedata` 테이블 + `.dat` 3종) — 프로즌 KASI/lunar-javascript 엔진이 이미 대체.
- **신살/성요 표 128개** (`etc/J016_data/sung_*.php`) — 자미두수 혼입된 해석 HTML.
- **상품별 해석 텍스트 템플릿** 219종 (`unse/*`, `solve/{S,J,T,G,N,F,Y}/*`) — 사주/궁합/점/작명/관상/로또 등.

**가장 중요한 발견 2가지:**
1. `solve/hyungchung.php`의 형충파해합·삼합 표가 **현재 `5feeb7b`의 `deokbunai.myungri-pillar-relations.v1`과 규칙 내용이 정확히 일치**(내 V1이 육합·방합·반합까지 포함한 상위집합) → **관계 계층은 원본으로 교차검증 완료된 ADOPT**.
2. `solve/sinyaksingang.php`(강약)는 **저자 고유 가중치**(0.7/0.5/0.3, 왕지 1.2, 土월 0.84, 천간 0.2) + 하드 임계값 `身强 if >1.2`를 쓰며, 원저자가 주석으로 **"이방식은 다음에 연구하기로 함"**이라 명시 → **강약 판정은 학파 의존·가짜 정밀도. 숫자 채우기용 ADOPT 금지 지시와 정확히 부합** → CONDITIONAL(결정론적 입력만, 판정값 제외).

## 1. 원본 실제 항목 수

| 구분 | 수 |
|---|---|
| ZIP 전체 파일 | 11,148 |
| 해제 용량 | ~167 MB |
| 상품 코드(solve/[SJTGNFY]) | **219** (S=112, J=37, T=23, G=19, N=14, F=11, Y=3) |
| 신살/성요 표(sung_*) | 128 |
| 결정론적 명리 계산 모듈(solve top-level) | 38 (핵심 ~15) |
| 마케팅 명목 "종" | 100 |
| **판정 대상으로 정제한 명리 fact-계층 항목** | **30** (§4 마스터표) |

판정은 219개 해석 상품이 아니라 **명리 fact 계층 30개 항목** 단위로 수행한다(엔진에 들어갈지 여부가 실제로 갈리는 지점). 상품 219종은 §5(N 카테고리)에서 그룹 판정.

## 2. 판정 개수 요약

| 판정 | 개수 | 항목 |
|---|---|---|
| **ADOPT** | **15** | 12개 이미 구현(오행·음양·십신·지장간십신·지장간·형충파해합삼합·24절기·양음력·대운·세운·월운·시간축관계) + 3개 소규모 갭(대운십신·통근/투간·월령/득령) |
| **CONDITIONAL** | **4** | 강약(입력만)·12운성·12신살·궁합 관계기반 |
| **REFERENCE_ONLY** | **6** | 레거시 4주 소스·입춘 년경계 정책참고·격국(참고)·용신/조후(참고)·해석 corpus·레거시 만세력 |
| **EXCLUDE** | **5** | 신살 성요 128·작명·관상·로또·admin/인프라 |
| 합계 | 30 | |

> **반(反)-인플레이션 확인:** 신살 성요 128종·작명·관상·로또를 EXCLUDE, 해석 corpus·용신/격국을 REFERENCE_ONLY로 두어 "100 채우기"를 하지 않음. ADOPT는 결정론적으로 재현·검증 가능한 15개 fact에 한정(그중 12개는 이미 구현되어 있어 원본은 교차검증 역할).

## 3. 카테고리별 분포 (A–N)

| 코드 | 계층 | 원본 존재 | 판정 요약 | 5feeb7b/엔진 |
|---|---|---|---|---|
| A | 원국 4주 | ✓(레거시 만세력) | ADOPT(fact)/REFERENCE(레거시소스) | ✓ `calculateFourPillars` (KASI) |
| B | 오행/음양 | ✓ `ohang.php`/`umyang_check.php` | ADOPT | ✓ 분포+음양 파생 |
| C | 십신 | ✓ `sipsin*.php`/`daeun_sipsin.php` | ADOPT(대운십신 소갭) | ✓ `calculateTenGod` |
| D | 지장간/통근/투간 | ✓(지장간)·부분(통근) | ADOPT(통근/투간 소갭) | ✓ `getHiddenStems` / ✗ 통근 |
| E | 천간/지지 관계 | ✓ `hyungchung.php` | **ADOPT(교차검증 완료)** | ✓ `pillar-relations.v1` |
| F | 계절/월령 | ✓ `div24.dat`·월령 로직 | ADOPT(월령 소갭) | ✓ 절기(ENGINE-12) / 부분 월령 |
| G | 대운 | ✓(대운 로직) | ADOPT | ✓ `calculateSajuDaewoon`(ENGINE-12) |
| H | 세운 | ✓(년운 상품) | ADOPT | ✓ `calculateSewoon`(5feeb7b) |
| I | 월운 | ✓(월운 상품) | ADOPT | ✓ `calculateWolwoon`(5feeb7b) |
| J | 원국↔대운↔세운↔월운 관계 | ✓(hyungchung 응용) | ADOPT | ✓ `calculateMyungriTimeAxis`(5feeb7b) |
| K | 강약 결정론적 중간fact | ✓ `sinyaksingang.php` | **CONDITIONAL(입력만)** | ✗ (오행분포만 존재) |
| L | 격국/용신 | ✓ `myungsik.php`/`sajujowha*.php` | **REFERENCE_ONLY** (학파 의존) | ✗ (의도적 미구현) |
| M | 신살/보조 | ✓ `12unsung`·`12sinsal`·`sung_*`128 | 12운성/12신살=CONDITIONAL, 성요128=**EXCLUDE** | ✗ |
| N | 기타(해석상품) | ✓ 219 상품 | REFERENCE_ONLY(사주/궁합/점) · EXCLUDE(작명/관상/로또) | ✗ |

## 4. 마스터 판정표 (명리 fact 계층 30항목)

각 항목: ID · 항목명 · 원본파일 · 계층 · 판정 · 이유 · deterministic · 5feeb7b · 기존엔진 · ENGINE-12 · OSS · 자체구현 · 학파의존 · 입력 · 검증 · 상담가치 · 우선순위.

| ID | 항목 | 원본 | 계층 | 판정 | det. | 5feeb7b | 엔진 | ENG-12 | OSS후보 | 학파 | 상담가치 | 우선 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| M-01 | 사주 4주(년월일시 간지) | manse_c2.php, saju_made.php, *.dat | A | ADOPT(fact)/REF(레거시) | Y | via | ✓ calculateFourPillars | 계산기반 | lunar-javascript@1.7.7 / KASI | 낮음 | 필수 | P0(완료) |
| M-02 | 입춘 년경계(절입) | sajujowha.php `jeolip` | A/F | REFERENCE_ONLY(+정책flag) | Y | 세운=year-label | 프로필=LUNAR_YEAR | solar-term.v1 | lunar-javascript | 낮음(정책) | 높음 | **P0 risk** |
| M-03 | 오행 분포 | ohang.php | B | ADOPT(구현됨) | Y | — | ✓ calculateFiveElementDistribution | — | — | 낮음 | 높음 | 완료 |
| M-04 | 음양 | umyang_check.php | B | ADOPT(구현됨) | Y | 사용 | ✓ yin-yang 파생 | — | — | 낮음 | 중 | 완료 |
| M-05 | 십신(천간) | sipsin*.php | C | ADOPT(구현됨) | Y | 재사용 | ✓ calculateTenGod | — | lunar-javascript | 낮음 | 필수 | 완료 |
| M-06 | 지장간 십신 | sipsin+지장간 | C/D | ADOPT(구현됨) | Y | ✓ buildTenGodProfile | ✓ getHiddenStems | — | — | 낮음 | 높음 | 완료 |
| M-07 | 대운 십신 | daeun_sipsin.php | C/G | **CONDITIONAL/ADOPT(소갭)** | Y | 규칙有·미노출 | ✓ 규칙 | ✓ 대운 | — | 낮음 | 높음 | **P1** |
| M-08 | 지장간(장간표) | jijangan/파생 | D | ADOPT(구현됨) | Y | 사용 | ✓ HIDDEN_STEMS | — | — | 낮음 | 높음 | 완료 |
| M-09 | 통근/투간 | (강약 내재) | D | **ADOPT(소갭)** | Y | ✗ | ✗ | — | 자체 | 낮-중 | 높음 | **P1** |
| M-10 | 형충파해/합/삼합 | hyungchung.php | E | **ADOPT(교차검증 완료)** | Y | ✓ pillar-relations.v1 | ✓(myungri) | — | 자체 | 낮음 | 높음 | 완료✔ |
| M-11 | 월령/득령 | sinyaksingang.php(월지 왕지) | F | **ADOPT(소갭)** | Y | 부분 | 부분(월지) | ✓ 절기 | 자체 | 낮-중 | 높음 | **P1** |
| M-12 | 24절기 | div24.dat | F | ADOPT(구현됨) | Y | — | ✓ | ✓ solar-term.v1 | lunar-javascript | 낮음 | 중 | 완료 |
| M-13 | 양력↔음력/윤달 | suntolun.dat, YunDat.dat | A/F | ADOPT(구현됨) | Y | — | ✓ KASI | — | KASI/lunar-javascript | 낮음 | 필수 | 완료 |
| M-14 | 대운(수/방향/간지) | 대운 로직 | G | ADOPT(구현됨) | Y | ✓ 소비 | ✓ calculateSajuDaewoon | ✓ | lunar-javascript | 낮-중(정책) | 필수 | 완료 |
| M-15 | 세운 | 년운 상품 | H | ADOPT(구현됨) | Y | ✓ calculateSewoon | — | — | 자체 | 필수 | 높음 | 완료✔ |
| M-16 | 월운 | 월운 상품 | I | ADOPT(구현됨) | Y | ✓ calculateWolwoon | — | — | 자체 | 높음 | 높음 | 완료✔ |
| M-17 | 원국↔대운↔세운↔월운 관계 | hyungchung 응용 | J | ADOPT(구현됨) | Y | ✓ calculateMyungriTimeAxis | — | — | 자체 | 높음 | 높음 | 완료✔ |
| M-18 | 신강신약(강약) | sinyaksingang.php | K | **CONDITIONAL(입력만·판정 제외)** | 부분 | ✗ | ✗ | — | 자체(입력) | **높음** | 높음 | **P2** |
| M-19 | 격국 | myungsik.php | L | **REFERENCE_ONLY** | N | ✗ | ✗ | — | — | **매우높음** | 중 | P3 |
| M-20 | 용신/조후 | sajujowha*.php | L | **REFERENCE_ONLY** | N | ✗ | ✗ | — | — | **매우높음** | 중 | P3 |
| M-21 | 12운성(포태) | 12unsung.php | M | **CONDITIONAL** | Y(관례) | ✗ | ✗ | — | 자체 | 중 | 중 | **P2** |
| M-22 | 12신살 | 12sinsal.php | M | **CONDITIONAL** | Y | ✗ | ✗ | — | 자체 | 중(도화/역마/화개) | 중 | **P2** |
| M-23 | 신살 성요 128종 | etc/J016_data/sung_*.php | M | **EXCLUDE** | N(텍스트) | ✗ | ✗ | — | — | **매우높음** | 낮음 | 제외 |
| M-24 | 사주/궁합/점 해석 템플릿 | unse/{saju,gunghap,jum,theme,free} | N | **REFERENCE_ONLY** | N | ✗ | ✗ | — | — | 높음 | LLM grounding | P3 |
| M-25 | 궁합 관계 기반 fact | unse/gunghap, solve/G | N/E | **CONDITIONAL** | Y(기반) | 부분(관계) | — | — | 자체 | 중 | 중 | P2 |
| M-26 | 작명/성명학 | unse/name, solve/N | N | **EXCLUDE** | 별개학문 | ✗ | ✗ | — | — | — | — | 제외 |
| M-27 | 관상 | unse/faceface, solve/F | N | **EXCLUDE** | N | ✗ | ✗ | — | — | — | — | 제외 |
| M-28 | 로또/택일 | unse/lotto, selectDay | N | **EXCLUDE** | N/부분 | ✗ | ✗ | — | — | — | — | 제외 |
| M-29 | 만세력 legacy(MySQL+dat) | manse_c2.php, mansedata | A | **REFERENCE_ONLY** | Y | — | ✓ KASI 대체 | — | — | 낮음 | 검증 | 제외(대체됨) |
| M-30 | admin/PHPExcel/images | myadm521, lib, images | - | **EXCLUDE(인프라)** | - | - | - | - | - | - | - | 제외 |

## 5. Gap Matrix

| 원본 항목 | 판정 | 기존 엔진 | 5feeb7b | OSS | 누락 | 구현 필요 | 검증 필요 | V1 우선순위 |
|---|---|---|---|---|---|---|---|---|
| 사주 4주(M-01) | ADOPT | ✓ | via | lunar-javascript/KASI | — | — | 경계정책 | 완료 |
| 입춘 년경계(M-02) | REFERENCE | 프로필 LUNAR_YEAR | year-label | lunar-javascript | 정책확정 | — | **✓✓✓** | P0-risk |
| 오행분포(M-03) | ADOPT | ✓ | — | — | — | — | — | 완료 |
| 음양(M-04) | ADOPT | ✓ | 사용 | — | — | — | — | 완료 |
| 십신(M-05) | ADOPT | ✓ | 재사용 | lunar-javascript | — | — | — | 완료 |
| 지장간십신(M-06) | ADOPT | ✓ | ✓ | — | — | — | — | 완료 |
| 지장간(M-08) | ADOPT | ✓ | 사용 | — | — | — | — | 완료 |
| **대운십신(M-07)** | ADOPT | 규칙有 | 미노출 | — | 노출 | **소** | 경 | **P1** |
| **통근/투간(M-09)** | ADOPT | ✗ | ✗ | — | 전체 | **소** | 중 | **P1** |
| 형충파해합삼합(M-10) | ADOPT | ✓(myungri) | ✓ | 자체 | — | — | 원본대조✔ | 완료 |
| **월령/득령(M-11)** | ADOPT | 부분 | 부분 | 절기 | 명시fact | **소** | 경 | **P1** |
| 24절기(M-12) | ADOPT | ✓ | — | lunar-javascript | — | — | — | 완료 |
| 양음력(M-13) | ADOPT | ✓ | — | KASI | — | — | — | 완료 |
| 대운(M-14) | ADOPT | ✓ | 소비 | lunar-javascript | — | — | 대운수법 | 완료 |
| 세운(M-15) | ADOPT | — | ✓ | 자체 | — | — | golden✔ | 완료 |
| 월운(M-16) | ADOPT | — | ✓ | 자체 | — | — | 五虎遁✔ | 완료 |
| 시간축관계(M-17) | ADOPT | — | ✓ | 자체 | — | — | ✔ | 완료 |
| **강약(M-18)** | CONDITIONAL | ✗ | ✗ | 자체(입력) | 판정無/입력만 | 중 | **✓✓** | P2 |
| 격국(M-19) | REFERENCE | ✗ | ✗ | — | (제외) | — | 학파 | P3 |
| 용신/조후(M-20) | REFERENCE | ✗ | ✗ | — | (제외) | — | 학파 | P3 |
| **12운성(M-21)** | CONDITIONAL | ✗ | ✗ | 자체 | 표 | 소 | **✓(음포태)** | P2 |
| **12신살(M-22)** | CONDITIONAL | ✗ | ✗ | 자체 | 표 | 소 | **✓(기준지)** | P2 |
| 신살성요128(M-23) | EXCLUDE | ✗ | ✗ | — | (제외) | — | — | 제외 |
| 해석corpus(M-24) | REFERENCE | ✗ | ✗ | — | LLM참고 | — | — | P3 |
| 궁합기반(M-25) | CONDITIONAL | 부분 | 부분 | 자체 | 조합 | 중 | 중 | P2 |
| 작명(M-26)/관상(M-27)/로또(M-28) | EXCLUDE | ✗ | ✗ | — | (제외) | — | — | 제외 |
| 만세력 legacy(M-29) | REFERENCE | ✓대체 | — | — | (대체됨) | — | 교차검증 | 제외 |

## 6. 결정론적 명리 V1 커버리지

- **정의:** "방어 가능한 결정론적 명리 fact scope" = ADOPT 15항목 (격국/용신/신살성요 등 해석·학파 항목은 scope 밖, 커버리지 갭으로 세지 않음).
- **현재(`5feeb7b`+프로즌 엔진) 구현:** 15개 중 **12개** (M-03·04·05·06·08·10·12·13·14·15·16·17).
- **현재 커버리지 ≈ 12/15 = 80%.**
- **ADOPT 소갭 3개(M-07 대운십신·M-09 통근투간·M-11 월령/득령) 반영 시 → 15/15 = 100%** (ADOPT scope).
- **CONDITIONAL 3개(12운성·12신살·강약-입력)까지 characterization-lock으로 추가 시** → 결정론적 grounding scope의 사실상 전량. 격국/용신/신살성요는 **의도적 제외**(coverage 대상 아님).

## 7. 추가 구현 예상 작업량 (참고 — 이번 단계 구현 아님)

| 항목 | 작업 | 규모 |
|---|---|---|
| M-07 대운십신 노출 | 대운 각 주에 `calculateTenGod` 적용 | ~1–2h |
| M-09 통근/투간 | 일간 오행의 지지 지장간 뿌리 판정(결정론) | ~0.5d |
| M-11 월령/득령 | 월지→왕상휴수사(결정론 표) fact | ~0.5d |
| M-18 강약 입력세트 | 오행분포+통근+월령을 **중립 evidence**로 노출(판정값 無) | ~0.5–1d |
| M-21 12운성 | 10간×12지 포태표(음포태 관례 lock+flag) | ~0.5d |
| M-22 12신살 | 삼합 기준 12신살 표(기준지 정책 flag) | ~0.5d |
| **합계** | 전부 순수 로직+테스트, 5feeb7b 패턴 재사용 | **≈3–5 dev-day** |

## 8. Codex가 반드시 독립 검증해야 할 위험 항목

1. **⚠️ 년/월주 경계 관례 (M-02) — 최우선.** 원본 ZIP은 고전 관례(년주=立春 절입, 월주=節氣) 사용. 프로즌 엔진 rule-profile은 `LUNAR_YEAR`/`monthPillarRule=LUNAR_MONTH`/`solarTermRole=NOT_USED`로 선언 — 그러나 기존 Ziwei 검증 문서는 "사주는 節-month 干支 사용"이라 기술(상충 신호). **executeSaju가 실제로 적용하는 경계를 Codex가 추적·확정해야 함.** 내 세운/월운은 이 프로즌 함수를 재사용하므로 관례를 그대로 상속 → 경계가 바뀌면 시간축도 자동 반영. 이 불일치는 立春~설날/節~음력초1일 구간 출생자의 4주에 실제 영향.
2. **강약(M-18).** 원저자 스스로 "연구 필요" 명시 + 학파별 가중치. **`身强/身弱` 판정값을 fact로 출력 금지**, 결정론적 입력(월령·통근·오행분포)만 중립 노출.
3. **12운성(M-21) 음포태 vs 양포태.** 원본은 음간 역행(乙 장생@午) = 음포태 관례. 채택 시 관례 고정+flag.
4. **12신살(M-22) 일지기준 vs 년지기준.** 원본 주석이 둘을 구분(집안일/바깥일). 정책 택1·문서화.
5. **신살 성요 128(M-23).** 자미두수 성요 혼입 확인 → EXCLUDE 유지 근거.
6. **격국/용신(M-19/20).** 결정론적 fact 아님 → REFERENCE_ONLY 유지, LLM 해석 계층에서만 사용.

## 9. 원본↔5feeb7b 교차검증 결과 (관계 계층)

`solve/hyungchung.php` 대 `deokbunai.myungri-pillar-relations.v1`:

| 관계 | 원본 ZIP | 5feeb7b V1 | 일치 |
|---|---|---|---|
| 천간합 | 甲己乙庚丙辛丁壬戊癸 | 동일 | ✅ |
| 삼합 | 亥卯未·寅午戌·申子辰·巳酉丑 | 동일 | ✅ |
| 삼형/상형/자형 | 寅巳申·丑戌未·子卯·辰午酉亥 | 동일 | ✅ |
| 육충 | 子午·丑未·寅申·卯酉·辰戌·巳亥 | 동일 | ✅ |
| 육파 | 子酉·丑辰·寅亥·卯午·未戌·巳申 | 동일 | ✅ |
| 육해 | 子未·丑午·寅巳·卯辰·申亥·酉戌 | 동일 | ✅ |
| 육합·방합·반합 | (원본 미산출) | V1 추가 보유 | V1 상위집합 |

→ 내 V1 관계 표는 원본 상용 데이터와 **규칙 내용 완전 일치**하며 더 완전함. 관계 계층은 안심하고 freeze 가능.

---
**본 문서는 판정/분석 산출물이며 구현·커밋을 포함하지 않는다. STOP.**

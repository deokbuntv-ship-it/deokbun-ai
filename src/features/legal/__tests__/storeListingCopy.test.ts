// 스토어 문구 계약 (2026-09-13). 콘솔에 붙여 넣기 전에 잡아야 하는 것 네 가지:
//   ① 칸 길이 — 애플 키워드는 **바이트**(한글 3바이트)  ② 사실이 아닌 주장(PRODUCT_TRUTH_GUARD) · 확신·순위 표현
//   ③ 가격·덕 수량이 코드와 같은가  ④ 문서(docs/STORE_LISTING_COPY_2026-09-13.md)와 글자까지 같은가
// 검사 로직 자체는 **지어낸 나쁜 문구**로 먼저 검증한다(맨 아래) — 통과가 공허하지 않게.
import * as fs from 'fs';
import * as path from 'path';

import { containsCompatibilityHarm, containsForbiddenCertainty, containsWinnerClaim } from '@/features/chat/server/certaintyGuard';
import { GOOGLE_STORE_PRODUCT_ID } from '@/features/duk/iap/purchaseUiText';
import { CANDLE_DUK, DUK_PRICES, TOPUP_PACKS, WELCOME_DUK } from '@/features/duk/pricing';
import { TERMS_OF_SERVICE } from '@/features/legal/legalContent';
import {
  APP_REVIEW_NOTES,
  APP_STORE_LISTING,
  IAP_PRODUCTS,
  PLAY_LISTING,
  STORE_VARIANTS,
  type StoreField,
  type StoreVariant,
} from '@/features/legal/storeListingCopy';

const ROOT = path.resolve(__dirname, '../../../..');
const DOC = fs.readFileSync(path.join(ROOT, 'docs/STORE_LISTING_COPY_2026-09-13.md'), 'utf8');
const chars = (s: string) => [...s].length;
const bytes = (s: string) => Buffer.byteLength(s, 'utf8');

// PRODUCT_TRUTH_GUARD §2 의 금지 주장 + 스토어 정책의 홍보·순위 표현 (한국어 문구용)
const TRUTH_GUARD_KO: Array<[string, RegExp]> = [
  ['교차검증·합의 주장', /교차\s*검증|만장일치|모두\s*일치|세\s*(학문|시스템|관점|계산)이\s*(모두|같은)/],
  ['최적 시기·순위 주장', /가장\s*좋은\s*(시기|때|해|달)|1\s*순위|최고의\s*(시기|때)/],
  ['AI 가 계산한다는 주장', /AI\s*가\s*(사주|명식|만세력)[을를]?\s*(계산|세웁|뽑)/],
  ['건강·수명 예측 주장', /(질병|수명|사망)[을를이가]?\s*(예측|알려|맞)/],
  ['돈 보장 주장', /(수익|성공|합격)[을를이가]?\s*(보장|약속)/],
  ['정확도·순위 홍보', /정확도|\d+\s*%|1위|#1|최고의?\s*앱|국내\s*최초/],
  ['단정 표현', /반드시|무조건|틀림없이|확실히/],
  ['가격 홍보(무료)', /무료/],
];
const TRUTH_GUARD_EN: Array<[string, RegExp]> = [
  ['consensus claim', /consensus|cross-?validat|unanim|all three (agree|confirm)/i],
  ['accuracy/rank claim', /most accurate|\d+\s*% accura|#1|number one|best app/i],
  ['guarantee claim', /we guarantee|guaranteed to|will (definitely|certainly)/i],
];
const violationsKo = (text: string): string[] => [
  ...TRUTH_GUARD_KO.filter(([, re]) => re.test(text)).map(([name]) => name),
  ...(containsForbiddenCertainty(text) ? ['확신 검사기(containsForbiddenCertainty)'] : []),
  ...(containsWinnerClaim(text) ? ['순위 검사기(containsWinnerClaim)'] : []),
  ...(containsCompatibilityHarm(text) ? ['궁합 해악 검사기(containsCompatibilityHarm)'] : []),
];
const violationsEn = (text: string): string[] => TRUTH_GUARD_EN.filter(([, re]) => re.test(text)).map(([name]) => name);

const FIELDS: Array<[string, StoreField]> = [
  ...Object.entries(PLAY_LISTING).map(([k, f]) => [`Play.${k}`, f] as [string, StoreField]),
  ...Object.entries(APP_STORE_LISTING).map(([k, f]) => [`AppStore.${k}`, f] as [string, StoreField]),
];
const IAP_TEXTS = IAP_PRODUCTS.flatMap((p) => [p.play.title, p.play.description, p.appStore.displayName, p.appStore.description]);

describe('① 칸 길이', () => {
  it.each(FIELDS)('%s — 한도 안', (_name, f) => {
    const used = f.unit === 'byte' ? bytes(f.text) : chars(f.text);
    expect(used).toBeLessThanOrEqual(f.max);
    expect(chars(f.text)).toBeGreaterThan(0);
  });

  it('⚠ 애플 키워드 — 100바이트 · 쉼표 사이 공백 없음 · 낱말마다 두 글자 초과 · 앱 이름 안 넣음', () => {
    const k = APP_STORE_LISTING.keywords.text;
    expect(bytes(k)).toBeLessThanOrEqual(100);
    expect(k).not.toMatch(/\s/);
    for (const word of k.split(',')) expect(chars(word)).toBeGreaterThan(2);
    expect(k).not.toContain('덕분이');
  });

  it('인앱 상품 — 구글 제목 55 · 설명 200 / 애플 표시 이름 2~30 · 설명 45', () => {
    for (const p of IAP_PRODUCTS) {
      expect(chars(p.play.title)).toBeLessThanOrEqual(55);
      expect(chars(p.play.description)).toBeLessThanOrEqual(200);
      expect(chars(p.appStore.displayName)).toBeGreaterThanOrEqual(2);
      expect(chars(p.appStore.displayName)).toBeLessThanOrEqual(30);
      expect(chars(p.appStore.description)).toBeLessThanOrEqual(45);
    }
  });

  it('심사 노트 — 4000자 안', () => {
    expect(chars(APP_REVIEW_NOTES)).toBeLessThanOrEqual(4000);
  });
});

describe('② 사실이 아닌 주장이 없다', () => {
  // 줄마다 따로 잰다 — 걸리면 **어느 줄이 어느 규칙에** 걸렸는지가 실패 메시지에 그대로 나온다.
  it.each(FIELDS)('%s — 금지 주장 0', (_name, f) => {
    const hits = f.text.split('\n').map((line) => ({ line, rules: violationsKo(line) })).filter((h) => h.rules.length > 0);
    expect(hits).toEqual([]);
    expect(violationsKo(f.text)).toEqual([]);
  });

  it('인앱 상품 문구 — 금지 주장 0', () => {
    for (const t of IAP_TEXTS) expect(violationsKo(t)).toEqual([]);
  });

  it('심사 노트(영어) — 금지 주장 0', () => {
    expect(violationsEn(APP_REVIEW_NOTES)).toEqual([]);
  });

  it('⚠ 소비자 답변에 없는 "근거 표" 를 약속하지 않는다 (2026-09-10 초안 2번의 오류)', () => {
    const all = [...FIELDS.map(([, f]) => f.text), APP_REVIEW_NOTES].join('\n');
    expect(all).not.toMatch(/천간|지지|십성|근거\s*표|evidence table|shows? (the )?(chart )?evidence/i);
  });

  it('계산은 엔진, 풀이는 AI — 이 한 가지는 반드시 말한다 (PRODUCT_TRUTH_GUARD SAFE 주장)', () => {
    expect(PLAY_LISTING.fullDescription.text).toContain('AI는 명식을 계산하지 않아요');
    expect(APP_REVIEW_NOTES).toContain('The language model never computes a chart');
  });
});

describe('③ 가격·덕 수량이 코드와 같다', () => {
  const d = PLAY_LISTING.fullDescription.text;

  it('상품 가격 — 상담 · 궁합 · 프리미엄 리포트', () => {
    expect(d).toContain(`(${DUK_PRICES.general}덕)`);
    expect(d).toContain(`(${DUK_PRICES.compatibility}덕)`);
    expect(d).toContain(`(${DUK_PRICES.premium_report}덕)`);
  });

  it('가입 선물 · 촛불', () => {
    expect(d).toContain(`${WELCOME_DUK}덕을 드려요`);
    expect(d).toContain(`${CANDLE_DUK}덕이 쌓여요`);
  });

  it('충전 묶음 — 이름 · 덕 수 · 첫 충전 한 번만', () => {
    for (const pack of TOPUP_PACKS) {
      expect(d).toContain(`${pack.label} ${pack.duk}덕${pack.firstOnly ? '(한 번만)' : ''}`);
    }
  });

  it('인앱 상품 키와 덕 수가 앱의 TOPUP_PACKS 와 같다', () => {
    expect(IAP_PRODUCTS.map((p) => [p.key, p.duk])).toEqual(TOPUP_PACKS.map((p) => [p.internalKey, p.duk]));
    for (const p of IAP_PRODUCTS) {
      const pack = TOPUP_PACKS.find((t) => t.internalKey === p.key);
      expect(p.play.title).toBe(`${pack?.label} ${p.duk}덕`);
      expect(p.appStore.displayName).toBe(`${pack?.label} ${p.duk}덕`);
    }
  });

  it('상담 세션 — 24시간 · 질문 5번 (서버 기본값 · 약관과 같다)', () => {
    expect(d).toContain('24시간 동안 질문 5번까지');
    const sessions = fs.readFileSync(path.join(ROOT, 'supabase/migrations/20260832000000_duk_economy_runtime.sql'), 'utf8');
    expect(sessions).toMatch(/turn_limit\s+integer not null default 5/);
    const terms = TERMS_OF_SERVICE.sections.flatMap((s) => s.paragraphs ?? []).join('\n');
    expect(terms).toContain('최대 5회 질문·24시간');
  });
});

describe('④ 문서와 글자까지 같다 (오너가 문서에서 복사한다)', () => {
  it.each([
    ...FIELDS.map(([name, f]) => [name, f.text] as [string, string]),
    ...IAP_TEXTS.map((t, i) => [`IAP#${i}`, t] as [string, string]),
    ['APP_REVIEW_NOTES', APP_REVIEW_NOTES] as [string, string],
  ])('%s', (_name, text) => {
    expect(DOC.replace(/\r\n/g, '\n')).toContain(text);
  });
});

describe('검사 로직 자체의 합성 반례 — 나쁜 문구는 반드시 잡힌다', () => {
  it.each([
    ['세 학문이 모두 일치하는 사주 풀이', '교차검증·합의 주장'],
    ['올해 가장 좋은 시기를 알려드립니다', '최적 시기·순위 주장'],
    ['AI가 사주를 계산해 드려요', 'AI 가 계산한다는 주장'],
    ['수명을 예측해 드립니다', '건강·수명 예측 주장'],
    ['투자 수익을 보장합니다', '돈 보장 주장'],
    ['정확도 99% 운세 앱', '정확도·순위 홍보'],
    ['국내 1위 운세', '정확도·순위 홍보'],
    ['3개월 안에 반드시 성공합니다', '단정 표현'],
    ['지금 무료로 받아 보세요', '가격 홍보(무료)'],
  ])('"%s" → %s', (bad, expected) => {
    expect(violationsKo(bad)).toContain(expected);
  });

  it('답변 검사기도 같은 나쁜 문구를 잡는다 (확신 · 순위)', () => {
    expect(containsForbiddenCertainty('3개월 안에 반드시 성공합니다')).toBe(true);
    expect(containsWinnerClaim('올해 가장 좋은 시기는 5월이에요')).toBe(true);
  });

  it.each([
    ['All three systems reached a consensus', 'consensus claim'],
    ['The most accurate saju app', 'accuracy/rank claim'],
    ['We guarantee your success', 'guarantee claim'],
  ])('(EN) "%s" → %s', (bad, expected) => {
    expect(violationsEn(bad)).toContain(expected);
  });
});

// ════ 세 안 (2026-09-14) — 모든 안에 같은 검사 ═══════════════════════════════════════════════════
// 정본(1안)만의 검사(정확한 가격 문장 · 정본 문서 대조)는 위에 그대로 있다. 아래는 세 안 모두에 똑같이 건다:
// ① 칸 길이 · 애플 키워드 100바이트 ② 금지 표현 ③ 모든 "N덕" 이 코드 값과 짝 ④ 레포에 근거가 있는 기능만 ·
// 없는 기능 언급 0 ⑤ 타사 이름 0 ⑥ 비교표 문서(docs/STORE_LISTING_VARIANTS_2026-09-14.md)와 글자까지 같음.
const VARIANTS_DOC = fs.readFileSync(path.join(ROOT, 'docs/STORE_LISTING_VARIANTS_2026-09-14.md'), 'utf8').replace(/\r\n/g, '\n');
const variantFields = (v: StoreVariant): Array<[string, StoreField]> => [
  ...Object.entries(v.play).map(([k, f]) => [`Play.${k}`, f] as [string, StoreField]),
  ...Object.entries(v.appStore).map(([k, f]) => [`AppStore.${k}`, f] as [string, StoreField]),
];
const variantText = (v: StoreVariant) => variantFields(v).map(([, f]) => f.text).join('\n');

// 타사 이름 — 다른 앱 · 회사 · AI 모델. 공개 문구(목록 칸 · 인앱 상품)에 건다. 심사 노트는 심사관에게 AI 제공자를
// 밝히는 글이라 뺀다(애플 5.1.2(i) — "OpenAI" 가 들어간다).
const THIRD_PARTY = /OpenAI|오픈\s*AI|ChatGPT|챗\s*GPT|GPT|Claude|클로드|Gemini|제미나이|Google|구글|Apple|애플|Kakao|카카오|Naver|네이버|점신|포스텔러|헬로우봇|천을귀인|운세의\s*신/i;
// 덕분이에 없는 기능 — 스토어가 약속하면 안 된다 ("부적절한" 의 "부적" 은 빼고 잡는다 — 정본 문구로 실측한 오탐)
const NOT_OUR_FEATURES = /타로|별자리|관상|손금|꿈\s*해몽|작명|부적(?!절)|토정비결|띠별|전문가|상담사|역술인|철학관|실시간|무제한|평생|음성|영상\s*통화|커뮤니티|푸시|구독|멤버십|PLUS|플러스/;
// 있는 기능 — 문구에 나오면 레포에 근거가 있어야 한다(그 파일에 그 글자가 있다). 근거가 사라지면 여기서 먼저 깨진다.
type Feature = { name: string; term: RegExp; file: string; needle: string };
const FEATURES: Feature[] = [
  { name: '1:1 상담', term: /1:1\s*(명리\s*)?상담/, file: 'src/app/chat.tsx', needle: 'executeConversationBoundSend' },
  { name: '궁합', term: /궁합/, file: 'src/app/(tabs)/compatibility.tsx', needle: '궁합 시작' },
  { name: '프리미엄 리포트', term: /프리미엄\s*리포트/, file: 'src/app/premium.tsx', needle: '앞으로 열두 달' },
  { name: '오늘의 운세', term: /오늘의\s*운세/, file: 'src/app/(tabs)/index.tsx', needle: '오늘의 운세' },
  { name: '이번 달 운세', term: /이번\s*달\s*운세/, file: 'src/app/(tabs)/index.tsx', needle: '이번 달 운세' },
  { name: '운세우편함', term: /운세우편함/, file: 'src/app/(tabs)/inbox.tsx', needle: '운세우편함' },
  { name: '만세력', term: /만세력/, file: 'src/app/subject-manse.tsx', needle: 'MansePillarsGrid' },
  { name: '자미두수', term: /자미두수/, file: 'src/features/chat/server/buildServerConsultation.ts', needle: 'ziwei:' },
  { name: '기문둔갑', term: /기문둔갑/, file: 'src/features/chat/server/buildServerConsultation.ts', needle: 'qimen:' },
  { name: '가입 선물', term: /가입/, file: 'src/features/duk/pricing.ts', needle: 'WELCOME_DUK' },
  { name: '촛불', term: /촛불/, file: 'src/features/duk/pricing.ts', needle: 'CANDLE_DUK' },
  { name: '충전', term: /충전/, file: 'src/features/duk/pricing.ts', needle: 'TOPUP_PACKS' },
  { name: '쓰기 전 가격 표시', term: /쓰기\s*전에/, file: 'src/components/PriceConfirmSheet/PriceConfirmSheet.tsx', needle: '이 남아요' },
  { name: 'AI 표시', term: /AI\s*표시|AI가\s*만든\s*해석/, file: 'src/components/AiDisclosure.tsx', needle: 'export function AiDisclosure' },
  { name: 'AI 처리 동의', term: /동의/, file: 'src/features/legal/components/AiConsentSheet.tsx', needle: 'export function AiConsentSheet' },
  { name: '동의 철회', term: /철회/, file: 'src/features/legal/components/AiConsentSetting.tsx', needle: '동의 철회' },
  { name: '답변 신고', term: /신고/, file: 'src/features/intelligence/aiContentReport.ts', needle: '이 답변 신고하기' },
  { name: '상담 기록 삭제', term: /상담\s*기록/, file: 'src/app/subject-history.tsx', needle: '상담 삭제' },
  { name: '보고서 삭제', term: /보고서[^.\n]{0,12}(지울|삭제)/, file: 'src/app/report/[id].tsx', needle: '보고서 삭제' },
  { name: '앱 안 탈퇴', term: /탈퇴/, file: 'src/app/account-delete.tsx', needle: '탈퇴' },
  { name: '건강·수명 질문 거절', term: /건강|수명/, file: 'src/features/chat/server/consultationSafety.ts', needle: 'DEATH_LIFESPAN' },
  { name: '참고용 정보', term: /참고용/, file: 'src/features/legal/legalContent.ts', needle: '제공되는 내용은 참고' },
  { name: '계산은 엔진, 풀이는 AI', term: /AI는 명식을 계산하지 않/, file: 'docs/PRODUCT_TRUTH_GUARD.md', needle: '계산은 결정론적 엔진, 해석은 AI' },
];
const evidenceMissing = (text: string, features: Feature[] = FEATURES): string[] =>
  features
    .filter((f) => f.term.test(text))
    .filter((f) => {
      const p = path.join(ROOT, f.file);
      return !fs.existsSync(p) || !fs.readFileSync(p, 'utf8').includes(f.needle);
    })
    .map((f) => f.name);

// 가격 — "N덕" 은 같은 줄에서 바로 앞에 나온 상품 낱말과 짝이 맞아야 한다. 짝 없는 숫자도 실패.
const PRICE_ANCHORS: Array<[string, number]> = [
  ['상담', DUK_PRICES.general],
  ['궁합', DUK_PRICES.compatibility],
  ['프리미엄', DUK_PRICES.premium_report],
  ['가입', WELCOME_DUK],
  ['촛불', CANDLE_DUK],
  ...TOPUP_PACKS.map((p) => [p.label, p.duk] as [string, number]),
];
const priceMismatches = (text: string): string[] => {
  const bad: string[] = [];
  for (const line of text.split('\n')) {
    for (const m of line.matchAll(/(\d+)\s*덕/g)) {
      const before = line.slice(0, m.index);
      const anchor = PRICE_ANCHORS.map(([word, duk]) => ({ word, duk, at: before.lastIndexOf(word) }))
        .filter((a) => a.at >= 0)
        .sort((a, b) => b.at - a.at)[0];
      if (!anchor || anchor.duk !== Number(m[1])) bad.push(`${m[0]} ← ${anchor?.word ?? '짝 없음'} · ${line.trim()}`);
    }
  }
  return bad;
};
// 세션 — "N시간 동안 질문 M번" 은 서버 기본값(24시간 · 5번, 위 ③ 에서 마이그레이션 · 약관과 대조)과 같아야 한다
const sessionMismatches = (text: string): string[] =>
  [...text.matchAll(/(\d+)\s*시간\s*동안\s*질문\s*(\d+)\s*번/g)].filter((m) => m[1] !== '24' || m[2] !== '5').map((m) => m[0]);

describe.each(STORE_VARIANTS.map((v) => [`${v.name} ${v.tone}`, v] as [string, StoreVariant]))('세 안 공통 — %s', (_label, v) => {
  it.each(variantFields(v))('① 칸 길이 — %s', (_name, f) => {
    const used = f.unit === 'byte' ? bytes(f.text) : chars(f.text);
    expect(used).toBeLessThanOrEqual(f.max);
    expect(chars(f.text)).toBeGreaterThan(0);
  });

  it('① 애플 키워드 — 100바이트 · 공백 없음 · 낱말마다 두 글자 초과 · 앱 이름 없음', () => {
    const k = v.appStore.keywords.text;
    expect(bytes(k)).toBeLessThanOrEqual(100);
    expect(k).not.toMatch(/\s/);
    for (const word of k.split(',')) expect(chars(word)).toBeGreaterThan(2);
    expect(k).not.toContain('덕분이');
  });

  it.each(variantFields(v))('② 금지 표현 0 — %s', (_name, f) => {
    const hits = f.text.split('\n').map((line) => ({ line, rules: violationsKo(line) })).filter((h) => h.rules.length > 0);
    expect(hits).toEqual([]);
  });

  it('② 근거 표를 약속하지 않는다 · AI 는 명식을 계산하지 않는다고 말한다', () => {
    expect(variantText(v)).not.toMatch(/천간|지지|십성|근거\s*표/);
    expect(v.play.fullDescription.text).toContain('AI는 명식을 계산하지 않아요');
  });

  it('③ 가격 — 모든 "N덕" 이 코드 값과 짝이 맞다 · 세션 24시간 · 질문 5번', () => {
    expect(priceMismatches(variantText(v))).toEqual([]);
    expect(sessionMismatches(variantText(v))).toEqual([]);
  });

  it('④ 레포에 근거가 있는 기능만 — 근거 없는 기능 0 · 없는 기능 언급 0', () => {
    expect(evidenceMissing(variantText(v))).toEqual([]);
    expect(variantText(v)).not.toMatch(NOT_OUR_FEATURES);
  });

  it('⑤ 타사 이름 0', () => {
    expect(variantText(v)).not.toMatch(THIRD_PARTY);
  });

  it.each(variantFields(v))('⑥ 비교표 문서와 글자까지 같다 — %s', (_name, f) => {
    expect(VARIANTS_DOC).toContain(f.text);
  });
});

it('Play Console 첫 업로드 한 장의 인앱 상품 값이 원본과 같다 (상품 ID · 이름 · 설명 · 가격 · 지급)', () => {
  const playDoc = fs.readFileSync(path.join(ROOT, 'docs/PLAY_CONSOLE_FIRST_UPLOAD_2026-09-14.md'), 'utf8');
  for (const p of IAP_PRODUCTS) {
    const pack = TOPUP_PACKS.find((t) => t.internalKey === p.key);
    const row = playDoc.split('\n').find((l) => l.includes(`\`${GOOGLE_STORE_PRODUCT_ID[p.key]}\``)) ?? '';
    expect(row).toContain(p.play.title);
    expect(row).toContain(p.play.description);
    expect(row).toContain(`₩${pack?.priceKrwHint.toLocaleString('en-US')}`);
    expect(row).toContain(`\`${p.key}\` · ${p.duk}`);
  }
});

it('세 안 공통 — 인앱 상품 문구에도 타사 이름 · 없는 기능 0', () => {
  for (const t of IAP_TEXTS) {
    expect(t).not.toMatch(THIRD_PARTY);
    expect(t).not.toMatch(NOT_OUR_FEATURES);
  }
});

describe('세 안 검사 로직의 합성 반례 — 나쁜 문구는 반드시 잡힌다', () => {
  it.each(['ChatGPT 로 보는 사주', '점신보다 자세한 풀이', '구글 로그인으로 바로 시작'])('타사 이름: "%s"', (bad) => {
    expect(bad).toMatch(THIRD_PARTY);
  });
  it.each(['타로도 함께 볼 수 있어요', '전문가가 직접 상담해요', '무제한으로 물어보세요', '실시간 상담', '행운의 부적을 드려요'])('없는 기능: "%s"', (bad) => {
    expect(bad).toMatch(NOT_OUR_FEATURES);
  });
  it('없는 기능 — "부적절한" 은 부적이 아니다 (오탐 방지)', () => {
    expect('부적절한 AI 답변은 답변마다 바로 신고할 수 있어요.').not.toMatch(NOT_OUR_FEATURES);
  });
  it('가격 짝 — 틀린 값 · 짝 없는 숫자는 잡히고, 맞는 값은 지난다', () => {
    expect(priceMismatches('· 1:1 상담 (7덕)')).toHaveLength(1);
    expect(priceMismatches('· 한 번에 5덕')).toHaveLength(1);
    expect(priceMismatches('· 첫 충전 50덕')).toHaveLength(1);
    expect(priceMismatches('· 1:1 상담 (5덕) · 궁합 (12덕) · 기본 50덕')).toEqual([]);
  });
  it('세션 — 서버 값과 다르면 잡힌다', () => {
    expect(sessionMismatches('12시간 동안 질문 3번까지')).toHaveLength(1);
    expect(sessionMismatches('24시간 동안 질문 5번까지')).toEqual([]);
  });
  it('근거 — 파일에 그 글자가 없거나 파일이 없으면 잡힌다', () => {
    expect(evidenceMissing('궁합', [{ name: '가짜 근거', term: /궁합/, file: 'src/features/duk/pricing.ts', needle: '없는_글자_9f3a' }])).toEqual(['가짜 근거']);
    expect(evidenceMissing('궁합', [{ name: '없는 파일', term: /궁합/, file: 'src/없는_파일.ts', needle: 'x' }])).toEqual(['없는 파일']);
  });
});

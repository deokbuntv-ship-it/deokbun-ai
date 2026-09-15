// 스토어 문구 (2026-09-13) — Google Play 스토어 등록정보 · App Store 제품 페이지 · 인앱 상품 이름 · 심사 노트.
//
// ⚠ 앱 런타임은 이 파일을 쓰지 않는다. 오너가 콘솔에 붙여 넣는 **원본**이고, 계약 테스트
//   (`__tests__/storeListingCopy.test.ts`)가 ① 칸 길이(애플 키워드는 **바이트**) ② PRODUCT_TRUTH_GUARD 와
//   답변에 쓰는 확신·순위 검사기 ③ 가격·덕 수량이 코드 값과 같은지 ④ `docs/STORE_LISTING_COPY_2026-09-13.md` 와
//   글자까지 같은지를 잡는다.
//
// 문장마다 코드로 확인한 사실만 쓴다. 특히 **쓰지 않은 것**:
//   · "답변에 근거(천간·지지·십성)를 표로 보여 준다" — 사실이 아니다. 소비자 답변에는 근거 표가 없다
//     (StructuredConsultationResult 주석: 근거 시트는 내부·관리자 화면). 2026-09-10 심사 노트 초안의 2번이 틀렸다.
//   · 세 계산의 "일치·교차검증" · "가장 좋은 시기" · 확정·보장 표현 — PRODUCT_TRUTH_GUARD 금지.
//   · "무료" — 구글 메타데이터 정책이 제목의 가격·홍보 표현을 막는다. 본문도 "덕 없이" 로 쓴다.

export type StoreField = { label: string; max: number; unit: 'char' | 'byte'; text: string };

const DESCRIPTION = [
  '덕분이는 생년월일시로 명식을 먼저 계산하고, 그 계산 결과를 근거로 AI가 풀어서 설명해 드리는 명리 상담 앱이에요.',
  '',
  '■ 계산이 먼저, 풀이는 그다음',
  '· 사주(명리)를 중심으로, 태어난 시각과 질문에 따라 자미두수·기문둔갑 계산도 함께 참고해요.',
  '· AI는 명식을 계산하지 않아요. 이미 계산된 결과를 받아 읽기 쉬운 말로 풀어 드릴 뿐이에요.',
  '· 등록한 사람마다 만세력(사주 여덟 글자와 대운)을 직접 볼 수 있어요.',
  '',
  '■ 할 수 있는 것',
  '· 1:1 명리 상담 — 한 번 시작하면 24시간 동안 질문 5번까지 이어서 물어볼 수 있어요. (5덕)',
  '· 궁합 — 두 사람의 명식을 나란히 놓고 정서·갈등·오행 보완을 살펴봐요. (12덕)',
  '· 프리미엄 리포트 — 타고난 명식과 앞으로 열두 달의 흐름을 한 번에 정리해요. (50덕)',
  '· 오늘의 운세 · 이번 달 운세 — 덕 없이 받아 보실 수 있어요.',
  '· 운세우편함 — 받은 운세와 보고서를 모아 두고 다시 볼 수 있어요.',
  '',
  '■ 덕 (앱 안에서 쓰는 단위)',
  '· 처음 가입하시면 10덕을 드려요. 하루 한 번 촛불을 켜면 1덕이 쌓여요.',
  '· 덕을 쓰기 전에, 필요한 덕과 쓰고 나서 남는 덕을 먼저 보여 드려요.',
  '· 충전은 첫 충전 20덕(한 번만) · 기본 50덕 · 넉넉 120덕 세 가지예요.',
  '',
  '■ 안심하고 쓰실 수 있게',
  '· AI가 만든 해석이라는 것을 해석 화면마다 표시해요.',
  '· 생년월일시와 상담 내용을 AI로 처리하기 전에 따로 동의를 받아요. 동의는 언제든 철회할 수 있어요.',
  '· 부적절한 AI 답변은 답변마다 바로 신고할 수 있어요.',
  '· 상담 기록과 보고서는 하나씩 직접 지울 수 있고, 계정 탈퇴도 앱 안에서 바로 할 수 있어요.',
  '',
  '■ 참고해 주세요',
  '· 덕분이의 해석은 참고용 정보예요. 의료·법률·투자 같은 전문적인 판단을 대신하지 않아요.',
  '· 건강·수명처럼 명리로 답하지 않는 질문에는 답하지 않아요.',
].join('\n');

const RELEASE_NOTES = [
  '첫 출시 버전이에요.',
  '· 명식 계산을 근거로 풀어 주는 1:1 상담 · 궁합 · 프리미엄 리포트',
  '· 오늘의 운세 · 이번 달 운세',
  '· 상담 기록과 보고서를 하나씩 직접 지울 수 있어요',
].join('\n');

export const PLAY_LISTING = {
  appName: { label: '앱 이름', max: 30, unit: 'char', text: '덕분이' },
  shortDescription: {
    label: '간단한 설명', max: 80, unit: 'char',
    text: '생년월일시로 명식을 먼저 계산하고, 그 결과를 근거로 풀어 주는 AI 명리 상담',
  },
  fullDescription: { label: '자세한 설명', max: 4000, unit: 'char', text: DESCRIPTION },
  releaseNotes: { label: '출시 노트', max: 500, unit: 'char', text: RELEASE_NOTES },
} satisfies Record<string, StoreField>;

export const APP_STORE_LISTING = {
  appName: { label: '이름', max: 30, unit: 'char', text: '덕분이' },
  subtitle: { label: '부제', max: 30, unit: 'char', text: '명식 계산을 근거로 풀어 주는 AI 상담' },
  promotionalText: {
    label: '프로모션 텍스트', max: 170, unit: 'char',
    text: '생년월일시로 명식을 먼저 계산하고, 그 결과를 근거로 AI가 풀어 드려요. 쓰기 전에 필요한 덕을 먼저 보여 드리고, 상담 기록과 보고서는 언제든 직접 지울 수 있어요.',
  },
  description: { label: '설명', max: 4000, unit: 'char', text: DESCRIPTION },
  // ⚠ 애플 키워드는 **100바이트**다(글자 수가 아니다 — 한글은 한 글자에 3바이트). 쉼표로 나누고,
  //   낱말은 두 글자보다 길어야 하며, 앱 이름(덕분이)과 다른 앱·회사 이름은 넣지 않는다.
  keywords: { label: '키워드', max: 100, unit: 'byte', text: '사주풀이,자미두수,기문둔갑,궁합보기,오늘의운세,월간운세,명리학,만세력' },
  whatsNew: { label: '이번 버전의 새로운 기능', max: 4000, unit: 'char', text: RELEASE_NOTES },
} satisfies Record<string, StoreField>;

// 인앱 상품 — 키는 앱의 TOPUP_PACKS · 서버 product_catalog 와 같다. 구글: 제목 55 · 설명 200 / 애플: 표시 이름 30 · 설명 45.
export const IAP_PRODUCTS = [
  {
    key: 'DUK_FIRST_20', duk: 20,
    play: { title: '첫 충전 20덕', description: '처음 한 번만 살 수 있는 20덕 묶음이에요. 상담·궁합·프리미엄 리포트에 쓸 수 있어요.' },
    appStore: { displayName: '첫 충전 20덕', description: '처음 한 번만 살 수 있는 20덕 묶음' },
  },
  {
    key: 'DUK_BASE_50', duk: 50,
    play: { title: '기본 50덕', description: '상담·궁합·프리미엄 리포트에 쓸 수 있는 50덕 묶음이에요.' },
    appStore: { displayName: '기본 50덕', description: '상담·궁합·리포트에 쓰는 50덕 묶음' },
  },
  {
    key: 'DUK_LARGE_120', duk: 120,
    play: { title: '넉넉 120덕', description: '상담·궁합·프리미엄 리포트에 쓸 수 있는 120덕 묶음이에요.' },
    appStore: { displayName: '넉넉 120덕', description: '상담·궁합·리포트에 쓰는 120덕 묶음' },
  },
] as const;

// App Review 노트 (App Store Connect → 앱 심사 정보 → 메모). 심사관이 읽으므로 영어. 4.3(포화 카테고리) 대응.
// 문장마다 근거 파일은 docs/STORE_LISTING_COPY_2026-09-13.md 의 표.
export const APP_REVIEW_NOTES = [
  'Deokbuni is not a fortune-text generator. Every interpretation starts from a deterministic calculation.',
  '',
  '1. Calculation first. Saju (Four Pillars) charts are computed deterministically from the birth date and time; Zi Wei Dou Shu and Qi Men Dun Jia charts are also computed when the birth time or the question calls for them. The language model never computes a chart. It only puts into words a plan the server has already decided from those calculations.',
  '2. For supported year and month questions the server, not the model, decides the conclusion for that period. Output guards reject answers that contradict it, that make definitive or guaranteed claims, or that rank a "best time". A rejected answer is regenerated or declined, never shown as-is.',
  '3. Questions about illness, lifespan or death are declined by a deterministic safety router.',
  '4. Every interpretation screen is labelled as AI-generated. Users give separate consent before their birth data and consultation text are sent to our AI provider (OpenAI), and they can report any AI answer in the app.',
  '5. The price in the in-app unit (Duk) is shown before anything is spent. Users can delete individual conversations and reports, and their account, inside the app.',
].join('\n');

// ── 톤이 다른 세 안 (2026-09-14) ─────────────────────────────────────────────────────────────────
// 1안 = 위의 정본(담백한 도구형). 2안(따뜻한 상담형) · 3안(간결형)은 **같은 사실을 톤만 바꿔** 쓴다 — 새 기능 · 새 숫자를
// 더하지 않는다. 세 안 모두 계약 테스트의 같은 검사(칸 길이 · 키워드 100바이트 · 금지 표현 · 가격이 코드와 같은가 ·
// 레포에 근거가 있는 기능만 · 타사 이름 없음)를 지난다. 비교표 docs/STORE_LISTING_VARIANTS_2026-09-14.md 는 여기서 생성한다.
// 인앱 상품 이름 · 심사 노트는 세 안이 같다. 고른 안은 다음 묶음에서 정본(위 PLAY_LISTING · APP_STORE_LISTING)으로 올린다.
export type StoreVariant = {
  id: 1 | 2 | 3;
  name: string;
  tone: string;
  play: { appName: StoreField; shortDescription: StoreField; fullDescription: StoreField; releaseNotes: StoreField };
  appStore: {
    appName: StoreField; subtitle: StoreField; promotionalText: StoreField;
    description: StoreField; keywords: StoreField; whatsNew: StoreField;
  };
};

const like = (field: StoreField, text: string): StoreField => ({ ...field, text });

const DESCRIPTION_WARM = [
  '마음이 복잡한 날, 덕분이에게 편하게 물어보세요.',
  '덕분이는 생년월일시로 명식을 먼저 계산하고, 그 계산을 바탕으로 AI가 이야기를 풀어 드리는 명리 상담 앱이에요.',
  '',
  '■ 이렇게 이야기해요',
  '· 사주(명리)를 중심으로, 태어난 시각과 질문에 따라 자미두수·기문둔갑 계산도 함께 살펴요.',
  '· AI는 명식을 계산하지 않아요. 먼저 계산된 결과를 받아 알아듣기 쉬운 말로 전해 드려요.',
  '· 등록한 사람마다 만세력(사주 여덟 글자와 대운)을 직접 펼쳐 볼 수 있어요.',
  '',
  '■ 함께할 수 있는 것',
  '· 1:1 명리 상담 — 한 번 시작하면 24시간 동안 질문 5번까지 이어서 나눌 수 있어요. (5덕)',
  '· 궁합 — 두 사람의 명식을 나란히 놓고 서로의 정서와 갈등, 오행이 채워 주는 부분을 함께 봐요. (12덕)',
  '· 프리미엄 리포트 — 타고난 명식과 앞으로 열두 달의 흐름을 한 번에 정리해 드려요. (50덕)',
  '· 오늘의 운세 · 이번 달 운세 — 덕 없이 받아 보실 수 있어요.',
  '· 운세우편함 — 받은 운세와 보고서를 모아 두고 언제든 다시 꺼내 볼 수 있어요.',
  '',
  '■ 덕 이야기',
  '· 처음 가입하시면 10덕을 드려요. 하루 한 번 촛불을 켜면 1덕이 쌓여요.',
  '· 덕을 쓰기 전에 얼마가 필요하고 얼마가 남는지 먼저 알려 드려요.',
  '· 충전은 첫 충전 20덕(한 번만) · 기본 50덕 · 넉넉 120덕 세 가지예요.',
  '',
  '■ 안심하셔도 돼요',
  '· 해석 화면마다 AI가 만든 해석이라는 것을 표시해요.',
  '· 생년월일시와 상담 내용을 AI로 처리하기 전에 따로 동의를 여쭤요. 동의는 언제든 철회할 수 있어요.',
  '· 마음에 걸리는 AI 답변은 답변마다 바로 신고할 수 있어요.',
  '· 상담 기록과 보고서는 하나씩 직접 지울 수 있고, 계정 탈퇴도 앱 안에서 바로 할 수 있어요.',
  '',
  '■ 미리 알려 드려요',
  '· 덕분이의 해석은 참고용 정보예요. 의료·법률·투자 같은 전문적인 판단을 대신하지 않아요.',
  '· 건강·수명처럼 명리로 답하지 않는 질문에는 답하지 않아요.',
].join('\n');

const RELEASE_NOTES_WARM = [
  '덕분이가 처음 인사드려요.',
  '· 명식 계산을 바탕으로 풀어 드리는 1:1 상담 · 궁합 · 프리미엄 리포트',
  '· 오늘의 운세 · 이번 달 운세',
  '· 상담 기록과 보고서는 하나씩 직접 지울 수 있어요',
].join('\n');

const DESCRIPTION_BRIEF = [
  '생년월일시로 명식을 계산하고, 그 결과를 AI가 풀어 주는 명리 상담 앱.',
  '',
  '■ 방식',
  '· 사주(명리) 중심. 시각과 질문에 따라 자미두수·기문둔갑도 참고.',
  '· AI는 명식을 계산하지 않아요. 계산된 결과를 풀어 줄 뿐이에요.',
  '· 등록한 사람의 만세력(여덟 글자·대운)을 직접 확인.',
  '',
  '■ 기능',
  '· 1:1 상담 — 24시간 동안 질문 5번까지 (5덕)',
  '· 궁합 — 정서·갈등·오행 보완 (12덕)',
  '· 프리미엄 리포트 — 타고난 명식과 앞으로 열두 달 (50덕)',
  '· 오늘의 운세 · 이번 달 운세 — 덕 없이',
  '· 운세우편함 — 받은 운세와 보고서 보관',
  '',
  '■ 덕',
  '· 가입 선물 10덕 · 촛불 하루 한 번 1덕',
  '· 쓰기 전에 필요한 덕과 남는 덕을 먼저 표시',
  '· 충전: 첫 충전 20덕(한 번만) · 기본 50덕 · 넉넉 120덕',
  '',
  '■ 안심',
  '· 해석 화면마다 AI 표시',
  '· AI 처리 전 별도 동의 · 언제든 철회',
  '· 답변마다 신고',
  '· 상담 기록·보고서 하나씩 삭제 · 앱 안에서 탈퇴',
  '',
  '■ 참고',
  '· 해석은 참고용 정보예요. 의료·법률·투자 판단을 대신하지 않아요.',
  '· 건강·수명 질문에는 답하지 않아요.',
].join('\n');

const RELEASE_NOTES_BRIEF = [
  '첫 출시.',
  '· 1:1 상담 · 궁합 · 프리미엄 리포트',
  '· 오늘의 운세 · 이번 달 운세',
  '· 상담 기록·보고서 삭제',
].join('\n');

export const STORE_VARIANTS: StoreVariant[] = [
  { id: 1, name: '1안', tone: '담백한 도구형 (정본)', play: PLAY_LISTING, appStore: APP_STORE_LISTING },
  {
    id: 2, name: '2안', tone: '따뜻한 상담형',
    play: {
      appName: PLAY_LISTING.appName,
      shortDescription: like(PLAY_LISTING.shortDescription, '생년월일시로 명식을 먼저 계산하고, 그 결과를 바탕으로 차근차근 풀어 드리는 AI 명리 상담'),
      fullDescription: like(PLAY_LISTING.fullDescription, DESCRIPTION_WARM),
      releaseNotes: like(PLAY_LISTING.releaseNotes, RELEASE_NOTES_WARM),
    },
    appStore: {
      appName: APP_STORE_LISTING.appName,
      subtitle: like(APP_STORE_LISTING.subtitle, '계산부터 차근차근 풀어 주는 AI 상담'),
      promotionalText: like(APP_STORE_LISTING.promotionalText, '고민이 있는 날, 생년월일시로 명식을 먼저 계산하고 그 결과로 차근차근 풀어 드려요. 덕을 쓰기 전에는 필요한 덕을 먼저 알려 드리고, 상담 기록과 보고서는 언제든 직접 지울 수 있어요.'),
      description: like(APP_STORE_LISTING.description, DESCRIPTION_WARM),
      keywords: like(APP_STORE_LISTING.keywords, '사주풀이,궁합보기,오늘의운세,월간운세,명리상담,만세력,자미두수'),
      whatsNew: like(APP_STORE_LISTING.whatsNew, RELEASE_NOTES_WARM),
    },
  },
  {
    id: 3, name: '3안', tone: '간결형',
    play: {
      appName: PLAY_LISTING.appName,
      shortDescription: like(PLAY_LISTING.shortDescription, '명식은 계산으로, 풀이는 AI가. 생년월일시로 보는 명리 상담'),
      fullDescription: like(PLAY_LISTING.fullDescription, DESCRIPTION_BRIEF),
      releaseNotes: like(PLAY_LISTING.releaseNotes, RELEASE_NOTES_BRIEF),
    },
    appStore: {
      appName: APP_STORE_LISTING.appName,
      subtitle: like(APP_STORE_LISTING.subtitle, '계산은 엔진이, 풀이는 AI가'),
      promotionalText: like(APP_STORE_LISTING.promotionalText, '명식을 먼저 계산하고 AI가 풀어 드려요. 쓰기 전에 필요한 덕을 표시하고, 상담 기록과 보고서는 직접 지울 수 있어요.'),
      description: like(APP_STORE_LISTING.description, DESCRIPTION_BRIEF),
      keywords: APP_STORE_LISTING.keywords,
      whatsNew: like(APP_STORE_LISTING.whatsNew, RELEASE_NOTES_BRIEF),
    },
  },
];

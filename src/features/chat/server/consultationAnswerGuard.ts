// 상담 답변 검사기 — 서버가 재는 규칙 (2026-09-19, PART 2-1).
//
// 2026-09-18 에 실험 경로에서 만든 검사기를 서버로 옮긴 것이다. 옮기는 이유는 실측이다:
// 규칙을 프롬프트로만 주면 **매번 하나씩 어긋났다**(E안 3회차 · 2차 10회차). 부탁 대신 검사한다.
//
// 오너 판정(2026-09-18)이 규칙의 출처다:
//   딱 짚기  → 짚는 대상 1개 · 성향 한 조각
//   편안함   → 조심·확인 요구 최대 1문장
//   다음 궁금 → 되묻기 1개, 마지막 문장 (문구는 서버가 만든다 — `askBackPrompts.ts`)
//   말투     → "~해요체". "유리합니다/안전합니다/도움이 됩니다" 는 보고서 말투라 금지
//
// ⚠ 시기 항목은 **"이번 달"·"올해" 수준만** 요구한다. 2026-09-19 실측에서 근거 블록에 일진·초순/중순/
//   하순이 **없음**을 확인했다 — "중순 넘어가면서" 를 요구하면 근거 이탈을 시키는 셈이 된다.

export type AnswerCheckKey =
  | '길이' | '조심과다' | '보고서말투' | '합쇼체' | '해요체부족'
  | '되묻기수' | '되묻기위치' | '성향없음' | '성향아닌예측' | '시기없음'
  | '축둘이상' | '쉼표이어붙임' | '전문용어노출' | '오독' | '괄호' | '금지표현' | '톤';

export type AnswerCheckFailure = { key: AnswerCheckKey; detail: string };
export type AnswerCheckResult = {
  ok: boolean;
  failures: AnswerCheckFailure[];
  chars: number;
  askBack: string | null;
};

export const ANSWER_MIN_CHARS = 200;
export const ANSWER_MAX_CHARS = 350;

const REPORT_ENDING = /(유리합니다|안전합니다|도움이\s*됩니다|바람직합니다|권장합니다|필요합니다|효과적입니다|중요합니다)/;
const HAPSYO_END = /(습니다|ㅂ니다|입니다|합니다|됩니다|십시오)[.!?]?$/;
const HAEYO_END = /(에요|예요|이에요|해요|거든요|나요|세요|게요|어요|아요|네요|더라고요|드려요|봐요|돼요|같아요|워요|려요|줘요|와요|셔요|자요|죠)[.!?]?$/;
const CAUTION_REQ = /(확인|점검|검증|따져|살펴보|재확인|미루|보류|신중|삼가|피하시|줄이시|조심)/;
/** 성향 서술의 형태 — 사람 설명. `dispositionProse.isDispositionOnly` 와 같은 결을 본다. */
const DISPOSITION_SHAPE = /(편이에요|편이라|편이시|편입니다|결이에요|편이죠)/;
/** 결과 예측 — 성향 자리에 이것이 오면 실패다. */
const OUTCOME_SHAPE = /(성공|실패|잘\s*됩니다|잘\s*돼|승진합니다|합격|유리합니다|불리합니다|돈을\s*벌)/;
/** 시기 — 월 단위까지만 요구한다(위 머리말). */
const PERIOD = /(이번\s*달|올해|내년|요즘|지금은|당분간|이달|올\s*한\s*해)/;
/** 전문 용어를 본문에 드러내는 표현. 근거는 접힌 영역에만 있어야 한다. */
const JARGON_LEAD = /(사주\s*근거로는|사주를?\s*보면|사주에서는|자미두수(에서는|로는|의)|기문\s*상황판|기문둔갑(에서는|은)|명리(에서는|로는))/;
/** 문장이 끝날 자리에 쉼표를 쓰는 버릇 — 2026-09-18 E안 2차에서 세 답 모두에 있었다. */
const COMMA_SPLICE = /(에요|예요|이에요|해요|거든요|돼요|나아요),\s*(그래서|그러니|그러면|그리고|하지만)/;
const MISREAD = /(일상|하루하루|하루\s*단위|날마다|매일)/;

const BANNED: readonly { key: string; re: RegExp }[] = [
  { key: '세학문합침', re: /(세\s*학문|세\s*가지\s*학문|3\s*개\s*엔진)[^.]{0,20}(일치|합치|종합|모두\s*같)/ },
  { key: '교차검증', re: /(교차\s*검증|크로스\s*체크|종합\s*판단)/ },
  { key: '내부용어', re: /(엔진|SAJU|iztro|grounding|스키마|schema|provider|제공됨)/ },
  { key: '천간지지한자', re: /[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/ },
  { key: '점수등급', re: /(\d+\s*점|[ABCD]\s*등급|★|별점)/ },
  { key: '전문용어단정', re: /(신강|신약|용신|격국|12운성|십이운성|12신살|십이신살)/ },
];
const TONE: readonly { key: string; re: RegExp }[] = [
  { key: '결과단정', re: /(반드시|무조건|틀림없이|확실히)\s*[^.]{0,14}(합니다|됩니다|입니다|일어납니다|성사|해요|돼요)/ },
  { key: '공포조장', re: /(큰일\s*[나납]|위험합니다|망합니다|화를\s*입|불행|재앙)/ },
  { key: '과장', re: /(놀라운|경이로운|완벽한|최고의|엄청난|대박)/ },
  { key: '상담강권', re: /(지금\s*바로\s*(상담|문의)|놓치지\s*마|서둘러\s*(상담|문의)|꼭\s*상담)/ },
];

/** 답변이 짚은 영역. 애매하면 세지 않는 쪽으로 틀린다(2026-09-18 에 "정돈"의 돈을 재물로 센 적이 있다). */
const AXES: readonly { key: string; re: RegExp }[] = [
  { key: '일·직업', re: /(직업|직장|업무|일자리|직무|커리어|승진|이직|팀\s*내)/ },
  { key: '돈·재물', re: /((^|[\s"'(])돈[\s이은을의도만과]|재물|수입|자금|금전|매출|투자|재정)/ },
  { key: '관계·사람', re: /(사람\s*관계|대인|인간관계|배우자|가족|친구|연애|사람들과)/ },
  { key: '건강·몸', re: /(건강|체력|몸이|몸을|몸은)/ },
  { key: '이동·거처', re: /(이사|이주|거처)/ },
];

export const splitSentences = (t: string): string[] =>
  t.split(/(?<=[.!?。])\s*|\n+/).map((s) => s.trim()).filter(Boolean);

export const axesTouched = (t: string): string[] => AXES.filter((a) => a.re.test(t)).map((a) => a.key);

/**
 * 답변 본문(결론 + 이야기)을 검사한다. 통과하지 못하면 호출자는 다시 만들게 하고(최대 2회),
 * 그래도 안 되면 조립기 원문을 낸다 — 사용자가 답을 못 받는 일은 없어야 한다(PART 2-3).
 */
export function checkAnswer(body: string): AnswerCheckResult {
  const t = (body ?? '').trim();
  const failures: AnswerCheckFailure[] = [];
  const ss = splitSentences(t);
  const questions = ss.filter((s) => /\?$/.test(s));
  const askBack = questions.length === 1 ? questions[0] : null;

  if (t.length < ANSWER_MIN_CHARS || t.length > ANSWER_MAX_CHARS) {
    failures.push({ key: '길이', detail: `${t.length}자 (${ANSWER_MIN_CHARS}~${ANSWER_MAX_CHARS} 필요)` });
  }

  const cautions = ss.filter((s) => CAUTION_REQ.test(s));
  if (cautions.length > 1) failures.push({ key: '조심과다', detail: `${cautions.length}개` });

  const report = ss.filter((s) => REPORT_ENDING.test(s));
  if (report.length) failures.push({ key: '보고서말투', detail: report.map((s) => `"${s}"`).join(' / ') });
  const hapsyo = ss.filter((s) => HAPSYO_END.test(s));
  if (hapsyo.length) failures.push({ key: '합쇼체', detail: `${hapsyo.length}개` });
  const haeyo = ss.filter((s) => HAEYO_END.test(s));
  if (ss.length > 0 && haeyo.length / ss.length < 0.7) {
    failures.push({ key: '해요체부족', detail: `${haeyo.length}/${ss.length} 문장만 ~해요체` });
  }

  if (questions.length !== 1) failures.push({ key: '되묻기수', detail: `${questions.length}개 (1개 필요)` });
  else if (questions[0] !== ss[ss.length - 1]) failures.push({ key: '되묻기위치', detail: '마지막 문장이 아님' });

  // 성향 한 조각 — 사람 설명이어야 하고, 결과 예측이면 실패다.
  const dispositionSentences = ss.filter((s) => DISPOSITION_SHAPE.test(s));
  if (dispositionSentences.length === 0) failures.push({ key: '성향없음', detail: '"~한 편이에요" 결의 사람 설명이 없음' });
  else {
    const predictive = dispositionSentences.filter((s) => OUTCOME_SHAPE.test(s));
    if (predictive.length) failures.push({ key: '성향아닌예측', detail: predictive.map((s) => `"${s}"`).join(' / ') });
  }

  // ⚠ 되묻기를 뺀 본문에서 본다. 서버가 만드는 되묻기에는 "요즘" 이 흔히 들어가는데, 그것으로
  //   시기 요구가 채워지면 검사가 통과만 하고 아무것도 보장하지 못한다(첫 구현이 그랬다).
  const withoutAskBack = (askBack ? ss.slice(0, -1) : ss).join(' ');
  if (!PERIOD.test(withoutAskBack)) failures.push({ key: '시기없음', detail: '"이번 달"·"올해" 같은 시기가 없음 (되묻기 제외)' });

  const axes = axesTouched(t);
  if (axes.length > 1) failures.push({ key: '축둘이상', detail: axes.join(' · ') });

  if (COMMA_SPLICE.test(t)) failures.push({ key: '쉼표이어붙임', detail: t.match(COMMA_SPLICE)?.[0] ?? '' });
  const jargon = t.match(JARGON_LEAD);
  if (jargon) failures.push({ key: '전문용어노출', detail: jargon[0] });
  if (MISREAD.test(t)) failures.push({ key: '오독', detail: t.match(MISREAD)?.[0] ?? '' });
  if (/[(（]/.test(t)) failures.push({ key: '괄호', detail: '본문에 괄호' });

  for (const b of BANNED) { const m = t.match(b.re); if (m) failures.push({ key: '금지표현', detail: `${b.key}: ${m[0]}` }); }
  for (const x of TONE) { const m = t.match(x.re); if (m) failures.push({ key: '톤', detail: `${x.key}: ${m[0]}` }); }

  return { ok: failures.length === 0, failures, chars: t.length, askBack };
}

/**
 * 모델 시도 상한 = 첫 시도 1 + **재생성 1회** (CTO 판정 2026-09-19 속도 — 지시서 §2-3 의 "2회" 를 1회로 줄였다).
 * 넘으면 조립기 원문을 낸다 — 비용은 최대 2배로 묶인다.
 */
export const MAX_ANSWER_ATTEMPTS = 2;

/** 조심·확인을 요구하는 문장인가 — 짧은 답을 조립할 때 두 번째 것을 미리 뺄 수 있게 내보낸다. */
export const isCautionRequest = (sentence: string): boolean => CAUTION_REQ.test(sentence);

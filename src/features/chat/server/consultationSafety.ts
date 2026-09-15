// Pre-LLM deterministic safety router (Sprint A §2-§7). Runs BEFORE any grounding or LLM work so a
// high-risk question can NEVER reach fortune interpretation. This is application-layer routing for
// 덕분이 only — NOT a general mental-health system and NOT a redesign of provider safety.
//
// Constitution 제25조 (안정성·상담 품질·보안 우선) + PASS 2 finding: consultation safety was prompt-only.
// The classifier is PURE + high-precision (conservative cues → few false positives). A HARD-STOP route
// returns a controlled, honest response and supplies NO astrology evidence and makes NO LLM call.
// The static responses are a REAL feature (제3조 — not a mock): a deterministic, correct safe answer.

export type SafetyRoute =
  | 'NORMAL'
  | 'SELF_HARM'
  | 'DEATH_LIFESPAN'
  | 'MEDICAL'
  | 'FINANCIAL_GUARANTEE';

// SELF_HARM — direct or reasonably-clear self-harm / suicidal intent. CONSERVATIVE: matches personal
// intent phrasings, NOT the bare noun 죽음 (so "죽음의 철학적 의미" is not routed) and NOT general distress
// ("힘들어") — we do not build a mental-health conversational system, only a safe hard stop.
//
// FINAL_PROSE_DELIVERY_REPAIR_V1 §11-13 — confirmed false positive: a bare "자해" match fires on ANY text
// containing the 4-syllable run "투자해"/"출자해"/"융자해" (투자/출자/융자 = invest/contribute-capital/finance,
// + 해 = the 하다 stem), which is a completely unrelated financial-verb conjugation, not the noun 자해
// (self-harm). Reproduced live: "지금 대출을 받아서 투자해도 될까?" and "지금 가상자산에 투자해도 괜찮을까?" (both
// ordinary investment questions) were routed to the SELF_HARM crisis response by this accidental substring
// match alone. The negative lookbehind excludes exactly that fragmentation (자해 immediately preceded by
// 투/출/융) without touching genuine self-harm mentions, which are never preceded by those syllables in
// natural Korean — real crisis phrasing ("자해하고 싶어", "자해충동이 있어") is unaffected. NOT a topic
// whitelist: 대출/투자/손실/빚 themselves are still fully unfiltered; this narrows only the one mismatched
// regex alternative that caused the misroute.
//
// ⚠⚠ DO NOT ADD `버티는` TO THE (살아야|살아갈|살아가는|버틸|버텨야|버티고) GROUP. ⚠⚠
//
// The list is ASYMMETRIC on purpose-by-accident: `살아가는` is present, `버티는` is not. It looks like an
// oversight and it is extremely tempting to "make it consistent". Do not. Measured 2026-09-06 against the
// golden corpus: TWO of the 84 questions escape a crisis hard stop **only** because `버티는` is absent —
//
//   B84-019  "…같이 일하는 사람들 때문에 매일 힘듭니다. 계속 버티는 게 의미가 있을까요"   (a resignation question)
//   B84-064  "…여기서 그냥 익숙하게 버티는 것 중에 어느 쪽이 저한테 나을까요?"          (a relocation question)
//
// Adding `버티는` routes both to the SELF_HARM crisis response: the reader asking whether to quit a job
// gets suicide hotlines instead of a consultation. Verified by substitution — the same sentences with
// 버틸/버텨야/버티고 DO fire today. The retained alternatives still catch the genuine crisis phrasing
// ("더 이상 버틸 이유가 없어요"), which is what this group exists for, so the asymmetry costs nothing.
// Locked by `consultationSafetyNarrowing.test.ts`; see `docs/SAFETY_ROUTING_AUDIT.md`.
const SELF_HARM =
  /자살|(?<!투)(?<!출)(?<!융)자해|죽고\s*싶|죽어\s*버리고?\s*싶|죽어\s*버릴|살기\s*(가\s*)?싫|살고\s*싶지\s*않|목숨을?\s*끊|스스로\s*목숨|세상을?\s*(떠나|등지)고\s*싶|사라지고\s*싶|죽는\s*게\s*(낫|나을|더\s*나)|(살아야|살아갈|살아가는|버틸|버텨야|버티고)[^.\n]{0,7}(이유|의미)[^.\n]{0,7}(없|모르겠|있을까|있나|있냐|있는지|있어\s*\?|있어요\s*\?)/;

// DEATH_LIFESPAN — asking fortune to predict lifespan or death timing. Checked AFTER self-harm so a
// self-harm phrasing that also mentions dying routes to SELF_HARM first.
//
// NARROWED 2026-09-06 (owner-approved, three exclusions only — see docs/SAFETY_ROUTING_AUDIT.md).
// The principle: remove ONLY over-fires with ZERO safety value. An over-fire costs the reader their
// answer AND teaches them to dismiss the crisis screen — so a pointless one is not merely annoying,
// it erodes the true positives. Nothing here touches a phrasing a person could use about themselves.
//
//  (a) 수명 — the noun means "service life" for objects just as often as "lifespan" for people.
//      "배터리 수명이 궁금해요" was hard-stopped. Excluded only when an OBJECT noun sits immediately
//      before it. The list is closed and every entry is provably not a person, so the exclusion can
//      never swallow a human question: "부모님 수명", "제 수명", a bare "수명" all still fire.
//      ⚠ KNOWN REMAINING over-fire: "수명이 다한 장비를 바꿔야 할까요" — the object noun comes AFTER.
//      Left firing on purpose: a lookahead broad enough to catch it would also catch "제 수명이 다한
//      건가요", which SHOULD route. Accepted cost.
//  (b) 얼마나 (더)(오래) 살 — narrowed by the VERB, not by a subject list, which is both smaller and
//      more robust: 살아남다 (survive) and 살리다 (keep alive) are different verbs from 살다 (live).
//      "회사가 얼마나 더 살아남을까요" / "이 사업을 얼마나 오래 살릴 수 있을까요" are business questions
//      and no subject enumeration is needed to tell them apart. "얼마나 오래 살 수 있을까요" still fires.
//  (c) 오래 살 수 있는 <직업/일/…> — a career question ("오래 살 수 있는 직업일까요"), not a lifespan one.
//      Excluded only in that attributive shape; "오래 살 수 있을까요" is untouched.
const OBJECT_LIFESPAN_SUBJECT = '배터리|장비|부품|제품|기기|설비|차량|엔진|타이어|서버|하드웨어|건물|가전|소모품|자재';
const CAREER_NOUN = '직업|일|분야|업종|직장|자리|커리어|업계';
const DEATH_LIFESPAN = new RegExp(
  [
    `(?<!(?:${OBJECT_LIFESPAN_SUBJECT})\\s*)수명`,
    '몇\\s*살(까지|에)?[^.\\n]{0,6}(죽|사망|눈\\s*감)',
    '언제\\s*죽',
    '죽을\\s*(운|팔자|나이|때)',
    '죽는\\s*(날|시기|때|나이)',
    '사망\\s*(시기|시점|나이|운)',
    '얼마나\\s*(더\\s*)?(오래\\s*)?살(?!아남|리|릴|려|립)',
    `오래\\s*살(?!\\s*수\\s*있는\\s*(?:${CAREER_NOUN}))(까|겠|\\s*수\\s*있|게\\s*될)`,
  ].join('|'),
);

// MEDICAL diagnosis / prognosis from fortune. Requires disease/diagnosis terms — NOT bare 건강, so a
// low-stakes wellness question ("요즘 건강운 어때?") stays NORMAL and is handled by the existing caution policy.
//
// NARROWED 2026-09-06 — the `진단` alternative only. Same principle as the DEATH_LIFESPAN narrowing above:
// remove ONLY over-fires with ZERO safety value, and never touch a phrasing a person could use about their
// own body. Measured over-fires (4/4 fired before, all NORMAL after):
//
//   "제 사업을 진단해 주세요"  "제 성격을 진단해 볼 수 있을까요"
//   "이 프로젝트를 진단받고 싶어요"  "지금 상황을 진단해 주시면 좋겠어요"
//
// 진단하다 is ordinary Korean for "assess" — 사업 진단, 조직 진단, 성격 진단. A bare `진단해` therefore says
// nothing about medicine, and this was the highest-frequency remaining over-fire in the 2026-09-06 audit.
//
// WHY A CUE LIST AND NOT AN EXCLUSION LIST: the things a person might 진단 (사업·조직·프로젝트·성격·상황·
// 시장·팀·코드…) are an OPEN set that would need forever-maintenance, while the things that make 진단 medical
// are a CLOSED set. Requiring the medical cue is the same structural argument as the OBJECT_LIFESPAN_SUBJECT
// exclusion — the list can only ever be wrong in the direction of not firing on a non-medical question.
//
// ⚠ `암` and `병` stay in the cue list even though their syllables appear in unrelated words (암호, 병행).
// Dropping them would lose "암 진단받았어요" — a real disclosure that must route — and the cost of the rare
// over-fire is a benign "의료 전문가와 상담해 주세요", not a crisis screen. Asymmetry, deliberately kept.
//
// 진단명 stays UNCONDITIONAL: it has no non-medical use.
const MEDICAL_DIAGNOSIS_CUE = '건강|몸|체질|병|질환|질병|증상|검진|통증|아픈|아파|아픔|암|종양';
const MEDICAL = new RegExp(
  [
    '(사주|팔자|명(에|이|리)|역학)[^.\\n]{0,10}(암|병|질병|불치|중병|큰\\s*병|종양)',
    '(암|중병|불치병|큰\\s*병|종양)[^.\\n]{0,6}(이야|인가|일까|걸리|생기|있(어|나|을까|는지|나요))',
    '이\\s*(병|증상|질환)[^.\\n]{0,8}(나(을까|아|아요|을지)|낫|치료|완치|호전|경과)',
    '무슨\\s*병',
    `(?:${MEDICAL_DIAGNOSIS_CUE})[^.\\n]{0,10}진단[^.\\n]{0,4}(?:해|되|받|명)`,
    `진단[^.\\n]{0,4}(?:해|되|받)[^.\\n]{0,10}(?:${MEDICAL_DIAGNOSIS_CUE})`,
    '진단명',
    '완치(\\s*(되|될|가능|여부))',
    '불치',
  ].join('|'),
);

// FINANCIAL_GUARANTEE — a demand for a GUARANTEED financial outcome. NOT a hard stop: the normal
// suitability discussion may proceed, but the plan already forbids event-certainty (GUARANTEE_CUE) and
// the post-output certainty validator (certaintyGuard) rejects any guarantee language in the answer.
const FINANCIAL_GUARANTEE =
  /원금\s*보장|손실\s*(이\s*)?없(어|이|나|을|는)|수익[^.\n]{0,6}보장|보장[^.\n]{0,6}수익|확정\s*수익|(무조건|반드시|틀림없이|꼭|100\s*%)[^.\n]{0,10}(수익|이득|벌(어|게|ㄹ|립|린)|부자|대박|성공)|(투자|주식|코인|비트코인|부동산|재테크)[^.\n]{0,12}(무조건|반드시|확실히|틀림없이|보장|대박|100\s*%)/;

/**
 * Deterministically classify a consultation question into a safety route. Order matters: the highest-harm
 * category wins, and SELF_HARM is evaluated first. Returns 'NORMAL' when no cue matches.
 */
export function classifyConsultationSafetyRoute(question: string): SafetyRoute {
  const q = (question ?? '').trim();
  if (q.length === 0) return 'NORMAL';
  if (SELF_HARM.test(q)) return 'SELF_HARM';
  if (DEATH_LIFESPAN.test(q)) return 'DEATH_LIFESPAN';
  if (MEDICAL.test(q)) return 'MEDICAL';
  if (FINANCIAL_GUARANTEE.test(q)) return 'FINANCIAL_GUARANTEE';
  return 'NORMAL';
}

// A HARD-STOP route must short-circuit BEFORE grounding + LLM (no astrology evidence, no fortune, no LLM
// call). FINANCIAL_GUARANTEE is intentionally NOT a hard stop.
export function isHardStopRoute(route: SafetyRoute): boolean {
  return route === 'SELF_HARM' || route === 'DEATH_LIFESPAN' || route === 'MEDICAL';
}

// Controlled, honest responses. No fortune, no prediction. The crisis contacts are Korea's public lines;
// the OWNER should verify/localize them before launch (see Sprint A report).
const SELF_HARM_RESPONSE = [
  '지금 많이 힘드셨겠어요. 이건 운세로 판단할 문제가 아니라, 지금 바로 도움을 받을 수 있는 일이에요.',
  '혼자 감당하지 마시고, 지금 마음을 아래로 이야기해 주세요.',
  '',
  '· 자살예방 상담전화 109 (24시간)',
  '· 정신건강 상담전화 1577-0199',
  '· 급하면 112 / 119',
  '',
  '덕분이는 이런 순간에 사주 풀이를 드리지 않아요. 당신의 이야기를 들어줄 사람이 있어요.',
].join('\n');

const DEATH_LIFESPAN_RESPONSE = [
  '덕분이는 수명이나 세상을 떠나는 시기를 사주로 단정하지 않아요. 그건 운세가 정할 수 있는 영역이 아니거든요.',
  '대신, 지금의 삶을 더 건강하고 단단하게 가꿔가는 이야기라면 함께 나눌 수 있어요.',
  '요즘 마음이나 건강, 앞으로의 방향 중 무엇이 궁금하신지 편하게 말씀해 주세요.',
].join('\n');

const MEDICAL_RESPONSE = [
  '덕분이는 사주로 질병을 진단하거나 병의 경과·완치 여부를 판정하지 않아요.',
  '건강이 염려되신다면 증상은 꼭 의료 전문가와 상담해 주세요. 그게 가장 정확하고 안전한 길이에요.',
  '대신 전반적인 건강 관리의 흐름이나 생활에서 신경 쓰면 좋은 부분 정도라면 함께 살펴볼 수 있어요.',
].join('\n');

/**
 * The controlled response for a hard-stop route. Returns null for routes that are NOT a hard stop
 * (NORMAL / FINANCIAL_GUARANTEE) — the caller then runs the normal consultation.
 */
export function safeResponseForRoute(route: SafetyRoute): string | null {
  switch (route) {
    case 'SELF_HARM':
      return SELF_HARM_RESPONSE;
    case 'DEATH_LIFESPAN':
      return DEATH_LIFESPAN_RESPONSE;
    case 'MEDICAL':
      return MEDICAL_RESPONSE;
    default:
      return null;
  }
}

// Deterministic consultation DOMAIN classification (Sprint E §8). A pure, offline classifier used to route
// the question to its judge axis and to persist the topic of a turn in decisionMeta, so a follow-up
// ("그럼 내년은?") can preserve the previous domain server-side instead of inferring it from free-form prose.
// Not a ranking, not astrology — just a stable topic label. '전반' = no specific domain resolved.
//
// V6.1 QUESTION AXIS ROUTER CLOSURE — WHY THIS WAS REBUILT.
//
// V6 moved presentation to an ASKED-AXIS contract: off-axis material may not become the conclusion, the
// caution, the action item or the cited evidence. That contract can only be as precise as the axis it is
// given, and the router measured 46 of 84 consumed benchmark questions resolving to 전반 — so for more than
// half of them the relevance filter correctly refused to decide anything and failed open.
//
// The cause was structural, not a missing word list. The classifier was a ladder of isolated NOUNS tested
// first-match-wins over the whole string, and real consumer Korean does not name its topic with the noun the
// ladder happened to carry: people describe a SITUATION and ask about it. "지금 다니는 회사 계속 다녀도
// 괜찮을까요?" is a career question with no 직업/직장; "손님은 느는데 남는 게 없어요" is a business question
// with no 사업/매출; "삼 년째 승진 얘기가 없습니다" is a career question with no listed word at all.
//
// Two changes, both structural:
//
//   1. CONCEPT FAMILIES instead of isolated nouns. Each domain is expressed as the vocabulary a consumer
//      actually uses to describe that part of their life — the roles, the objects, the verbs and the
//      phrasings — not one canonical noun per topic.
//
//   2. PRIMARY-PROPOSITION SELECTION instead of first match. Korean is head-final: the thing being asked
//      about sits in the FINAL clause, and everything before it is the situation that led to the question.
//      So the focus clause is classified first, and the whole question is only the fallback. That is what
//      makes "승진 얘기도 있고 이직 제안도 왔는데, 지금 회사에 남는 게 나을까요?" a question about staying
//      rather than a question about whichever topic was mentioned first.
//
// Every pattern below is a general Korean intent family. None of them was added to satisfy one benchmark
// case, and no benchmark id, subject or question text appears in this file or anywhere in production.

export type ConsultationDomain =
  | '사업' | '창업' | '이직' | '직업' | '재물' | '결혼' | '연애' | '재회' | '관계' | '건강' | '시험' | '이사'
  | '계약'
  // V6.1 — two axes the product always had but the router could never emit.
  //
  // 변화: a life transition that is not primarily business, career or relationship — changing environment,
  //   direction or circumstances. It routed to 전반, so "환경을 바꾸면 지금 답답한 게 풀릴까요" had no axis at
  //   all. It maps to the SAME MOVEMENT axis 이사 already uses, so it introduces no new judge path.
  // 시기: the period ITSELF is the asked proposition ("올해는 저한테 어떤 흐름인가요", "지금이 어떤 구간인가요").
  //   Distinct from a timing-MODE question about a subject ("이직은 언제 하는 게 좋을까요"), which stays on its
  //   subject axis — see the precedence note below, where 시기 is deliberately last.
  | '변화' | '시기'
  | '전반';

/**
 * One domain and the vocabulary family that names it. `pattern` is intentionally broad within its own
 * concept and narrow across concepts: a word that belongs to two families (돈 in a business question) is
 * resolved by PRECEDENCE, not by making the pattern cleverer.
 */
type DomainFamily = { readonly domain: ConsultationDomain; readonly pattern: RegExp };

// PRECEDENCE — most specific asked proposition first. This is the tie-break when a single clause names more
// than one family, and it encodes real distinctions the judges already draw:
//
//   재회 before 연애/결혼 — reconnection is a structurally different judgment from a new bond.
//   창업 before 사업     — starting is a different decision from running.
//   이직 before 직업     — leaving is a different decision from the role itself.
//   시험 before 직업     — an exam is its own outcome, not a workplace question.
//   재물 before 이사/변화 — a question about money that mentions moving is still about money.
//   시기 LAST           — a subject always outranks the period it is asked about, which is what keeps
//                         "이직은 언제?" on the CAREER axis with TIMING as the question mode.
const SUBJECT_FAMILIES: readonly DomainFamily[] = [
  // ── REUNION: an ended relationship, and whether it can resume. ────────────────────────────────────
  {
    domain: '재회',
    pattern: /재회|재결합|다시\s*만나|다시\s*연락|되돌[릴리]|돌아올|돌아와|붙잡|헤어[지진졌]|이별|전\s*(?:남자|여자)\s*친구|전남친|전여친|(?:헤어진|끝난).{0,12}(?:다시|연락|사람)|안부\s*연락|여지가/,
  },
  // ── MARRIAGE: the commitment decision itself. ─────────────────────────────────────────────────────
  { domain: '결혼', pattern: /결혼|혼인|약혼|상견례|신혼|평생\s*(?:함께|같이)/ },
  // ── ROMANCE: meeting, dating, and how a current relationship is going. ────────────────────────────
  {
    domain: '연애',
    // The last group is how people describe a relationship they are ALREADY in without naming it: "이 관계가
    // 편해질까", "오래갈 수 있는 사이인지", "만난 지 일 년 됐는데". 인간관계/사람 관계 stay with the 관계 family
    // below — those are distinct strings, so the two never compete for the same phrasing.
    pattern: /연애|사랑|썸|이성|애인|인연|소개팅|맞선|고백|데이트|남자\s*친구|여자\s*친구|남친|여친|만나는\s*(?:사람|분)|사귀|호감|설레|마음을\s*열|이\s*관계|사이[인일가]|만난\s*지|관계가\s*(?:끝|깨|멀)/,
  },
  // ── STARTUP: opening or founding something new. ───────────────────────────────────────────────────
  { domain: '창업', pattern: /창업|개업|(?:가게|매장|점포|사무실|지점).{0,6}(?:내려|내는|차리|열려|열까|오픈)|법인\s*설립/ },
  // ── BUSINESS: running one — the operation, its customers, its costs and its expansion. ────────────
  {
    domain: '사업',
    // "투자를 받다" is RAISING capital — a decision about the business, the mirror image of "투자를 하다",
    // which is a personal money decision and stays with 재물.
    pattern: /사업|장사|자영업|가게|매장|점포|프랜차이즈|거래처|납품|재고|손님|고객|매출|영업|인건비|재료값|원가|마진|수익성|폐업|동업|확장|지점|임대료|스토어|배달|단가|투자를?\s*받/,
  },
  // ── JOB CHANGE: leaving, moving, being recruited away. ────────────────────────────────────────────
  {
    domain: '이직',
    // "옮기다" needs a workplace beside it. On its own it is the most overloaded verb in this whole file —
    // people move house, move money and move deadlines with it — so a bare "옮기는 게 나을까요" is left to
    // whichever family actually named the thing being moved.
    pattern: /이직|전직|퇴사|사직|그만두|(?:회사|직장|자리)를?\s*옮기|(?:다른|새)\s*(?:회사|직장)|스카우트|스카웃|헤드헌/,
  },
  // ── CAREER: the role, the workplace, and moving within it. ────────────────────────────────────────
  {
    domain: '직업',
    pattern: /직업|직장|회사|취업|커리어|일자리|진로|승진|진급|발령|부서|보직|팀장|과장|차장|부장|임원|상사|동료|연봉|복직|복귀|정규직|계약직|근무|출근|야근|면접|입사|적성|하고\s*싶던\s*(?:일|분야)|이\s*일을\s*계속|일을\s*해야/,
  },
  // ── EXAM: a pass/fail outcome that is its own event. ──────────────────────────────────────────────
  { domain: '시험', pattern: /시험|합격|불합격|수능|자격증|취득|고시|공시|채용\s*시험/ },
  // ── MONEY: what comes in, what stays, and what is owned. ──────────────────────────────────────────
  {
    domain: '재물',
    pattern: /재물|재정|금전|돈|자산|수입|소득|저축|목돈|현금|자금|투자|주식|코인|펀드|부동산|빚|대출|이자|상속|유산|물려받|굴리|씀씀이|생활비|모으[는을]|목돈/,
  },
  // ── CONTRACT: signing, dealing, committing on paper. ──────────────────────────────────────────────
  // ── RELOCATION: where you live. Ordered BEFORE 계약 for the same reason 재물 outranks it: a housing
  //    question that mentions renewing a lease is still a housing question, not a contract question. ──
  {
    domain: '이사',
    pattern: /이사|이주|전세|월세|재계약|집을?\s*(?:옮|사|알아|구하)|(?:새|다른)\s*(?:동네|집)|이전하|내려가|해외로\s*(?:나가|가)|귀농|귀촌/,
  },
  // ── CONTRACT: signing, dealing, committing on paper — as the subject in its own right. ────────────
  { domain: '계약', pattern: /계약|서명|체결|거래를|매매|잔금/ },
  // ── RELATIONSHIP (non-romantic): people friction as the subject. ──────────────────────────────────
  { domain: '관계', pattern: /인간관계|대인\s*관계|관계운|사람\s*관계|사람들\s*때문|사람\s*때문/ },
  // ── HEALTH. ───────────────────────────────────────────────────────────────────────────────────────
  { domain: '건강', pattern: /건강|질병|아프|몸이|체력|컨디션|병원|수술/ },
];

// RESIDUAL families — the SHAPE of the ask rather than a part of life.
//
// A subject always outranks these, and it outranks them ANYWHERE in the question, not just in the focus
// clause. That is the rule that keeps a subject asked about in time on its own axis: "헤어진 지 반년 됐는데
// 다시 마음이 닿을 시기가 올까요" narrates the subject and asks about the period, and its proposition is the
// reunion — TIMING is the MODE, which `resolveQuestionIntent` and `classifyTimingQuestion` already carry
// separately and which nothing here touches. The same holds for 변화: "면접에서 계속 떨어지는데 뭘 바꿔야
// 할까요" is a career question, not a life-transition question, and only reads as one if a generic "바꾸다"
// is allowed to outrank the subject the person actually named.
//
// 시기 before 변화: "when / which period" is a more specific ask than "something should change", so a
// question that carries both ("가장 크게 달라지는 시기가 언제일지") is answered on the period.
const RESIDUAL_FAMILIES: readonly DomainFamily[] = [
  // ── PERIOD-AS-PROPOSITION. ────────────────────────────────────────────────────────────────────────
  {
    domain: '시기',
    // Three general constructions, beyond the plain period nouns:
    //   "지금이 …할 때인지" / "…할 때인가" — the whole proposition is whether NOW is the moment.
    //   "요즘 같은 때" / "지금 같은 시기" — the current stretch of time as the thing being asked about.
    //   "앞으로 N년/개월" — a forward window as the scope of the question.
    pattern: /어떤\s*(?:시기|구간|흐름|해)|무슨\s*(?:시기|운)|시기(?:를|가|는|적으로)|시점|타이밍|운의\s*흐름|올해\s*(?:는|저한테|나한테|어떤|운)|지금이\s*(?:어떤|무슨|원래)|얼마나\s*(?:이어|더|갈)|언제쯤|언제가|몇\s*년\s*(?:안에|뒤|후)|상반기|하반기|어느\s*쪽\s*감|때인[지가]|(?:요즘|지금)\s*같은\s*(?:때|시기)|앞으로\s*(?:\d+|[일이삼사오육칠팔구십]|한|두|세|네|다섯|여섯|일곱|여덟|아홉|열|몇)\s*(?:년|해|개월|달)/,
  },
  // ── CHANGE: a transition of direction or circumstances that is none of the subjects above. ────────
  {
    domain: '변화',
    pattern: /변화|바꾸|바꿔|바뀌|달라지|전환|새롭게\s*시작|방향을\s*(?:틀|바꾸|정)|환경을|정리하고|벗어나|반복되는|틀에서/,
  },
];

// The FOCUS clause — the last sentence of the question. Korean puts the asked proposition at the end, so a
// question that narrates a situation and then asks about one part of it is answered by its final clause.
// Trailing empties are dropped so a terminal '?' or '.' does not make the focus blank.
//
// Exported because the SAME head-final rule governs every reading of a question, not just the domain: the
// intent resolver and the decision-proposition builder must agree with this one about which words carry the
// ask. Having two definitions of "what was actually asked" is how a career question came to be answered as a
// causal one — the situation clause said 때문에 and the ask said 계속 버티는 게 의미가 있을까요.
export function focusClause(question: string): string {
  const parts = question.split(/(?<=[.!?。？！\n])\s*/).map((s) => s.trim()).filter((s) => s.length > 0);
  return parts.length > 0 ? parts[parts.length - 1] : question;
}

const firstMatch = (families: readonly DomainFamily[], text: string): ConsultationDomain | null =>
  families.find((f) => f.pattern.test(text))?.domain ?? null;

/**
 * Subject labels this consultation product has NO domain judge for.
 *
 * They are real topics and they stay as the recorded label when nothing else is asked — but they must not
 * SUPPRESS an axis the product can actually judge. "몸이 계속 안 좋은데 지금이 밀어붙일 때인지 쉬어갈 때인지"
 * names health as the situation and asks about the period; letting 건강 win routes the whole question to an
 * axis with no judge behind it, which lands the reader back in the GENERAL fail-open V6.1 exists to close.
 * Health is additionally handled by the pre-LLM safety router, which is unaffected by this file.
 *
 * Kept in sync with the real routing tables (`DOMAIN_MAP` → `AXIS_TO_DOMAIN`) by a test, not by duplication
 * of the maps themselves: this module stays a pure classifier with no dependency on the judge registry.
 */
const UNJUDGED_SUBJECTS: readonly ConsultationDomain[] = ['건강', '관계', '계약'];
const isJudged = (d: ConsultationDomain | null): boolean => d !== null && !UNJUDGED_SUBJECTS.includes(d);

/**
 * The question's topic. Pure and deterministic: same string in ⇒ same label out, no I/O, no model call.
 *
 * Resolution order, and why each step is in it:
 *
 *   1. a SUBJECT in the focus clause  — the thing actually being asked about;
 *   2. a SUBJECT anywhere             — the person named their topic while narrating, then asked about it
 *                                       in words that carry no topic of their own ("그럼 어떻게 할까요?");
 *   3. a RESIDUAL in the focus clause — no subject exists; the ask is about a period or a transition;
 *   4. a RESIDUAL anywhere;
 *   5. 전반.
 *
 * '전반' survives for genuine ambiguity — a question that names no part of life this product has an axis for.
 * It must never mean "the classifier did not recognise ordinary Korean", which is what it used to mean.
 */
export function classifyConsultationDomain(question: string): ConsultationDomain {
  const q = question ?? '';
  if (q.trim().length === 0) return '전반';
  const focus = focusClause(q);
  const subject = firstMatch(SUBJECT_FAMILIES, focus) ?? firstMatch(SUBJECT_FAMILIES, q);
  if (isJudged(subject)) return subject!;
  const residual = firstMatch(RESIDUAL_FAMILIES, focus) ?? firstMatch(RESIDUAL_FAMILIES, q);
  // An unjudged subject still stands when the question asks nothing this product can route instead.
  return residual ?? subject ?? '전반';
}

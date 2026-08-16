// Deterministic Qimen activation (directive §1/§2/§18). 기문둔갑 is QUESTION-TIME based and runs ONLY
// for a timing / decision / choice / action / flow question — never for a pure natal question, and
// NEVER LLM-decided. This is a curated, rule-based layer (`deokbunai.qimen-activation.v1`), two-tier so a
// natal question that merely mentions a domain noun ("투자 성향은?") does NOT falsely activate Qimen.
import type { QimenQuery, QimenQueryTime } from '@/features/qimen';

export const QIMEN_ACTIVATION_VERSION = 'deokbunai.qimen-activation.v1';

// STRONG signals — sufficient on their own.
const DECISION = /(해도\s*(될까|괜찮|되나|돼요?|할까요?)|하는\s*게\s*(좋을|나을|맞을|유리)|하면\s*(어떨까|될까|괜찮)|하는\s*것이\s*(좋|나을)|괜찮을까|괜찮을까요|유리할까|불리할까|해야\s*할까|말까|해도\s*되나요)/;
const TIMING = /(언제|지금|이번\s*(달|주|분기)|올해\s*안|다음\s*달에|타이밍|시점|시기|며칠|몇\s*월|어느\s*시기)/;
const CHOICE = /(어느\s*(쪽|것|편)|둘\s*중|중에\s*(어느|뭐|무엇)|어떤\s*걸\s*선택|선택하는\s*게)/;
const FLOW = /(어떻게\s*(흘러갈|풀릴|진행|전개|될까|되어갈|흐를)|상황이\s*어떻|흐름이\s*어떻|잘\s*될까|잘\s*풀릴|어떻게\s*진행)/;

// ACTION domain nouns — activate ONLY when paired with a decision/timing verb (not alone).
const ACTION_NOUN = /(투자|계약|이직|전직|창업|이사|매매|매수|매도|입찰|합격|고백|연락|협상|소송|오픈|출시|런칭|사업|시험|승진|응시|담판|매입)/;
const ACTION_VERB = /(해도|할까|하는\s*게|하면|해야|하지\s*마|지금|언제|이번\s*(달|주)|괜찮|좋을까|유리|말까|될까|가능|어떨까|봐도)/;

// A question about INHERENT disposition ("어떤 성향/성격/타고난 …") is natal even when it ambiently says
// "지금 / 이번 달" — there those words mean "as I am now", not a decision instant. This suppresses ONLY an
// ambient TIMING trigger; a real decision/choice/flow/action still activates (checked first). Codex PART E.
const NATAL_INTENT = /(타고난|천성|본성|기질|성향|성격)/;

function isTiming(q: string): boolean {
  // Unambiguous decision / choice / flow, or an action-noun + verb pairing → always Qimen, even if the
  // sentence also contains disposition words ("투자 성향대로 밀어붙여도 될까?").
  if (DECISION.test(q) || CHOICE.test(q) || FLOW.test(q)) return true;
  if (ACTION_NOUN.test(q) && ACTION_VERB.test(q)) return true;
  // Only an ambient TIMING word remains — activate unless the question is really about natal disposition.
  if (TIMING.test(q)) return !NATAL_INTENT.test(q);
  return false;
}

/**
 * Whether a consultation question activates Qimen (timing/decision) vs. is natal-only. Deterministic +
 * rule-based (never LLM-decided). A pure natal question with NO timing/decision/choice/action/flow
 * signal → false (Qimen stays not_applicable).
 */
export function classifyTimingQuestion(question: string): boolean {
  const q = (question ?? '').trim();
  return q.length > 0 && isTiming(q);
}

// UTC epoch seconds → Asia/Seoul (UTC+9, fixed) civil wall-clock — the QUESTION instant for Qimen.
// Korea-only V1 policy (mirrors the Saju V1 Asia/Seoul zone); recorded as an assumption in provenance.
const SEOUL_OFFSET_SECONDS = 9 * 3600;
export function epochToSeoulQueryTime(epochSeconds: number): QimenQueryTime {
  const d = new Date((epochSeconds + SEOUL_OFFSET_SECONDS) * 1000); // UTC fields of the shifted instant = Seoul local
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(), hour: d.getUTCHours() };
}

/**
 * Build the QimenQuery for a consultation question at a given instant. FRESH per question (§18): the
 * caller passes the CURRENT question instant, so a follow-up re-activates Qimen at its own time.
 */
export function resolveQimenActivation(question: string, questionEpochSeconds: number): QimenQuery {
  const isTimingQuestion = classifyTimingQuestion(question);
  return {
    isTimingQuestion,
    questionTime: isTimingQuestion ? epochToSeoulQueryTime(questionEpochSeconds) : null,
  };
}

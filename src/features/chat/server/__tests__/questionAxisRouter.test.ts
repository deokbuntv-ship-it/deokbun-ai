// V6.1 QUESTION AXIS ROUTER CLOSURE — the routing contract V6's relevance layer depends on.
//
// V6 made presentation asked-axis-scoped: off-axis material may not become the conclusion, the caution, the
// action item or the cited evidence. That contract is only as precise as the axis it is handed, and the
// router was resolving more than half of a real consumer question set to 전반 — not because those questions
// were ambiguous, but because the classifier tested isolated NOUNS first-match-wins and ordinary Korean does
// not name its topic that way.
//
// Every question below is SYNTHETIC and written for the intent family it exercises. None is copied from any
// benchmark, and the properties asserted are structural (which axis, and why that one) rather than a score.
import {
  classifyConsultationDomain, type ConsultationDomain,
} from '@/features/chat/server/consultationDomain';
import {
  resolveAskedTarget, resolveJudgmentDomain, resolveQuestionIntent,
} from '@/features/chat/services/consultationGrounding';
import { classifyTimingQuestion } from '@/features/chat/selectors/qimenActivation';
import { routeConsultationJudgeDomain, type ConsultationJudgeDomain } from '@/features/divination';

/** The axis the consultation judges and the V6 relevance filter actually read. */
const routedDomain = (q: string): ConsultationJudgeDomain | null =>
  routeConsultationJudgeDomain(resolveAskedTarget(q), resolveJudgmentDomain(q));

const expectRoute = (q: string, domain: ConsultationJudgeDomain) => expect(routedDomain(q)).toBe(domain);
const expectTopic = (q: string, topic: ConsultationDomain) => expect(classifyConsultationDomain(q)).toBe(topic);

describe('BUSINESS — running a business, in the words people actually use', () => {
  it('names the business directly', () => {
    expectRoute('지금 하는 사업을 더 키워도 될까요?', 'BUSINESS');
    expectRoute('가게를 하나 더 내볼까 고민입니다.', 'BUSINESS');
  });

  it('describes the operation without ever saying 사업 or 매출', () => {
    // The old classifier had none of 손님 / 인건비 / 재고 / 거래처, so every question phrased like a real
    // shop owner's fell to 전반.
    expectRoute('손님은 조금씩 느는데 인건비랑 재료값이 계속 올라서 남는 게 없습니다. 이대로 계속 가도 될까요?', 'BUSINESS');
    expectRoute('거래처 한 곳이 납품을 줄이겠다고 합니다. 재고를 어떻게 잡아야 할지 봐주세요.', 'BUSINESS');
  });

  it('a long-form business decision keeps its axis — length is not ambiguity', () => {
    const q = '작은 매장을 삼 년째 혼자 꾸리고 있습니다. 반응은 나쁘지 않은데 자리가 좁아서 더 늘리기가 어렵고, '
      + '임대료는 계속 오르는 상황입니다. 지금 규모를 키우는 쪽으로 움직여도 되는 때인지 봐주세요.';
    expectRoute(q, 'BUSINESS');
  });

  it('OPERATING profitability is a business question; what to DO with the money is not', () => {
    // Both mention profit. The first asks about running the shop, the second about the money itself, and the
    // family that names the decision object is the one that wins.
    expectRoute('손님은 느는데 마진이 안 남습니다. 이대로 계속 가도 될까요?', 'BUSINESS');
    expectRoute('올해 남긴 이익을 어디에 어떻게 굴리는 게 좋을까요?', 'MONEY');
  });

  it('raising capital is a business decision; investing personally is a money decision', () => {
    expectRoute('투자를 받아서 규모를 키우는 게 나을까요?', 'BUSINESS');
    expectRoute('여윳돈으로 투자를 시작해도 괜찮을까요?', 'MONEY');
  });
});

describe('MONEY — income, what stays, and what is owned', () => {
  it('income and assets', () => {
    expectRoute('올해 수입이 늘어날 수 있을까요?', 'MONEY');
    expectRoute('지금 모아둔 자산을 어떻게 지키는 게 좋을까요?', 'MONEY');
  });

  it('inheritance — an asset question with none of the old money nouns', () => {
    expectRoute('부모님께 물려받게 될 것이 조금 있는데 어떻게 정리하면 좋을까요?', 'MONEY');
    expectRoute('상속 문제로 형제들과 이야기가 오갑니다. 제 몫은 어떻게 될까요?', 'MONEY');
  });

  it('debt and cashflow', () => {
    expectRoute('대출 이자가 부담스러운데 지금 갚아나가는 게 맞을까요?', 'MONEY');
  });
});

describe('CAREER — the role and moving within it', () => {
  it('promotion — the single most common career question, and the one the old list had no word for', () => {
    expectTopic('한자리를 오래 지켰는데 승진 얘기가 통 없습니다. 더 올라갈 수 있을는지요?', '직업');
    expectRoute('한자리를 오래 지켰는데 승진 얘기가 통 없습니다. 더 올라갈 수 있을는지요?', 'CAREER');
  });

  it('resignation and job change', () => {
    // 이직 is its own topic (a different decision from the role itself), and the judges' existing asked-matter
    // map already sends JOB_CHANGE to the CAREER consultation domain — routing here, not a new rule.
    expectTopic('지금 회사를 그만두는 게 나을까요?', '이직');
    expectRoute('지금 회사를 그만두는 게 나을까요?', 'CAREER');
    expectTopic('다른 회사에서 제안이 왔는데 옮기는 게 맞을까요?', '이직');
  });

  it('transfer, return from leave, and staying put', () => {
    expectRoute('다른 부서로 발령이 났는데 받아들이는 게 좋을까요?', 'CAREER');
    expectRoute('휴직이 끝나고 복귀를 앞두고 있는데 지금 돌아가는 게 맞을까요?', 'CAREER');
    expectRoute('지금 다니는 회사에 그냥 더 있어도 괜찮은 자리일까요?', 'CAREER');
  });
});

describe('LOVE — a new relationship and a current one', () => {
  it('meeting someone new', () => {
    expectRoute('올해 새로운 인연을 만날 수 있을까요?', 'LOVE');
    expectRoute('소개팅 자리에 나가봐도 괜찮을까요?', 'LOVE');
  });

  it('a relationship already underway, described without naming it', () => {
    // "이 관계", "~한 사이", "만난 지" — how people talk about the relationship they are in.
    expectRoute('만난 지 일 년 됐는데 저만 애쓰는 것 같습니다. 이 관계가 앞으로 편해질 수 있을까요?', 'LOVE');
    expectRoute('오래갈 수 있는 사이인지 봐주세요.', 'LOVE');
  });
});

describe('REUNION — reconnection, without requiring the word 재회', () => {
  it('an ended relationship the person is considering resuming', () => {
    expectRoute('헤어진 지 반년 됐는데 다시 연락해봐도 될까요?', 'REUNION');
    expectRoute('이별을 제 입으로 꺼냈던 게 두고두고 마음에 남습니다. 되돌릴 수 있을는지요?', 'REUNION');
    expectRoute('여기서 붙잡아 보는 게 나을지 정리하는 게 나을지 모르겠습니다.', 'REUNION');
  });

  it('REUNION outranks LOVE — resuming is a different judgment from starting', () => {
    expectTopic('헤어진 사람과 다시 만나게 될 인연일까요?', '재회');
  });
});

describe('CHANGE — relocation and life transition', () => {
  it('relocation', () => {
    expectRoute('전세 계약이 곧 끝나는데 내년 봄에 옮기는 게 나을까요?', 'CHANGE');
    expectRoute('다 정리하고 시골로 내려가는 것과 여기서 버티는 것 중 어느 쪽이 나을까요?', 'CHANGE');
  });

  it('a transition that is not business, career or relationship', () => {
    expectRoute('환경을 바꾸면 지금 답답한 게 풀릴까요?', 'CHANGE');
    expectRoute('요즘 사는 게 제자리걸음 같아서 뭔가 크게 바꿔보고 싶습니다.', 'CHANGE');
  });

  it('a housing question that mentions a lease renewal is still a housing question', () => {
    expectTopic('지금 사는 곳에 재계약을 할지 새 동네로 옮길지 고민입니다.', '이사');
  });
});

describe('TIMING — the question MODE never replaces the subject axis', () => {
  it('a subject asked about in time keeps its subject axis, and carries TIMING as the mode', () => {
    const q = '이직은 언제 하는 게 좋을까요?';
    expectTopic(q, '이직');            // subject survives …
    expect(resolveQuestionIntent(q)).toBe('TIMING'); // … and the mode is carried separately
    expect(classifyTimingQuestion(q)).toBe(true);
    expect(routedDomain(q)).not.toBe('TIMING');
  });

  it('the same holds across every subject family', () => {
    expectRoute('사업을 확장하기 좋은 시기는 언제일까요?', 'BUSINESS');
    expectRoute('결혼 시기를 언제로 잡으면 좋을까요?', 'LOVE');
    expectRoute('헤어진 사람에게 다시 연락할 시기가 언제쯤일까요?', 'REUNION');
    expectRoute('집을 옮기기 좋은 시점은 언제인가요?', 'CHANGE');
  });

  it('TIMING is the axis only when the PERIOD ITSELF is what is being asked', () => {
    expectRoute('올해는 저한테 어떤 흐름인가요?', 'TIMING');
    expectRoute('제 살면서 지금이 어떤 구간에 해당하나요?', 'TIMING');
    expectRoute('앞으로 두 해 동안 어느 쪽에 힘을 실으면 좋을까요?', 'TIMING');
    expectRoute('지금이 밀어붙일 때인지 쉬어갈 때인지 헷갈립니다.', 'TIMING');
  });

  it('a period ask outranks a generic "something should change" ask', () => {
    expectTopic('가장 크게 달라지는 시기가 있다면 언제쯤일까요?', '시기');
  });
});

describe('MULTI-INTENT — the primary asked proposition wins, not the first keyword', () => {
  it('the final clause carries the decision object', () => {
    // 승진 (CAREER) and 이직 both appear first; the question asked is whether to stay.
    const q = '승진 가능성도 있는데 이직 제안도 왔어요. 지금 회사에 남는 게 나을까요?';
    expectRoute(q, 'CAREER');
  });

  it('narration names the situation; the focus clause names the question', () => {
    // The money is the situation, the store decision is the question.
    expectRoute('통장에 돈이 얼마 없습니다. 그래도 매장을 하나 더 내는 게 맞을까요?', 'BUSINESS');
  });

  it('a subject named anywhere outranks a bare "when" or "what should change" ask', () => {
    // The focus asks about a period; the proposition is still the reunion.
    expectRoute('헤어진 지 반년 됐고 아직 연락은 없습니다. 다시 마음이 닿을 시기가 오기는 할까요?', 'REUNION');
    // The focus asks what to change; the proposition is still the job search.
    expectRoute('면접을 여러 번 봤는데 계속 떨어집니다. 제가 뭘 바꿔야 할까요?', 'CAREER');
  });
});

describe('GENERAL — reserved for genuine ambiguity', () => {
  it('a question naming no part of life this product has an axis for stays 전반', () => {
    expectTopic('제가 어떤 사람인지 궁금합니다.', '전반');
    expectTopic('그냥 한번 봐주세요.', '전반');
    expect(classifyConsultationDomain('')).toBe('전반');
  });

  it('an under-specified reference genuinely cannot be routed from one turn alone', () => {
    // "연락" with no named counterpart could be to anyone. In a real conversation the previous turn's domain
    // is carried server-side (buildServerConsultation's carriedDomain); in isolation this is honestly 전반.
    expectTopic('지금 연락하는 게 나을까요, 조금 더 시간을 두는 게 나을까요?', '전반');
  });

  it('length alone never collapses a classifiable question to 전반', () => {
    const long = '제가 지금 다니는 곳은 사람들도 괜찮고 배우는 것도 많은데, 몇 년을 봐도 제 자리가 크게 달라질 것 '
      + '같지가 않습니다. 부모님은 안정적인 곳에 계속 있으라고 하시고 친구들은 늦기 전에 움직이라고 합니다. '
      + '여러 이야기를 듣다 보니 저도 판단이 잘 안 서는데, 이 회사에 계속 남는 게 저한테 맞는 선택일까요?';
    expect(classifyConsultationDomain(long)).not.toBe('전반');
    expectRoute(long, 'CAREER');
  });
});

describe('router internals stay consistent with the real routing tables', () => {
  it('every subject label the classifier can emit routes to a judge domain, except the declared unjudged set', () => {
    // The classifier declares UNJUDGED_SUBJECTS locally so it stays a pure module with no dependency on the
    // judge registry. This is the test that keeps that declaration honest: if a future map change gives one
    // of them an axis (or takes one away), this fails instead of silently re-opening the GENERAL fail-open.
    const UNJUDGED: ConsultationDomain[] = ['건강', '관계', '계약'];
    const PROBE: Record<Exclude<ConsultationDomain, '전반'>, string> = {
      사업: '지금 하는 사업을 더 키워도 될까요?',
      창업: '창업을 해도 괜찮을까요?',
      이직: '이직을 해도 될까요?',
      직업: '지금 직장에서 승진할 수 있을까요?',
      재물: '올해 수입이 늘어날까요?',
      결혼: '결혼을 해도 될까요?',
      연애: '새로운 인연을 만날 수 있을까요?',
      재회: '예전에 헤어진 사람과 다시 이어질 수 있을까요?',
      관계: '인간관계가 요즘 힘듭니다.',
      건강: '건강이 걱정입니다.',
      시험: '시험에 합격할 수 있을까요?',
      이사: '이사를 해도 될까요?',
      계약: '이 계약을 체결해도 될까요?',
      변화: '환경을 바꾸면 좀 나아질까요?',
      시기: '올해는 저한테 어떤 흐름인가요?',
    };
    for (const [label, question] of Object.entries(PROBE) as [ConsultationDomain, string][]) {
      expect(classifyConsultationDomain(question)).toBe(label); // the probe really exercises that label …
      const routed = routedDomain(question);
      if (UNJUDGED.includes(label)) expect(routed).toBeNull();
      else expect(routed).not.toBeNull(); // … and every judged label reaches a real consultation domain
    }
  });

  it('the persisted-decision allowlist covers every label the classifier can emit', async () => {
    // A stored decision carrying a label decisionMeta's parser rejects fails closed as malformed history, so
    // a routing label added without the allowlist would silently break follow-ups on the new axes.
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const src = readFileSync(resolve(process.cwd(), 'src/features/chat/server/decisionMeta.ts'), 'utf8');
    for (const label of ['변화', '시기']) expect(src).toContain(`'${label}'`);
  });
});

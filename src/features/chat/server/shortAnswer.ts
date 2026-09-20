// 짧은 답 — **조립기가 문장을 정하고, 모델은 말투만 다듬는다** (2026-09-19, 지시서 PART 1·2).
//
// 상담은 짧은 대화, 리포트는 자세한 문서. 이 모듈은 짧은 대화 쪽이다(200~350자, 성향 → 이번 시기 → 어떻게 → 되묻기).
// 자세한 내용(결론·근거·좋은 흐름·조심할 점·행동)은 지금처럼 조립되어 접힌 칸과 리포트로 간다 — 버리지 않는다.
//
// 흐름
//   1) 조립기 원문 S 를 만든다 — 성향 한 줄 · 시기를 붙인 결론 · 행동 경계 · 서버가 고른 되묻기
//   2) S 가 모델로 고칠 수 없는 이유로 이미 검사에 걸리면(성향 없음 · 축 둘 · 길이 크게 벗어남 …) 모델을 부르지 않는다
//   3) 다듬을 수 있는 문장만 모델에 보낸다(인과·행동 지시·따옴표 문장 제외 — `isRewritable`)
//   4) 문장마다 4중 검사(`verifyRewrite`) + 답 전체 검사(`checkAnswer`). 하나라도 걸리면 **재생성 1회**
//   5) 그래도 걸리거나 모델이 답을 못 주면 **S 를 그대로** 낸다 — 사용자가 답을 못 받는 일은 없다
//
// CTO 판정(2026-09-19 속도): 추론 low · 재생성 1회까지 · 먼저 보여 주고 뒤에서 다듬기 금지 · 출력 상한으로 꼬리 자르기 금지.
// 추론 강도·출력 상한은 호출하는 Edge 가 정한다. 이 모듈은 **몇 번 부르는지와 무엇을 내보내는지**만 정한다.
import type { LLMMessage } from '@/features/chat/types/chatArchitecture';

import { allAskBacks, pickAskBack, type AskBackDomain } from './askBackPrompts';
import {
  ANSWER_MAX_CHARS, ANSWER_MIN_CHARS, MAX_ANSWER_ATTEMPTS, checkAnswer, isCautionRequest, type AnswerCheckKey,
} from './consultationAnswerGuard';
import { isRewritable, splitSentences, verifyRewrite, type RewriteFailureKind } from './rewriteGuard';
import type { ConsultationDomain } from './consultationDomain';
import type { ResolvedTemporalContext } from './serverConsultationTypes';

export const SHORT_ANSWER_VERSION = 'short-answer@1.0.0';

// ── 1) 조립기 원문 ────────────────────────────────────────────────────────────

export type PeriodWord = '이번 달' | '올해' | '내년';

/**
 * 답을 어느 시기로 말하나. **"이번 달"·"올해" 수준까지만** 쓴다(CTO 판정 — 근거 블록에 일진·초순/중순/하순이 없다).
 * 질문이 시기를 짚지 않았으면 "이번 달" 이다 — 판단은 접수 시각의 흐름으로 선다
 * (기존 「시기」 칸도 "이 판단은 2026년 9월 흐름을 기준으로 본 것" 이라고 말한다).
 * 이번 달·올해·내년이 아닌 시기를 짚었으면 null — 없는 말을 붙이지 않는다.
 */
export function periodWordFor(ctx: Pick<ResolvedTemporalContext, 'referenceYear' | 'referenceMonth' | 'resolvedTargets'>): PeriodWord | null {
  const targets = ctx.resolvedTargets ?? [];
  if (targets.length === 0) return '이번 달';
  const year = ctx.referenceYear;
  if (year == null) return null;
  if (ctx.referenceMonth != null && targets.includes(year * 100 + ctx.referenceMonth)) return '이번 달';
  if (targets.includes(year)) return '올해';
  if (targets.includes(year + 1)) return '내년';
  return null;
}

const ASK_BACK_DOMAIN: Partial<Record<ConsultationDomain, AskBackDomain>> = {
  사업: 'WORK', 창업: 'WORK', 이직: 'WORK', 직업: 'WORK', 계약: 'WORK',
  재물: 'MONEY',
  결혼: 'RELATION', 연애: 'RELATION', 재회: 'RELATION', 관계: 'RELATION',
  건강: 'HEALTH',
  이사: 'MOVE', 변화: 'MOVE',
};
export const askBackDomainOf = (d: ConsultationDomain): AskBackDomain => ASK_BACK_DOMAIN[d] ?? 'GENERAL';

/** 직전 답에서 쓴 되묻기 — 같은 것이 연속으로 나오지 않게 한다(PART 2-4). 대화 기록에서 표의 문구를 찾는다. */
export function previousAskBackIn(lastAssistantText: string | null | undefined): string | null {
  if (!lastAssistantText) return null;
  return allAskBacks().find((q) => lastAssistantText.includes(q)) ?? null;
}

/** 행동 지시는 다듬지 않는다. 대신 합쇼체 명령(-십시오)만 해요체 명령(-세요)으로 바꾼다 — 뜻이 같은 규칙 변환이다. */
export const politeImperative = (sentence: string): string => sentence.replace(/십시오(?=[.!]?$)/, '세요');

export type ShortAnswerSentence = { text: string; rewritable: boolean };
export type ShortAnswerSource = { sentences: ShortAnswerSentence[]; askBack: string };

/** 해요체는 합쇼체보다 조금 짧다. 원문이 이 폭 안이면 다듬은 뒤 들어올 수 있다. */
const SOURCE_LENGTH_SLACK = 30;

// 짧은 답에 **넣지 않는** 문장 — 근거는 접힌 칸에만 둔다(지시서 §2-1 "전문 용어 본문 노출 금지").
const DISCIPLINE_NAME = /(명리|자미두수|기문둔갑|기문|사주)/;
/** 판단 보류 문장이 인용하는 사용자 질문(`buildDeclinedSummary` 의 범위 구절). 대화 안이라 없어도 뜻이 같다. */
const QUOTED_SCOPE_ANYWHERE = /"[^"]*"\s*에\s*대해서는\s*/g;
const stems = (s: string): Set<string> => new Set((s.match(/[가-힣]{2,}/g) ?? []).map((w) => w.slice(0, 2)));
/** 앞 문장이 이미 한 말인가 — 결론 둘째 문장과 행동 경계가 같은 지시를 되풀이하는 일이 잦다(말뭉치 실측). */
function repeats(sentence: string, earlier: readonly string[]): boolean {
  const a = stems(sentence);
  if (a.size === 0) return false;
  return earlier.some((e) => {
    const b = stems(e);
    let hit = 0;
    for (const x of a) if (b.has(x)) hit += 1;
    return hit / Math.min(a.size, b.size || 1) >= 0.6;
  });
}

export function buildShortAnswerSource(input: {
  disposition: string | null;
  /** 이미 배달되는 결론(`coreSummary`) — 긴 답과 **같은 결론**을 말해야 한다. */
  conclusion: string | null;
  /** 결론이 허락하는 행동의 경계(`actionBoundaries[0]`). */
  action: string | null;
  /**
   * 길이가 모자랄 때만 앞에서부터 채우는 설명 — 결론이 무엇을 뜻하는지(`practicalImplications`) · 맺는 말(`closing`).
   * 한 항목이 두 문장이면 **함께** 넣는다(앞 문장만 넣으면 "그래서" 가 끊긴다).
   */
  fillers?: readonly (string | null | undefined)[];
  /** 학문이 직접 쓴 근거 문장(`ConsumerTruth.meaning`) — 짧은 답에서는 뺀다. 접힌 칸에 이미 있다. */
  evidenceStatements?: readonly string[];
  /** 기술 용어 찾기 — `groundedNarrative.technicalTokensIn`. 주입받아 이 모듈이 조립기 전체를 끌고 오지 않게 한다. */
  technicalTokensIn?: (text: string) => readonly string[];
  period: PeriodWord | null;
  domain: ConsultationDomain;
  seed: string | null;
  previousAskBack?: string | null;
}): ShortAnswerSource | null {
  const evidence = new Set((input.evidenceStatements ?? []).flatMap(splitSentences).map((s) => s.replace(/\s+/g, '')));
  const keep = (s: string): boolean =>
    !DISCIPLINE_NAME.test(s)
    && !evidence.has(s.replace(/\s+/g, ''))
    && (input.technicalTokensIn?.(s).length ?? 0) === 0;
  // 인용된 질문은 문장으로 나누기 **전에** 뗀다 — 질문 속 물음표에서 문장이 갈라져 되묻기로 세어진다(말뭉치 실측).
  const conclusion = splitSentences((input.conclusion ?? '').replace(QUOTED_SCOPE_ANYWHERE, '')).filter(keep);
  if (conclusion.length === 0) return null;
  if (input.period) conclusion[0] = `${input.period} 흐름으로 보면, ${conclusion[0]}`;
  const disposition = splitSentences(input.disposition ?? '');
  const action = splitSentences(input.action ?? '').filter(keep);
  const askBack = pickAskBack({
    domain: askBackDomainOf(input.domain), previous: input.previousAskBack ?? null, seed: input.seed,
  });

  // 성향 → 이번 시기(결론) → [설명] → 어떻게 → 되묻기. 앞 문장이 이미 한 말은 뺀다.
  // 조심·확인을 요구하는 문장은 **하나만** 둔다(§2-1 편안함) — 판단 보류 결론의 둘째 문장과 행동 경계가
  // 둘 다 "확인하세요" 인 경우가 잦다(말뭉치 5건). 앞에 온 것을 남긴다.
  // ⚠ 2026-09-21 (CTO 8-3): **명령문은 한 답에 둘까지.** 말뭉치에서 한 답에 "~하세요" 가 셋 나오는 경우가
  //   있었다 — 상담이 아니라 지시서로 읽힌다. 뒤에 오는 셋째 명령문부터 뺀다(앞에 온 것을 남긴다).
  const MAX_IMPERATIVES = 2;
  const assemble = (middle: readonly string[]): string[] => {
    const body: string[] = [];
    let cautioned = false;
    let imperatives = 0;
    for (const s of [...conclusion, ...middle, ...action]) {
      if (repeats(s, body)) continue;
      if (isCautionRequest(s)) {
        if (cautioned) continue;
        cautioned = true;
      }
      if (!isRewritable(s)) {
        // 다듬지 않는 문장 = 행동 지시(명령문). 셋째부터는 넣지 않는다.
        if (imperatives >= MAX_IMPERATIVES) continue;
        imperatives += 1;
      }
      body.push(s);
    }
    return [...disposition, ...body];
  };
  // 설명은 **모자랄 때만** 채운다. 짧은 대화가 목적이므로 이미 200자를 넘으면 더하지 않는다.
  let middle: string[] = [];
  for (const unit of input.fillers ?? []) {
    if (joinAnswer(assemble(middle), askBack).length >= ANSWER_MIN_CHARS) break;
    const sentences = splitSentences(unit ?? '');
    if (sentences.length === 0 || !sentences.every(keep)) continue;
    const next = [...middle, ...sentences];
    if (joinAnswer(assemble(next), askBack).length > ANSWER_MAX_CHARS + SOURCE_LENGTH_SLACK) continue;
    middle = next;
  }
  const sentences = assemble(middle)
    .map((text) => (isRewritable(text) ? { text, rewritable: true } : { text: politeImperative(text), rewritable: false }));
  return { sentences, askBack };
}

const joinAnswer = (sentences: readonly string[], askBack: string): string => [...sentences, askBack].join(' ');

// ── 2) 모델에게 주는 일 ────────────────────────────────────────────────────────

/** 모델은 다듬기만 한다. 규칙은 검사기가 다시 본다 — 여기 적힌 것을 믿고 통과시키지 않는다. */
export const REWRITE_INSTRUCTION = [
  '받은 문장들의 **말투만** 바꿔 주십시오. 상담가가 마주 앉아 편하게 말하듯이.',
  '· "~해요 / ~거든요 / ~이에요" 로 끝내십시오. "~습니다 / ~입니다" 를 쓰지 마십시오.',
  '· **내용을 더하거나 빼지 마십시오.** 새 낱말·숫자·시기를 넣지 말고, 원래 있던 낱말도 빼지 마십시오.',
  '· 낱말 순서를 바꾸지 마십시오.',
  '· "않다·못하다·말다·없다" 같은 부정과 "~수 있다·~편" 같은 추측은 그대로 두십시오.',
  '· "그래서·그러니·때문에" 같은 잇는 말을 새로 넣지 마십시오. 괄호를 쓰지 마십시오.',
  '· 문장 수와 순서를 그대로 두고, 한 문장을 한 칸에 담아 같은 개수로 돌려주십시오.',
].join('\n');

const REWRITE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: { sentences: { type: 'array', items: { type: 'string' } } },
  required: ['sentences'],
} as const;

/** Responses API `text.format` — 재작성 전용. 상담 8칸 스키마와 따로 둔다. */
export function rewriteResponseFormat(): { type: 'json_schema'; name: string; strict: true; schema: typeof REWRITE_JSON_SCHEMA } {
  return { type: 'json_schema', name: 'deokbun_rewrite', strict: true, schema: REWRITE_JSON_SCHEMA };
}

const HINT: Partial<Record<RewriteFailureKind | AnswerCheckKey | 'PARSE', string>> = {
  NEW_CONTENT_WORD: '원문에 없는 낱말을 넣었습니다.',
  CONTENT_DROPPED: '원문 낱말을 뺐습니다.',
  ORDER_CHANGED: '낱말 순서를 바꿨습니다.',
  NEGATION_CHANGED: '부정 표현이 바뀌었습니다.',
  HEDGE_DROPPED: '"~수 있다·~편" 같은 추측 표현을 뺐습니다.',
  CAUSAL_ADDED: '"그래서" 같은 잇는 말을 새로 넣었습니다.',
  RELATION_CHANGED: '"~면·~니·~지만" 같은 잇는 어미를 바꿨습니다.',
  NUMBER_CHANGED: '숫자나 시기가 바뀌었습니다.',
  SENTENCE_COUNT: '문장 개수가 달라졌습니다.',
  PARSE: '문장 배열을 돌려주지 않았습니다.',
  합쇼체: '"~습니다·~입니다" 로 끝난 문장이 남았습니다.',
  해요체부족: '"~해요" 로 끝나지 않은 문장이 많습니다.',
  보고서말투: '"유리합니다·도움이 됩니다" 같은 보고서 말투가 남았습니다.',
  쉼표이어붙임: '문장이 끝날 자리에 쉼표를 썼습니다.',
  괄호: '괄호를 썼습니다.',
};

export function buildRewriteMessages(sentences: readonly string[], previousProblems: readonly string[] = []): LLMMessage[] {
  const hints = [...new Set(previousProblems.map((k) => HINT[k as keyof typeof HINT]).filter(Boolean))];
  return [
    { role: 'system', content: REWRITE_INSTRUCTION },
    ...(hints.length > 0
      ? [{ role: 'system' as const, content: `지난번 결과에서 고칠 점: ${hints.join(' ')}` }]
      : []),
    { role: 'user', content: JSON.stringify({ sentences }) },
  ];
}

/** 모델 출력 → 문장 배열. 개수가 다르거나 모양이 틀리면 null. 예외를 던지지 않는다. */
export function parseRewriteSentences(raw: string, expected: number): string[] | null {
  try {
    const parsed = JSON.parse(raw) as { sentences?: unknown };
    const list = parsed?.sentences;
    if (!Array.isArray(list) || list.length !== expected) return null;
    if (!list.every((s) => typeof s === 'string' && s.trim().length > 0)) return null;
    return list.map((s) => (s as string).trim());
  } catch {
    return null;
  }
}

// ── 3) 실현 ───────────────────────────────────────────────────────────────────

export type ShortAnswerDiagnostics = {
  delivered: 'REWRITE' | 'SOURCE';
  /** SOURCE 인 이유. REWRITE 면 없다. */
  reason?: 'NO_REWRITER' | 'NOTHING_TO_REWRITE' | 'SOURCE_CHECK_FAILED' | 'LLM_UNAVAILABLE' | 'CHECK_FAILED';
  /** 모델을 부른 횟수 (0~2). */
  attempts: number;
  /** 4중 검사에서 걸린 횟수 — 시도 전체 합. PART 1-4 "어느 검사에서 몇 번" */
  rewriteFailures: Partial<Record<RewriteFailureKind | 'PARSE', number>>;
  /** 답 검사에서 걸린 횟수 — 시도 전체 합. */
  answerFailures: Partial<Record<AnswerCheckKey, number>>;
  /** 모델을 부르기 전 원문이 이미 걸린 항목. */
  sourceFailures?: AnswerCheckKey[];
  chars: number;
};

export type ShortAnswerResult = { text: string; diagnostics: ShortAnswerDiagnostics };

/** 말투로는 고칠 수 없는 항목 — 원문이 걸리면 모델을 불러도 소용없다. */
const TONE_FIXABLE: ReadonlySet<AnswerCheckKey> = new Set(['합쇼체', '해요체부족', '보고서말투', '쉼표이어붙임', '길이']);
const HAPSYO_END = /(습니다|입니다|합니다|됩니다|십시오)[.!?]?$/;

const bump = <K extends string>(m: Partial<Record<K, number>>, k: K) => { m[k] = (m[k] ?? 0) + 1; };

export async function realizeShortAnswer(
  source: ShortAnswerSource,
  rewrite?: (messages: LLMMessage[]) => Promise<string>,
): Promise<ShortAnswerResult> {
  const original = source.sentences.map((s) => s.text);
  const sourceText = joinAnswer(original, source.askBack);
  const diag: ShortAnswerDiagnostics = { delivered: 'SOURCE', attempts: 0, rewriteFailures: {}, answerFailures: {}, chars: sourceText.length };
  const done = (reason: NonNullable<ShortAnswerDiagnostics['reason']>): ShortAnswerResult =>
    ({ text: sourceText, diagnostics: { ...diag, reason } });

  if (!rewrite) return done('NO_REWRITER');
  const targets = source.sentences.map((s, i) => (s.rewritable ? i : -1)).filter((i) => i >= 0);
  if (targets.length === 0) return done('NOTHING_TO_REWRITE');

  // 모델로 못 고치는 원문은 부르지 않는다 — 결과가 같고(원문이 나간다) 시간과 돈만 든다.
  const pre = checkAnswer(sourceText);
  const unfixable = pre.failures.map((f) => f.key).filter((k) => !TONE_FIXABLE.has(k));
  if (sourceText.length < ANSWER_MIN_CHARS || sourceText.length > ANSWER_MAX_CHARS + SOURCE_LENGTH_SLACK) unfixable.push('길이');
  if (source.sentences.some((s) => !s.rewritable && HAPSYO_END.test(s.text))) unfixable.push('합쇼체');
  if (unfixable.length > 0) {
    diag.sourceFailures = [...new Set(unfixable)];
    return done('SOURCE_CHECK_FAILED');
  }

  let problems: string[] = [];
  for (let attempt = 1; attempt <= MAX_ANSWER_ATTEMPTS; attempt += 1) {
    diag.attempts = attempt;
    let raw = '';
    try {
      raw = await rewrite(buildRewriteMessages(targets.map((i) => original[i]), problems));
    } catch {
      raw = '';
    }
    // 제공자 장애 뒤에 다시 부르지 않는다 — 기한을 이미 넘긴 호출을 한 번 더 여는 것은 잘못된 수다(V6).
    if (typeof raw !== 'string' || raw.trim().length === 0) return done('LLM_UNAVAILABLE');

    problems = [];
    const rewritten = parseRewriteSentences(raw, targets.length);
    if (!rewritten) {
      bump(diag.rewriteFailures, 'PARSE');
      problems.push('PARSE');
      continue;
    }
    const candidate = [...original];
    targets.forEach((i, k) => {
      const verdict = verifyRewrite(original[i], rewritten[k]);
      if (verdict.ok) candidate[i] = rewritten[k];
      for (const f of verdict.failures) { bump(diag.rewriteFailures, f.kind); problems.push(f.kind); }
    });
    // 하나라도 걸리면 이 시도는 실패다(§1-3). 걸린 문장만 원문으로 되돌려 섞어 내지 않는다 —
    // 합쇼체와 해요체가 섞인 답은 검사를 통과하지 못하고, 통과하더라도 한 사람의 말로 읽히지 않는다.
    if (problems.length > 0) continue;
    const text = joinAnswer(candidate, source.askBack);
    const check = checkAnswer(text);
    for (const f of check.failures) { bump(diag.answerFailures, f.key); problems.push(f.key); }
    if (check.ok) return { text, diagnostics: { ...diag, delivered: 'REWRITE', chars: text.length } };
  }
  return done('CHECK_FAILED');
}

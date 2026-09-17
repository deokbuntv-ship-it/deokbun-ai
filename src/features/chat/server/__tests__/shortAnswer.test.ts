// 짧은 답 — 조립 · 재작성 · 재생성 1회 · 원문 대체 (2026-09-19, 지시서 PART 1·2 · CTO 속도 판정).
// 가짜 재작성기로 **몇 번 부르는지 · 무엇이 나가는지**를 못 박는다. LLM 0콜.
import { checkAnswer } from '@/features/chat/server/consultationAnswerGuard';
import {
  buildRewriteMessages, buildShortAnswerSource, parseRewriteSentences, periodWordFor, politeImperative,
  previousAskBackIn, realizeShortAnswer, rewriteResponseFormat, type ShortAnswerSource,
} from '@/features/chat/server/shortAnswer';
import { mergeOpenAiUsage } from '@/features/chat/server/edgeDiagnostics';

// 조립기가 실제로 내는 모양(말뭉치 OWN-2 · B84-006 에서 가져왔다).
const SOURCE: ShortAnswerSource = {
  sentences: [
    { text: '버티면서 중심을 잡는 편이에요.', rewritable: true },
    { text: '이번 달 흐름으로 보면, 자리·직업에 대해서는 열려 있는 쪽으로 봅니다.', rewritable: true },
    { text: '이동에서 걸리는 부분은 시간이 지난다고 저절로 풀리는 종류가 아닙니다.', rewritable: true },
    { text: '그 부분을 먼저 정리해 두셔야 방향이 그대로 유지됩니다.', rewritable: true },
    { text: '자리·직업은 지금 움직이셔도 되는 쪽입니다.', rewritable: true },
    { text: '다만 한 번에 크게 벌리기보다, 되돌릴 수 있는 크기에서 시작하세요.', rewritable: false },
  ],
  askBack: '요즘 어떤 일이 제일 손에 안 잡히세요?',
};
const GOOD_REWRITE = [
  '버티면서 중심을 잡는 편이에요.',
  '이번 달 흐름으로 보면, 자리·직업에 대해서는 열려 있는 쪽으로 봐요.',
  '이동에서 걸리는 부분은 시간이 지난다고 저절로 풀리는 종류가 아니에요.',
  '그 부분을 먼저 정리해 두셔야 방향이 그대로 유지돼요.',
  '자리·직업은 지금 움직이셔도 되는 쪽이에요.',
];
const reply = (sentences: string[]) => JSON.stringify({ sentences });
const sourceText = () => [...SOURCE.sentences.map((s) => s.text), SOURCE.askBack].join(' ');

function fakeRewriter(replies: string[]) {
  const calls: { messages: { role: string; content: string }[] }[] = [];
  const fn = async (messages: { role: string; content: string }[]) => {
    calls.push({ messages });
    return replies[calls.length - 1] ?? '';
  };
  return { fn, calls };
}

describe('재작성 — 통과하면 다듬은 문장이 나간다', () => {
  it('첫 시도가 4중 검사와 답 검사를 모두 통과하면 그대로 낸다 (모델 1회)', async () => {
    const r = fakeRewriter([reply(GOOD_REWRITE)]);
    const out = await realizeShortAnswer(SOURCE, r.fn);
    expect(out.diagnostics).toMatchObject({ delivered: 'REWRITE', attempts: 1 });
    expect(out.text).toContain('유지돼요.');
    expect(out.text.endsWith(SOURCE.askBack)).toBe(true); // 되묻기는 서버 문장 그대로, 마지막
    expect(checkAnswer(out.text).ok).toBe(true);
    // 다듬을 수 있는 문장만 보냈다 — 행동 지시(시작하세요)는 모델에 가지 않는다.
    const sent = JSON.parse(r.calls[0].messages.at(-1)!.content).sentences as string[];
    expect(sent).toHaveLength(5);
    expect(sent.join(' ')).not.toContain('시작하세요');
  });

  it('⚠ 모델에 가는 것은 조립기 문장뿐이다 — 질문·근거 블록·대화가 없다', async () => {
    const r = fakeRewriter([reply(GOOD_REWRITE)]);
    await realizeShortAnswer(SOURCE, r.fn);
    const all = r.calls[0].messages.map((m) => m.content).join('\n');
    expect(all).not.toMatch(/계산 근거|점사 판정|명식|질문:/);
  });
});

describe('재생성은 1회까지 — 그다음은 조립기 원문 (CTO 판정 2026-09-19)', () => {
  it('⚠ 첫 시도가 새 사실을 넣으면 한 번 더 부르고, 두 번째가 통과하면 그것을 낸다', async () => {
    const attack = [...GOOD_REWRITE];
    attack[4] = '자리·직업은 지금 움직이셔도 되는 쪽이고 사업이 곧 크게 성장해요.';
    const r = fakeRewriter([reply(attack), reply(GOOD_REWRITE)]);
    const out = await realizeShortAnswer(SOURCE, r.fn);
    expect(out.diagnostics).toMatchObject({ delivered: 'REWRITE', attempts: 2 });
    expect(out.diagnostics.rewriteFailures.NEW_CONTENT_WORD).toBe(1);
    expect(out.text).not.toContain('성장');
    // 두 번째 요청에는 고칠 점이 붙는다.
    expect(r.calls[1].messages.map((m) => m.content).join('\n')).toMatch(/원문에 없는 낱말/);
  });

  it('⚠ 두 번 다 걸리면 조립기 원문을 그대로 낸다 — 세 번째는 부르지 않는다', async () => {
    const attack = [...GOOD_REWRITE];
    attack[2] = '이동에서 걸리는 부분은 시간이 지나면 저절로 풀리는 종류예요.'; // 부정 삭제
    const r = fakeRewriter([reply(attack), reply(attack), reply(GOOD_REWRITE)]);
    const out = await realizeShortAnswer(SOURCE, r.fn);
    expect(r.calls).toHaveLength(2);
    expect(out.diagnostics).toMatchObject({ delivered: 'SOURCE', reason: 'CHECK_FAILED', attempts: 2 });
    expect(out.diagnostics.rewriteFailures.NEGATION_CHANGED).toBe(2);
    expect(out.text).toBe(sourceText());
  });

  it('⚠ 한 문장만 걸려도 그 시도 전체가 실패다 — 걸린 문장만 원문으로 섞어 내지 않는다', async () => {
    const attack = [...GOOD_REWRITE];
    attack[1] = '이번 달 흐름으로 보면, 자리·직업에 대해서는 반드시 열려 있는 쪽이에요.';
    const r = fakeRewriter([reply(attack), reply(attack)]);
    const out = await realizeShortAnswer(SOURCE, r.fn);
    expect(out.diagnostics.delivered).toBe('SOURCE');
    expect(out.text).toBe(sourceText());
  });

  it('⚠ 4중 검사는 통과했지만 답 검사(말투)에 걸리면 역시 재생성 → 원문', async () => {
    const stiff = GOOD_REWRITE.map((s) => s.replace('유지돼요.', '유지됩니다.').replace('쪽이에요.', '쪽입니다.').replace('아니에요.', '아닙니다.').replace('봐요.', '봅니다.'));
    const r = fakeRewriter([reply(stiff), reply(stiff)]);
    const out = await realizeShortAnswer(SOURCE, r.fn);
    expect(out.diagnostics).toMatchObject({ delivered: 'SOURCE', reason: 'CHECK_FAILED', attempts: 2 });
    expect(out.diagnostics.answerFailures.합쇼체).toBe(2);
  });

  it('모양이 틀린 출력(개수 다름·JSON 아님)은 PARSE 로 세고 재생성한다', async () => {
    const r = fakeRewriter(['{"sentences":["하나"]}', reply(GOOD_REWRITE)]);
    const out = await realizeShortAnswer(SOURCE, r.fn);
    expect(out.diagnostics).toMatchObject({ delivered: 'REWRITE', attempts: 2 });
    expect(out.diagnostics.rewriteFailures.PARSE).toBe(1);
  });
});

describe('모델을 부르지 않는 경우', () => {
  it('⚠ 제공자 장애(빈 응답) 뒤에는 다시 부르지 않고 원문을 낸다 (V6 — 기한 넘긴 호출을 또 열지 않는다)', async () => {
    const r = fakeRewriter(['', reply(GOOD_REWRITE)]);
    const out = await realizeShortAnswer(SOURCE, r.fn);
    expect(r.calls).toHaveLength(1);
    expect(out.diagnostics).toMatchObject({ delivered: 'SOURCE', reason: 'LLM_UNAVAILABLE' });
  });

  it('⚠ 재작성기가 예외를 던져도 답은 나간다', async () => {
    const out = await realizeShortAnswer(SOURCE, async () => { throw new Error('boom'); });
    expect(out.diagnostics).toMatchObject({ delivered: 'SOURCE', reason: 'LLM_UNAVAILABLE' });
    expect(out.text).toBe(sourceText());
  });

  it('⚠ 원문이 말투로는 고칠 수 없는 이유로 걸리면(성향 없음) 부르지 않는다 — 결과가 같고 돈만 든다', async () => {
    const noDisposition = { ...SOURCE, sentences: SOURCE.sentences.slice(1) };
    const r = fakeRewriter([reply(GOOD_REWRITE.slice(1))]);
    const out = await realizeShortAnswer(noDisposition, r.fn);
    expect(r.calls).toHaveLength(0);
    expect(out.diagnostics).toMatchObject({ delivered: 'SOURCE', reason: 'SOURCE_CHECK_FAILED' });
    expect(out.diagnostics.sourceFailures).toContain('성향없음');
  });

  it('재작성기가 없으면(테스트·구 호출자) 원문', async () => {
    expect((await realizeShortAnswer(SOURCE)).diagnostics).toMatchObject({ delivered: 'SOURCE', reason: 'NO_REWRITER', attempts: 0 });
  });
});

describe('조립기 원문 만들기', () => {
  const base = {
    disposition: '버티면서 중심을 잡는 편이에요.',
    conclusion: '부딪힘은 지금 크게 벌일 자리는 아닙니다. 다만 아주 막혀 있는 것은 아니라, 범위를 좁히면 여지는 있습니다.',
    action: '부딪힘은 미루시는 쪽이되, 범위를 좁혀서 보십시오.',
    period: '이번 달' as const,
    domain: '관계' as const,
    seed: '요즘 사람 관계가 힘든데 어떨까요?',
  };

  it('성향 → 시기를 붙인 결론 → 행동 → 되묻기 순서다', () => {
    const src = buildShortAnswerSource(base)!;
    const text = src.sentences.map((s) => s.text);
    expect(text[0]).toBe(base.disposition);
    expect(text[1].startsWith('이번 달 흐름으로 보면, ')).toBe(true);
    expect(text.at(-1)).toBe('부딪힘은 미루시는 쪽이되, 범위를 좁혀서 보세요.'); // -십시오 → -세요 (다듬지 않음)
    expect(src.sentences.at(-1)!.rewritable).toBe(false);
    expect(['혹시 요즘 누가 제일 신경 쓰이세요?', '그 사람과는 주로 어디서 부딪히세요?', '요즘 누구와 이야기가 제일 안 통하세요?', '언제부터 그렇게 느끼셨어요?']).toContain(src.askBack);
  });

  it('⚠ 전문 근거 문장·학문 이름·기술 용어는 짧은 답에 넣지 않는다 (접힌 칸에만)', () => {
    const src = buildShortAnswerSource({
      ...base,
      action: '방향은 그대로 두시고 시점만 나눠 보십시오. 타고난 배우자 자리 자체가 흔들리는 구조입니다.',
      conclusion: `${base.conclusion} 다만 이 판단은 자미두수 한 곳에서 나온 것이라, 그만큼의 무게로 보시면 됩니다.`,
      evidenceStatements: ['타고난 배우자 자리 자체가 흔들리는 구조입니다.'],
      fillers: ['지금의 큰 흐름이 원국 년주 반합과 맞물려 풀립니다.'],
      technicalTokensIn: (t) => (t.match(/원국|년주/g) ?? []),
    })!;
    const text = src.sentences.map((s) => s.text).join(' ');
    expect(text).not.toContain('배우자 자리');
    expect(text).not.toContain('자미두수');
    expect(text).not.toContain('원국');
  });

  it('⚠ 인용된 사용자 질문은 뗀다 — 질문 속 물음표가 되묻기로 세어지고, 사용자 글이 모델에 들어간다', () => {
    const src = buildShortAnswerSource({
      ...base,
      conclusion: '"올해 저한테 어떤 흐름이 오나요? "에 대해서는 체계 간에 서로 다른 신호가 겹쳐 있어 현재 근거만으로 한쪽 방향을 확정하기 어렵습니다.',
    })!;
    const text = src.sentences.map((s) => s.text).join(' ');
    expect(text).not.toContain('"');
    expect(text).not.toContain('?');
    expect(text).toContain('이번 달 흐름으로 보면, 체계 간에');
  });

  it('⚠ 조심·확인 요구는 하나만 둔다, 앞 문장과 같은 말은 뺀다', () => {
    const src = buildShortAnswerSource({
      ...base,
      conclusion: '방향과 시점을 같은 것으로 묶지 마시고 나눠서 보십시오. 되돌릴 수 있는 범위에서 준비·확인·검증하세요.',
      action: '방향은 그대로 두시고 시점만 나눠 보십시오. 확인된 부분을 먼저 챙기십시오.',
    })!;
    const text = src.sentences.map((s) => s.text);
    expect(text.filter((s) => /확인/.test(s))).toHaveLength(1);
    expect(text.filter((s) => /나눠/.test(s))).toHaveLength(1);
  });

  it('설명은 200자가 모자랄 때만 채운다', () => {
    const long = buildShortAnswerSource({ ...base, fillers: ['시점에 따라 같은 선택의 결과가 달라집니다. 방향을 바꾸실 것이 아니라, 언제 움직이실지를 따로 정하십시오.'] })!;
    const joined = [...long.sentences.map((s) => s.text), long.askBack].join(' ');
    expect(joined.length).toBeGreaterThanOrEqual(200);
    const already = buildShortAnswerSource({
      ...base,
      conclusion: `${base.conclusion} 지금은 되돌릴 수 있는 범위 밖으로 나가지 않는 것까지가 근거로 말씀드릴 수 있는 선입니다. 서로 다른 두 가지가 함께 걸려 있습니다.`,
      fillers: ['시점에 따라 같은 선택의 결과가 달라집니다.'],
    })!;
    expect(already.sentences.map((s) => s.text).join(' ')).not.toContain('시점에 따라');
  });

  it('결론이 비면 짧은 답을 만들지 않는다', () => {
    expect(buildShortAnswerSource({ ...base, conclusion: '' })).toBeNull();
  });
});

describe('시기 · 되묻기 · 모양', () => {
  it('시기는 이번 달·올해·내년 수준까지만 — 질문이 짚지 않았으면 이번 달', () => {
    const ctx = { referenceYear: 2026, referenceMonth: 9 };
    expect(periodWordFor({ ...ctx, resolvedTargets: [] })).toBe('이번 달');
    expect(periodWordFor({ ...ctx, resolvedTargets: [202609] })).toBe('이번 달');
    expect(periodWordFor({ ...ctx, resolvedTargets: [2026] })).toBe('올해');
    expect(periodWordFor({ ...ctx, resolvedTargets: [2027] })).toBe('내년');
    expect(periodWordFor({ ...ctx, resolvedTargets: [2029] })).toBeNull(); // 없는 말을 붙이지 않는다
  });

  it('직전 답의 되묻기를 대화 기록에서 찾는다 — 연속으로 같은 것을 피하려고', () => {
    expect(previousAskBackIn('… 요즘 어떤 일이 제일 손에 안 잡히세요?\n\n[결론] …')).toBe('요즘 어떤 일이 제일 손에 안 잡히세요?');
    expect(previousAskBackIn('되묻기 없는 예전 답')).toBeNull();
    const a = buildShortAnswerSource({ disposition: null, conclusion: '가. ', action: null, period: null, domain: '직업', seed: 's' })!;
    const b = buildShortAnswerSource({ disposition: null, conclusion: '가. ', action: null, period: null, domain: '직업', seed: 's', previousAskBack: a.askBack })!;
    expect(b.askBack).not.toBe(a.askBack);
  });

  it('출력 모양 — 엄격 JSON 스키마 · 개수가 다르면 null', () => {
    expect(rewriteResponseFormat()).toMatchObject({ type: 'json_schema', strict: true });
    expect(parseRewriteSentences('{"sentences":["가.","나."]}', 2)).toEqual(['가.', '나.']);
    expect(parseRewriteSentences('{"sentences":["가."]}', 2)).toBeNull();
    expect(parseRewriteSentences('아님', 1)).toBeNull();
    expect(buildRewriteMessages(['가.'])).toHaveLength(2);
    expect(politeImperative('먼저 확인하십시오.')).toBe('먼저 확인하세요.');
  });
});

describe('사용량 합산 — 요청당 한 줄 (속도 제한 창을 한 상담이 여러 칸 쓰지 않게)', () => {
  it('두 호출의 토큰을 더한다', () => {
    const merged = mergeOpenAiUsage(
      { input_tokens: 11000, output_tokens: 1400, total_tokens: 12400, output_tokens_details: { reasoning_tokens: 300 } },
      { input_tokens: 300, output_tokens: 900, total_tokens: 1200, input_tokens_details: { cached_tokens: 0 }, output_tokens_details: { reasoning_tokens: 700 } },
    );
    expect(merged).toEqual({
      input_tokens: 11300, output_tokens: 2300, total_tokens: 13600,
      input_tokens_details: { cached_tokens: 0 }, output_tokens_details: { reasoning_tokens: 1000 },
    });
  });

  it('다듬기를 부르지 않았으면 긴 답 값 그대로다', () => {
    const only = { input_tokens: 5, output_tokens: 6, total_tokens: 11 };
    expect(mergeOpenAiUsage(only, {})).toEqual(only);
    expect(mergeOpenAiUsage({}, {})).toEqual({});
  });
});

// Premium 근거 전달량 + PART 1 결함 3건 회귀 방지.
//
// 2026-09-02 진단: Premium 은 명리를 쓴다고 하면서 실제로는 오행 하나와 대운 구간만 프롬프트에 넘기고
// 있었다(input 827 토큰, 일반 상담의 1/11). 그 결과 네 사람의 리포트가 서로 바꿔 넣어도 티가 안 났다.
// 이 파일은 그 상태로 되돌아가면 실패한다.
import { createHash } from 'crypto';

import { buildPremiumEvidence, premiumEvidenceLines, PREMIUM_EVIDENCE_MAX_LINES } from '@/features/premium/engine/premiumEvidence';
import { buildPremiumReportPrompt, premiumPromptBlockCount } from '@/features/premium/server/premiumReportPrompt';
import {
  containsForeignScript,
  containsLeakedIdentifier,
  stripLeadingMonthLabel,
  parsePremiumReport,
  buildPremiumReport,
} from '@/features/premium/server/buildPremiumReport';
import type { BirthInfoDraft } from '@/features/consultation';
import type { PremiumMonthOutlook } from '@/features/premium/types';
import type { DigestProvider } from '@/features/interpretation';

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
};
const NOW = Math.floor(Date.UTC(2026, 8, 2, 0, 0, 0) / 1000);

const birth = (over: Partial<BirthInfoDraft>): BirthInfoDraft => ({
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '1', birthDay: '11', birthTimeAccuracy: 'exact', birthHour: '21',
  birthMinute: '15', approximateTimePeriod: null, birthPlace: '청주',
  ...over,
});
// 실제 원가 측정에 쓴 네 명 — 나이·성별·오행이 모두 다르다.
const SUBJECTS = {
  'SUBJ-06': birth({}),
  'SUBJ-07': birth({ gender: 'female', birthYear: '1980', birthMonth: '8', birthDay: '3', birthHour: '18', birthMinute: '30', birthPlace: '광주' }),
  'SUBJ-08': birth({ birthYear: '1970', birthMonth: '12', birthDay: '19', birthHour: '16', birthMinute: '45', birthPlace: '울산' }),
  'SUBJ-01': birth({ birthYear: '2001', birthMonth: '3', birthDay: '14', birthHour: '9', birthMinute: '20', birthPlace: '서울' }),
};

const build = async (b: BirthInfoDraft) => {
  const ev = await buildPremiumEvidence({ birthInfo: b }, { digestProvider, nowEpochSeconds: NOW });
  if (!ev.available) throw new Error(`evidence unavailable: ${ev.reason}`);
  return ev;
};

describe('Premium 근거 전달량 — 827 토큰 시절로 되돌아가지 않는다', () => {
  it('프롬프트에 근거 블록이 최소 4개 들어간다 (원국·대운·세운·12개월)', async () => {
    const ev = await build(SUBJECTS['SUBJ-06']);
    expect(premiumPromptBlockCount(ev)).toBeGreaterThanOrEqual(4);
  });

  it('브리프 분량이 실질적이다 — 근거 블록이 통째로 빠지면 실패한다', async () => {
    for (const [name, b] of Object.entries(SUBJECTS)) {
      const ev = await build(b);
      const brief = buildPremiumReportPrompt(ev)[1].content;
      // 2026-09-02 측정: 네 명 모두 2,413~2,650자 (system 1,390자 별도). 확대 전 브리프는 전체 827토큰이었다.
      expect(`${name}:${brief.length}`).toMatch(/:\d{4,}$/);
      expect(brief.length).toBeGreaterThan(2000);
    }
  });

  it('원국 사실이 실제로 담긴다 — 오행 전체·계절·구성비·원국 관계', async () => {
    const ev = await build(SUBJECTS['SUBJ-07']);
    const brief = buildPremiumReportPrompt(ev)[1].content;
    expect(brief).toContain('오행 개수:');
    expect(brief).toContain('태어난 계절:');
    expect(brief).toContain('겉으로 드러난 힘의 구성비:');
    expect(brief).toContain('속에 깔린 힘의 구성비:');
    expect(brief).toContain('자리별로 속에 품은 것:');
    expect(brief).toContain('타고난 네 기둥 사이의 관계:');
    expect(ev.natal.elementCounts).toHaveLength(5); // 하나만 고르지 않는다
  });

  it('각 달이 자기 구조를 들고 온다 — 12개월이 구별될 수 있는 유일한 재료', async () => {
    const ev = await build(SUBJECTS['SUBJ-08']);
    expect(ev.months).toHaveLength(12);
    const brief = buildPremiumReportPrompt(ev)[1].content;
    for (const m of ev.months) expect(brief).toContain(`${m.year}년 ${m.month}월 —`);
    // 열두 달의 구조 서술이 전부 같으면 모델이 달을 구별할 수 없다.
    const shapes = new Set(ev.months.map((m) => `${m.stemTenGod}|${m.branchTenGod}|${m.harmony.join(',')}|${m.friction.join(',')}`));
    expect(shapes.size).toBeGreaterThanOrEqual(8);
  });

  // V2 는 열두 달 근거의 절반이 합인데도 48줄 전부가 경고로 나갔다. 극성을 라벨로 넘기지 않으면
  // 모델은 모든 관계를 문제로 읽는다. 이 테스트는 그 라벨이 실제로 프롬프트에 들어가는지 본다.
  it('월별 근거가 맞물림/부딪힘으로 갈라져 넘어간다 — 톤 균형의 전제', async () => {
    for (const b of Object.values(SUBJECTS)) {
      const ev = await build(b);
      const harmony = ev.months.reduce((a, m) => a + m.harmony.length, 0);
      const friction = ev.months.reduce((a, m) => a + m.friction.length, 0);
      expect(harmony).toBeGreaterThan(0);
      expect(harmony + friction).toBeGreaterThan(0);
      const brief = buildPremiumReportPrompt(ev)[1].content;
      expect(brief).toContain('맞물림');
      expect(brief).toContain(`맞물림 ${harmony}건, 부딪힘 ${friction}건`);
      // 좋은 달도 무거운 달과 같은 무게로 지목되어야 한다.
      expect(ev.brightMonths.length).toBeGreaterThan(0);
    }
  });

  it('시스템 블록이 톤 규칙과 어휘 반복 금지를 싣는다', async () => {
    const sys = buildPremiumReportPrompt(await build(SUBJECTS['SUBJ-06']))[0].content;
    expect(sys).toContain('열두 달이 전부 경고인 글');
    expect(sys).toContain('4개 이상');
    expect(sys).toContain('3번 넘게 쓰지 마라');
  });

  it('프롬프트 본문에는 자리·관계 전문용어를 넘기지 않는다 (십신 이름만 예외)', async () => {
    for (const b of Object.values(SUBJECTS)) {
      const brief = buildPremiumReportPrompt(await build(b))[1].content;
      for (const term of ['년주', '월주', '일주', '시주', '육합', '반합', '삼합', '방합', '자형', '정기', '중기', '여기']) {
        expect(`${term}:${brief.includes(term)}`).toBe(`${term}:false`);
      }
    }
  });

  it('네 사람의 브리프가 서로 다르다 — 교차 판별의 전제', async () => {
    const briefs = await Promise.all(Object.values(SUBJECTS).map(async (b) => buildPremiumReportPrompt(await build(b))[1].content));
    expect(new Set(briefs).size).toBe(briefs.length);
    // 원국 블록만 떼어 비교해도 서로 달라야 한다(나이·계절·오행이 다르므로).
    const natalBlocks = briefs.map((x) => x.split('【근거 2')[0]);
    expect(new Set(natalBlocks).size).toBe(briefs.length);
  });

});

// V2 의 근거줄은 14줄에 "첫째 기둥(둘째 기둥 안(주된 것)) · …" 같은 3중 괄호를 실어 보냈다. 읽을 수 없고
// 검색도 안 되는 말이었다. V3 의 계약은 상담과 같다: 쉬운 결론이 앞, 전문용어는 뒤 괄호 하나 안.
describe('"왜 이렇게 보나요" — 읽을 수 있는 근거줄', () => {
  // `결론 (근거: …)`. 여는 괄호는 문장 끝의 그것 하나뿐이고, 안에 괄호가 없어야 통과한다.
  const SHAPE = /^[^()]+ \(근거: [^()]+\)$/;

  it('줄 수가 6~8줄이다 (경고 줄이 붙으면 그만큼만 더)', async () => {
    for (const [name, b] of Object.entries(SUBJECTS)) {
      const ev = await build(b);
      const lines = premiumEvidenceLines(ev);
      const warn = ev.temporal.warnings.filter(Boolean).length;
      expect(`${name}:${lines.length - warn}`).toMatch(/:[678]$/);
      expect(lines.length - warn).toBeLessThanOrEqual(PREMIUM_EVIDENCE_MAX_LINES);
    }
  });

  it('모든 줄이 "결론 (근거: …)" 모양이고 괄호가 겹치지 않는다', async () => {
    for (const b of Object.values(SUBJECTS)) {
      for (const l of premiumEvidenceLines(await build(b))) {
        expect(`${l} → ${SHAPE.test(l)}`).toBe(`${l} → true`);
        expect(l.split('(').length - 1).toBe(1); // 괄호 한 겹
      }
    }
  });

  it('한 줄에 나열하는 수치가 5개를 넘지 않는다', async () => {
    for (const b of Object.values(SUBJECTS)) {
      for (const l of premiumEvidenceLines(await build(b))) {
        const anchor = l.slice(l.indexOf('(근거: '));
        expect(`${anchor} → ${(anchor.match(/\d+/g) ?? []).length}`).toMatch(/ → [0-5]$/);
      }
    }
  });

  it('결론이 앞에 온다 — 괄호 앞에 온전한 한국어 문장이 있다', async () => {
    for (const b of Object.values(SUBJECTS)) {
      for (const l of premiumEvidenceLines(await build(b))) {
        const head = l.slice(0, l.indexOf(' (근거: ')).trim();
        expect(head.length).toBeGreaterThan(12);
        expect(head).toMatch(/[다요][.!]?$/); // 서술형으로 끝난다 — 라벨 나열이 아니다
      }
    }
  });

  it('근거줄에는 전문용어를 그대로 쓴다 — 이게 있어야 찾아볼 수 있다', async () => {
    const joined = premiumEvidenceLines(await build(SUBJECTS['SUBJ-06'])).join('\n');
    expect(joined).toMatch(/년주|월주|일주|시주|통근|득령|실령|원국|대운|월운/);
  });
});

describe('PART 1 결함 3건 — 회귀 방지', () => {
  it('[1-1] 월 문장 앞의 연·월 표기를 서버가 걷어낸다', () => {
    expect(stripLeadingMonthLabel('2026년 9월에는 조용합니다.')).toBe('조용합니다.');
    expect(stripLeadingMonthLabel('9월: 조용합니다.')).toBe('조용합니다.');
    expect(stripLeadingMonthLabel('2027년 3월 — 조용합니다.')).toBe('조용합니다.');
    expect(stripLeadingMonthLabel('이 달은 조용합니다.')).toBe('조용합니다.');
    expect(stripLeadingMonthLabel('조용합니다.')).toBe('조용합니다.'); // 멀쩡한 문장은 건드리지 않는다
  });

  it('[1-2] 비허용 문자(데바나가리 등)가 섞인 문장은 버려진다', () => {
    expect(containsForeignScript('नियमित적으로 새는 비용을 점검하세요.')).toBe(true);
    expect(containsForeignScript('정기적으로 새는 비용을 점검하세요.')).toBe(false);
    expect(containsForeignScript('한자 語彙 와 English 와 2026년 · 12% 는 허용됩니다.')).toBe(false);
    expect(containsForeignScript('キリル文字 같은 가나는 막습니다')).toBe(true);
  });

  it('[1-3] 구조 식별자가 사용자 문장에 새어 나오면 잡힌다', () => {
    expect(containsLeakedIdentifier('타고난 구성에서 FIRE 기운이 가장 두텁습니다.')).toBe(true);
    expect(containsLeakedIdentifier('월주 충이 걸립니다.')).toBe(true);
    expect(containsLeakedIdentifier('정관의 결입니다.')).toBe(true);
    expect(containsLeakedIdentifier('타고난 구성에서 불의 기운이 가장 두텁습니다.')).toBe(false);
  });

  it('파서가 세 결함을 실제로 막고, 버린 줄을 빈칸으로 남기지 않는다', () => {
    const window: PremiumMonthOutlook[] = Array.from({ length: 12 }, (_, i) => ({
      year: 2026, month: i + 1, stemTenGod: '정재', branchTenGod: '편관', harmony: [], friction: [], side: 'DRAIN',
    }));
    window[3] = { ...window[3], harmony: ['삼합'] };
    window[4] = { ...window[4], friction: ['월주 충'] };

    const months = Array.from({ length: 12 }, (_, i) => `2026년 ${i + 1}월에는 차분합니다.`);
    months[3] = 'नियमित적으로 흔들립니다.';
    months[4] = '월주 충이 걸립니다.';
    const raw = JSON.stringify({
      headline: '쌓아 올리는 해', natalSummary: '차분히 쌓는 결입니다.', flowSummary: '',
      sections: [{ title: '기질', body: '느리지만 끝을 봅니다.' }],
      monthlyOutlook: months, actions: ['한 가지씩 마무리하세요.'],
    });
    const out = parsePremiumReport(raw, window, ['근거']);
    expect(out.ok).toBe(true);
    const r = out.ok ? out.result : null;
    expect(r!.monthlyOutlook[0]).toBe('차분합니다.');           // 날짜 중복 제거
    expect(r!.monthlyOutlook[3]).toContain('함께 맞물려'); // 외래문자 → 그 달의 구조로 대체
    expect(r!.monthlyOutlook[4]).toContain('부딪히는 곳이 있어'); // 식별자 누출 → 그 달의 구조로 대체
    expect(r!.monthlyOutlook.filter((l) => l.length === 0)).toHaveLength(0); // 빈 달은 남기지 않는다
    expect(r!.monthlyOutlook).toHaveLength(12);                 // 개수 계약은 유지
    // 대체 문장 자체가 다시 용어를 흘리면 안 된다.
    for (const l of r!.monthlyOutlook) expect(containsLeakedIdentifier(l)).toBe(false);
  });

  it('걸리는 곳이 없는 달의 대체 문장은 "조용한 달"이다', () => {
    const window: PremiumMonthOutlook[] = [{ year: 2026, month: 9, stemTenGod: '정재', branchTenGod: '편관', harmony: [], friction: [], side: 'SUPPORT' }];
    const raw = JSON.stringify({
      headline: 'h', natalSummary: 'n', sections: [{ title: 't', body: 'b' }],
      monthlyOutlook: ['일주 충이 옵니다.'], actions: [],
    });
    const out = parsePremiumReport(raw, window, []);
    expect(out.ok && out.result.monthlyOutlook[0]).toContain('조용한 달');
  });
});


// 50덕짜리 리포트를 통째로 버릴 때는 왜 버렸는지가 남아야 한다. V3 재생성에서 SUBJ-08 이
// INVALID_OUTPUT 으로 죽었는데 사유가 없어 원인 추적이 한 번 막혔다 — 그 구멍을 메운다.
describe('파서가 거절 사유를 남긴다', () => {
  const win: PremiumMonthOutlook[] = [{ year: 2026, month: 9, stemTenGod: '정재', branchTenGod: '편관', harmony: [], friction: [], side: 'DRAIN' }];
  const body = { headline: 'h', natalSummary: 'n', sections: [{ title: 't', body: 'b' }], monthlyOutlook: ['조용합니다.'], actions: [] };
  const why = (o: object | string) => {
    const r = parsePremiumReport(typeof o === 'string' ? o : JSON.stringify(o), win, []);
    return r.ok ? 'OK' : r.why;
  };

  it('사유를 구분해서 돌려준다', () => {
    expect(why(body)).toBe('OK');
    expect(why('not json')).toBe('NOT_JSON');
    expect(why({ ...body, headline: '' })).toBe('HEADLINE_EMPTY');
    expect(why({ ...body, natalSummary: '  ' })).toBe('NATAL_EMPTY');
    expect(why({ ...body, headline: '정관이 강한 해' })).toBe('HEADLINE_UNSAFE');
    expect(why({ ...body, natalSummary: '원국이 이렇습니다.' })).toBe('NATAL_UNSAFE');
    expect(why({ ...body, sections: [] })).toBe('NO_SECTIONS');
    expect(why({ ...body, monthlyOutlook: [] })).toBe('MONTHS_SHORT');
  });

  // PART 1 실측: 이 아홉 문장은 V2 규칙이 전부 물었다. 하나라도 다시 물면 그 규칙이 넓어진 것이다.
  it('일상 한국어를 물지 않는다 — V2 오검출 9건 회귀 방지', () => {
    for (const s of [
      '미리 세운 기준을 그대로 지키는 편이 낫습니다.',
      '연초에 세운 계획을 다시 꺼내 보기 좋은 달입니다.',
      '목적을 앞세운 대화가 도움이 됩니다.',
      '기존의 관성대로 움직이면 놓치는 것이 생깁니다.',
      '비겁한 선택으로 보일까 봐 미루지 마세요.',
      '월간 계획을 세우고 주 단위로 점검하세요.',
      '업무 일지를 남겨 두면 나중에 근거가 됩니다.',
      '노력과 성과의 상관관계를 따져 보세요.',
      '일주일에 한 번은 통근 시간을 줄여 보세요.',
    ]) expect(`${s} → ${containsLeakedIdentifier(s)}`).toBe(`${s} → false`);
  });
});

// 관측 실패율 1/9 을 닫는 장치. 재시도는 **모델 출력 문제에만** 걸려야 하고, 인프라 실패에 걸리면
// 남은 데드라인만 태운다. 덕은 예약 단계에서 이미 한 번만 잡히므로 재시도가 이중 청구를 만들지 않는다.
describe('INVALID_OUTPUT 1회 재시도', () => {
  const NOW = Math.floor(Date.UTC(2026, 8, 2) / 1000);
  const ok = (months: number) => JSON.stringify({
    headline: '쌓아 올리는 해', natalSummary: '차분히 쌓는 결입니다.', flowSummary: '',
    sections: [{ title: '기질', body: '느리지만 끝을 봅니다.' }],
    monthlyOutlook: Array.from({ length: months }, () => '조용합니다.'), actions: ['하나씩 마무리하세요.'],
  });
  const bad = JSON.stringify({
    headline: '정관이 강한 해', natalSummary: '차분히 쌓는 결입니다.',
    sections: [{ title: '기질', body: '느리지만 끝을 봅니다.' }],
    monthlyOutlook: Array.from({ length: 12 }, () => '조용합니다.'), actions: [],
  });
  const run = (replies: (string | Error)[]) => {
    const seen: string[] = [];
    let retried: string | null = null;
    return buildPremiumReport({ birthInput: SUBJECTS['SUBJ-06'] }, {
      digestProvider, nowEpochSeconds: NOW,
      callLLM: async (msgs) => {
        seen.push(msgs[msgs.length - 1].content);
        const r = replies[seen.length - 1];
        if (r instanceof Error) throw r;
        return r ?? '';
      },
      onRetry: (w) => { retried = w; },
    }).then((res) => ({ res, calls: seen, retried }));
  };

  it('첫 시도가 통과하면 한 번만 부른다', async () => {
    const { res, calls, retried } = await run([ok(12)]);
    expect(res.ok).toBe(true);
    expect(calls).toHaveLength(1);
    expect(retried).toBeNull();
  });

  it('스크럽에 걸리면 한 번 더 뽑고, 교정 안내를 붙인다', async () => {
    const { res, calls, retried } = await run([bad, ok(12)]);
    expect(res.ok).toBe(true);
    expect(calls).toHaveLength(2);
    expect(retried).toBe('HEADLINE_UNSAFE');
    expect(calls[0]).not.toContain('■ 재시도 안내');
    expect(calls[1]).toContain('■ 재시도 안내');
    expect(calls[1]).toContain('제목에 십신 이름');
    // 근거는 그대로 실려 있어야 한다 — 안내만 덧붙이지, 브리프를 갈아 끼우지 않는다.
    expect(calls[1].startsWith(calls[0])).toBe(true);
  });

  it('두 번 다 걸리면 두 사유를 모두 남기고 끝낸다 — 세 번은 없다', async () => {
    const { res, calls } = await run([bad, bad]);
    expect(res).toEqual({ ok: false, reason: 'INVALID_OUTPUT', detail: 'HEADLINE_UNSAFE_RETRY_HEADLINE_UNSAFE' });
    expect(calls).toHaveLength(2);
  });

  it('인프라 실패에는 재시도하지 않는다 — 데드라인만 태운다', async () => {
    for (const first of ['', new Error('timeout')]) {
      const { res, calls } = await run([first as string | Error, ok(12)]);
      expect(res).toEqual({ ok: false, reason: 'LLM_FAILED' });
      expect(calls).toHaveLength(1);
    }
  });

  it('재시도가 인프라로 죽으면 첫 실패 사유를 남긴다', async () => {
    const { res } = await run([bad, '']);
    expect(res).toEqual({ ok: false, reason: 'INVALID_OUTPUT', detail: 'HEADLINE_UNSAFE_RETRY_LLM_FAILED' });
  });
});

describe('두드러지는 달 표기', () => {
  it('해가 넘어가는 달에는 연도를 붙인다 — 창이 두 해에 걸친다', async () => {
    for (const b of Object.values(SUBJECTS)) {
      const ev = await buildPremiumEvidence({ birthInfo: b }, { digestProvider, nowEpochSeconds: Math.floor(Date.UTC(2026, 8, 2) / 1000) });
      if (!ev.available) throw new Error('unavailable');
      const line = premiumEvidenceLines(ev).find((l) => l.includes('앞으로 열두 달 중'));
      expect(line).toBeDefined();
      const startYear = ev.months[0].year;
      for (const x of [...ev.brightMonths, ...ev.heavyMonths]) {
        expect(line).toContain(x.year === startYear ? `${x.month}월` : `${x.year}년 ${x.month}월`);
      }
      // 창의 두 번째 해에 속한 달이 하나라도 지목됐다면 연도 표기가 실제로 등장해야 한다.
      if ([...ev.brightMonths, ...ev.heavyMonths].some((x) => x.year !== startYear)) {
        expect(line).toContain(`${startYear + 1}년`);
      }
    }
  });
});

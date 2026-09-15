// Premium 클라이언트 계약 — 디자인 재사용과 12개월 표현을 고정한다.
//
// 이 트랙의 제1원칙은 "Claude Design 으로 구현된 기존 UI 가 Visual Source of Truth" 였다. 그 원칙은
// 코드 리뷰에서만 지켜지면 다음 사람이 새 색을 하나 넣는 순간 조용히 깨진다. 그래서 화면 소스를 직접
// 스캔해 **새 색값·새 폰트 크기·고정 픽셀 폭이 들어오지 못하게** 잠근다.
import fs from 'fs';
import path from 'path';

import { toPremiumProductView, premiumReportTitle } from '@/features/premium/presentation/premiumReportProjection';
import type { PremiumReportPayload } from '@/features/premium/types';

const root = path.resolve(__dirname, '../../../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const SCREEN = read('src/app/premium.tsx');
const PROJECTION = read('src/features/premium/presentation/premiumReportProjection.ts');

describe('Premium 화면 — 기존 디자인 시스템만 사용', () => {
  it('원시 색값(hex/rgb)을 도입하지 않는다', () => {
    expect(SCREEN).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(SCREEN).not.toMatch(/\brgba?\(/);
  });

  it('새 폰트 크기·굵기를 도입하지 않는다 — Text variant 로만 말한다', () => {
    expect(SCREEN).not.toMatch(/fontSize\s*:/);
    expect(SCREEN).not.toMatch(/lineHeight\s*:/);
    expect(SCREEN).not.toMatch(/fontWeight\s*:/);
  });

  it('색은 theme 토큰에서만 온다', () => {
    // 사용된 색 표현은 theme.<token> 형태뿐이어야 한다.
    const colorUses = SCREEN.match(/color=\{[^}]+\}/g) ?? [];
    for (const u of colorUses) expect(u).toMatch(/theme\./);
    expect(SCREEN).toContain("from '@/theme'");
  });

  it('간격은 spacing 토큰을 쓰고, 360dp 를 깨는 고정 폭이 없다', () => {
    expect(SCREEN).toMatch(/gap:\s*spacing\./);
    // 고정 width/minWidth 는 좁은 화면에서 가로 스크롤을 만든다. maxWidth(MaxContentWidth)만 허용.
    expect(SCREEN).not.toMatch(/[^x]width:\s*\d/);
    expect(SCREEN).not.toMatch(/minWidth\s*:/);
    expect(SCREEN).toContain('maxWidth: MaxContentWidth');
    // 아이콘+라벨 행은 라벨이 줄바꿈되도록 flex:1 이어야 360dp 에서 밀리지 않는다.
    expect(SCREEN).toMatch(/stageLabel:\s*\{\s*flex:\s*1\s*\}/);
  });

  it('결과는 기존 편집형 렌더러를 그대로 쓴다 — 새 렌더러를 만들지 않았다', () => {
    expect(SCREEN).toContain("import { PremiumReportView } from '@/features/chat/report/PremiumReportView'");
    expect(SCREEN).toContain('<PremiumReportView');
  });

  it('로딩은 단순 스피너가 아니고, 가짜 진행률을 만들지 않는다', () => {
    expect(SCREEN).toContain('STAGES');
    expect(SCREEN).not.toContain('ActivityIndicator');
    // 주석은 "가짜 진행률을 쓰지 않는 이유"를 설명하므로 그 단어들이 등장한다 — 실행 코드만 검사한다.
    const code = SCREEN.replace(/\/\/[^\n]*/g, '');
    expect(code).not.toMatch(/progress|percent|퍼센트/i);
    expect(code).not.toMatch(/\{\s*[a-zA-Z]+\s*\}\s*%/); // "{n}%" 형태의 진행률 렌더
  });
});

describe('Premium 투영 — 12개월 표현', () => {
  const months = Array.from({ length: 12 }, (_, i) => ({ year: 2026 + Math.floor((8 + i) / 12), month: ((8 + i) % 12) + 1 }));
  const payload: PremiumReportPayload = {
    kind: 'premium_report',
    generatedAt: '2026-09-02T00:00:00.000Z',
    policyVersion: 'p', evidenceVersion: 'e',
    coveredMonths: months,
    result: {
      headline: '쌓아 올리는 해입니다',
      natalSummary: '차분히 쌓는 결입니다.',
      flowSummary: '지금은 넓히기보다 다지는 구간입니다.',
      sections: [{ title: '성향', body: '느리지만 끝을 봅니다.' }, { title: '관계', body: '먼저 묻는 편이 낫습니다.' }],
      monthlyOutlook: months.map((m) => `${m.month}월은 무리하지 않는 편이 낫습니다.`),
      actions: ['한 가지씩 마무리하세요.'],
      evidence: ['앞으로 12개월치 달 흐름을 반영했습니다.'],
    },
  };

  it('12개월을 3개월씩 네 묶음으로 나눈다 — 열두 문단도, 한 덩어리도 아니다', () => {
    const view = toPremiumProductView(payload);
    const monthGroups = view.sections.filter((s) => s.kind === 'list' && /^\d{4}년/.test(s.title));
    expect(monthGroups).toHaveLength(4);
    for (const g of monthGroups) expect(g.kind === 'list' && g.items).toHaveLength(3);
    expect(PROJECTION).toContain('MONTHS_PER_GROUP = 3');
  });

  it('각 줄이 자기 달을 스스로 밝힌다 — 묶음 제목에만 의존하지 않는다', () => {
    const view = toPremiumProductView(payload);
    const first = view.sections.find((s) => s.kind === 'list' && /^\d{4}년/.test(s.title));
    expect(first?.kind === 'list' && first.items[0]).toMatch(/^2026년 9월 — /);
  });

  it('해를 넘기는 묶음은 제목에 두 해를 모두 쓴다', () => {
    const titles = toPremiumProductView(payload).sections.map((s) => s.title);
    expect(titles).toContain('2026년 12월~2027년 2월');
  });

  it('읽기 순서: 결론(hero) → 쉬운 설명 → 흐름 → 앞으로 → 행동 → 왜', () => {
    const view = toPremiumProductView(payload);
    expect(view.summary).toBe('차분히 쌓는 결입니다.'); // 결론은 hero
    const titles = view.sections.map((s) => s.title);
    expect(titles[0]).toBe('성향');
    expect(titles.indexOf('지금 지나는 흐름')).toBeGreaterThan(titles.indexOf('관계'));
    expect(titles.indexOf('이렇게 지내보세요')).toBeGreaterThan(titles.indexOf('2026년 9~11월'));
    expect(titles[titles.length - 1]).toBe('왜 이렇게 보나요');
  });

  it('없는 항목은 만들지 않는다 — flowSummary 가 없으면 섹션 자체가 없다', () => {
    const view = toPremiumProductView({ ...payload, result: { ...payload.result, flowSummary: null } });
    expect(view.sections.map((s) => s.title)).not.toContain('지금 지나는 흐름');
  });

  it('목록 제목은 22자 이내로 잘린다', () => {
    expect(premiumReportTitle(payload)).toBe('쌓아 올리는 해입니다');
    const long = premiumReportTitle({ ...payload, result: { ...payload.result, headline: '가'.repeat(40) } });
    expect(long.length).toBeLessThanOrEqual(22);
  });
});

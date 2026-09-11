// 투간·통근 사실 대조 — v4 신설 검사 2종의 회귀.
//
// ⚠ 왜 필요했나. v3 에서 **관계**는 8/8 엔진 판정과 맞았는데, 투간은 대조가 없어 이런 문장이
// 아무 검사도 걸리지 않고 통과했다:
//     "일지 미 지장간 정이 년간·월간으로 투간되어"
// 그 명식의 년간은 갑, 월간은 병이다. 엔진 판정은 `년지 계 → 일간` · `월지 계 → 일간` 뿐이다.
// 없는 사실을 지어냈다. 명식 해설에서 이것은 관계 날조와 같은 급이다 — 배우는 사람이 투간을
// 틀린 예로 익힌다.
//
// ⚠ 이 파일이 지키는 두 방향. 검사기 거짓 양성이 이미 9건 누적됐고(v2 5 · v3 4) **전부 정상
// 본문을 거절했다.** 그래서 "걸려야 하는 것" 과 "걸리면 안 되는 것" 을 같은 무게로 박는다.
import { buildFamousChart, type FamousChartSnapshot } from '../famousChart';
import {
  selfContradictions,
  checkRevealedClaims,
  checkRootingClaims,
  factClaimCounts,
  unverifiedFactClaims,
} from '../famousBodyPrompt';
import { SAMPLE_V4_EXACT_CHART, SAMPLE_V4_AUTUMN_CHART, SAMPLE_V4_NO_HOUR_CHART } from './famousBodySamples';

const deps = { digestProvider: { async sha256Utf8() { return 'a'.repeat(64); } } } as never;
const birth = (over: Record<string, unknown> = {}) =>
  ({
    displayName: '예시', gender: 'female', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '6', birthDay: '21',
    birthTimeAccuracy: 'exact', birthHour: '13', birthMinute: '20',
    approximateTimePeriod: null, birthPlace: '서울', ...over,
  }) as never;

const md = (body: string) => `## 속에 있는 것과 드러난 것 — 지장간과 투간\n\n${body}`;

// ② 계(癸) 일간 · 시각 미상 — v3 의 실제 오류가 나온 그 명식이다.
const NO_HOUR = {
  birthYear: '1984', birthMonth: '12', birthDay: '15',
  birthTimeAccuracy: 'unknown', birthHour: null, birthMinute: null,
};

describe('스냅샷이 담는 것', () => {
  it('투간·통근 판정이 실제로 들어 있다', async () => {
    const r = await buildFamousChart(birth(), deps);
    if (!r.ok) throw new Error('chart failed');
    expect(r.snapshot.revealed.length).toBeGreaterThan(0);
    expect(r.snapshot.rooting.length).toBe(4); // 8칸 → 천간 넷
    for (const t of r.snapshot.revealed) {
      expect(t.branchPosition).toMatch(/^[년월일시]$/);
      expect(t.revealedAt.length).toBeGreaterThan(0);
    }
  });
});

describe('⚠ 투간 대조 — v3 의 실제 오류', () => {
  let chart: FamousChartSnapshot;
  beforeAll(async () => {
    const r = await buildFamousChart(birth(NO_HOUR), deps);
    if (!r.ok) throw new Error('chart failed');
    chart = r.snapshot;
  });

  it('엔진 판정: 년지 계 → 일간 · 월지 계 → 일간 뿐이다', () => {
    expect(chart.revealed.map((t) => `${t.branchPosition}지 ${t.hiddenStem}→${t.revealedAt.join(',')}`))
      .toEqual(['년지 계→일간', '월지 계→일간']);
  });

  // ⚠⚠ v3 ②에서 실제로 통과했던 문장. 이제 걸려야 한다.
  it('"일지 미 지장간 정이 년간·월간으로 투간되어" 를 잡는다', () => {
    const body = md('일지 미 지장간 정이 년간·월간으로 투간되어 밖으로 드러나 있습니다.');
    const bad = unverifiedFactClaims(body, chart);
    expect(bad.length).toBe(1);
    expect(bad[0].kind).toBe('투간');
  });

  it('맞는 투간 주장은 통과한다', () => {
    const body = md('년지의 계(정기)는 일간으로 투간되어 밖으로 드러나 있습니다.');
    expect(unverifiedFactClaims(body, chart)).toEqual([]);
  });

  it('자리는 맞고 글자가 틀리면 잡는다', () => {
    const body = md('년지의 임이 일간으로 투간되어 있습니다.');
    expect(unverifiedFactClaims(body, chart).length).toBe(1);
  });

  it('글자는 맞고 드러난 자리가 틀리면 잡는다', () => {
    const body = md('년지의 계가 월간으로 투간되어 있습니다.');
    expect(unverifiedFactClaims(body, chart).length).toBe(1);
  });
});

describe('투간 — 걸리면 안 되는 것 (거짓 양성 방지)', () => {
  let chart: FamousChartSnapshot;
  beforeAll(async () => {
    const r = await buildFamousChart(birth(NO_HOUR), deps);
    if (!r.ok) throw new Error('chart failed');
    chart = r.snapshot;
  });

  it('개념 정의 문장은 통과한다', () => {
    const body = md('투간(透干)은 지장간이 천간으로 드러나는 것을 말합니다.');
    expect(checkRevealedClaims(body, chart)).toEqual([]);
  });

  it('부재 진술은 통과한다', () => {
    const body = md('년지 임은 아직 투간되지 않고 속에 남아 있습니다.');
    expect(checkRevealedClaims(body, chart)).toEqual([]);
  });

  it('숨은 지장간 열거는 통과한다', () => {
    const body = md('일지 미의 정·을·기는 아직 숨은 채로 남아 투간되지 않았습니다.');
    expect(checkRevealedClaims(body, chart)).toEqual([]);
  });

  it('가정문은 통과한다', () => {
    const body = md('만약 일지 미의 정이 천간으로 투간되었다면 읽는 방향이 달라집니다.');
    expect(checkRevealedClaims(body, chart)).toEqual([]);
  });
});

describe('⚠ 통근 대조 — 극성까지 본다', () => {
  let chart: FamousChartSnapshot;
  beforeAll(async () => {
    const r = await buildFamousChart(birth(), deps);
    if (!r.ok) throw new Error('chart failed');
    chart = r.snapshot;
  });

  it('엔진 판정: 년간 경 O · 월간 임 X · 일간 정 O · 시간 정 O', () => {
    expect(chart.rooting.map((r) => `${r.position}간 ${r.stem} ${r.rooted ? 'O' : 'X'}`))
      .toEqual(['년간 경 O', '월간 임 X', '일간 정 O', '시간 정 O']);
  });

  // ── v5: 부정이 짝 **앞**에 오는 관형형 ────────────────────────────────────────
  // 실측 거짓 양성 2건. 극성 창이 짝 뒤만 봐서 **사실인 부재 주장**을 긍정으로 오판했다.
  it('⚠ 관형형 부정이 앞에 와도 부재 주장으로 읽는다 — 사실이면 통과', () => {
    const body = md('통근이 없는 월간 임은 뜬 글자이며, 같은 천간이라도 뿌리 유무로 읽는 방향이 달라집니다.');
    expect(unverifiedFactClaims(body, chart)).toEqual([]);
  });

  it('⚠ 앞 짝의 긍정 뒤에 와도 각자 제 극성으로 읽는다', () => {
    const body = md('통근이 있는 일간 정과 시간 정은 여러 지지에 뿌리를 두고, 통근이 없는 월간 임은 뜬 글자로 남습니다.');
    expect(unverifiedFactClaims(body, chart)).toEqual([]);
  });

  it('⚠ 관형형 부정이 틀리면 여전히 잡는다 — 약화가 아니다', () => {
    const body = md('통근이 없는 일간 정은 뜬 글자입니다.');
    expect(unverifiedFactClaims(body, chart)).toHaveLength(1);
  });

  it('⚠ 연결어미(없고)는 뒤 짝으로 옮아붙지 않는다', () => {
    // 앞 절은 그 자체로 틀린 주장이라(일간 정은 통근 O) 1건 잡힌다. 뒤의 월간 임은 X 가
    // 사실이므로 **긍정으로 오판되어 추가로 잡히면 안 된다.**
    const body = md('일간 정은 통근이 없고, 월간 임도 뿌리가 없습니다.');
    const bad = unverifiedFactClaims(body, chart);
    expect(bad).toHaveLength(1);
    expect(bad[0].sentence).toContain('일간 정');
  });

  it('⚠ 접속 주어는 서술어를 공유한다 — 앞 짝도 뒤의 부정을 본다', () => {
    // 실측 거짓 양성: "년간 갑과 월간 병은 지지에 뿌리를 두지 못해" — 둘 다 X 가 사실인데,
    // 앞 짝의 창이 다음 짝에서 잘려 공유 서술어를 못 보고 **긍정 주장으로 오판**했다.
    // 이 명식에는 X 가 하나뿐이라 극성을 뒤집어 시험한다: 년간 경은 O 이므로 **잡혀야** 하고,
    // 월간 임은 X 라 통과해야 한다. 고치기 전에는 앞 짝이 부정을 못 봐서 0건이 나왔다.
    const body = md('반면 년간 경과 월간 임은 지지에 뿌리를 두지 못해 통근이 없는 뜬 글자입니다.');
    const bad = unverifiedFactClaims(body, chart);
    expect(bad).toHaveLength(1);
    expect(bad[0].kind).toBe('통근');
  });

  it('⚠ 접속으로 묶여도 사실이면 둘 다 통과한다', () => {
    const body = md('년간 경과 일간 정은 각각 지지에 뿌리를 두어 통근하고 있습니다.');
    expect(unverifiedFactClaims(body, chart)).toEqual([]);
  });

  it('⚠ 뿌리 자리는 그 짝의 구간에서만 읽는다 — 옆 짝의 뿌리를 뺏지 않는다', () => {
    // 실측 거짓 양성. 년간 경의 뿌리는 일지 사인데, 같은 문장에 있던 일간 정의 세 자리
    // (년지·월지·시지)를 년간 경의 것으로 읽어 "댄 자리가 다 틀렸다" 로 거절했다.
    const body = md('일간 정은 년간 경이 아닌 일간 정으로 서 있고, 일간 정은 년지 오·월지 오·시지 미 세 곳에 뿌리를 두어 뜬 글자가 아닙니다.');
    expect(unverifiedFactClaims(body, chart)).toEqual([]);
  });

  it('⚠ "뜬 글자입니다" 를 부재 주장으로 읽는다 — 사실이면 통과', () => {
    // 실측 거짓 양성. 부재를 비유로만 말한 문장이 긍정 주장으로 읽혔다.
    const body = md('일간 정은 뿌리를 두어 바닥에 섰지만, 월간 임은 뜬 글자입니다.');
    expect(unverifiedFactClaims(body, chart)).toEqual([]);
  });

  it('⚠ "뜬 글자가 아닙니다" 는 이중부정이다 — 긍정으로 읽어야 한다', () => {
    // 이 가드가 없으면 사실인 긍정 주장이 부재 주장으로 뒤집힌다(v4 실측 1건).
    const body = md('일간 정은 여러 지지에 통근하여 뜬 글자가 아닙니다.');
    expect(unverifiedFactClaims(body, chart)).toEqual([]);
  });

  it('⚠ "뜬 글자" 가 틀리면 잡는다 — 약화가 아니다', () => {
    const body = md('통근을 보면 일간 정은 뜬 글자입니다.');
    expect(unverifiedFactClaims(body, chart)).toHaveLength(1);
  });

  it('⚠ 뒤 절의 부정은 앞 짝의 것이 아니다 — 주어가 짝이 아니어도', () => {
    // 실측 거짓 양성. "다른 천간 둘" 은 짝 형태가 아니라 짝 경계로 자를 수 없다. 연결어미에서 자른다.
    const body = md('통근의 분포를 보면 일간 정 하나가 뿌리를 갖고 있고 다른 천간 하나는 뿌리 없음으로 판정됩니다.');
    expect(unverifiedFactClaims(body, chart)).toEqual([]);
  });

  it('⚠ 연결어미 앞의 부정은 여전히 제 짝의 것이다 — 약화가 아니다', () => {
    // ⚠ 문장에 `통근` 이 없으면 검사기가 게이트에서 건너뛴다 — 대조가 일어나지 않아 0건이 된다.
    const body = md('통근을 보면 일간 정은 뿌리가 없고 월간 임은 지지에 뿌리를 두고 있습니다.');
    // 둘 다 틀렸다(정 O · 임 X). 두 건 다 잡혀야 한다.
    expect(unverifiedFactClaims(body, chart)).toHaveLength(2);
  });

  it('맞는 통근 주장은 통과한다', () => {
    const body = md('일간 정은 년지 오·월지 오·시지 미에 통근하여 뿌리를 두고 있습니다.');
    expect(unverifiedFactClaims(body, chart)).toEqual([]);
  });

  it('맞는 부재 주장도 통과한다 — 뜬 글자는 사실이다', () => {
    const body = md('월간 임은 통근이 없어 뜬 글자입니다.');
    expect(unverifiedFactClaims(body, chart)).toEqual([]);
  });

  // ⚠ 부정문을 통째로 넘기면 이것이 통과한다. 극성을 보는 이유다.
  it('⚠ 틀린 부재 주장을 잡는다 — 통근이 있는데 없다고 함', () => {
    const body = md('일간 정은 통근이 없어 뜬 글자입니다.');
    expect(unverifiedFactClaims(body, chart).length).toBe(1);
  });

  it('틀린 존재 주장을 잡는다 — 통근이 없는데 있다고 함', () => {
    const body = md('월간 임은 월지 오에 통근하여 단단히 서 있습니다.');
    expect(unverifiedFactClaims(body, chart).length).toBe(1);
  });

  it('통근은 맞고 **어느 지지인지**가 틀리면 잡는다', () => {
    const body = md('일간 정은 일지 사에 통근하고 있습니다.');
    expect(unverifiedFactClaims(body, chart).length).toBe(1);
  });

  it('통근한 자리를 대지 않으면 자리는 따지지 않는다', () => {
    const body = md('일간 정은 통근이 있어 뜬 글자가 아닙니다.');
    expect(unverifiedFactClaims(body, chart)).toEqual([]);
  });
});

describe('통근 — 걸리면 안 되는 것 (거짓 양성 방지)', () => {
  let chart: FamousChartSnapshot;
  beforeAll(async () => {
    const r = await buildFamousChart(birth(), deps);
    if (!r.ok) throw new Error('chart failed');
    chart = r.snapshot;
  });

  it('개념 정의 문장은 통과한다', () => {
    const body = md('통근(通根)은 천간이 지지 속에 같은 오행의 뿌리를 두는 것입니다.');
    expect(checkRootingClaims(body, chart)).toEqual([]);
  });

  it('자리와 글자를 짝짓지 않으면 판정하지 않는다', () => {
    const body = md('통근이 여러 곳에 있어 일간이 안정적으로 서 있습니다.');
    expect(checkRootingClaims(body, chart)).toEqual([]);
  });

  it('가정문은 통과한다', () => {
    const body = md('같은 일간이라도 일간 정이 통근이 없으면 읽는 방향이 달라집니다.');
    expect(checkRootingClaims(body, chart)).toEqual([]);
  });

  // ⚠ `통근` 은 통근버스·통근시간과 겹친다. 레포가 상담 스크러버에서 이미 좁힌 형태를 그대로 쓴다.
  it('일상어 통근(출퇴근)은 판정하지 않는다', () => {
    for (const s of ['통근 시간이 길어집니다.', '통근 버스를 탑니다.', '매일 통근하는 사람입니다.']) {
      expect(checkRootingClaims(md(s), chart)).toEqual([]);
    }
  });
});

describe('v3 실측 3건 — 새 검사가 과거 본문을 어떻게 보는가', () => {
  const { GENERATED_BODIES_V3 } = require('./famousBodySamples') as {
    GENERATED_BODIES_V3: readonly { key: string; body: string; chart: never }[];
  };

  // ⚠ v3 fixture 의 chart 조각에는 relations·monthCommand 만 들어 있다(그때 필요했던 것만 박았다).
  // 그래서 여기서는 **본문이 투간·통근 주장을 몇 개 하는지**만 세고, 대조는 새로 생성한 v4 에서 한다.
  it('v3 본문도 투간·통근을 실제로 주장한다 — 대조가 필요한 이유', () => {
    const empty = { revealed: [], rooting: [] };
    const counts = GENERATED_BODIES_V3.map((b) => ({
      key: b.key,
      투간: checkRevealedClaims(b.body, empty).length,
    }));
    // 판정 근거가 비어 있으므로 전부 미검증으로 잡힌다 — 주장 자체가 있다는 뜻이다.
    expect(counts.some((c) => c.투간 > 0)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 명식 수치·글자 대조 (PART 3) — 기둥 간지 · 지장간 구성 · 십성 개수 · 오행 개수.
// ═══════════════════════════════════════════════════════════════════════════════
describe('명식 수치·글자 대조', () => {
  const { checkChartFacts } = require('../famousBodyPrompt') as {
    checkChartFacts: (md: string, c: never) => { kind: string; claim: string; actual: string }[];
  };
  let chart: FamousChartSnapshot;
  beforeAll(async () => {
    const r = await buildFamousChart(birth(), deps);
    if (!r.ok) throw new Error('chart failed');
    chart = r.snapshot;
  });

  it('맞는 기둥 글자는 통과한다', () => {
    expect(checkChartFacts(md('일간 정은 음화이고 월지 오는 화입니다.'), chart as never)).toEqual([]);
  });

  it('틀린 기둥 글자를 잡는다', () => {
    // ⚠ 12자 이하 문장은 `sections()` 가 걸러 낸다 — 검사기 전체의 공통 하한이다.
    const bad = checkChartFacts(md('이 명식의 일간 병은 양화로 서 있습니다.'), chart as never);
    expect(bad.length).toBe(1);
    expect(bad[0].actual).toBe('일간 정');
  });

  it('맞는 십성 개수는 통과하고 틀린 것은 잡는다', () => {
    expect(checkChartFacts(md('비겁 7과 식상 4가 두드러집니다.'), chart as never)).toEqual([]);
    const bad = checkChartFacts(md('비겁 5가 가장 많습니다.'), chart as never);
    expect(bad).toEqual([{ kind: '십성 개수', claim: '비겁 5', actual: '비겁 7' }]);
  });

  it('맞는 오행 개수는 통과하고 틀린 것은 잡는다', () => {
    expect(checkChartFacts(md('화 5로 가장 많고 목 0입니다.'), chart as never)).toEqual([]);
    const bad = checkChartFacts(md('화 3으로 가장 많습니다.'), chart as never);
    expect(bad).toEqual([{ kind: '오행 개수', claim: '화 3', actual: '화 5' }]);
  });

  // ⚠ `수` 는 오행이면서 "개수·글자 수" 이기도 하다. 이 겹침을 못 넘기면 정상 문장이 걸린다.
  it('"개수"·"글자 수" 의 수를 오행으로 보지 않는다', () => {
    for (const s of ['십성의 수 3가지를 봅니다.', '글자 수 8개를 셉니다.', '통근 개수 3을 확인합니다.']) {
      expect(checkChartFacts(md(s), chart as never)).toEqual([]);
    }
  });

  // ⚠ 지장간 구성 대조는 **시도했다가 뺐다.** 한 문장이 여러 자리를 오가고 조사 충돌이 섞여
  //    정상 본문을 거절했다. 정밀화하려면 문장을 자리별로 쪼개는 파서가 필요하다 —
  //    비용이 값어치를 넘는다. 뺐다는 사실을 테스트로 못박아 둔다(다시 넣을 때 이 주석을 볼 것).
  it('지장간 구성은 대조하지 않는다 — 의도적으로 뺀 것이다', () => {
    expect(checkChartFacts(md('일지 사의 지장간에는 갑이 들어 있습니다.'), chart as never)).toEqual([]);
  });

  it('가정문은 판정하지 않는다', () => {
    expect(checkChartFacts(md('일간이 병이면 읽는 방향이 달라집니다.'), chart as never)).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PART 4 — v3 잔여 결함
// ═══════════════════════════════════════════════════════════════════════════════
describe('한 문장 안의 자기모순', () => {
  const { selfContradictions, sentenceDefects } = require('../famousBodyPrompt') as {
    selfContradictions: (md: string) => string[];
    sentenceDefects: (md: string) => string[];
  };

  // ⚠ v3 ② 실측 문장.
  it('"드러나 있지 않지만 … 드러남" 을 잡는다', () => {
    const body = md('일지의 세 글자 중 정만 천간으로 드러나 있지 않지만(정이 년·월간으로 투간되어 일간에 드러남) 나머지는 남아 있습니다.');
    expect(selfContradictions(body).length).toBe(1);
  });

  // ⚠ 넓게 잡으면 정상 대조 문장을 죄다 거절한다. 좁게 잡은 것이 의도다.
  it('정상 대조 문장은 잡지 않는다', () => {
    for (const s of [
      '년지 임은 아직 드러나지 않았고 월지 계는 일간으로 드러나 있습니다.',
      '월간 임은 통근하지 못했지만 일간 정은 세 곳에 뿌리를 두고 있습니다.',
      '지장간 가운데 일부는 투간되지 않은 채 속에 남아 있습니다.',
    ]) {
      expect(selfContradictions(md(s))).toEqual([]);
    }
  });

  // ⚠ v3 의 검사기 거짓 양성 1건. 열거는 반복이 아니다.
  it('열거를 같은 말 반복으로 보지 않는다', () => {
    expect(sentenceDefects('일지 미의 지장간은 일지 정·일지 을·일지 기입니다.')).toEqual([]);
  });

  it('그러나 진짜 중복은 계속 잡는다', () => {
    expect(sentenceDefects('지지의 지지(地支) 지지기반과 연결됩니다').length).toBe(1);
  });
});

// ⚠ v4 실측 거짓 양성 3종의 회귀 잠금. 셋 다 정상 본문을 거절했다.
describe('v4 검사기 거짓 양성 — 실측 3종', () => {
  const { checkChartFacts } = require('../famousBodyPrompt') as {
    checkChartFacts: (md: string, c: never) => { kind: string; claim: string; actual: string }[];
  };
  let chart: FamousChartSnapshot;
  beforeAll(async () => {
    const r = await buildFamousChart(birth(), deps);
    if (!r.ok) throw new Error('chart failed');
    chart = r.snapshot;
  });

  // ① `일간을` 이 "일간 + 을(乙)" 로 파싱됐다. 을은 목의 천간이면서 목적격 조사다.
  it('"일간을"·"일간인" 을 기둥 글자 주장으로 보지 않는다', () => {
    expect(checkChartFacts(md('이 명식은 일간을 중심으로 읽어야 합니다.'), chart as never)).toEqual([]);
    expect(checkChartFacts(md('무엇보다 일간인 정을 먼저 봅니다.'), chart as never)).toEqual([]);
  });

  // ② 글자에 한자를 병기한 `정(丁)` 을 관계 이름으로 보고 지워 버렸다.
  it('글자+한자 병기가 있어도 투간 대조가 된다', () => {
    const body = md('년지·월지·시지의 정(丁)이 천간으로 투간되어 일간과 시간에 드러나고 있습니다.');
    expect(unverifiedFactClaims(body, chart)).toEqual([]);
  });

  // ③ 맨 명사 `투간` 은 방법을 말하는 자리에 흔히 나온다 — 주장이 아니다.
  it('방법을 말하는 문장의 "투간" 을 주장으로 보지 않는다', () => {
    for (const s of [
      '먼저 볼 곳은 통근과 투간입니다 (근거: 년지 오·월지 오의 통근).',
      '투간으로 속에 있는 십성이 겉으로 어떻게 드러나는지 확인하십시오.',
      '다른 명식을 볼 때에는 통근 여부를 보고 그다음에 투간과 글자 관계를 봅니다.',
    ]) {
      expect(checkRevealedClaims(md(s), chart)).toEqual([]);
    }
  });
});

// ⚠ v4 2차 실측 거짓 양성. 둘 다 "판정 구간이 너무 넓어서" 였다.
describe('v4 검사기 거짓 양성 — 판정 구간', () => {
  let chart: FamousChartSnapshot;
  beforeAll(async () => {
    const r = await buildFamousChart(birth(), deps);
    if (!r.ok) throw new Error('chart failed');
    chart = r.snapshot;
  });

  it('지지 자리를 대지 않은 총평은 투간 주장이 아니다', () => {
    const body = md('이 명식은 통근이 강하고 여러 지장간이 투간되어 겉과 속의 구성이 섞여 있는 쪽입니다 (근거: 일간 통근 O).');
    expect(checkRevealedClaims(body, chart)).toEqual([]);
  });

  // 한 문장이 두 글자를 다룰 때 뒤의 부정이 앞으로 옮아붙었다.
  it('한 문장에 통근 O 와 X 가 함께 있어도 각각 맞게 본다', () => {
    const body = md('이 명식은 일간에 뿌리가 있는 쪽입니다 (근거: 일간 정 통근 O · 월간 임 통근 X).');
    expect(unverifiedFactClaims(body, chart)).toEqual([]);
  });

  it('그 경우에도 진짜 오류는 잡는다', () => {
    const body = md('정리하면 이렇습니다 (근거: 일간 정 통근 X · 월간 임 통근 O).');
    expect(unverifiedFactClaims(body, chart).length).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// v4 실측 3건 — 대조를 켠 뒤의 회귀 고정.
//
// ⚠ 이 블록이 지키는 것: **대조를 켰는데 정상 본문이 거절되지 않는다**(거짓 양성 0)와
// **주장한 것이 전부 스냅샷과 맞는다**(날조 0). 둘은 반대 방향이라 함께 박아야 한다.
// ═══════════════════════════════════════════════════════════════════════════════
describe('v4 실측 — 투간·통근을 열고도 날조 0', () => {
  const { GENERATED_BODIES_V4, checkChartFacts: _c } = {
    ...(require('./famousBodySamples') as {
      GENERATED_BODIES_V4: readonly { key: string; body: string; chart: never }[];
    }),
    checkChartFacts: null,
  };
  const { checkChartFacts, selfContradictions } = require('../famousBodyPrompt') as {
    checkChartFacts: (md: string, c: never) => unknown[];
    selfContradictions: (md: string) => string[];
  };
  void _c;

  it.each(GENERATED_BODIES_V4)('$key: 투간·통근 주장이 전부 스냅샷과 일치', ({ body, chart }) => {
    expect(unverifiedFactClaims(body, chart)).toEqual([]);
  });

  it.each(GENERATED_BODIES_V4)('$key: 투간·통근을 실제로 주장했다 (열어 둔 값이 있다)', ({ body, chart }) => {
    const n = checkRevealedClaims(body, chart).length + checkRootingClaims(body, chart).length;
    expect(n).toBeGreaterThan(0);
  });

  it.each(GENERATED_BODIES_V4)('$key: 기둥 글자·십성 개수·오행 개수가 맞다', ({ body, chart }) => {
    expect(checkChartFacts(body, chart)).toEqual([]);
  });

  it.each(GENERATED_BODIES_V4)('$key: 한 문장 안의 자기모순 0', ({ body }) => {
    expect(selfContradictions(body)).toEqual([]);
  });

  it.each(GENERATED_BODIES_V4)('$key: 세미콜론 0 (clamp) · 대운세운 0', ({ body }) => {
    expect(body).not.toContain(';');
    expect(body).not.toMatch(/대운|월운|연운/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// v5 — 조건절 대비 문장은 자기모순이 아니다
// ═══════════════════════════════════════════════════════════════════════════════
describe('⚠ selfContradictions — 가정은 모순이 아니다', () => {
  it('"다른 명식에서 … 못하면" 은 통과한다 — 프롬프트가 요구하는 문장이다', () => {
    // 실측 거짓 양성. 마지막 섹션은 "같은 일간이어도 갈리는 지점" 을 보이라고 지시받는다.
    const body = '## 이 명식을 읽는 법\n\n일간 기가 년지 오와 일지 축에 뿌리를 두어 통근되어 있지만 다른 명식에서 일간이 통근하지 못하면 같은 기와 오라도 읽는 방향이 달라집니다.';
    expect(selfContradictions(body)).toEqual([]);
  });

  it('조건절이 아닌 진짜 자기모순은 여전히 잡는다 — 약화가 아니다', () => {
    const body = '## 속에 있는 것과 드러난 것\n\n일지의 정만 아직 드러나지 않았지만 그 정이 일간으로 드러남을 보면 겉과 속이 같습니다.';
    expect(selfContradictions(body).length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// v5 실측 본문 — 자리+글자 강제가 살아 있는가
// ═══════════════════════════════════════════════════════════════════════════════
describe('⚠ v5 실측 본문 — 강제가 살아 있다', () => {
  // 이 파일의 v4 블록과 같은 방식으로 가져온다(정적 import 는 위쪽 블록이 쓰지 않는다).
  const { GENERATED_BODIES_V4, GENERATED_BODIES_V5 } = require('./famousBodySamples') as {
    GENERATED_BODIES_V4: readonly { key: string; body: string; chart: never }[];
    GENERATED_BODIES_V5: readonly { key: string; body: string; chart: never }[];
  };

  it.each(GENERATED_BODIES_V5.map((b) => [b.key, b] as const))(
    '%s: 투간·통근 주장이 하나도 미검증으로 남지 않는다', (_key, sample) => {
      expect(unverifiedFactClaims(sample.body, sample.chart as never)).toEqual([]);
    });

  it('판정된 통근 주장이 v4 보다 크게 늘었다 — 뭉뚱그린 문장이 사라졌다는 뜻', () => {
    const n5 = GENERATED_BODIES_V5.reduce(
      (a, b) => a + checkRootingClaims(b.body, b.chart as never).length, 0);
    const n4 = GENERATED_BODIES_V4.reduce(
      (a, b) => a + checkRootingClaims(b.body, b.chart as never).length, 0);
    // 실측: v4 14건 → v5 33건. 같은 명식·같은 검사기로 잰 값이다.
    expect(n5).toBeGreaterThan(n4 * 2);
    expect(n5).toBeGreaterThan(30);
  });

  it('투간 서술이 전부 자리+글자+천간자리 셋을 댄다', () => {
    for (const b of GENERATED_BODIES_V5) {
      for (const c of checkRevealedClaims(b.body, b.chart as never)) expect(c.matched).not.toBeNull();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// v8 — ⚠ **합성 반례.** 실측만으로는 규칙이 검증되지 않는다.
//
// clamp 트랙(v6)에서 규칙 후보 4개가 **실측 356문장 전부**에서 거짓 양성 0 이었는데, 프롬프트가
// 요구하는 정상 문장 62개를 새로 지어 돌리자 넷 다 깨졌다(FP 11·7·5·5).
// 관계 트랙(v7)이 합성 43/20 으로 그것을 막았다. 투간·통근에는 그 방어가 **없었다** — 이 파일이
// 지금까지 실측 본문만 회귀로 박아 왔기 때문이다. 여기서 채운다.
//
// ⚠⚠ **규칙을 넓히거나 좁힐 때는 이 두 집합을 반드시 다시 돌릴 것.** 실측 15편만 돌리고
//    "거짓 양성 0" 이라고 적으면 v6 과 같은 실수다.
//
// 스냅샷 둘:
//   EXACT  투간 년지 정→일간·시간 / 월지 정→일간·시간 / 일지 경→년간 / 시지 정→일간·시간
//          통근 년간 경 O(일지 사) / 월간 임 X / 일간 정 O(년지 오·월지 오·시지 미) / 시간 정 O(같음)
//   AUTUMN 투간 년지 기→일간 / 년지 정→시간 / 월지 신→월간 / 일지 신→월간 / 일지 기→일간
//          통근 년간 무 X / 월간 신 O(월지 유·일지 축) / 일간 기 O(년지 오·일지 축) / 시간 정 O(년지 오)
// ═══════════════════════════════════════════════════════════════════════════════════════════

const EX = SAMPLE_V4_EXACT_CHART as unknown as FamousChartSnapshot;
const AU = SAMPLE_V4_AUTUMN_CHART as unknown as FamousChartSnapshot;
const NH = SAMPLE_V4_NO_HOUR_CHART as unknown as FamousChartSnapshot;
const hs = (body: string) => `## 속에 있는 것과 드러난 것 — 지장간과 투간\n\n${body}`;

describe('⚠ v8 합성 반례 — 정상 문장 (거절 0)', () => {
  it.each([
    // ── 본문에 자리+글자를 정확히 쓴 투간 주장
    ['투간 · 년지 정', '년지 오의 지장간 정이 일간으로 투간되었습니다.', 'EX'],
    ['투간 · 년지 정 → 시간', '년지 오의 지장간 정은 시간으로도 투간되었습니다.', 'EX'],
    ['투간 · 월지 정', '월지 오의 지장간 정이 일간과 시간으로 투간되었습니다.', 'EX'],
    ['투간 · 일지 경', '일지 사의 지장간 경이 년간으로 투간되었습니다.', 'EX'],
    ['투간 · 시지 정', '시지 미의 지장간 정이 일간으로 투간되었습니다.', 'EX'],
    ['투간 · 년지 기', '년지 오의 지장간 기가 일간으로 투간되었습니다.', 'AU'],
    ['투간 · 월지 신', '월지 유의 지장간 신이 월간으로 투간되었습니다.', 'AU'],
    ['투간 · 일지 둘', '일지 축의 지장간 신은 월간으로, 기는 일간으로 투간되었습니다.', 'AU'],
    // ── 본문에 자리+글자를 정확히 쓴 통근 주장
    ['통근 · 일간 정 O', '일간 정은 년지 오와 월지 오와 시지 미에 뿌리를 두어 통근하고 있습니다.', 'EX'],
    ['통근 · 시간 정 O', '시간 정도 같은 세 지지에 통근하여 뿌리가 있습니다.', 'EX'],
    ['통근 · 년간 경 O', '년간 경은 일지 사에 뿌리를 두어 통근이 있습니다.', 'EX'],
    ['통근 · 일간 기 O', '일간 기는 년지 오와 일지 축에 뿌리를 두어 통근합니다.', 'AU'],
    ['통근 · 월간 신 O', '월간 신은 월지 유와 일지 축에 통근하여 자리가 단단합니다.', 'AU'],
    ['통근 · 시간 정 O (가을)', '시간 정은 년지 오에 뿌리를 두어 통근이 있습니다.', 'AU'],
    ['통근 · 둘을 한 문장에', '일간 기는 통근이 있고 월간 신도 통근이 있습니다.', 'AU'],
    ['통근 · 있음과 없음 대비', '통근이 있는 일간 기와 통근이 없는 년간 무는 다르게 읽습니다.', 'AU'],
    // ── 통근 부재 주장 (부재도 주장이다 — 극성이 맞아야 통과)
    ['부재 · 월간 임 X', '월간 임은 통근이 없어 뜬 글자입니다.', 'EX'],
    ['부재 · 월간 임 X (뿌리)', '월간 임은 지지에 뿌리를 두지 못했습니다.', 'EX'],
    ['부재 · 년간 무 X', '년간 무는 통근이 없어 떠 있는 글자입니다.', 'AU'],
    ['부재 · 년간 무 X (관형형)', '통근이 없는 년간 무는 뜬 글자로 읽습니다.', 'AU'],
    ['부재 · 이중부정', '일간 기는 통근이 있어 뜬 글자가 아닙니다.', 'AU'],
    // ── 개념 정의문 (자리+글자를 대지 않음 — 대조 대상이 아니다)
    ['정의 · 투간', '투간(投干)은 지지 속에 숨은 글자가 천간으로 드러나는 것을 말합니다.', 'EX'],
    ['정의 · 통근', '통근(通根)은 천간이 지지 속에 같은 오행의 뿌리를 두는 것입니다.', 'EX'],
    ['정의 · 지장간', '지장간(地藏干)은 지지 안에 숨어 있는 천간을 가리킵니다.', 'AU'],
    ['정의 · 뜬 글자', '뿌리가 없는 천간을 뜬 글자라고 부릅니다.', 'AU'],
    ['정의 · 여기·중기·정기', '지장간은 여기·중기·정기로 나뉘며 정기가 그 지지의 본래 기운입니다.', 'AU'],
    // ── ⚠ 근거 괄호에만 자리+글자가 있는 정상형 (v4~v7 본문의 다수가 이 모양이다)
    ['근거에만 ①', '통근이 있는 쪽과 없는 쪽의 대비가 읽기의 출발점입니다 (근거: 일간 정 통근 O · 월간 임 통근 X).', 'EX'],
    ['근거에만 ②', '겉으로 드러난 글자와 속에 남은 글자가 갈립니다 (근거: 년지 오의 정이 일간으로 투간되었습니다).', 'EX'],
    ['근거에만 ③', '뿌리의 유무가 이 명식을 읽는 첫 갈림길입니다 (근거: 일간 기 통근 O · 년간 무 통근 X).', 'AU'],
    ['근거에만 ④', '속에 있던 것이 겉으로 올라온 자리가 있습니다 (근거: 월지 유의 지장간 신이 월간으로 투간되었습니다).', 'AU'],
    ['근거에만 ⑤', '천간마다 사정이 다릅니다 (근거: 년간 무 통근 X · 월간 신 통근 O · 일간 기 통근 O · 시간 정 통근 O).', 'AU'],
    // ── ⚠ 일상어 겹침. "통근" 은 통근버스·통근시간과 겹친다 — 실제로 걸린 전례가 있다.
    ['일상어 · 통근버스', '일간 정이 통근버스를 타는 이야기는 이 글과 무관합니다.', 'EX'],
    ['일상어 · 통근시간', '월간 임의 통근시간을 말하는 것이 아닙니다.', 'EX'],
    ['일상어 · 통근길', '일간 기의 통근길이라는 뜻이 아닙니다.', 'AU'],
    ['일상어 · 통근거리', '년간 무의 통근거리를 재는 말이 아닙니다.', 'AU'],
    // ── 조건·가정문 (다른 명식을 가정하는 문장은 이 명식의 주장이 아니다)
    ['조건 ①', '일간 정이 통근이 없었다면 읽는 방향이 달라졌을 것입니다.', 'EX'],
    ['조건 ②', '같은 일간이라도 월간 임처럼 통근이 없으면 뜬 글자가 됩니다.', 'EX'],
    ['조건 ③', '만약 일간 기가 통근하지 못한 경우라면 다른 방향으로 읽습니다.', 'AU'],
    // ── 절차·읽는 법
    ['절차 ①', '먼저 각 천간에 통근이 있는지부터 확인하는 습관을 들이십시오.', 'AU'],
    ['절차 ②', '다음으로 지장간이 어느 천간으로 투간되었는지를 자리와 글자로 적어 두십시오.', 'AU'],
    ['절차 ③', '통근과 투간을 함께 보면 겉과 속의 차이가 보입니다.', 'EX'],
  ])('%s — 통과한다', (_label, sentence, key) => {
    expect(unverifiedFactClaims(hs(sentence), key === 'EX' ? EX : AU)).toEqual([]);
  });
});

describe('⚠ v8 합성 반례 — 틀린 문장 (전부 잡힌다)', () => {
  it.each([
    // ── 자리는 맞고 글자가 틀림
    ['투간 · 년지의 글자 틀림', '년지 오의 지장간 신이 일간으로 투간되었습니다.', 'EX'],
    ['투간 · 일지의 글자 틀림', '일지 사의 지장간 정이 년간으로 투간되었습니다.', 'EX'],
    ['통근 · 일간의 글자 틀림', '일간 무는 년지 오에 뿌리를 두어 통근하고 있습니다.', 'EX'],
    ['통근 · 월간의 글자 틀림', '월간 계는 월지 유에 통근하여 자리가 단단합니다.', 'AU'],
    // ── 글자는 맞고 자리가 틀림
    ['투간 · 드러난 자리 틀림', '년지 오의 지장간 정이 월간으로 투간되었습니다.', 'EX'],
    ['투간 · 지지 자리 틀림', '시지 미의 지장간 경이 년간으로 투간되었습니다.', 'EX'],
    ['통근 · 자리 틀림', '시간 신은 월지 유에 뿌리를 두어 통근합니다.', 'AU'],
    ['통근 · 뿌리 자리 틀림', '일간 정은 일지 사에 뿌리를 두어 통근하고 있습니다.', 'EX'],
    // ── 엔진이 판정하지 않은 투간·통근
    ['없는 투간 ①', '월지 오의 지장간 기가 시간으로 투간되었습니다.', 'EX'],
    ['없는 투간 ②', '일지 축의 지장간 계가 년간으로 투간되었습니다.', 'AU'],
    ['없는 통근 ①', '월간 임은 월지 오에 뿌리를 두어 통근합니다.', 'EX'],
    ['없는 통근 ②', '년간 무는 년지 오에 뿌리를 두어 통근하고 있습니다.', 'AU'],
    // ── 근거만 맞고 본문이 틀림 (관계에서 v6 의 실제 오류가 이 형태였다)
    ['근거만 맞음 · 투간', '일지 사의 지장간 정이 일간으로 투간되었습니다 (근거: 년지 오의 정이 일간으로 투간).', 'EX'],
    ['근거만 맞음 · 통근', '월간 임은 일지 사에 뿌리를 두어 통근합니다 (근거: 년간 경 통근 O — 일지 사).', 'EX'],
    ['근거만 맞음 · 통근 2', '년간 무는 년지 오에 통근하고 있습니다 (근거: 일간 기 통근 O — 년지 오·일지 축).', 'AU'],
    // ── ⚠ v4 의 실제 오류
    ['⚠ v4 실측 · 없는 투간', '일지 사의 지장간 정이 일간의 비견 쪽으로 투간되었습니다.', 'EX'],
    ['⚠ v4 실측 · 자리 묶어 쓰기', '년·월간의 임이 지지에 뿌리를 두어 통근합니다.', 'EX'],
    // ── 극성 뒤집힘
    ['극성 · 있는데 없다고', '일간 정은 통근이 없어 뜬 글자입니다.', 'EX'],
    ['극성 · 없는데 있다고', '월간 임은 년지 오에 뿌리를 두어 통근이 있습니다.', 'EX'],
    ['극성 · 없는데 있다고 2', '년간 무는 통근하여 뿌리가 단단합니다.', 'AU'],
  ])('%s — 잡힌다', (_label, sentence, key) => {
    expect(unverifiedFactClaims(hs(sentence), key === 'EX' ? EX : AU).length).toBeGreaterThan(0);
  });
});

describe('⚠ v8 검사기 거짓 양성 — 실측 1건 (정상 본문을 거절했다)', () => {
  // v8 재생성 ③ 이 이 문장 때문에 422 로 거절됐다. **사실은 맞는 문장**이다(년간 무는 통근 X).
  // 원인: 부정 관형형(`통근이 없는`)과 짝(`년간 무`) 사이에 **꾸밈받는 명사**(`천간은`)가 끼었다.
  // 관형형이 짝에 바로 붙어야 한다는 조건이라 부재 주장을 긍정으로 오판했다.
  // ⚠ 이 트랙의 변경(소유격 허용) 때문이 **아니다** — `년간 무` 는 평범한 공백 짝이다.
  //   전부터 있던 구멍이 이번 생성에서 처음 밟혔고, LLM 콜 하나를 태웠다.
  it.each([
    ['⚠ 실측 — 거절됐던 문장', '통근이 없는 천간은 년간 무 하나여서 뜬 천간이 섞여 있습니다 (근거: 년간 무 통근 X).', 'AU', true],
    ['같은 형태 · 글자만 다름', '통근이 없는 글자는 월간 임 하나입니다.', 'EX', true],
    ['관형형 직결 (기존 동작 유지)', '통근이 없는 월간 임은 뜬 글자입니다.', 'EX', true],
    // ⚠ 넓히면서 옮아붙기가 생기지 않았는지. `없고` 는 연결어미라 관형형 정규식에 안 걸린다.
    ['⚠ 옮아붙기 방지 — 앞 짝의 부정이 뒤로 가지 않는다', '일간 정은 통근이 없고, 월간 임은 뿌리가 없습니다.', 'EX', false],
    ['⚠ 극성 뒤집힘은 여전히 잡힌다', '통근이 없는 천간은 일간 정 하나입니다.', 'EX', false],
    // ⚠ 두 번째 실측 거짓 양성 (v8 ② 재시도에서 또 거절됐다). 관형형과 다음 짝 사이에
    //   꾸밈받는 명사(`천간(`)가 끼어 꼬리 자르기가 안 먹었고, 뒤 짝의 부정이 앞 짝을 뒤집었다.
    ['⚠ 실측 — 두 번째로 거절됐던 문장', '통근이 있는 일간(일간 계)과 통근이 없는 천간(년간 갑·월간 병)을 구분해야 합니다.', 'NH', true],
    ['서술 명사는 여전히 안 잘린다 — 극성 유지', '일간 정은 통근이 없는 상태입니다.', 'EX', false],
  ])('%s', (_label, sentence, key, shouldPass) => {
    const chart = key === 'EX' ? EX : key === 'NH' ? NH : AU;
    const n = unverifiedFactClaims(hs(sentence), chart).length;
    if (shouldPass) expect(n).toBe(0);
    else expect(n).toBeGreaterThan(0);
  });
});

describe('⚠ v8 — 분모를 나눈다', () => {
  // v4~v7 내내 "통근 14/14 · 34/34 · 20/20 · 29/29" 로 보고했는데 그 숫자는 **근거 인용**을
  // 대부분 세고 있었다. 본문 기준으로는 2/2 · 7/7 · 3/3 · 3/3 이다.
  // ⚠ 검사를 좁히지는 않았다 — 근거도 독자가 읽는 글자이고, 실측에서 근거만 넣었을 때
  //   투간 9/9 · 통근 77/77 전부 일치했다. 틀린 것은 검사가 아니라 **숫자의 이름표**였다.
  it('본문 주장과 근거 인용을 따로 센다', () => {
    const body = hs(
      '일간 정은 년지 오와 월지 오와 시지 미에 뿌리를 두어 통근하고 있습니다. '
      + '통근이 있는 쪽과 없는 쪽의 대비가 읽기의 출발점입니다 (근거: 월간 임 통근 X).',
    );
    const c = factClaimCounts(body, EX);
    expect(c.rooting.bodyClaims).toBe(1);
    expect(c.rooting.bodyMatched).toBe(1);
    expect(c.rooting.evidenceOnlyClaims).toBe(1);
    expect(c.rooting.evidenceOnlyMatched).toBe(1);
  });

  it('근거가 없으면 근거 몫은 0이다', () => {
    const c = factClaimCounts(hs('일간 정은 년지 오에 뿌리를 두어 통근합니다.'), EX);
    expect(c.rooting).toEqual({ bodyClaims: 1, bodyMatched: 1, evidenceOnlyClaims: 0, evidenceOnlyMatched: 0 });
  });

  it('투간도 같은 형식으로 나온다', () => {
    const c = factClaimCounts(
      hs('년지 오의 지장간 정이 일간으로 투간되었습니다. 겉과 속이 갈립니다 (근거: 일지 사의 경이 년간으로 투간되었습니다).'),
      EX,
    );
    expect(c.revealed.bodyClaims).toBe(1);
    expect(c.revealed.evidenceOnlyClaims).toBe(1);
  });
});

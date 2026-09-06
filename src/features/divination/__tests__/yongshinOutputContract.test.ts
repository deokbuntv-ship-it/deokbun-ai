// 용신 출력 계약 — YONGSHIN_CONSISTENCY_AUDIT (2026-09-02) 수리분 회귀 방지.
//
// 이 파일이 막는 것은 **판정**이 아니라 **출력**이다. 어떤 오행이 용신인가는 기존 테스트가 잠근다.
// 여기서 잠그는 것은 넷이다:
//   F1  근거 문장이 계절 지원을 없는데 있다고 말하지 않는다
//   N3  희신 목록에 같은 오행이 두 번 들어가지 않는다
//   F2  용신을 못 정했다고 선언한 결과가 기신은 단언하지 않는다
//   N12 19장 중 13장이 도는 경로(ANCHORED + 억부 단독)의 status/primaryCandidate
// 감사 전에는 **출력 한국어 문장을 검증하는 테스트가 레포 전체에 0건**이었다. 그래서 F1 이 실제
// 전달문으로 나가면서도 CI 를 통과했다.
import { judgeMyungriYongshin } from '@/features/divination/myungriYongshin';
import type { MyungriStructuralV2Result, SeasonRoleFact, StructuralState } from '@/features/divination/myungriStructuralV2';
import { buildMyungriPremises } from '@/features/divination/reasoning/myungriPremises';
import type { TenGodFamily } from '@/features/divination/myungriJudge';
import type { FiveElement } from '@/features/interpretation';

/** 실제 runCore 가 내보내는 AVAILABLE 모양. 판정 로직을 우회해 특정 상태만 정확히 만든다. */
const sv2 = (o: {
  state: StructuralState; season: SeasonRoleFact; dmEl: FiveElement;
  special?: 'NONE_DETECTED' | 'CANDIDATE';
}): MyungriStructuralV2Result => ({
  capability: 'AVAILABLE',
  ruleVersion: 'deokbunai.myungri-structural-v2.judgment-graph.v3.1.0',
  graphVersion: 'v3.1.0',
  dayMaster: o.dmEl === 'EARTH' ? 'WU' : o.dmEl === 'WOOD' ? 'JIA' : o.dmEl === 'FIRE' ? 'BING' : o.dmEl === 'METAL' ? 'GENG' : 'REN',
  dayMasterElement: o.dmEl,
  hourKnown: true,
  structuralState: o.state,
  rootFact: o.state === 'UNANCHORED' ? 'ROOT_EXISTS_FALSE' : 'ROOT_EXISTS_TRUE',
  seasonFact: o.season,
  strengthView: {
    classification: o.state === 'ANCHORED' ? 'STRONG_LEANING' : o.state === 'UNANCHORED' ? 'WEAK_LEANING' : 'MIXED_EVIDENCE',
    evidence: [], doesNotImply: [], reasoningNodeIds: [],
  },
  specialStructureStatus: { status: o.special ?? 'NONE_DETECTED', evidence: [], doesNotImply: [], reasoningNodeIds: [] },
  confidenceClass: 'HIGH',
  numerousnessEvidence: { supportCount: 0, drainCount: 0, incompleteCount: false },
  taskCapacities: 'NOT_EVALUATED', reasoningTrace: [], schoolSensitiveFlags: [],
} as MyungriStructuralV2Result);

const only = (...fs: TenGodFamily[]) => (f: TenGodFamily) => fs.includes(f);
const NONE = () => false;
const allText = (r: ReturnType<typeof judgeMyungriYongshin>) =>
  [...r.candidates.flatMap((c) => [c.reasoning, ...c.evidence.map((e) => e.meaning)]),
    ...r.reasoning.map((x) => x.conclusion), ...r.uncertaintyReasons].join('\n');

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe('F1 — 없는 계절 지원을 사실로 말하지 않는다', () => {
  // 休(XIU)는 NEUTRAL 로 사상되고, NEUTRAL 은 뿌리만으로 ANCHORED 를 만든다. 계절은 아무것도 주지 않았다.
  it('ANCHORED + NEUTRAL 계절: "계절 양쪽에서 힘을 받는다"고 말하지 않는다', () => {
    const r = judgeMyungriYongshin({
      structuralV2: sv2({ state: 'ANCHORED', season: 'NEUTRAL', dmEl: 'FIRE' }),
      branchClashes: [], familyExists: only('OUTPUT'),
    });
    expect(r.status).toBe('SELECTED');
    const text = allText(r);
    expect(text).not.toContain('뿌리와 계절 양쪽에서 힘을 받');
    expect(text).toContain('계절은 힘을 더하지도 빼지도 않');
  });

  it('ANCHORED + 실제로 계절이 받쳐 주는 경우: 기존 문장을 그대로 쓴다', () => {
    for (const season of ['IN_COMMAND', 'SUPPORTED'] as SeasonRoleFact[]) {
      const r = judgeMyungriYongshin({
        structuralV2: sv2({ state: 'ANCHORED', season, dmEl: 'FIRE' }),
        branchClashes: [], familyExists: only('OUTPUT'),
      });
      expect(allText(r)).toContain('뿌리와 계절 양쪽에서 힘을 받아');
    }
  });

  it('UNANCHORED 문장은 부정 진술이라 세 계절 전부에서 참이다 — 건드리지 않았다', () => {
    for (const season of ['NEUTRAL', 'DRAINED', 'OPPOSED'] as SeasonRoleFact[]) {
      const r = judgeMyungriYongshin({
        structuralV2: sv2({ state: 'UNANCHORED', season, dmEl: 'METAL' }),
        branchClashes: [], familyExists: NONE,
      });
      expect(allText(r)).toContain('뿌리도 계절의 도움도 받지 못해');
    }
  });

  // 사용자에게 실제로 나가는 쌍둥이. 감사 시점에 docs/DIVINATION_QA_PACK.md 에 거짓 문장으로 기록돼 있었다.
  it('전제(premise) 문장도 같이 고쳐졌다 — 이쪽이 실제 전달문이다', () => {
    const premisesFor = (season: SeasonRoleFact) => buildMyungriPremises({
      subject: '본인', questionIntent: 'OUTCOME', askedAxis: 'GENERAL',
      baseline: null, layers: [], reliability: 'EXACT',
      structuralV2: sv2({ state: 'ANCHORED', season, dmEl: 'FIRE' }),
    }).map((p) => p.assertion).join('\n');

    expect(premisesFor('NEUTRAL')).not.toContain('계절과 뿌리 양쪽에서 힘을 받는');
    expect(premisesFor('NEUTRAL')).toContain('뿌리에서 힘을 받고, 계절은 힘을 더하지도 빼지도 않는');
    expect(premisesFor('IN_COMMAND')).toContain('계절과 뿌리 양쪽에서 힘을 받는');
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe('N3 — 희신 목록에 같은 오행이 두 번 들어가지 않는다', () => {
  // 배출구 계열이 정확히 하나면 runEokbu 의 `?? chosen` 폴백이 supporting === primary 를 만든다.
  // 억부+통관 SELECTED 경로가 중재자만 걸러 내던 탓에 ['METAL','METAL'] 이 남아
  // "함께 쓸 수 있는 방향은 금(金), 금(金)입니다."로 출고됐다.
  it('EARTH 일간 / ANCHORED / OUTPUT 계열만 존재 / 子午충', () => {
    const r = judgeMyungriYongshin({
      structuralV2: sv2({ state: 'ANCHORED', season: 'IN_COMMAND', dmEl: 'EARTH' }),
      branchClashes: [{ branches: ['ZI', 'WU'] }], familyExists: only('OUTPUT'),
    });
    expect(r.status).toBe('SELECTED');
    expect(new Set(r.supportingCandidates).size).toBe(r.supportingCandidates.length);
    expect(r.supportingCandidates).not.toContain(r.primaryCandidate);
  });

  it('어떤 조합에서도 희신은 중복되지 않고 용신을 포함하지 않는다', () => {
    const combos: TenGodFamily[][] = [[], ['OUTPUT'], ['WEALTH'], ['OFFICER'], ['OUTPUT', 'WEALTH'], ['OUTPUT', 'WEALTH', 'OFFICER']];
    for (const state of ['ANCHORED', 'UNANCHORED', 'MIXED_STRUCTURE'] as StructuralState[]) {
      for (const dmEl of ['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'] as FiveElement[]) {
        for (const clash of [[], [{ branches: ['ZI', 'WU'] }], [{ branches: ['YIN', 'SHEN'] }]]) {
          for (const fams of combos) {
            const r = judgeMyungriYongshin({
              structuralV2: sv2({ state, season: 'IN_COMMAND', dmEl }),
              branchClashes: clash as never[], familyExists: only(...fams),
            });
            const label = `${state}/${dmEl}/clash${clash.length}/${fams.join('+') || 'none'}`;
            expect(`${label}:${new Set(r.supportingCandidates).size}`).toBe(`${label}:${r.supportingCandidates.length}`);
            if (r.primaryCandidate) expect(`${label}:${r.supportingCandidates.includes(r.primaryCandidate)}`).toBe(`${label}:false`);
          }
        }
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe('F2 — 용신을 못 정했으면 기신도 단언하지 않는다', () => {
  it('MULTI_CANDIDATE 는 용신·희신·기신이 모두 비어 있다', () => {
    // WOOD 일간 / ANCHORED / 子午충 → 중재자 WOOD = PEER → worsens → MULTI_CANDIDATE
    const r = judgeMyungriYongshin({
      structuralV2: sv2({ state: 'ANCHORED', season: 'IN_COMMAND', dmEl: 'WOOD' }),
      branchClashes: [{ branches: ['ZI', 'WU'] }], familyExists: only('OUTPUT'),
    });
    expect(r.status).toBe('MULTI_CANDIDATE');
    expect(r.primaryCandidate).toBeNull();
    expect(r.supportingCandidates).toEqual([]);
    expect(r.contraindicatedCandidates).toEqual([]);
    // 두 후보는 근거로는 남는다 — 버린 것은 "정했다"는 주장뿐이다.
    expect(r.treatmentRationalesFired).toEqual(expect.arrayContaining(['EOKBU', 'TONGGWAN']));
    expect(r.candidates.length).toBeGreaterThanOrEqual(2);
  });

  it('SELECTED 는 기신을 정상적으로 낸다 — 비우기가 과잉 적용되지 않았다', () => {
    const r = judgeMyungriYongshin({
      structuralV2: sv2({ state: 'ANCHORED', season: 'IN_COMMAND', dmEl: 'FIRE' }),
      branchClashes: [], familyExists: only('OUTPUT'),
    });
    expect(r.status).toBe('SELECTED');
    expect(r.contraindicatedCandidates).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
describe('N12 — ANCHORED + 억부 단독 경로 (실측 19장 중 13장이 도는 길)', () => {
  // 감사 전 이 경로의 status/primaryCandidate 를 단언하는 테스트가 레포에 없었다.
  // 억부 SELECTED 커버리지는 UNANCHORED 에만 있었다.
  const cases: { fams: TenGodFamily[]; want: TenGodFamily }[] = [
    { fams: ['OUTPUT', 'WEALTH', 'OFFICER'], want: 'OUTPUT' },
    { fams: ['WEALTH', 'OFFICER'], want: 'WEALTH' },   // OUTPUT 없으면 WEALTH 로 내려간다
    { fams: ['OFFICER'], want: 'OFFICER' },            // 둘 다 없을 때만 OFFICER 가 용신이 된다
  ];
  it.each(cases)('배출구 사다리 OUTPUT>WEALTH>OFFICER — 존재하는 첫 계열이 용신 ($want)', ({ fams, want }) => {
    const r = judgeMyungriYongshin({
      structuralV2: sv2({ state: 'ANCHORED', season: 'IN_COMMAND', dmEl: 'EARTH' }),
      branchClashes: [], familyExists: only(...fams),
    });
    expect(r.status).toBe('SELECTED');
    expect(r.primaryCandidate).not.toBeNull();
    expect(r.treatmentRationalesFired).toEqual(['EOKBU']);
    // EARTH 일간 기준: OUTPUT=METAL, WEALTH=WATER, OFFICER=WOOD, RESOURCE=FIRE
    const expectEl = { OUTPUT: 'METAL', WEALTH: 'WATER', OFFICER: 'WOOD' }[want as 'OUTPUT' | 'WEALTH' | 'OFFICER'];
    expect(r.primaryCandidate).toBe(expectEl);
    expect(r.contraindicatedCandidates).toEqual(['FIRE']); // ANCHORED 의 기신은 언제나 RESOURCE
  });

  it('배출구 계열이 하나도 없으면 용신을 세우지 않는다', () => {
    const r = judgeMyungriYongshin({
      structuralV2: sv2({ state: 'ANCHORED', season: 'IN_COMMAND', dmEl: 'EARTH' }),
      branchClashes: [], familyExists: NONE,
    });
    expect(r.status).toBe('UNRESOLVED');
    expect(r.primaryCandidate).toBeNull();
    expect(r.treatmentRationalesFired).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// F8 — 자가 매치. 서버가 스스로 만드는 문장이 서버 자신의 금지 규칙에 걸리면, 같은 문장이
// LLM 출력에 있을 때는 답변 전체가 폐기되고 서버가 쓸 때는 그대로 출고된다. 그 비대칭을 막는다.
describe('F8 — 서버가 만든 명리 문장이 FORBIDDEN_THEORY 에 걸리지 않는다', () => {
  // structuredConsultation.ts:264 와 **같은** 패턴. 한쪽만 바뀌면 아래 대조 테스트가 깨진다.
  const FORBIDDEN_THEORY =
    /((당신[은는]?\s*)?신강[한\s]*(사주|입니다|합니다|이에요)|(당신[은는]?\s*)?신약[한\s]*(사주|입니다|합니다|이에요)|용신(은|이)\s*(?!아직|없|미|계산|불명|모름|따로|판정|확정되지|정해지지)\S|격국(은|이)\s*(?!아직|없|미|계산|불명|모름|따로|판정|확정되지|정해지지)\S|(12|십이)\s*운성|(12|십이)\s*신살)/;

  it('테스트의 패턴 사본이 원본과 동일하다', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const src = fs.readFileSync(
      path.join(__dirname, '../../chat/prompts/structuredConsultation.ts'), 'utf8',
    );
    expect(src).toContain(FORBIDDEN_THEORY.source.replace(/^\(|\)$/g, ''));
  });

  it('myungriConsultationJudge 가 만드는 모든 한국어 문장이 통과한다', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    const src = fs.readFileSync(path.join(__dirname, '../myungriConsultationJudge.ts'), 'utf8');
    const offenders: string[] = [];
    src.split('\n').forEach((line, i) => {
      if (/^\s*(\/\/|\*)/.test(line)) return; // 주석 제외
      for (const lit of line.match(/'([^']*[가-힣][^']*)'/g) ?? []) {
        const text = lit.slice(1, -1);
        if (FORBIDDEN_THEORY.test(text)) offenders.push(`:${i + 1} ${text.slice(0, 60)}`);
      }
    });
    expect(offenders).toEqual([]);
  });

  it('정직한 부정 진술은 통과하고, 단정은 여전히 막힌다', () => {
    expect(FORBIDDEN_THEORY.test('용신이 확정되지 않아 이 흐름을 길흉으로 단정하지 않습니다.')).toBe(false);
    expect(FORBIDDEN_THEORY.test('용신이 아직 계산되지 않았습니다.')).toBe(false);
    expect(FORBIDDEN_THEORY.test('용신이 확정되었습니다.')).toBe(true);
    expect(FORBIDDEN_THEORY.test('당신 용신이 화입니다.')).toBe(true);
    expect(FORBIDDEN_THEORY.test('당신은 신강한 사주입니다.')).toBe(true);
  });
});

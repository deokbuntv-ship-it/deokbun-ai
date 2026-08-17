// Structured consultation LIVE rendering (fixes: gpt-5-mini structured JSON rendered as raw text). Proves
// a realistic structured payload becomes a CARD (structuredResult), and — critically — raw JSON is NEVER
// user-facing on success (§4), while semantic rejection + prose fallback are preserved.
import { createHash } from 'crypto';

import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import {
  classifyConsultationOutput,
  SEMANTIC_REJECTION_MESSAGE,
} from '@/features/chat/prompts/structuredConsultation';
import { buildServerConsultation } from '@/features/chat/server';
import type { ServerConsultationDeps } from '@/features/chat/server';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

const G = GROUNDING_UNAVAILABLE;
const RAW_MARKER = /"(coreSummary|coreInterpretation|strengths|domainInterpretation)"\s*:/;

// A realistic gpt-5-mini answer: a CONCISE core (< 120 chars) but rich supporting sections — the shape
// that previously dropped to raw-text fallback.
const richConcise = {
  coreSummary: '차분하지만 안으로 추진력을 갖춘 흐름입니다.',
  // Concise core (< 120 chars) — exercises the relaxed gate; the substance comes from the sections below.
  coreInterpretation:
    '일간을 중심으로 보면 차분함과 추진력이 균형을 이루는 구조이며, 월지의 기운이 이를 뒷받침하는 안정적인 흐름입니다.',
  strengths: ['끈기 있게 목표를 향해 꾸준히 쌓아 올리는 지속력', '상황의 균형을 읽고 침착하게 판단하는 넓은 시야'],
  cautions: ['조급하게 서두르면 오히려 흐름이 흐트러질 수 있으니 속도를 조절하는 편이 좋습니다'],
  domainInterpretation: [
    { title: '일·직업', body: '안정적인 기반 위에서 점진적으로 성장하는 방식이 잘 맞으며, 급격한 변화보다 축적이 유리합니다.' },
  ],
  futureFlow: '',
  followUps: ['어떤 분야가 잘 맞을까요?'],
};
const json = (o: unknown) => JSON.stringify(o);

describe('valid structured payload → ACCEPTED card (raw JSON never shown)', () => {
  it('rich answer with a CONCISE core is ACCEPTED (the owner failure case)', () => {
    const o = classifyConsultationOutput(json(richConcise), G);
    expect(o.kind).toBe('ACCEPTED');
  });
  it('accepts fenced JSON, preamble+JSON, and a trailing comma', () => {
    expect(classifyConsultationOutput('```json\n' + json(richConcise) + '\n```', G).kind).toBe('ACCEPTED');
    expect(classifyConsultationOutput('다음은 상담 결과입니다.\n' + json(richConcise), G).kind).toBe('ACCEPTED');
    const trailing = json(richConcise).replace(/]/g, ',]').replace(/}$/, ',}');
    expect(classifyConsultationOutput(trailing, G).kind).toBe('ACCEPTED');
  });
  it('a long-core answer is still ACCEPTED (existing behavior preserved)', () => {
    const longCore = {
      ...richConcise,
      coreInterpretation:
        '일간을 중심으로 보면 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. ' +
        '꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.',
    };
    expect(classifyConsultationOutput(json(longCore), G).kind).toBe('ACCEPTED');
  });
});

describe('§4 raw JSON must NEVER be user-facing', () => {
  it('a parseable-but-shallow JSON payload → readable prose fallback, NOT raw JSON', () => {
    const shallow = { coreSummary: '차분한 흐름', coreInterpretation: '차분합니다.' }; // fails the card gate
    const o = classifyConsultationOutput(json(shallow), G);
    expect(o.kind).toBe('STRUCTURAL_FALLBACK');
    if (o.kind === 'STRUCTURAL_FALLBACK') {
      expect(o.text).not.toMatch(RAW_MARKER); // no raw JSON keys
      expect(o.text.trim().startsWith('{')).toBe(false);
      expect(o.text).toContain('차분한 흐름'); // salvaged readable content
    }
  });
  it('an UNPARSEABLE JSON-like payload → safe message (never the raw braces)', () => {
    const broken = '{ "coreSummary": "차분", "coreInterpretation": "일간을 보면 균형이 있다" '; // missing close
    const o = classifyConsultationOutput(broken, G);
    expect(o.kind).toBe('SEMANTIC_REJECTED'); // caller renders SEMANTIC_REJECTION_MESSAGE
    // whatever the caller shows, it is the safe message, not the raw JSON
    expect(SEMANTIC_REJECTION_MESSAGE).not.toMatch(RAW_MARKER);
  });
});

describe('safety preserved', () => {
  it('genuine prose (non-JSON) still passes through as STRUCTURAL_FALLBACK', () => {
    const o = classifyConsultationOutput('안녕하세요. 어떤 점이 궁금하신가요?', G);
    expect(o.kind).toBe('STRUCTURAL_FALLBACK');
    if (o.kind === 'STRUCTURAL_FALLBACK') expect(o.text).toContain('궁금');
  });
  it('a structured payload asserting fake 3-engine consensus → SEMANTIC_REJECTED (no raw JSON)', () => {
    const bad = { ...richConcise, coreInterpretation: richConcise.coreInterpretation + ' 세 학문이 완전히 일치합니다.' };
    expect(classifyConsultationOutput(json(bad), G).kind).toBe('SEMANTIC_REJECTED');
  });
});

describe('end-to-end: server returns structuredResult for a realistic answer', () => {
  const digestProvider: DigestProvider = { async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
  const birth: BirthInfoDraft = {
    displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
    birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
  };
  const deps = (answer: string): ServerConsultationDeps => ({
    digestProvider, nowEpochSeconds: Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000), async callLLM() { return answer; },
  });
  beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

  it('rich concise-core JSON → structuredResult populated (card path), text is not raw JSON', async () => {
    const r = await buildServerConsultation({ birthInput: birth, question: '제 타고난 성격은?' }, deps(json(richConcise)));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.structuredResult).toBeDefined();
      expect(r.text).not.toMatch(RAW_MARKER); // the human-readable mirror is never raw JSON
    }
  });
});

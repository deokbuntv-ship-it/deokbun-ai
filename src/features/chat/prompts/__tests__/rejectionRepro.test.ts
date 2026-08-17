// Natal personality consultation — validator contract + safe rejection diagnostics. Reproduces the owner
// case: "내 성격의 장단점을 알려줘" with Myungri + Ziwei available and Qimen NOT_APPLICABLE. Proves a valid
// two-engine answer is ACCEPTED, the forbidden classes are rejected, and the exact reason is reported.
import { createHash } from 'crypto';

import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import {
  classifyConsultationOutput,
  firstStructuredRejectionReason,
} from '@/features/chat/prompts/structuredConsultation';
import { buildServerConsultation } from '@/features/chat/server';
import type { ServerConsultationDeps } from '@/features/chat/server';
import { buildConsultationGrounding } from '@/features/chat/services/consultationGrounding';
import type { BirthInfoDraft, ConsultationDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

const digestProvider: DigestProvider = { async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
const NOW = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);
const birth: BirthInfoDraft = {
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
  birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
};
const draft: ConsultationDraft = { subject: { id: 's', displayName: '테스트', relationship: null }, birthInfo: birth };
const support = {
  strengths: ['끈기 있게 목표를 향해 꾸준히 쌓아 올리는 지속력', '상황의 균형을 읽고 침착하게 판단하는 넓은 시야'],
  cautions: ['조급하게 서두르면 오히려 흐름이 흐트러질 수 있으니 속도를 조절하는 편이 좋습니다'],
  domainInterpretation: [{ title: '일·직업', body: '안정적인 기반 위에서 점진적으로 성장하는 방식이 잘 맞으며 축적이 유리합니다.' }],
  followUps: ['어떤 분야가 잘 맞을까요?'],
};
const answer = (core: string) => JSON.stringify({ coreSummary: '차분하지만 추진력을 갖춘 흐름입니다.', coreInterpretation: core, ...support });

const CLEAN = '일간을 중심으로 보면 차분함과 추진력이 균형을 이루는 구조이며, 월지의 기운이 이를 뒷받침하는 안정적인 흐름입니다.';
const PER_PERSPECTIVE = '명리에서는 안정적인 기운이, 자미두수에서는 유연한 대인관계가 각각 다른 각도에서 드러나는 흐름입니다.';
const SIN_GANG = '신강한 사주라 주관이 뚜렷하고 자기 확신이 강한 편이며 스스로 밀고 나가는 힘이 있습니다.';
const CROSS = '사주와 자미두수에서 모두 대인관계가 원만하고 좋게 나타나는 편입니다.';
const QIMEN = '기문에서 보면 현재 흐름이 유리하게 열려 있습니다.';
const THREE = CLEAN + ' 세 학문이 완전히 일치합니다.';

describe('natal Myungri+Ziwei, Qimen not_applicable — validator contract', () => {
  let G: Awaited<ReturnType<typeof buildConsultationGrounding>>;
  beforeAll(async () => {
    clearZiweiCache(); clearQimenCache();
    G = await buildConsultationGrounding(draft, { digestProvider, nowEpochSeconds: NOW }, '내 성격의 장단점을 알려줘');
  });

  it('grounding is Myungri + Ziwei available, Qimen not_applicable', () => {
    expect(G.status).toBe('available');
    if (G.status === 'available') {
      expect(G.evidence.myungri.availability).toBe('available');
      expect(G.evidence.ziwei.availability).toBe('available');
      expect(G.evidence.qimen.availability).toBe('not_applicable');
    }
  });

  it('a valid two-engine answer (plain language) → ACCEPTED', () => {
    expect(classifyConsultationOutput(answer(CLEAN), G).kind).toBe('ACCEPTED');
  });
  it('a valid per-perspective two-engine synthesis is NOT falsely rejected', () => {
    expect(classifyConsultationOutput(answer(PER_PERSPECTIVE), G).kind).toBe('ACCEPTED');
  });

  it('신강/신약/격국/용신 (uncomputed theory) → SEMANTIC_REJECTED, reason FORBIDDEN_THEORY', () => {
    expect(classifyConsultationOutput(answer(SIN_GANG), G).kind).toBe('SEMANTIC_REJECTED');
    expect(firstStructuredRejectionReason(answer(SIN_GANG), G)).toBe('FORBIDDEN_THEORY');
  });
  it('Qimen participation claim (Qimen not_applicable) → SEMANTIC_REJECTED, reason UNGROUNDED_QIMEN_CLAIM', () => {
    expect(classifyConsultationOutput(answer(QIMEN), G).kind).toBe('SEMANTIC_REJECTED');
    expect(firstStructuredRejectionReason(answer(QIMEN), G)).toBe('UNGROUNDED_QIMEN_CLAIM');
  });
  it('Saju↔Ziwei "모두 …" full-consensus → SEMANTIC_REJECTED, reason CROSS_ENGINE_CONSENSUS', () => {
    expect(classifyConsultationOutput(answer(CROSS), G).kind).toBe('SEMANTIC_REJECTED');
    expect(firstStructuredRejectionReason(answer(CROSS), G)).toBe('CROSS_ENGINE_CONSENSUS');
  });
  it('fake 3-engine consensus → SEMANTIC_REJECTED, reason CONSENSUS_CLAIM_MISMATCH', () => {
    expect(classifyConsultationOutput(answer(THREE), G).kind).toBe('SEMANTIC_REJECTED');
    expect(firstStructuredRejectionReason(answer(THREE), G)).toBe('CONSENSUS_CLAIM_MISMATCH');
  });
  it('an ACCEPTED answer reports reason NONE (diagnostic is content-free — only a code)', () => {
    expect(firstStructuredRejectionReason(answer(CLEAN), G)).toBe('NONE');
  });
});

describe('buildServerConsultation surfaces safe diagnostics (log-only)', () => {
  const deps = (a: string): ServerConsultationDeps => ({ digestProvider, nowEpochSeconds: NOW, async callLLM() { return a; } });
  beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

  it('clean answer → ACCEPTED classification, structuredResult present', async () => {
    const r = await buildServerConsultation({ birthInput: birth, question: '내 성격의 장단점을 알려줘' }, deps(answer(CLEAN)));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.diagnostics?.outputClassification).toBe('ACCEPTED');
      expect(r.diagnostics?.rejectionReason).toBeUndefined();
      expect(r.structuredResult).toBeDefined();
    }
  });
  it('신강 answer → SEMANTIC_REJECTED classification + FORBIDDEN_THEORY reason, safe message, no structuredResult', async () => {
    const r = await buildServerConsultation({ birthInput: birth, question: '내 성격의 장단점을 알려줘' }, deps(answer(SIN_GANG)));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.diagnostics?.outputClassification).toBe('SEMANTIC_REJECTED');
      expect(r.diagnostics?.rejectionReason).toBe('FORBIDDEN_THEORY');
      expect(r.structuredResult).toBeUndefined();
      expect(r.text).not.toMatch(/신강/); // raw unsafe text discarded → safe message
    }
  });
});

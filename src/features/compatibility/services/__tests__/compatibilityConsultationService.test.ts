// Client 궁합 service (Compatibility V1 §73). Mocks ONLY the transport: verifies canonical SELF is omitted,
// the explicit raw target is carried, the tier meta is returned, and the
// auth/validation fail-closed paths. No network, no LLM.
import type {
  ConsultationTransport,
  ConsultationTransportResult,
} from '@/features/chat/services/consultationTransport';
import type { ServerConsultationRequest } from '@/features/chat/server';
import type { BirthInfoDraft } from '@/features/consultation';
import { createCompatibilityConsultationService } from '../compatibilityConsultationService';

const birth = (over: Partial<BirthInfoDraft> = {}): BirthInfoDraft =>
  ({
    displayName: '사람', gender: 'female', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1992', birthMonth: '5', birthDay: '20',
    birthTimeAccuracy: 'exact', birthHour: '9', birthMinute: '30',
    approximateTimePeriod: null, birthPlace: '서울', ...over,
  }) as BirthInfoDraft;

const okResult: ConsultationTransportResult = {
  ok: true,
  text: '전체적으로 잘 맞는 편이에요.',
  compatibility: {
    overall: 'GOOD', overallLabel: '잘 맞는 편',
    dimensions: [{ key: 'BOND', title: '정서·유대', signal: 'POSITIVE', verdict: '잘 통해요.' }],
    reducedPrecision: false, selfLabel: '조세영', targetLabel: '김민준',
    engineVersion: 'compatibility-engine@1.0.0', tierModelVersion: 'compatibility-tier@1.0.0',
  },
};

function mockTransport(): { transport: ConsultationTransport; last: () => ServerConsultationRequest | null } {
  let last: ServerConsultationRequest | null = null;
  return {
    last: () => last,
    transport: {
      async requestConsultation(req) {
        last = req;
        return okResult;
      },
    },
  };
}

const input = () => ({
  self: { birthInfo: birth({ displayName: '조세영' }), label: '조세영' },
  target: { birthInfo: birth({ displayName: '김민준', gender: 'male' }), label: '김민준', relationship: '연인' },
  userMessage: '우리 궁합 좋아?',
  messages: [],
  conversationMemory: { summary: null, lastSummarizedMessageId: null },
});

describe('createCompatibilityConsultationService', () => {
  it('uses server canonical SELF and sends an explicit raw target + returns the tier meta', async () => {
    const { transport, last } = mockTransport();
    const svc = createCompatibilityConsultationService(transport, () => true);
    const r = await svc.sendMessage(input());
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.compatibility?.overall).toBe('GOOD');
    const req = last()!;
    expect(req.consultationMode).toBe('compatibility');
    expect(req.birthInput).toBeUndefined();
    expect(req.partnerBirthInput?.birthYear).toBe('1992');
    expect(req.partnerSubjectId).toBeNull();
    expect(req.targetSource).toBe('RAW_UNSAVED');
    expect(req.partnerLabel).toContain('김민준');
    expect(req.partnerLabel).toContain('연인'); // relationship folded into the partner label
  });

  it('fails closed with AUTH_REQUIRED when not authenticated (no LLM call)', async () => {
    const { transport, last } = mockTransport();
    const svc = createCompatibilityConsultationService(transport, () => false);
    const r = await svc.sendMessage(input());
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.errorCode).toBe('AUTH_REQUIRED');
    expect(last()).toBeNull(); // never reached the transport
  });

  it('rejects an incomplete partner birth as INVALID_INPUT', async () => {
    const { transport } = mockTransport();
    const svc = createCompatibilityConsultationService(transport, () => true);
    const bad = { ...input(), target: { ...input().target, birthInfo: birth({ birthYear: '' }) } };
    const r = await svc.sendMessage(bad);
    expect(r.success).toBe(false);
  });
});

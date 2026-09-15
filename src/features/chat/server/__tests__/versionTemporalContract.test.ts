// Sprint A — version/temporal substrate. The SERVER owns the question instant + the decision-version
// bundle; the client clock is never authoritative.
import { createHash } from 'crypto';

import { buildServerConsultation } from '@/features/chat/server';
import { ANSWER_PLAN_VERSION, DECISION_POLICY_VERSION } from '@/features/chat/server/answerPlan';
import { buildResolvedTemporalContext } from '@/features/chat/server/resolvedTemporalContext';
import type { ServerConsultationDeps, ServerConsultationRequest } from '@/features/chat/server';
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

const digestProvider: DigestProvider = {
  async sha256Utf8(s: string) {
    return createHash('sha256').update(s, 'utf8').digest('hex');
  },
};
// KST 2024-01-15 10:00.
const SERVER_NOW = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);
const birth: BirthInfoDraft = {
  displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
  birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
};
const GOOD_ANSWER = JSON.stringify({
  coreSummary: '차분한 흐름입니다.',
  coreInterpretation:
    '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. ' +
    '꾸준히 쌓아 올리면 좋고 조급하게 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.',
  strengths: ['끈기'],
});
function deps(over: Partial<ServerConsultationDeps> = {}): ServerConsultationDeps {
  return { digestProvider, nowEpochSeconds: SERVER_NOW, async callLLM() { return GOOD_ANSWER; }, ...over };
}
const req = (over: Partial<ServerConsultationRequest> = {}): ServerConsultationRequest => ({
  birthInput: birth,
  question: '제 타고난 성격은 어떤가요?',
  ...over,
});

beforeEach(() => {
  clearZiweiCache();
  clearQimenCache();
});

describe('buildResolvedTemporalContext — server owns the anchor', () => {
  it('anchors on the passed server epoch (KST civil year/month) with explicit targets', () => {
    const ctx = buildResolvedTemporalContext('2027년 사업운 어때?', SERVER_NOW, GROUNDING_UNAVAILABLE);
    expect(ctx.anchorEpochSeconds).toBe(SERVER_NOW);
    expect(ctx.timezone).toBe('Asia/Seoul');
    expect(ctx.referenceYear).toBe(2024);
    expect(ctx.referenceMonth).toBe(1);
    expect(ctx.resolvedTargets).toContain(2027);
    expect(ctx.qimenActive).toBe(false);
  });
});

describe('buildServerConsultation — version + temporal substrate', () => {
  it('stamps the decision-version bundle on the grounding meta', async () => {
    const r = await buildServerConsultation(req(), deps());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.groundingMeta.answerPlanVersion).toBe(ANSWER_PLAN_VERSION);
    expect(r.groundingMeta.decisionPolicyVersion).toBe(DECISION_POLICY_VERSION);
    expect(r.groundingMeta.promptVersion).toBeTruthy();
  });

  it('returns a server-owned resolvedTemporalContext; a forged client clock cannot move the anchor', async () => {
    const forged = req({ requestMetadata: { clientQuestionTimeEpoch: 9_999_999_999 } });
    const r = await buildServerConsultation(forged, deps());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.resolvedTemporalContext.anchorEpochSeconds).toBe(SERVER_NOW); // NOT the forged client time
    expect(r.resolvedTemporalContext.timezone).toBe('Asia/Seoul');
  });

  it('qimenActive reflects the SERVER activation (timing question → active)', async () => {
    const r = await buildServerConsultation(req({ question: '지금 이 계약을 진행해도 될까요?' }), deps());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.resolvedTemporalContext.qimenActive).toBe(true);
  });
});

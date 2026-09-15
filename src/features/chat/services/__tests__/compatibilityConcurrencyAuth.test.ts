// Sprint F.1 §J/§K — compatibility path: live auth (no stale closure) + single-flight conversation creation.
import { createSingleFlight } from '@/features/chat/services/singleFlight';
import { createCompatibilityConsultationService } from '@/features/compatibility/services/compatibilityConsultationService';
import type { BirthInfoDraft } from '@/features/consultation';

const birth: BirthInfoDraft = {
  displayName: '샘플', gender: 'female', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1990', birthMonth: '5', birthDay: '12', birthTimeAccuracy: 'exact',
  birthHour: '10', birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
};

describe('§K createSingleFlight — concurrent callers share ONE execution', () => {
  it('N concurrent calls run the factory exactly once', async () => {
    const sf = createSingleFlight<string>();
    let calls = 0;
    let resolve!: (v: string) => void;
    const factory = () => { calls += 1; return new Promise<string>((r) => { resolve = r; }); };
    const p1 = sf(factory);
    const p2 = sf(factory);
    const p3 = sf(factory);
    resolve('conv-1');
    await expect(Promise.all([p1, p2, p3])).resolves.toEqual(['conv-1', 'conv-1', 'conv-1']);
    expect(calls).toBe(1); // only one createConversation happened
  });

  it('a failed attempt clears the flight so a later attempt can retry', async () => {
    const sf = createSingleFlight<string>();
    let calls = 0;
    await expect(sf(() => { calls += 1; return Promise.reject(new Error('boom')); })).rejects.toThrow('boom');
    await expect(sf(() => { calls += 1; return Promise.resolve('conv-2'); })).resolves.toBe('conv-2');
    expect(calls).toBe(2); // retried after the failure
  });
});

describe('§K single-flight applied to conversation creation (two concurrent sends → one conversation)', () => {
  it('both concurrent ensure() calls resolve to the same id from one create', async () => {
    const sf = createSingleFlight<string>();
    let createCount = 0;
    let cached: string | null = null;
    const ensure = () => {
      if (cached !== null) return Promise.resolve(cached);
      return sf(async () => {
        createCount += 1;
        await Promise.resolve();
        cached = 'conv-xyz';
        return cached;
      });
    };
    const [a, b] = await Promise.all([ensure(), ensure()]);
    expect(a).toBe('conv-xyz');
    expect(b).toBe('conv-xyz');
    expect(createCount).toBe(1); // never double-created
  });
});

describe('§J compatibility service reads LIVE auth per send (no stale closure)', () => {
  it('a guard backed by a mutable ref sees a login that happened after mount', async () => {
    const authRef = { current: false };
    const adapter = { requestConsultation: jest.fn(async () => ({ ok: true, responseText: '결과', requestId: 'r' })) };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const service = createCompatibilityConsultationService(adapter as any, () => authRef.current);
    const input = {
      self: { id: 'self', birthInfo: birth, label: '나' },
      target: { id: 'target', birthInfo: birth, label: '상대' },
      userMessage: '둘의 결이 어떤가요?',
      messages: [],
      conversationMemory: { summary: null, lastSummarizedMessageId: null },
    };
    // Unauthenticated at first → AUTH_REQUIRED, adapter never called.
    const first = await service.sendMessage(input);
    expect(first.success).toBe(false);
    if (!first.success) expect(first.errorCode).toBe('AUTH_REQUIRED');
    expect(adapter.requestConsultation).not.toHaveBeenCalled();

    // User logs in while the screen stays mounted → the SAME service now passes the gate (live ref).
    authRef.current = true;
    const second = await service.sendMessage(input);
    expect(second.success).toBe(true);
    expect(adapter.requestConsultation).toHaveBeenCalledTimes(1);
  });
});

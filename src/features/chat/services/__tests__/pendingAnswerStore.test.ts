// 끊긴 상담의 요청 번호 보관소 (2026-09-17).
//
// 2026-09-15 production 실측: 답을 못 받은 요청의 번호가 화면 메모리에만 있어서, 대화를 다시 열면 서버에
// 저장된 답을 꺼낼 수 없었다(새 질문 → 새 번호 → LLM 재호출). 여기서 보는 것은 세 가지다:
// 번호가 살아남는가 · 24시간이 지나면 사라지는가 · **질문/답이 저장되지 않는가**.
import {
  PENDING_ANSWER_TTL_MS,
  __resetPendingAnswerMemory,
  clearPendingAnswer,
  readPendingAnswer,
  rememberPendingAnswer,
} from '@/features/chat/services/pendingAnswerStore';

const KEY = 'deokbun.pendingAnswer';
const g = globalThis as { localStorage?: Storage };

function installFakeLocalStorage() {
  const map = new Map<string, string>();
  g.localStorage = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v); },
    removeItem: (k: string) => { map.delete(k); },
    clear: () => map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    get length() { return map.size; },
  } as unknown as Storage;
  return map;
}

afterEach(() => {
  delete g.localStorage;
  __resetPendingAnswerMemory();
});

describe('웹(localStorage) 분기', () => {
  it('기억 → 읽기 → 지우기', () => {
    installFakeLocalStorage();
    rememberPendingAnswer({ conversationId: 'c1', requestId: 'req_abc' });
    expect(readPendingAnswer('c1')?.requestId).toBe('req_abc');
    clearPendingAnswer('c1');
    expect(readPendingAnswer('c1')).toBeNull();
  });

  it('⚠ 저장하는 것은 대화 id · 요청 번호 · 시각뿐 — 질문도 답도 없다', () => {
    const map = installFakeLocalStorage();
    rememberPendingAnswer({ conversationId: 'c1', requestId: 'req_abc' });
    const raw = map.get(KEY) ?? '';
    expect(Object.keys(JSON.parse(raw).c1).sort()).toEqual(['conversationId', 'requestId', 'savedAt']);
    expect(raw).not.toMatch(/질문|answer|question|text/);
  });

  it('24시간이 지나면 없는 것으로 본다 (서버 재생 창과 같다)', () => {
    installFakeLocalStorage();
    const t0 = 1_700_000_000_000;
    rememberPendingAnswer({ conversationId: 'c1', requestId: 'req_abc' }, t0);
    expect(readPendingAnswer('c1', t0 + PENDING_ANSWER_TTL_MS - 1000)?.requestId).toBe('req_abc');
    expect(readPendingAnswer('c1', t0 + PENDING_ANSWER_TTL_MS + 1000)).toBeNull();
  });

  it('같은 대화의 번호는 마지막 것만 남는다', () => {
    installFakeLocalStorage();
    rememberPendingAnswer({ conversationId: 'c1', requestId: 'req_1' }, 1000);
    rememberPendingAnswer({ conversationId: 'c1', requestId: 'req_2' }, 2000);
    expect(readPendingAnswer('c1', 3000)?.requestId).toBe('req_2');
  });

  it('무한히 자라지 않는다 — 최근 20개만', () => {
    const map = installFakeLocalStorage();
    for (let i = 0; i < 25; i += 1) rememberPendingAnswer({ conversationId: `c${i}`, requestId: `req_${i}` }, 1000 + i);
    const stored = JSON.parse(map.get(KEY) ?? '{}');
    expect(Object.keys(stored)).toHaveLength(20);
    expect(stored.c24?.requestId).toBe('req_24'); // 최신은 남고
    expect(stored.c0).toBeUndefined(); // 가장 오래된 것은 밀려난다
  });

  it('⚠ 반례 — 깨진 값 · 없는 대화 · 빈 값은 던지지 않고 null', () => {
    const map = installFakeLocalStorage();
    map.set(KEY, '{이건 JSON 이 아니다');
    expect(readPendingAnswer('c1')).toBeNull();
    map.set(KEY, JSON.stringify({ c1: { conversationId: 'c1' } })); // 번호 없음
    expect(readPendingAnswer('c1')).toBeNull();
    expect(readPendingAnswer('')).toBeNull();
  });
});

describe('네이티브(메모리) 분기 — localStorage 가 없을 때', () => {
  it('앱이 살아 있는 동안에는 같은 계약으로 돈다', () => {
    expect(g.localStorage).toBeUndefined();
    rememberPendingAnswer({ conversationId: 'c9', requestId: 'req_native' });
    expect(readPendingAnswer('c9')?.requestId).toBe('req_native');
    clearPendingAnswer('c9');
    expect(readPendingAnswer('c9')).toBeNull();
  });
});

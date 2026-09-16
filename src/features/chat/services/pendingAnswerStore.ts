// 끊긴 상담의 "요청 번호" 보관소 (2026-09-17).
//
// 왜 필요한가. 앱은 답을 최대 120초 기다리지만, 그보다 오래 걸리거나 사용자가 화면을 떠나면 답을 받지 못한
// 채 끝난다. 서버에는 그 답이 **24시간 동안 저장**돼 있고(`paid_request_idempotency.expires_at`), **같은 요청
// 번호로 다시 부르면 LLM 재호출 없이** 그대로 온다. 2026-09-15 production 실측에서 이 번호가 화면 메모리
// (`lastAttemptRef`)에만 있었다: 대화를 다시 열면 꺼낼 길이 없었고, 사용자는 새 질문을 보내 LLM 을 한 번 더
// 태웠다(요청 `req_mu2m…` → 새 요청 `req_mu2o…`).
//
// 무엇을 저장하나. **대화 id · 요청 번호 · 저장 시각뿐**이다. 질문도, 답도, 생년월일도 저장하지 않는다.
// 요청 번호는 클라이언트가 만든 무작위 문자열이라 그 자체로는 아무 뜻이 없고, 서버에서 답을 꺼내려면
// 같은 사용자의 세션이 반드시 필요하다(서버가 user_id + workload + request_id 로 찾는다).
//
// 어디에 저장하나. 웹은 `localStorage` — 탭을 새로 고치거나 대화를 다시 열어도 남아야 쓸모가 있다.
// 네이티브에는 저장소를 새로 들이지 않고 메모리에 둔다(앱이 살아 있는 동안 유효). `globalThis.localStorage`
// 유무로 갈라서 node 테스트에서도 그대로 돈다 — `pendingConsultationIntent` 와 같은 방식이다.
export type PendingAnswer = {
  conversationId: string;
  requestId: string;
  savedAt: number;
};

const STORAGE_KEY = 'deokbun.pendingAnswer';
// 서버의 재생 창과 같게 둔다. 이보다 오래된 번호로 부르면 서버가 **새 요청으로 취급**해 LLM 을 다시 태운다.
export const PENDING_ANSWER_TTL_MS = 24 * 60 * 60 * 1000;
// 한 사람이 여러 대화를 끊긴 채로 둘 수 있으므로 맵으로 두되, 무한히 자라지 않게 최근 것만 남긴다.
const MAX_ENTRIES = 20;

let memory: Record<string, PendingAnswer> = {};

function webStore(): Storage | null {
  try {
    return (globalThis as { localStorage?: Storage }).localStorage ?? null;
  } catch {
    return null; // 브라우저가 저장소를 막아 둔 경우(프라이빗 모드 등) — 메모리로 떨어진다
  }
}

function isValid(entry: unknown): entry is PendingAnswer {
  const e = entry as PendingAnswer | null;
  return (
    !!e
    && typeof e.conversationId === 'string' && e.conversationId.length > 0
    && typeof e.requestId === 'string' && e.requestId.length > 0
    && typeof e.savedAt === 'number' && Number.isFinite(e.savedAt)
  );
}

function prune(map: Record<string, PendingAnswer>, now: number): Record<string, PendingAnswer> {
  const alive = Object.values(map)
    .filter((e) => isValid(e) && now - e.savedAt < PENDING_ANSWER_TTL_MS)
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, MAX_ENTRIES);
  return Object.fromEntries(alive.map((e) => [e.conversationId, e]));
}

function readAll(now: number): Record<string, PendingAnswer> {
  const store = webStore();
  if (!store) return prune(memory, now);
  try {
    const raw = store.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, PendingAnswer>) : {};
    return prune(parsed && typeof parsed === 'object' ? parsed : {}, now);
  } catch {
    return {}; // 깨진 값은 없는 것으로 본다 — 여기서 던지면 대화 화면이 열리지 않는다
  }
}

function writeAll(map: Record<string, PendingAnswer>): void {
  const store = webStore();
  if (!store) {
    memory = map;
    return;
  }
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    memory = map; // 저장 실패(쿼터 등)여도 이번 세션 동안은 쓸 수 있게
  }
}

/** 답을 받지 못한 요청의 번호를 대화에 붙여 둔다. 같은 대화의 이전 번호는 덮어쓴다. */
export function rememberPendingAnswer(entry: { conversationId: string; requestId: string }, now = Date.now()): void {
  if (!entry.conversationId || !entry.requestId) return;
  const map = readAll(now);
  map[entry.conversationId] = { conversationId: entry.conversationId, requestId: entry.requestId, savedAt: now };
  writeAll(prune(map, now));
}

/** 그 대화에 꺼내올 답이 있으면 요청 번호를 돌려준다. 24시간이 지난 것은 없는 것으로 본다. */
export function readPendingAnswer(conversationId: string, now = Date.now()): PendingAnswer | null {
  if (!conversationId) return null;
  const map = readAll(now);
  const entry = map[conversationId];
  return entry && now - entry.savedAt < PENDING_ANSWER_TTL_MS ? entry : null;
}

/** 답을 받았거나 더 쓸 일이 없으면 지운다(소비형). */
export function clearPendingAnswer(conversationId: string, now = Date.now()): void {
  if (!conversationId) return;
  const map = readAll(now);
  if (!(conversationId in map)) return;
  delete map[conversationId];
  writeAll(map);
}

/** 테스트 전용 — 메모리 분기를 깨끗이 한다. */
export function __resetPendingAnswerMemory(): void {
  memory = {};
}

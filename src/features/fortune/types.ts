// Fortune presentation contract — UI-ONLY TYPES.
//
// The APP does not compute fortunes. These types describe the shape of a
// canonical daily-fortune payload as it will arrive from the (not-yet-connected)
// fortune engine. The UI renders slot bodies ONLY when a real
// DailyFortunePresentation exists; until then it shows a truthful "준비 중"
// state. No fabricated scores, no invented interpretation, no multi-engine
// mock output ever originates in the APP.

// Ordered presentation slots shown on 오늘의 운세.
export type FortuneSlotKey =
  | 'coreFlow' // 오늘의 핵심 흐름
  | 'caution' // 주의할 점
  | 'actionGuide' // 행동 가이드
  | 'detail'; // 상세 해석

export interface FortuneSlot {
  key: FortuneSlotKey;
  // Canonical title/body supplied verbatim by the engine (Markdown-safe text).
  title: string;
  body: string;
}

export interface DailyFortunePresentation {
  // Engine-owned identity/provenance — opaque to the APP.
  subjectId: string;
  date: string; // ISO date (YYYY-MM-DD), engine-provided
  engineVersion: string; // which engine build produced this
  generatedAt: string; // ISO timestamp
  slots: FortuneSlot[]; // ordered per FORTUNE_SLOT_ORDER
}

// Discriminated UI state. Starts at 'engine_unavailable' because the canonical
// engine is not connected. The APP NEVER synthesizes 'ready' with invented data.
export type FortuneViewState =
  | { status: 'engine_unavailable' }
  | { status: 'needs_subject' }
  | { status: 'loading' }
  | { status: 'ready'; presentation: DailyFortunePresentation }
  | { status: 'error'; message: string };

// Canonical slot order + labels for the presentation foundation. Labels are
// static UI copy (not fortune data), so they are safe to show as "준비 중"
// placeholders before the engine is connected.
export const FORTUNE_SLOT_ORDER: FortuneSlotKey[] = [
  'coreFlow',
  'caution',
  'actionGuide',
  'detail',
];

export const FORTUNE_SLOT_LABELS: Record<FortuneSlotKey, string> = {
  coreFlow: '오늘의 핵심 흐름',
  caution: '주의할 점',
  actionGuide: '행동 가이드',
  detail: '상세 해석',
};

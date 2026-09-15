// 운세우편 (fortune mail) presentation contract + seam — UI TYPES ONLY.
//
// The fortune engine is not connected, so the seam returns no mail. The APP never fabricates fortune insights
// (제3조 Mock 금지). When the engine ships, listMail is the single function that will return real data; the inbox
// already renders every state. (The standalone mail-detail screen was removed in Sprint J2 — the inbox opens the
// canonical Today/Monthly/Report records directly, so a separate detail view added no user value in V1.)

export type FortuneMailTone = 'neutral' | 'info' | 'warning' | 'success';

// Inbox list item (04_FORTUNE_INBOX).
export type FortuneMailItem = {
  id: string;
  category: string; // e.g. "월간 · 재물운"
  categoryTone: FortuneMailTone;
  title: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  important: boolean;
};

// Inbox filter chips.
export type FortuneMailFilter = 'all' | 'monthly' | 'important' | 'move';
export const FORTUNE_MAIL_FILTERS: { key: FortuneMailFilter; label: string }[] = [
  { key: 'all', label: '전체보기' },
  { key: 'monthly', label: '월간운세' },
  { key: 'important', label: '중요' },
  { key: 'move', label: '사업/이동' },
];

async function listMail(_subjectId: string | null): Promise<FortuneMailItem[]> {
  return [];
}

export const fortuneMailService = { listMail };

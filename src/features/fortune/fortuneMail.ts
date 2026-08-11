// 운세우편 (fortune mail) presentation contract + seam — UI TYPES ONLY.
//
// The fortune engine is not connected, so the seam returns no mail and no detail.
// The APP never fabricates fortune insights (제3조 Mock 금지). When the engine
// ships, these are the single functions that will return real data; the inbox
// and detail screens already render every state.

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

// Detail (05_FORTUNE_DETAIL) building blocks.
export type FortuneAreaStatus = {
  category: string; // 재물운 / 사업·직장운 / 애정·대인운 / 건강운
  status: string; // 안정 / 변화 / 평온 / 주의
  statusTone: FortuneMailTone;
  title: string; // 유지 및 방어 …
};
export type FortuneCautionPeriod = {
  periodLabel: string;
  title: string;
  body: string;
};
export type FortuneTimelineEntry = {
  period: string;
  title: string;
  body?: string;
  highlighted?: boolean;
};
export type FortuneMailDetail = {
  id: string;
  subjectId: string;
  headerLabel: string; // "8월 종합 운세 리포트"
  title: string;
  summary: string;
  areas: FortuneAreaStatus[];
  caution: FortuneCautionPeriod | null;
  timeline: FortuneTimelineEntry[];
};

async function listMail(_subjectId: string | null): Promise<FortuneMailItem[]> {
  return [];
}

async function getMailDetail(_id: string): Promise<FortuneMailDetail | null> {
  return null;
}

export const fortuneMailService = { listMail, getMailDetail };

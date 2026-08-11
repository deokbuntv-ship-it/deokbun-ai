// Admin fortune-mail read seam (UI TYPES ONLY). The fortune generation/mail
// pipeline is not connected, so both methods return empty/null — the admin
// screens render truthful empty / "연결 준비 중" states and NEVER fabricate mail
// rows, costs, or delivery events (AI_CONSTITUTION 제3조 Mock 금지). When the
// pipeline ships, these two functions are the single place that returns real data;
// the list + detail-drawer UI already render every field.
export type AdminFortuneMailStatus =
  | 'queued' // 생성 대기
  | 'generating' // 생성 중
  | 'generated' // 생성 완료
  | 'scheduled' // 발송 예약
  | 'sent' // 발송 완료
  | 'gen_failed' // 생성 실패
  | 'send_failed'; // 발송 실패

export type AdminFortuneMailTimelineEntry = {
  label: string;
  at: string;
  note?: string;
};

export type AdminFortuneMailListItem = {
  id: string;
  user: string;
  subject: string;
  type: string; // 주간 / 월간 / 연간 …
  title: string;
  status: AdminFortuneMailStatus;
  createdAt: string;
  scheduledAt: string | null;
};

export type AdminFortuneMailDetail = {
  id: string;
  user: string;
  subject: string;
  type: string;
  title: string;
  status: AdminFortuneMailStatus;
  createdAt: string;
  scheduledAt: string | null;
  sentAt: string | null;
  model: string | null;
  promptVersion: string | null;
  tokens: number | null;
  cost: string | null;
  contentPreview: string;
  timeline: AdminFortuneMailTimelineEntry[];
};

async function listMail(): Promise<AdminFortuneMailListItem[]> {
  return [];
}

async function getMailDetail(_id: string): Promise<AdminFortuneMailDetail | null> {
  return null;
}

export const adminFortuneMailService = { listMail, getMailDetail };

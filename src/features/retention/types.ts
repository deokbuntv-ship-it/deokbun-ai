// Retention domain contracts (§3). The concerns are kept SEPARATE — preference (what the user wants),
// content (what to show), device (where push could go), delivery (result) — so Push/Email can layer on later
// without reworking product logic. No chart/evidence/transcript ever lives here.
import type { DeepLinkTarget } from '@/features/retention/deepLinks';

export type NotificationCategory = 'monthly_fortune' | 'birthday' | 'important_schedule' | 'service_notice' | 'marketing';

// Service categories are distinct from marketing (§4.1/§4.2). Conservative defaults (§4.4).
export type NotificationPreferences = {
  monthlyFortune: boolean;
  birthday: boolean;
  importantSchedule: boolean;
  serviceNotice: boolean;
  marketing: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  monthlyFortune: true,
  birthday: true,
  importantSchedule: true,
  serviceNotice: true,
  marketing: false,
};

export type LifeEventType = 'MOVE' | 'INTERVIEW' | 'EXAM' | 'CONTRACT' | 'TRAVEL' | 'MEETING' | 'OTHER';
export type LifeEventStatus = 'ACTIVE' | 'DONE' | 'CANCELLED';
export type LifeEventSource = 'manual' | 'chat_confirmed';

export type LifeEvent = {
  id: string;
  subjectId: string | null;
  title: string;
  eventType: LifeEventType;
  eventDate: string; // YYYY-MM-DD (KST)
  eventTime: string | null; // HH:MM or null
  timezone: string;
  status: LifeEventStatus;
  source: LifeEventSource;
  reminderEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

// Creating a life event ALWAYS requires explicit confirmation (§8.1/§8.2) — a chat statement is never enough.
export type LifeEventInput = {
  title: string;
  eventType: LifeEventType;
  eventDate: string;
  eventTime?: string | null;
  reminderEnabled?: boolean;
  subjectId?: string | null;
  source?: LifeEventSource;
  /** Must be true — the service refuses to persist an unconfirmed event. */
  confirmed: boolean;
};

export type InAppNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string | null;
  deepLinkTarget: DeepLinkTarget;
  deepLinkId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type PushDevicePlatform = 'ios' | 'android' | 'web' | 'unknown';
export type PushProviderName = 'none' | 'expo' | 'fcm' | 'apns' | 'webpush';

export const LIFE_EVENT_TYPE_LABEL: Record<LifeEventType, string> = {
  MOVE: '이사',
  INTERVIEW: '면접',
  EXAM: '시험',
  CONTRACT: '계약',
  TRAVEL: '여행',
  MEETING: '미팅',
  OTHER: '기타',
};

export const NOTIFICATION_CATEGORY_LABEL: Record<NotificationCategory, string> = {
  monthly_fortune: '월별운세 알림',
  birthday: '생일 운세 알림',
  important_schedule: '중요한 일정 알림',
  service_notice: '서비스 안내',
  marketing: '혜택·이벤트 알림',
};

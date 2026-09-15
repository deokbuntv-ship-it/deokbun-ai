// PUSH PROVIDER ABSTRACTION (§10.1). Retention logic must NOT know FCM/APNs/Expo details — it talks to this
// provider-neutral interface. V1 ships the Noop provider (no external send, §32); wiring a real provider is an
// OWNER-config step (credentials). The token is sensitive — a provider must never log it (§10.3).
import type { DeepLinkTarget } from '@/features/retention/deepLinks';
import type { PushProviderName } from '@/features/retention/types';

export type PushMessage = {
  title: string;
  body: string;
  deepLinkTarget: DeepLinkTarget;
  deepLinkId?: string | null;
};

export type PushSendStatus = 'sent' | 'not_configured' | 'invalid_token' | 'error';
export type PushSendResult = { ok: boolean; status: PushSendStatus };

export interface PushProvider {
  readonly name: PushProviderName;
  isConfigured(): boolean;
  validateToken(token: string): boolean;
  sendPush(token: string, message: PushMessage): Promise<PushSendResult>;
}

// The V1 provider: configured=false, so no external delivery is attempted. Retention preferences + jobs still
// work; actual delivery is enabled later by swapping in a real provider (OWNER action).
export const noopPushProvider: PushProvider = {
  name: 'none',
  isConfigured() {
    return false;
  },
  validateToken(token: string) {
    return typeof token === 'string' && token.trim().length > 0;
  },
  async sendPush() {
    return { ok: false, status: 'not_configured' };
  },
};

// The single access point; a real provider is injected here once credentials exist.
export function getPushProvider(): PushProvider {
  return noopPushProvider;
}

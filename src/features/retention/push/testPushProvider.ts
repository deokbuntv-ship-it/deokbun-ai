// Deterministic TEST push provider (Sprint J3 §4). Lets tests + staging proofs exercise the delivery pipeline
// without any real FCM/APNs/Expo credentials. Records every send and returns a scripted result. NEVER used in
// production paths (getPushProvider still returns the noop provider until a real provider is injected).
import type { PushMessage, PushProvider, PushSendResult, PushSendStatus } from './pushProvider';

export type TestPushProvider = PushProvider & {
  readonly sent: { token: string; message: PushMessage }[];
  reset(): void;
};

/** Create a configurable in-memory provider. `next` scripts the status returned by the next sendPush call(s). */
export function createTestPushProvider(opts?: { configured?: boolean; nextStatus?: PushSendStatus }): TestPushProvider {
  const sent: { token: string; message: PushMessage }[] = [];
  let status: PushSendStatus = opts?.nextStatus ?? 'sent';
  const configured = opts?.configured ?? true;
  return {
    name: 'expo',
    sent,
    reset() { sent.length = 0; },
    isConfigured() { return configured; },
    validateToken(token: string) { return typeof token === 'string' && token.trim().length > 0; },
    async sendPush(token: string, message: PushMessage): Promise<PushSendResult> {
      sent.push({ token, message });
      return { ok: status === 'sent', status };
    },
  };
}

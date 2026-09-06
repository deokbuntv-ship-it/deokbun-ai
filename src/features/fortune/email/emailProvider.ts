// EMAIL PROVIDER ABSTRACTION (Sprint J4 §4.2). Email operations must NOT know Resend/SendGrid/SES details — they
// talk to this provider-neutral interface. V1 ships the Noop provider (no external send); a real provider is an
// OWNER-config step (credentials) → EMAIL_PROVIDER_LIVE = EXTERNAL_BLOCKED. A deterministic test adapter drives
// tests + staging proofs. The recipient address is sensitive: a provider must never log it.
export type EmailMessage = {
  recipient: string;
  subject: string;
  renderedContent: string; // final body (html or text) — already composed from the authoritative digest
  idempotencyKey: string;  // per (campaign, recipient) — the provider must dedupe on this
};

export type EmailSendStatus = 'sent' | 'not_configured' | 'invalid_email' | 'error';
export type EmailSendResult = { ok: boolean; status: EmailSendStatus };

export interface EmailProvider {
  readonly name: string;
  isConfigured(): boolean;
  sendEmail(message: EmailMessage): Promise<EmailSendResult>;
}

// V1 provider: configured=false → no external delivery attempted. Campaign/recipient truth still works.
export const noopEmailProvider: EmailProvider = {
  name: 'none',
  isConfigured() { return false; },
  async sendEmail() { return { ok: false, status: 'not_configured' }; },
};

export type TestEmailProvider = EmailProvider & {
  readonly sent: EmailMessage[];
  reset(): void;
};

/** Deterministic in-memory provider for tests + staging proofs. Records every send; scriptable status. */
export function createTestEmailProvider(opts?: { configured?: boolean; nextStatus?: EmailSendStatus }): TestEmailProvider {
  const sent: EmailMessage[] = [];
  const configured = opts?.configured ?? true;
  const status: EmailSendStatus = opts?.nextStatus ?? 'sent';
  return {
    name: 'test',
    sent,
    reset() { sent.length = 0; },
    isConfigured() { return configured; },
    async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
      sent.push(message);
      return { ok: status === 'sent', status };
    },
  };
}

// The single access point.
//
// ⚠ DO NOT WIRE A REAL PROVIDER HERE (2026-09-04). This module runs in the CLIENT bundle, and
// every real provider authenticates with a secret API key — putting one here would ship it to
// every user. That is why this returns Noop and always will.
//
// The real send already exists, SERVER-SIDE, where the key can live:
//   supabase/functions/run-email-campaigns/index.ts     — sendEmail(), EMAIL_PROVIDER=resend
//   supabase/functions/retry-email-deliveries/index.ts  — same adapter for the retry path
// Both read RESEND_API_KEY / EMAIL_FROM from Deno env and return `not_configured` (never a
// fake SENT) until the owner sets them. Activating email is an Edge-secret action, NOT a code
// change — see PROJECT_STATE §7.16.
//
// This interface stays because the CONTRACT (message shape, statuses, idempotency key) is what
// the campaign/worker logic is written against and unit-tested with `createTestEmailProvider`.
export function getEmailProvider(): EmailProvider {
  return noopEmailProvider;
}

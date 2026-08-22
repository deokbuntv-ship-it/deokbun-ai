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

// The single access point; a real provider is injected here once credentials exist (OWNER action).
export function getEmailProvider(): EmailProvider {
  return noopEmailProvider;
}

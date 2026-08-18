import * as Crypto from 'expo-crypto';

import { logDbError } from '@/features/analysis';
import { parseSharedReportDTO, isValidShareToken } from '@/features/chat/report/shareToken';
import type { SharedReportContent } from '@/features/chat/report/reportPresentation';
import { getPublicBaseUrl } from '@/features/publicSite/publicUrl';
import { getSupabaseClient } from '@/services/supabase';

// Authenticated report sharing (Commercial UX V4 §16–§27). The owner's client GENERATES a random token
// and stores ONLY its SHA-256 hash (RLS insert on report_shares); the raw token goes into the share URL
// and is never persisted or logged (§17/§18). The recipient reads through the get_shared_report RPC
// (SECURITY DEFINER, authenticated-only) which hashes the presented token and returns a bounded DTO.
// This service never touches consultation_reports on the recipient's behalf and never widens its RLS.

export type ShareChannel = 'link' | 'email' | 'kakao';

export type ShareGrant = { shareId: string; token: string; url: string | null };

export type ShareSummary = {
  id: string;
  channel: string | null;
  openedCount: number;
  expiresAt: string | null;
  createdAt: string;
  isExpired: boolean;
};

const TABLE = 'report_shares';

function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

// 24 random bytes → 48 lowercase hex chars (matches isValidShareToken + the RPC's length guard).
async function generateToken(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(24);
  return bytesToHex(bytes);
}

async function sha256Hex(input: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input, {
    encoding: Crypto.CryptoEncoding.HEX,
  });
}

// Absolute base for the share URL: the configured canonical domain, else the web origin (incl. localhost
// for local E2E). Null on native without a configured domain → the UI shows a truthful "링크 없음" state
// rather than a broken link (same discipline as the tracking-URL builder).
function shareOrigin(): string | null {
  const base = getPublicBaseUrl();
  if (base) return base;
  try {
    const loc = (globalThis as unknown as { location?: { origin?: string } }).location;
    if (loc && typeof loc.origin === 'string' && /^https?:\/\//.test(loc.origin)) {
      return loc.origin.replace(/\/$/, '');
    }
  } catch {
    // no web origin (native) → null
  }
  return null;
}

export function buildShareUrl(token: string): string | null {
  if (!isValidShareToken(token)) return null;
  const origin = shareOrigin();
  return origin ? `${origin}/shared-report/${token}` : null;
}

// Create a share grant for a report the caller owns. RLS enforces ownership (owner_user_id defaults to
// auth.uid(); the with-check verifies the report belongs to the caller). Returns the raw token ONCE (for
// the URL) — it is never recoverable afterwards. Returns null on failure (never throws).
async function createShare(reportId: string, channel: ShareChannel): Promise<ShareGrant | null> {
  const supabase = getSupabaseClient();
  const token = await generateToken();
  const tokenHash = await sha256Hex(token);
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ report_id: reportId, token_hash: tokenHash, channel })
    .select('id')
    .single();
  if (error) {
    logDbError(error, 'report_share', 'db'); // logs the DB error only — never the token
    return null;
  }
  return { shareId: (data as { id: string }).id, token, url: buildShareUrl(token) };
}

// The active shares for a report (owner-scoped by RLS). Never returns token_hash.
async function listActiveShares(reportId: string): Promise<ShareSummary[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, channel, opened_count, expires_at, created_at')
    .eq('report_id', reportId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) {
    logDbError(error, 'report_share', 'db');
    return [];
  }
  const now = Date.now();
  return ((data as Array<Record<string, unknown>> | null) ?? []).map((r) => {
    const expiresAt = (r.expires_at as string | null) ?? null;
    return {
      id: r.id as string,
      channel: (r.channel as string | null) ?? null,
      openedCount: (r.opened_count as number) ?? 0,
      expiresAt,
      createdAt: r.created_at as string,
      isExpired: expiresAt ? new Date(expiresAt).getTime() <= now : false,
    };
  });
}

// Revoke a share (owner-only via RLS). The old URL immediately stops resolving (the RPC checks status).
async function revokeShare(shareId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(TABLE)
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .eq('id', shareId);
  if (error) {
    logDbError(error, 'report_share', 'db');
    return false;
  }
  return true;
}

// Recipient read: present the raw token to the SECURITY DEFINER RPC. Returns a bounded DTO or null
// (invalid / revoked / expired / not found / not authenticated). Validates the token shape client-side
// first so a malformed value never reaches the RPC.
async function loadSharedReport(rawToken: string): Promise<SharedReportContent | null> {
  if (!isValidShareToken(rawToken)) return null;
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('get_shared_report', { p_token: rawToken });
  if (error) {
    logDbError(error, 'report_share', 'db');
    return null;
  }
  return parseSharedReportDTO(data);
}

export const shareService = {
  createShare,
  listActiveShares,
  revokeShare,
  loadSharedReport,
  buildShareUrl,
};

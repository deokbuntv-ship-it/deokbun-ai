// Consumer Kakao channel-add UX contract (§2/§3). The EXTERNAL Kakao connection is NOT configured yet, so the
// UI exposes only the honest states and NEVER fabricates a CONNECTED success. Marketing consent (stored on the
// profile) and channel connection are SEPARATE concerns — opting into marketing never adds the channel.

export type KakaoChannelState =
  | 'CHANNEL_NOT_CONNECTED' // default — no connection, and the external add is not available
  | 'CHANNEL_CONNECTION_AVAILABLE' // external integration configured → the user can add the channel
  | 'CHANNEL_CONNECTED'; // a verified, persisted connection — reachable only once the seam below is wired

// Availability seam (§3): the consumer channel-add goes live only when a public Kakao channel id is
// configured. Unset today → not configured → the add action shows an honest 준비 중 state instead of faking
// success. FUTURE: when the owner sets EXPO_PUBLIC_KAKAO_CHANNEL_ID and wires (a) the add deep-link and (b) a
// persisted+verified connection record, this returns true and initialKakaoChannelState() advances to
// CHANNEL_CONNECTION_AVAILABLE; a stored verified connection would then resolve to CHANNEL_CONNECTED.
export function kakaoChannelConfigured(): boolean {
  const id = process.env.EXPO_PUBLIC_KAKAO_CHANNEL_ID;
  return typeof id === 'string' && id.trim().length > 0;
}

export function initialKakaoChannelState(): KakaoChannelState {
  return kakaoChannelConfigured() ? 'CHANNEL_CONNECTION_AVAILABLE' : 'CHANNEL_NOT_CONNECTED';
}

// The public Kakao channel page URL (where the user adds the channel), or null when not configured. Opening
// this is the honest "add" action: it takes the user to Kakao's own page — we never assert the add succeeded
// (we cannot verify it), so no CHANNEL_CONNECTED is fabricated. null today (unset id) → the add is 준비 중.
export function kakaoChannelAddUrl(): string | null {
  const id = process.env.EXPO_PUBLIC_KAKAO_CHANNEL_ID;
  return id && id.trim().length > 0 ? `https://pf.kakao.com/${id.trim()}` : null;
}

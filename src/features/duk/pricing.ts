// Consumer-facing Duk pricing/labels (Sprint J1). DISPLAY-ONLY single source — the SERVER (economy_policy) is
// the authority for every amount; these constants mirror it for UI copy so no screen scatters raw literals (§11).
// Never used to compute a charge, balance, or entitlement client-side.
export type DukProduct = 'general' | 'compatibility' | 'premium_report';

// Mirrors economy_policy general_session_cost / compatibility_session_cost / premium_report_cost.
export const DUK_PRICES: Record<DukProduct, number> = {
  general: 5,
  compatibility: 12,
  premium_report: 50,
};

export const WELCOME_DUK = 10;   // economy_policy.welcome_reward
export const CANDLE_DUK = 1;     // economy_policy.candle_reward
export const CANDLE_COOLDOWN_HOURS = 24;

// Consumer currency label — always "덕", never the internal bucket names (REWARD/PLUS/PAID).
export function dukLabel(n: number): string {
  return `${Math.max(0, Math.trunc(n))}덕`;
}

// Top-up packs shown in the (store-gated) shell. Amounts mirror the IAP catalog internal keys; DISPLAY-ONLY —
// purchase is NOT active in this build (05B deferred). priceKrw is a display hypothesis, not a charge.
export type TopupPack = { internalKey: string; label: string; duk: number; priceKrwHint: number | null; firstOnly: boolean };
export const TOPUP_PACKS: TopupPack[] = [
  { internalKey: 'DUK_FIRST_20', label: '첫 충전', duk: 20, priceKrwHint: 2900, firstOnly: true },
  { internalKey: 'DUK_BASE_50', label: '기본', duk: 50, priceKrwHint: 9900, firstOnly: false },
  { internalKey: 'DUK_LARGE_120', label: '넉넉', duk: 120, priceKrwHint: 19900, firstOnly: false },
];

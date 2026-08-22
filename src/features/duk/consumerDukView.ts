// Consumer Duk view-models (Sprint J1). PURE + deterministic presenters over the SERVER-authoritative wallet /
// candle / session / insufficient state. No client-side financial math: balances/prices/shortfall come straight
// from the server; these functions only choose copy + the next safe action. Fully unit-testable (no RN imports).
import { CANDLE_DUK, DUK_PRICES, dukLabel, type DukProduct } from './pricing';

// ---- Wallet balance --------------------------------------------------------------------------------------
export type WalletLoadState = 'loading' | 'loaded' | 'zero' | 'error' | 'signed-out';

/** Consumer balance headline. Uses the server total (never a locally-summed value). */
export function walletHeadline(state: WalletLoadState, totalSpendable: number): string {
  switch (state) {
    case 'loading': return '덕을 불러오는 중…';
    case 'signed-out': return '로그인하면 보유한 덕을 볼 수 있어요';
    case 'error': return '덕 정보를 불러오지 못했어요';
    case 'zero': return '보유한 덕 0';
    case 'loaded': return `보유한 덕 ${Math.max(0, Math.trunc(totalSpendable))}`;
  }
}

/** Normalize a raw wallet read into a display state (server total is authority). */
export function walletStateOf(input: { signedOut?: boolean; error?: boolean; totalSpendable?: number | null }): WalletLoadState {
  if (input.signedOut) return 'signed-out';
  if (input.error) return 'error';
  const t = input.totalSpendable ?? null;
  if (t === null) return 'error';
  return t <= 0 ? 'zero' : 'loaded';
}

// ---- Candle ----------------------------------------------------------------------------------------------
export type CandleUiState = 'eligible' | 'claiming' | 'granted' | 'cooldown' | 'error';

/** Map server candle availability → an initial UI state (server time/eligibility is authority). */
export function candleInitialState(avail: { canLight: boolean }): Extract<CandleUiState, 'eligible' | 'cooldown'> {
  return avail.canLight ? 'eligible' : 'cooldown';
}

/** Copy for the candle affordance by state. `+1덕` on grant. */
export function candleCopy(state: CandleUiState): string {
  switch (state) {
    case 'eligible': return '오늘의 덕 받기';
    case 'claiming': return '받는 중…';
    case 'granted': return `오늘의 덕 +${CANDLE_DUK}`;
    case 'cooldown': return '내일 다시 받을 수 있어요';
    case 'error': return '잠시 후 다시 시도해 주세요';
  }
}

// ---- Session / remaining turns --------------------------------------------------------------------------
/** Simple consumer copy for an active paid general session (server-confirmed status only; no optimistic decrement). */
export function sessionTurnCopy(s: { active: boolean; successfulTurnCount: number; turnLimit: number }): string {
  if (!s.active) return '상담 이용 시간이 끝났어요';
  const remaining = Math.max(0, s.turnLimit - s.successfulTurnCount);
  if (remaining <= 0) return '이번 상담의 질문을 모두 사용했어요';
  return `이번 상담에서 ${remaining}번 더 질문할 수 있어요`;
}

// ---- Insufficient Duk ------------------------------------------------------------------------------------
export type InsufficientAction = 'CANDLE' | 'TOMORROW' | 'TOPUP';
export type InsufficientView = {
  productLabel: string;   // 상담 / 궁합
  required: number;       // server value
  available: number;      // server value
  shortfall: number;      // server value
  lines: string[];        // consumer copy (현재/필요/부족)
  primaryAction: InsufficientAction; // CANDLE if candle available now, else TOMORROW
  topupAvailable: boolean;           // the (store-gated) shell is always reachable
};

const PRODUCT_LABEL: Record<DukProduct, string> = { general: '상담', compatibility: '궁합', premium_report: '프리미엄 리포트' };

/**
 * Build the insufficient-Duk view from the AUTHORITATIVE server snapshot {balance,required,shortfall}. The only
 * client decision is the primary action: light today's candle if eligible, otherwise come back tomorrow; the
 * top-up shell is always available (but purchase is store-deferred). Never recomputes the financial numbers.
 */
export function insufficientView(
  product: DukProduct,
  snap: { balance: number; required: number; shortfall: number },
  candleEligible: boolean,
): InsufficientView {
  const required = snap.required || DUK_PRICES[product];
  const available = Math.max(0, snap.balance);
  const shortfall = snap.shortfall != null ? snap.shortfall : Math.max(0, required - available);
  return {
    productLabel: PRODUCT_LABEL[product],
    required,
    available,
    shortfall,
    lines: [
      `${PRODUCT_LABEL[product]}에는 ${dukLabel(required)}이 필요해요`,
      `현재 ${dukLabel(available)}`,
      `${dukLabel(shortfall)}이 더 필요해요`,
    ],
    primaryAction: candleEligible ? 'CANDLE' : 'TOMORROW',
    topupAvailable: true,
  };
}

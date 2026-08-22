// Duk economy — public surface (Sprint G). Pure invariant cores + the client wallet service. The server-side
// spend/grant/session/reserve mutations live in the SQL RPCs (migrations 20260831/20260832) invoked by the
// Edge; the client only READS and may light its own candle.
export {
  allocateSpend,
  applyPurchaseWithDebt,
  combinedSpendable,
  SPEND_PRIORITY,
  type DukBucket,
  type DukBalances,
  type SpendAllocation,
} from './walletCore';
export {
  newSession,
  applyTurn,
  commitReserve,
  reconcileExpired,
  canTransition,
  DEFAULT_TURN_LIMIT,
  DEFAULT_SESSION_TTL_SECONDS,
  type SessionState,
  type TurnOutcome,
  type Reserve,
  type ReserveStatus,
} from './sessionBilling';
export {
  candleAvailability,
  attemptLightCandle,
  DEFAULT_CANDLE_COOLDOWN_SECONDS,
  DEFAULT_CANDLE_REWARD,
  type CandleAvailability,
  type CandleState,
} from './candle';
export {
  getWalletState,
  getCandleAvailability,
  lightCandle,
  type WalletState,
  type LightCandleResult,
} from './dukWalletService';
export {
  rejectClientAssertedPurchase,
  type BillingAdapter,
  type PurchaseToken,
  type VerifiedPurchase,
  type VerifyResult,
  type GrantResult,
  type RevokeResult,
  type SubscriptionState,
} from './billingAdapter';

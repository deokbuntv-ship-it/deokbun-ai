// Wallet hook (Sprint J1). Wraps the pure walletStore around the server-authoritative getWalletState so Home /
// Wallet / chat / compat share ONE balance and can invalidate it after a candle grant or a charged consultation.
// (RN — not jest-tested; the pure store logic is covered in walletStore.test.ts.)
import { useSyncExternalStore } from 'react';
import { createWalletStore } from './walletStore';
import { getWalletState } from './dukWalletService';

const store = createWalletStore(getWalletState);

export function useWallet() {
  const snapshot = useSyncExternalStore(store.subscribe, store.get, store.get);
  return { ...snapshot, refresh: () => store.refresh() };
}

/** Fire-and-forget invalidation after an action that changes the balance (candle / charged consultation). */
export function refreshWallet(): Promise<void> {
  return store.refresh();
}

// Wallet refresh seam (Sprint J1). A tiny observable store over the SERVER-authoritative wallet read, so Home /
// Wallet / chat / compat share ONE balance and can invalidate it after a candle grant or a charged consultation
// (§14). PURE FACTORY (type-only import of WalletState → jest-safe, no RN); the RN singleton + hook wrap it in
// useWallet.ts. Never derives balance locally — refresh always re-reads the server.
import type { WalletState } from './dukWalletService';

export type WalletSnapshot = { state: WalletState | null; loading: boolean; error: boolean };
export type WalletStore = {
  get(): WalletSnapshot;
  subscribe(listener: () => void): () => void;
  refresh(): Promise<void>;
};

export function createWalletStore(fetchWallet: () => Promise<WalletState>): WalletStore {
  let snapshot: WalletSnapshot = { state: null, loading: false, error: false };
  const listeners = new Set<() => void>();
  const emit = () => { for (const l of Array.from(listeners)) l(); };
  let inflight: Promise<void> | null = null;

  return {
    get: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    refresh() {
      // Single-flight: concurrent refreshes (e.g. candle + screen focus) coalesce to one server read.
      if (inflight) return inflight;
      snapshot = { ...snapshot, loading: true, error: false };
      emit();
      inflight = (async () => {
        try {
          const state = await fetchWallet();
          snapshot = { state, loading: false, error: false };
        } catch {
          snapshot = { state: snapshot.state, loading: false, error: true };
        } finally {
          inflight = null;
          emit();
        }
      })();
      return inflight;
    },
  };
}

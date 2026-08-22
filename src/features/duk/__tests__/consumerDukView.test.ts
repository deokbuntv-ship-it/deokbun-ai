// Sprint J1 — consumer Duk view-models (pure; server values are authority, no client financial math).
import {
  walletStateOf, walletHeadline, candleInitialState, candleCopy, sessionTurnCopy, insufficientView,
} from '@/features/duk/consumerDukView';

describe('walletStateOf / walletHeadline', () => {
  it('classifies signed-out / error / zero / loaded from the server total', () => {
    expect(walletStateOf({ signedOut: true })).toBe('signed-out');
    expect(walletStateOf({ error: true })).toBe('error');
    expect(walletStateOf({ totalSpendable: null })).toBe('error');
    expect(walletStateOf({ totalSpendable: 0 })).toBe('zero');
    expect(walletStateOf({ totalSpendable: 11 })).toBe('loaded');
  });
  it('headline shows the SERVER total', () => {
    expect(walletHeadline('loaded', 11)).toBe('보유한 덕 11');
    expect(walletHeadline('zero', 0)).toBe('보유한 덕 0');
    expect(walletHeadline('signed-out', 0)).toContain('로그인');
    expect(walletHeadline('error', 0)).toContain('불러오지 못');
  });
});

describe('candle view', () => {
  it('initial state follows server eligibility', () => {
    expect(candleInitialState({ canLight: true })).toBe('eligible');
    expect(candleInitialState({ canLight: false })).toBe('cooldown');
  });
  it('copy per state; grant shows +1덕', () => {
    expect(candleCopy('eligible')).toBe('오늘의 덕 받기');
    expect(candleCopy('granted')).toBe('오늘의 덕 +1');
    expect(candleCopy('cooldown')).toContain('내일');
  });
});

describe('sessionTurnCopy', () => {
  it('inactive session → ended', () => {
    expect(sessionTurnCopy({ active: false, successfulTurnCount: 2, turnLimit: 5 })).toContain('끝났');
  });
  it('active with remaining → N번 더', () => {
    expect(sessionTurnCopy({ active: true, successfulTurnCount: 1, turnLimit: 5 })).toBe('이번 상담에서 4번 더 질문할 수 있어요');
  });
  it('active but exhausted → 모두 사용', () => {
    expect(sessionTurnCopy({ active: true, successfulTurnCount: 5, turnLimit: 5 })).toContain('모두 사용');
  });
});

describe('insufficientView', () => {
  it('compat 11/12/1 with candle eligible → CANDLE primary, server values echoed', () => {
    const v = insufficientView('compatibility', { balance: 11, required: 12, shortfall: 1 }, true);
    expect(v).toMatchObject({ productLabel: '궁합', required: 12, available: 11, shortfall: 1, primaryAction: 'CANDLE', topupAvailable: true });
    expect(v.lines.join(' ')).toContain('12덕');
    expect(v.lines.join(' ')).toContain('11덕');
    expect(v.lines.join(' ')).toContain('1덕');
  });
  it('candle NOT eligible → TOMORROW primary', () => {
    const v = insufficientView('compatibility', { balance: 11, required: 12, shortfall: 1 }, false);
    expect(v.primaryAction).toBe('TOMORROW');
  });
  it('general 4/5/1 → 상담 label', () => {
    const v = insufficientView('general', { balance: 4, required: 5, shortfall: 1 }, true);
    expect(v.productLabel).toBe('상담');
    expect(v.shortfall).toBe(1);
  });
  it('trusts the server shortfall even if inconsistent (no client recompute)', () => {
    const v = insufficientView('general', { balance: 4, required: 5, shortfall: 99 }, true);
    expect(v.shortfall).toBe(99);
  });
});

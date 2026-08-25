// Device-QA fixes — (B) the "새 상담 시작하기" insufficient-Duk guard, and (A) top-of-reading hierarchy.
// Source-scan (RN screens aren't node-rendered here); locks the shape so the dead-tap and the flat top can't
// silently return.
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '../..'); // src
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');

describe('B — "새 상담 시작하기" balance guard (no dead tap, no over-spend)', () => {
  const chat = read('app/chat.tsx');
  it('pre-checks the authoritative wallet balance against the fixed price (KNOWN-short only)', () => {
    expect(chat).toMatch(/const required = DUK_PRICES\.general/);
    // Gate via the shared canonical helper: block ONLY on a KNOWN-short balance. An unloaded/unknown wallet
    // must NOT read as 0 → false paywall (the DUK-sync bug); the server stays the final authority.
    expect(chat).toMatch(/isBalanceShort\(wallet\.state, required\)/);
    expect(chat).toMatch(/wallet\.state\?\.totalSpendable/);
  });
  it('refreshes the canonical wallet on focus so the consultation screen reflects out-of-band balance changes', () => {
    expect(chat).toMatch(/useFocusEffect\([\s\S]*refreshWallet\(\)/);
  });
  it('balance < 5 → shows the shared InsufficientDuk in-place, then returns (no navigate/create/LLM)', () => {
    expect(chat).toMatch(/setNewConsultInsufficient\(\{ balance, required, shortfall: required - balance \}\)/);
    // the exhausted block renders InsufficientDuk when the pre-flight blocked it
    expect(chat).toMatch(/newConsultInsufficient \?/);
    expect(chat).toMatch(/<InsufficientDuk[\s\S]*snapshot=\{newConsultInsufficient\}/);
  });
  it('balance >= 5 → starts a fresh consultation via push (remounts), NOT the same-route replace no-op', () => {
    expect(chat).toMatch(/router\.push\(\{ pathname: '\/chat', params: \{ startNew: '1' \} \}\)/);
    // the old dead-tap same-route replace-with-startNew is gone
    expect(chat).not.toMatch(/router\.replace\(\{ pathname: '\/chat', params: \{ startNew: '1' \} \}\)/);
  });
});

describe('B2 — the exhausted gate is CONVERSATION-scoped, not purely the user-level session (no-op fix)', () => {
  const chat = read('app/chat.tsx');
  it('renders the exhausted card + hides the composer on `showExhausted`, NOT raw `turnsExhausted`', () => {
    expect(chat).toMatch(/\{showExhausted \? \(/);   // exhausted card gate
    expect(chat).toMatch(/\{!showExhausted \? \(/);  // composer gate
  });
  it('showExhausted requires this conversation to have actually consumed the session', () => {
    // A fresh/greeting-only consultation must keep its composer even when a PRIOR user-level session is
    // exhausted — otherwise the exhausted card + 새 상담 button dead-locks (can never send to start a new session).
    expect(chat).toMatch(/const showExhausted = turnsExhausted && consultationEngagedHere/);
    expect(chat).toMatch(/const consultationEngagedHere =\s*\(restoredMessages\?\.length \?\? 0\) > 0 \|\| successfulTurnsThisView > 0/);
  });
  it('a successful turn marks this view engaged; a conversation reset clears it (failed turns do not)', () => {
    expect(chat).toMatch(/setSuccessfulTurnsThisView\(\(n\) => n \+ 1\)/); // on success
    expect(chat).toMatch(/setSuccessfulTurnsThisView\(0\)/);               // on reset
  });
});

describe('A — top-of-reading gets the same scannable hierarchy as the pastel sections', () => {
  it('ReadingLead supports an optional semantic label (neutral, no surface)', () => {
    expect(read('components/Reading/Reading.tsx')).toMatch(/label\?: string;/);
  });
  it('consultation: lead = "✨ 덕분이의 한마디"; 상세 해석 gets a neutral heading', () => {
    const c = read('features/intelligence/components/StructuredConsultationResult.tsx');
    expect(c).toMatch(/<ReadingLead label="✨ 덕분이의 한마디"/);
    expect(c).toMatch(/<ReadingSection variant="neutral" title="자세히 보면"/);
  });
  it('today/monthly hero carry a lead label via the shared FortuneReading', () => {
    expect(read('components/Reading/FortuneReading.tsx')).toMatch(/leadLabel\?: string;/);
    expect(read('app/today.tsx')).toMatch(/leadLabel="오늘의 한마디"/);
    expect(read('app/monthly.tsx')).toMatch(/leadLabel="이번 달 한마디"/);
  });
});

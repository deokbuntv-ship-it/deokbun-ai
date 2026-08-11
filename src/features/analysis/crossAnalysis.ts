// Cross-analysis CONTRACT + structural combiner (directive §22) — engine-external,
// Claude-owned, PURE.
//
// This does NOT merge the three engines into one verdict, and it does NOT invent
// any 명리/자미/기문 cross rule (AI_CONSTITUTION 제18조). Each engine's evidence is
// kept INDEPENDENT; this layer only *structurally classifies*, per life-domain,
// whether the engines' already-computed signals AGREE, COMPLEMENT, CONFLICT, or
// are INSUFFICIENT. The `polarity` on each signal is supplied by the engine
// adapter (from real engine output) — never derived here. Unavailable engines
// contribute nothing (they never count as agreement).

export type EngineId = 'saju' | 'ziwei' | 'qimen';

// The shared semantic domains the three systems can be compared on.
export type LifeDomain =
  | 'wealth'
  | 'career'
  | 'relationship'
  | 'health'
  | 'movement'
  | 'timing'
  | 'risk'
  | 'opportunity';

export const LIFE_DOMAINS: readonly LifeDomain[] = [
  'wealth', 'career', 'relationship', 'health', 'movement', 'timing', 'risk', 'opportunity',
] as const;

// A single engine's stance on one domain. `available:false` engines are ignored.
// `polarity` is engine-provided evidence, not an interpretation invented here.
export type Polarity = 'positive' | 'neutral' | 'caution';

export type EngineSignal = {
  engine: EngineId;
  available: boolean;
  polarity?: Polarity;
  note?: string; // short engine-provided evidence label; never fabricated prose
};

export type Agreement =
  | 'aligned' // ≥2 available engines, all the same non-neutral polarity
  | 'complementary' // available engines don't conflict (mix of neutral + one side)
  | 'conflicting' // at least one 'positive' and one 'caution' among available
  | 'insufficient_evidence'; // fewer than 2 available engines

export type DomainCross = {
  domain: LifeDomain;
  signals: EngineSignal[]; // preserved independently (never merged into one)
  availableCount: number;
  agreement: Agreement;
};

// Structural classification only. Rules:
//  - <2 available engines            → insufficient_evidence
//  - all available same polarity     → aligned
//  - contains BOTH positive & caution → conflicting
//  - otherwise (neutral + one side)  → complementary
export function crossAnalyzeDomain(
  domain: LifeDomain,
  signals: EngineSignal[],
): DomainCross {
  const available = signals.filter((s) => s.available && s.polarity !== undefined);
  const availableCount = available.length;

  let agreement: Agreement;
  if (availableCount < 2) {
    agreement = 'insufficient_evidence';
  } else {
    const polarities = new Set(available.map((s) => s.polarity));
    const hasPositive = polarities.has('positive');
    const hasCaution = polarities.has('caution');
    if (hasPositive && hasCaution) {
      agreement = 'conflicting';
    } else if (polarities.size === 1) {
      agreement = 'aligned';
    } else {
      agreement = 'complementary';
    }
  }

  return { domain, signals, availableCount, agreement };
}

// Run the classification across a domain→signals map. Domains with no entry get
// an explicit insufficient_evidence result (truthful "no data" rather than
// silence).
export function crossAnalyze(
  byDomain: Partial<Record<LifeDomain, EngineSignal[]>>,
): DomainCross[] {
  return LIFE_DOMAINS.map((domain) =>
    crossAnalyzeDomain(domain, byDomain[domain] ?? []),
  );
}

// Consultation Intelligence — CROSS ANALYSIS presentation adapter (Sprint 3A-B, §27).
// Maps the DomainCross[] CONTRACT → a fail-closed admin ViewModel. Codex classifies
// agreement/polarity; this file NEVER reconciles or merges engines (§4/§27) — each
// engine's signal is kept SEPARATE, exactly as the contract stores it.
import type { DomainCross } from '@/features/analysis';

import {
  CROSS_AGREEMENT_LABELS,
  CROSS_AGREEMENT_TONES,
  ENGINE_LABELS,
  POLARITY_LABELS,
  POLARITY_TONES,
  type LabelTone,
} from './labels';

// Domain labels (admin/operator Korean). Life domains ≠ assessment axes — a separate set.
const DOMAIN_LABELS: Record<DomainCross['domain'], string> = {
  wealth: '재물',
  career: '직업',
  relationship: '관계',
  health: '건강',
  movement: '이동',
  timing: '시점',
  risk: '위험',
  opportunity: '기회',
};

export type CrossSignalView = {
  engineLabel: string;
  available: boolean;
  polarityLabel: string; // '' when unavailable or polarity absent → caller renders '—'
  polarityTone: LabelTone;
  note: string; // '' unless the engine attached one — never fabricated
};

export type CrossDomainView = {
  domainKey: DomainCross['domain'];
  domainLabel: string;
  agreementLabel: string;
  agreementTone: LabelTone;
  availableCount: number; // how many engines actually contributed a signal
  signals: CrossSignalView[]; // kept independent — NEVER merged into one score (§25/§27)
};

export type CrossAnalysisView =
  | { status: 'empty' }
  | { status: 'available'; domains: CrossDomainView[] };

function toSignal(s: DomainCross['signals'][number]): CrossSignalView {
  const hasPolarity = s.available && s.polarity !== undefined;
  return {
    engineLabel: ENGINE_LABELS[s.engine],
    available: s.available,
    polarityLabel: hasPolarity ? POLARITY_LABELS[s.polarity!] : '',
    polarityTone: hasPolarity ? POLARITY_TONES[s.polarity!] : 'muted',
    note: s.note ?? '',
  };
}

/**
 * Fail-closed: no live cross-analysis caller exists yet, so the default input is []. That
 * renders an honest empty state — NOT a fabricated "all aligned". When Codex produces
 * DomainCross[], each domain shows its agreement class and every engine's independent
 * signal.
 */
export function toCrossAnalysisView(domains: DomainCross[]): CrossAnalysisView {
  if (domains.length === 0) return { status: 'empty' };
  return {
    status: 'available',
    domains: domains.map((d) => ({
      domainKey: d.domain,
      domainLabel: DOMAIN_LABELS[d.domain],
      agreementLabel: CROSS_AGREEMENT_LABELS[d.agreement],
      agreementTone: CROSS_AGREEMENT_TONES[d.agreement],
      availableCount: d.availableCount,
      signals: d.signals.map(toSignal),
    })),
  };
}

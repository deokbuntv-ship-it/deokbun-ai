// Consultation Presentation ViewModel (Commercial UX V4 §4/§5/§7/§10/§47). PURE + deterministic.
// Decouples the UI from the LLM/engine schema: the semantic-validation schema
// (StructuredConsultationViewModel) is the CONTRACT; the UI binds to THIS commercial view instead.
//
// It reshapes the validated answer into the commercial hierarchy (headline → summary → key points →
// cautions → collapsed detail → follow-ups), de-duplicates repeated content conservatively, caps list
// density, and drops empty sections. It NEVER fabricates content (제18조): no "actions" are invented
// because the schema has no action source; a section with no data is simply absent (§47). Internal-term
// hygiene is already applied upstream in buildStructuredConsultationResult (stripEngineLabels).

import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';

export type PresentationDetailSection = { title: string; body: string };

export type ConsultationPresentationVM = {
  headline: string | null; // one-line conclusion (coreSummary)
  disposition: string | null; // optional secondary context line
  summary: string | null; // the concise core interpretation
  keyPoints: string[]; // ≤3 — "핵심 포인트" (from strengths)
  cautions: string[]; // ≤3 — only when present
  detailSections: PresentationDetailSection[]; // collapsed by default in the UI (domain + future flow)
  followUps: string[]; // exactly up to 3
};

const MAX_POINTS = 3;

const norm = (s: string): string => s.replace(/\s+/g, ' ').trim().toLowerCase();

// Dedup within a list AND against anchor texts (headline/summary), conservatively (exact normalized
// match only — never fuzzy/semantic, so distinct advice is never dropped). Blank entries removed.
function dedupe(items: string[] | undefined, against: readonly string[] = []): string[] {
  const seen = new Set(against.map(norm));
  const out: string[] = [];
  for (const raw of items ?? []) {
    const t = (raw ?? '').trim();
    if (!t) continue;
    const n = norm(t);
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(t);
  }
  return out;
}

export function toConsultationPresentation(
  vm: StructuredConsultationViewModel,
): ConsultationPresentationVM {
  const headline = vm.coreSummary?.trim() || null;
  const summary = vm.coreInterpretation?.trim() || null;
  const anchors = [headline, summary].filter((x): x is string => Boolean(x));

  const keyPoints = dedupe(vm.strengths, anchors).slice(0, MAX_POINTS);
  const cautions = dedupe(vm.cautions, [...anchors, ...keyPoints]).slice(0, MAX_POINTS);

  const detailSections: PresentationDetailSection[] = [];
  for (const d of vm.domainInterpretation ?? []) {
    const title = (d.title ?? '').trim();
    const body = (d.body ?? '').trim();
    if (title && body) detailSections.push({ title, body });
  }
  if (vm.futureFlow?.trim()) {
    detailSections.push({ title: '앞으로의 흐름', body: vm.futureFlow.trim() });
  }

  return {
    headline,
    disposition: vm.disposition?.trim() || null,
    summary,
    keyPoints,
    cautions,
    detailSections,
    followUps: dedupe(vm.followUps).slice(0, MAX_POINTS),
  };
}

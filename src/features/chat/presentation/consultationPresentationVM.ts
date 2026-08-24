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
import { filterFollowUpsToScope } from './followUpSafety';

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
const MAX_DETAIL_SECTIONS = 5; // §13/§25 — a long-range answer must not become a wall of many sections
const JACCARD_REDUNDANT = 0.8; // near-duplicate threshold (high → conservative, keeps distinct advice)

const norm = (s: string): string => s.replace(/\s+/g, ' ').trim().toLowerCase();
const tokenize = (s: string): Set<string> =>
  new Set(
    norm(s)
      .replace(/[.,!?·…()"'"":;]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 0),
  );
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

// Dedup V2 (§19): drop an item that adds no new information relative to the anchors (headline/summary)
// or an already-kept item. Conservative by design — an item is redundant only when it is (a) an exact
// normalized match, (b) fully CONTAINED in a longer anchor (the shorter phrase adds nothing), or (c) a
// near-duplicate by high token overlap (≥0.8 Jaccard over ≥3 eojeol). Distinct advice — even on the same
// topic — has different words/tokens and is kept. Blank entries removed.
function isRedundant(candidate: string, against: readonly string[]): boolean {
  const nc = norm(candidate);
  const tc = tokenize(candidate);
  for (const a of against) {
    const na = norm(a);
    if (na === nc) return true; // exact
    if (nc.length >= 4 && na.length > nc.length && na.includes(nc)) return true; // candidate ⊂ anchor
    if (tc.size >= 3 && jaccard(tc, tokenize(a)) >= JACCARD_REDUNDANT) return true; // near-duplicate
  }
  return false;
}

function dedupe(items: string[] | undefined, against: readonly string[] = []): string[] {
  const kept: string[] = [];
  for (const raw of items ?? []) {
    const t = (raw ?? '').trim();
    if (!t) continue;
    if (isRedundant(t, [...against, ...kept])) continue;
    kept.push(t);
  }
  return kept;
}

export function toConsultationPresentation(
  vm: StructuredConsultationViewModel,
): ConsultationPresentationVM {
  const headline = vm.coreSummary?.trim() || null;
  const summary = vm.coreInterpretation?.trim() || null;
  const anchors = [headline, summary].filter((x): x is string => Boolean(x));

  const keyPoints = dedupe(vm.strengths, anchors).slice(0, MAX_POINTS);
  const cautions = dedupe(vm.cautions, [...anchors, ...keyPoints]).slice(0, MAX_POINTS);

  // Collapsed detail: domain sections (capped so a long-range answer can't become a wall, §13/§25) with
  // near-duplicate bodies dropped, then the timing flow always last when present.
  const detailSections: PresentationDetailSection[] = [];
  const keptBodies: string[] = [];
  for (const d of vm.domainInterpretation ?? []) {
    if (detailSections.length >= MAX_DETAIL_SECTIONS) break;
    const title = (d.title ?? '').trim();
    const body = (d.body ?? '').trim();
    if (!title || !body) continue;
    // Skip a detail section whose body just restates the summary or an earlier section (§15/§19).
    if (isRedundant(body, [...anchors, ...keptBodies])) continue;
    detailSections.push({ title, body });
    keptBodies.push(body);
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
    // §16 — drop any out-of-scope offer (계약서 검토 / 진단 / 종목 추천 …) before dedup/cap, so a suggested
    // follow-up never implies Deokbuni performs legal/medical/investment professional services.
    followUps: dedupe(filterFollowUpsToScope(vm.followUps)).slice(0, MAX_POINTS),
  };
}

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

// V5 — DELIVERY ORDER for the server-materialized blocks, applied here so the app and any scorer read the
// same order. Anything not listed (the model's own domain sections) keeps its position ahead of them; the
// technical citations always close.
export const VERIFIED_EVIDENCE_TITLE_PREFIX = '전문근거';
const TAIL_ORDER: readonly string[] = [
  // 행동 — one heading per question shape (see groundedActionPlan.ACTION_TITLE).
  '이렇게 움직이시면 됩니다',
  '어느 쪽을 먼저 보시면 됩니다',
  '시점을 이렇게 보시면 됩니다',
  '이렇게 이해하시면 됩니다',
  '이 결을 이렇게 쓰시면 됩니다',
  '한마디',
  '왜 이렇게 보나요',
  '앞으로의 흐름',
];
const RANK_UNLISTED = 10;
const RANK_LISTED = 20;
const RANK_EVIDENCE = 100;

function rankOf(title: string): number {
  if (title.startsWith(VERIFIED_EVIDENCE_TITLE_PREFIX)) return RANK_EVIDENCE;
  const i = TAIL_ORDER.indexOf(title);
  return i >= 0 ? RANK_LISTED + i : RANK_UNLISTED;
}

/** Stable sort into delivery order — sections sharing a rank keep the order they were built in. */
export function orderDetailSections(sections: readonly PresentationDetailSection[]): PresentationDetailSection[] {
  return sections
    .map((s, i) => ({ s, i, r: rankOf(s.title) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((x) => x.s);
}

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
  // AUDIT-DRIVEN REMEDIATION V1 §1 — the server-materialized VerifiedEvidenceCatalog citations. Appended
  // last, always shown (never capped/deduped against the LLM's own prose above — these are authoritative
  // technical citations, not paraphraseable content, and the Content Plan already bounds them to <=4).
  for (const e of vm.verifiedEvidence ?? []) {
    const title = (e.title ?? '').trim();
    const body = (e.body ?? '').trim();
    if (title && body) detailSections.push({ title, body });
  }

  return {
    headline,
    disposition: vm.disposition?.trim() || null,
    summary,
    keyPoints,
    cautions,
    detailSections: orderDetailSections(detailSections),
    // §16 — drop any out-of-scope offer (계약서 검토 / 진단 / 종목 추천 …) before dedup/cap, so a suggested
    // follow-up never implies Deokbuni performs legal/medical/investment professional services.
    followUps: dedupe(filterFollowUpsToScope(vm.followUps)).slice(0, MAX_POINTS),
  };
}

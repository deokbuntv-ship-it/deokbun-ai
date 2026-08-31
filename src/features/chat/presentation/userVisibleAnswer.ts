// USER-VISIBLE ANSWER — the COMPLETE PRODUCT, in the order the reader actually receives it.
//
// The V4 rescore's measurement defect: the scorer read a handful of raw schema fields and never saw the
// server-materialized blocks (전문근거, 왜 이렇게 보나요, and — after V5 — 행동/한마디), while it DID see the
// engine's internal grounded facts. Visible content was under-counted and internal reference was scored as
// if the reader had it. This module is the single definition of "what the user actually sees", so the
// product, the presentation layer and any scorer all read the same thing.
//
// Pure and deterministic. It flattens what `toConsultationPresentation` already produced (delivery order
// included — see `orderDetailSections` there); it adds no content of its own and pulls nothing from
// decisionMeta, the grounded corpus, or evidenceReferences.
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';

import {
  orderDetailSections, toConsultationPresentation, type ConsultationPresentationVM,
} from './consultationPresentationVM';

export type UserVisibleSection = { title: string; body: string };

export type UserVisibleAnswer = {
  sections: readonly UserVisibleSection[];
  /** The same sections flattened — what a scorer or a plain-text channel reads. */
  text: string;
};

// Delivery ORDER lives with the presentation VM, so the app's own rendering and this flattening can never
// disagree about what the reader saw first.
export { orderDetailSections, VERIFIED_EVIDENCE_TITLE_PREFIX } from './consultationPresentationVM';

/**
 * The complete product as the reader receives it:
 *
 *   결론 → 쉬운 설명 → 좋은 흐름 → 조심할 점 → 행동 → 한마디 → 왜 이렇게 보나요 → 전문근거 → 후속질문
 *
 * Empty sections are omitted (§47) — never padded with a placeholder.
 */
export function buildUserVisibleAnswer(vm: StructuredConsultationViewModel): UserVisibleAnswer {
  return fromPresentation(toConsultationPresentation(vm));
}

/** Same contract, when the caller already has the presentation VM. */
export function fromPresentation(p: ConsultationPresentationVM): UserVisibleAnswer {
  const sections: UserVisibleSection[] = [];
  const push = (title: string, body: string | null | undefined) => {
    const t = (body ?? '').trim();
    if (t.length > 0) sections.push({ title, body: t });
  };

  push('결론', p.headline);
  push('기본 성향', p.disposition);
  push('쉬운 설명', p.summary);
  if (p.keyPoints.length > 0) push('좋은 흐름', p.keyPoints.join('\n'));
  if (p.cautions.length > 0) push('조심할 점', p.cautions.join('\n'));
  for (const d of orderDetailSections(p.detailSections)) push(d.title, d.body);
  if (p.followUps.length > 0) push('후속질문', p.followUps.join('\n'));

  return {
    sections,
    text: sections.map((s) => `[${s.title}]\n${s.body}`).join('\n\n'),
  };
}

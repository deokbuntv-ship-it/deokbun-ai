// Deterministic consultation report composer (Commercial UX V4 §26/§27/§31/§65). PURE + deterministic.
// Builds a report payload from the conversation's ALREADY-VALIDATED presentation answers + the stored
// conversation summary — with ZERO additional LLM calls (§65) and NO raw prompt/grounding/engine payload.
// Never fabricates content (제18조): fields are composed only from what the answers actually contain.
//
// The narrative/LLM report is a separate, owner-gated seam (§28) — this default path is LLM-free.

import { stripEngineLabels } from '@/features/chat/presentation/commercialText';
import type { ConsultationPresentationVM } from '@/features/chat/presentation/consultationPresentationVM';

export type ConsultationReportPayload = {
  title: string;
  summary: string; // one short paragraph (stored summary if present, else composed from headlines)
  keyFindings: string[]; // deduped across all answers (headlines + key points)
  cautions: string[]; // deduped across all answers
  coveredTopics: string[]; // the questions asked, deduped
  /**
   * 2026-09-19 — 상담 답변에서 **접혀 있던 자세한 해석**(전문근거 · 왜 이렇게 보나요 · 행동 · 시기).
   * 예전에는 리포트가 headline·keyPoints·cautions 만 모아서, 조립기가 만든 자세한 내용이 리포트에
   * **한 줄도 오지 않았다**. 상담 답변이 짧아지면 리포트까지 같이 얇아지므로 여기서 받는다.
   * 리포트는 문서라 칸을 나눠도 되고 길어도 된다.
   */
  details?: { title: string; body: string }[]; // 선택값 — 예전에 저장된 리포트에는 없다
  generatedAt: string; // ISO — passed in (deterministic/testable; no Date.now here)
};

const MAX_FINDINGS = 6;
const MAX_CAUTIONS = 5;
const MAX_TOPICS = 8;
const MAX_DETAILS = 12; // 문서이므로 넉넉히. 상담 답변의 5칸 상한과 달리 여기서는 버리지 않는다.
const TITLE_MAX = 22;

const norm = (s: string): string => s.replace(/\s+/g, ' ').trim().toLowerCase();

function dedupeClean(items: readonly string[], cap: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const t = stripEngineLabels((raw ?? '').trim());
    if (!t) continue;
    const n = norm(t);
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(t);
    if (out.length >= cap) break;
  }
  return out;
}

// Deterministic title from the first meaningful question: strip trailing question words/punctuation,
// trim to a readable length, append "상담 보고서". No LLM (§31).
export function deriveReportTitle(firstQuestion: string | undefined): string {
  const q = stripEngineLabels((firstQuestion ?? '').trim());
  if (!q) return '상담 보고서';
  let topic = q
    .replace(/[?？.!！~]+$/g, '')
    .replace(/(알려줘|알려주세요|어때\??|어떤가요|봐줘|봐\s*주세요|궁금해요?|볼까\??)\s*$/g, '')
    .trim();
  if (topic.length > TITLE_MAX) topic = `${topic.slice(0, TITLE_MAX).trim()}…`;
  return topic ? `${topic} 상담 보고서` : '상담 보고서';
}

export function buildConsultationReport(input: {
  questions: readonly string[];
  answers: readonly ConsultationPresentationVM[];
  storedSummary?: string | null;
  generatedAt: string;
}): ConsultationReportPayload {
  const { questions, answers, storedSummary, generatedAt } = input;

  const headlines = answers.map((a) => a.headline ?? '').filter(Boolean);
  const summary =
    stripEngineLabels((storedSummary ?? '').trim()) ||
    // fall back to the answers' one-line conclusions, joined into a short paragraph
    dedupeClean(headlines, 3).join(' ') ||
    '';

  const keyFindings = dedupeClean(
    [...headlines, ...answers.flatMap((a) => a.keyPoints)],
    MAX_FINDINGS,
  );
  const cautions = dedupeClean(answers.flatMap((a) => a.cautions), MAX_CAUTIONS);
  const coveredTopics = dedupeClean(questions, MAX_TOPICS);
  // 답변마다 접혀 있던 자세한 해석을 모은다. 제목이 같으면 한 번만(같은 근거가 되풀이되지 않게).
  const seenDetail = new Set<string>();
  const details: { title: string; body: string }[] = [];
  for (const a of answers) {
    for (const d of a.detailSections ?? []) {
      const title = (d.title ?? '').trim();
      const body = (d.body ?? '').trim();
      if (!title || !body || seenDetail.has(title) || details.length >= MAX_DETAILS) continue;
      seenDetail.add(title);
      details.push({ title, body });
    }
  }

  return {
    title: deriveReportTitle(questions[0]),
    summary,
    keyFindings,
    cautions,
    coveredTopics,
    details,
    generatedAt,
  };
}

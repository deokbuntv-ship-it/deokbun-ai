// Deterministic 궁합 report composer (Compatibility V1 §41-§43). PURE + deterministic, ZERO extra LLM
// calls: it composes the report from the SERVER's deterministic tier + the conversation's already-
// validated pair answers. Reuses the same ConsultationReportPayload shape so the entire report / share /
// PremiumReportView / DetailBottomNav stack works UNCHANGED (owner §41). Never fabricates a section.
import { stripEngineLabels } from '@/features/chat/presentation/commercialText';
import type { ConsultationPresentationVM } from '@/features/chat/presentation/consultationPresentationVM';
import type { ConsultationReportPayload } from '@/features/chat/report/consultationReportComposer';

const MAX_FINDINGS = 6;
const MAX_CAUTIONS = 5;
const MAX_TOPICS = 8;
const NAME_MAX = 12;

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

function shortName(name: string): string {
  const n = (name ?? '').trim() || '상대방';
  return n.length > NAME_MAX ? `${n.slice(0, NAME_MAX)}…` : n;
}

// Deterministic pair title (owner §43): "{self}님과 {target}님의 궁합 보고서". No LLM.
export function deriveCompatibilityReportTitle(selfLabel: string, targetLabel: string): string {
  return `${shortName(selfLabel)}님과 ${shortName(targetLabel)}님의 궁합 보고서`;
}

export type CompatibilityReportDimension = { title: string; verdict: string };

export function buildCompatibilityReport(input: {
  selfLabel: string;
  targetLabel: string;
  overallLabel: string;
  dimensions: readonly CompatibilityReportDimension[];
  questions: readonly string[];
  answers: readonly ConsultationPresentationVM[];
  storedSummary?: string | null;
  generatedAt: string;
}): ConsultationReportPayload {
  const { selfLabel, targetLabel, overallLabel, dimensions, questions, answers, storedSummary, generatedAt } = input;

  const headlines = answers.map((a) => a.headline ?? '').filter(Boolean);
  // 종합 궁합: the tier verdict first (server-owned), then the stored summary / first conclusion.
  const tail = stripEngineLabels((storedSummary ?? '').trim()) || dedupeClean(headlines, 2).join(' ');
  const summary = `두 분은 전체적으로 ${overallLabel}이에요.${tail ? ` ${tail}` : ''}`;

  // 분야별 궁합 lines (deterministic, from the tier) lead the findings, then the answers' strengths/points.
  const dimensionLines = dimensions.map((d) => `${d.title}: ${d.verdict}`);
  const keyFindings = dedupeClean(
    [...dimensionLines, ...answers.flatMap((a) => a.keyPoints), ...headlines],
    MAX_FINDINGS,
  );
  const cautions = dedupeClean(answers.flatMap((a) => a.cautions), MAX_CAUTIONS);
  const coveredTopics = dedupeClean(questions, MAX_TOPICS);

  return {
    title: deriveCompatibilityReportTitle(selfLabel, targetLabel),
    summary,
    keyFindings,
    cautions,
    coveredTopics,
    generatedAt,
  };
}

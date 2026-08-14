import { View } from 'react-native';

import { Text } from '@/components/Text';
import type { DomainCross } from '@/features/analysis';
import { GROUNDING_UNAVAILABLE, type ConsultationGrounding } from '@/features/chat/prompts/grounding';
import {
  QUALITY_EVALUATOR_NOT_CONNECTED,
  type AssessmentItem,
  type ConsultationOutcome,
  type QualityReview,
  type UserFeedback,
} from '@/features/intelligence';

import { adminTheme } from '../../adminTheme';
import { AssessmentMatrix } from '../AssessmentMatrix';
import { AdminPanel } from './AdminPanel';
import { CrossAnalysisPanel } from './CrossAnalysisPanel';
import { EngineEvidencePanel } from './EngineEvidencePanel';
import { EvaluationSummary } from './EvaluationSummary';
import { FeedbackPanel } from './FeedbackPanel';
import { GroundingSummary } from './GroundingSummary';
import { HumanReviewPanel } from './HumanReviewPanel';
import { OutcomePanel } from './OutcomePanel';

// ADMIN Consultation Inspector (§21/§22). Composes the full trace chain — QUESTION →
// CONTEXT → ENGINE EVIDENCE → ASSESSMENT → CROSS ANALYSIS → GROUNDING → FINAL RESPONSE →
// EVALUATION → FEEDBACK → HUMAN REVIEW → OUTCOME — over the EXISTING contracts. Every
// section renders its own fail-closed state, so the operator sees the whole layout even
// while the pipeline is unconnected. NO fake consultation cases are ever created (§22/§37).

export type InspectorContext = {
  caseId: string;
  subjectId: string;
  question: string;
  createdAt: string;
  questionScope: string;
  birthTimeStatus: string;
  promptVersion: string;
};

export type ConsultationInspectorData = {
  context: InspectorContext | null;
  grounding: ConsultationGrounding;
  assessments: AssessmentItem[];
  crossDomains: DomainCross[];
  review: QualityReview;
  feedback: UserFeedback | null;
  outcomes: ConsultationOutcome[];
  finalResponse: string | null;
};

// A fail-closed QualityReview (evaluator not connected). Fixed placeholder timestamps —
// this is the not-connected default, never a fabricated evaluation.
const NOT_CONNECTED_REVIEW: QualityReview = {
  qualityReviewId: 'not-connected',
  consultationCaseId: 'not-connected',
  source: 'auto_evaluator',
  dimensions: {},
  overall: 'not_evaluated',
  reviewStatus: 'pending',
  reviewer: null,
  notesRef: null,
  evaluatorVersion: QUALITY_EVALUATOR_NOT_CONNECTED,
  schemaVersion: 'quality@1.0.0',
  reviewedAt: null,
  createdAt: '',
};

// The not-connected default trace — all fail-closed inputs. Codex replaces this with a
// real trace from adminIntelligenceService.getRun() and every panel renders it unchanged.
export const NOT_CONNECTED_INSPECTOR: ConsultationInspectorData = {
  context: null,
  grounding: GROUNDING_UNAVAILABLE,
  assessments: [],
  crossDomains: [],
  review: NOT_CONNECTED_REVIEW,
  feedback: null,
  outcomes: [],
  finalResponse: null,
};

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
      <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
        {label}
      </Text>
      <Text variant="bodySmall" style={{ color: adminTheme.ink, maxWidth: '70%' }} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export function ConsultationInspector({
  connected,
  data,
}: {
  connected: boolean;
  data: ConsultationInspectorData;
}) {
  const ctx = data.context;
  const dash = '—';
  return (
    <View style={{ gap: 16 }}>
      {!connected ? (
        <View
          style={{
            backgroundColor: adminTheme.infoBg,
            borderRadius: 8,
            padding: 14,
            borderWidth: 1,
            borderColor: adminTheme.border,
          }}
        >
          <Text variant="bodySmall" style={{ color: adminTheme.info, fontWeight: '700' }}>
            연결 준비 중
          </Text>
          <Text variant="caption" style={{ color: adminTheme.inkVariant, marginTop: 4 }}>
            상담 인텔리전스 파이프라인(엔진 → 근거 → 평가 → 지속화)이 아직 연결되지 않았습니다. 각
            섹션은 실제 데이터가 연결되면 그대로 채워지는 fail-closed 상태로 표시됩니다.
          </Text>
        </View>
      ) : null}

      {/* CONTEXT (§23) — PII-minimal */}
      <AdminPanel title="컨텍스트" subtitle="Context">
        <ContextRow label="Case ID" value={ctx?.caseId ?? dash} />
        <ContextRow label="Subject ID" value={ctx?.subjectId ?? dash} />
        <ContextRow label="질문" value={ctx?.question ?? dash} />
        <ContextRow label="질문 유형" value={ctx?.questionScope ?? dash} />
        <ContextRow label="출생시간 상태" value={ctx?.birthTimeStatus ?? dash} />
        <ContextRow label="생성 시각" value={ctx ? ctx.createdAt.slice(0, 16).replace('T', ' ') : dash} />
        <ContextRow label="프롬프트 버전" value={ctx?.promptVersion ?? dash} />
      </AdminPanel>

      <EngineEvidencePanel grounding={data.grounding} />

      {/* ASSESSMENT (§25) — reuse the existing matrix */}
      <AdminPanel title="어세스먼트" subtitle="Assessment · ▲근거/▼반대는 합산하지 않음">
        <AssessmentMatrix items={data.assessments} />
      </AdminPanel>

      <CrossAnalysisPanel domains={data.crossDomains} />
      <GroundingSummary grounding={data.grounding} />

      {/* FINAL RESPONSE (§29) — show, never regenerate */}
      <AdminPanel title="최종 응답" subtitle="Final Response">
        {data.finalResponse ? (
          <Text variant="bodySmall" style={{ color: adminTheme.ink, lineHeight: 20 }}>
            {data.finalResponse}
          </Text>
        ) : (
          <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
            연결된 최종 응답이 없습니다.
          </Text>
        )}
      </AdminPanel>

      <EvaluationSummary review={data.review} />
      <FeedbackPanel feedback={data.feedback} />
      <HumanReviewPanel review={data.review} />
      <OutcomePanel outcomes={data.outcomes} />
    </View>
  );
}

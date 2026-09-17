import { View } from 'react-native';

import { ReadingBullets, ReadingEvidence, ReadingLead, ReadingSection } from '@/components/Reading';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { toConsultationPresentation } from '@/features/chat/presentation/consultationPresentationVM';
import type { FeedbackVerdict } from '@/features/intelligence';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

import { ConsultationStateNotice } from './ConsultationStateNotice';
import { FollowUpSuggestions } from './FollowUpSuggestions';
import { UserFeedbackControl } from './UserFeedbackControl';

// 전문 근거 detail row — a consumer-language domain title over its interpretation body, inside the collapsed
// "왜 이렇게 보나요?" evidence. Kept plain (no pastel) so the evidence reads as neutral reference.
function EvidenceRow({ title, body }: { title: string; body?: string }) {
  if (!body) return null;
  return (
    <Stack gap="xs">
      <Text variant="bodySmall" colorToken="textSecondary" style={{ fontWeight: '700' }}>
        {title}
      </Text>
      <Text variant="reading" style={{ lineHeight: 28 }}>
        {body}
      </Text>
    </Stack>
  );
}

// Commercial cleanup (V4 §22/§23/§24): the AssessmentSummary (fail-closed "아직 평가를 보여드리지
// 않아요" limitation copy) and the InterpretationEvidenceSheet (raw 활용된 관점 / 미사용 engine status,
// 천간지지-level facts) are internal/debug surfaces — they are NOT rendered in the consumer answer. The
// user sees only normalized, natural-language interpretation. The assessment/grounding remain on the
// view-model for admin/inspection use; they are simply not shown here.

// Commercial Consultation UX V4 — the Structured Consultation Result, COMMERCIAL hierarchy.
//
// OWNER PRODUCT DECISION (supersedes the old GOLDEN_FLOW_V4_UX §0 "long-form expanded by default"
// lock): CONCLUSION FIRST → core points → cautions → DETAIL ON DEMAND (collapsed) → follow-ups.
// The component binds to a commercial `ConsultationPresentationVM` (via toConsultationPresentation)
// rather than the raw LLM/engine schema, so the UI layout is decoupled from the validation schema.
// It NEVER fabricates copy — a section with no source is omitted (fail-closed). Internal engine
// terminology is already stripped upstream (buildStructuredConsultationResult → stripEngineLabels).

// `StructuredConsultationViewModel` moved to a runtime-neutral module (§2) so the server/Edge consultation
// contract does not depend on this React-Native component. Re-exported here for existing UI importers.
export type { StructuredConsultationViewModel };

export function StructuredConsultationResult({
  vm,
  onSelectFollowUp,
  onRetry,
  onFeedback,
  initialFeedback,
  onReport,
  reported,
}: {
  vm: StructuredConsultationViewModel;
  onSelectFollowUp?: (q: string) => void;
  onRetry?: () => void;
  onFeedback?: (verdict: FeedbackVerdict) => Promise<void> | void;
  initialFeedback?: FeedbackVerdict | null;
  /** AI 답변 신고 시트를 여는 콜백 (구글 AI 생성 콘텐츠 정책). 없으면 입구를 그리지 않는다. */
  onReport?: () => void;
  reported?: boolean;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  // A whole-result truthful state replaces the body — never a fabricated reading.
  if (vm.state) {
    return <ConsultationStateNotice state={vm.state} onRetry={onRetry} />;
  }

  // Bind to the commercial presentation model (hierarchy + dedup + empty-filter + hygiene upstream).
  const p = toConsultationPresentation(vm);
  const hasDetail = p.detailSections.length > 0;

  // 2026-09-19 지시서 PART 3 — 짧은 답이 있으면 **그것 하나가 답이다.** 상담은 짧은 대화이고, 결론·좋은 흐름·
  // 조심할 점·근거는 "왜 이렇게 보나요?" 를 눌러야 펼쳐진다(버리지 않는다 — 리포트도 여기서 모은다).
  // 짧은 답이 없는 예전 답·근거 판단이 서지 않은 답은 아래 예전 화면 그대로다.
  if (p.shortAnswer) {
    const folded = [
      { title: '결론', body: p.headline },
      { title: '기본 성향', body: p.disposition },
      { title: '쉬운 설명', body: p.summary },
      { title: '좋은 흐름', body: p.keyPoints.join('\n') },
      { title: '조심할 점', body: p.cautions.join('\n') },
      ...p.detailSections,
    ].filter((d) => (d.body ?? '').trim().length > 0);
    return (
      <Stack gap="md">
        <ReadingSection variant="neutral" emoji={null} style={{ paddingVertical: spacing.xl }}>
          <Text variant="reading" style={{ lineHeight: 30 }}>
            {p.shortAnswer}
          </Text>
        </ReadingSection>

        {folded.length > 0 ? (
          <ReadingEvidence>
            {folded.map((d, i) => (
              <EvidenceRow key={i} title={d.title} body={d.body ?? undefined} />
            ))}
          </ReadingEvidence>
        ) : null}

        {p.followUps.length > 0 && onSelectFollowUp ? (
          <FollowUpSuggestions suggestions={p.followUps} onSelect={onSelectFollowUp} />
        ) : null}

        <UserFeedbackControl
          onSubmit={onFeedback}
          initialVerdict={initialFeedback}
          onReport={onReport}
          reported={reported}
        />
      </Stack>
    );
  }

  // Reading hierarchy (DEOKBUNI_READING_EXPERIENCE): 결론 → 쉬운 설명 → 🌿 좋은 흐름 → 🕯️ 조심할 점 →
  // (왜 이렇게 보나요? ▾ 전문 근거) → 이어서 물어보기. Only two sections take a pastel surface (§7), so the
  // reading stays a connected letter, not a colour patchwork. Empty sections are simply absent (fail-closed).
  return (
    <Stack gap="md">
      {/* 2026-09-19 — 제목 두 개("✨ 덕분이의 한마디" · "자세히 보면")를 없앴다.
          오너 판정: "딱 짚어주고, 편안해야 하고, 다음이 궁금해야 대화가 된다". 그 제목들이 짧은 답
          하나를 둘로 갈라 보고서처럼 읽히게 만들고 있었다. 결론과 이야기를 **한 카드 안에** 두어
          이어지는 말 한 줄기로 읽히게 한다. 성향 한 줄은 그 아래 보조로 붙는다. */}
      {p.headline ? (
        <ReadingLead sub={p.disposition} body={p.summary}>
          {p.headline}
        </ReadingLead>
      ) : p.summary ? (
        <ReadingSection variant="neutral" emoji={null}>
          <Text variant="reading" style={{ lineHeight: 28 }}>
            {p.summary}
          </Text>
        </ReadingSection>
      ) : null}

      {p.keyPoints.length > 0 ? (
        <ReadingSection variant="positive" title="좋은 흐름">
          <ReadingBullets items={p.keyPoints} glyphColor={theme.onSage} />
        </ReadingSection>
      ) : null}

      {p.cautions.length > 0 ? (
        <ReadingSection variant="caution" title="조심할 점">
          <ReadingBullets items={p.cautions} glyphColor={theme.onButter} />
        </ReadingSection>
      ) : null}

      {/* 전문 근거 — collapsed. Normalized user-language interpretation only; NO raw engine evidence /
          활용됨·미사용 / assessment-limitation copy (§22-§24 upstream keep those off the consumer answer). */}
      {hasDetail ? (
        <ReadingEvidence>
          {p.detailSections.map((d, i) => (
            <EvidenceRow key={i} title={d.title} body={d.body} />
          ))}
        </ReadingEvidence>
      ) : null}

      {p.followUps.length > 0 && onSelectFollowUp ? (
        <FollowUpSuggestions suggestions={p.followUps} onSelect={onSelectFollowUp} />
      ) : null}

      <UserFeedbackControl
        onSubmit={onFeedback}
        initialVerdict={initialFeedback}
        onReport={onReport}
        reported={reported}
      />
    </Stack>
  );
}

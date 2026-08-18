import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { toConsultationPresentation } from '@/features/chat/presentation/consultationPresentationVM';
import type { FeedbackVerdict } from '@/features/intelligence';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

import { AssessmentSummary } from './AssessmentSummary';
import { ConsultationStateNotice } from './ConsultationStateNotice';
import { FollowUpSuggestions } from './FollowUpSuggestions';
import { InterpretationEvidenceSheet } from './InterpretationEvidenceSheet';
import { UserFeedbackControl } from './UserFeedbackControl';

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

function Section({ title, body }: { title: string; body?: string }) {
  if (!body) return null;
  return (
    <Stack gap="xs">
      <Text variant="bodySmall" colorToken="textSecondary">
        {title}
      </Text>
      <Text variant="bodyMedium" style={{ lineHeight: 23 }}>
        {body}
      </Text>
    </Stack>
  );
}

function BulletList({ title, items, glyphColor }: { title: string; items?: string[]; glyphColor: string }) {
  if (!items || items.length === 0) return null;
  return (
    <Stack gap="xs">
      <Text variant="bodySmall" colorToken="textSecondary">
        {title}
      </Text>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Text variant="bodyMedium" style={{ color: glyphColor }}>
            ·
          </Text>
          <Text variant="bodyMedium" style={{ flex: 1, lineHeight: 23 }}>
            {it}
          </Text>
        </View>
      ))}
    </Stack>
  );
}

export function StructuredConsultationResult({
  vm,
  onSelectFollowUp,
  onRetry,
  onFeedback,
}: {
  vm: StructuredConsultationViewModel;
  onSelectFollowUp?: (q: string) => void;
  onRetry?: () => void;
  onFeedback?: (verdict: FeedbackVerdict) => Promise<void> | void;
}) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;
  const [detailOpen, setDetailOpen] = useState(false);

  // A whole-result truthful state replaces the body — never a fabricated reading.
  if (vm.state) {
    return <ConsultationStateNotice state={vm.state} onRetry={onRetry} />;
  }

  // Bind to the commercial presentation model (hierarchy + dedup + empty-filter + hygiene upstream).
  const p = toConsultationPresentation(vm);
  const hasDetail = p.detailSections.length > 0;

  return (
    <Stack gap="lg">
      {/* 1 — HEADLINE conclusion (visible on the first viewport, §7) + optional disposition line */}
      {p.headline ? (
        <Card radius="xl">
          <Text variant="bodyLarge" style={{ fontWeight: '700', lineHeight: 26 }}>
            {p.headline}
          </Text>
          {p.disposition ? (
            <Text
              variant="bodySmall"
              colorToken="textSecondary"
              style={{ marginTop: spacing.xs, lineHeight: 21 }}
            >
              {p.disposition}
            </Text>
          ) : null}
        </Card>
      ) : null}

      {/* 2 — concise core interpretation (the summary) */}
      {p.summary ? (
        <Card radius="xl">
          <Text variant="bodyMedium" style={{ lineHeight: 23 }}>
            {p.summary}
          </Text>
        </Card>
      ) : null}

      {/* 3 — key points + cautions (compact) */}
      {p.keyPoints.length > 0 || p.cautions.length > 0 ? (
        <Card radius="xl">
          <Stack gap="lg">
            <BulletList title="핵심 포인트" items={p.keyPoints} glyphColor={theme.secondary} />
            <BulletList title="조심할 점" items={p.cautions} glyphColor={theme.accent} />
          </Stack>
        </Card>
      ) : null}

      {/* 4 — DETAIL ON DEMAND (§8/§11): 상세 근거 + assessment + explainability collapsed by default */}
      {hasDetail ? (
        <Card radius="xl">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={detailOpen ? '상세 근거 접기' : '상세 근거 보기'}
            onPress={() => setDetailOpen((o) => !o)}
            hitSlop={8}
          >
            <Text variant="bodyMedium" style={{ fontWeight: '600', color: theme.secondary }}>
              {detailOpen ? '상세 근거 접기 ▴' : '상세 근거 보기 ▾'}
            </Text>
          </Pressable>
          {detailOpen ? (
            <Stack gap="lg" style={{ marginTop: spacing.md }}>
              {p.detailSections.map((d, i) => (
                <Section key={i} title={d.title} body={d.body} />
              ))}
              <AssessmentSummary view={vm.assessment} />
              <InterpretationEvidenceSheet grounding={vm.grounding} />
            </Stack>
          ) : null}
        </Card>
      ) : (
        // No detail sections → still expose the explainability trigger (its own collapse).
        <InterpretationEvidenceSheet grounding={vm.grounding} />
      )}

      {/* 5 — recommended follow-ups (composer stays external) */}
      {p.followUps.length > 0 && onSelectFollowUp ? (
        <FollowUpSuggestions suggestions={p.followUps} onSelect={onSelectFollowUp} />
      ) : null}

      {/* feedback (honest seam) */}
      <UserFeedbackControl onSubmit={onFeedback} />
    </Stack>
  );
}

import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import type { ConsumerAssessmentView, FeedbackVerdict } from '@/features/intelligence';
import type { ConsultationGrounding } from '@/features/chat/prompts/grounding';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

import { AssessmentSummary } from './AssessmentSummary';
import { ConsultationStateNotice, type ConsultationState } from './ConsultationStateNotice';
import { FollowUpSuggestions } from './FollowUpSuggestions';
import { InterpretationEvidenceSheet } from './InterpretationEvidenceSheet';
import { UserFeedbackControl } from './UserFeedbackControl';

// Golden Flow v3 — the Structured Consultation Result (§6/§7/§15). Composes the approved
// result hierarchy over REAL contract fields only. Every prose section (core summary,
// disposition, interpretation, strengths, cautions, domain, future flow) is a caller-
// provided string sourced from the LLM response — this component NEVER fabricates
// interpretation copy (§6). A section with no source is simply omitted. Categorical
// evaluation comes from `assessment` (fail-closed); explainability from `grounding`.
//
// PROGRESSIVE DISCLOSURE (§15): the initial view prioritises core → assessment →
// current flow → core interpretation. Everything else expands behind 더 자세히 보기.
// This is a hybrid (chat + structured result) — it lives inside the chat, and the
// free-form composer stays outside it (§6/§18).

export type StructuredConsultationViewModel = {
  // 1 — one-line core summary (from the LLM). '' → omitted.
  coreSummary?: string;
  // 2 — 기본 성향
  disposition?: string;
  // 3 — Assessment (fail-closed ConsumerAssessmentView)
  assessment: ConsumerAssessmentView;
  // 4 — current flow / 현재 흐름
  currentFlow?: string;
  // 5 — core interpretation
  coreInterpretation?: string;
  // 7 — strengths
  strengths?: string[];
  // 8 — cautions
  cautions?: string[];
  // 9 — domain-specific interpretation
  domainInterpretation?: { title: string; body: string }[];
  // 10 — future flow
  futureFlow?: string;
  // 11 — Explainability source
  grounding: ConsultationGrounding;
  // 12 — recommended follow-up questions (helpers only)
  followUps?: string[];
  // Whole-result truthful state (conflict/partial/failure/…); overrides the body.
  state?: ConsultationState;
};

function Section({ title, body }: { title: string; body?: string }) {
  if (!body) return null;
  return (
    <Stack gap="xs">
      <Text variant="bodySmall" colorToken="textSecondary">
        {title}
      </Text>
      <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
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
          <Text variant="bodyMedium" style={{ flex: 1, lineHeight: 22 }}>
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
  const [expanded, setExpanded] = useState(false);

  // A whole-result truthful state replaces the body — never a fabricated reading (§13).
  if (vm.state) {
    return <ConsultationStateNotice state={vm.state} onRetry={onRetry} />;
  }

  const hasDetail =
    !!vm.coreInterpretation ||
    (vm.strengths?.length ?? 0) > 0 ||
    (vm.cautions?.length ?? 0) > 0 ||
    (vm.domainInterpretation?.length ?? 0) > 0 ||
    !!vm.futureFlow;

  return (
    <Stack gap="lg">
      {/* 1 — core summary (lead) */}
      {vm.coreSummary ? (
        <Card radius="xl">
          <Text variant="bodyLarge" style={{ fontWeight: '700', lineHeight: 26 }}>
            {vm.coreSummary}
          </Text>
        </Card>
      ) : null}

      {/* 2 — disposition */}
      {vm.disposition ? (
        <Card radius="xl">
          <Section title="기본 성향" body={vm.disposition} />
        </Card>
      ) : null}

      {/* 3 — Assessment summary (fail-closed) */}
      <AssessmentSummary view={vm.assessment} />

      {/* 4 — current flow */}
      {vm.currentFlow ? (
        <Card radius="xl">
          <Section title="현재 흐름" body={vm.currentFlow} />
        </Card>
      ) : null}

      {/* 5 — core interpretation (always in initial view) */}
      {vm.coreInterpretation ? (
        <Card radius="xl">
          <Section title="핵심 해석" body={vm.coreInterpretation} />
        </Card>
      ) : null}

      {/* 6 — 더 자세히 보기 (progressive disclosure) */}
      {hasDetail ? (
        <>
          {!expanded ? (
            <Pressable
              onPress={() => setExpanded(true)}
              accessibilityRole="button"
              accessibilityLabel="더 자세히 보기"
              style={{ alignSelf: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.lg }}
            >
              <Text variant="bodyMedium" style={{ color: theme.secondary, fontWeight: '700' }}>
                더 자세히 보기 ▾
              </Text>
            </Pressable>
          ) : (
            <Card radius="xl">
              <Stack gap="lg">
                <BulletList title="강점" items={vm.strengths} glyphColor={theme.secondary} />
                <BulletList title="주의할 점" items={vm.cautions} glyphColor={theme.accent} />
                {vm.domainInterpretation?.map((d, i) => (
                  <Section key={i} title={d.title} body={d.body} />
                ))}
                <Section title="앞으로의 흐름" body={vm.futureFlow} />
              </Stack>
            </Card>
          )}
        </>
      ) : null}

      {/* 11 — Explainability */}
      <InterpretationEvidenceSheet grounding={vm.grounding} />

      {/* 12 — recommended follow-ups (helpers only; composer stays external §18) */}
      {vm.followUps && onSelectFollowUp ? (
        <FollowUpSuggestions suggestions={vm.followUps} onSelect={onSelectFollowUp} />
      ) : null}

      {/* feedback (honest seam) */}
      <UserFeedbackControl onSubmit={onFeedback} />
    </Stack>
  );
}

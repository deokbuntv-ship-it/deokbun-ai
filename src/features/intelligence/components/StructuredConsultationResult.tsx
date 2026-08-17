import { View } from 'react-native';

import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import type { FeedbackVerdict } from '@/features/intelligence';
import type { StructuredConsultationViewModel } from '@/features/intelligence/types/consultationViewModel';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

import { AssessmentSummary } from './AssessmentSummary';
import { ConsultationStateNotice } from './ConsultationStateNotice';
import { FollowUpSuggestions } from './FollowUpSuggestions';
import { InterpretationEvidenceSheet } from './InterpretationEvidenceSheet';
import { UserFeedbackControl } from './UserFeedbackControl';

// Golden Flow V4 — the Structured Consultation Result. Composes the approved answer-first
// hierarchy over REAL contract fields only. Every prose section (core summary, disposition,
// interpretation, strengths, cautions, domain, future flow) is a caller-provided string
// sourced from the LLM response — this component NEVER fabricates interpretation copy. A
// section with no source is simply omitted (fail-closed). Categorical evaluation comes from
// `assessment` (fail-closed); explainability from `grounding`.
//
// LONG-FORM LOCK (docs/GOLDEN_FLOW_V4_UX.md §0): long-form is a core value. The one-sentence
// core is ORIENTATION only — it never shortens the answer. The detailed interpretation
// (핵심 해석 + 강점 + 주의점 + 영역별 해석 + 앞으로의 흐름) renders **EXPANDED by default**; it is
// NEVER hidden behind "더 자세히 보기". Progressive disclosure / collapse is reserved for
// technical evidence + methodology, which live in the Explainability sheet ("왜 이렇게
// 해석했나요?"). The hybrid free-form composer stays outside this component.

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

  // A whole-result truthful state replaces the body — never a fabricated reading.
  if (vm.state) {
    return <ConsultationStateNotice state={vm.state} onRetry={onRetry} />;
  }

  const hasDetailedLongForm =
    (vm.strengths?.length ?? 0) > 0 ||
    (vm.cautions?.length ?? 0) > 0 ||
    (vm.domainInterpretation?.length ?? 0) > 0 ||
    !!vm.futureFlow;

  return (
    <Stack gap="lg">
      {/* 1 — core conclusion (orientation only; never a replacement for the long answer) */}
      {vm.coreSummary ? (
        <Card radius="xl">
          <Text variant="bodyLarge" style={{ fontWeight: '700', lineHeight: 26 }}>
            {vm.coreSummary}
          </Text>
        </Card>
      ) : null}

      {/* 2 — disposition / current context */}
      {vm.disposition ? (
        <Card radius="xl">
          <Section title="기본 성향" body={vm.disposition} />
        </Card>
      ) : null}

      {/* 3 — Assessment summary (fail-closed, categorical) */}
      <AssessmentSummary view={vm.assessment} />

      {/* 4 — current flow */}
      {vm.currentFlow ? (
        <Card radius="xl">
          <Section title="현재 흐름" body={vm.currentFlow} />
        </Card>
      ) : null}

      {/* 5 — core interpretation: the primary long-form answer, EXPANDED (§0) */}
      {vm.coreInterpretation ? (
        <Card radius="xl">
          <Section title="핵심 해석" body={vm.coreInterpretation} />
        </Card>
      ) : null}

      {/* 5b–5e — detailed long-form (강점/주의점/영역별/앞으로의 흐름): EXPANDED by default (§0).
          NEVER behind "더 자세히 보기" — this is the substance of the consultation. */}
      {hasDetailedLongForm ? (
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
      ) : null}

      {/* 6 — Explainability (evidence/methodology — the only optional/collapsible depth) */}
      <InterpretationEvidenceSheet grounding={vm.grounding} />

      {/* 7 — recommended follow-ups (helpers; composer stays external). They arise from a
          rich answer's new curiosity — never from withholding interpretation. */}
      {vm.followUps && onSelectFollowUp ? (
        <FollowUpSuggestions suggestions={vm.followUps} onSelect={onSelectFollowUp} />
      ) : null}

      {/* feedback (honest seam) */}
      <UserFeedbackControl onSubmit={onFeedback} />
    </Stack>
  );
}

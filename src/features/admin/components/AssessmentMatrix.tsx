import { ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { adminTheme } from '@/features/admin/adminTheme';
import {
  toAdminAssessmentRow,
  type LabelTone,
} from '@/features/intelligence';
import type { AssessmentItem } from '@/features/intelligence';

import { AdminBadge, type AdminBadgeTone } from './AdminBadge';

// Admin Assessment Matrix (Sprint 3A §5.3/§228). Columns AXIS · LEVEL · DIRECTION ·
// CONFIDENCE · AGREEMENT · TIMING · EVIDENCE. Level is a categorical badge (never a
// number). EVIDENCE shows ▲ supporting · ▼ counter SEPARATELY — never summed (§23).
// Renders the row ViewModel from toAdminAssessmentRow; computes no 역학 meaning.

const TONE_TO_BADGE: Record<LabelTone, AdminBadgeTone> = {
  strong: 'success',
  neutral: 'info',
  caution: 'warning',
  muted: 'neutral',
};

const COLS = ['AXIS', 'LEVEL', 'DIRECTION', 'CONFIDENCE', 'AGREEMENT', 'TIMING', 'EVIDENCE'];

export function AssessmentMatrix({ items }: { items: AssessmentItem[] }) {
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
          아직 생성된 Assessment가 없습니다. 엔진 연결 후 실제 상담에서 Assessment가 생성되면 이곳에 표시됩니다.
        </Text>
      </View>
    );
  }
  const rows = items.map(toAdminAssessmentRow);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={[styles.row, styles.header]}>
          {COLS.map((c) => (
            <Text key={c} variant="caption" style={[styles.cell, styles.headText]}>
              {c}
            </Text>
          ))}
        </View>
        {rows.map((r) => (
          <View key={r.axisKey} style={styles.row}>
            <View style={styles.cell}>
              <Text variant="bodySmall" style={styles.axis}>
                {r.axisLabel}
              </Text>
            </View>
            <View style={styles.cell}>
              <AdminBadge label={r.levelLabel} tone={TONE_TO_BADGE[r.tone]} />
            </View>
            <Cell text={r.directionLabel} />
            <Cell text={r.confidenceLabel} />
            <Cell text={r.agreementLabel} />
            <Cell text={r.timingLabel} />
            <View style={styles.cell}>
              <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
                {`▲ ${r.supportingCount} · ▼ ${r.counterCount}`}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Cell({ text }: { text: string }) {
  return (
    <View style={styles.cell}>
      <Text variant="bodySmall" style={{ color: adminTheme.ink }}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { padding: 16 },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: adminTheme.border,
    alignItems: 'center',
  },
  header: { backgroundColor: adminTheme.tableHeaderBg },
  headText: { color: adminTheme.inkMuted, fontWeight: '700' },
  cell: {
    width: 108,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  axis: { color: adminTheme.ink, fontWeight: '600' },
});

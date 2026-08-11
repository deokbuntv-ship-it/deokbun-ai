import { View } from 'react-native';

import { Text } from '@/components/Text';

import { adminTheme } from '../adminTheme';

// Dense admin status badge (Stitch): small, ~2px radius, low-opacity tint bg with
// solid tone text. For list/detail status reporting.
export type AdminBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const BG: Record<AdminBadgeTone, string> = {
  neutral: adminTheme.neutralBg,
  info: adminTheme.infoBg,
  success: adminTheme.successBg,
  warning: adminTheme.warningBg,
  danger: adminTheme.dangerBg,
};
const FG: Record<AdminBadgeTone, string> = {
  neutral: adminTheme.inkVariant,
  info: adminTheme.info,
  success: adminTheme.success,
  warning: adminTheme.warning,
  danger: adminTheme.danger,
};

export function AdminBadge({ label, tone = 'neutral' }: { label: string; tone?: AdminBadgeTone }) {
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: BG[tone], borderRadius: 2, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Text variant="caption" style={{ color: FG[tone], fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
}

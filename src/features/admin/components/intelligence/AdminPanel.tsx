import { View } from 'react-native';

import { Text } from '@/components/Text';
import type { LabelTone } from '@/features/intelligence';

import { adminTheme } from '../../adminTheme';
import type { AdminBadgeTone } from '../AdminBadge';

// Shared wrapper for the Consultation Intelligence inspector panels (§21). A titled
// surface with an optional right-aligned status node. Keeps every panel visually
// consistent with the rest of the admin console (surface + border, dense header).
export function AdminPanel({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: adminTheme.surface,
        borderWidth: 1,
        borderColor: adminTheme.border,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: adminTheme.border,
          backgroundColor: adminTheme.tableHeaderBg,
        }}
      >
        <View style={{ gap: 2 }}>
          <Text variant="bodyMedium" style={{ color: adminTheme.ink, fontWeight: '700' }}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" style={{ color: adminTheme.inkMuted }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ?? null}
      </View>
      <View style={{ padding: 16, gap: 10 }}>{children}</View>
    </View>
  );
}

// Honest empty/disconnected state used across the panels — never a fabricated row.
export function AdminPanelEmpty({ text }: { text: string }) {
  return (
    <Text variant="bodySmall" style={{ color: adminTheme.inkVariant }}>
      {text}
    </Text>
  );
}

export const TONE_TO_ADMIN_BADGE: Record<LabelTone, AdminBadgeTone> = {
  strong: 'success',
  neutral: 'info',
  caution: 'warning',
  muted: 'neutral',
};

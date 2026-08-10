import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { MaxContentWidth, Spacing } from '@/constants/theme';

const HAIRLINE = 'rgba(128,128,128,0.18)';

// Public site header — brand + primary nav + app CTA (§53). Wraps on mobile.
function PublicHeader() {
  return (
    <View style={styles.header}>
      <Link href="/content" asChild>
        <Pressable hitSlop={8}>
          <Text variant="headingMedium">덕분AI</Text>
        </Pressable>
      </Link>
      <View style={styles.headerNav}>
        <Link href="/content" asChild>
          <Pressable hitSlop={8}>
            <Text variant="bodyMedium" colorToken="textSecondary">
              콘텐츠
            </Text>
          </Pressable>
        </Link>
        <Link href="/famous" asChild>
          <Pressable hitSlop={8}>
            <Text variant="bodyMedium" colorToken="textSecondary">
              유명인
            </Text>
          </Pressable>
        </Link>
        <Link href="/" asChild>
          <Pressable hitSlop={8}>
            <Text variant="bodyMedium" colorToken="primary" style={{ fontWeight: '600' }}>
              앱 시작
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

// Minimal footer — real links only (no fabricated company/legal info, §54).
function PublicFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.headerNav}>
        <Link href="/content" asChild>
          <Pressable hitSlop={8}>
            <Text variant="caption" colorToken="textSecondary">
              콘텐츠
            </Text>
          </Pressable>
        </Link>
        <Link href="/famous" asChild>
          <Pressable hitSlop={8}>
            <Text variant="caption" colorToken="textSecondary">
              유명인
            </Text>
          </Pressable>
        </Link>
      </View>
      <Text variant="caption" colorToken="textSecondary">
        덕분AI — AI 라이프 인사이트 · 해석은 참고용이며 중요한 판단의 단독 근거가
        아닙니다.
      </Text>
    </View>
  );
}

// Centered, max-width scroll container for public (consumer-facing) pages,
// with a site header + footer so the public web reads as a content portal.
export function PublicScreen({ children }: { children: ReactNode }) {
  return (
    <Screen padded>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <PublicHeader />
          <View style={styles.body}>{children}</View>
          <PublicFooter />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: HAIRLINE,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  body: {
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
  },
  footer: {
    gap: Spacing.two,
    paddingTop: Spacing.four,
    borderTopWidth: 1,
    borderTopColor: HAIRLINE,
  },
});

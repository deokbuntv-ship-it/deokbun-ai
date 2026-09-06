import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { shareService, type ShareChannel, type ShareGrant } from '@/features/chat/report/shareService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// 보고서 공유 시트 (Commercial UX V4 §30–§41). Owner-only. Creates ONE share grant per open-session and
// reuses its token across channels (link / email / kakao) — the raw token lives only in memory + the URL,
// never persisted or logged. Recipients always land on the login-gated /shared-report route (§22). Kakao
// has no SDK yet (OWNER_ACTION) → interim: the OS share sheet on native, copy on web. Revocation is
// owner-only and immediate (§40/§41). Modeled on the app's PersonSelectorSheet Modal pattern.

// Copy the link (web clipboard) or hand it to the OS share sheet (native). Returns what happened so the
// UI can give truthful feedback. Never throws.
async function copyOrShareLink(url: string, message: string): Promise<'copied' | 'shared' | 'unsupported'> {
  try {
    const nav = (globalThis as unknown as { navigator?: { clipboard?: { writeText?: (t: string) => Promise<void> } } }).navigator;
    if (nav?.clipboard?.writeText) {
      await nav.clipboard.writeText(url);
      return 'copied';
    }
  } catch {
    // fall through to the native share sheet
  }
  try {
    if (Platform.OS !== 'web') {
      await Share.share({ message: `${message} ${url}` });
      return 'shared';
    }
  } catch {
    // user dismissed / unsupported
  }
  return 'unsupported';
}

export function ShareReportSheet({
  visible,
  onClose,
  reportId,
}: {
  visible: boolean;
  onClose: () => void;
  reportId: string;
}) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const [grant, setGrant] = useState<ShareGrant | null>(null);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmingRevoke, setConfirmingRevoke] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      // Reset per open — never carry a token across opens.
      setGrant(null);
      setNotice(null);
      setConfirmingRevoke(false);
      return;
    }
    let active = true;
    shareService.listActiveShares(reportId).then((s) => {
      if (active) setActiveCount(s.length);
    });
    return () => {
      active = false;
    };
  }, [visible, reportId]);

  // Create the grant on first use, then reuse it for every channel this session.
  const ensureGrant = async (channel: ShareChannel): Promise<ShareGrant | null> => {
    if (grant) return grant;
    setBusy(true);
    const g = await shareService.createShare(reportId, channel);
    setBusy(false);
    if (g) {
      setGrant(g);
      setActiveCount((c) => (c ?? 0) + 1);
      return g;
    }
    setNotice('공유 링크를 만들지 못했어요. 잠시 후 다시 시도해 주세요.');
    return null;
  };

  const onCopyLink = async () => {
    const g = await ensureGrant('link');
    if (!g) return;
    if (!g.url) {
      setNotice('공유 도메인이 설정되지 않아 링크를 만들 수 없어요.');
      return;
    }
    const result = await copyOrShareLink(g.url, '덕분이 상담 보고서를 공유했어요.');
    setNotice(
      result === 'copied'
        ? '공유 링크를 복사했어요.'
        : result === 'shared'
          ? '공유 시트를 열었어요.'
          : '이 기기에서는 링크 복사를 지원하지 않아요.',
    );
  };

  const onEmail = async () => {
    const g = await ensureGrant('email');
    if (!g?.url) {
      setNotice('공유 링크를 만들지 못했어요.');
      return;
    }
    const subject = encodeURIComponent('덕분이 상담 보고서');
    // Body carries an invitation + the link ONLY — never the report content (§33).
    const body = encodeURIComponent(
      `덕분이 상담 보고서를 공유했어요.\n로그인 후 확인할 수 있습니다.\n\n${g.url}`,
    );
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`).catch(() =>
      setNotice('메일 앱을 열 수 없어요.'),
    );
  };

  const onKakao = async () => {
    const g = await ensureGrant('kakao');
    if (!g?.url) {
      setNotice('공유 링크를 만들지 못했어요.');
      return;
    }
    // No Kakao SDK yet (OWNER_ACTION). Interim: OS share sheet (native) / copy (web).
    const result = await copyOrShareLink(g.url, '덕분이 상담 보고서를 공유했어요.');
    setNotice(
      result === 'shared'
        ? '공유 시트에서 카카오톡을 선택해 주세요.'
        : result === 'copied'
          ? '링크를 복사했어요. 카카오톡에 붙여넣어 공유해 주세요.'
          : '카카오톡 공유는 준비 중이에요.',
    );
  };

  const onRevoke = async () => {
    setBusy(true);
    const shares = await shareService.listActiveShares(reportId);
    let ok = true;
    for (const s of shares) {
      ok = (await shareService.revokeShare(s.id)) && ok;
    }
    setBusy(false);
    setGrant(null);
    setActiveCount(0);
    setConfirmingRevoke(false);
    setNotice(ok ? '공유를 취소했어요. 이전 링크는 더 이상 열리지 않아요.' : '일부 공유를 취소하지 못했어요.');
  };

  const hasActive = (activeCount ?? 0) > 0 || grant !== null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="닫기" />
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, paddingBottom: insets.bottom + spacing.lg },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <Stack gap="lg">
            <Stack gap="xs">
              <Text variant="headingMedium" style={styles.bold}>
                보고서 공유
              </Text>
              <Text variant="bodySmall" colorToken="textSecondary">
                공유받은 분도 로그인 후 읽기 전용으로 볼 수 있어요.
              </Text>
            </Stack>

            <Stack gap="sm">
              <Button label="링크 복사" radius="lg" onPress={onCopyLink} disabled={busy} />
              <Button label="이메일로 공유" variant="secondary" radius="lg" onPress={onEmail} disabled={busy} />
              <Button label="카카오톡으로 공유" variant="secondary" radius="lg" onPress={onKakao} disabled={busy} />
            </Stack>

            {hasActive ? (
              <Stack gap="sm">
                <Text variant="bodySmall" colorToken="textSecondary">
                  이 보고서의 공유 링크가 활성화되어 있어요.
                </Text>
                {confirmingRevoke ? (
                  <Stack direction="row" gap="sm">
                    <View style={styles.flex1}>
                      <Button label="공유 취소하기" variant="danger" radius="lg" onPress={onRevoke} disabled={busy} />
                    </View>
                    <View style={styles.flex1}>
                      <Button
                        label="유지"
                        variant="tertiary"
                        radius="lg"
                        onPress={() => setConfirmingRevoke(false)}
                        disabled={busy}
                      />
                    </View>
                  </Stack>
                ) : (
                  <Button
                    label="공유 취소"
                    variant="tertiary"
                    radius="lg"
                    onPress={() => setConfirmingRevoke(true)}
                    disabled={busy}
                  />
                )}
              </Stack>
            ) : null}

            {notice ? (
              <Text variant="bodySmall" colorToken="textSecondary">
                {notice}
              </Text>
            ) : null}
          </Stack>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: '80%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  bold: {
    fontWeight: '700',
  },
  flex1: {
    flex: 1,
  },
});

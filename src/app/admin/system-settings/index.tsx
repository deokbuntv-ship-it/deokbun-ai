import { useCallback, useEffect, useState } from 'react';
import { Switch, View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminPageHeader } from '@/features/admin';
import { adminTheme } from '@/features/admin/adminTheme';
import {
  fetchGlobalGenerationGuard,
  setGlobalGenerationEnabled,
  type GlobalGenerationGuard,
} from '@/features/admin/services/globalGenerationGuardService';

// ADMIN_10_SYSTEM_SETTINGS (Stitch final_lock_8). Platform-wide settings. No
// settings-persistence API is connected, so toggles reflect LOCAL UI state only
// and a banner makes clear that changes are NOT saved — nothing is faked as
// persisted, and "변경사항 저장" shows a truthful not-connected note (§22/§27).

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: adminTheme.surface,
        borderWidth: 1,
        borderColor: adminTheme.border,
        borderRadius: 8,
        padding: 20,
        gap: 16,
        flex: 1,
        minWidth: 320,
      }}
    >
      <Text variant="headingMedium" style={{ color: adminTheme.ink }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function ToggleRow({ label, hint }: { label: string; hint?: string }) {
  const [on, setOn] = useState(false);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>
          {label}
        </Text>
        {hint ? (
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch value={on} onValueChange={setOn} trackColor={{ true: adminTheme.navy }} />
    </View>
  );
}

function SelectRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>
        {label}
      </Text>
      {hint ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
          {hint}
        </Text>
      ) : null}
      <View
        style={{
          borderWidth: 1,
          borderColor: adminTheme.border,
          borderRadius: 4,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: adminTheme.pageBg,
        }}
      >
        <Text variant="bodyMedium" style={{ color: adminTheme.inkVariant }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function InfoRow({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>{label}</Text>
      <Text variant="bodyMedium" style={{ color: tone ?? adminTheme.inkVariant, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

// REAL global generation guard (Sprint D §D8) — reads backend truth + the kill switch. Fail-clean: on any
// error / no admin access it shows a "연동 필요" note instead of faking state (제3조). Limits are read-only
// here (100/hour · 1000/day technical defaults pending owner approval).
function GenerationGuardCard() {
  const [guard, setGuard] = useState<GlobalGenerationGuard | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const g = await fetchGlobalGenerationGuard();
    setGuard(g);
    setLoaded(true);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const onToggle = useCallback(
    async (next: boolean) => {
      if (!guard || saving) return;
      setSaving(true);
      const ok = await setGlobalGenerationEnabled(next, guard.hourlyLimit, guard.dailyLimit);
      if (ok) await load();
      setSaving(false);
    },
    [guard, saving, load],
  );

  const warnTone =
    guard?.warningLevel === 'CRITICAL_95' ? adminTheme.warning : guard?.warningLevel === 'WARNING_80' ? adminTheme.warning : adminTheme.inkVariant;

  return (
    <Card title="생성 제어 (전역 비용 가드)">
      {!loaded ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>불러오는 중…</Text>
      ) : guard === null ? (
        <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
          연동 필요 — 관리자 권한이 있고 마이그레이션이 적용된 뒤 전역 생성 상태가 표시됩니다.
        </Text>
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>LLM 생성 사용</Text>
              <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
                끄면 새 유료 생성이 즉시 중단됩니다(캐시·기존 답변은 계속 제공).
              </Text>
            </View>
            <Switch value={guard.generationEnabled} disabled={saving} onValueChange={onToggle} trackColor={{ true: adminTheme.navy }} />
          </View>
          <InfoRow label="시간당 사용/한도" value={`${guard.hourlyUsed} / ${guard.hourlyLimit}`} />
          <InfoRow label="일일 사용/한도" value={`${guard.dailyUsed} / ${guard.dailyLimit}`} />
          <InfoRow label="사용률 · 경고 단계" value={`${guard.utilizationPercent}% · ${guard.warningLevel}`} tone={warnTone} />
        </>
      )}
    </Card>
  );
}

export default function AdminSystemSettingsScreen() {
  return (
    <Stack gap="xl">
      <Stack direction="row" align="center" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <AdminPageHeader title="시스템 설정" subtitle="덕분AI 플랫폼의 전역 설정을 관리합니다." />
        <View style={{ backgroundColor: adminTheme.neutralBg, borderRadius: 4, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted, fontWeight: '600' }}>
            변경사항 저장 (API 미연결)
          </Text>
        </View>
      </Stack>

      <View style={{ backgroundColor: adminTheme.warningBg, borderWidth: 1, borderColor: adminTheme.border, borderRadius: 8, padding: 16 }}>
        <Text variant="bodySmall" style={{ color: adminTheme.warning }}>
          이 화면의 설정은 아직 백엔드 설정 API에 연결되지 않았습니다. 변경은
          저장되지 않으며, 실제 반영은 연동 후 가능합니다.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <Stack gap="lg" style={{ flex: 2, minWidth: 380 }}>
          <Card title="AI 설정">
            <SelectRow label="기본 해석 모델" hint="운세 해석에 주로 사용될 대규모 언어 모델" value="연동 후 선택 가능" />
            <SelectRow label="보조 필터링 모델" hint="부적절한 내용 필터링 및 응답 검수" value="연동 후 선택 가능" />
            <ToggleRow label="동적 모델 스위칭 (Fall-back)" hint="기본 모델 장애 시 자동으로 보조 모델로 전환" />
          </Card>
          <Card title="운세우편 설정">
            <SelectRow label="일일 운세 자동 발송 시점" value="연동 후 설정 가능 (KST 기준)" />
            <SelectRow label="재발송 대기 시간 (실패 시)" value="연동 후 설정 가능" />
            <ToggleRow label="주말 자동 발송 활성화" />
            <ToggleRow label="발송 실패 관리자 알림" />
          </Card>
        </Stack>

        <Stack gap="lg" style={{ flex: 1, minWidth: 280 }}>
          <GenerationGuardCard />
          <Card title="관리자 설정">
            <ToggleRow label="2단계 인증 (2FA) 강제" />
            <ToggleRow label="관리자 활동 로그 기록" />
            <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
              API 키 관리는 별도 보안 콘솔에서 처리됩니다.
            </Text>
          </Card>
          <Card title="알림 설정">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>
                Slack (Dev 채널)
              </Text>
              <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
                미연결
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>
                SMS (긴급 장애)
              </Text>
              <Text variant="bodySmall" style={{ color: adminTheme.inkMuted }}>
                미연결
              </Text>
            </View>
          </Card>
        </Stack>
      </View>
    </Stack>
  );
}

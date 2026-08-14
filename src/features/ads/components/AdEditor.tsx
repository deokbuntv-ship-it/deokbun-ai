import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminSelect } from '@/features/admin';
import {
  AD_STATUS_OPTIONS,
  AD_TYPE_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  isValidAdCheckUrl,
  type AdInput,
  type Advertisement,
} from '@/features/ads';

// Advertisement editor (§5). Self-contained form (Input + AdminSelect + local useState),
// inline validation → localError. Mirrors the Famous/Content editor convention. No sample
// publisher is hardcoded (§5/§37). 광고 확인 링크 (posted content) is validated + kept
// DISTINCT from the tracking URL (§39) — the tracking URL is assigned on 발행, not here.
export function AdEditor({
  initial,
  submitting,
  errorMessage,
  onSubmit,
  onCancel,
}: {
  initial: Advertisement | null;
  submitting: boolean;
  errorMessage: string | null;
  onSubmit: (input: AdInput) => void;
  onCancel?: () => void;
}) {
  const [adType, setAdType] = useState<AdInput['adType']>(initial?.adType ?? 'youtube_shorts');
  const [publisher, setPublisher] = useState(initial?.publisherNickname ?? '');
  const [adCheckUrl, setAdCheckUrl] = useState(initial?.adCheckUrl ?? '');
  const [startDate, setStartDate] = useState(initial?.startDate ?? '');
  const [contractType, setContractType] = useState<AdInput['contractType']>(
    initial?.contractType ?? 'experience_group',
  );
  const [cost, setCost] = useState(initial?.costKrw != null ? String(initial.costKrw) : '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [status, setStatus] = useState<AdInput['status']>(initial?.status ?? 'draft');
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = () => {
    const nick = publisher.trim();
    if (nick.length === 0) {
      setLocalError('닉네임/채널명을 입력해 주세요.');
      return;
    }
    const url = adCheckUrl.trim();
    if (!isValidAdCheckUrl(url)) {
      setLocalError('광고 확인 링크는 http(s):// 로 시작하는 올바른 URL이어야 합니다.');
      return;
    }
    let costKrw: number | null = null;
    if (cost.trim().length > 0) {
      const parsed = Number(cost.replace(/[,\s]/g, ''));
      if (!Number.isFinite(parsed) || parsed < 0) {
        setLocalError('광고비는 0 이상의 숫자만 입력할 수 있어요. (미입력 가능)');
        return;
      }
      costKrw = Math.round(parsed);
    }
    setLocalError(null);
    onSubmit({
      adType,
      publisherNickname: nick,
      adCheckUrl: url.length > 0 ? url : null,
      startDate: startDate.trim().length > 0 ? startDate.trim() : null,
      contractType,
      costKrw,
      notes: notes.trim().length > 0 ? notes.trim() : null,
      status,
    });
  };

  return (
    <Stack gap="lg">
      <AdminSelect label="광고 형태" options={AD_TYPE_OPTIONS} value={adType} onChange={setAdType} />
      <Input
        label="닉네임 / 채널명"
        required
        value={publisher}
        onChangeText={setPublisher}
        placeholder="예: 덕분TV"
      />
      <Input
        label="광고 확인 링크 (게시된 콘텐츠 URL)"
        value={adCheckUrl}
        onChangeText={setAdCheckUrl}
        placeholder="https://youtube.com/... (게시 후 입력 가능)"
        autoCapitalize="none"
        helperText="유입 추적 URL과 다른, 실제 게시된 광고 콘텐츠 주소입니다."
      />
      <Input
        label="광고 시작일"
        value={startDate}
        onChangeText={setStartDate}
        placeholder="2026-08-14"
        autoCapitalize="none"
      />
      <AdminSelect
        label="계약 형태"
        options={CONTRACT_TYPE_OPTIONS}
        value={contractType}
        onChange={setContractType}
      />
      <Input
        label="광고비 (원, 미입력 가능)"
        value={cost}
        onChangeText={setCost}
        placeholder="예: 300000"
        keyboardType="numeric"
      />
      <Input
        label="메모"
        value={notes}
        onChangeText={setNotes}
        placeholder="자유 입력"
        multiline
        inputStyle={{ minHeight: 88 }}
      />
      <AdminSelect label="상태" options={AD_STATUS_OPTIONS} value={status} onChange={setStatus} />

      {localError ?? errorMessage ? (
        <Text variant="bodySmall" colorToken="danger">
          {localError ?? errorMessage}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button label={submitting ? '저장 중...' : '저장'} onPress={submit} disabled={submitting} />
        {onCancel ? <Button label="취소" variant="tertiary" onPress={onCancel} disabled={submitting} /> : null}
      </View>
    </Stack>
  );
}

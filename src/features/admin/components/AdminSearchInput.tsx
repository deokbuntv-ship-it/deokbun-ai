import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Stack } from '@/components/Stack';

// Thin search control: an input + explicit "검색" button (submit on enter too).
// Reuses the shared Input primitive; no new styling system.
export function AdminSearchInput({
  value,
  onChangeText,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}) {
  return (
    <Stack direction="row" gap="sm" align="flex-end">
      <Input
        // 보이는 라벨이 없는 검색칸이다 — `Input` 의 label 폴백이 undefined 라 접근 이름이
        // 비어 있었다(2026-09-06). placeholder 를 이름으로 준다. 시각 변화 없음.
        accessibilityLabel={placeholder ?? '검색'}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? '검색'}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        style={{ flex: 1 }}
      />
      <Button label="검색" variant="secondary" onPress={onSubmit} />
    </Stack>
  );
}

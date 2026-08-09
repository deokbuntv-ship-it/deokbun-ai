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

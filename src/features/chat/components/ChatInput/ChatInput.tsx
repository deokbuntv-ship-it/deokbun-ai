import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Stack } from '@/components/Stack';

type ChatInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function ChatInput({ value, onChangeText, onSend, disabled }: ChatInputProps) {
  return (
    <View style={styles.inputArea}>
      <Stack direction="row" gap="sm" align="flex-end">
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder="메시지를 입력해 주세요"
          multiline
          accessibilityLabel="메시지 입력창"
          style={styles.inputWrapper}
          inputStyle={styles.inputField}
        />
        <Button
          label="전송"
          disabled={disabled}
          onPress={onSend}
          accessibilityLabel="메시지 전송"
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  inputArea: {
    width: '100%',
  },
  inputWrapper: {
    flex: 1,
  },
  inputField: {
    minHeight: 44,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
});

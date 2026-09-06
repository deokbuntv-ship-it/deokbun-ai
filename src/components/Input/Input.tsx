
import { useState } from 'react';
import {
    TextInput,
    View,
    type StyleProp,
    type TextInputProps,
    type TextStyle,
    type ViewStyle,
} from 'react-native';

import { Text } from '@/components/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, radius, spacing } from '@/theme';

// DESIGN_FREEZE_FINAL C18 — H52, R14, 15px. The label ALWAYS sits on its own line above the field;
// a placeholder is never used as the label (it disappears exactly when the user needs it). focus =
// 1.5px ink, error = 1.5px state.error + a 12.5px message underneath, disabled = sunken surface.
type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};


export function Input({
	label,
	error,
	helperText,
	required,
	disabled,
	style,
	inputStyle,
	onFocus,
	onBlur,
	...rest
}: InputProps) {
	const scheme = useColorScheme();
	const theme = scheme === 'dark' ? colors.dark : colors.light;
	const [isFocused, setIsFocused] = useState(false);

	const hasError = Boolean(error);

	const borderColor = hasError
		? theme.danger
		: isFocused
			? theme.brandPrimary
			: theme.border;

	return (
		<View style={style}>
			{label ? (
				<View style={{ flexDirection: 'row', marginBottom: spacing.xs }}>
					<Text variant="bodySmall" style={{ fontWeight: '600' }}>{label}</Text>
					{required ? (
						<Text variant="bodySmall" colorToken="danger">
							{' '}
							*
						</Text>
					) : null}
				</View>
			) : null}

			<TextInput
				editable={!disabled}
				placeholderTextColor={theme.textMuted}
				onFocus={(event) => {
					setIsFocused(true);
					onFocus?.(event);
				}}
				onBlur={(event) => {
					setIsFocused(false);
					onBlur?.(event);
				}}
				style={[
					{
						borderWidth: isFocused || hasError ? 1.5 : 1,
						borderColor,
						borderRadius: radius.md,
						paddingVertical: spacing.md,
						paddingHorizontal: spacing.lg,
						minHeight: 52,
						fontSize: 15,
						lineHeight: 22,
						// Disabled is a SURFACE change, not opacity — an opacity wrapper would drag the
						// value text below AA and make a read-only field unreadable (freeze §Acceptance).
						backgroundColor: disabled ? theme.backgroundElevated : theme.surface,
						color: disabled ? theme.textSecondary : theme.textPrimary,
					},
					inputStyle,
				]}
				{...rest}
				// ⚠ 2026-09-06 — 보이는 `label` 은 위에서 별도 <Text> 로 그려질 뿐 입력칸과 **프로그램적으로
				// 연결돼 있지 않았다.** `accessibilityLabel` 을 따로 넘긴 곳(문의 내용 등)만 접근 가능한
				// 이름을 가졌고, `label` 만 준 곳(연도·월·일·시·분·태어난 곳·이름)은 스크린리더에 이름 없는
				// 입력칸으로 읽혔다 — 온보딩 출생정보 폼이 전부 여기 해당한다. 명시적으로 넘긴 값이
				// 우선하고, 없을 때만 보이는 라벨로 채운다. 시각적 변화는 없다.
				accessibilityLabel={rest.accessibilityLabel ?? label}
			/>

			{error ? (
				<Text
					variant="bodySmall"
					colorToken="danger"
					style={{ marginTop: spacing.xs, fontSize: 12.5 }}
				>
					{error}
				</Text>
			) : helperText ? (
				<Text
					variant="bodySmall"
					colorToken="textSecondary"
					style={{ marginTop: spacing.xs, fontSize: 12.5 }}
				>
					{helperText}
				</Text>
			) : null}
		</View>
	);
}

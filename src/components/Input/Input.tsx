
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

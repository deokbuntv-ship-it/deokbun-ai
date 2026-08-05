
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
			? theme.primary
			: theme.border;

	return (
		<View style={style}>
			{label ? (
				<View style={{ flexDirection: 'row', marginBottom: spacing.xs }}>
					<Text variant="bodySmall">{label}</Text>
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
				placeholderTextColor={theme.textSecondary}
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
						borderWidth: isFocused || hasError ? 2 : 1,
						borderColor,
						borderRadius: radius.md,
						paddingVertical: spacing.sm,
						paddingHorizontal: spacing.md,
						backgroundColor: theme.surface,
						color: theme.textPrimary,
						opacity: disabled ? 0.5 : 1,
					},
					inputStyle,
				]}
				{...rest}
			/>

			{error ? (
				<Text
					variant="bodySmall"
					colorToken="danger"
					style={{ marginTop: spacing.xs }}
				>
					{error}
				</Text>
			) : helperText ? (
				<Text
					variant="bodySmall"
					colorToken="textSecondary"
					style={{ marginTop: spacing.xs }}
				>
					{helperText}
				</Text>
			) : null}
		</View>
	);
}

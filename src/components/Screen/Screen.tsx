import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, spacing } from '@/theme';

type ScreenProps = ViewProps & {
  children: React.ReactNode;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, padded = true, style, ...rest }: ScreenProps) {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.background,
          paddingHorizontal: padded ? spacing.screenHorizontal : 0,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

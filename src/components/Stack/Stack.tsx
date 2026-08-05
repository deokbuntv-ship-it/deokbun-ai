import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { spacing, type SpacingToken } from '@/theme';

type StackProps = ViewProps & {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  gap?: SpacingToken;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  style?: StyleProp<ViewStyle>;
};

export function Stack({
  children,
  direction = 'column',
  gap = 'md',
  align,
  justify,
  style,
  ...rest
}: StackProps) {
  return (
    <View
      style={[
        {
          flexDirection: direction,
          gap: spacing[gap],
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
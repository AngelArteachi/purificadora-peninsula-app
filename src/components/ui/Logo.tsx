import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { fonts, useTheme } from '@/theme';

/** Drop-shaped brand mark: a single solid shape, like a real app icon glyph. */
export function DropMark({ size = 40, color }: { size?: number; color?: string }) {
  const t = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        d="M24 3.5C24 3.5 41.5 21.4 41.5 30.2C41.5 39.6 33.7 44.5 24 44.5C14.3 44.5 6.5 39.6 6.5 30.2C6.5 21.4 24 3.5 24 3.5Z"
        fill={color ?? t.primary}
      />
      <Path
        d="M17.6 31.4C17.6 35.6 20.4 38.4 24.3 38.9"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

/** Drop + "hidra" wordmark. */
export function Logo({ size = 32, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}>
      <DropMark size={size} />
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize: size * 0.72,
          letterSpacing: -0.4,
          color: t.text,
        }}
      >
        hidra
      </Text>
    </View>
  );
}

import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { WaterBackground } from '@/components/ui/WaterBackground';
import { useTheme } from '@/theme';

type ScreenProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: readonly Edge[];
  /** `water` draws the animated brand canvas; `plain` is a flat page color. */
  background?: 'water' | 'plain';
};

/** Standard page wrapper: themed canvas and safe areas. */
export function Screen({ children, style, edges = ['top', 'bottom'], background = 'water' }: ScreenProps) {
  const t = useTheme();
  return (
    <View style={[{ flex: 1, backgroundColor: t.background }, style]}>
      {background === 'water' ? <WaterBackground /> : null}
      <SafeAreaView edges={edges} style={{ flex: 1 }}>
        {children}
      </SafeAreaView>
    </View>
  );
}
